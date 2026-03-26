---
weight: 130
slug: redis-message-queue
title: Redis 消息队列
---

消息队列（message queue）是存放和管理消息的队列。最简单的消息队列包含 3 个角色：

- 消息队列：存储和管理消息，又叫“消息代理”（message broker）
- 生产者：发送消息到消息队列
- 消费者：从消息队列获取并处理消息

消息队列可以解除生产者和消费者的耦合。

JDK 阻塞队列跑在本地 JVM 内存中，生命周期跟 JVM 绑定，有内存限制和数据安全性[问题]({{% sref "heima-dianpin#基于阻塞队列的异步秒杀的问题" %}})，可用性差。而消息队列可以完美解决这些问题：

- 消息队列跑在独立的服务器上，不受内存限制。
- 消息队列有持久化机制，即使宕机也不会丢失数据，确保数据存储安全。
- 消息队列还有消息确认机制，消费者消费完消息后必须确认消费，消息队列才会删除该消息，确保消息至少消费一次。

市面上有很多成熟的消息队列方案，如 RabbitMQ、RocketMQ、Kafka 等。而如果只需要简单实现，那么本板块的主题 Redis 也有三种消息队列方案：

- `List` 结构：基于 `List` 结构模拟消息队列
- `Pub/Sub`：基本的点对点消息模型
- `Stream`：比较完善的消息队列模型

## 基于 `List` 结构的模拟消息队列

队列的出入口不在一边，因此可以利用 `List` 的 `LPUSH` 结合 `RPOP` 或 `RPUSH` 结合 `LPOP` 来实现消息队列。然而，当队列中没有消息时，`RPOP` 或 `LPOP` 会返回 `null`，而不是阻塞等待直到有消息。因此这里应该利用 `BRPOP` 或 `BLPOP` 来实现阻塞。

优点：

- 基于 Redis 存储，不受 JVM 内存上限限制
- 基于 Redis 持久化，数据安全
- 满足消息的有序性

缺点：

- 无法避免消息丢失
- 只支持单消费者

## 基于 `Pub/Sub` 的消息传递模型

`Pub/Sub` (Publish/Subscribe, 发布/订阅) 是 Redis 2.0 引入的消息传递模型。它使消费者可以订阅一个或多个通道（channel），生产者向对应的通道发送消息时，所有订阅者都能收到消息。

- `SUBSCRIBE channel [channel ...]`：订阅一个或多个通道
- `PUBLISH channel msg`：向一个通道发布一条消息
- `PSUBSCRIBE pattern [pattern ...]`：订阅与 `pattern` 格式匹配的所有通道

优点：

- 采用发布订阅模型，支持多生产、多消费

缺点：

`Pub/Sub` 只能用于即时的消息传递，并不具备队列的特性。如果消息发布时没人订阅，那么这个消息就直接丢失了，后来的订阅者也不会收到该消息。

- 不支持数据持久化
- 无法避免消息丢失
- 订阅者的消息堆积有上限，超出时数据丢失

## 基于 `Stream` 的消息队列

`Stream` 是 Redis 5.0 引入的一种新的[数据类型]({{% sref "redis-data-types" %}})，可以实现一个功能完善的消息队列。

- `XADD` 发送消息：
  - `key` 队列的键名
  - `[NOMKSTREAM]` no-make-stream 如果队列不存在，不要自动创建队列，默认自动创建
  - `[MAXLEN|MINID [=|~] threshold [LIMIT count]]` 队列的最大消息数量，超出时会丢弃旧的消息
  - `*|ID` 消息的唯一 id，`*` 由 Redis 自动生成，格式“13 位时间戳-递增数字”，如“1774501515334-0”
  - `field` 字段
  - `value` 值
  - `[field value ...]` 更多的 entry 键值对记录

`XADD` 最简单的用法：

```
XADD users * name jack age 21
```

- `XREAD` 读取消息：
  - `[COUNT count]` 每次读取消息的最大数量
  - `[BLOCK milliseconds]` 没有消息时阻塞，阻塞时长是多少毫秒，`0` 永久阻塞
  - `STREAMS key [key ...]` 读取哪些队列的消息
  - `ID [ID ...]` 起始消息 id，返回大于该 id 的消息，`0` 从第一个消息开始；`$` 从最新的消息开始

> [!warning] `XREAD` 不会移除 `Stream` 中的消息
>
> `XREAD` 读取后不会移除消息。`Stream` 的消息是一直存在的，直到你用 `XADD key MAXLEN|MINID threshold` 或 `XTRIM key MINID threshold` 手动修剪。

### `Stream` 单消费者模式

在业务开发中，可以循环调用 `XREAD` 阻塞方法来查询最新消息，从而实现持续监听队列的效果：

