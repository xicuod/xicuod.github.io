---
weight: 35
slug: redis-encoding
title: Redis 编码
---

Redis 中的“编码”指的是对数据类型的内存布局的优化策略，解决“数据放在哪、怎么放”的问题，而不是字符编码那样的“数据怎么解释”的映射问题，具体来说：

- `int` 编码：直接将整数值存储在 `redisObject` 的指针字段中。
- `embstr` 编码：一次内存分配，`redisObject` 和 SDS（简单动态字符串）结构体分配在同一块连续内存中。4.0 以前（不含）最大 39 字节，4.0 以后（含）最大 44 字节，超过会使用 `raw` 编码。
- `raw` 编码：两次内存分配，`redisObject` 和 SDS 分别分配在不同内存区域，SDS 管理堆上的字节数组。可动态扩容。任何前两种编码无法处理的情况，都会转换为 `raw` 编码处理。

使用 `TYPE` 查看某个 `key` 的 `value` 的类型，使用 `OBJECT ENCODING` 命令查看它的编码：

```
127.0.0.1:6379> MSET name jack age 24
OK
127.0.0.1:6379> TYPE name
string
127.0.0.1:6379> OBJECT ENCODING name
"embstr"
127.0.0.1:6379> OBJECT ENCODING age
"int"
```
