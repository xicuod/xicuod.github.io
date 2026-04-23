---
weight: 
slug: c-sharp-common-collections-api
title: C# 常见集合接口
---

下面只列出泛型接口，没有泛型的版本的接口处理数据的逻辑差不多，只是需要装拆箱。

- `IEnumerable<TItem>`：可迭代、可枚举类型
  - `GetEnumerator` 方法：获取迭代器（枚举器）
- `IEnumerator<TItem>`：枚举器，初始不指向任何元素，要调用一次 `MoveNext` 方法启动枚举器
  - `Current` 属性：当前元素，只 `get`
  - `MoveNext` 方法：启动枚举器，让它指向首个元素 (初始)；移动枚举器，让它指向下一个元素 (非初始)
  - `Reset` 方法：重置枚举器到初始状态
- `ICollection<TItem>`：集合
  - `Add` 方法
  - `Remove` 方法
- `IList<TItem>`：列表
  - `[int index]` 索引器：指定索引的元素，`get` 和 `set`
  - `IsFixedSize` 属性：有无固定大小，只 `get`
  - `IsReadOnly` 属性：是否只读，只 `get`
  - `Count` 属性：元素个数，只 `get`
  - `IsSynchronized` 属性
  - `SyncRoot` 属性
  - `Add` 方法
  - `Clear` 方法
  - `Contains` 方法
  - `CopyTo` 方法
  - `GetEnumerator` 方法
  - `IndexOf` 方法
  - `Insert` 方法
  - `Remove` 方法
  - `RemoveAt` 方法
- `IDictionary<TKey, TValue>`：字典
