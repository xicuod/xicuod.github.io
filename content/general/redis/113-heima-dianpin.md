---
weight: 113
slug: heima-dianpin
title: 《黑马点评》项目笔记
---

## 缓存问题

详见 [Redis 缓存]({{% sref "redis-cache" %}})。

## 秒杀问题

### 全局唯一标识符

订单的标识符不应该重复，应该是全局唯一的。订单的标识符不应该规律明显，让别有用心的人猜到标识符变化规律并利用它攻击你的系统。

全局 ID 生成器是一种在分布式系统上生成全局唯一的 ID 的工具，一般要满足五个特性：唯一性、高可用、高性能、递增性和安全性。

Redis 是实现全局唯一 ID 的好工具。Redis 单线程执行命令，天然支持原子递增操作（`INCR` 和 `INCRBY`），所以它能保证唯一性和递增性。Redis 的主从和哨兵模式可以做到高可用。Redis 基于内存，性能很好。Redis 本身只能简单递增，不能复杂递增，需要在应用层写这方面逻辑，才能提高安全性。

为了提高 ID 的安全性，可以在 Redis 自增的数值的基础上拼接其他内容：

```
0 - 0000000 00000000 00000000 00000000 - 00000000 00000000 00000000 00000000
```

上面复杂 ID 的组成结构：

- 符号位：1 bit，永远为 0
- 时间戳：31 bit，单位秒，可以用 69 年
- 序列号：32 bit，可以做到每秒 $2^{32}$ 个不同的 ID

序列号是独立增长的，与 Redis 中存的实际递增值一致。时间戳只是用于增加复杂度的因子，并不会作为计数维度。

Redis 的递增值是有上限的，所以最好一天换一个递增值的 `key`。这样一个实体的全局唯一 ID 的 `key` 的格式就是 `incr:keyPrefix:yyyy:MM:dd`。每天一个 `key` 还能方便统计每天的订单量。

```java
private static final long BEGIN_TIMESTAMP = 1767225600L; /*2026-01-01T00:00:00+00:00*/

private static final int INCREMENT_BITS = 32; /*序列号位数*/

public long nextId(String keyPrefix) {
    String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
    String key = "incr:" + keyPrefix + ":" + date;
    //生成时间戳
    long timestamp = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
    long relativeTimestamp = timestamp - BEGIN_TIMESTAMP;
    //生成序列号
    Long increment = stringRedisTemplate.opsForValue().increment(key);
    if (increment == null) increment = 0L;
    return relativeTimestamp << INCREMENT_BITS | increment;
}
```

包括这个基于 Redis 自增值和时间戳的，全局唯一 ID 的生成策略有：

- UUID
- Redis 自增
- Snowflake 雪花算法
- 数据库自增：专门弄一张自增表

### 基本秒杀下单

1. 查代金券
2. 查秒杀是否开始或结束
3. 查库存
4. 减库存
5. 建订单
6. 订单写入数据库

这里“减库存”和“订单写入数据库”是两次数据库写入，还是对不同表的写入，所以需要加一个 Spring 的事务注解 `@Transactional`。

```java
@Override
@Transactional
public Result seckillVoucher(Long voucherId) {
    String notOpenMsg = "Seckill is not open yet.";
    String closedMsg = "Seckill is already closed.";
    String ranOutMsg = "Ran out of seckill voucher.";
    //查代金券
    SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
    //查秒杀是否开始或结束
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
        return Result.fail(notOpenMsg);
    }
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
        return Result.fail(closedMsg);
    }
    //查库存
    if (voucher.getStock() < 1) { /*没库存*/
        return Result.fail(ranOutMsg);
    }
    //减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1")
            .eq("voucher_id", voucherId)
            .update();
    if (!success) {
        return Result.fail(ranOutMsg);
    }
    //建订单
    VoucherOrder order = new VoucherOrder();
    long orderId = redisIdWorker.nextId(VOUCHER_ORDER_KEY);
    order.setId(orderId); /*订单id*/
    order.setUserId(UserHolder.getUser().getId()); /*用户id*/
    order.setVoucherId(voucherId); /*代金券id*/
    //订单写入数据库
    save(order);
    return Result.ok(orderId);
}
```

