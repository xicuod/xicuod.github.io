---
weight: 70
slug: redis-list
title: Redis List 类型
---

Redis 的 `List` 类型与 Java 的 [`LinkedList`]({{% sref "java-util-linked-list" %}}) 类似，可以看作是一个双向链表（实际结构会更复杂），既能正向检索也能反向检索。`List` 类型用于保存一些对顺序有要求的数据，如点赞列表和评论列表。

- 有序
- 元素可重复
- 插入删除块
- 查询速度一般

## `List` 类型常见命令

- `LPUSH key element [element ...]`：向列表左侧插入一个或多个元素
- `RPUSH key element [element ...]`：向列表右侧插入一个或多个元素
- `LPOP key nums`：移除并返回列表左侧的指定个数的元素，没有则返回 `nil`
- `RPOP key nums`：移除并返回列表右侧的指定个数的元素，没有则返回 `nil`
- `LRANGE key start stop`：返回下标从 `start`（含）到 `stop`（含）的一段元素
- `BLPOP key [key ...] timeout`：与 `LPOP` 类似，只不过在没有元素时等待指定时间，而不是直接返回 `nil`
- `BRPOP key [key ...] timeout`：与 `RPOP` 类似，只不过在没有元素时等待指定时间，而不是直接返回 `nil`

`LRANGE` 的范围是两端都含，跟一般的左闭右开的范围不一样。`stop` 也可以大于列表长度，返回从 `start` 到列表末尾的所有元素；负索引同样支持，如 `LRANGE list 0 -1` 返回整个列表。

```
127.0.0.1:6379> lpush nums 1 2 3
(integer) 3
127.0.0.1:6379> lrange nums 0 -1
1) "3"
2) "2"
3) "1"
```

> [!tip] 为什么 `lpush nums 1 2 3` 会推成 `3 2 1` 的顺序？
>
> 因为 `lpush` 对于 `1 2 3` 这 3 个元素是按顺序从左推了 3 次，先推 `1`，再往 `1` 的左边推 `2`，最后往 `2` 的左边推 `3`，于是变成了 `3 2 1`。

`BLPOP` 和 `BRPOP` 如果第一时间没有拿到元素，会阻塞当前连接线程并监听列表，一旦出现元素就立即拿取并返回，如果等待超时还没有元素，则返回 `nil`。这个特性使 `BLPOP` 和 `BRPOP` 非常适合**工作队列**（消息队列，任务队列），生产者负责向列表中推入任务，消费者通过阻塞方式等待并取出任务进行处理。

> [!note] `List` 的三种用法
>
> 如果 `List` 的入口和出口在同一边，它就是一个**栈**；如果 `List` 的入口和出口在不同边，它就是一个**队列**；队列再加上出队采用 `BLPOP` 或 `BRPOP`，它就是一个**阻塞队列**。
