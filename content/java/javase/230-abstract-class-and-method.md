---
weight: 230
slug: java-abstract-class-and-method
title: Java 抽象类和抽象方法
---

使用 `abstract` 关键字声明抽象类和抽象方法：

```java
public abstract class Animal {
	public abstract void eat(); /* 引入一个抽象方法 */
}
```

```java
public class Cat extends Animal {
	public void eat() { /* 重写父类的抽象方法 */
		System.out.println("猫吃鱼");
	}
}
```

抽象类的特性：

- 不能直接 `new` 一个抽象类对象
- 必须至少继承有一个子类

抽象方法的特性：

- 继承链上的各子类必须**共同重写**抽象父类中的所有抽象方法
- 抽象方法只能在抽象类中声明
- 抽象方法只能由具体子类的对象调用

```java
public abstract class Animal {
	public abstract void eat();
	public abstract void sleep();
}
```

```java
public abstract class Dog extends Animal {
	@Override
	public void eat() {
		System.out.println("狗吃骨头");
	}
	/* 不实现、只继承抽象类的抽象方法时，子类也要是抽象类 */
	// public abstract void sleep(); /* 不写也会继承的 */
}
```

```java
public class DogGolden extends Dog {
	@Override
	public void sleep() {
		System.out.println("金毛犬睡觉");
	}
}
```

```java
public class Dog2Ha extends Dog {
	@Override
	public void sleep() {
		System.out.println("二哈睡觉");
	}
}
```

创建子类对象来调用子类重写的抽象方法的流程：

1. 调用抽象类的构造方法 `public Animal(){}`
2. 调用具体子类的构造方法 `public Cat(){}`
3. 调用具体子类重写的抽象方法 `public void eat(){...}`
