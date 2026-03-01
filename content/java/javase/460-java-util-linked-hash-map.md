---
weight: 460
slug: java-util-linked-hash-map
title: java.util.LinkedHashMap
---

`LinkedHashMap` 特点：有序、不重复、无索引（由键决定）。

- 有序：保证存储和取出的元素顺序一致。
- 原理：底层数据结构依然是哈希表，只是每个键值对元素又额外的多了一个[双链表]()的机制记录存储的顺序。
