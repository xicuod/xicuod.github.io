---
weight: 250
slug: java-inner-class
title: Java 内部类
---

心脏是身体的内部类，发动机是汽车的内部类。内部类就是在一个类的内部定义一个类。如果在 `Outer` 类中定义一个 `Inner` 类，那么 `Inner` 类相对 `Outer` 类来说就称为内部类，而 `Outer` 类相对 `Inner` 类来说就是外部类了。

1. [成员内部类](#成员内部类)：`outerObj.Inner`，可以访问外部类的实例成员和类成员
2. 静态内部类：`Outer.Inner`，可以访问外部类的类成员
3. [局部内部类](#局部内部类)：方法中声明的内部类，只能在声明后使用，可以访问外部类的实例成员和类成员
4. [匿名内部类](#匿名内部类)：`new <父类/接口>() { <匿名内部类体> }`，继承父类或实现接口，可以访问外部类的实例成员和类成员

## 成员内部类

```java
class <外部类名> { class <内部类名> {} }
```

- 内访外：随意访问。
- 外访内：借助内部类对象。

访问内部类：

1. 间接访问：在外部类方法中创建内部类对象，通过外部类方法访问内部类。

```java
public class Body { /* 身体=外部类 */
	public class Heart { /* 心脏=内部类 */
		public void beat() {
			System.out.println("Listen to my heartbea-ea-eat.");
		}
	}
	public void HeartBeat() { /* 外部类方法 */
		System.out.println(new Heart().beat()); /* 创建一个内部类匿名对象 */
	}
}
```

```java
public class Demo202InnerClass {
	public static void main(String[] args) {
		Body body = new Body();
		body.HeartBeat(); /* listen to my heartbea-ea-eat. */
	}
}
```

2. 直接访问：直接声明一个内部类对象。

```java
<外部类名>.<内部类名> <对象名> = new <外部类名>().new <内部类名>();
```

```java
public class Demo202InnerClass {
	Body.Heart heart = new Body().new Heart();
	heart.beat(); /* 内部类对象直接调用其方法 */
}
```

## 局部内部类

**局部内部类**是方法、构造器或代码块中声明的类，只能在方法内声明后使用，可以访问外部类的实例成员和类成员。局部内部类是运行时动态创建的。

```java 
<外部类头> { <方法头>() { class <内部类名> {} } }
```

```java
public class Outer {
    public void methodOuter() {
        class LocalInner { /* 局部内部类，位于外部类方法中 */
            int num = 10; /* 局部内部类的成员变量，也属于局部变量 */
            public void methodInner() {
                System.out.println(num); /* 10 */
            }
        }
        new LocalInner().methodInner(); /* 10 */
    }
}
```

```java
public class Demo205InnerClass {
    public static void main(String[] args) {
        Outer obj = new Outer();
        obj.methodOuter(); /* 10 */
    }
}
```

Java 8 的成员方法中，局部内部类访问的局部变量必须是“有效 `final` 的”，意思是不写 `final` 也行，但不能二次赋值。

内部类访问同名外部变量：如果内部变量和外部变量同名了，那么外部变量就被隐藏了，要想访问外部变量，需要用到外部类名和 `this` 关键字：`Outer.this.sameName`。不仅这么做很麻烦，而且同名这事本来就会导致混淆，因此非常不推荐在内外部类中声明同名的变量。

## 匿名内部类

匿名内部类是局部内部类的一种特殊情况。匿名内部类功能强大，是用的最多的内部类。

用途：如果接口的某个实现逻辑只需用到一次，则应该省去实现类，改为使用匿名内部实现类。匿名内部类也可以用作父类的一次性继承。

- 匿名内部类编译后作为名如 `<外部类>$1.class` 的 Java 字节码静态存在，开销较大。
- Java 8 的 lambda 表达式用 `invokedynamic` 指令动态生成接口的实现实例，开销较小。[JVM 字节码指令]({{% sref "jvm-bytecode-instruction" %}})

匿名内部类的声明：

```java
<接口> <对象名> = new <接口>() {
    /* 匿名内部实现类，实现接口中的所有抽象方法
    匿名：无名且昙花一现
    内部：接口的构造方法的内部类 */
};
```

## 匿名对象

声明匿名对象并调用它的方法：`new SomeAnonymousObject().doSth()`

- 匿名对象在调用方法时只能调用一次，因为它只存在于一行代码中。

## 匿名内部类结合匿名对象

```java
public interface MyInterface {
    void methodAb();
}
```

```java
public class Demo207AnonymousInnerClass {
    public static void main(String[] args) {
        new MyInterface() { /* 声明匿名对象和匿名内部类 */
            @Override
            public void methodAb() {
                System.out.println("匿名内部类实现的接口方法");
            }
        }.methodAb(); /* 匿名接口对象调用其匿名内部类实现的接口方法 */
    }
}
```
