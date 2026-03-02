---
weight: 240
slug: java-interface
title: Java 接口
---

接口就是规范，定义的是一组规则，体现了现实世界中 “如果你是… 则必须能…” 的思想。

- 接口的本质是**契约**，就像法律一样，制定好后大家都遵守。
  - 接口比 [抽象类]({{% sref "java-abstract-class-and-method" %}}) 还抽象，是专业的抽象、专业的约束 (契约)。
  - [面向对象]({{% sref "java-oop" %}})的精髓就是对对象的抽象，最能体现这一点的就是接口。
  - 之所以[面向对象设计模式]() (OODP) 的讨论都只针对具备了抽象能力的语言 (如 C++、Java、C# 等)，就是因为设计模式所研究的实际上就是如何合理地去抽象。
- **面向接口编程**：接口和实现分离。
- **函数式接口**：只有一个方法的接口，可用 lambda 表达式替代并简化。

接口与普通类、抽象类的关系：

- 普通类：只有具体实现
- 抽象类：具体实现和规范 (抽象方法) 都有
- 接口：只有规范

接口的特性：

- 声明类的关键字是 `class`，声明接口的关键字是 `interface`
- 接口的方法强制为 `public abstract`，变量强制为 `public static final`
- 不能直接 `new` 一个接口类对象，同抽象类
  - 也就是说，接口没有构造方法
  - 但接口可以声明变量，用于引用实现类对象，实现 [多态]({{% sref "java-polymorphism" %}})
- 接口没有 [静态]({{% sref "java-static" %}}) 代码块
- 普通类和抽象类不能多继承，接口可以[多继承](#接口的多继承)

## 接口的多继承

一个子接口可以继承多个父接口。

- 多个父接口的抽象方法可以重名。
- 如果多个父接口的默认方法重名，那么子接口必须重写它，并带上 `default` 关键字。

## 接口的实现类

实现关键字 `implements`，实现类必须实现接口的所有约束 (抽象方法)。接口类中的抽象方法不能直接调用，需要一个实现类来实现它。

```java
public class <实现类名> implements <接口名> {	/* ... */ }
```

命名规范：一般在对应的接口类名后面加后缀 `Impl` 作为其实现类名。

```java
public class DemoImpl implements Demo {	/* ... */ }
```

1. 非抽象的实现类必须重写（“实现”）接口类中的所有抽象方法。
2. 抽象的（`abstract`）实现类可以不“实现”接口类中的抽象方法。
3. （与继承关系相比）一个子类的父类只能有一个，但是一个实现类可以实现多个接口类。
	1. 此时，多个接口类重名的抽象方法实现类只需要重写一次。
	2. 此时，多个接口类重名的默认方法实现类无论抽象与否都必须重写（因为[默认方法是继承的](#接口的默认方法-java-8)）。
4. 若一个实现类的父类的方法和接口类的默认方法重名，则会优先继承父类的方法。

### 例 1：重写抽象方法 & 重名的抽象方法

接口类：

```java
public interface InterfaceA {
	void methodA(); /* 抽象方法 A */
	void methodAb(); /* 抽象方法 Ab */
}
```

```java
public interface InterfaceB {
	void methodAb(); /* 与接口类 A 抽象方法重名 */
}
```

实现类：

```java
public class InterfaceImpl implements InterfaceA, InterfaceB {
	@Override
	void methodA() {
		System.out.println("重写了接口类 A 的抽象方法 methodA")
	}
	
	@Override
	void methodAb() {
		System.out.println("重写了接口类 A, B 重名的抽象方法 methodAb");
	}
}
```

### 例 2：重写重名且冲突的默认方法

接口类：

```java
public interface InterfaceA {
	default methodDf() {
		System.out.println("接口类 A 的默认方法.");
	}
}
```

```java
public interface InterfaceB {
	default methodDf() {
		System.out.println("接口类 B 的默认方法.");
	}
}
```

实现类：

```java
public class InterfaceImpl implements InterfaceA, InterfaceB {	
	@Override
	void methodDf() {
		System.out.println("重写了接口类 A, B 重名且冲突的默认方法.");
	}
}
```

## 接口的成员

- Java 7 及以前：[静态常量](#接口的静态常量-java-7)、[抽象方法](#接口的抽象方法-java-7)
- Java 8：[默认方法](#接口的默认方法-java-8)、[静态方法](#接口的静态方法-java-8)
- Java 9：[私有方法](#接口的私有方法-java-9)

### 接口的静态常量 (Java 7)

接口不能实例化，所以它只可能有静态字段。接口是抽象的，所以它不该有具体可变的变量，只可能有恒定不变的常量。因此，接口的字段只能是静态常量，当说到“接口的字段”就是在说“接口的静态常量”。

接口的静态常量的声明并赋值：

```java
/* public static final */ <数据类型> <常量名> = <数据值>;
```

- `public`, `static`, `final` 这 3 个关键字是默认添加的，写的时候就像写类的字段那样就行。
- `final` 意思是不可变（[`final` 关键字]({{% sref "java-final" %}})）。

命名规范：常量名需要全大写，并用下划线 `_` 分割多个单词。

```java
public interface InterfaceConst {
	int CONST_NUM = 100; /* 有隐含的 public static final */
}
```

```java
public class Demo181InterfaceConst {
	public static void main(String[] args) {
		int num = InterfaceConst.CONST_NUM; /* 访问接口常量 */
		System.out.println(num);
	}
}
```

### 接口的抽象方法 (Java 7)

接口的抽象方法的声明：

```java
/* public abstract */ <返回值类型> <方法名>(<参数列表>);
```

1. 接口的抽象方法的修饰符是两个固定的关键字 `public abstract`，这两个关键字是必定隐含的，均可省略。
2. 接口就是来让世界各地的实现类实现的，因此它的抽象方法必定隐含 `public` 关键字。
3. 接口中的底层方法就是抽象方法，因此它的抽象方法必定隐含 `abstarct` 关键字。
4. 只能通过实现类对象调用（[抽象方法]({{% sref "java-abstract-class-and-method" %}})）。

### 接口的默认方法 (Java 8)

接口的默认方法用于解决如果接口新增方法，那么它的所有实现类都要实现该方法的问题。

1. 默认方法会被实现类继承，可被实现类对象引用。
2. 默认方法也可被实现类重写。

接口的默认方法的声明：`public` 关键字是隐含的，不用写。

```java
/* public */ default <返回值类型> <方法名>(<参数列表>) { <方法体> }
```

```java
public interface InterfaceDf {
	void methodAb(); /* 抽象方法 */
	default void methodDf() { /* 在一次更新中新增的默认方法 */
		System.out.println("执行默认方法 Df");
	}
}
```

```java
public class InterfaceDfImplA implements InterfaceDf {
	@Override
	void methodAb() { /* 重写抽象方法 Ab */
		System.out.println("实现类 A 执行抽象方法 Ab");
	}
}
```

```java
public class InterfaceDfImplB implements InterfaceDf {
	@Override
	void methodAb() { /* 重写抽象方法 Ab */
		System.out.println("实现类 B 执行抽象方法 Ab");
	}
	@Override
	void methodDf() { /* 重写默认方法 Df */
		System.out.println("实现类 B 执行其重写的默认方法 Df");
	}
}
```

```java
public class Demo176InterfaceDf {
	public static void main(String[] args) {
		InterfaceDfImplA aImpl = new InterfaceDfImplA();
		InterfaceDfImplB bImpl = new InterfaceDfImplB();
		a.methodAb(); /* 实现类A实现的接口的抽象方法（对照） */
		a.methodDf(); /* 实现类A继承的接口的默认方法 */
		b.methodDf(); /* 实现类B重写的接口的默认方法 */
	}
}
```

### 接口的静态方法 (Java 8)

1. 静态方法通过类直接调用。
2. 静态方法不能被实现类重写，不能被实现类对象调用。

接口的静态方法的声明：`public` 关键字是隐含的，不用写。

```java
/* public */ static <返回值类型> <方法名>(<参数列表>) { <方法体> }
```

```java
public interface InterfaceStatic {
	static void methodStatic() {
		System.out.println("接口的静态方法");
	}
}
```

```java
public class InterfaceStaticImpl implements InterfaceStatic {}
```

```java
public class Demo177InterfaceStatic {
	public static void main(String[] args) {
		// InterfaceStaticImpl impl = new InterfaceStaticImpl();
		// impl.methodStatic(); /* 错误写法！ */
		InterfaceStatic.methodStatic(); /* 接口直接调用它的静态方法 */
	}
}
```

### 接口的私有方法 (Java 9)

接口的私有方法无法被实现类访问，用于解决多个[默认方法](#接口的默认方法-java-8)或[静态方法](#接口的静态方法-java-8)中存在重复代码的问题。

#### 接口的一般私有方法

接口的一般私有方法的声明：

```java
private <返回值类型> <方法名>(<参数列表>) { <方法体> }
```

```java
public interface InterfacePrivate {
	default void methodDfA() {
		System.out.println("执行默认方法 A");
		methodCommon();
	}
	default void methodDfB() {
		System.out.println("执行默认方法 B");
		methodCommon();
	}
	private void methodCommon() {
		System.out.println("AAA");
		System.out.println("BBB");
		System.out.println("CCC");
	}
}
```

#### 接口的静态私有方法

接口的静态私有方法的声明：

```java
private static <返回值类型> <方法名>(<参数列表>) { <方法体> }
```

```java
public interface InterfacePrivate {
	static void methodStaticA() {
		System.out.println("执行静态方法 A");
		methodStaticCommon();
	}
	static void methodStaticB() {
		System.out.println("执行静态方法 B");
		methodStaticCommon();
	}
	private static void methodStaticCommon() {
		System.out.println("AAA");
		System.out.println("BBB");
		System.out.println("CCC");
	}
}
```

```java
public class InterfacePrivateImpl implements InterfacePrivate {}
```

```java
public class Demo178InterfacePrivate {
	public static void main(String[] args) {
		InterfacePrivate.methodStaticA(); /* 接口直接调用它的静态方法 */
		InterfacePrivate.methodStaticB();
		// InterfacePrivate.methodStaticCommon(); /* 错误写法！不能调用接口的静态私有方法 */
	}
}
```

## 函数式接口 Functional Interface

函数式接口是只有一个抽象方法的接口（可以有默认方法、静态方法）。

```java 
/* 匿名内部类（lambda表达式）实现并调用函数式接口 Consumer 的 accept 方法 */
Collection<String> coll1 = new ArrayList<>();
coll.add("zhangsan");
coll.add("lisi");
coll.add("wangwu");

/* coll.forEach(new Consumer<String>() {
	@Override
	public void accept(String s) {
		System.out.println(s);
	}
}); */

coll.forEach(s -> System.out.println(s));
```

> [!tip] C# 委托与 Java 函数式接口
>
> C# 中有专门的功能实体“[委托]()”来实现 Java 函数式接口“抽象代码块”的功能。“这里只需要一个行为，具体是谁、在哪个对象里，都不重要；只要签名对得上，就能插进来用。”
