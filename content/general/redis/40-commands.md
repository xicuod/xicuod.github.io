---
weight: 40
slug: redis-commands
title: Redis 通用命令
---

Redis 的通用命令可以在[这里](https://redis.io/docs/latest/commands/)查阅，或者在 `redis-cli` 中通过 `help [command]` 查看一个命令的具体用法。

Redis 通用命令是对于全部数据类型都可以使用的命令，常用的有：

## `keys` 命令

`keys <pattern>` 命令用于查询符合模板的所有 `key`。

`keys` 的查询模板支持模糊查询，`*` 代表任意字符串（含空字符串），`?` 代表任意字符。但是模糊查询效率不高，一旦数据量成千上万，一查起来要把所有数据遍历一遍，对服务器压力很大，给单线程的 Redis 雪上加霜：查询的时候是阻塞的，Redis 无法响应其他的命令。因此，生产模式下不应该使用 `keys` 查询，除非你的 Redis 是主从的集群模式，那么你可以在从节点执行 `keys` 命令，千万不能在主节点执行。

```
127.0.0.1:6379> keys *
1) "age"
2) "name"
```

## `del` 命令

`del <key> [key ...]` 命令用于删除一个或更多指定的 `key`，并返回成功删除的个数。

- `mset` 命令用于批量插入键值。

```
127.0.0.1:6379> mset k1 v1 k2 v2 k3 v3
OK
127.0.0.1:6379> keys *
1) "k2"
2) "k3"
3) "name"
4) "k1"
5) "age"
127.0.0.1:6379> del k1 k2 k3 k4
(integer) 3
```

## `exists` 命令

`exists <key> [key ...]` 命令用于判断一个或多个 `key` 是否存在，存在返回 `1`，不存在返回 `0`。

```
127.0.0.1:6379> exists name
(integer) 1
```

## `expire` 和 `ttl` 命令

`expire <key> <seconds>` 命令用于给一个 `key` 设置有效期，到期时它会自动删除。`ttl <key>` 查看一个 `key` 的剩余有效期，返回正数就是剩余的秒数，返回 `-1` 是永久有效，不会过期，返回 `-2` 是找不到这样的 `key`，可能是已过期，或从未存在过。

```
127.0.0.1:6379> keys *
1) "name"
2) "age"
127.0.0.1:6379> expire age 20
(integer) 1
127.0.0.1:6379> ttl age
(integer) 17
127.0.0.1:6379> ttl age
(integer) 3
127.0.0.1:6379> ttl age
(integer) -2
127.0.0.1:6379> keys *
1) "name"
127.0.0.1:6379> ttl name
(integer) -1
```
