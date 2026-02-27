---
weight: 30
title: .NET日志(3)：Serilog
slug: dotnet-logging-serilog
---

无论是作用域、`IsEnabled`、格式化或消息模板的概念，还是结构化日志记录，`Serilog` 都是这些功能的开创者和标准化者。

- 对消息模板、结构化日志、参数解析等都有极佳的支持。
- 庞大的 Sinks 家族：`Serilog` 的 `Sinks` 就相当于 `Logging` 中的 `Provider`，而 `Serilog` 的 `Sinks` 可能有几十个甚至上百个。

## 创建 Serilog 日志记录器

- 引入 `Serilog` 包

```cs
var logger = new LoggerConfiguration().CreateLogger();
```

## 配置 Serilog 日志接收器 Sinks

- 想要什么接收器，就引入什么 `Serilog.Sinks.SomeSink` 包
- `LoggerConfiguration.WirteTo` 属性：`Sinks` 扩展该属性以配置它自己，通常是 `SomeSinks` 扩展方法

```cs
var logger = new LoggerConfiguration()  
    .WriteTo.Console(theme: AnsiConsoleTheme.Code)  
    .CreateLogger();
```

- `Serilog.Sinks.Console` 包：
  - `Console` 扩展方法：
    - `theme` 参数：自定义控制台日志的配色方案
- `Serilog.Sinks.File` 包：
  - `File` 扩展方法：
    - `path` 参数
    - `rollingInterval` 参数：滚动间隔，`RollingInterval` 枚举，按多久划分日志文件
    - `rollOnFileSizeLimit` 参数：文件太大时是否使用新文件

## 静态 Serilog 日志记录器

你可以为 `Log` 类的 `Logger` 属性注册一个日志记录器，它将成为全局可用的静态记录器。

```cs
Log.Logger = logger;
```

当你使用多个提供程序时，其中许多提供程序会在内存中缓冲日志，要把缓存实际刷新到每个提供程序，你可以执行 `Log.CloseAndFlush()` 或 `Log.CloseAndFlushAsync()` 以提高效率，避免频繁调用。

## 将 Serilog 集成到 ASP\.NET Core 应用程序

将 `Serilog` 集成为内置日志记录器的一个提供程序，从而有效 “接管” 内置日志记录器。

- 引入 `Serilog.AspNetCore` 包
- 在 `builder.Host` 属性上调用 `UseSerilog` 扩展方法：

```cs
builder.Host.UseSerilog();
```

你可以通过设置静态 `Serilog` 日志记录器来配置 `Serilog` 日志记录器。

## 将 Serilog 集成到非主机应用程序

例如 Avalonia 桌面应用程序，直接使用 `Log.Logger = new LoggerConfiguration()` 初始化，在应用启动早期 (Avalonia 的 `App.OnFrameworkInitializationCompleted` 之前或之内) 完成配置，应用退出时显式调用 `Log.CloseAndFlush()`。

## 用配置文件配置 Serilog

在 `appsettings.json` 中配置 Serilog：

```json
{
	"Serilog": {
		"MinimumLevel": {
			"Default": "Information",
			"Override": {
				"Microsoft.AspNetCore": "Warning"
			}
		},
		"WriteTo": [
			{
				"Name": "Console"
			}
		]
	}
}
```

由于已经在配置文件中完成了所有配置，你不需要在代码中硬编码任何配置，只需要导入配置文件：

```cs
Log.Logger = new LoggerConfiguration()
		.ReadFrom.Configuration(builder.Configuration)
		.CreateLogger();
```

- `builder.Configuration` 是 ASP.NET Core 应用程序的配置对象，通常包含 `appsettings.json` 文件

## Serilog 日志功能增强

`Serilog.Enrichers` 包提供了许多丰富的功能增强，可以为日志事件添加更多上下文信息。

- `Serilog.Enrichers.Environment` 包：添加环境信息
- `Serilog.Enrichers.Thread` 包：添加线程信息
- `Serilog.Enrichers.Process` 包：添加进程信息

除此之外，你还可以通过 `Properties` 属性添加自定义属性。

- 这里使用 Json 格式化器，以便你能够清晰地看到这些增强的属性。