```java
/* 伪代码 */
while (true) {
    Object msg = redis.execute("XREAD COUNT 1 BLOCK 2000 STREAMS users $");
    if (msg == null) {
        continue;
    }
    handleMessage(msg);
}
```

然而，当指定起始 id 为 `$` 时，`XREAD` 每次都读取最新的消息，如果处理一条消息的过程中，又有多条消息到达消息队列，那么下次读取时就只能获取到最新一条，漏掉中间的消息，出现漏读消息的问题。

`Stream` 类型消息队列 `XREAD` 命令的特点：

- 消息可回溯
- 一个消息可以让多个消费者读取
- 可以阻塞读取
- 有漏读消息的风险

### `Stream` 消费者组模式

消费者组（consumer group）将多个消费者划分到一个组中，监听同一个队列。

- 消息分流：消息分流给多个消费者，加快消息处理速度
- 消息标识：消费者组维护一个消息标识（组偏移量），来记录最后一个被处理的消息，即使消费者宕机重启，也会从标识之后读取消息，从而解决消息漏读的问题
- 消息确认：消费者读取消息后，消息处于 `pending` 状态，并存入它自己的 PEL (pending entries list, 待处理列表)，消费者处理完需要通过 `XACK` 命令来确认消息已处理，该消息才会从 PEL 移除，从而解决处理异常导致的消息丢失问题

> [!note] 组偏移量与 PEL
>
> 组偏移量是整本书看到哪一页的公共书签，而 PEL 是每个人手里拿着的还没读完的那几页复印件。当他们读完一页，才会把这一页原件和复印件都碎掉。它们都是存在 Redis 中的数据，不会因为消费者宕机而丢失。

`XGROUP CREATE` 创建消费者组：

```
XGROUP CREATE key groupName ID [MKSTREAM]
```

`key` 队列名；`groupName` 消费者组名；`ID` 起始 id，`0` 从第一条消息开始消费，`$` 从最后一条消息开始消费；`MKSTREAM` 队列不存在时，创建队列

`XGROUP DESTROY` 删除消费者组：

```
XGROUP DESTROY key groupName
```

`XGROUP CREATECONSUMER` 往消费者组中添加消费者：

```
XGROUP CREATECONSUMER key groupName consumerName
```

`XGROUP DELCONSUMER` 从消费者组中移除消费者：

```
XGROUP DELCONSUMER key groupName consumerName
```

`XREADGROUP` 从消费者组读取消息：

```
XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] [NOACK] STREAMS key [key ...] ID [ID ...]
```

`consumer` 消费者名，如果消费者不存在，则自动创建；`NOACK` 不用确认；`ID` 起始 id，`>` 从下一个未消费的消息开始，如果是具体的值，则从 PEL 中获取已消费但未确认的消息，例如 `0` 从 PEL 中的第一个消息开始。

> [!tip] `>` 和 `$` 的区别
>
> `>` 是消费者组维护的 `Stream` 中下一个未消费的消息；`$` 是 Redis 全局维护的 `Stream` 中最新的消息，消费者组也能用，但前面也说了不好用，有漏读风险。

`XPENDING` 查看 PEL：

```
XPENDING key group [[IDLE min-idle-time] start end count [consumer]]
```

- `[IDLE min-idle-time]` 最小空闲时长，比如 `100` 就是只要空闲超过 100 毫秒（含）的 `pending` 消息
- `start end`：目标消息的下标范围（从 0 开始），`- +` 从头到尾

那么业务逻辑就很明显了，平时正常运转时，用 `XREADGROUP` 的 `>` 写法，获取下一个未消费的消息并处理；处理成功了，用 `XACK` 确认这条消息；如果有哪个消息处理异常了，就用 `XREADGROUP` 的具体数值写法，从消费者自己的 PEL 中获取已消费但未确认的消息。

> [!warning] `XACK` 不会移除 `Stream` 中的消息
>
> Redis Stream 的设计初衷是作为一个持久化的、可回溯的消息日志，而不是一个临时的中转站。当你执行 `XACK` 时，Redis 只做了两件事：将该消息从该消费者的 PEL 中移除；将该消息从该消费者组的 PEL 中移除。

> [!note] 怎么找到那些处理出异常的消息，找到正常消费中的消息怎么办？
>
> 每个消费者都有自己的 PEL。异常时，消费者线程不再正常消费。只要用 try-catch 处理异常，在 catch 中用 while 循环处理 PEL 中的所有消息，就能再处理那些处理异常的消息。找到正常消费中的消息也没关系，因为线程已经不再正常消费了，现在就是单纯地把 PEL 中的消息处理完而已。
> 
> **异常处理一直不成功怎么办？** 如果异常后的处理逻辑一直不成功，可以设置个阈值，超过这个阈值就报警告，这时候就需要人为介入了。
>
> **异常处理跑完了怎么继续正常消费？** 消费者的逻辑本身就是用 while 循环获取消息队列的消息，来持续不断地消费的。异常后的处理逻辑跑完之后，就回到外层正常消费的 while 循环，继续正常消费了。

