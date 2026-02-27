---
weight: 40
title: .NET日志(4)：性能优化
slug: dotnet-logging-performance
---

日志是一个**切面关注点**，日志的记录会影响整个系统的性能。在程序的**热点路径**上，日志记录的开销可能会显著影响应用程序的响应时间和吞吐量，这些日志必须非常轻量、非常高效。

使用日志消息模板字符串时，为了结构化日志，每记录一条日志，日志记录器都需要创建这些参数的数组，并对参数装箱 (因为是 `object[]` 数组)。日志一多，会造成大量内存开销。要优化它，可以使用 `LoggerMessage.Define` 方法来预定义日志消息模板，从而避免在每次记录日志时的装箱和数组分配。

```cs
private static readonly Action<ILogger, int, Exception?> _logUserLoggedIn =
    LoggerMessage.Define<int>(LogLevel.Information,
      new EventId(1, nameof(UserLoggedIn)),
      "User {UserId} has logged in.");

public void UserLoggedIn(int userId)
{
  /* 一些业务代码 */
  _logUserLoggedIn(_logger, userId, null);
}
```

- `Action` 委托使用泛型以**强类型参数**传入 (如 `int`)，减少装箱并更易被 JIT 优化 / 内联。
- `Define` 方法内部会对每种不同参数个数的消息模板使用特定**格式化器**，避免了数组分配。
- `"User {UserId} has logged in."` 是一个编译时常量，会在内存中驻留 (interned)。

这种写法比较繁琐，要解决这个问题，使用 **Source Generator** (源代码生成器，由 `Microsoft.Extensions.Logging.Generators` 提供) 在编译时生成代码，你只需使用 `LoggerMessage` 注解声明 `ILogger` 的扩展方法：

```cs
public static partial class LoggerExtensions
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "User {UserId} has logged in.")]
    public static partial void LogUserLoggedIn(this ILogger logger, int userId);
}
```

通过阅读 `LoggerMessage` 注解，Source Generator 会生成类似上面使用 `LoggerMessage.Define` 的代码，从而实现性能优化，同时让开发体验更好。

使用时，可以直接调用 `LogUserLoggedIn` 扩展方法：

```cs
public void UserLoggedIn(int userId)
{
  /* 一些业务代码 */
  _logger.LogUserLoggedIn(userId);
}
```
