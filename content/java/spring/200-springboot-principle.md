---
weight: 200
slug: springboot-principle
title: Spring Boot 原理
---

Spring Boot 简化了 Spring Framework，可以帮助我们非常快速的构建应用程序、简化开发、提高效率。Spring Boot 主要做了两件事，起步依赖和自动配置，或者说依赖管理和自动装配。

- 起步依赖：利用 maven 的依赖传递，引用起步依赖会同时引用许多必要的依赖。
- 自动配置：当 spring 容器启动后，一些配置类、`bean` 对象就自动存入到了 IOC 容器中，不需要我们手动去声明，从而简化了开发，省去了繁琐的配置操作。

## Spring Boot 自动配置

对于第三方包，光是用 `@Bean` 或 `@Component` 及其衍生注解还不够，Spring Boot 的启动类默认只扫描启动类所在包及其子包，要扫描第三方包及其子包，需要在启动类指定 `@ComponentScan` 的属性或 `@Import` 的属性。

### `@ComponentScan` 组件扫描方式

```java
@ComponentScan({"com.example", "com.itheima"}) /* com.example 是第三方包 */
```

然而，一旦包多起来，使用这种方案会相当繁琐，且大面积扫描性能差。

### `@Import` 组件导入方式

在启动类使用 `@Import` 导入的类会被 Spring 加载到 IOC 容器中，导入形式主要有以下几种：

- 导入普通类：`@Import({TokenParser.class, HeaderConfig.class})`，导入第三方 `bean`
- 导入配置类：`@Import({CommonConfig.class})`，导入第三方 `bean` 集合
- 导入 `ImportSelector` 接口的实现类：实现类重写的 `selectImports` 方法可从文件中读取并返回第三方 `bean` 的全类名的 `String[]`，从而更方便地将更多的第三方 `bean` 交给 IOC 容器管理
- 第三方依赖提供 `@EnableXxxConfig` 注解，封装 `@Import` 注解，相当于第三方为我们提供导入接口 (方便、优雅、主流)

Spring Boot 自动配置的源码跟踪：

- 由启动类（引导类）注解 `@SpringBootApplication` 中封装的 `@EnableAutoConfiguration` 实现
- 详见[视频](https://www.bilibili.com/video/BV1m84y1w7Tb?p=190)

### `@SpringBootApplication` 启动类注解

`@SpringBootApplication` 注解标识在 Spring Boot 工程启动类（main方法即java程序的入口就在这），是 Spring Boot 中最最最重要的注解。该注解由三个部分组成：

- `@SpringBootConfiguration`：与 `@Configuration` 注解作用相同，声明当前也是一个配置类。
- `@ComponentScan`：组件扫描，默认扫描当前引导类所在包及其子包。
- `@EnableAutoConfiguration`：Spring Boot 实现自动化配置的核心注解，底层是导入`.AutoConfiguration.imports` (新) 和`.factories` (旧) 配置文件中指定的各个依赖提供的 `@AutoConfiguration` 自动配置类。

### `@Conditional` 条件化配置

`@Conditional` 在满足给定条件后才会注册对应的 `bean` 对象到 Spring IOC 容器中，一般由框架或库的提供者配合 `@AutoConfiguration` 注解使用，用于编写可复用的自动配置模块。

- `@Conditional` 位置：方法、类

`@Conditional` 本身是一个父注解，派生出大量的子注解：

- `@ConditionalOnClass`：判断环境中有指定类的字节码文件 (`name` 属性)，才注册 `bean` 到 IOC 容器。
- `@ConditionalOnMissingBean`：判断环境中没有对应类型 (`value` 属性) 或名称 (`name` 属性) 的 `bean`，才注册 `bean` 到 IOC 容器。
- `@ConditionalOnProperty`：判断配置文件中有指定属性 (`name` 属性) 和值 (`havingValue` 属性)，才注册 `bean` 到 IOC 容器。

## Spring Boot 原理前置知识

