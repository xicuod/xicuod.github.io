---
weight: 140
slug: org-springframework-web-servlet-handler-interceptor
title: Spring 拦截器
---

拦截器 `Interceptor` 是一种动态拦截方法调用的机制，类似于过滤器。拦截器是 Spring 框架提供的，用来动态拦截控制器方法的执行。

拦截器作用：拦截请求，在指定的方法调用前，根据业务需要执行预先设定的代码。

拦截器快速入门：

1. 定义拦截器：实现 `org.springframework.web.servlet.HandlerInterceptor` 接口，并重写其所有方法
   - `preHandle` 方法：目标资源方法执行前执行，返回是否放行的布尔值
   - `postHandle` 方法：目标资源方法执行后执行
   - `afterCompletion` 方法：视图渲染完毕后执行，最后执行

2. 注册拦截器：创建配置类实现 `WebMvcConfigurer` 接口，加 `@Configuration` 注解，注入拦截器字段，重写 `addInterceptors` 方法

   ```java
   @Configuration
   public class WebConfig implements WebMvcConfigurer {
       @Autowired
       private HandlerInterceptor authInterceptor;
	
       @Override
       public void addInterceptors(InterceptorRegistry registry) {
           registry.addInterceptor(authInterceptor)
             .addPathPatterns("/**").excludePathPatterns("/login");
       }
   }
   ```

   - `addPathPatterns` 方法：需要拦截哪些资源
   - `excludePathPatterns` 方法：不需要拦截哪些资源

拦截器拦截路径：

- `/*`：匹配一级路径 `/depts`、`/emps`、`/login`，不能匹配 `/depts/1`
- `/**`：匹配任意级路径 `/depts`、`/depts/1`、`/depts/1/2`
- `/depts/*`：匹配 `/depts` 下的一级路径 `/depts/1`，不能匹配 `/depts/1/2`、`/depts`
- `/depts/**`：匹配 `/depts` 下的任意级路径，`/depts`、`/depts/1`、`/depts/1/2`，不能匹配 `/emps/1`

![拦截器执行流程](https://img.xicuodev.top/2026/03/e559dc31a7114ebf2b52d51a741e21f4.png "拦截器执行流程")

过滤器和拦截器的区别：

- 接口规范不同：过滤器需要实现 `Filter` 接口，而拦截器需要实现 `Handlerlnterceptor` 接口。
- 拦截范围不同：`Filter` 会拦截所有的资源，而 `Interceptor` 只会拦截 Spring 环境中的资源。
