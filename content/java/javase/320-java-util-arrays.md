---
weight: 320
slug: java-util-arrays
title: java.util.Arrays
---

`java.util.Arrays` 类是[数组]({{% sref "java-array" %}})的工具类。由于数组对象本身没有什么方法可供调用，Java API 提供了一个工具类 `Arrays` 以供使用，它可以对数据对象做一些基本的操作。

`Arrays` 类中的方法都是静态方法，使用时可以直接用类名调用，而不必创建对象来调用。

`Arrays` 类的方法：

- `fill` 方法：填充数组
  - `fill(arr, 0)` 全填 0
  - `fill(arr, 2, 6, 0)` 索引 2 到 5 填 0
- `sort` 方法：按升序排序元素
- `equals` 方法：比较两个数组是否相等
- `binarySearch` 方法：查找元素，对有序数组[二分查找]()
