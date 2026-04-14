---
weight: 30
slug: springboot-web-layered-decoupling
title: SpringBootWeb 分层解耦
---

## Web 开发的三层架构

- `controller`：控制层（表现层），接收前端发送的请求，对请求进行处理，并响应数据。
- `service`：业务逻辑层（应用层），处理具体的业务逻辑。
- `dao`, data access object：数据访问层（持久层），负责数据访问操作，包括数据的增删改查。

> [!note] 领域层
> 
> 传统的三层架构是没有领域层的，然而为了应对更复杂多变的业务，[微服务架构]({{% sref "java-microservices" %}})和[领域驱动设计]({{% sref "domain-driven-design" %}})引入了领域层。

![Web 开发的三层架构](https://img.xicuodev.top/2026/03/708603e6360fc5b4bea858c312b1dda4.webp "Web 开发的三层架构")

面向接口编程：`Service` 和 `Dao` 会有不同的实现，需要抽象出相应的接口。

- 内聚：软件中各个功能模块内部的功能联系。
- 耦合：衡量软件中各个层或模块之间的依赖、关联的程度。
- 软件设计原则：高内聚低耦合。

## 控制反转与依赖注入 IOC & DI

与分层架构是为了解除层与层之间的耦合一样，控制反转与依赖注入要做的也是解除组件与组件之间的耦合。

![控制反转与依赖注入](https://img.xicuodev.top/2026/03/2eac92bdb38ef4fab14644c4ba1fe836.webp "控制反转与依赖注入")

- 控制反转 (IOC, Inversion Of Control)：对象的**创建控制权**由程序自身转移到外部 (容器)，这种思想称为控制反转。
- 依赖注入 (DI, Dependency Injection)：容器为应用程序提供运行时所依赖的资源，称之为依赖注入。
- Bean 对象：IOC 容器中创建和管理的对象，称之为 `bean`。

IOC 的实现：`Service` 和 `Dao` 接口的实现类上加 `@Component` 注解，来把它们交给 IOC 容器管理，成为 `bean` 组件。替换实现类时，只需注释掉原来实现类的 `@Component`，加上现在实现类的 `@Component` 即可。

DI 的实现：在 `Controller` 业务类和 `Service` 实现类的 `service` 和 `dao` 字段上加 `@Autowired` 注解，来自动注入 IOC 容器中的 `bean` 依赖。(现不推荐字段注入，可使用构造器注入和 Setter 注入)

### IOC 的实现细节

- `@Component`：声明 `bean` 的基础注解，不属于以下三类时再用该注解
- `@Controller`：`@Component` 的衍生注解，标注在控制器类上
- `@Service`：`@Component` 的衍生注解，标注在业务类上
- `@Repository`：`@Component` 的衍生注解，标注在数据访问类上 (由于与 mybatis 整合，用的少)

以上四个注解都可以声明 bean，但在 spring boot web 开发中，声明控制器 `bean` 只能用 `@Controller` 而不能用 `@Component`。

Bean 注解的参数：只有一个 `value` 为 `bean` 名，默认实现类名的首字母小写，如 `@Service("stuServiceA")`，一般不用特别指定。

`@ComponentScan` Bean 组件扫描：前面声明 `bean` 的四大注解要想生效，还需要通过 `@ComponentScan` 扫描，它默认扫描当前包及其子包，可以设置 `value` 属性为要扫描的包名的数组自定义扫描范围（一般 bean 不会放到外面，不需要这么做）。`@ComponentScan` 虽然没有显式配置，但是实际上已经包含在 `@SpringBootApplication` 中，扫描启动类所在包及其子包中的 bean。

### DI 的实现细节

`@Autowired` 注解默认按类型注入 `bean` 依赖，如果存在多个相同类型的 `bean`，会报 `required a single bean`。一个容器装多个同类型 `bean` 不知道注入哪个。解决：

- `@Component` + `@Primary` 指定主要 `bean`，会优先注入
- `@Autowire` + `@Qualifier` 直接指定要注入的 `bean` 名，设置 `value` 属性为要注入的 `bean` 名
- `@Resource` 直接指定要注入的 `bean` 名，设置 `name` 属性为要注入的 `bean` 名，默认按名称注入，这是 JDK 提供的注解，更原生
- spring推荐的构造器注入：Lombok `@RequiredArgsConstructor` + `final` 修饰要注入的字段
