---
weight: 20
title: .NET日志(2)：M.E.Logging
slug: dotnet-logging-microsoft-extensions-logging
---

`ILogger` 并不是一个 BCL (Basic Class Library，基础类库) 接口，而是来自于 `Microsoft.Extensions.Logging` 包。如果你是一个类库作者，你可以引用 `Microsoft.Extensions.Logging.Abstraction` 抽象依赖，因为开发类库通常用不上这些具体实现。

- `LoggerFactory` 日志记录器工厂：
  - `Create` 静态方法：创建一个工厂
  - `CreateLogger<>` 方法：创建一个日志记录器

```cs
LoggerFactory.Create(builder => { builder.AddConsole(); });
ILogger logger = loggerFactory.CreateLogger<Program>();
```

- `ILogger` 日志记录器：
  - `Log` 方法：`logLevel`, `eventId`([事件 ID](#日志事件-id)), `message`
  - `LogInformation` 等扩展方法：封装 `Log` 方法，常用

## 结构化日志记录 / 语义化日志记录

不要使用字符串拼接、模板字符串或格式字符串来传递日志消息，这会导致具体的参数值 “烘焙” 到日志消息中，从而丢失 `OriginalFormat` (原始格式)。我们希望捕获上下文、作用域、细节和信息，而这正是消息模板字符串和 “结构化日志记录” 所解决的问题。

- `Microsoft.Extensions.Logging.Console`：
  - `ILoggingBuilder.AddJsonConsole` 方法：控制台输出结构化的 JSON 日志

```cs
using var loggerFactory = LoggerFactory.Create(builder => { builder.AddJsonConsole(); });

var logger = loggerFactory.CreateLogger<Program>();

logger.LogInformation("Hello World! It is {At}.", DateTime.UtcNow);

//{"EventId":0,"LogLevel":"Information","Category":"Program","Message":"Hello World! It is 12/12/2025 02:17:20.","State":{"Message":"Hello World! It is 12/12/2025 02:17:20.","At":"12/12/2025 02:17:20","{OriginalFormat}":"Hello World! It is {At}."}}
```

## 日志类别约定

日志类别通常约定为注入或使用 `ILogger<类>` 的类名。从.NET 6 开始，任何自动的依赖注入服务都不会自动注入非泛型的 `ILogger`。

## 日志级别约定

默认情况下，无论是 JSON 控制台还是普通控制台，它们的最低日志级别都是 `Information`，这意味着它们会完全忽略 `Debug` 或 `Trace` 级别的日志。

- 要设置最低日志级别，使用 `ILoggingBuilder.SetMinimumLevel` 方法：

```cs
builder.SetMinimumLevel(LogLevel.Trace);
```

在现代应用程序中，尤其是 ASP.NET Core 中，这类配置通常会集中放在相应的 `appsettings.json` 文件中，或你正在使用的其他配置提供程序中。这会自动配置最低日志级别，无需在代码中手动配置。

## 日志事件 ID

事件 ID 用于给一种类型的事件打标签，一个 ID 代表一种事件。

```cs
logger.LogInformation(233, "ID为233的事件发生了。");
```

非常常见的一种做法是，人们会创建一个事件类，用于集中放置事件 ID：

```cs
public class LogEvents {
	public const int SomeEvent = 233;
}
```

现代结构化日志框架有很多为日志打标签的替代方案，然而事件 ID 仍是一个非常强大的工具。

## 主机应用 Host

主机通常需要长时间运行，并为客户提供服务，适用于后台工作进程，常见于 Web 框架。要在非主机控制台应用中使用主机，引入 `Microsoft.Extensions.Hosting` 包。

`Logging` 包提供主机 `IHost` 的 `ConfigureLogging` 扩展方法，接收 `ILoggingBuilder`，从而为主机配置日志服务。

## 自定义 ILogger 日志记录器与 Provider 日志提供程序

配置 `ILogger` 日志记录器：

```cs
builder.AddJsonConsole().SetMinimumLevel(LogLevel.Trace);
```

- `ClearProviders` 方法：清除之前添加的提供程序，从而接着可以换成你想要的

配置 `Provider` 日志提供程序：

```cs
builder.AddJsonConsole(options => {  
    options.IncludeScopes = false;  //禁用作用域
    options.TimestampFormat = "[yyyy-MM-dd HH:mm:ss] ";  
    options.JsonWriterOptions = new JsonWriterOptions {  
	    Indented = true  //以缩进形式输出JSON
	};
});

/* {
    "Timestamp": "[2025-12-12 11:15:07] ",
    "EventId": 233,
    "LogLevel": "Information",
    "Category": "Program",
    "Message": "Hello World! It is 12/12/2025 03:15:07.",
    "State": {
        "Message": "Hello World! It is 12/12/2025 03:15:07.",
        "At": "12/12/2025 03:15:07",
        "{OriginalFormat}": "Hello World! It is {At}."
    }
} */
```

## 在`appsettings.json`中配置日志服务

你不应该每次为了调整日志配置，都必须修改代码中的日志逻辑，并重新部署应用程序，而是应该将这些配置放在外部的配置文件中。

`appsettings.json` 是大多数类型的应用程序项目模板中的标准配置文件，包括针对特定环境的版本 `appsettings.Development.json` 和不区分环境的通用版本 `appsettings.json`。

```json
"Logging": {
    "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
    },
    "Console": {
        "LogLevel": {
            "Default": "Information",
            "Microsoft.AspNetCore": "Information"
        }
    },
    "FormatterName": "json",
    "FormatterOptions": {
        "SingleLine": true,
        "IncludeScopes": true,
        "TimestampFormat": "HH:mm:ss",
        "UseUtcTimestamp": true,
        "JsonWriterOptions": {
            "Indented": true
        }
    }
}
```

## 日志记录异常

你可以捕获异常，并把它放到 Log 方法的第一个参数，来记录异常日志。

```cs
try {
	throw new Exception("Something went wrong");
} catch (Exception ex) {
	logger.LogWarning(ex, "Failure during birthday of {Name} who is {Age}", name, age);
}
```

## 日志过滤器

通过 `LoggingBuilder.AddFilter` 方法设置日志过滤器，它接收返回布尔值的委托。这个委托可以不传参数，也可以传入提供程序 `provider`、类别 `category` 和级别 `logLevel`。之前设置最低日志级别时，背后就是用到了日志过滤器。

- `AddFilter<SomeProvider>(类别, 级别)` 可以针对 `SomeProvider` 过滤。

不过，这种方式更可能在你为他人开发类库时派上用场，而不是在构建微服务这类服务时，因为大多数配置实际上都会放在你的 `appsettings.json` 中。但知道你拥有灵活性，以备不时之需，总是好的。

## 日志提供程序 LoggerProvider

控制台是临时日志提供程序，一旦停止运行，它和它的日志缓存就不存在了，它们不是持久化的。相反，文件系统就是能够持久存储日志的提供程序。

- ASP.NET Core 显式或隐式内置了 `Microsoft.Extensions.Logging` 的 `Console`、`Debug`、`EventLog`、`EventSource` 和 `TraceSource` 提供程序。
- Microsoft Azure 的云端日志提供程序：`ApplicaitonInsights`。

在控制台中配置 `ApplicaitonInsights` 提供程序：

- 引入 NuGet 包：
  - `Microsoft.ApplicaitonInsights`
  - `Microsoft.Extensions.DependencyInjection`
  - `Microsoft.Extensions.Options.ConfigurationExtensions`
  - `Microsoft.Extensions.Logging`
  - `Microsoft.Extensions.Logging.ApplicaitonInsights`

```cs
using var channel = new InMemoryChannel();
try
{
	IServiceCollection services = new ServiceCollection();
	services.Configure<TelemetryConfiguration>(x => x.TelemetryChannel = channel);
	services.AddLogging(x =>
	{
		x.AddApplicationInsights(
			configureTelemetryConfiguration: teleConfig =>
				teleConfig.ConnectionString = "your_connection_string",
			configureApplicationInsightsLoggerOptions: _ => {}
		);
	});
	var serviceProvider = services.BuildServiceProvider();
	var logging = serviceProvider.GetRquiredService<ILogger<Program>>();
	logging.LogInformation("Hello from console!");
}
finally
{
	await channel.FlushAsync(default);
	await Task.Delay(1000);
}
```

## 根据不同的运行环境配置不同的日志提供程序

在生产环境中，你不希望日志泛滥。你需要对日志行为非常精准地控制，像在生产环境中使用控制台日志记录，可能会拖垮应用程序的性能。在 ASP.NET Core 中，`builder.Environment.IsDevelopment` 方法可以返回当前是否在开发环境。

- 这里要获取 `ILoggingBuilder`，使用 `builder.Logging` 属性。
- 与开发环境 (`Development`) 平行的是生产环境 (`Production`)。

## 自定义日志提供程序

要自定义日志提供程序，实现 `ILogger` 和 `ILoggerProvider` 接口，并在你的 `LoggerProvider` 的 `CreateLogger` 方法中返回你的 `Logger`。

- `ILogger` 接口：
  - `TState` 泛型：包含实际日志消息的参数的泛型
  - `BeginScope` 方法：开启作用域
  - `IsEnabled` 方法：返回是否启用
  - `Log` 方法：如果启用，记录日志

## 日志消息模板字符串

- `{Total:C}`：当前文化的货币格式
- `{Date:F}`：当前文化的日期完整格式
- `{Date:u}`：universal sortable date，通用可排序日期格式

要实现复杂类型数据的格式化和结构化，你不得不使用 `JsonSerializer`。此时，如果你又要使用 `JsonConsole`，会出现 JSON 嵌套在 JSON 中的情况，你必须谨慎处理这里的序列化过程。

## 日志作用域 Log Scope

在代码中，存在一段从开始到结束都需要处理特定上下文的区域，这个上下文可能是某种特定的支付、特定的订单、购物车，或者任何在你的业务领域中有意义的内容。尽管一些日志是独立的，但它们所关联的大量数据都与特定的上下文相关。

- `JsonConsole` 的 `Options`：
  - `IncludeScopes` 属性：是否包含作用域；为 `true` 时，结果中将出现 `Scopes` 属性，它是一个数组，包含所有上下文数据

```cs
using (logging.BeginScope("{PaymentId}", paymentId))
using (logging.BeginScope("{TotalAmount:C}", amount))
{
	try
	{
		logger.LogInformation("New payment processing");
		//processing new payment
	}
	finally
	{
		logger.LogInformation("Payment processing completed");
	}
}
```

- `PaymentId` 和 `TotalAmount` 将作为上下文数据由作用域内的所有日志共享，它们将包含在这些日志的 `Scopes` 数组中。

## 检查日志是否启用

虽然日志提供程序通常都会在 `Log` 方法的开头检查是否启用，但是为以防万一，你应该在自己的代码中也加入 `IsEnabled` 的判断，以确保没有性能问题。

## 日志记录操作耗时

下面是利用 `Stopwatch` 类和日志上下文机制记录操作耗时的方法。

`Stopwatch` 类是.NET 中测量时间最精确的方案：

- `GetTimestamp` 静态方法：获取当前时间戳
- `GetElapsedTime` 静态方法：获取传入时间戳到现在的时间间隔

可以用 `Stopwatch` 类结合作用域机制，获取并记录操作耗时。

创建 `TimedOperation` 类，聚合`_logger`、`_logLevel`、`_eventId`、`_message` 和 `_args`，实现 `IDisposable` 接口：

- 在构造方法中获取当前时间戳
- 在 `Dispose` 方法获取时间间隔，并调用`_logger.Log` 方法记录耗时日志

创建 `TimedOperationExtensions` 类，扩展以支持 `ILogger` 接口：

- `BeginTimedOperation` 方法：创建并返回 `TimedOperation` 对象，用作上下文数据
- 创建一个不传入 `LogLevel` 的 `BeginTimedOperation` 方法重载，并默认使用 `Information` 级别

```cs
using (logger.BeginTimedOperation("Handling new payment"))
{
	logger.LogInformation("New payment processing");
	//processing new payment
	await Task.Delay(10);
}
```

## 运行时动态修改最低日志级别

在你的应用程序中，只要支持在运行时热重载或动态重载 `appsettings.json` 配置文件，就可以实现运行时动态修改最低日志级别这一功能。而这就是配置提供程序要做的事情了。
