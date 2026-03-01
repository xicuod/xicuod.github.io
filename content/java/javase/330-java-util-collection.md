---
weight: 330
slug: java-util-collection
title: java.util.Collection
---

`java.util.Collection` 接口是所有单列集合的顶层接口，它的功能是所有单列集合都可以继承使用的。

> [!note] Java 集合（包括单列集合和双列集合）只能处理引用类型数据，基本类型数据会自动装箱。

## 单列集合的体系结构

![Java 单列集合体系结构](https://img.xicuodev.top/2026/02/3841948776578a0d6af1c2711cb9c681.png "Java 单列集合体系结构")

- `java.util.Collection` 接口 (←你在这里)
  - [`java.util.List`]({{% sref "java-util-list" %}}) 接口
    - [`java.util.ArrayList`]({{% sref "java-util-array-list" %}})
    - [`java.util.LinkedList`]({{% sref "java-util-linked-list" %}})
  - [`java.util.Set`]() 接口
    - [`java.util.HashSet`]()
      - [`java.util.LinkedHashSet`]() (`HashSet` 的子类)
    - [`java.util.TreeSet`]()

`List` 和 `Set` 的区别：

- `List` 接口：有索引，有序，可重复
- `Set` 接口：无索引，无序，不可重复

## 单列集合的选用原则

1. 默认 `ArrayList`
2. 可重复 + 增删操作明显多于查询 `LinkedList`
3. 去重 `HashSet`
4. 去重 + 保证存取顺序 `LinkedHashSet`
5. 去重 + 排序 `TreeSet`

## `Collection` 接口的方法

- `boolean add (E e)` 把给定的对象添加到当前集合中
  - `Set` 集合不允许重复，`add` 可能返回 `false`；`List` 集合允许重复，`add` 永远返回 `true`
- `void clear()` 清空集合中所有的元素
- `boolean remove (E e)` 把给定的对象在当前集合中删除
- `boolean contains (object obj)` 判断当前集合中是否包含给定的对象
  - 底层依赖 `equals` 方法实现，如果存自定义对象，就必须在 [Java Bean]({{% sref "java-bean" %}}) 重写 `equals` 方法
  - 如果存的是自定义对象且没有重写 `equals` 方法，那么默认使用 `object` 类的 `equals` 方法，而该方法比较的是地址值
- `boolean isEmpty()` 判断当前集合是否为空，底层为 `size==0`
- `int size()` 返回集合中元素的个数 = 集合的长度
- `Iterator<E> iterator()` 返回一个当前集合对象的迭代器

## `Collection` 接口的遍历

- [迭代器]({{% sref "java-util-iterator" %}})遍历：迭代器不依赖索引，是集合专用的遍历方式
- 增强 `for` 遍历：JDK 5 为了简化迭代器的代码加入的遍历方式
  - 增强 `for` 的底层就是迭代器遍历。
  - 所有的单列集合和数组才能用增强 `for` 进行遍历，双列集合不能用增强 `for` 遍历。
  - 修改增强 `for` 中的变量，不会改变集合中原本的数据。
  - 普通 `for` 遍历只能遍历有索引的 `List` 集合，不能遍历无索引的 `Set` 集合。
- Lambda 表达式遍历：JDK 8 开始的新技术 lambda 表达式提供了一种更简单、更直接的遍历集合的方式，`default void forEach(Consumer<? super T> action)`
  - `forEach` 方法底层是增强 `for` 遍历，循环调用 `Consumer` 的 `accept` 方法。
  - `Consumer` 是一个函数式接口，使用时用一个匿名内部类实现它的 `accept` 方法，其方法体就是遍历的循环体。
  - `Consumer` 的概念来自 [PECS 原则]({{% sref "java-generics##pecs-原则" %}})。
  - Lambda 表达式是函数式接口的匿名内部类实现的高效替代，编译器让程序在运行时动态生成一个匿名内部类，或将其直接翻译成一个静态方法。
  - 语法糖 1：参数类型可以省略，编译器可自动推断。
  - 语法糖 2：参数只有一个时，小括号可以省略。
  - 语法糖 3：方法体只有一句时，`return`（如果有）可以省略，分号可以省略。

```java
/* forEach+匿名内部类遍历集合 */
Collection<String> coll1 = new ArrayList<>();
coll.add("zhangsan");
coll.add("lisi");
coll.add("wangwu");

coll.forEach(new Consumer<String>() {
	@Override
	public void accept(String s) {
		System.out.println(s);
	}
});
```

```java
/* forEach+lambda表达式遍历集合 */
Collection<String>> coll1 = new ArrayList<>();
coll.add("zhangsan");
coll.add("lisi");
coll.add("wangwu");

coll.forEach(s -> System.out.println(s));
```
