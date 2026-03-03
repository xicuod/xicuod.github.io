---
weight: 45
slug: redis-string
title: Redis String 类型
---

`String` 类型就是字符串类型，是 Redis 中最简单的存储类型。字符串类型的 `value` 根据字符串格式的不同，还可以分为三类：

- `string`：普通字符串，`hello`
- `int`：整数字符串，可以自增自减，如 `10`
- `float`：浮点字符串，可以自增自减，如 `92.5`

为了节省空间，对于数字字符串，Redis 会把数字直接转为二进制（`int` 编码）存储；对于一般字符串，只能按照特定编码存储。对于 Redis 字符串的[编码方式]({{% sref "redis-encoding" %}})，具体来说：

- `int`：64 位有符号整数范围内的，使用 `int` 编码
- `string`：这里的字符串已经是经过客户端字符编码（通常是 UTF-8）后的二进制形式
  - 长度在 44 字节以内（含）的，用 `embstr` 编码
  - 长度大于 44 字节的，用 `raw` 编码
- `float`：作为 `string` 保存，编码同 `string`

不管是那种格式的字符串，底层都是**字节数组**的形式存储，只不过编码方式不同。字符串类型的最大长度不能超过 512m。

## `String` 类型常见命令

> [!note] 注
>
> 当说“`Type` 类型的键值对”时，指的是这个键值对的 `key` 是 `Type` 类型。

- `SET`：添加或修改一个 `String` 类型的键值对
- `GET`：根据 `key` 获取 `String` 类型的 `value`
- `MSET`：批量添加或修改 `String` 类型的键值对
- `MGET`：根据多个 `key` 批量获取多个 `String` 类型的 `value`
- `INCR`：让一个整数字符串类型的 `value` 自增 1，返回自增后的值
- `INCRBY`：让一个整数字符串类型的 `value` 自增指定步长，返回自增后的值
- `INCRBYFLOAT`：让一个浮点数字符串类型的 `value` 自增指定步长，返回自增后的值
- `SETNX`：如果 `key` 不存在则添加一个 `String` 类型的键值对，成功返回 1，失败返回 0
- `SETEX key expire value`：添加或修改一个 `String` 类型的键值对并指定有效期

上面的命令如果没有说明失败返回什么值，则失败直接报错。

特别地：

- `INCR` 传入负数就是自减，当然也有专门自减的 `DECR` 但是一般用 `INCR` 就行了。
- 像 `SETNX` 和 `SETEX` 这种**组合命令**，都可以拆开来用：`SET key value NX` 和 `SET key value EX seconds`。
