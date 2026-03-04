---
weight: 130
slug: jakarta-servlet-filter
title: JavaWeb 过滤器
---

过滤器 `jakarta.servlet.Filter` 是 JavaWeb 三大组件 `Servlet`、`Filter`、`Listener` 之一。过滤器可以把对资源的请求拦截下来，从而实现一些特殊的功能，一般是一些通用的操作，如登录校验、统一编码处理、敏感字符处理等，处理后需要放行请求。响应时，资源会回到过滤器，过滤方法从放行处继续往下执行，此时过滤器可执行放行后的逻辑。

过滤器快速入门：

- 定义 `Filter`：定义一个类，实现 `Filter` 接口，并重写其所有方法。
- 配置 `Filter`：`Filter` 类上加 `@WebFilter` 注解，配置拦截资源的路径，`urlPattern="/*"` 拦截所有请求。在 SpringBoot 引导类上加 `@ServletComponentScan` 开启 `Servlet` 组件支持。

过滤器拦截路径：

- 拦截具体路径：`/login`，只有访问 `/login` 路径时，才会被拦截
- 目录拦截：`/emps/*`，访问 `/emps` 下的所有资源，都会被拦截
- 拦截所有：`/*`，访问所有资源，都会被拦截

过滤器链：一个 web 应用中可以配置多个过滤器，多个过滤器就形成了一个过滤器链。

- 过滤器执行顺序：注解配置的 `Filter` 的优先级是按照过滤器类名 (字符串) 的自然排序。

![过滤器链](https://img.xicuodev.top/2026/03/c0d2fa7da7ad098354f746f4f49c500c.png "过滤器链")
