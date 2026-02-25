---
weight: 100
slug: jvm-class-file-structure
title: JVM 类文件结构
---
`.class` 类文件由 `.java` 源代码文件经 `javac` 工具编译后得到，类文件是字节码。

* 字节码是以字节为单位的二进制码。
* `javac -parameters -d . SomeClass.java`
  * `-parameters` 选项：保留参数名
* `javap -v SomeClass.class` 反编译字节码得到开发人员能看懂的文本。

## `.class` 类文件结构

![类文件结构](https://img.xicuodev.top/2026/02/781042672dc928ea3052f67ad4e99ad5.png "类文件结构")

## 魔数和版本信息

![类文件结构-魔数和版本信息](https://img.xicuodev.top/2026/02/0245d894c47a7c186995d513be002b10.png "类文件结构-魔数和版本信息")

* 魔数 `u4 maigc`：开头的固定4字节 `CA FE BA BE`，标识文件类型为Java类文件，可供JVM识别并解析
  * `CA FE BA BE` = cafe babe = 咖啡宝贝，Java 开发工程师的冷幽默
  * 十六进制 2 个数字为一组表示 1 个字节
* 版本信息：4 字节，前 2 个是小版本号 `u2 minor_version`，后 2 个是大版本号 `u2 major_version`，图中版本 `00 00 00 34H` = `0 52D` = Java 8

## `javap -v` 输出的结构

* 类的基本信息：
  * 类文件信息、包名和类名、JDK 版本、修饰符、自身类和父类，以及接口、字段、方法和注解的统计
* 常量池：一张表，JVM 指令根据这张表找到类、方法、参数类型、字面量等信息。常量表存放各编程实体的符号地址（#1, #2, ...）。

```
#2=Fieldref#21.#22
#3=String#23
#4=Methodref#24.#25
...(...#21-#25...)
```

* 方法定义：写在`{}`中
  * `descriptor`=描述符
  * `flags`=修饰符
  * `code`=[JVM 指令]({{< ref "jvm-bytecode-instruction.md" >}})
    * `stack`=栈号，`locals`=局部变量个数（算上`args`），`args_size`=参数大小

```
getstatic     #2 /*静态字段*/
ldc           #3 /*字符串字面量*/
invokevirtual #4 /*方法*/
return
```

这里的 #2、#3 和 #4 就是常量池里的符号地址。
* `LineNumberTable`：行数字表
* `LocalVariableTable`：局部变量表

如果没有生成 `LocalVariableTable`：

```sh
javac -g:var SomeClass.java
javap -v SomeClass.class
```
