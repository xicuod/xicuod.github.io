---
weight: 590
slug: java-reflection
title: Java 反射
---

**反射**允许对封装类的字段 (成员变量)、方法 (成员方法) 和构造函数 (构造方法) 的信息编程访问。反射从 `.class` 字节码文件中获取类的成员。

- 获取类和类的成员：类 `Class`、成员变量 `Field`、成员方法 `Method`、构造方法 `Constructor`
- 解剖类的成员：获取成员的修饰符 `Modifier`、标识符 `String`、类型 `Class`、形参列表 `Parameter[]` 等

## 反射的作用

- 获取一个类里面所有的信息，获取到了之后，再执行其他的业务逻辑
- 结合配置文件，动态的创建对象并调用方法

## 反射类

1. 源代码阶段 (编写 `.java` 文件 + 编译 `.class` 文件)：`Class.forName("全类名");`
   - 全类名 = 包名 + 类名
2. 加载阶段 (加载 `.class` 文件)：`类名.class`
3. 运行阶段 (创建 `.class` 对象)：`对象.getClass();`

## 反射构造方法

获取构造方法的 `Class` 类方法：

- `Constructor<?>[] getConstructors()`：返回所有公共构造方法对象的数组
- `Constructor<?>[] getDeclaredConstructors()`：返回所有构造方法对象的数组
- `Constructor<T> getConstructor(Class<?>...parameterTypes)`：返回单个公共构造方法对象
- `Constructor<T> getDeclaredConstructor(Class<?>...parameterTypes)`：返回单个构造方法对象

创建对象的 Constructor 类方法：

- `T newInstance(Object...initargs)`：根据指定的构造方法创建对象
- `setAccessible(boolean flag)`：设置是否临时取消访问权限检查 (暴力反射)

Constructor 类的其他成员方法：

- getModifiers 方法：返回修饰符常量
- getParameters 方法：返回参数列表的数组

## 反射成员变量

获取成员变量的 `Class` 类方法：

- `Field[] getFields()`：返回所有公共成员变量对象的数组
- `Field[] getDeclaredFields()`：返回所有成员变量对象的数组
- `Field getField(String name)`：返回单个公共成员变量对象
- `Field getDeclaredField(String name)`：返回单个成员变量对象

创建对象的 `Field` 类方法：

- `void set(Object obj, Object value)`：赋值
- `Object get(Object obj)`：获取值
- `setAccessible(boolean flag)`：设置是否临时取消访问权限检查 (暴力反射)

## 反射成员方法

`Class` 类中用于获取成员方法的方法：

- `Method[] getMethods()`：返回所有公共成员方法对象的数组，包括继承的
- `Method[] getDeclaredMethods()`：返回所有成员方法对象的数组，不包括继承的
- `Method getMethod(String name, Class<?>...parameterTypes)`：传入方法签名，返回单个公共成员方法对象
- `Method getDeclaredMethod(String name, Class<?>... parameterTypes)`：传入方法签名，返回单个成员方法对象

`Method` 类中用于创建对象的方法：

- `Object invoke(Object obj, Object... args)`： 调用方法
  - 参数一：用 `obj` 对象调用该方法
  - 参数二：调用方法的传递的参数 (如果没有就不写)
  - 返回值：方法的返回值 (如果没有就不写)
