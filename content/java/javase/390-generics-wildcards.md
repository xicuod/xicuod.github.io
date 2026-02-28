---
weight: 390
slug: java-generics-wildcards
title: Java 泛型通配符与有界泛型
---

## 泛型通配符 Generics Wildcards

当不确定泛型容器接收哪条继承链的元素时，可用**泛型通配符** `?` 声明容器变量引用容器实例。泛型通配符是类型参数的抽象，只能用在尖括号 `<>` 里。

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

当确定泛型是哪条继承链的类，但不确定具体是哪个类时，可用**有界泛型**声明容器变量引用容器实例。

- `<? extends 上界类>` 有上界泛型：只接受该类及其子类

```java
方法头(泛型容器<? extends 上界类> 变量名, 其他形参) {方法体}
```

- `<? super 下界类>` 有下界泛型：只接受该类及其父类

```java
方法头(泛型容器<? super 下界类> 变量名, 其他形参) {方法体}
```

## PECS 原则

有界泛型是多态的典型应用：**PECS 原则** (Producer-Extends, Consumer-Super，生产者-继承、消费者-逆继承原则)，编译时检查是否符合生产-消费关系

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
