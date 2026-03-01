---
weight: 500
slug: java-immutable-collection
title: Java 不可变集合
---

不可变集合只能查询，不能增删改。每种集合类型都有获取其不可变集合的静态方法：

- `List.of()` 方法：接收多个元素参数，或接收元素的可变参数，返回不可变 `List` 集合
- `Set.of()` 方法：接收多个元素参数，或接收元素的可变参数，返回不可变 `Set` 集合
- `Map.of()` 方法：接收最多 10 对键值参数，返回不可变 `Map` 集合
- `Map.ofEntries()` 方法：接收键值对的可变参数，返回不可变 `Map` 集合
- `Map.copyOf()` 方法：Java 10 返回 `Map` 集合参数的不可变副本

可变参数的底层是数组，因此可以直接传数组。`Map.copyOf()` 方法的底层就是 `Map.ofEntries(map.entrySet().toArray(new Map.Entry[0])`。

- `Set` 的带参 `toArray()` 方法会比较主调的 `set` 对象和传入 `array` 对象的长度，如果长度合适就直接用传入的 `array` 完成转换，不合适就新建一个同类型的 `array`。一般用它来获取指定类型的数组，直接传入一个指定类型的空数组即可。
- `Set` 的无参 `toArray()` 方法返回的是 `Object[]` 类型，不符合当前需求。
