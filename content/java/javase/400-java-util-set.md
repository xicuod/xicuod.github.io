---
weight: 400
slug: java-util-set
title: java.util.Set
---

`java.util.Set` 的特征：

- 无序：存取顺序不一致
- 不重复：可以去除重复，重复添加元素会添加失败
- 无索引：没有带索引的方法，所以不能使用普通 `for` 循环遍历，也不能通过索引来获取元素

`java.util.Set` 的实现类：

- [`java.util.HashSet`]()：无序、不重复、无索引
- [`java.util.LinkedHashSet`]()：有序、不重复、无索引，HashSet 的子类
- [`java.util.TreeSet`]()：可排序、不重复、无索引

`Set` 的方法基本与 `Collection` 一致：`add`、`remove`、`clear`、`contains`、`isEmpty` 和 `size`。

`java.util.Set` 的遍历：

- 迭代器
- 增强 `for`
- lambda 表达式
