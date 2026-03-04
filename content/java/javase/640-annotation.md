---
weight: 640
slug: java-annotation
title: Java 注解
---

## 1.1 注释和注解的区别？(掌握)

共同点：都可以对程序进行解释说明。

不同点：

- 注释是给程序员看的，只在 Java 源代码中有效，在 class 文件中不存在注释的。Java 编译器编译时，会做注释擦除。
- 注解是给虚拟机看的，当虚拟机看到注解之后，就知道要做什么事情了。

## 1.2 如何使用注解 (掌握)

在以前看过注解 @Override。当子类重写父类方法的时候，在重写的方法上面写 @Override。当虚拟机看到 @Override 的时候，就知道下面的方法是重写的父类的。检查语法，如果语法正确编译正常，如果语法错误，就会报错。

## 1.3 Java 中已经存在的注解 (掌握)

- @Override：表示方法的重写
- @Deprecated：表示修饰的方法已过时
- @SuppressWarnings ("all")：压制警告

除此之外，还需要掌握第三方框架中提供的注解，比如 JUnit：

- @Test 表示运行测试方法
- @Before 表示在 Test 之前运行，进行数据的初始化
- @After 表示在 Test 之后运行，进行数据的还原

## 1.4 自定义注解 (了解)

自定义注解单独存在是没有什么意义的，一般会跟反射结合起来使用，会用发射去解析注解。

声明自定义注解：

```java
public @interface 注解名称 {
	public 属性类型 属性名() default 默认值;
}
```

- 注解的属性默认为 public。属性名后面要加括号。default 给属性设置默认值。
- 属性类型可以是基本类型、String、Class、注解、枚举和以上类型的一维数组。

使用自定义注解：`@注解名(属性1=值1,属性2=值2)` 如果没有默认值，则属性必须赋值

针对于注解，只要掌握会使用别人已经写好的注解即可。

关于注解的解析，一般是在框架的底层已经写好了。

## 1.5 特殊属性 (掌握)

value：当注解中只有 "一个属性", 并且属性名是 "value", 使用注解时, 可以省略 value 属性名

- 但是如果有多个属性，且多个属性没有默认值，那么 value 名称是不能省略的。

```java
//注解的定义
public @interface Anno2 {
    public String value();
    //public int age() default 23; //解开这行的注释就不能省略value了
}

//注解的使用
@Anno2("abc")
public class AnnoDemo2 {
    @Anno2("aaa")
    public void method(){
    }
}
```

## 1.6 元注解 (了解)

元注解是注解注解的注解，也就是可以写在注解上面的注解。元注解有两个：

- @Target：指定注解能在哪里使用
- @Retention：可以理解为保留时间 (生命周期)

#### @Target

@Target 用来标识注解使用的位置，如果没有使用该注解标识，则注解可以使用在任意位置。

@Target 可使用的值定义在 ElementType 枚举类中，常用值如下：

- `TYPE` 类，接口
- `FIELD` 成员变量
- `METHOD` 成员方法
- `PARAMETER` 方法参数
- `CONSTRUCTOR` 构造方法
- `LOCAL_VARIABLE` 局部变量

#### @Retention

@Retention 用来标识注解的生命周期 (有效范围)。

@Retention 可使用的值定义在 RetentionPolicy 枚举类中，常用值如下：

- SOURCE：注解只作用在源码阶段，生成的字节码文件中不存在
- CLASS (默认值)：注解作用在源码阶段、字节码文件阶段，运行阶段不存在
- RUNTIME (开发常用)：注解作用在源码阶段、字节码文件阶段和运行阶段

## 1.7 注解的解析 (了解)

注解的解析：注解的操作中经常需要进行解析，注解的解析就是判断是否存在注解，存在注解就解析出内容。

- Annotation：注解的顶级接口，可以利用反射解析注解

Annotation 的方法：

- `Annotation[] getDeclaredAnnotations()` 获得当前对象上使用的所有注解，返回注解数组。
- `T getDeclaredAnnotation(Class<T> annotationClass)` 根据注解类型获得对应注解对象
- `boolean isAnnotationPresent(Class<Annotation> annotationClass)` 判断当前对象是否使用了指定的注解，如果使用了则返回 true，否则 false

所有的类和类成员如 Class、Method、Field、Constructor 都实现了 AnnotatedElement 接口，拥有解析注解的能力。

解析注解的技巧：

- 注解在哪个成分上，我们就先拿哪个成分对象，再从它获取它身上的注解。
  - 比如注解作用成员方法，则要获得该成员方法对应的 Method 对象，再来拿上面的注解
  - 比如注解作用在类上，则要该类的 Class 对象，再来拿上面的注解
  - 比如注解作用在成员变量上，则要获得该成员变量对应的 Field 对象，再来拿上面的注解

自定义 @MyTest 模拟 JUnit 自带的 @Test 注解：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyTest {
}

public class MyTestMethod {

    @MyTest
    public void method1(){
        System.out.println("method1");
    }

    public void method2(){
        System.out.println("method2");
    }

    @MyTest
    public void method3(){
        System.out.println("method3");
    }
}

public class MyTestDemo {
    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, InvocationTargetException {
        //1,获取class对象
        Class clazz = Class.forName("com.itheima.test2.MyTestMethod");

        //获取对象
        Object o = clazz.newInstance();

        //2.获取所有方法
        Method[] methods = clazz.getDeclaredMethods();
        for (Method method : methods) {
            //method依次表示类里面的每一个方法
            method.setAccessible(true);
            //判断当前方法有没有MyTest注解
            if(method.isAnnotationPresent(MyTest.class)){
                method.invoke(o);
            }
        }
    }
}
```

## 1.8 注解小结

掌握如何使用已经存在的注解即可。

- @Override：表示方法的重写
- @Deprecated：表示修饰的方法已过时
- @SuppressWarnings("all")：压制警告
- @Test：表示要运行的方法

在以后的实际开发中，注解是使用框架已经提供好的注解。

自定义注解 + 解析注解 (很难，了解)，一般会出现在框架的底层。当以后我们要自己写一个框架的时候，才会用到自定义注解 + 解析注解。
