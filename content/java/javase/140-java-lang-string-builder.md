---
weight: 140
slug: java-lang-string-builder
title: java.lang.StringBuilder
---

**`StringBuilder` 类**维护一个字符串缓冲区，用于构造可变长的字符串。与 `String` 类的字符串字面常量不同，底层的 `byte[]` 字节数组没有 `final` 修饰，可以改变长度。

```java
/* String类底层 */ private final byte[] value;
/* StringBuilder类底层 */ private byte[16] value;
```

## `StringBuilder` 类特性

- `StringBuilder` 对象在内存中始终是一个数组，占用空间小，效率高。
- 如果 `StringBuilder` 存了超出了默认的 16 字节容量的字符串，会自动扩容为 32 字节。
- `StringBuilder` 适合单线程数据量较大，效率高但线程不安全。

## `StringBuilder` 类构造方法

- `StringBuilder()` 构造一个空的 `StringBuilder` 类对象
- `StringBuilder(String s)` 构造一个装有传入的字符串 `s` 的 `StringBuilder` 类对象

## `StringBuilder` 类成员方法

- `StringBuilder append(String s)` ：追加内容，可链式调用

```java
StringBuilder builder = new StringBuilder("散人：").append("我向往自由").append("！");
System.out.println(builder);
```

```
散人：我向往自由！
```

- `StringBuilder reverse()` 返回当前字符串的反转字符串
- `String toString()` 返回相应的 `String` 字符串
