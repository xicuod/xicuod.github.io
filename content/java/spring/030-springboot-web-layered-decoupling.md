---
weight: 30
slug: springboot-web-layered-decoupling
title: SpringBootWeb 分层解耦
---

## Web 开发的三层架构

- Controller：接收请求、响应数据
- Service：逻辑处理
- Dao：数据访问

具体地说：

- `controller`：控制层，接收前端发送的请求，对请求进行处理，并响应数据。
- `service`：业务逻辑层，处理具体的业务逻辑。
- `dao`, Data Access Object：数据访问层 (持久层)，负责数据访问操作，包括数据的增删改查。

![Web 开发的三层架构](https://img.xicuodev.top/2026/03/708603e6360fc5b4bea858c312b1dda4.webp "Web 开发的三层架构")

面向接口编程：`Service` 和 `Dao` 会有不同的实现，需要抽象出相应的接口。

- 内聚：软件中各个功能模块内部的功能联系。
- 耦合：衡量软件中各个层或模块之间的依赖、关联的程度。
- 软件设计原则：高内聚低耦合。

## 控制反转与依赖注入 IOC & DI

![控制反转与依赖注入](https://img.xicuodev.top/2026/03/2eac92bdb38ef4fab14644c4ba1fe836.webp "控制反转与依赖注入")

- 控制反转 (IOC, Inversion Of Control)：对象的创建控制权由程序自身转移到外部 (容器)，这种思想称为控制反转。
- 依赖注入 (DI, Dependency Injection)：容器为应用程序提供运行时所依赖的资源，称之为依赖注入。
- Bean 对象：IOC 容器中创建和管理的对象，称之为 `bean`。

## IOC 和 DI 的实现

IOC 的实现：`Service` 和 `Dao` 接口的实现类上加 `@Component` 注解，来把它们交给 IOC 容器管理，成为 `bean` 组件。替换实现类时，只需注释掉原来实现类的 `@Component`，加上现在实现类的 `@Component` 即可。

DI 的实现：在 `Controller` 业务类和 `Service` 实现类的 `service` 和 `dao` 字段上加 `@Autowired` 注解，来自动注入 IOC 容器中的 `bean` 依赖。(现不推荐字段注入，可使用构造器注入和 Setter 注入)

IOC 的实现细节：

- `@Component`：声明 `bean` 的基础注解，不属于以下三类时再用该注解
- `@Controller`：`@Component` 的衍生注解，标注在控制器类上
- `@Service`：`@Component` 的衍生注解，标注在业务类上
- `@Repository`：`@Component` 的衍生注解，标注在数据访问类上 (由于与 mybatis 整合，用的少)
- 以上四个注解都可以声明 bean，但在 springboot 集成 web 开发中，声明控制器 `bean` 只能用 `@Controller` 而不能用 `@Component`
- IOC 注解的参数：只有一个 `value`，为 `bean` 的名称，默认是实现类名字的首字母小写，如 `@Service("stuServiceA")`，一般不用特别指定

Bean 组件扫描：

- 前面声明 `bean` 的四大注解，要想生效，还需要被 `@ComponentScan` 组件扫描注解扫描，默认扫描当前包及其子包，可以设置 `value` 属性为要扫描的包名的数组自定义扫描范围 (一般不这么做，按 Spring Boot 项目的规范放 `bean` 即可扫描)。
- `@ComponentScan` 注解虽然没有显式配置，但是实际上已经包含在了 `@SpringBootApplication` 启动类声明注解中，默认扫描的范围是启动类所在包及其子包。

DI 的实现细节：

- `@Autowired` 注解默认按类型注入 `bean` 依赖，如果存在多个相同类型的 `bean`，将会报出 `required a single bean` 错误字样
- 解决一个容器装多个 `bean` 不知道注入哪个的问题：
  - `@Component`+`@Primary` 指定主要 `bean`，会优先注入
  - `@Autowire`+`@Qualifier` 直接指定要注入的 `bean` 名，设置 `value` 属性为要注入的 `bean` 名
  - `@Resource` 直接指定要注入的 `bean` 名，设置 `name` 属性为要注入的 `bean` 名，默认按名称注入，这是 JDK 提供的注解，更原生
