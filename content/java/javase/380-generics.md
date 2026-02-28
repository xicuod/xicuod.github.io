---
weight: 380
slug: java-generics
title: Java 泛型 (Java 5)
---

**泛型**的意思是 “泛用型” 或 “通用型”。若所需数据类型不能确定，或者需要一个通用类型的变量，可以使用泛型。泛型是数据类型的抽象。

泛型的正交实体：泛型变量、泛型类、泛型方法、泛型接口。

```java
E e; /* Element 元素泛型 */
T t; /* Type 类型泛型 */
```

- `E` 和 `T` 是泛型变量 `e` 和 `t` 的**类型参数** (type parameter)。
- 泛型方法的泛型要写在修饰符列表后面。
- 泛型接口的两种使用方式：
  1. 实现类给出具体的类型：`class SomeImpl implements SomeInterface<Integer>`
  2. 实现类继承泛型，创建实现类对象时再具体化：`class SomeImpl<T> implements SomeInterface<T>`

泛型的特性：

- 泛型不能处理基本数据类型，只能处理它们的包装类。
- 声明泛型类对象时，可按需指定传入的包装类，以便访问各包装类的具体成员。
- 泛型一旦确定下来，就不能再动态地更改为其他类型。
- 如果不显式给出泛型的具体类型参数，默认是 `Object` 类型。

例子：使用泛型构造集合对象

```java
public class ArrayList<E> {
    public boolean add(E e) {}
    public E get(int index) {}
}
```

```java
ArrayList<String> list = new ArrayList<>();
Iterator<String> it = list.iterator();
list.add("A_Pi");

while(it.hasNext()) {
    String s = it.next();
    System.out.println("len of " + s + ": " + s.length());
    /* len of A_Pi: 4 */
}
```

## 泛型底层：类型擦除 Type Erasure

Java 的泛型是伪泛型。Java 5 引入泛型时，为了兼容老代码，只在老代码的基础上增加了编译时类型检测机制，并在编译通过时擦除具体化后的泛型，把具体的类型参数替换为泛型的边界类型 (bound type)。

- Java 泛型实现类型抽象化的方式：边界替换。见[有界泛型]({{ sref "java-generics-wildcards#有界泛型指定泛型的上界和下界" }})，有上界的泛型会被替换为上界类型，没上界的会被直接替换为 `Object` 类型。之后访问抽象类型的数据时，编译器也会加上到具体类型的强制转换。

## 泛型的不变性 Invariance

泛型数据具备继承性，但泛型容器不具备继承性，且它的方法更不具备多态性。通过不同类型参数具体化的泛型容器，底层是同一个类型，都是类型擦除后的上界类型的容器：`Box<Animal>` 和 `Box<Dog>` 类型擦除后都是 `Box<Object>`。因此它们之间的不存在继承关系，所以它们的同签名方法不具备多态性条件，技术上无法体现多态性。

编译器对待不同具体化的泛型容器的变量，在类型擦除后因访问而重新具体化到的类型不同。因此虽然泛型容器的底层实现是相同的类型，但顶层逻辑上它们是不同的类型，因此 Java 编译器在顶层约束了泛型容器变量的类型是不可变的。
