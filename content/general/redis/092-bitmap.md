---
weight: 92
slug: redis-bitmap
title: Redis BitMap 类型
---

Redis BitMap 基于 String 类型数据结构，因此最大上限是 512 MiB，转换为比特则是 $2^{32}$ 位。

BitMap 的操作命令有:

- `SETBIT`：向指定位置 (offset) 存入一个 0 或 1
- `GETBIT`：获取指定位置 (offset) 的比特
- `BITCOUNT`：统计 BitMap 中值为 1 的比特个数
- `BITFIELD`：操作 (查询、修改、自增) BitMap 中比特数组的指定位置 (offset) 开始的一个或多个比特
- `BITFIELD_RO`：read only，获取 BitMap 中比特数组，并以十进制形式返回
- `BITOP`：将多个 BitMap 的结果做位运算 (与、或、异或)
- `BITPOS`：查找比特数组中指定范围内第一个 0 或 1 出现的位置

`BITFIELD key GET encoding offset` 中 `encoding` 是 `u` 无符号或 `i` 有符号和位数组成的编码格式，如 `u8` 就是无符号八位二进制数。


```
1011010100010000
```

```
127.0.0.1:6379> bitfield bm1 get u8 0
1) (integer) 181
127.0.0.1:6379> bitcount bm1
(integer) 4
127.0.0.1:6379> bitpos bm1 0
(integer) 1
```