`Stream` 类型消息队列 `XREADGROUP` 命令特点：

- 消息可回溯
- 可以多消费者争抢消息，消费更快
- 可以阻塞读取
- 不会漏读消息
- 有消息确认机制，保证消息至少消费一次

## 总结：对比三种消息队列实现

| 特性             | `List`                                   | `Pub/Sub`          | `Stream`                                               |
| ---------------- | ---------------------------------------- | ------------------ | ------------------------------------------------------ |
| **消息持久化**   | 支持                                     | 不支持             | 支持                                                   |
| **阻塞读取**     | 支持                                     | 支持               | 支持                                                   |
| **消息堆积处理** | 受限于内存空间，可以利用多消费者加快处理 | 受限于消费者缓冲区 | 受限于队列长度，可以利用消费者组提高消费速度，减少堆积 |
| **消息确认机制** | 不支持                                   | 不支持             | 支持                                                   |
| **消息回溯**     | 不支持                                   | 不支持             | 支持                                                   |

## `Stream` 消费者组模式的代码实现

先在 redis-cli 中创建 `stream.orders` 消息队列和它的消费者组 `g1`：

```
xgroup create stream.orders g1 0 mkstream
```

再在秒杀校验的 lua 脚本中添加发布消息的逻辑：

```lua
local voucherId = ARGV[1]
local userId = ARGV[2]
local orderId = ARGV[3]
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
-- 发送消息到 stream.orders 队列中
redis.call('xadd', 'stream.orders', '*', 'userId', userId, 'voucherId', voucherId, 'id', orderId)
return 0
```

最后，在项目启动时开启一个线程任务，尝试获取 `stream.orders` 中的消息并处理，完成下单：

```java
private class VoucherOrderHandler implements Runnable {
    private static final String queueName = "stream.orders";

    @Override
    public void run() {
        while (true) {
            try {
                // 获取消息队列中下一个未消费的订单
                // xreadgroup  group g1 c1  count 1 block 2000  streams stream.orders >
                List<MapRecord<String, Object, Object>> list =
                        stringRedisTemplate.opsForStream().read(
                                Consumer.from("g1", "c1"),
                                StreamReadOptions.empty().count(1).block(Duration.ofSeconds(2)),
                                StreamOffset.create(queueName, ReadOffset.lastConsumed())
                        );
                // 获取失败，继续进入下一次循环
                if (list == null || list.isEmpty()) {
                    continue;
                }
                // 获取成功，解析订单
                MapRecord<String, Object, Object> record = list.get(0);
                Map<Object, Object> orderMap = record.getValue();
                VoucherOrder order = BeanUtil.fillBeanWithMap(orderMap, new VoucherOrder(), true);
                // 处理消息
                handleVoucherOrder(order);
                // 处理成功，确认消息
                // xack stream.orders g1 id
                stringRedisTemplate.opsForStream().acknowledge(queueName, "g1", record.getId());
            } catch (Exception e) {
                //处理失败，从 PEL 获取消息并处理
                log.error(handleOrderErrMsg, e);
                handlePendingEntriesList(3);
            }
        }
    }

    private void handlePendingEntriesList(int threshold) {
        int errorCount = 0;
        while (true) {
            try {
                // 获取 PEL 中第一个订单
                // xreadgroup  group g1 c1  count 1 block 2000  streams stream.orders 0
                List<MapRecord<String, Object, Object>> list =
                        stringRedisTemplate.opsForStream().read(
                                Consumer.from("g1", "c1"),
                                StreamReadOptions.empty().count(1).block(Duration.ofSeconds(2)),
                                StreamOffset.create(queueName, ReadOffset.from("0"))
                        );
                // 获取失败，则 PEL 为空，结束循环
                if (list == null || list.isEmpty()) {
                    break;
                }
                // 获取成功，解析订单
                MapRecord<String, Object, Object> record = list.get(0);
                Map<Object, Object> orderMap = record.getValue();
                VoucherOrder order = BeanUtil.fillBeanWithMap(orderMap, new VoucherOrder(), true);
                // 处理消息
                handleVoucherOrder(order);
                // 处理成功，确认消息
                // xack stream.orders g1 id
                stringRedisTemplate.opsForStream().acknowledge(queueName, "g1", record.getId());
                errorCount = 0;
            } catch (Exception e) {
                // 处理失败次数超过阈值，抛异常并结束循环
                if (++errorCount > threshold) {
                    throw new RuntimeException(handlePendingOrderErrMsg);
                }
                // 处理失败，进入下一次循环
            }
        }
    }
}
```
