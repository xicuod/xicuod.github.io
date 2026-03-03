---
weight: 60
slug: redis-hash
title: Redis Hash 类型
---

`Hash` 类型 (哈希类型，散列类型) 的 `value` 是一个无序字典，类似于 Java 的 `HashMap` 结构。

`String` 类型的 `value` 是将对象序列化为 JSON 字符串，但是修改时不方便，比如只想修改某个字段，但因为是字符串只能整个覆盖修改。`Hash` 结构可以把对象中的每个字段独立存储，它是双列集合，有 `field` 和 `value` 两部分，自己就是一个键值对集合。

## `Hash` 类型常见命令

- `HSET key field value`：添加或者修改 `hash` 类型 `key` 的 `field` 的值
- `HGET key field`：获取一个 `hash` 类型 `key` 的 `field` 的值
- `HMSET`：批量添加多个 `hash` 类型 `key` 的 `field` 的值
- `HMGET`：批量获取多个 `hash` 类型 `key` 的 `field` 的值
- `HGETALL`：获取一个 `hash` 类型的 `key` 中的所有的 `field` 和 `value`
- `HKEYS`：获取一个 `hash` 类型的 `key` 中的所有的 `field`
- `HVALS`：获取一个 `hash` 类型的 `key` 中的所有的 `value`
- `HINCRBY`: 让一个 `hash` 类型 `key` 的字段值自增并指定步长
- `HSETNX`：添加一个 `hash` 类型的 `key` 的 `field` 值，前提是这个 `field` 不存在，否则不执行

`HSET` 可以给一个 `key` 的 `Hash` 类型的 `value` 添加或修改单独的一个 `field`，并返回本次操作新增的字段的个数（而不是新增或修改）。

从 Redis 4.0.0 开始，`HSET` 命令已支持同时设置多个字段，可以替代 `HMSET`。但 `HGET` 不能替代 `HMGET`，它一次还是只能查一个字段。

```
127.0.0.1:6379> hset xic:user:3 id 3 name Tom age 24
(integer) 3
127.0.0.1:6379> hset xic:user:3 name Tim
(integer) 0
127.0.0.1:6379> hmget xic:user:3 name age
1) "Tim"
2) "24"
127.0.0.1:6379> hgetall xic:user:3
1) "id"
2) "3"
3) "name"
4) "Tim"
5) "age"
6) "24"
```
