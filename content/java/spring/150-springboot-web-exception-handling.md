---
weight: 150
slug: springboot-web-exception-handling
title: SpringBootWeb 异常处理
---

程序开发过程中不可避免的会遇到异常现象，处理方案：

- 方案一：在 `Controller` 的每个方法中 `try-catch` 处理 (代码臃肿，不推荐)
- 方案二：全局异常处理器，类上加 `@RestControllerAdvice` 注解，方法上加 `@ExceptionHandler(Exception.class)` 注解
  - `@RestControllerAdvice`=`@ControllerAdvice`+`@ResponseBody`
  - 注解的 `Rest` 前缀说明方法是有 `@ResponseBody` 的，是可返回响应数据的

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        return Result.error(e.getMessage());
    }
}
```
