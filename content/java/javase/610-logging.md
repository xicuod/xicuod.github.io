---
weight: 610
slug: java-logging
title: Java 日志
---

程序中的日志可以用来记录程序运行过程中的信息，并可以进行永久存储。

控制台输出语句记录运行信息的弊端：

- 信息只能展示在控制台，不能记录到其他位置 (文件、数据库)
- 想取消记录的信息需要修改代码才可以完成

日志技术具备的优势：

- 可以将系统执行的信息选择性的记录到指定的位置 (控制台、文件、数据库)
- 可以随时以开关的形式控制是否记录日志，无需修改源代码

## 日志体系结构

日志规范：一些接口，提供给日志的实现框架设计的标准。

日志框架：牛人或者第三方公司已经做好的日志记录实现代码，后来者直接可以拿去使用。因为对 Commons Logging 的接口不满意，有人就搞了 SLF4J；因为对 Log4j 的性能不满意，有人就搞了 Logback。

- 日志规范接口
  - Commons Logging = JCL
  - Simple Logging Facade for Java = `slf4j`

- 日志实现框架
  - Log4j
  - JUL = `java.util.logging`
  - Logback
  - ……

## Logback 日志框架

[Logback](https://logback.qos.ch/index.html) 是基于 `slf4j` 的日志规范实现的框架，性能比 `log4j` 要好。

Logback 主要分为 3 个模块：

- `logback-core`：该模块为其他两个模块提供基础代码，必须有。
- `logback-classic`：功能模块，完整实现了 `slf4j` API 的模块。
- `logback-access`：与 Tomcat 和 Jetty 等 Servlet 容器集成，以提供 HTTP 访问日志功能。

快速入门：

1. 在项目下新建文件夹 `lib`，导入 Logback 的相关 `jar` 包到该文件夹下，并添加到项目依赖库中去。

- `logback-classic-1.2.3.jar`
- `logback-core-1.2.3.jar`
- `slf4j-api-1.7.26.jar`

2. 将 Logback 的核心配置文件 `logback.xml` 直接拷贝到 `src` 目录下 (必须是 `src`，如果是 maven 项目那么必须在 `src/main/resources`)。
3. 在代码中获取日志的对象：这一步可以用 `@Slf4j` 注解代替。

```java
private static final Logger log = LoggerFactory.getLogger(<字节码对象>);
```

4. 使用日志对象的方法记录系统的日志信息。

## Logback 配置文件 `logback.xml`

Logback 日志系统的特性都是通过核心配置文件 `logback.xml` 控制的。

Logback 日志输出位置和格式的设置：

- 通过 `logback.xml` 中的 `<appender>` 标签可以设置输出位置和日志信息的详细格式。
- 通常可以设置 2 个日志输出位置，一个是控制台，一个是系统文件。

输出到控制台的配置标志：

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
```

输出到系统文件的配置标志：

```xml
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
```

- `appender` 标签的 `name` 属性可以设置为别的，至于是输出到控制台还是文件完全由 `class` 属性决定。

## Logback 日志级别

日志级别程度依次是 `TRACE`<`DEBUG`<`INFO`<`WARN`<`ERROR`，默认级别是 `debug` (忽略大小写)，对应其方法。日志级别用于控制系统中哪些日志级别是可以输出的，只输出级别不低于设定级别的日志信息。`ALL` 和 `OFF` 分别是打开全部日志信息，及关闭全部日志信息。

具体在 `<root level="INFO”>` 标签的 `level` 属性中设置日志级别。`<root>` 可以包含零个或多个 `<appender-ref>` 标签，标识这个输出位置将会被本日志级别控制 (总开关)。

```xml
<root level="INFO">
  <appender-ref ref="CONSOLE"/>
  <appender-ref ref="FILE"/>
</root>
```
