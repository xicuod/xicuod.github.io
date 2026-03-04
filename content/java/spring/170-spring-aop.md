---
weight: 170
slug: spring-aop
title: Spring AOP
---

**面向切面编程** (面向方面编程，AOP，Aspect Oriented Programming) 其实就是面向特定方法编程。

- 典型 AOP 场景：案例部分功能运行较慢，定位执行耗时较长的业务方法，此时需要统计每一个业务方法的执行耗时

动态代理是面向切面编程最主流的实现。Spring AOP 是 Spring 框架的高级技术，旨在管理 bean 对象的过程中，主要通过底层的动态代理机制，对特定的方法进行编程。

## Spring AOP 快速入门

1. 导入依赖：在 `pom.xml` 中导入 AOP 的依赖
2. 编写 AOP 程序：针对于特定方法根据业务需要进行编程

```java
@Slf4j
@Component
@Aspect
public class TimeAspect {
	@Around("execution(* com.ror.demo.service.*.*(..))")
  public Object recordTime(ProceedingJoinPoint joinPoint) throws Throwable {
    long begin = System.currentTimeMillis();
    Object result = joinPoint.proceed();
    long end = System.currentTimeMillis();
    log.info("方法执行耗时：{}ms", end - begin);
    return result;
  }
}
```

- `@Around` 指定该切面的切入点表达式 (作用范围)

AOP 场景：记录操作日志、权限控制、事务管理

AOP 优势：代码无侵入、减少重复代码、提高开发效率、维护方便

AOP 核心概念：

- 连接点 (JoinPoint)：可以被 AOP 控制的方法 (暗含方法执行时的相关信息)
- 通知 (Advice)：作用于连接点的那些重复的逻辑，也就是共性功能 (最终体现为一个方法)
- 切入点 (PointCut)：匹配连接点的条件，通知仅会在切入点方法执行时被应用
- 切面 (Aspect)：描述通知与切入点的对应关系 (通知 + 切入点)
- 目标对象 (Target)：通知所应用的对象

## Spring AOP 的底层实现

动态代理，非侵入式的增强原始方法的功能，依赖注入时改为注入代理对象。

![Spring AOP 执行流程](https://img.xicuodev.top/2026/03/0a09999d15e530bd70041d033b39e12d.png "Spring AOP 执行流程")

## Spring AOP 通知类型

- `@Around`：环绕通知，此注解标注的通知方法在目标方法前、后都被执行
- `@Before`：前置通知，此注解标注的通知方法在目标方法前被执行
- `@After`：后置通知，此注解标注的通知方法在目标方法后被执行，无论是否有异常都会执行
- `@AfterReturning`：返回后通知，此注解标注的通知方法在目标方法后被执行，有异常不会执行
- `@AfterThrowing`：男异常后通知，此注解标注的通知方法发生异常后执行

注意事项：

- `@Around` 环绕通知需要自己调用 `ProceedingJoinPoint.proceed()` 来让目标方法执行，其他通知不需要考虑目标方法执行。
- `@Around` 环绕通知方法的返回值必须指定为 `Object` 来接收原始方法的返回值。
- `@Pointcut`：将公共的切点表达式抽取出来，需要用到时引用该切点表达式即可。它为空方法定义切入点，其他方法可以直接引用该方法来设置同一切入点。设置空方法访问权限为 `public` 来在其他类中复用切入点。

## Spring AOP 通知顺序

当有多个切面的切入点都匹配到了目标方法，目标方法运行时，这多个通知方法都会被执行，它们的执行顺序：

- 不同切面类中，默认按照切面类的类名字母排序：
  - 目标方法前的通知方法：字母排名靠前的先执行
  - 目标方法后的通知方法：字母排名靠前的后执行

- 把 `@Order(数字)` 加在切面类上来控制顺序：
  - 目标方法前的通知方法：数字小的先执行
  - 目标方法后的通知方法：数字小的后执行

## Spring AOP 切入点表达式

切入点表达式是描述切入点方法的一种表达式，主要用来决定项目中的哪些方法需要加入通知。

切入点表达式的常见形式：

- `execution(...)`：根据方法签名匹配
- `@annotation(...)`：根据注解匹配

### `execution` 方式：根据方法签名匹配

`execution` 主要根据方法的返回值、包名、类名、方法名、方法参数等信息来匹配：

```java
execution(访问修饰符? 返回值 包名.类名.?方法名(方法参数) throws 异常?)
```

其中带`?` 的表示可以省略的部分：

- `访问修饰符?`：可省略，如 `public`、`protected`
- `包名.类名?`：可省略
- `throws 异常?`：可省略 (注意是方法上声明抛出的异常，不是实际抛出的异常)

可以使用通配符描述切入点：

- `*`：单个独立的任意符号，可以通配任意返回值、包名、类名、方法名、任意类型的一个参数，也可以通配包、类、方法名的一部分
  - `execution(* com.*.service.*.update*(*))`，`update*` 表示方法名以 `update` 开头
- `..`：多个连续的任意符号，可以通配任意层级的包，或任意类型任意个数的参数
  - `execution(* com.itheima..DeptService.*(..))`

根据业务需要，可以使用且 `&&`、或 `||`、非`!` 来组合比较复杂的切入点表达式：`execution(...) || execution(...)`

实践建议：

- 所有业务方法名在命名时尽量规范，方便切入点表达式快速匹配。如查询方法都是 `find` 开头，更新方法都是 `update` 开头。
- 描述切入点方法通常基于接口描述，而不是直接描述实现类，增强拓展性。
- 在满足业务需要的前提下，尽量缩小切入点的匹配范围。如包名匹配尽量不使用`..`，使用 `*` 匹配单个包。

### `@annotation` 方式：根据注解匹配

`@annotation` 切入点表达式用于匹配标识有特定注解的方法，一般配合自定义注解使用。

```java
@annotation(com.itheima.anno.Log)
```

## Spring AOP 连接点 `JoinPoint`

Spring 用 `JoinPoint` 抽象了连接点，用它可以获得方法执行时的相关信息，如目标类名、方法名、方法参数等。

- 对于 `@Around` 通知，获取连接点信息只能使用 `ProceedingJoinPoint`
- 对于其他四种通知，获取连接点信息只能使用 `JoinPoint`，它是 `ProceedingJoinPoint` 的父类

```java
@Around("execution(* com.itheima.service.DeptService.*(..))")
public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
  String className = joinPoint.getTarget()·getClass().getName(); //获取目标类名
  Signature signature = joinPoint.getSignature(); //获取目标方法签名
  String methodName = joinPoint.getSignature().getName(); //获取目标方法名
  Object[] args = joinPoint.getArgs(); //获取目标方法运行参数
  Object res = joinPoint.proceed(); //执行原始方法，获取返回值(环绕通知)
  return res;
}
```

```java
@Before("execution(*com.itheima.service.DeptService.*(..))")
public void before(JoinPoint joinPoint) {
  String className = joinPoint.getTarget().getClass().getName(); //获取目标类名
  Signature signature = joinPoint.getSignature(); //获取目标方法签名
  String methodName = joinPoint.getSignature().getName(); //获取目标方法名
  Object[] args = joinPoint.getArgs(); //获取目标方法运行参数
}
```
