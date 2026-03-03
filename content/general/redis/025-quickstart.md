---
weight: 25
slug: redis-quickstart
title: Redis 快速开始
---

## 使用 `redis-cli`

`redis-cli` 的启动参数：

- `-h` host
- `-p` port
- `-a` auth

## `auth` 和 `ping` 命令

在外面 `-a` 直接输密码有点不安全，因为命令会保存到当前 shell 的历史记录，如果历史记录泄漏了，密码也就泄漏了，所以最好在 `redis-cli` 环境里面输密码，使用 `auth` 命令：

```
127.0.0.1:6379> auth ur-passwd
OK
127.0.0.1:6379> ping
PONG
```

`redis-cli` 不会将 `auth` 命令保存在它的历史记录里面，它只在本次会话中保留 `auth` 记录，会话结束后将删除所有的 `auth` 记录。

## `set` 和 `get` 命令

添加和查询数据：

```
127.0.0.1:6379> set name jack
OK
127.0.0.1:6379> get name
"jack"
127.0.0.1:6379> set age 24
OK
127.0.0.1:6379> get age
"24"
```

## `select` 命令

`select 1` 切换到 `db1` 数据库：

```
127.0.0.1:6379> select 1
OK
127.0.0.1:6379[1]> 
```
