---
weight: 160
slug: redis-best-move
title: Redis 最佳实践
---

## key：设计优雅的 key 结构

`[业务名]:[实体名]:[id]`；长度不超过 44 字节；不包含特殊字符；如 `login:user:10`；

优点：可读性强；避免 key 冲突；方便管理；更节省内存，key 是 string 类型，底层编码包括 int、embstr 和 raw，小于 44 字节使用 embstr，采用连续内存空间，占用小；

## value：拒绝 BigKey

bigkey 是占用内存特别大的 key，有三种情况：key 本身数据量过大；key 中成员个数过多；key 中成员的数据量过大；

推荐：单个 key 的 value 不超过 10KiB；集合 key 的元素个数不超过 1000；

`MEMORY USAGE` 命令查看 key 占用内存：不推荐用它，吃 cpu；实际只要估计一个数值：如用 `STRLEN` 查看 string 的字符个数，用 `LLEN` 查看 list 的元素个数，看这些可以反映内存占用的指标即可；

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

bigkey 问题：网络阻塞，少量 qps 就会导致带宽占满，如 20qps，key=5MiB，就占用带宽 100MiB；数据倾斜，bigkey 所在实例内存占用远超其他实例，无法通过分片均衡分布内存；redis 阻塞，元素太多耗时很长，阻塞主线程；cpu 压力大，序列化和反序列化计算量大；

找到 bigkey：

- 客户端程序：`redis-cli -a ur-passwd --bigkeys`；
- 客户端命令：`SCAN cursor [MATCH pattern] [COUNT count] [TYPE type]` 迭代器慢扫，一次只扫一小部分，环形迭代，归 0 就是扫完了；cursor 游标，从迭代位置的偏移量，从 0 开始；用 strlen hlen llen scard zcard 检查 key 的大小；自己在 java 或 lua 中写工具方法，在从节点循环用 scan 查 bigkey；
- 第三方工具：redis-rdb-tools 离线分析 rdb 快照文件，全面分析占用情况，时效性差一些；
- 网络监控：监控进出 redis 的网络流量，超出阈值主动告警；

删除 bigkey：占用大删除也慢，导致阻塞主线程；正确删法：3.0 前 (含)：对于集合就逐个删除元素，最后删整个 key，hscan sscan zscan 慢扫集合的元素；4.0 起：UNLINK 异步删除，不会阻塞主线程；

## value：设计恰当的数据类型

存一个 user 对象：json 方式，字段打散分别存 key 方式，hash 方式；json 简单但不灵活；字段打散灵活但占用大，不内聚；hash 灵活，底层 ziplist 占用小，但代码相对复杂；推荐 hash；

一个 hash 中有 100 万对 `field-value` entry，`field` 是自增 id，从 `id:0` 到 `id:999999`，问题和解决？hash 的 entry 超过 500 个会使用哈希表而不是 ziplist，占用大；现在实测大小 62MiB；

解决 1：hash-max-ziplist-entries 配置，但是 bigkey 本身就是问题，这个值不要超过 1000；

```
127.0.0.1:6379> config get hash-max-ziplist-entries
1) "hash-max-ziplist-entries"
2) "512"
```

解决 2：彻底打散；解决 bigkey，但 string 优化不佳占用大，且批量获取麻烦；实测占用 77MiB，还多了；

解决 3：拆为许多小 hash，id/100 为 key，id%100 为 field，每 100 个元素存一个 hash；类比操作系统的二级页表，遇事不决加一层；实测占用 24MiB，小多了；

## Redis 批处理优化

单个命令执行时长 = 1 次往返网络传输耗时 + 1 次 redis 执行命令耗时；网络的数量级是毫秒，执行命令的数量级是微秒，它们之前差了三个数量级 (1ms=1000μs)；网络传输占大头，少量多次比多量少次做了更多的网络传输的无用功，所以批量更好；

但是一次批处理数据太多占用网络带宽过高，导致网络阻塞也不好，所以要适量的多；插入 10 万条，分成 100 次 1000 条执行就好；

- 解决 1：m 操作；redis 提供的 mset hmset sadd 等等命令都可以批量插入数据，就不需要分成好多次 set 命令了；但这些命令都具有局限性，pipeline 则更灵活；
- 解决 2：pipeline，用于大量复杂数据操作复杂业务复杂需求；pipeline 支持 set hset lpush sadd zadd 等等，一切命令都能做；但简单的操作要比 m 操作更慢，所以两者要结合使用；

注意：m 操作是原子操作，但 pipeline 不是，这一组命令之间可以有别的客户端插队；

集群下的批处理：m 和 pipeline 这样的批处理的 key 必须落在同一个插槽，否则跨节点批处理意味着需要分布式协调，会加大复杂度，破坏 redis 集群 各节点独立 去中心化 高性能 的设计；

