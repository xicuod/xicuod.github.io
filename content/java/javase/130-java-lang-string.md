---
weight: 130
slug: java-lang-string
title: java.lang.String
---

在此之前，最好先了解[字符类型]({{% sref "java-data-types#数值类型-字符" %}})。

## 字符串的特性

- 不可变性：`final`，字符串对象的内容不可改变。
- JDK 8 及以前底层为字符数组 `char[]`，JDK9 起底层为字节数组 `byte[]`。

## 字符串的声明并赋值

1. 空字符串：`new String()`
2. 从字符数组：`new String(new char[]{'A', '_', 'P', 'i'})`
3. 从字节数组：`new String(new byte[]{65, 95, 80, 105})`
4. 从串字面量：`"A_Pi"`

- 串字面量是直接用双引号括起来的字符序列，会存到[字符串常量池]()。串池是堆中专门用来存字符串字面量的一块内存空间。

## 字符串的存放位置

- 字符串字面量：放在字符串常量池
  - 串池的优化策略：与原来字符串字面量相同的字面量，沿用原来字面量的地址
- new 的字符串对象：放在[堆]()中

## 字符串的方法

- `equals(Object obj)`：比较串内容是否与参数中的串相同
- `equalsIgnoreCase(String str)`：同上，但忽略大小写
- `length()`：获取字符串长度
- `concat(String str)`：追加传入的字符串
- `charAt(int index)`：获取指定索引的字符，不能用元素访问操作符 `[]` 获取[^1]
- `indexOf(String str)`：查找指定子串第一次出现的位置，找不到返回 `-1`
- `substring()`：截取子串
  - `substring(int index)`：返回区间 `[index, end]` 截获的子串，`end` 是字符串末尾
  - `substring(int begin, int end)`：返回区间 `[begin, end-1]` 截获的子串
- `toCharArr()`：返回当前环境默认解码的字符数组 `char[]`
- `getBytes()`：返回当前环境默认编码的字节数组 `byte[]`
- `replace(CharSequence target, CharSequence replacement)`：查找 `target` 并替换为 `replacement`，`CharSequence` 是字符序列接口
- `split(String regex): String[]` 按正则表达式 `regex` 匹配分隔符，来切分字符串，返回得到的若干子串的数组

## 字符串的拼接

串常量拼接的原理：编译期优化，`"a"+"b"` -> `"ab"`

串变量拼接的原理：

- Java8 及以前：`StringBuilder`
  ```java
  new StringBuilder().append(s1).append(s2).toString()
  ```

- Java9 及以后：`StringConcatFactory` + `invokedynamic` 指令 ([JVM 指令]({{% sref "jvm-bytecode-instruction" %}})，[Java 5 可变参数]())
  ```java
  StringConcatFactory.makeConcatWithConstants(frontArgs, s1, s2, ...)
  ```

- 字符、字符串与数字相加：
  - 字符与数字相加：字符会隐式转换为数字
  - 字符串与数字相加：数字会隐式转换为字符串

- 字符、字符串与数字混合链式相加时，注意是从左向右计算：`1+2+"a"` = `"3a"`

## 字符串的比较

- 等于操作符 `==`：比的是字符串对象的地址 (栈中变量)。字符串在栈中存变量，堆中存对象，栈中变量的值是地址，引用堆中的对象。
- `equals` 和 `equalsIgnoreCase` 方法：比的是字符串本身 (堆中对象)。
  - 与串字面常量比较：执行主体应为串字面常量 `"串字面常量".equals(someStr)`，避免执行主体为空指针，导致抛 `NullPointerException` 空指针异常。

## 字符编解码方法

字符编码方法：

- `getBytes()` 返回当前环境默认编码格式的字节数组 `byte[]`
- `getBytes(String charsetName)` 使用指定字符集的格式编码

字符解码方法：

- `String(byte[] bytes)` 使用自动匹配的格式解码
- `String(byte[] bytes, String charsetName)` 使用指定字符集的格式解码

[^1]: 但 C# 可以，它重载了 `string` 类的元素访问操作符 `[]`。
