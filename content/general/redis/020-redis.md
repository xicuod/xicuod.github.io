---
weight: 20
slug: redis-redis
title: Redis 简介
---

Redis 诞生于 2009 年，全称 Remote Dictionary Server，远程词典服务器，是一个基于内存的键值型 NoSQL 数据库。Redis 的开发者是来自意大利的 Salvatore Sanfilippo aka. Antirez。Redis 是基于 C 语言编写的。

- 键值型，值支持多种不同的数据结构，功能丰富
- 单线程，每个命令具备原子性
- 低延迟，速度快（基于内存，IO 多路复用，良好的编码）
- 支持数据持久化
- 支持主从集群、分片集群
- 支持多编程语言客户端

> [!tip] Redis 为什么这么快？
> 
> Redis 和关系型数据库最核心的区别就是它跑在内存上，其他的无论是 IO 多路复用还是良好的编码，关系型数据库也能做到，但是它们把数据存在了磁盘上，这是最大的硬伤。
