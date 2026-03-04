---
weight: 180
slug: springboot-bean
title: SpringBoot Bean
---

## `ApplicationContext` 类：获取 `Bean` 实例

默认情况下，Spring 项目启动时，会把 `bean` 都创建好放在 IOC 容器中，如果想要主动获取这些 `bean`，可以通过注入 `ApplicationContext` 上下文对象 (IOC 容器对象)，然后通过如下方式：

- 根据 `name` 获取 `bean`：`Object getBean(String name)`
- 根据类型获取 `bean`：`<T> T getBean(Class<T> requiredType)`
- 根据 `name` 获取 `bean` (带类型转换)：`<T> T getBean(String name, Class<T> requiredType)`

上述所说的 “Spring 项目启动时，会把其中的 `bean` 都创建好” 还会受到作用域和延迟初始化的影响，这里主要针对于默认的单例非延迟加载的 `bean` 而言。

## `Bean` 作用域

Spring 支持五种作用域，后三种在 web 环境才生效：

- `singleton`：(默认) 容器内同名称的 `bean` 只有一个实例 (单例)
- `prototype`：每次使用该 `bean` 时会创建新的实例 (非单例)
- `request`：每个请求范围内会创建新的实例 (web 环境中，了解)
- `session`：每个会话范围内会创建新的实例 (web 环境中，了解)
- `application`：每个应用范围内会创建新的实例 (web 环境中，了解)

`Bean` 相关注解：

- `@Scope("作用域名")`：配置 `bean` 的作用域
- `@Lazy`：懒加载，用时才创建 `bean` 实例

实际开发当中，绝大部分的 `Bean` 是单例的，也就是说绝大部分 `Bean` 不需要配置 `Scope` 注解。

## `@Bean`：第三方 `Bean` 管理

如果要管理的 `bean` 对象来自于第三方 (不是自定义的)，是无法用 `@Component` 及衍生注解声明 `bean` 的 (本包扫描不到)，就需要用到 `@Bean` 注解。

使用 `@Bean` 注解：在 `@Configuration` 注解的配置类中添加 `@Bean` 注解的方法，让它返回需要的 `bean` 实例，即可注入 IOC 容器。

- `@Bean` 注解的 `name`/`value` 属性用于指定 `bean` 的名称，默认是方法名。
- 如果第三方 `bean` 需要依赖其它 `bean` 对象，直接在 `bean` 定义方法中设置形参即可，容器会根据类型自动装配。

> [!note] `@Bean` 的另一个好处
>
> `@Bean` 方式除了能装配原本不是 `bean` 的第三方类，还有一个好处就是能在装配前执行一些非侵入式的初始化逻辑。这意味着也可以酌情使用 `@Bean` 方式来为自己、为别人装配 `bean`：
>
> - 为自己：细粒度地集中管理配置 `bean`，无论是自己的还是第三方的。
> - 为别人：自己作为第三方框架或库的作者，使用 `@AutoConfiguration` 自动配置注解，配合 `@Conditional` 条件装配注解提供 `bean` 给别人用，这样就不用麻烦别人写配置类用 `@Bean` 把我们的类装配为 `bean` 了。