```json
{
	"Serilog": {
		"MinimumLevel": {
			"Default": "Information",
			"Override": {
				"Microsoft.AspNetCore": "Warning"
			}
		},
		"WriteTo": [
			{
				"Name": "Console",
				"Args": {
					"formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
				}
			}
		],
		"Enrich": [ "FromLogContext", "WithMachineName", "WithThreadId", "WithProcessId" ],
		"Properties": {
			"Application": "LoggingDemo",
			"Environment": "Development"
		}
	}
}
```

- "`FromLogContext`"来自日志上下文，"`WithMachineName`"机器名，"`WithThreadId`"线程 ID，"`WithProcessId`" 进程 ID

```json
{"Timestamp":"2025-12-15T23:14:09.1705380+08:00","Level":"Information","MessageTemplate":"Now listening on: {address}","Properties":{"address":"http://localhost:5050","EventId":{"Id":14,"Name":"ListeningOnAddress"},"SourceContext":"Microsoft.Hosting.Lifetime","MachineName":"RORMac","ThreadId":1,"ProcessId":76483,"Application":"LoggingDemo","Environment":"Development"}}
```

## 用配置文件配置`Serilog.Sinks.ApplicationInsights`

```json
{
	"Serilog": {
		"MinimumLevel": {
			"Default": "Information",
			"Override": {
				"Microsoft.AspNetCore": "Warning"
			}
		},
		"WriteTo": [
			{
				"Name": "ApplicationInsights",
				"Args": {
					"connectionString": "your_connection_string",
					"telemetryConverter": "Serilog.Sinks.ApplicationInsights.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"
				}
			}
		]
	}
}
```

`telemetryConverter` 参数指定了使用 `TraceTelemetryConverter`，将日志作为跟踪数据发送到 Application Insights。

## Serilog 结构化日志

在日志消息模板字符串的占位符的开头使用 `@`符号，Serilog 可以将对象序列化为结构化数据：

```cs
logger.Information("User details: {@User}", user);
```

对于实现类似 JS 对象行为的字典 `Dictionary<string, object>`，Serilog 能理解这是一个字典，即使不加 `@`符号也会将其展开为序列化结果：

```cs
var dict = new Dictionary<string, object>
{
		{ "Name", "Alice" },
		{ "Age", 30 },
		{ "IsAdmin", true }
};

logger.Information("User details: {User}", dict);
```

```
[09:18:45 INF] User details: {"Name": "Alice", "Age": 30, "IsAdmin": true}
```

如果你希望将字典作为单个对象记录，而不是展开为多个属性，可以使用 `$` 符号：

```cs
logger.Information("User details: {$User}", dict);
```

```
[09:20:12 INF] User details: System.Collections.Generic.Dictionary`2[System.String,System.Object]
```

尽管这是更小众的用法，但你应该知道你有这种能力，且它在某些情况下可能会有用。

## Serilog 转换结构化数据

如果你只想记录某个类型的某些特定字段，可以创建一个自定义转换器：

```cs
var logger = new LoggerConfiguration()
		.Destructure.ByTransforming<Person>(p => new { p.Name, p.Age })
		.CreateLogger();
```

## Serilog 添加自定义属性到日志上下文

```cs
using (LogContext.PushProperty("UserId", userId))
{
	logger.Information("User logged in.");
}
```

```json
{"Timestamp":"2025-12-15T23:30:00.1234567+08:00","Level":"Information","MessageTemplate":"User logged in.","Properties":{"UserId":42}}
```

## Serilog 记录操作耗时

- 引入 `SerilogTimings` 包
- 使用 `TimeOperation` 扩展方法记录操作耗时：

```cs
using (logger.TimeOperation("Processing order {OrderId}", orderId))
{
	// 模拟处理订单的操作
	await Task.Delay(500);
	logger.Information("Order {OrderId} processed.", orderId);
}
```

你还可以控制操作成功或失败时的不同行为：

```cs
var operation = logger.TimeOperation("Processing order {OrderId}", orderId);
try
{
	await Task.Delay(500);
	/* 这是一段可能会抛出异常的业务代码 */
	if (timeout)
	{
		operation.Abandon(); // 标记操作放弃
		logger.Warning("Order {OrderId} processing timed out.", orderId);
		return;
	}
	operation.Complete(); // 标记操作成功
	logger.Information("Order {OrderId} processed.", orderId);
}
catch (Exception ex)
{
	operation.Fail(ex); // 标记操作失败
	logger.Error(ex, "Failed to process order {OrderId}.", orderId);
}
```

## Serilog 屏蔽敏感数据

- 引入 `Destructurama.Attributed` 包
- 在 `LoggerConfiguration.Destructure` 属性上调用 `UsingAttributes` 方法：

```cs
var logger = new LoggerConfiguration()
		.Destructure.UsingAttributes()
		.CreateLogger();
