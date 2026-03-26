---
weight: 125
slug: redis-redisson
title: Redisson
---

[Redisson](https://redisson.pro/docs/) 是一个在 Redis 的基础上实现的 java 驻内存数据网格 (In-Memory Data Grid)。它不仅提供了一系列的分布式的 java 常用对象，还提供了许多分布式服务，其中就包含了各种分布式锁的实现。

引入：

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>3.13.6</version>
</dependency>
```

```java
@Configuration
public class RedisConfig {
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
                .setAddress("redis://localhost:6379")
                .setPassword("ur-passwd");
        return Redisson.create(config);
    }
}
```

使用：

```java
@Resource
private RedissonClient redissonClient;

RLock lock = redissonClient.getLock(getLockKey(userId));
boolean locked = lock.tryLock();
if (!locked) {
    return Result.fail(oneForEachMsg);
}
try {
    /* 创建订单 */
} finally {
    lock.unlock();
}
```

`tryLock(waitTime, leaseTime, timeUnit)` 的 `waitTime` 是拿不到锁时等待获取锁的时间，默认是 `0` 不等待直接返回失败；`leaseTime` 是释放锁的时间，也就是 Redis 的 TTL，默认是 `-1`，但内部是用的看门狗机制，每 `10s` 更新 TTL 为 `30s`（业务执行时永不过期，宕机时看门狗失效不再续期，很快过期，避免死锁）；`timeUnit` 是两个时间值的单位。

## Redisson 可重入锁

可重入锁就是同一个线程对同一个锁能够锁了又锁，通常用于锁住两段不同的同步代码。不可重入锁的线程第二次尝试获取同一个锁的时候，如果是阻塞式的锁处理策略，会导致自己锁住自己的死锁。在 Java 中，`synchronized` 和 `ReentrantLock` 都是可重入锁。

一般，可重入锁都会记录每个线程重入的次数。但是这样原本 `String` 类型的 `value` 就不够存了，因为它既要存线程 id，又要存重入次数，所以要使用 `Hash` 类型。

那么，之前不可重入锁的逻辑就要改成：获取锁时，如果“有锁”且“锁是我的”，则把重入次数加 1；释放锁时，如果“锁还在”、“锁是我的”且“锁的重入次数大于 0”，则把重入次数减 1；如果减为 0 了，则把锁删了；如果没有减为 0，则重置一下锁的有效期，让后面的业务有时间跑。

用 lua 脚本实现获取和释放可重入分布式锁：

```lua
--- lua 脚本实现获取可重入锁
local key = KEYS[1]
local threadId = ARGV[1]
local releaseTime = ARGV[2]

local exists = redis.call('exists', key)
-- 没有锁
if (exists == 0) then
    redis.call('hset', key, threadId, 1)
    redis.call('expire', key, releaseTime)
    return 1
end
local isMine = redis.call('hexists', key, threadId)
-- 有锁，锁是我的
if (isMine) then
    redis.call('hincrby', key, threadId, 1)
    redis.call('expire', key, releaseTime)
    return 1
end
-- 有锁，但不是我的
return 0
```

```lua
--- lua 脚本实现释放可重入锁
local key = KEYS[1]
local threadId = ARGV[1]
local releaseTime = ARGV[2]

local isMine = redis.call('hexists', key, threadId)
-- 锁不是我的
if (isMine == 0) then
    return nil
end
-- 锁是我的
local state = redis.call('hincrby', key, threadId, -1)
-- 锁是我的，重入次数减不为 0
if (state > 0) then
    redis.call('expire', key, releaseTime)
    return nil
