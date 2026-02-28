---
weight: 370
slug: java-util-linked-list
title: java.util.LinkedList
---

`LinkedList` 底层的数据结构是[双向链表]()，查询慢，增删快，但是如果操作的是首尾元素，速度也是极快的。`LinkedList` 本身多了很多直接操作首尾元素的特有 API。

`LinkedList` 特有方法：首尾操作

- `void addFirst(E e)` 在该列表开头插入指定的元素
- `void addLast(E e)` 将指定的元素追加到此列表的末尾
- `E getFirst()` 返回此列表中的第一个元素
- `E getLast()` 返回此列表中的最后一个元素
- `E removeFirst()` 从此列表中删除并返回第一个元素
- `E removeLast()` 从此列表中删除并返回最后一个元素

`LinkedList` 底层：

- `LinkedList`：头节点 `first`、尾节点 `last`
- `Node` 节点：数据 `item`、前节点 `prev`、后节点 `next`
- `add` 方法：调用 `linkLast` 方法
- `linkLast` 方法：尾插法
  1. 保留旧的尾节点 `l`
  2. 构建新的尾节点 `newNode`
  3. 更新 `last`，指向 `newNode`
  4. 第一个节点 (旧的尾节点 `l` 为 `null`)：`first` 指向 `newNode`
  5. 之后的节点：旧的尾节点 `l.next` 指向 `newNode`
  6. 更新长度 `size` 和 `modCount`

![LinkedList 底层-插入元素](https://img.xicuodev.top/2026/02/0bd6cb8dd73d54bf33281f01d2690c09.png "LinkedList 底层-插入元素")
