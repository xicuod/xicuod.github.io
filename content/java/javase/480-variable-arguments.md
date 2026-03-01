---
weight: 480
slug: java-variable-arguments
title: Java 可变参数 (Java 5)
---

Java 5 起支持用一个形参传递多个同类型的实参给一个方法，这个形参称为**可变参数**。一个方法中只能指定一个可变参数，且它必须是方法的最后一个参数。

可变参数的声明：在最后一个形参类型后加一个省略号。

```java
public void mtd(int... nums) {}
```

可变参数的底层：数组

- 可变参数可以直接传入一个数组，但必须是引用类型数组。
- 可变参数如果传入一个基本类型数组，只会把它看作一个引用变量（数组元素没有自动装箱）。
- 方法体中可以把可变参数直接当成数组处理。

```java
public class Demo04 {
    public static void main(String[] args) {
        Demo04 demo04 = new Demo04();
        demo04.test(1, 2, 3, 4, 45, 5);
    }

    public void test(int... i) {
        System.out.println(i[0]);
        System.out.println(i[1]);
        System.out.println(i[2]);
        System.out.println(i[3]);
        System.out.println(i[4]);
        System.out.println(i[5]);
    }
}
```

> [!note] Java 中的可变参数相当于 C# 中的[数组参数]()。
