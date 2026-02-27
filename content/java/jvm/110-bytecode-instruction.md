---
weight: 110
slug: jvm-bytecode-instruction
title: JVM 字节码指令
---
[JVM 字节码指令手册 - 查看 Java 字节码 - xpwi - 博客园](https://www.cnblogs.com/xpwi/p/11360692.html "JVM 字节码指令手册 - 查看 Java 字节码 - xpwi - 博客园")

* `getstatic`：获取静态域
* `ldc`=`loadconstant`：加载常量，把符号变为常量对象
* `invokevirtual`：调用方法（Java 方法一般都是虚方法）
* `invokespecial`：调用特殊方法（构造器等）
* `astore`：存局部引用变量到 LocalVariableTable
* `aload`：从 LocalVariableTable 取局部引用变量
