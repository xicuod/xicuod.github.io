---
weight: 123
slug: redis-distributed-lock
title: Redis 分布式锁
---

## 集群模式下的并发安全问题

集群模式下，nginx 通过反向代理和负载均衡把前端的请求转发给不同的后端服务实例。要配置这个模式，修改 `nginx.conf`：

```conf
http {
    server {
        location /api/ {
            proxy_pass http://backend; #反向代理
        }
    }

    upstream backend { #负载均衡
        server 127.0.0.1:8081 max_fails=5 fail_timeout=10s weight=1;
        server 127.0.0.1:8082 max_fails=5 fail_timeout=10s weight=1;
    }
}
```

然而，集群模式下的悲观锁不在同一个 JVM 实例中，锁不住。具体来说，线程通过锁监视器判断是否有锁，而每个 JVM 用的都是自己独立的锁监视器，因此每个 JVM 都会有一个线程畅通无阻，这就又导致了并发安全问题。

## 分布式锁

要解决集群模式下的并发安全问题，需要用到跨进程的分布式锁。要有一个能让每个 JVM 都能看到的锁监视器，这点 MySQL、Redis 和 Zookeeper 都能做到。

> [!note] 分布式锁
>
> 分布式锁就是满足分布式系统或集群模式下多进程可见并且互斥的锁。一个基本的分布式锁需要满足多进程可见、互斥、高可用、高性能和安全性的要求。

| 分布式锁 | MySQL                  | Redis              | Zookeeper                  |
| :------: | ---------------------- | ------------------ | -------------------------- |
|   互斥   | MySQL 本身的互斥锁机制 | `SETNX` 互斥命令   | 节点的唯一性和有序性       |
|  高可用  | 好，支持主从           | 好，支持主从和集群 | 好，支持集群               |
|  高性能  | 一般                   | 好                 | 一般，要求强一致性         |
|  安全性  | 断开连接自动释放       | TTL 超时释放机制   | 临时节点，断开连接自动释放 |

## Redis 实现分布式锁

- 获取锁：`SET lock thread1 NX EX 10`（要保证原子性，不能拆成 `SETNX` 和 `EXPIRE` 作两步走）
- 释放锁：`DEL lock` 或超时释放

> [!tip] 互斥锁的三种实现方式
> 
> 互斥锁有三种实现方式，一种是阻塞式的，拿不到锁就睡眠等待；一种是自旋式的，拿不到锁就繁忙等待；一种是非阻塞式的（尝试锁），拿不到锁就直接返回失败。为实现简单、节省 CPU 资源，本例采用非阻塞式，即如果拿不到锁，直接返回失败。

### Redis 分布式锁的误删问题

上述的这种锁一般情况下都能正常工作，但是在某些极端情况下就有问题了。如果线程 1 拿到了锁，但它的业务因故阻塞，时间超过了 Redis 锁的 TTL 释放时间，锁在线程 1 的业务结束之前提前释放了，此时线程 2 就能乘虚而入，拿到不该拿到的锁。

可以预见，如果此时线程 1 终于醒了，它以为锁还在它那儿，于是直接释放了锁，而实际它释放的已经是线程 2 的锁了，之后的线程 3 也能拿到它不该拿到的锁，引发连锁反应，这样问题就大了。

