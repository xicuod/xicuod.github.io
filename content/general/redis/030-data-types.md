---
weight: 30
slug: redis-data-types
title: Redis 数据类型
---

Redis 的 `key` 一般的都是 `String` 类型，但是 `value` 可以是各种类型：

基本类型：

- `String`：字符串，`"hello world"`
- `Hash`：哈希表，双列集合，`{name: "Jack", age: 21}`
- `List`：列表，有序集合，`[A -> B -> C -> C]`
- `Set`：无序集合，`{A, B, C}`
- `SortedSet`：可排序的集合，`{A: 1, B: 2, C: 3}`

特殊类型：

- `GEO`：地理位置，`{ A: (120.3, 30.5) }`
- `BitMap`：`0110110101110101011`
- `HyperLog`：`0110110101110101011`

以及其他更多类型，如 [`Stream` 类型]({{% sref "redis-message-queue#基于-stream-的消息队列" %}})。

> [!tip] `redis-cli` 查看数据结构相关命令的帮助文档
>
> 如 `help @sorted-set` 可以查看有关 `SortedSort` 的命令手册，其他数据结构同理。
