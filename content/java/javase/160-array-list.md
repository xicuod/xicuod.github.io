---
weight: 160
slug: java-array-list
title: Java ArrayList 类
---

数组的长度无法改变，但 `ArrayList` 的长度可变。

1. `ArrayList` 只能装引用类型，不能装基本类型：能装 `String`，不能装 `int`。
2. 基本类型数据必须装箱后再存入 `ArrayList`，即使用对应的[包装类](../../../Java常用类/Java基本类型的包装类.md)。
3. 一个 `ArrayList` 只能装同类型的包装类对象引用，具体什么类型需要指定 `ArrayList` 的[泛型](../../../Java面向对象/Java泛型.md)。

```java
ArrayList<String> list = new ArrayList<>();
```

- 增：
  - `add(E elememt): boolean`：添加元素，返回是否添加成功，[自动装箱](../../../Java面向对象/Java5自动装拆箱.md)
  - `addAll(Collection<? extends E> c): boolean`：添加参数的所有元素，返回是否添加成功
- 删：`remove(int index): E`：删除指定索引的元素并返回 (删除的元素)
- 改：`set(int index, E element): E`：返回被改的元素
- 查：
  - `get(int index): E`：获取指定索引的元素并返回，[自动拆箱](../../../Java面向对象/Java5自动装拆箱.md)
  - `size(): int`：获取长度并返回
  - `contains(Object o): boolean`：返回元素是否在 `ArrayList` 中
  - `toString()`：`ArrayList` 重写了 `toString` 方法，打印出的不是地址，而是元素内容，列表为空时打印 `[]`

# `ArrayList` 类源码分析

[集合进阶 - 06-ArrayList 源码分析\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV17F411T7Ao/?p=190 "集合进阶-06-ArrayList源码分析\_哔哩哔哩\_bilibili")

`ArrayList` 工作机理：

1. 利用空参创建的集合，在底层创建一个默认长度为 0 的数组
2. 添加第一个元素时，底层会创建一个新的长度为 10 的数组
3. 存满时，会扩容 1.5 倍
4. 如果一次添加多个元素，1.5 倍还放不下，则新创建数组的长度以实际为准

`ArrayList` 底层是个 `Object` 数组，名为 `elementData`。

插入第一个元素 (创建长度为 10 的数组)：

![ArrayList 底层-插入第一个元素](https://img.xicuodev.top/2026/02/75fce3f3b3cf3f1cf6bf7f2791d1f5d5.png "ArrayList 底层-插入第一个元素")

插入第 11 个元素 (扩容为 15)：

![ArrayList 底层-插入第11个元素](https://img.xicuodev.top/2026/02/21a8254f24998c42568b8349592e7202.png "ArrayList 底层-插入第 11 个元素")