![错误释放别人的锁问题](https://img.xicuodev.top/2026/03/124890d6390cf1aee1dd5279b9f2c7a2.png "错误释放别人的锁问题")

解决方法就是给锁加个标识，如果释放时根据标识发现已经是别人的锁了，那么就什么都不做。具体做法是，在获取锁时存入线程标识（如 UUID，为了防止雷同还可加上线程 id），在释放锁时先获取锁上的线程标识，判断是否与当前线程一致，如果一致就释放，不一致就不释放。

![释放锁之前先检查当前的锁是谁的](https://img.xicuodev.top/2026/03/6602a46751d247efb4522057c1816d50.png "释放锁之前先检查当前的锁是谁的")

### Redis 分布式锁的原子性问题

JVM 在执行 Full GC 的时候，会阻塞所有线程。如果线程 1 释放锁时判断锁是自己的，刚要释放时，自己 JVM 1 的 Full GC 开始了，线程 1 阻塞，结果 Redis 超时释放了锁；线程 2 在 JVM 2 中畅通无阻，因为锁已经释放，它成功拿到了锁；此时线程 1 终于醒来，它的判断已经失去时效性，而它根本不知道，二话不说释放了线程 2 的锁。

要避免这种原子性问题，必须把释放锁时的判断和释放打包成原子操作。具体做法是使用 Lua 脚本。

> [!tip] 为什么不直接用 Redis 的事务解决这种原子性问题？
>
> Redis 的事务机制比较基础，只能保证原子性，不能保证一致性，且它的实现方式是批处理，所有命令都在最终一次性执行，不能拿到用于判断的中间产物，因此不推荐使用。当然，Redis 的事务配合它的 `WATCH` 乐观锁机制，也能做到不删不是自己的锁，但这样就比较麻烦了。

> [!note] 脚本与代码
>
> 脚本之于解释型语言就像代码之于编译型语言。

Redis 提供了 Lua 脚本功能，可以在一个脚本中用 [Lua 语言](https://www.runoob.com/lua/lua-tutorial.html)编写多条 Redis 命令，这些命令是原子性的。

```lua
redis.call('set', 'name', 'jack')
local name = redis.call('get', 'name')
return name
```

执行脚本的 Redis 命令是 `EVAL script numkeys key [key ...] arg [arg ...]`，其中 `numkeys` 是 `key` 参数的个数，`key` 是 Redis 键，`arg` 是一般参数。在 Lua 脚本中用形参 `KEYS[1]` 和 `ARGV[1]` 数组来获取这两种参数的实参，下标从 1 开始数。

```sh
EVAL "return redis.call('set', KEYS[1], ARGV[1])" 1 name Jack
```

用 Lua 脚本重写释放 Redis 分布式锁的业务流程：

```lua
--- lua 脚本实现释放不可重入分布式锁
local key = KEYS[1] -- 我要什么锁
local threadId = ARGV[1] -- 我是什么人
local currentId = redis.call('get', key) -- 锁是谁的
-- 锁是我的
if (threadId == currentId) then
    return redis.call('del', key)
end
-- 锁不是我的
return 0
```

Spring Data Redis 提供的调用 Lua 脚本的方法是 `execute(RedisScript<T> script, List<K> keys, Object... argv)`，与 Redis 的 `EVAL` 命令对应，其中 `T` 是返回值类型，本例为 `Long`。创建 `resourses/unlock.lua` 文件，然后通过 `RedisTemplate` 调用 `execute()` 即可。

```java
private static final DefaultRedisScript<Long> UNLOCK_SCRIPT;

static {
    UNLOCK_SCRIPT = new DefaultRedisScript<>();
    UNLOCK_SCRIPT.setLocation(new ClassPathResource("unlock.lua"));
    UNLOCK_SCRIPT.setResultType(Long.class);
}
```

```java
public void unlock() {
    /*使用lua脚本实现原子操作*/
    stringRedisTemplate.execute(
            UNLOCK_SCRIPT,
            Collections.singletonList(getKey()),
            getValue()
    );
}
```

### Redis 分布式锁的其他优化

基于 Redis 的 `SET NX EX` 命令实现的非阻塞式分布式锁，除了误删和原子性问题，还存在以下问题：

- 不可重入：同一个线程无法多次获取同一把锁（方法 A 中调用方法 B，两个方法都要获取同一把锁） 
- 不可重试：获取锁只尝试一次就返回失败，没有重试机制
- 超时释放：锁超时释放虽然可以避免死锁，但是如果业务执行耗时较长，也会导致锁释放，存在安全隐患
- 主从一致性：如果 Redis 提供了主从集群，主从同步存在延迟，如果从尚未同步主中的锁数据，则会出现原来的锁失效问题

这要一个一个地给它实现也太麻烦了，好在有现成的框架帮我们实现，详见 [Redisson]({{% sref "redis-redisson" %}})。
