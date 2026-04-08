---
weight: 160
slug: redis-best-move
title: Redis 最佳实践
---

## key：优雅的 key 结构

`[业务名]:[实体名]:[id]`；长度不超过44字节；不包含特殊字符；如`login:user:10`；

优点：可读性强；避免key冲突；方便管理；更节省内存，key是string类型，底层编码包括int、embstr和raw，小于44字节使用embstr，采用连续内存空间，占用小；

## value：拒绝 BigKey

bigkey是占用内存特别大的key，有三种情况：key本身数据量过大；key中成员个数过多；key中成员的数据量过大；

推荐：单个key的value不超过10KiB；集合key的元素个数不超过1000；

`MEMORY USAGE`命令查看key占用内存：不推荐用它，吃cpu；实际只要估计一个数值：如用`STRLEN`查看string的字符个数，用`LLEN`查看list的元素个数，看这些可以反映内存占用的指标即可；

```
# bad move
127.0.0.1:6379> memory usage cache:shop:4
(integer) 696
```

```
# good move
127.0.0.1:6379> type cache:shop:4
string
127.0.0.1:6379> strlen cache:shop:4
(integer) 623
```

bigkey问题：网络阻塞，少量qps就会导致带宽占满，如20qps，key=5MiB，就占用带宽100MiB；数据倾斜，bigkey所在实例内存占用远超其他实例，无法通过分片均衡分布内存；redis阻塞，元素太多耗时很长，阻塞主线程；cpu压力大，序列化和反序列化计算量大；

找到bigkey：

- 客户端程序：`redis-cli -a ur-passwd --bigkeys`；
- 客户端命令：`SCAN cursor [MATCH pattern] [COUNT count] [TYPE type]` 迭代器慢扫，一次只扫一小部分，环形迭代，归0就是扫完了；cursor游标，从迭代位置的偏移量，从0开始；用strlen hlen llen scard zcard检查key的大小；自己在java或lua中写工具方法，在从节点循环用scan查bigkey；
- 第三方工具：redis-rdb-tools 离线分析rdb快照文件，全面分析占用情况，时效性差一些；
- 网络监控：监控进出redis的网络流量，超出阈值主动告警；

删除bigkey：占用大删除也慢，导致阻塞主线程；正确删法：3.0 前（含）：对于集合就逐个删除元素，最后删整个key，hscan sscan zscan慢扫集合的元素；4.0 起：UNLINK 异步删除，不会阻塞主线程；

## value：设计恰当的数据类型

存一个user对象：json方式，字段打散分别存key方式，hash方式；json简单但不灵活；字段打散灵活但占用大，不内聚；hash灵活，底层ziplist占用小，但代码相对复杂；推荐hash；

一个hash中有100万对`field-value` entry，`field`是自增id，从`id:0`到`id:999999`，问题和解决？hash的entry超过500个会使用哈希表而不是ziplist，占用大；现在实测大小62MiB；

解决1：hash-max-ziplist-entries配置，但是bigkey本身就是问题，这个值不要超过1000；

```
127.0.0.1:6379> config get hash-max-ziplist-entries
1) "hash-max-ziplist-entries"
2) "512"
```

解决2：彻底打散；解决bigkey，但string优化不佳占用大，且批量获取麻烦；实测占用77MiB，还多了；

解决3：拆为许多小hash，id/100为key，id%100为field，每100个元素存一个hash；类比操作系统的二级页表，遇事不决加一层；实测占用24MiB，小多了；

## lua：批处理优化

