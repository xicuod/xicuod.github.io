---
weight: 420
slug: java-util-linked-hash-set
title: java.util.LinkedHashSet
---

`LinkedHashSet` 特点：有序、不重复、无索引。

- 有序：存储和取出元素的顺序一致。
- 原理：底层数据结构是依然哈希表，只是每个元素又额外的多了一个双链表和头尾指针的机制记录存储的顺序，取出时从头节点沿双向链表遍历，还能从尾节点逆向遍历。

![LinkedHashSet 有序的实现原理-双向链表](https://img.xicuodev.top/2026/02/7eb476a0fc0639902bebddd01ed4076a.png "LinkedHashSet 有序的实现原理-双向链表")

`LinkedHashSet` 应用：

- 只去重，默认使用 `HashSet`；去重+有序，才使用 `LinkedHashSet`。
- `LinkedHashSet` 要多维护一个双链表，效率较低，不优先使用。