### 悲观锁和乐观锁

锁根据其作风可以分为两种，悲观锁和乐观锁。

- 悲观锁是认为线程安全问题一定会发生，因此在操作共享数据前先获取锁，确保多个线程串行执行。正因如此悲观锁的性能不是很好，在高并发场景不是很适合使用。`synchronized` 和 `lock` 都属于悲观锁。
- 乐观锁是认为线程安全问题不一定会发生，因此它根本就不加锁，只是在更新数据时去判断有没有其他线程修改了数据。如果没有修改，则认为是安全的，自己才更新数据；如果已经修改，说明发生了线程安全问题，此时可以重试或抛异常。

> [!note] 乐观锁怎么知道数据有没有修改过？
>
> - 版本号法：给数据加上一个版本，每次修改都更新版本，如果查完了修改时发现版本和查的时候不同，说明有其他线程先行一步。
> - CAS 法 (compare and swap，比较后交换)：如果查完了修改时发现数值跟查的时候不同，说明有其他线程先行一步。
>
> 如果数据并不复杂，比如说就只是一个数值，容易比较，那么可以直接使用 CAS 法。如果数据比较复杂，比如是一个对象，比较时要比较每一个字段的值，很麻烦，那么就使用版本号法（为此，需要在对象的类中维护一个版本号字段）。

总之，两种锁的特性和适用场景是：

- 悲观锁适合写多读少、冲突严重、强一致性要求极高的场景。它通过牺牲一点并发性能，来换取绝对的稳定。
- 乐观锁适合读多写少、冲突较少，或者操作非常轻量的场景。它通过提高并发能力，来提升系统吞吐量。

### 超卖问题

秒杀场景下并发的请求是非常多的，非常容易出现这样的情况：线程 A 查到库存但还没扣减库存时，其他线程也来查询库存，查到的是跟线程 A 同样的值，于是它们都以**同一个库存值**为准扣减了库存，导致多扣了许多不该扣的库存，最后库存会扣为负数。这就是“超卖问题”。

超卖问题可以用乐观锁解决，使用 CAS 法，即“比较后交换”，在写入时做二次判断，只更新 `tb_seckill_voucher` 中库存大于 0 的行，利用数据库行锁保证的原子性，保障了并发抢购时的线程安全。

### 一人一单问题

为了防止黄牛用脚本一人就抢购了所有秒杀券，需要限制一人一单。基本思路是在“查询库存”和“扣减库存”的中间加入一个“一人一单”的逻辑，判断每次请求的用户 id 和订单 id 是否在 `tb_voucher_order` 表里已经有一条记录了，如果有就返回失败，不扣减库存，否则正常扣减并返回成功。

但是这也存在多线程问题，先判断后写入的过程多个线程非常容易穿插执行，你判断了但还未写入，我就判断了，然后你或我的写入就变成了非法操作，而你我都不知道，心想“明明我都判断了呀”，可事与愿违。

要解决这个问题，需要用到悲观锁，你可以把“一人一单”、“扣减库存”和“创建订单”的逻辑封装为一个 `createVoucherOrder` 方法，然后用 `synchronized` 块包住这些代码。另外，因为“扣减库存”和“创建订单”这两个写入操作被封装走了，你也要把 `@Transactional` 事务注解也拿来这个方法上。

```java
@Override
@Transactional
public Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    //一人一单
    int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
    if (count > 0) { /*用户已经购买过了*/
        return Result.fail(oneForEachMsg);
    }
    /* 减库存 + 建订单 */
    return Result.ok(orderId);
}
```

#### 用好 `synchronized` 悲观锁

