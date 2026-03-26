---
weight: 40
slug: redis-commands
title: Redis 通用命令
---

Redis 的通用命令可以在[这里](https://redis.io/docs/latest/commands/)查阅，或者在 `redis-cli` 中通过 `help [command]` 查看一个命令的具体用法。

Redis 通用命令是对于全部数据类型都可以使用的命令，常用的有：

## `KEYS` 命令

`KEYS <pattern>` 命令用于查询符合模板的所有 `key`。

`KEYS` 的查询模板支持模糊查询，`*` 代表任意字符串（含空字符串），`?` 代表任意字符。但是模糊查询效率不高，一旦数据量成千上万，一查起来要把所有数据遍历一遍，对服务器压力很大，给单线程的 Redis 雪上加霜：查询的时候是阻塞的，Redis 无法响应其他的命令。因此，生产模式下不应该使用 `KEYS` 查询，除非你的 Redis 是主从的集群模式，那么你可以在从节点执行 `KEYS` 命令，千万不能在主节点执行。

```
127.0.0.1:6379> KEYS *
1) "age"
2) "name"
```

## `DEL` 命令

`DEL <key> [key ...]` 命令用于删除一个或更多指定的 `key`，并返回成功删除的个数。

- `MSET` 命令用于批量插入键值。

```
127.0.0.1:6379> MSET k1 v1 k2 v2 k3 v3
OK
127.0.0.1:6379> KEYS *
1) "k2"
2) "k3"
3) "name"
4) "k1"
5) "age"
127.0.0.1:6379> DEL k1 k2 k3 k4
(integer) 3
```

## `EXISTS` 命令

`EXISTS <key> [key ...]` 命令用于判断一个或多个 `key` 是否存在，存在返回 `1`，不存在返回 `0`。

```
127.0.0.1:6379> EXISTS name
(integer) 1
```

## `EXPIRE` 和 `TTL` 命令

`EXPIRE <key> <seconds>` 命令用于给一个 `key` 设置有效期，到期时它会自动删除。`TTL <key>` 查看一个 `key` 的剩余有效期，返回正数就是剩余的秒数，返回 `-1` 是永久有效，不会过期，返回 `-2` 是找不到这样的 `key`，可能是已过期，或从未存在过。

```
127.0.0.1:6379> KEYS *
1) "name"
2) "age"
127.0.0.1:6379> EXPIRE age 20
(integer) 1
127.0.0.1:6379> TTL age
(integer) 17
127.0.0.1:6379> TTL age
(integer) 3
127.0.0.1:6379> TTL age
(integer) -2
127.0.0.1:6379> KEYS *
1) "name"
127.0.0.1:6379> TTL name
(integer) -1
```

## `RENAME` 命令

```
RENAME old_key_name new_key_name
```

改名成功时提示 OK，失败时候返回一个错误。当 old_key_name 和 new_key_name 相同，或者 old_key_name 不存在时，返回一个错误。当 new_key_name 已经存在时，RENAME 命令将把当前的值覆盖旧的值。