```

- 在需要屏蔽的属性上使用 `[LogMasked]` 注解：

```cs
public class User
{
	public string Name { get; set; }
	[LogMasked(Text = "_MASKED_")]
	public string Email { get; set; }
}
```

这样在日志中记录 `User` 对象时，`Email` 属性将被屏蔽：

```
[09:45:00 INF] User details: {"Name": "Alice", "Email": "_MASKED_"}
```

关于 `LogMasked` 注解：

- `Text` 属性：自定义用于替换敏感数据的文本
- `ShowFirst` 属性：显示明文的前几个字符，默认为 `0`
- `ShowLast` 属性：显示明文的最后几个字符，默认为 `0`
- `PreserveLength` 属性：是否显示与明文长度匹配的 `*`，默认为 `false`

或者使用 `[NotLogged]` 注解，Serilog 将完全忽略该属性。

## Serilog 异步处理

Serilog 的日志方法都是同步的，但储存日志需要时间，如果日志过多，调用线程将明显阻塞。这意味着，实际的 Serilog 日志记录器在幕后并不会同步执行工作，而是尽可能**缓冲**，然后**异步地**将日志推送到提供程序，或者说接收器 (`sink`)。如何实现这个机制？

`Serilog.Sinks.Async` 包提供了一个异步接收器，可以异步地将日志写入另一个接收器，从而提高性能。这意味着，它可以为任何接收器提供异步处理能力，即使这些接收器本身是同步的。

以异步方式注册 `File` 接收器，从而提高日志写入文件的性能：

```cs
var logger = new LoggerConfiguration()
		.WriteTo.Async(x => x.File("log.txt"), 10)
		.CreateLogger();
```

这时，Serilog 会将日志消息放入缓冲区，在缓冲区满时异步地将它们写入文件。这里的 `10` 就表示缓冲区的大小为 10 条日志消息。如果你不指定缓冲区大小，Serilog 也会保证日志的周期性写入。

在应用程序关闭时，调用 `Log.CloseAndFlush()` 确保所有缓冲的日志都写入接收器。

## 自定义 Sink

实现 `ILogEventSink` 接口以自定义 `Sink`，通常会聚合一个可空的 `IFormatProvider`，以便在需要时格式化日志消息。

```cs
public class MyCustomSink : ILogEventSink
{
	private readonly IFormatProvider? _formatProvider;

	public MyCustomSink(IFormatProvider? formatProvider)
	{
		_formatProvider = formatProvider;
	}

	public MyCustomSink() : this(null) {}

	public void Emit(LogEvent logEvent)
	{
		// 处理日志事件，例如将其写入自定义存储
		var message = logEvent.RenderMessage(_formatProvider);
		Console.WriteLine($"log from MyCustomSink: {message}");
	}
}
```

- `RenderMessage` 方法：使用可选的格式提供程序渲染日志消息

然后，在 `LoggerConfiguration.WriteTo` 属性上调用 `Sink<TSink>` 方法 (前提是 `MyCustomSink` 有无参构造)：

```cs
var logger = new LoggerConfiguration()
		.WriteTo.Sink<MyCustomSink>()
		.CreateLogger();
```

或者调用 `Sink(ILogEventSink sink)` 方法，并使用 `MyCustomSink` 的有参构造，更灵活：

```cs
var logger = new LoggerConfiguration()
		.WriteTo.Sink(new MyCustomSink(someFormatProvider))
		.CreateLogger();
```

如果你想跟其他 Sinks 提供一致的使用体验，可以创建 `LoggerSinkConfiguration` 的扩展方法 (推荐)：

```cs
public static class MyCustomSinkExtensions
{
	public static LoggerConfiguration MyCustomSink(this LoggerSinkConfiguration loggerConfiguration,
		IFormatProvider? formatProvider = null)
	{
		return loggerConfiguration.Sink(new MyCustomSink(formatProvider));
	}
}
```

```cs
var logger = new LoggerConfiguration()
		.WriteTo.MyCustomSink()
		.CreateLogger();
```
