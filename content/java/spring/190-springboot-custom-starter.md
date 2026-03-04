---
weight: 190
slug: springboot-custom-starter
title: SpringBoot 自定义起步依赖
---

> 在实际的项目开发当中，我们可能会用到很多第三方的技术，并不是所有的第三方的技术官方都给我们提供了与 springboot 整合的 `starter` 起步依赖，但是这些技术又非常通用，很多项目组当中都在使用。

在实际开发中，开发者经常会为一些 SDK 定义一些用作起步的公共组件，提供给各个项目团队使用。而在 SpringBoot 的项目中，一般会将这些公共组件封装为 SpringBoot 的 `starter` 起步依赖。

Starter 包命名规范：

- SpringBoot 官方提供的：`spring-boot-starter-xxx`
- 其它技术团队提供的：`xxx-spring-boot-starter`

Starter 包组成：

- 依赖管理功能：`spring-boot-starter-xxx` 或 `xxx-spring-boot-starter`
- 自动配置功能：`spring-boot-autoconfigure` 或 `xxx-spring-boot-autoconfigure`

依赖管理引入其他依赖和自动配置，自动配置装配 `bean` 实例。

## 自定义 `aliyun-oss-spring-boot-starter`

- 需求：自定义 `aliyun-oss-spring-boot-starter`，完成阿里云 OSS 操作工具类 `AliyunOSSUtils` 的自动配置。
- 目标：引入起步依赖之后，要想使用阿里云 OSS，注入 `AliyunOSSUtils` 直接使用即可。
- 步骤：
  1. 创建 `aliyun-oss-spring-boot-starter` 模块
  2. 创建 `aliyun-oss-spring-boot-autoconfigure` 模块，在 `starter` 中引入该模块
  3. 在 `aliyun-oss-spring-boot-autoconfigure` 模块中的定义自动配置功能，并在 `src/main/resources` 中创建并定义自动配置文件：`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`，这是 SpringBoot 约定的起步依赖的自动配置文件的加载路径 (见 `@EnableAutoConfiguration` 的底层实现)

> [!note] 弹幕的提示
>
> 没有 `idea` 的 `iml` 文件的，按两下 `ctrl`，在弹出的窗口的右上角 `project` 下拉选项选你要生成文件的模块名，然后运行 `mvn idea:module` 就有了。

## `@EnableConfigurationProperties(MyProperties.class)`：显式启用 `MyProperties` 类的配置文件绑定

`@EnableConfigurationProperties` 通常放在一个**配置类** (带有 `@Configuration` 注解的类) 上，或者一个**主应用类** (带有 `@SpringBootApplication` 或 `@EnableAutoConfiguration` 的类) 上，因为它是用于配置的注解，这两个地方是最合适的。

`@EnableConfigurationProperties(MyProperties.class)` 的作用：如果 `MyProperties` 类使用了 `@ConfigurationProperties` 注解，那么 `MyProperties` 类会与 `application.properties` 等 SpringBoot 应用的配置文件动态绑定，并且 SpringBoot 会将 `MyProperties` 类加入 IOC 容器中，交由 IOC 容器管理。

关联配置类和配置文件的方式：

- 在应用程序的开发场景下，使用 `@ConfigurationProperties` + `@Component` 注解
- 在框架或库的开发场景下，使用 `@ConfigurationProperties` + `@EnableConfigurationProperties` 注解 (本文要做的)

## 参考资料

- https://www.cnblogs.com/xiaomaomao/p/13934688.html
