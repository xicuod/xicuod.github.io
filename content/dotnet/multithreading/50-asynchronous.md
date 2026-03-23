---
weight: 50
title: .NET 异步编程
slug: dotnet-multithreading-asynchronous
---
## 多线程 vs. 异步编程

- 多线程与异步编程二者本质上相同，只是侧重点不同
- 多线程侧重于分而治之的场景，异步编程侧重于卸载长时间运行的任务（详见[为什么要使用多线程]({{% sref "dotnet-multithreading-basic#为什么要使用多线程" %}})）
- 多线程适用于CPU密集型操作，异步编程适用于I/O密集型操作
- I/O操作：访问本地文件、访问数据库、访问互联网

## `Task`类

- 构造器：`new Task(委托)`
- `Start`方法
- 更常见的写法：`var task = Task.Run(委托)`
- `Task`对象中封装了许多实用数据和功能
- 使用`Task.Delay(毫秒数)`，而不是`Thread.Sleep(毫秒数)`

## `Thread`类 vs. `Task`类

- `Task`是一个承诺（`Promise`）：它不一定涉及线程，只是承诺在未来某个时间完成任务
- 推荐使用`Task`类而不是`Thread`类，因为`Task`类是更高级别的抽象，开箱即用，而`Thread`类更底层
	- 默认使用线程池；从任务中返回结果；简单的任务延续；更好异常处理
	- `Async`/`Await`：使编写异步代码像编写同步代码一样；便于同步上下文，解决线程亲和性问题

## 从任务中返回结果

- `Task.Run(委托)`返回的`Task<T>`中的泛型`T`就是返回值类型
- `Result`属性：委托方法的返回值

## 任务阻塞 Task Blocking

- `Wait`方法：阻塞调用线程，直到任务完成
- `WaitAll`静态方法：阻塞调用线程，直到所有任务完成
- `Result`属性：阻塞调用线程，直到任务完成并返回结果

## 任务延续 Task Continuation

- `ContinueWith`方法：创建一个工作线程，执行传入的委托，委托提供主调`Task`对象的参数
- `WhenAll`静态方法：接收并返回`Task`数组，表示当所有`Task`完成时
- `WhenAny`静态方法：接收`Task`数组，返回`Task`，表示当任一`Task`完成时
- 配合`ContinueWith`或`await`使用，让`When`返回的任务实际运行起来

- 延续链（continuation chain）：你可以链式使用`ContinueWith`，形成一条任务链 `Task<Task<string>>`
- 拆包装（unwrap）：但你并不想要 `Task<Task<string>>` 这种套娃的怪东西，因此需要用到`Unwrap`方法，它将执行里面的`Task`，并返回`Task<string>`
- `Unwrap`也是非阻塞的，它会在工作线程中执行相关操作

## 任务的异常处理

- 任务中的异常是隐藏的，不会影响主线程继续运行
- 对任务使用外部`try-catch`不起作用
	- 任何在委托外部的`try-catch`都是无稽之谈，因为委托一般不会就地执行
- 异常存储在任务本身中：`Status`属性（异常时值为`Faulted`故障）和`Exception`属性（`System.AggregateException`类，存储所有异常）
- 可以迭代这些异常：`task.Exception.InnerExceptions`属性

- 使用`Wait`或`Result`：抛出任务的`AggregateException`
- `ContinueWith`方法有个重载，第二个参数为`TaskContinuationOptions`枚举，设置为`NotOnFaulted`就会抛出`AggregateException`
- 使用`await`：如果有任何异常，直接抛出，不再延续执行

## 任务同步 Task Synchronization

- 任务同步和线程同步的办法完全一样
- 任务同步：`lock`关键字、监视器、互斥锁和读写锁
- 任务交互：信号量、自动重置事件和手动重置事件

## 任务取消 Task Cancellation

- 任务取消和线程取消的办法别无二致
- 设置一个共享的标志变量，如 `bool cancelTask`
- 更好的做法：`CancellationTokenSource`类（非托管资源，使用`using`）
	- 获取令牌：`Token`属性（`CancellationToken`类）
	- 请求取消：`Cancel`方法
	- 是否请求取消：`IsCancellationRequested`属性
	- 超时取消：`CancelAfter`方法，若取消，应抛出`OperationCanceledException`；为此，推荐使用`ThrowIfCancellationRequested`方法
	- 异步方法API通常都有个重载接收`CancellationToken`来实现取消异步操作，如`HttpClient`类`GetStringAsync`方法的第二个参数

## Async & Await

- 使用`async`修饰异步方法，并在异步任务前加`await`，使编写异步代码看起来就像在编写同步代码
- 当你在主线程调用异步方法时，它将在一个工作线程中异步执行
- 在异步方法中，`await`之后的所有内容都是异步任务的延续
	- `await`之前的内容在主线程上执行，之后的内容在工作线程上执行
- 当程序运行到`await`关键字时，调用线程立即被释放，它可以自由地继续运行
- `await`将返回任务的结果，而不是结果的任务
- 使用`async`和`await`会自动管理同步上下文，`await`的延续代码将在同步上下文中执行

- 异步方法返回结果的任务，如果方法体返回`int`，则异步方法返回`Task<int>`；如果方法体没有返回值，则异步方法返回`Task`
- 如果将异步方法的返回值类型设置为`void`，将不能在后续应用`Task`特性，不能用`await`；除非你在编写程序入口方法或实现外部API方法等不需要在后续用上`Task`特性的方法，否则不推荐这么做
- 异步方法的命名约定：在名称后加`Async`后缀，如`FetchDataAsync`

## Await到底做了什么？

- 编译器会创建一个状态机对象，并以每个`await`语句作为段落结尾，来划分状态
- 每个状态都会记录当前状态和变量集合，并捕获同步上下文
- 每完成一个状态，它会调用`moveNext`方法，在捕获到的同步上下文中执行下一个状态
- 通过状态集合执行包含多个`await`的异步方法
