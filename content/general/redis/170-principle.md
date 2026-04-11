---
weight: 170
slug: redis-principle
title: Redis 原理
---

## Redis 数据结构

### 动态字符串 sds

redis中所有顶层数据结构都是字符串或字符串的集合；字符串是最常用的；但red没用c的字符串，因为它：本质字符数组，连续内存空间，获取长度需要计算；非二进制安全；不可修改；

因此red自己实现了简单动态字符串 simple dynamic string, sds；结构体，len 已用的字节，alloc 分配的字节（不含`\0`），flags 型号；

![动态字符串 sds](https://img.xicuodev.top/2026/04/8861b106558b8b131fcfa535ae3d63c0.png "动态字符串 sds")

- 如果新字符串小于1M，则新空间为扩展后字符串长度的两倍+1；
- 如果新字符串于1M，则新空间为扩展后字符串度+1M+1；
- 称为**内存预分配**；

sds优点：获取字符串长度的时间复杂度为O(1)；支持动态扩容；减少内存分配次数；根据len读取，二进制安全；可以存任意字节序列；

### intset



### dict

### ziplist

### quicklist

### 跳表skiplist

### redisobject

### 五种数据结构

## Redis 网络模型

## Redis 通信协议

## Redis 内存策略
