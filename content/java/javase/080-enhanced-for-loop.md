---
weight: 80
slug: java-enhanced-for-loop
title: Java 增强 for 循环
---

Java 的增强 `for` 循环的使用方式如下，它用于遍历集合或数组的所有元素，每次迭代都给使用时声明的变量赋上迭代到的元素的值。

```java
for (<元素的类型> <变量名> : <集合或数组>) {}
```

```java
ArrayList<String> sList = new ArrayList<>().add("A_Pi").add("Kinoko7");
for (String s : sList) {
    System.out.println(s);
}
```

```
A_Pi
Kinoko7
```
