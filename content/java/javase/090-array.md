---
weight: 90
slug: java-array
title: Java 数组
---

**数组**是同类型数据的有序集合，是不同于类的另一种引用类型。

- 每个数组都是一个对象，在运行时通过一个 JVM 动态生成的数组类实例化。
  - JVM 动态生成的数组类直接继承 `Object` 类。
  - JVM 动态生成的数组类的内部命名约定：`[`维数，基本类型如 `I`=`int`，`D`=`double`，以此类推，特别地 `Z`=`boolean`。
    - 基本类型数据命名：所有一维 `int` 数组都为 `[I` 类，所有二维 `int` 数组都为 `[[I` 类。
    - 引用类型数组命名：一维字符串数组类命名为 `[Ljava.lang.String;`。
  - JVM 动态生成的数组类没有重写 `Object` 的 `toString` 方法，要打印对业务更有用的信息，使用 `Arrays.toString(Object[] a)` 或它的基础类型数组参数的重载。

* 声明：`dataType[] arrayRefVar;`
  - C/C++ 风格声明：`dataType arrayRefVar[];`(效果相同，但不推荐)
* 初始化：
  - 静态初始化：声明 + 初始化，`dataType[] arrayRefVar = {elem1, elem2, ...}`
  - 动态初始化：声明时不显式初始化，让编译器默认隐式初始化，稍后再赋值 (业务意义上的初始化)
    1. `dataType[] arrayRefVar = new dataType[arraySize];`
    2. `arrayRefVar[0] = val1;`

- 遍历：
  - `for` 遍历：`for (int i=0; i<someArr.length; i++) {}`
  - 增强 `for` 遍历：`for (item : someArr) {}`

* 操作符：`arrayRefVar[elemIdx]` 访问元素
* 字段：`length` 数组的长度
* 异常：`ArraylndexOutOfBoundsException` 数组下标越界异常
* 特点：
  1. 其长度是确定的。数组一旦被创建，它的大小就是不可以改变的。
  2. 其元素必须是相同类型，不允许出现混合类型。
  3. 数组中的元素可以是任何数据类型，包括基本类型和引用类型。
  4. 数组变量属引用类型，数组也可以看成是对象，数组中的每个元素相当于该对象的成员变量。
  5. 数组本身就是对象，而对象是在堆中的，因此数组无论保存原始类型还是其他对象类型，数组对象本身是在堆中的。

## 多维数组

多维数组可以看成是数组的数组，比如二维数组就是一个特殊的一维数组，其每一个元素都是一个一维数组。二维数组 `int a[][] = new int[2][5];` 可以看成一个两行五列的矩阵。

## 数组的内存布局

数组作为引用类型，也是堆中存对象，栈中存地址。

![Java 数组的内存布局](https://img.xicuodev.top/2026/02/d583519afc4bbd62ede516839c261046.png "Java 数组的内存布局")
