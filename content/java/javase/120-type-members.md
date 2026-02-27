---
weight: 120
slug: java-type-members
title: Java 类型成员
---

Java 的类型成员在类和枚举中，有字段、方法、构造器、内部类、枚举常量和注解元素。

### 字段 Field​

- 实例字段：每个对象独立持有的状态变量
- 静态字段 = 类字段​​：类级别共享的状态变量
- 常量字段：使用 `public static final` 声明

```java
class Person {
    /* 实例字段 */ private String name; /* 名字 */
    /* 静态字段 */ private static int instanceCount; /* 人口 */
    /* 常量字段 */ public static final int MAX_AGE = 120; /* 最大年龄 */
}
```

### 方法 Method

- 实例方法：操作对象状态的方法
- 静态方法：类级别的方法
- 抽象方法：在抽象类 / 接口中声明
- 默认方法：接口中的默认实现 (Java 8+)

```java
abstract class Animal {
    /* 实例方法 */ public void move() { /* 方法体 */ }
    /* 静态方法 */ public static int calculate(int a, int b) { return a + b; }
    /* 抽象方法 */ public abstract void makeSound();
}

interface Walkable {
    /* 默认方法 */ default void walk() { /* 默认方法体 */ }
}
```

### 构造器 Constructor

- 实例构造器：初始化新对象
- 静态初始化块：类加载时执行 (类似 C# 静态构造器)

```java
class Car {
    /* 静态初始化块 */ static {
        System.out.println("Car类已加载");
    }

    /* 实例构造器 */ public Car(String model) { this.model = model; }
}
```

### 嵌套类 = 内部类 Nested Class

[Java 内部类]()

- 静态内部类：相当于顶级类
- 一般内部类：外部类中声明，与外部类实例关联
- 匿名内部类：无类名的内联实现，可以是父类的子类或接口的实现类
  - `new` 关键字后跟父类名或接口名，再跟匿名类的类体，直接创建一个匿名类的实例：
  ```java
  Runnable on = new Runnable() { public void run() {/* on 的具体实现 */} };
  ```

```java
class Computer {
	/* 静态内部类 */ static class CPU {}
	/* 一般内部类 */ class Memory {}
	void start() {
		/* 局部内部类 */ class TempSensor {
			Runnable on = new Runnable()
                /* 匿名内部类 */ { public void run() {/* 具体实现 */} };
		}
		TempSensor ts = new TempSensor();
		ts.on();
	}
}
```

### 枚举常量 Enum Constant

- 特殊类型的静态 `final` 字段

```java
enum Planet {
    /* 枚举常量 */ MERCURY(3.303e+23), VENUS(4.869e+24);
    /* 实例字段 */ private final double mass; 
    /* 构造方法 */ Planet(double mass) { this.mass = mass; }
    /* 实例方法 */ public void ShowMass() { sout(mass); }
}
```

### 注解元素 Annotation Element

- 类似方法声明的属性定义

```java
@interface Author {
    /* 注解元素 */ String name();
    /* 注解元素 */ int year() default 2020;
}
```
