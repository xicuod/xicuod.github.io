---
weight: 510
slug: java-util-stream
title: java.util.stream
---

**`Stream` 流**类似工厂的流水线，它在设计时使用的是**管道-过滤器**思想。`java.util.stream` 包中包含了所有 `Stream` 流的类。

- 过滤器之间由管道相连，数据在“流”过管道-过滤器的过程中筛选、加工和处理。
- `Stream` 流结合了 lambda 表达式，简化集合、数组的操作。

`Stream` 流方法的分类：

- 中间方法：方法调用完毕之后，还可以调用其他方法 (过滤、转换)
- 终结方法：最后一步，调用完毕之后，不能调用其他方法 (统计、打印)

`Stream` 流使用步骤：

1. 先得到一条 `Stream` 流 (流水线)，并把数据放上去
2. 利用 `Stream` 流中的 API 做各种操作
   1. 使用中间方法操作流水线上的数据
   2. 使用终结方法操作流水线上的数据

## `Stream` 流获取方法

- `Stream` 方法：获取集合的 `Stream` 流
  - 单列集合：`Collection` 接口静态方法
  - 双列集合：无法直接使用 `Stream` 流，先要用 `keySet` 或 `entrySet` 方法获取单列集合
  - 数组：[`Arrays` 工具类]({{% sref "java-util-arrays" %}})的静态方法
  - 同类型零散数据：`Stream` 接口的静态方法 `of()`，接收可变参数

## `Stream` 流中间方法

`filter`、`limit`、`skip`、`distinct`、`concat`、`map`

- `Stream<T> filter(Predicate<? super T> predicate)` 过滤，接收返回 `boolean` 的 lambda 表达式，过滤出符合要求的数据
- `Stream<T> limit(long maxSize)` 获取前 `maxSize` 个元素
- `Stream<T> skip(long n)` 跳过前 `n` 个元素
- `Stream<T> distinct()` 元素去重，底层是 `HashSet`，依赖 `hashCode` 和 `equals` 方法
- `static <T> Stream<T> concat(Stream a, Stream b)` 合并 `a` 和 `b` 两个流为一个流，存在类型提升，不同类的流会提升为共同的父类流，无法调用子类特有方法
- `Stream<R> map(Function<T,R> mapper)` 转换流中的数据类型

1. 中间方法返回新的 `Stream` 流，同时释放旧的流，因此旧的流只能使用一次，建议使用链式编程
2. 修改 `Stream` 流中的数据不会影响原来的集合或数组中的数据

## `Stream` 流终结方法

`forEach`、`count`、`toArray`、`collect`

- `void forEach(Consumer action)` 遍历
- `long count()` 统计
- `toArray()` 收集流中的数据，放到数组中
  - 空参 `toArray` 方法返回 `Object[]`
  - 带参 `toArray` 方法返回指定引用类型数组，接收一个接收 `int value` 参数，返回长度为 `value` 的指定引用类型数组的 lambda 表达式：`toArray(length->new Integer[length])`
    - 传入 lambda 的原理：带参 `toArray` 方法接收实现函数式接口 `IntFunction<? extends Object[]>` 的 `apply(int value)` 方法的匿名内部类实例，相当于接收一个接收 `int value` 返回指定引用类型数组的 lambda 表达式
    - 由于参数列表和返回值一致，可以直接传入数组的构造方法的[方法引用]({{% sref "java-method-reference" %}})
- `collect(Collector collector)` 收集流中的数据，放到集合中
  - `Collectors.toList()` 方法返回 `List` 的 `Collector` (收集器)，`List` 会保证有序。
  - `Collectors.toSet()` 方法返回 `Set` 的收集器，`Set` 会自动去重。
  - `Collectors.toMap(Function<源类型,键类型>,Function<源类型,值类型>)` 返回 `Map` 的收集器。把流中数据收集到 `Map` 集合中时，键不能有重复。