> [!tip] 一人一把锁
>
> 不要把 `synchronized` 写到 `createVoucherOrder` 方法上，因为这样就意味着所有用户用的都是同一把锁，而这个一人一单的场景是针对每个用户而言的，你只需要把同一个用户的并发请求串行化就行了，你应该为每个用户都配一把他自己的锁，而不是让所有用户共用一把锁。要实现这个，使用 `synchronized` 块，在括号里指定锁对象为用户 id 的字符串常量（`userId.toString().intern()`）即可。

然而，仅靠 `synchronized` 并不能保证数据库的线程安全。即使 `synchronized` 块退出并释放了锁，还需要等 Spring 把 `createVoucherOrder` 方法的 `@Transactional` 事务提交给数据库（只有提交了事务，数据库才会真正写入更改），而此时因为 `synchronized` 释放了锁，其他线程已经可以进入并发写入逻辑了。因此，我们需要在事务提交之后才去释放锁，具体做法是给调用 `createVoucherOrder` 方法的地方加锁。

```java
@Override
public Result seckillVoucher(Long voucherId) {
    /* 查券 + 查库存 */
    Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
        return proxy.createVoucherOrder(voucherId);
    }
}
```

#### `AopContext` 解决自我调用问题

> [!tip] “自我调用”：不走动态代理对象，导致 Spring 事务失效
>
> 如果主调者直接调用事务方法，那么主调者就是在用 `this`（目标对象）来调用被调者事务方法，就会构成“自我调用”。Spring 的 `@Transactional` 事务注解是基于 Spring 动态代理的对象来生效的，自我调用没有走 Spring 的动态代理对象，于是 Spring 事务也不会生效。

“自我调用”问题的解决办法也很简单，通过 `AopContext.currentProxy()` 拿到 `this` 的代理对象，然后用代理对象“代理” `this` 来调用事务方法就可以了。然而，前提是你要引入动态代理需要的 AOP 依赖 `aspectj`（包含在 `spring-boot-starter-aop` 起步依赖中），并在 Spring 应用的启动类上添加 `@EnableAspectJAutoProxy(exposeProxy = true)` 注解。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

```java
@EnableAspectJAutoProxy(exposeProxy = true)
@MapperScan("com.hmdp.mapper")
@SpringBootApplication
public class HmDianPingApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmDianPingApplication.class, args);
    }
}
```

```java
IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
return proxy.createVoucherOrder(voucherId);
```

### 辨析超卖和一人一单的技术选型

> [!note] 为什么超卖问题用乐观锁，一人一单问题用悲观锁？
>
> 超卖问题是更新操作，一人一单问题是插入操作。乐观锁无论是版本号法还是 CAS 法，都是比较现有的数据跟请求的数据是否冲突，因此适合更新操作；而悲观锁则不需要考虑比较的问题，它只是单纯地不让线程并发地执行。
>
> - 更新操作极快，冲突重试代价小（重试容易成功），用乐观锁可避免线程挂起，导致长时间未响应。同时乐观锁保证最终一致性，不追求强一致性，恰好适合超卖场景。
> - 插入操作虽然也可以用数据库的唯一约束来做（就是把用户 id 和订单 id 放在一起作为唯一键），但是为了防止大量请求穿透到数据库导致抛出唯一约束异常，然后又要麻烦业务层处理，直接在业务入口加悲观锁（如分布式锁）做流量管控更为常见。
> - 实际上，数据库的唯一约束基于数据库的行锁，这个行锁也是一种悲观锁。

### 秒杀问题的异步优化

> [!note] 总结：秒杀业务的优化思路是什么？
>
> 1. 先利用 Redis 完成库存余量、一人一单的校验，完成抢单业务
> 2. 再将实际的下单业务放入阻塞队列，利用独立线程异步下单

秒杀问题的业务流程中，查库存和一人一单这种校验操作不耗时，减库存和建订单这种数据库写入操作十分耗时。解决方案是把不耗时的校验操作给 A 做，把耗时的数据库操作给 B 做；并且为了及时保存相关数据，A 要把一手数据保存在 Redis 中，由 B 异步地把一手数据同步到关系型数据库，作为二手数据。

