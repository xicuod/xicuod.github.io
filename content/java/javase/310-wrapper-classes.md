---
weight: 310
slug: java-wrapper-classes
title: Java 包装类
---

基本类型的数据使用起来非常方便，但是没有相应的方法来操作这些数据，这又不方便。**包装类**可以把基本类型的数据包装起来，在包装类中可以定义一些方法，用来操作基本类型的数据。

- 包装类名：基本类型名的首字母大写的全称，`int` -> `Integer`。

| 基本类型  | 包装类                |
| --------- | --------------------- |
| `byte`    | `java.lang.Byte`      |
| `short`   | `java.lang.Short`     |
| `int`     | `java.lang.Integer`   |
| `long`    | `java.lang.Long`      |
| `float`   | `java.lang.Float`     |
| `double`  | `java.lang.Double`    |
| `char`    | `java.lang.Character` |
| `boolean` | `java.lang.Boolean`   |

## 装箱（以 `Integer` 类为例）

构造方法装箱（过时）：Java 5 起支持[自动装拆箱]()，不再需要调用构造方法显式装箱

- `Integer(int value)`（过时）构造一个装有整数参数的 `Integer` 类对象
- `Integer(String s)`（过时）构造一个装有字串参数转换成的整数的 `Integer` 类对象

静态方法装箱：如果方法另有基本类型参数的重载，就会调用该重载，不会自动装箱，此时需要手动调用包装类的静态方法装箱

- `static Integer valueOf(int i)` ：返回一个装有传入整数的 `Integer` 对象，`Integer.valueOf(233)`
- `static Integer valueOf(String s)`：返回一个装有传入字串的字面整数的 `Integer` 对象，`Integer.valueOf("666")`

## 拆箱（以 `Integer` 类为例）

- 实例方法拆箱：`Integer` 类的实例方法 `int intValue()` 返回 `Integer` 对象对应的 `int` 整数

## 自动装拆箱 (Java 5)

Java 5 引入自动装拆箱，基本类型与引用类型之间传参前不需要显式装拆箱。

```java
public class ArrayListDemo {
	public static void main(String[] args) {
		ArrayList<Integer> nums = new ArrayList<>();
		nums.add(514); /* 直接传入 int（JDK 5 自动装箱） */
		int num = nums.get(0); /* 直接用 int 接收（JDK 5 自动拆箱） */
		System.out.println(num);
	}
}
```

[数组]({{% sref "java-array" %}})不支持自动装拆箱，`Integer[]` 不能跟 `int[]` 隐式互转。
