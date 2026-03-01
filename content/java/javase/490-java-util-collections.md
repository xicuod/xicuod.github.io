---
weight: 490
slug: java-util-collections
title: java.util.Collections
---

`java.util.Collections` 类是[单列集合]({{% sref "java-util-collection" %}})和[双列集合]({{% sref "java-util-map" %}})的工具类。

`Collections` 针对单列集合的工具方法：

- `<T> boolean addAll(Collection<T>c, T...elements)` 批量添加元素
- `void shuffle(List<?> list)` 打乱 `List` 集合元素的顺序
- `<T> void sort(List<T> list)` 排序
- `<T> void sort(List<T> list, Comparator<T> c)` 根据指定的规则排序
- `<T> int binarySearch(List<T> list, T key)` 以二分查找法查找元素
- `<T> void copy(List<T> dest, List<T> src)` 拷贝集合中的元素
- `<T> int fill (List<T> list, T obj)` 使用指定的元素填充集合
- `<T> void max/min(Collection<T> coll)` 根据默认的自然排序获取最大（小）值
- `<T> void swap(List<?> list, int i, int j)` 交换集合中指定位置的元素


同时，`Collections` 也包含部分针对双列集合的工具方法，例如返回空 `Map` 的 `emptyMap()`、返回单键值对 `Map` 的 `singletonMap()`，以及对现有 `Map` 做同步包装的 `synchronizedMap()` 等方法。
