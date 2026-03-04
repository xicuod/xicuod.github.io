---
weight: 10
slug: springboot-web-quickstart
title: SpringBootWeb 快速入门
---

## Web 前后端分离开发模式

前后端混合开发：沟通成本高，分工不明确，不便管理，不便维护和扩展。

前后端分离开发：前后端由不同的团队负责，他们共同遵守接口文档的开发规范，最后异步开发的前后端工程可以无缝结合。

### YApi 接口文档管理平台

[YApi](https://yapi.pro/) 是高效、易用、功能强大的 api 管理平台，旨在为开发、产品、测试人员提供更优雅的接口管理服务。

- API 接口管理、Mock 服务 (模拟测试数据)

### 前后端分离开发流程

1. 查看页面原型，明确需求
2. 阅读接口文档
3. 思路分析
4. 接口开发
5. 接口测试
6. 前后端联调

## Spring Boot Web 后端开发

使用 SpringBoot 开发一个 Web 后端应用，浏览器请求 `/hello`，Web 后端应用返回 `Hello World`。

1. IntelliJ IDEA Ultimate 创建 SpringBoot 工程，并勾选 Web 开发相关依赖
2. 定义 `group.id.controller.HelloController` 类，并添加 `RestController` 注解来标识它为请求处理类
3. 在类中添加 `hello` 方法，并添加 `RequestMapping("/hello")` 注解来指定方法处理的请求路径
4. 运行测试

## SpringBootWeb 项目结构

- `pom.xml`
  - `<parent>` 标签中的是父工程 SpringFramework 的 maven 坐标，所有的 SpringBoot 工程都继承自 SpringFramework 父工程
  - 使用的依赖：`spring-boot-starter-web` SpringBoot 的 Web 开发起步依赖、`spring-boot-starter-test` SpringBoot 单元测试起步依赖
  - 使用的构建插件：`spring-boot-maven-plugin` SpringBoot 的 Maven 插件

- `src/main/java/group/id/`
  - `ArtifactNameApplication.java`：SpringBoot 应用的启动类

- `src/main/resources/`
  - `application.properties`：SpringBoot 配置文件
  - SpringBoot 项目的静态资源 (html+css+js 等前端资源) 默认存放目录为：`classpath:/static`、`classpath:/public`、`classpath:/resources`
  - SpringBoot 中的 `classpath` 一般包括 `src/main/resources`

起步依赖：

- `spring-boot-starter-web`：包含了 web 应用开发所需要的常见依赖。
- `spring-boot-starter-test`：包含了单元测试所需要的常见依赖。
- 官方提供的 `starter`：[https://docs.spring.io/spring-boot/docs/2.7.4/reference/htmlsingle/#using.build-systems.starters](https://docs.spring.io/spring-boot/docs/2.7.4/reference/htmlsingle/#using.build-systems.starters)
