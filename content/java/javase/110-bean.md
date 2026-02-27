---
weight: 110
slug: java-bean
title: Java Bean
---

Java Bean (“爪哇咖啡豆”) 是 Java 面向对象规范约定的一种类的定义格式。

定义一个 Java Bean 要遵循以下四点：

1. 所有的成员变量都要使用 `private` 关键字修饰 (封装)
2. 为每个成员变量编写一对 `getter` & `setter` 方法 (封装)
3. 编写一个无参构造方法
4. 编写一个有参构造方法

```java
public class Student {
	private String name;
	private int age;
	
	/* 无参构造方法 */
	public Student() {
	}
	
	/* 全参构造方法 */
	public Student(String name, int age) {
		this.name = name;
		this.age = age;
	}
	
	/* getter & setter */
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public int getAge() {
		return age;
	}
	
	public void setAge(int age) {
		this.age = age;
	}
}
```