- 解决 1：串行命令，大大方方 for 循环，给到拉完了；
- 解决 2：串行 slot，先算好 slot，同一个 slot 放一起批处理，给到 NPC；
- 解决 3：并行 slot，串行 slot 的并行版本，性能更好，给到人上人；
- 解决 4：hash_tag，就是用有效部分 {} 保证 key 的 slot 一样，但会造成数据倾斜，综合给到 NPC；

对于 java redis 客户端，jedis 没实现集群批处理，lettuce 则实现了，它维护一个 slot 到 key 的 map，按 slot 分组批处理，且用到 Future 类，是并行 slot；

## Redis 服务端优化

### 持久化配置

redis 两种持久化 rdb 和 aof，因为开销大，须遵守：

- 缓存实例尽量不要持久化，分布式锁、订单流水等业务实例需要持久化；
- 建议关闭 rdb，使用 aof，rdb 间隔长，性能差，安全差；
- 用脚本定期在 replica 做 rdb，用于备份；
- 设置合理 rewrite 阈值，避免频繁 bgrewrite 重写；aof 重写是剔除中间命令，重新生成只包含最终命令的 aof；
- `no-appendfsync-on-rewrite = yes`，禁止 rewrite 时 aof 从而导致阻塞；如果 aof 耗时过长，主线程会等 aof，所以最好禁止 fsync 跟 rewrite 抢硬盘 IO；但是这样 rewrite 期间的数据就不能 fsync 到硬盘里了，得到了性能但安全性下降；

部署建议：

- redis 实例物理机预留足够内存，用于 fork 和 rewrite；
- 单个 redis 实例内存上限不要太大，最好 4g 或 8g，单机多实例更好，可加快 fork，减少主从同步和数据迁移的压力；
- redis 持久化吃 cpu，不要与吃 cpu 的应用部署在一起，如 es；
- redis 持久化吃硬盘，不要与吃硬盘的应用部署在一起，如数据库、消息队列；

### 慢查询优化

redis 执行耗时超过某个阈值命令都叫慢查询；配置项：`slowlog-log-slower-than` 阈值，单位 μs，默认 10000 (10ms)，建议 1000 (1ms)；命令：`slowlog-max-len`慢查询日志队列长度，默认128，建议1000；`slowlog len` 日志长度，`slowlog get [n]` 读取n条日志，`slowlog reset` 清空日志；

```sh
127.0.0.1:6379> slowlog get 1
1) 1) (integer) 0 # 日志编号
   2) (integer) 1775276048 # 日志加入时间戳
   3) (integer) 14378 # 命令耗时
   4) 1) "hello" # 命令
      2) "2"
      3) "auth"
      4) "(redacted)"
      5) "(redacted)"
   5) "127.0.0.1:63538" # 客户端ip
   6) "" # 客户端名
```

### 命令和安全配置

