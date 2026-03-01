---
weight: 440
slug: java-util-map
title: java.util.Map
---

`java.util.Map` 接口是双列集合（映射集合）的顶层接口，它的功能是全部双列集合都可以继承使用的。

双列集合的特性：

- 双列集合的一个元素需要存一对数据，分别为键和值
- 键不能重复，值可以重复
- 键和值是一一对应的，每一个键只能找到自己对应的值
- 键 + 值 = 键值对 = 键值对对象 =(Java 中的) Entry 对象

双列集合的体系结构：

- `java.util.Map` 接口 (←你在这里)
- [Java HashMap 类]()
  - [Java LinkedHashMap 类]() (HashMap 的子类)
- [Java HashTable 类]()
  - [Java Properties 类]() (HashTable 的子类)
- [Java TreeMap 类]()


![Java 双列集合体系结构](https://img.xicuodev.top/2026/02/0c34245f8f6d20b2d1e61f4c6020d2c7.png "Java 双列集合体系结构")

## `Map` 的方法

- `V put(K key, V value)` 添加元素
  - 如果键存在，那么 `put` 方法会覆盖原有的键值对，并返回覆盖的值
  - 如果键不存在，那么 `put` 方法返回 `null`
- `V remove(object key)` 根据键删除键值对元素，返回删除的值
- `void clear()` 移除所有的键值对元素
- `boolean containsKey(object key)` 判断集合是否包含指定的键
- `boolean containsValue(object value)` 判断集合是否包含指定的值
- `boolean isEmpty()` 判断集合是否为空
- `int size()` 集合的长度，也就是集合中键值对的个数

## `Map` 的遍历

1. 键找值遍历：遍历 `keySet` 方法返回的单列集合来遍历键，循环体中调用 `get` 方法来通过键遍历值
   - `keySet` 方法：返回包含 `map` 中所有键的单列集合，引用变量为 `Set` 类型
   - `get` 方法：返回传入键参数的值，键找值，找不到返回 `null`
   - `getOrDefault` 方法：返回传入键参数的值，如果找不到返回传入的默认值
2. 键值对遍历：遍历 `map` 的键值对，循环体中调用 `getKey` 和 `getValue` 方法来遍历键和值
   - `entrySet` 方法：返回包含 `map` 中所有键值对的单列集合，引用变量为 `Set<Map.Entry<K,V>>` 类型，`Entry` 是 `Map` 的内部接口
   - 键值对的 `getKey` 方法：返回键值对的键
   - 键值对的 `getValue` 方法：返回键值对的值
3. lambda 表达式遍历：基于 `default void forEach(BiConsumer<? super K, ? super V> action)` 和 `BiComsumer` 的 `accept(K key, V value)` 方法

## `HashMap` 和 `TreeMap` 常见问题

1. `TreeMap` 元素的键是否需要重写 `hashCode` 和 `equals` 方法？
   - 不需要。`hashCode` 和 `equals` 方法是针对哈希表结构的，而不是树结构。
2. HashMap 的键是否需要实现 `Comparable` 接口或传入比较器对象？
   - 不需要。`HashMap` 默认比较元素的哈希值大小来建立红黑树。
3. `TreeMap` 和 `HashMap` 哪个效率高？
   - 最坏情况下，`HashMap` 哈希碰撞太多时，`TreeMap` 效率更高；一般情况下，`HashMap` 效率更高。
4. `TreeMap` 和 `HashMap` 是否存在不覆盖键重复的元素的方法？
   - 存在。`TreeMap` 和 `HashMap` 都重写了 `Map` 接口的 `putIfAbsent` 方法，如果键不存在就插入，如果键存在就不插入（不覆盖原有值）。
   - 程序设计思想：如果代码中出现变量可以控制逻辑的 AB 两面，那么该逻辑除了 A 面，一定有 B 面。`boolean` 控制的逻辑一般只有 AB 两面，`int` 控制的逻辑一般至少有三面，如正负零三面。

## 双列集合选用原则

- 默认：`HashMap` (效率最高)
- 如果要保证存取有序：`LinkedHashMap`
- 如果要排序：`TreeMap`
