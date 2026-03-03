---
weight: 90
slug: redis-zset
title: Redis SortedSet 类型
---

Redis 的 `SortedSet` 是一个可排序的 `set` 集合，与 Java 的 [`TreeSet`]({{% sref "java-util-tree-set" %}}) 类似，但底层的数据结构差别很大。`SortedSet` 因为可排序，常用于排行榜。

`SortedSet` 的元素都带有一个 `score` 属性，可以基于 `score` 属性对元素排序，底层实现是一个跳表 (`SkipList`) 加上一个 `hash` 表。

- 可排序
- 元素不重复
- 查询快

## `SortedSet` 类型的常见命令

- `ZADD key score member [score member ...]`：向 sorted set 中添加一个或多个元素，如果元素已经存在则更新其 `score` 值
- `ZREM key member [member ...]`：移除 sorted set 中的一个或多个指定元素
- `ZSCORE key member`：获取 sorted set 中指定元素的 `score` 值
- `ZRANK key member`：获取 sorted set 中指定元素的排名（按 `score` 从小到大排序）
- `ZCARD key`：获取 sorted set 中的元素个数
- `ZCOUNT key min max`：统计 `score` 值在给定范围内的所有元素的个数
- `ZINCRBY key increment member`：为 sorted set 中指定元素的 `score` 值增加指定的步长（`increment`）
- `ZRANGE key start stop [WITHSCORES]`：按照 `score` 从小到大排序后，获取指定排名范围内的元素
- `ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]`：按照 `score` 从小到大排序后，获取指定 `score` 范围内的元素
- `ZDIFF`：求多个 sorted set 的差集
- `ZINTER`：求多个 sorted set 的交集
- `ZUNION`：求多个 sorted set 的并集

`ZADD` 命令是 `score` 在前，`member` 在后，注意不要弄反了。`ZRANK` 的排名是从 0 开始的。

以上命令默认都是升序排列，如果要降序排列，则要在命令的 `Z` 后加 `REV`，如 `ZREVRANGE`。

```
127.0.0.1:6379> zadd stus 82 rose 85 jack 89 lucy 95 tom 78 jerry 92 amy 76 miles
(integer) 6
127.0.0.1:6379> zrange stus 0 -1
1) "miles"
2) "jerry"
3) "rose"
4) "jack"
5) "lucy"
6) "amy"
7) "tom"
127.0.0.1:6379> zrevrange stus 0 3
1) "tom"
2) "amy"
3) "lucy"
4) "jack"
127.0.0.1:6379> zrem stus tom
(integer) 1
127.0.0.1:6379> zrevrange stus 0 3
1) "amy"
2) "lucy"
3) "jack"
4) "rose"
127.0.0.1:6379> zrevrank stus rose
(integer) 3
```
