---
weight: 60
slug: java-operators
title: Java 操作符 (运算符)
---

## 加法操作符 `x + y`

如果加法操作符 `+` 的左右两边有字符串，那么 `+` 表示字符串的拼接。如 `100 + '1'` 的值为 `'1001'`，其中 `+` 用于拼接字符串，它将参与运算的数字隐式转换为字符串。

## 等于操作符 `x == y`

等于操作符 `==` 用于比较两个操作数：基本类型比较数值，引用类型比较地址。

```java
int a = 1, b = 1;
String strA = "A_Pi", strB = "A_Pi";
System.out.println(a == b); /* true，基本类型比较数值 */
System.out.println(strA == strB); /* false，引用类型比较地址 */
```

## 三元操作符 `x ? y : z`

三元操作符 `?` 需要三个操作数，格式是 `布尔表达式` `?` `表达式 A` `:` `表达式 B`，运算机制是：判断 `布尔表达式` 的值，如果为 `true` 则返回`表达式 A` 的值，如果为 `false` 则返回`表达式 B` 的值。

```java
public class Operator {
	public static void main(String[] args) {
		int a = 10;
		int b = 20;
		int max = a > b ? a : b; /* 取 a, b 二者值中最大值 */
	}
}
```

## 类型检测操作符 `x instanceof y`

`x instanceof y` 返回 `x` 实例是否是 `y` 类型的布尔值。

- `instanceof` 目的是处理[多态]({{% sref "java-polymorphism" %}})，当你不确定一个抽象的泛型对象或接口引用指向的具体子类实例时，可以用它来做类型判断和处理。
- 若对象实际类型和指定类型不在同一条继承链上，则直接编译错误，因为这是无意义的。

> [!caution] `str instanceof Integer` 会导致编译错误
>
> 编译器在编译时就知道 `String` 和 `Integer` 没有任何关系。如果允许这种代码编译，那么在运行时 `obj instanceof Integer` 永远为 `false`，后面的代码块永远不会执行。更糟糕的是，如果强制向下转型，会立即抛出 `ClassCastException`。

`instanceof` 的用途：

- 向下转型前判断合法性：`if (animal instanceof Dog) Dog dog = (Dog) animal;`
- 处理接口：`list instanceof RandomAccess`(`list` 是否实现 `RandomAccess` 接口)
  - 如果是 `ArrayList`，它实现了 `RandomAccess` 接口，那么可以用 `for` 高效遍历
  - 如果是 `LinkedList`，则用 `for in` 迭代器遍历更高效
- Java 14 模式匹配：`animal instanceof Dog dog`，如果 `animal` 是 `Dog` 类型，自动创建 `dog` 变量指向该对象