首先，在后台添加秒杀券的逻辑中添加把秒杀库存也存到 Redis 当中的逻辑：

```java
@Override
@Transactional
public void addSeckillVoucher(Voucher voucher) {
    /* 先保存到数据库，省略 */
    /* 再保存秒杀库存到 Redis 中 */
    stringRedisTemplate.opsForValue().set(VOUCHER_STOCK_KEY + voucher.getId(), voucher.getStock().toString());
}
```

然后，Redis 就可以做校验操作，校验完了，先扣减库存，再保存优惠券 id、用户 id 和订单 id 到阻塞队列，并返回订单 id 给用户。对于一人一单，也不要只把用户和订单的关联信息存在数据库，而是先把它存在 Redis 当中。怎么存呢，用优惠券 id 作为 `key`，`value` 则用 `Set` 存所有买个优惠券的用户 id。数据校验和扣减库存这两个操作都要写在 lua 脚本里保证原子性。

最后，让 Tomcat 异步读取队列中的 id 信息，来执行数据库操作。因为这个场景下，Redis 已经做到高可用了，数据库只是兜底和归档，数据同步时效性没那么高，完全可以异步地用数据库能够接受的频率同步数据。也就是说，这种场景只需要保证数据的最终一致性即可。

![秒杀问题的异步优化](https://img.xicuodev.top/2026/03/5c9ac9d8d7dd86dba26227275f93d41f.png "秒杀问题的异步优化")

#### Lua 脚本实现数据校验和扣减 Redis 库存逻辑

```lua {filename=seckill.lua}
local voucherId = ARGV[1]
local userId = ARGV[2]
local stockKey = 'voucher:stock:' .. voucherId
local orderKey = 'voucher:order:' .. voucherId

-- 校验库存
local stock = tonumber(redis.call('get', stockKey))
if (stock <= 0) then -- 库存不足
    return 1
end

-- 校验一人一单
local added = redis.call('sismember', orderKey, userId)
if (added == 1) then -- 用户已经下过一单（一人一单）
    return 2
end

-- 扣减库存
redis.call('incrby', stockKey, -1)
-- 将用户 id 存到优惠券 key 的 set 中（一人一单）
redis.call('sadd', orderKey, userId)
return 0
```

```java
private IVoucherOrderService proxy;

private static final DefaultRedisScript<Long> SECKILL_SCRIPT;

static {
    SECKILL_SCRIPT = new DefaultRedisScript<>();
    SECKILL_SCRIPT.setLocation(new ClassPathResource("seckill.lua"));
    SECKILL_SCRIPT.setResultType(Long.class);
}
```

#### 阻塞队列和异步消费者线程逻辑

```java
private static final ExecutorService SECKILL_ORDER_EXECUTOR = Executors.newSingleThreadExecutor();

@PostConstruct
public void init() {
    SECKILL_ORDER_EXECUTOR.submit(new VoucherOrderHandler());
}

private final BlockingQueue<VoucherOrder> orderTasks = new ArrayBlockingQueue<>(1024 * 1024);

private class VoucherOrderHandler implements Runnable {

    @Override
    public void run() {
        while (true) {
            try {
                VoucherOrder order = orderTasks.take();
                handleVoucherOrder(order);
            } catch (Exception e) {
                log.error(handleOrderErrMsg, e);
                break;
            }
        }
    }
}

private void handleVoucherOrder(VoucherOrder order) {
    Long userId = order.getUserId();
    RLock lock = redissonClient.getLock(getLockKey(userId));
    boolean locked = lock.tryLock(); //无参 tryLock() 会立即返回结果
    if (!locked) {
        log.error(oneForEachMsg);
        return;
    }
    try { //用代理对象使事务生效
        proxy.createVoucherOrder(order);
    } finally {
        lock.unlock();
    }
}
```

#### 秒杀下单业务核心方法

```java
@Override
public Result seckillVoucher(Long voucherId) {
    Long userId = UserHolder.getUser().getId();

    // 数据校验 via redis
    Long result = stringRedisTemplate.execute(
            SECKILL_SCRIPT,
            Collections.emptyList(),
            voucherId.toString(), userId.toString()
    );
    int r = result.intValue();
    if (r != 0) { //校验异常
        String errorMsg;
        switch (r) {
            case 1:
                errorMsg = ranOutOfMsg;
                break;
            case 2:
                errorMsg = oneForEachMsg;
                break;
            default:
                errorMsg = unknownMsg;
        }
        return Result.fail(errorMsg);
    }

    // 保存订单到阻塞队列
    long orderId = redisIdWorker.nextId(VOUCHER_ORDER_KEY); //准备订单id
    VoucherOrder order = new VoucherOrder(); //准备订单
    order.setId(orderId);
    order.setUserId(userId);
    order.setVoucherId(voucherId);
    orderTasks.add(order); //放入阻塞队列

    // 初始化代理对象
    proxy = (IVoucherOrderService) AopContext.currentProxy();
    return Result.ok(orderId);
}
```

#### 基于阻塞队列的异步秒杀的问题

1）内存限制问题

关键在于我们使用的是 JDK 的阻塞队列，它使用的是 JVM 内存。如果不加以限制，那么在高并发场景下，海量订单涌入阻塞队列，可能导致 JVM 内存溢出。虽然我们设置了阻塞队列的长度，但是如果它塞满了，多余的订单就塞不进去了。

2）数据安全问题

因为阻塞队列基于 JVM 内存，如果 JVM 宕机，那么这些订单信息都丢失了，导致 Redis 和关系型数据库的数据不一致。还有，如果一个订单任务执行时发生异常，并不会放回阻塞队列，也会导致任务丢失。

要解决这两个问题，最佳的方案就是用[消息队列]({{% sref "redis-message-queue" %}})来代替 JDK 阻塞队列。

## 达人探店的实现

- 发布探店笔记：`saveBlog()` 数据库写入
- 查看探店笔记：`queryBlogById()` 数据库查询
- 点赞功能：`likeBlog()` 数据库写入 + Redis 旁路缓存（使用 ZSet）
- 最近点赞列表：`queryBlogLikes()` Redis ZSet `ZRANGE` 命令 + 数据库 `ORDER BY FEILD()` 语句保序
- 博文关联查询：`includeBlogUser()` 查询发布博文的用户、`includeBlogIsLike()` 查询博文是否被当前用户点赞

## 好友关注的实现

- 关注取关：`follow()` 数据库写入 + Redis 旁路缓存 (使用 Set)
- 是否关注：`isFollow()` 数据库 `COUNT(*)` 查询
- 共同关注：`queryFollowCommons()` Redis `SINTER` 命令求交集
- 关注推送：feed 投喂模式提供沉浸式的信息流体验，无限下拉刷新获取新的信息，且可以根据用户的喜好个性化推荐用户可能感兴趣的内容。

### Feed 流模式

Feed 流产品有两种场景模式，Timeline 时间线模式和智能排序模式。

- Timeline：不做内容筛选，简单地按发布时间排序，一般用于好友和关注的信息流，如微信朋友圈。优点是信息全面，没有缺失，实现简单；缺点是信息噪音多，用户不一定感兴趣，内容获取效率低。
- 智能排序：利用智能算法屏蔽违规的、用户不感兴趣的内容。推送用户感兴趣的内容来吸引用户。优点是用户粘性高，容易沉迷；缺点是如果算法不精准，可能起到反作用。

Timeline 模式有三种实现方案：拉模式、推模式和推拉结合模式。

- 拉模式：读扩散，给每个发布者准备一个发件箱，给每条消息注明时间戳，给关注者准备一个收件箱，平时是空的，只有关注者查看时才会拉取消息，拉过来按时间排序即可。
  - 优点：节省空间，收件箱一般不存消息，只在拉取时放入消息。
  - 缺点：每次读取收件箱时都要重新拉取所有发件箱的消息，然后还要排序，一旦数据规模增大，耗时将显著增加。
- 推模式：写扩散，没有发件箱，发布者发布消息时，向所有关注者的收件箱放入消息，并同时将消息排序。
  - 优点：关注者可以直接拿到现成的排序的消息列表。
  - 缺点：性能很差，内存占用大，如果一个发布者的粉丝很多，一个消息可能要写成千上万次。
- 推拉结合模式：读写混合，兼具推和拉两种模式的优点。对于普通人发布者，采用推模式；对于大 V 的普通粉丝，采用拉模式；对于大 V 的活跃粉丝，采用推模式。
  - 优点：兼顾不同人群的使用习惯，同时保证性能最优。
  - 缺点：实现复杂。

拉模式很少使用，推模式适合用户量少、没有大 V 的平台，推拉结合模式适合过千万用户量、有大 V 的平台。

黑马点评采用 Timeline 的推模式实现 Feed 流关注推送。

#### Feed 流的分页问题

Feed 流中的数据在不断更新，时间线中数据的角标也在不断更新，因此不能采用依赖角标查询的传统的分页模式。你读了第 1 页，拿到了 id 从 10 到 6 的消息，还未读第 2 页时，我就发布了一个新 feed，放在了时间线的顶端，id 为 11，这时你再读第 2 页，读到的就是 6 到 2 的消息了，而不是你预想中的 5 到 1。

要解决不断变化的 Feed 流的分页问题，需要采取依赖 id 查询的滚动分页的模式。记录每次查询时的最后一条消息，下次查询的时候从这条下面开始查。因为 id 是有序的，所以按 id 查也是可以分页查询的。Redis 中的 ZSet 恰好有一个 score 值可以用来当作 id，且有 `ZREVRANGEBYSCORE` 命令通过 score 降序查询一组连续的数据，可以实现时间降序的滚动分页。而 Redis 的 List 就不行，它是单列集合，没有额外的用于滚动查询的列。

假设每页 3 条消息，使用 `ZREVRANGEBYSCORE` 第一次查：把 `max` 最大 score 设置为当前时间戳，即最大值，从最新的一条开始查

```
ZREVRANGEBYSCORE feed:<userId> <currentTimestamp> 0 WITHSCORES LIMIT 0 3
```

```
1) "feed6"
2) 1774688350321
3) "feed5"
4) 1774688319123
5) "feed4"
6) 1774687177425
```

第二次查：`LIMIT` 的 offset 偏移量设置为 1，是指剔除 1774687177425 这个 lastId 的消息

```
ZREVRANGEBYSCORE feed:<userId> 1774687177425 0 WITHSCORES LIMIT 1 3
```

```
1) "feed3"
2) 1774686123456
3) "feed2"
4) 1774685123456
5) "feed1"
6) 1774684123456
```

但是这样有一个问题，当两个消息同时发布时，它们的时间戳 score 值是一样的，那么第二次查询时只能跳过一个消息，而另一个消息会被重复查询。因此，需要用 offset 跳过第一次查询时所有 score 等于 lastId 的元素。

#### 总结：滚动分页查询的参数

- `max` 最大时间戳：当前时间戳；上一次查询的最小时间戳
- `min` 最小时间戳：0
- `offset` 跳过的消息个数：0；上一次查询中所有 score 为 lastId 的元素个数
- `count` 每页的消息个数：指定值

```java
@Override
public Result queryBlogOfFollow(Long max, Integer offset) {
    Long userId = UserHolder.getUser().getId();
    String key = FEED_KEY + userId;
    long min = 0L;
    //从当前用户收件箱中取feed
    //zrevrangebyscore key max min withscores limit offset count
    Set<ZSetOperations.TypedTuple<String>> tuples = stringRedisTemplate.opsForZSet()
            .reverseRangeByScoreWithScores(key, min, max, offset, FEED_PAGE_SIZE);
    if (tuples == null || tuples.isEmpty()) return Result.ok();
    List<Long> ids = new ArrayList<>(tuples.size());
    int count = 0;
    for (ZSetOperations.TypedTuple<String> tuple : tuples) {
        String value = tuple.getValue();
        if (value == null) continue;
        ids.add(Long.valueOf(value));
        Double _score = tuple.getScore();
        if (_score == null) continue;
        long score = _score.longValue();
        //对相等score计数，每有不等就重置计数，因此最后一定是lastId的计数
        if (min == score) {
            ++count;
        } else {
            min = score;
            count = 1;
        }
    }
    // 跨页追踪计数
    // 为防止相等id过多导致跨页，还要看max跟min是否相等，如果相等还要把上一轮的offset累加上去
    if (max == min) count += offset;
    //用order by field()从数据库保序查询
    String idsStr = StrUtil.join(",", ids);
    List<Blog> blogs = lambdaQuery().in(Blog::getId, ids)
            .last("order by field(id," + idsStr + ")").list()
            /*用stream流的peek()关联查询每个blog*/
            .stream().peek(blog -> {
                includeBlogUser(blog);
                includeBlogIsLike(blog);
            }).collect(Collectors.toList());
    //封装为ScrollResult并返回
    ScrollResult result = new ScrollResult();
    result.setList(blogs);
    result.setOffset(count);
    result.setMinTime(min);
    return Result.ok(result);
}
```

> [!warning] 跨页追踪
>
> 为防止相等 id 过多导致跨页，还要看 max 跟 min 是否相等，如果相等还要把上一轮的 offset 累加上去。

## 附近店铺的实现

通过 Redis Geo 类型处理地理位置信息，获取同类型的店铺到用户的直线距离并据此排序。

首先预热 Redis 每种类型店铺的 Geo 记录：

```java
@Test
void loadShopData() {
    Map<Long, List<Shop>> typeShops = shopService.list().stream().collect(Collectors.groupingBy(Shop::getTypeId));
    typeShops.forEach((typeId, shops) -> {
        String key = SHOP_GEO_KEY + typeId;
        List<RedisGeoCommands.GeoLocation<String>> locations = shops.stream()
                .map(shop -> new RedisGeoCommands.GeoLocation<>(
                        shop.getId().toString(),
                        new Point(shop.getX(), shop.getY())
                )).collect(Collectors.toList());
        stringRedisTemplate.opsForGeo().add(key, locations);
    });
}
```

然后实现 `queryShopByType()` 查询接口即可：

```java
@Override
public Result queryShopByType(Integer typeId, Integer current, Double x, Double y) {
    if (x == null || y == null) {
        // 根据类型分页查询
        Page<Shop> page = lambdaQuery()
                .eq(Shop::getTypeId, typeId)
                .page(new Page<>(current, DEFAULT_PAGE_SIZE));
        return Result.ok(page.getRecords());
    }

    String key = SHOP_GEO_KEY + typeId;
    int back = (current - 1) * DEFAULT_PAGE_SIZE;
    int front = current * DEFAULT_PAGE_SIZE;
    //GEOSEARCH typeGeoKey BYLONLAT x y BYRADIUS 5000 m WITHDIST COUNT front
    GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo().search(
            key, GeoReference.fromCoordinate(x, y),
            new Distance(5000), //默认单位是米
            RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance().limit(front)
    );
    if (results == null) return Result.ok(Collections.emptyList());
    List<GeoResult<RedisGeoCommands.GeoLocation<String>>> geos = results.getContent();
    //校验current，如果当前页没有记录，那么直接返回空集合
    if (geos.size() <= back) return Result.ok(Collections.emptyList());
    List<Long> ids = new ArrayList<>(geos.size());
    Map<Long, Distance> idDistances = new HashMap<>(geos.size());
    geos.stream().skip(back).forEach(geo -> {
        Long id = Long.valueOf(geo.getContent().getName());
        Distance distance = geo.getDistance();
        ids.add(id);
        idDistances.put(id, distance);
    });
    //用id查shop，保序
    List<Shop> shops = lambdaQuery().in(Shop::getId, ids)
            .last("order by field(id," + StrUtil.join(",", ids) + ")").list();
    //include distance
    shops = shops.stream().peek(shop -> shop.setDistance(idDistances.get(shop.getId()).getValue()))
            .collect(Collectors.toList());
    return Result.ok(shops);
}
```

## CORS 跨域问题

现象：前端请求后端接口时，后端 `request.getHeader("authorization")` 始终返回 `null`，导致 401 未登录。

根本原因：`LoginInterceptor` 拦截器没有放行 `OPTIONS` 预检请求，导致浏览器 CORS 预检失败，真正的请求（携带 `authorization`
header）根本没有发送。`OPTIONS` 请求是“无辜”的，它只是来问“服务器允许跨域吗”，却被拦截器当成了未登录请求拦下。

### 原理：CORS 跨域机制

浏览器 CORS 机制：当跨域请求满足以下条件时，浏览器会先发送 `OPTIONS` 预检请求。

- 使用了非简单方法（如 GET/POST 之外的）
- 自定义请求头（如 `authorization`）
- `Content-Type` 不是 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

> [!tip] 什么是跨域？
>
> 浏览器的**同源策略**（Same-Origin Policy）要求：**协议**、**域名**、**端口**，三者必须完全相同。只要有一个不同，就算跨域。

> [!note] CORS 是浏览器的安全机制
>
> CORS 是浏览器的安全机制，目的是防止恶意网站通过浏览器访问用户登录的其他网站的账号数据。浏览器自己要搞跨域检查，发了预检请求，所以后端配合它弄了跨域；如果浏览器本身不搞，那么后端也不会要求。

浏览器流程：

1. 先发 `OPTIONS /user/me`（不含自定义请求头的值）

```yml
Origin: http://localhost
Access-Control-Request-Headers: authorization
Access-Control-Request-Method: GET
```

2. 等服务器响应允许 CORS 后，才发真正的 `GET /user/me`（含自定义请求头的键值：`authorization: <token-value>`）

### 解决方案：反向代理或 Spring CORS 配置

让运维同学在 Nginx 上配置**反向代理**，把前端名义上的 `80` 请求代理到后端实际上的 `8081`，这样浏览器就不认为前端的请求跨域了。

```conf {filename="nginx.conf"}
server {
    location /api/ {
        proxy_pass http://localhost:8081/;
    }
}
```

> [!tip] 代理的正反
>
> 代理的正反指的是**代理本身的方向**：反向代理就是把代理那一面朝向客户端，实际那一面朝向服务端；正向代理就是实际那一面朝向客户端，代理那一面朝向服务端。
> 
> 代理的那一面朝向一端，另一端就被代理服务器**隐藏**了，因为代理朝向的那一端只知道代理服务器的地址，不知道实际服务器的地址。

然而，作为一名后端工程师，更标准的做法是交给 **Spring CORS 配置**处理，只要配置正确，Spring 就会自动处理 `OPTIONS` 请求，不会执行拦截器。

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("authorization", "content-type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

> [!warning] CORS “不欢迎”通配符
>
> 注意必须显式指定 `.allowedOrigins("http://localhost")` 和 `.allowedHeaders("authorization")`，因为 `authorization` 是**凭据**头，当跨域请求涉及凭据时，浏览器对服务器的响应头有严格要求：`Access-Control-Allow-Origin` 和 `Access-Control-Allow-Headers` 都不能为 `*`，必须明确列出允许的条目。这是 **CORS 规范**的一部分，目的是防止在凭据模式下**意外**暴露敏感信息。如果服务器允许通配符，攻击者可能利用某些漏洞绕过同源策略。
