---
weight: 340
slug: java-util-iterator
title: java.util.Iterator
---

```java
Iterator<String> it = coll.iterator();
while(it.hasNext()) {
	String str = it.next();
	System.out.println(str);
}
```

`Collection` 接口的迭代器相关方法：

- `Iterator iterator()`：返回主调单列集合的迭代器

`Iterator` 接口的方法：

- `boolean hasNext()`：判断当前位置是否有元素，有元素返回 `true`，没有元素返回 `false`
- `E next()`：获取当前位置的元素；将迭代器对象移向下一个位置
- `void remove()`：删除当前位置的元素

1. 在没有元素的位置强行获取元素，抛 `NoSuchElementException` 找不到元素异常
2. 迭代器遍历完毕，指针不会复位
3. 循环中只能用一次 `next` 方法，再用就是下下个元素了
4. 迭代器遍历时，不能用集合的方法增加或删除元素，这会导致迭代器失效，抛 `ConcurrentModificationException` 并发修改异常，此时要用迭代器提供的删除 remove 方法
5. `Iterator` 的 `next` 是先验性表述，`iterator` 要先到下一个位置，检查该位置即它的 “当前位置”，才知道 “下一个位置” 有没有元素

迭代器底层：

![Java 迭代器底层](https://img.xicuodev.top/2026/02/496501bba353bb87bc37d796dfeba9df.png "Java 迭代器底层")

- 具体集合的内部类 `Itr` 实现 `Iterator` 接口：

`Iterator` 在底层实际上就是创建了一个内部类的对象，这个内部类就表示是 `ArrayList` 的迭代器，所以当我们调用多次 `iterator` 方法的时候，相当于就是创建了多个迭代器的对象。

- 内部类 `Itr` 成员：
  - 游标 `cursor`：迭代器指针，默认指向 `0` 索引
  - 上个索引 `lastRet`，默认 `-1`
  - 期望修改次数 `exceptedModCount`=`modCount` (并发修改异常相关)
  - `hasNext` 方法：`cursor!=size`，是否到列表尾
  - `next` 方法：
    1. `cursor`=`i`(旧索引)+1 移动指针到下下个位置
    2. `elementData[lastRet = i]` 获取下个元素

- 集合成员 `modCount`：集合被修改的次数
  - 每 `add` 一次或者 `remove` 一次，这个变量都会自增
  - 当我们创建迭代器对象的时候，就会把这个次数告诉迭代器，迭代器将其存为 `expectedModCount`

- 当前集合中最新的变化次数跟一开始记录的次数是否相同：
  - 如果相同，证明当前集合没有发生改变
  - 如果不一样，证明在迭代器遍历集合的过程中，使用了集合中的方法添加 / 删除了元素，抛并发修改异常

- 结论：如何避免并发修改异常？在使用迭代器或者是[增强 `for`]({{% sref "java-enhanced-for-loop" %}}) 遍历集合的过程中，不要使用集合的方法去添加或者删除元素。
