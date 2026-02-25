---
weight: 10
slug: java-jvm-jre-jdk
title: JVM、JRE 和 JDK
---
![](https://img.xicuodev.top/2026/02/b59d51aae75cb677746e439fd0b693ff.png)

* JVM (Java Virtual Machine, Java 虚拟机)：[Java 二进制字节码]({{< ref "jvm-class-file-structure.md" >}})的运行环境。
	* `jstack` 堆栈跟踪工具
* JRE (Java Runtime Environment, Java 运行时环境)：运行 Java 程序所必需的环境集合，包括 JVM 标准实现和 Java 核心类库。
  * JVM + 核心类库 + 运行工具
    * `java` 运行工具
* JDK (Java Development Kit, Java 开发工具包) = Java SDK：
  * JVM + 核心类库 + 编译/开发工具
    * `javac` 编译工具
    * `jdb` 调试工具
    * `jhat` 内存分析工具
    * ...

* OpenJDK：[OpenJDK傻傻分不清楚？一文全部搞懂！-知乎](https://zhuanlan.zhihu.com/p/677803584 "OpenJDK傻傻分不清楚？一文全部搞懂！-知乎") 
