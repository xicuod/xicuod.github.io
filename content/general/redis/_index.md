---
weight: 20
slug: redis
title: Redis
---

Redis 是键值数据库，里面存的都是一个个键值对。但是不能把每个用户的 `id`、`name` 和 `age` 拆开来存，所以应该每个用户存一个键值对，用用户实体的主键 `id` 的值作为键值对的键，用用户实体的 JSON 字符串作为键值对的值。

- 键：`1001`
- 值：`{"id":1001,"name":"张三","age":24}`

Redis 的键值对的值非常强大，不单单可以存数字和字符串，还可以存有序集合、无序集合、双列集合等。像 Redis 这种存的都是键值对，没有关系型数据库中的表、约束等数据库对象，这类数据库叫做 **[NoSQL]({{% sref "redis-nosql" %}}) 数据库**。

## 参考文档

- Redis 命令官方文档：[https://redis.io/docs/latest/commands/](https://redis.io/docs/latest/commands/)
