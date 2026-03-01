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

Java 的泛型是“伪泛型”。Java 5 引入泛型时，为了兼容老代码，只在老代码的基础上增加了编译时类型检测机制，并在编译通过时擦除具体化后的泛型，把具体的类型参数替换为泛型的**边界类型** (bound type)。

> [!note] Java 泛型实现类型抽象化的方式：边界替换
> 
> 见[有界泛型](#有界泛型指定泛型的上界和下界)，有上界的泛型会被替换为上界类型，没上界的会被直接替换为 `Object` 类型。之后访问抽象类型的数据时，编译器也会加上到具体类型的强制转换。

## 泛型的不变性 Invariance

虽然 `Integer` 是 `Number` 的子类，但 `List<Integer>` 并不是 `List<Number>` 的子类——子类列表不是父类列表的子类。泛型数据具备继承性，但泛型容器不具备继承性，泛型容器的方法更不具备多态性。通过不同类型参数具体化的泛型容器，底层是同一个类型，都是类型擦除后的上界类型的容器：`Box<Animal>` 和 `Box<Dog>` 类型擦除后都是 `Box<Object>`。因此它们之间的不存在继承关系，所以它们的同签名方法不具备多态性条件，技术上无法体现多态性。

## 泛型通配符 Generics Wildcards

对于一个泛型类的方法参数，当不确定其泛型时（例如在程序中，这个泛型有时是 `Integer`，有时是 `String`），可用**泛型通配符** `?` 来替代具体的类型，意思是“这个参数的泛型类的泛型是未知的”。

> [!note] 类型安全 Type Safety
> 
> 保证类型安全就是防止程序在运行时出现 `ClassCastException` 类型转换异常。

> [!tip] 捕获转换 Capture Conversion
>
> 编译器实际上会给泛型通配符 `?` 创建一个**捕获类型**（如 `capture#1 of ?`），这个过程叫“**捕获转换**”。在方法上下文中，捕获类型会被当成具体的类型来用。捕获类型是临时创建的，在代码中只能将捕获类型的数据安全地赋值给它的[上界类型](#有界泛型指定泛型的上界和下界)（或任何上界的父类型）的变量。如果没有设置上界类型，相当于上界是 `Object`，因为所有的引用类型都是 `Object` 的子类，捕获类型也不例外。
> 
> 捕获类型只是一个用来表示“未知的类型”的“占位把戏”：它只是“捕获”了未知的类型，本质上还是未知的（就像数学上把未知数设为 $x$）。因此，为了保证类型安全，编译器不会允许你在捕获类型的引用上写数据（除了引用类型通用的 `null`）。

```java
public static void main(String[] args) {
    ArrayList<Integer> listInt = new ArrayList<>();
    listInt.add(0721);
    listInt.add(233);
    printList(listInt);
    
    ArrayList<String> listStr = new ArrayList<>();
    listStr.add("Minecraft");
    listStr.add("Celeste");
    printList(listStr);
}

public static void printList(ArrayList<?> list) {
    Iterator<?> it = list.iterator();
    while (it.hasNext()) {
        Object o = it.next(); /* next() 返回值为 Object 类型 */
        System.out.println(o);
    }
}
```

## 有界泛型：指定泛型的上界和下界

当泛型的取值范围确定，但具体是哪个类型不确定时，可用**有界泛型**声明泛型类的泛型。有界泛型是[多态]({{% sref "java-polymorphism" %}})的典型应用。`? extends` 和 `? super` 是“有界通配符”，`?` 是“无界通配符”。无界通配符 `?` 相当于 `? extends Object`。

- `<? extends 上界类>` 有上界泛型：只接受该类及其子类

```java
方法头(泛型类名<? extends 上界类名> 变量名, 其他形参) {方法体}
```

有上界泛型是为了可以安全地读取，因为它总是上界类或它的子类，只要用上界类的变量读取就是类型安全的。但是这样就不能写了，因为它可以是上界类或它的任何子类，你没办法写入一个既能转换成 `Integer` 又能转换成 `Double` 的类型。

- `<? super 下界类>` 有下界泛型：只接受该类及其父类

```java
方法头(泛型类名<? super 下界类名> 变量名, 其他形参) {方法体}
```

有下界泛型是为了可以安全地写入，因为它总是下界类或它的父类，只要写入下界类就是类型安全的。但是这样就不能读了，因为它可以是下界类或它的任何父类，你没办法读出一个既能接收 `Number` 又能接收 `Integer` 的类型（除了 `Object` 类型以外不存在第二个这样的类型）。

## PECS 原则

**PECS 原则** (producer-extends, consumer-super, 生产者使用 `extends` 与消费者使用 `super` 原则) 是有界泛型的典型应用，是在编译时检查两个集合参数是否符合生产-消费关系。

- `? extends T` 使生产者提供 `T` 或 `T` 以下的元素，保证用 `T` 变量可安全读取
- `? super T` 使消费者接收 `T` 或 `T` 以上的元素，保证可安全写入 `T` 元素

```java
/* 生产者 src 产出 T 的元素 (extends T)，消费者 dest 购入 T 的元素 (super T) */
public static<T> void copy(List<? super T> dest, List<? extends T> src) {
    for (int i=0; i<src.size(); i++) {
	    T srcElem = src.get(i); /* 从生产者 src 读 */
	    dest.set(i, srcElem); /* 向消费者 dest 写 */
    }
}
```

> [!note] PECS 原则
>
> PECS 原则是为了在保证类型安全的前提下尽可能提高生产-消费方法的灵活性。因为 Java 的泛型是[不变的](#泛型的不变性-invariance)。这样就会导致像 `printNumbers(List<Number> list)` 这样的方法只能处理父类列表，不能处理子类列表，缺乏灵活性。为此必须要引入[有界泛型](#有界泛型指定泛型的上界和下界)，让生产者的泛型有上界（灵活读），消费者的泛型有下界（灵活写）。