end
-- 锁是我的，重入次数减为 0
redis.call('del', key)
return nil
```

Redisson 实现可重入锁的原理与上面的 lua 脚本如出一辙。

## Redisson 可重试锁

Redisson 获取锁的 lua 脚本比较反常，成功了返回 `null`，失败了返回锁剩余有效期 `ttl` 的毫秒值，这种设计是为了实现可重试锁。所以，之后的逻辑看到 lua 脚本返回的 `ttl` 为 `null`，就知道上锁成功；看到 `ttl` 不为 `null`，则说明上锁失败。

> [!note] 锁有 `ttl` 意味着什么？
>
> 这里，锁有 `ttl` 意味着锁在其他人手上。Redisson 获取锁的 lua 脚本包含可重入的逻辑，所以获取失败返回的一定是别人锁的 `ttl`。

![Redisson 可重试锁](https://img.xicuodev.top/2026/03/37c0b1309b3a4b7d648c630975b55b5c.png "Redisson 可重试锁")

### 上锁成功时的看门狗机制

上锁成功后，Redisson 会先看 `leaseTime` 参数是不是默认值 `-1`，如果是，就开启 `watchDog` 看门狗，它会每 10 秒更新一次 `ttl` 为 30 秒，从而保证业务执行时 `ttl` 不归零。如果业务执行期间宕机了，看门狗也就跟着一起失效了，30 秒的 `ttl` 也能保证锁很快就释放了，不会导致死锁。

- 如果在加锁时显式设置了 `leaseTime`，看门狗就失效了。

### 上锁失败时的重试机制

上锁失败了，就会进入重试逻辑。Redisson 的重试机制伴随着许多次“耐心检查”：如果 `waitTime` 用尽了，不能再等了，就返回失败，否则再做进一步动作。

上锁失败了，Redisson 会先做第一次耐心检查，再花费所有剩余耐心订阅并等待别人释放锁的信号，如果收到释放信号，那么做第二次耐心检查，最后终于尝试上锁。但这只是尝试上锁，如果这次还是失败，说明锁释放后又马上被抢走了，那么就再做一次上述的重试逻辑。

这里又有一个细节：进入循环后，我会把我的剩余耐心跟锁的 `ttl` 比一下，哪个更短就在订阅时等哪个时间，这是为了在持锁实例宕机时尽快拿到锁，是看门狗兜底机制实现的一部分。具体可以看下面的标注块。

> [!tip] 为什么进入循环后要引入 TTL 作为重试频率？
>
> 如果持锁实例宕机了，那么由于看门狗的兜底机制，这个 TTL 就是最后一轮 TTL，之后锁就被 Redis 自动释放了。进入循环后，我担心信号可能迟到或丢失，所以我不仅要等待订阅，还要每个 TTL 都要去看一眼。每次循环我都会重新获取一次当前 TTL。也就是说，在等待订阅的同时，我还会踩准每次的 TTL 主动尝试上一次锁。我每个 TTL 都重试一次，就是考虑到即使持锁实例宕机了发不出信号，我也能尽快拿到锁。当然，也不能忘记我的剩余耐心，所以每次重试还要把它和当前 TTL 取个最小值，在我耐心耗尽时尽快放弃。

## Redisson 联锁

### 主从一致性问题

Redis 集群的主从模式是把多个 Redis 实例分为主节点和从节点，平时主节点响应外部请求，并持续异步地把数据备份到从节点，主节点宕机时，哨兵能够发现，并在从节点中根据多个指标选出一个作为新的主节点。

主从模式的 Redis 集群存在主从一致性问题，如果主节点上的数据还没来得及同步到从节点，主节点就宕机了，那么这部分数据就永久丢失了，主从节点的数据就不一致了。

### 联锁解决主从一致性问题

联锁 (multi-lock) 是主从一致性问题的解决办法之一。选取多个 Redis 节点，每个节点都获取独立的锁。所有 Redis 节点必须都获取锁才算获取成功，相当于把每个节点都当作主节点，然后可以给每一节点再都配一个从节点，如果一个节点宕机，那么从节点顶上来。即使这个从节点没有同步到锁也没关系，只要有一个带锁的节点还活着，那么直到当前线程把锁全删掉，其他线程才能在每个节点都获取锁，不可能出现锁失效的问题。

Redisson 获取联锁：

```java
RLock lock1 = redissonClient.getLock(lockKey);
RLock lock2 = redissonClient2.getLock(lockKey);
RLock lock3 = redissonClient3.getLock(lockKey);
lock = redissonClient.getMultiLock(lock1, lock2, lock3);
```

你用哪个 `redissonClient` 调都行，底层都是新建一个 `RedissonMultiLock` 联锁对象，里面包含 `List<RLock>` 集合，每次遍历这个集合获取锁，都成功才行。这事儿谁办都一样，无非是谁来办这事儿的问题。

`RedissonMultiLock` 和 `RedissonLock` 一样都实现了 `RLock`，联锁对 `tryLock()` 方法的实现细节是：

- 如果传了 `leaseTime` 但没传 `waitTime`，用原本传入的 `leaseTime`；两个都传了，用 `waitTime * 2L` 作为新的 `leaseTime`，放弃原本传入的 `leaseTime`。

分析：若没传 `waitTime` 则无需等待，失败直接返回，而上锁本身是不耗时的，所以用原本的租约时间即可；若传了 `waitTime` 则需要等待，失败需要重试，等待重试的时间是大头，而锁是一个一个地串行添加的，可能导致“后面的锁还没加完，前面的锁已经过期释放”的情况。将 `waitTime` 翻倍作为 `leaseTime`，是为了确保在最极端的等待情况下，已经成功拿到的子锁依然具有足够的有效期，支撑到最后一个锁加锁完成。

- 拿到 `locks.listIterator()` 迭代器，遍历获取锁，每拿到一个就放到 `acquiredLocks` 集合中。
- 通过看 `locks.size() - acquiredLocks.size()` 是否为 `failedLocksLimit()` 的 0 检查是否全部拿到。如果没有，重置 `acquiredLocks` 和迭代器。

> todo: `RedissonMultiLock` `tryLock()` 源码有个 `--failedLocksLimit;` 是什么意思？

- 拿完了锁，由于是先后拿取的，大家的有效期都不一样，所以如果你设置 `leaseTime`，那么 Redisson 最后还要再遍历一次 `acquiredLocks` 重置大家的有效期。但如果你没设置 `leaseTime`，那么因为有看门狗机制，最后就不必重置有效期了。

## Redis 和 Redisson 三种锁总结

1）不可重入 Redis 分布式锁：

- 原理：利用 SETNX 的互斥性；利用 EX 避免死锁；释放锁时判断线程标识
- 缺陷：不可重入、无法重试、锁超时失效

2）可重入可重试的 Redisson 分布式锁：

- 原理：利用 Hash 类型，记录线程标识和重入次数；利用看门狗续约锁的时间；利用信号量控制锁重试等待
- 缺陷：Redis 宕机引起锁失效问题

3）Redisson 联锁:

- 原理：多个独立的 Redis 节点，必须在所有节点都获取重入锁，才算获取锁成功
- 缺陷：运维成本高、实现复杂