redis绑定0.0.0.0暴露公网，如果没有身份验证，会有安全漏洞，可以通过redis持久化方式把攻击者的公钥放到.ssh/authorized_keys文件中，使攻击者可以用ssh免密登录你的Linux服务器，参考[这篇文章](https://cloud.tencent.com/developer/article/1039000)。

redis设密码，足够复杂；禁止线上使用keys flushall flushdb  config set等命令，使用rename-command配置禁用；bind配置禁止外网网卡访问；开启服务器防火墙；不要用root启动redis；尽量不要用默认端口6379；

```
127.0.0.1:6379> config get bind
1) "bind"
2) "127.0.0.1 ::1"
```

### 内存配置

redis内存不足导致key频繁删除 响应变慢 qps不稳定等，当内存占用达到90%以上就要警惕，必须快速定位问题根源；

redis内存组成：

- 数据内存：最主要，问题：bigkey 内存碎片（定期重启redis可解决）；
- 进程内存：代码 常量池，大约几MiB，大多数生产环境与数据内存相比可忽略；
- 缓冲区内存：客户端缓冲区 aof缓冲区 复制缓冲区等，客户端缓冲区：输入缓冲区 输出缓冲区，波动大，若有bigkey可能导致内存溢出。在redis主从全量同步章节提到过客户端输出缓冲区，用于存放rdb同步时堆积的命令。

`info memory` `memory stats`查看内存分配情况；总内存 进程内存 峰值内存 数据内存等；参考 [info命令输出参数解释-知乎](https://zhuanlan.zhihu.com/p/78297083)。

```sh
127.0.0.1:6379> info memory
# Memory
used_memory:945408832               # 使用内存（B）
used_memory_human:901.61M           # 使用内存（MiB）  
used_memory_rss:1148919808          # 系统给redis分配的内存（即常驻内存），
                                    # 这个值和top命令的输出一致
used_memory_rss_human:1.07G
used_memory_peak:1162079480         # 内存使用的峰值
used_memory_peak_human:1.08G        
total_system_memory:6136483840      # 整个系统内存
total_system_memory_human:5.72G
used_memory_lua:122880              # Lua脚本存储占用的内存
used_memory_lua_human:120.00K       
maxmemory:2147483648                # Redis实例的最大内存配置
maxmemory_human:2.00G
maxmemory_policy:allkeys-lru        # 当达到maxmemory时的淘汰策略
mem_fragmentation_ratio:1.22        # used_memory_rss:used_memory的比例
                                    # 一般情况下，used_memory_rss略高于used_memory，
                                    # 当内存碎片较多时，mem_fragmentation_ratio较大，
                                    # 可以反映内存碎片是否很多
mem_allocator:jemalloc-4.0.3        # 内存分配器
```

内存缓冲区：

- 复制积压缓冲区：用于主从增量同步，repl_backlog_buf，环形队列fifo，太小导致频繁全量复制，`repl-backlog-size`配置大小，默认1mb；
- aof缓冲区：aof刷盘之前的缓存，7.0之后也是aof重写的缓冲区，没有上限；
- 客户端缓冲区：分为输入缓冲区 输出缓冲区，输入缓冲区上限1g不能设置，输出缓冲区又叫复制缓冲区，用于主从全量同步第三阶段的堆积同步，和平时的实时同步命令传播，上限可设置`client-output-buffer-limit`；

```
127.0.0.1:6379> config get repl-backlog-size
1) "repl-backlog-size"
2) "1048576"
127.0.0.1:6379> config get client-output-buffer-limit
1) "client-output-buffer-limit"
2) "normal 0 0 0 slave 268435456 67108864 60 pubsub 33554432 8388608 60"
```

`client-output-buffer-limit`：`<class> <hard limit> <soft limit> <soft seconds>`，三种class：normal relica pubsub都要配置limit；超过hard limit时立即断开客户端；超过soft limit持续soft seconds秒时断开客户端；

- `normal 0 0 0` 没有上限；
- `slave 268435456 67108864 60` hard=256mb, soft=64mb 60s；
- `pubsub 33554432 8388608 60` hard=32mb, soft=8mb 60s；

`client list`列出连接的客户端的详细信息，`omem=0`就是输出缓冲区；

```
127.0.0.1:6379> client list
id=54 addr=127.0.0.1:62178 laddr=127.0.0.1:6379 fd=11 name= age=16947 idle=0 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 watch=0 qbuf=26 qbuf-free=16864 argv-mem=10 multi-mem=0 rbs=1024 rbp=0 obl=0 oll=0 omem=0 tot-mem=18746 events=r cmd=client|list user=default redir=-1 resp=2 lib-name= lib-ver= io-thread=0
id=56 addr=127.0.0.1:51231 laddr=127.0.0.1:6379 fd=12 name= age=14543 idle=14543 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 watch=0 qbuf=0 qbuf-free=0 argv-mem=0 multi-mem=0 rbs=1024 rbp=0 obl=0 oll=0 omem=0 tot-mem=1824 events=r cmd=select user=default redir=-1 resp=2 lib-name= lib-ver= io-thread=0
id=57 addr=127.0.0.1:51166 laddr=127.0.0.1:6379 fd=10 name= age=1543 idle=3 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 watch=0 qbuf=0 qbuf-free=0 argv-mem=0 multi-mem=0 rbs=1024 rbp=0 obl=0 oll=0 omem=0 tot-mem=1824 events=r cmd=info user=default redir=-1 resp=2 lib-name= lib-ver= io-thread=0
```

## Redis 集群最佳实践

### 集群完整性问题

默认只要一个插槽坏了，则整个集群停止对外服务；为了保证高可用特性，建议禁用“集群要求全覆盖”`cluster-require-full-coverage no`，让亚健康状态的集群也能完成力所能及的工作；

### 集群带宽问题

集群节点互相ping心跳确定对方状态，携带插槽信息、集群状态信息；节点多ping携带信息也多，10个节点信息量可能1kb，带宽要求过高；解决：避免大集群，节点最好少于1000，越少越好，业务庞大则多弄几个集群；避免单个物理机部署过多实例；配置合理`cluster-node-timeout`主观下线超时阈值；

### 集群还是主从

集群高可用，故障转移，但使用不当会导致：集群完整性 带宽 数据倾斜 客户端性能 批处理命令的集群兼容性 lua和事务问题；代价大；

建议：当前已经满足业务需求，能不用就不用集群，单体（主从）已经能到万级别qps，高可用也很强；
