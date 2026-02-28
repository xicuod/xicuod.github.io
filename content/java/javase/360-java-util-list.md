---
weight: 360
slug: java-util-list
title: java.util.List
---

`List` 继承了 `Collection` 的方法。而 `List` 因为有索引，所以多了很多索引操作的方法。

`List` 的实现类：[ArrayList]({{% sref "java-util-array-list" %}})、[LinkedList]({{% sref "java-util-linked-list" %}})

`List` 的方法：

- `void add(int index, E element)` 在指定位置插入指定的元素，原来的元素依次往后移
- `E remove(int index)` 删除指定索引处的元素，返回被删除的元素
- `E remove(Object o)` 删除指定元素，返回被删除的元素
  - 对于基本类型元素的 `List`，需要先手动装箱才能调用该重载
- `E set(int index, E element)` 修改指定索引处的元素，返回被修改的元素
- `E get(int index)` 返回指定索引处的元素

`List` 的遍历：

- 迭代器遍历
- 列表迭代器 `ListIterator` 遍历：比一般迭代器多了一些针对 `List` 集合的方法
  - `hasNext`、`next` 顺序遍历
  - `hasPrevious`、`previous` 逆序遍历 (迭代器指针默认指向 `0` 索引，调用前必须先往后移动指针)
  - `add`、`remove` 迭代时插入或移除，其中迭代时插入是一般迭代器做不到的
- 增强 `for` 遍历
- lambda 表达式遍历
- 普通 `for` 循环 (`List` 集合有索引)

`List` 的遍历方式的选用原则：

- 迭代器遍历时需要删除元素：迭代器
- 迭代器遍历时需要添加元素：列表迭代器
- 仅仅想遍历：增强 `for` 或 lambda 表达式
- 遍历时想操作索引：普通 `for`
