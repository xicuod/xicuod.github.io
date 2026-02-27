---
weight: 10
title: .NET日志(1)：概论
slug: dotnet-logging-introduction
---

## 日志类别 Log Category

日志类别只是一种逻辑方式，用于将不同的日志条目归类到某种统一的分组下。例如，如果你正在运行一个 API，微软会将其自身的所有日志归类在 `Microsoft.Asp.Core` 这个类别或分组下，你也可以控制自己的日志类别。

- `ILogger<类>`：通常是当前类，如 `ILogger<Program>`
- `LogInformation` 方法：打印 `info` 级别的日志

```log
info: Program[0]
      Hello World!
```

- `Program`：日志类别
- `[0]`：[日志事件 ID]({{% sref "dotnet-logging-microsoft-extensions-logging#日志事件-id" %}})

## 日志级别 Log Level

日记级别代表日志的严重程度：`Trace`<...<`Critical`，详见 `LogLevel` 枚举。

- `Trace` 包含最详细的记录，甚至可以是敏感记录，不能用于生产环境，默认禁用。
- `Debug` 用于在开发过程中调试程序，一般不用于生产环境。
- `Information` 一般是默认的级别，用于跟踪应用程序的一般流程，可以存储并具有长期价值。
- `Warning` 用于突出异常或意外情况，但并不意味着应用程序崩溃、停止或存在根本性错误。
- `Error` 表示确实崩溃了，应用程序遇到了无法处理的异常。
- `Critical` 表示彻底崩溃，应用程序遇到了不可挽回的致命错误。

## 日志提供程序 Log Provider

日志提供程序是日志的输出目标。目标可以是任何东西，它可以是控制台、事件日志、数据库、第三方服务…… 任何地方。
