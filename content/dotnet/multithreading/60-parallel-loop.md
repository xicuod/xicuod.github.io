---
weight: 60
title: .NET多线程(6)：并行循环
slug: dotnet-multithreading-parallel-loop
---
- 并行循环（parallel loop）：`Parallel.For(int 起点含, int 终点不含, Action 循环体委托)`
- 这将在不同线程中共享循环体的资源，你需要上锁实现同步访问
- `For`：有序集合；`ForEach`：无序集合+有序集合
- `Parallel.Invoke(委托集合)`：并行运行委托集合的所有方法
-  循环任务必须足够繁重（串行性能非常差），才适合并行循环

## 并行循环的原理

- 数据分区：分治法，把集合分成特定个部分，并创建等量的线程
- 主要使用线程池线程
- 试图替开发者做出最佳决策
- 阻塞调用，不需要`Wait`

## 并行循环的异常处理

- 如果有任何一个线程出现异常，则所有线程不会进入下一次迭代
- 所有异常将组合为一个`AggregateException`抛出，在并行循环外部`try-catch`
- 并行任务通常都会将所有线程的异常组合为一个聚合异常抛出
- 如果每次迭代的耗时较长，当一个线程异常时，你想要立即停止其他线程，可以使用两个参数的委托的重载，第二个参数就是并行循环的当前状态，其`IsExceptional`属性指出了是否有线程出现异常，以便快速退出本次迭代

## 并行循环的主动干预

- 状态的`Stop`方法和`IsStopped`属性配合使用，可以主动停止各线程
- 状态的`Break`方法和`ShouldExitCurrentIteration`（应该退出当前迭代）、`LowestBreakIteration`（`Break`的线程中最小的迭代位置）属性配合使用，可以使整体集合完整迭代到特定位置停止：
	- `if (state.ShouldExitCurrentIteration && state.LowestBreakIteration < i) return;`

## `Break`方法怎么使并行循环“完整地”迭代到特定进度？

- 0到100遍历，分成3个线程：0-33、33-66、66-100
- 线程1到30、线程2到`60`、线程3到`90`时，线程2和3的状态调用`Break`，它们立即退出，此时`ShouldExitCurrentIteration`为`true`， `LowestBreakIteration`为`60`
- 线程1的`i`=`30`<`LowestBreakIteration`，所以它继续执行直到完成
- 最后，整体迭代进度停留在`60`

## 为什么`Break`时选用`LowestBreakIteration`？

- `Break`的线程将立即退出，这意味着该线程负责的部分永远无法迭代完成
- 最小的迭代位置 (`LowestBreakIteration`) 意味着负责它前面那些部分的线程没有`Break`
- 等到这些线程完成迭代，整体迭代进度到达最小迭代位置
- 这是符合`Break`语义的：`迭代到65退出 && 迭代到80退出 == 迭代到65退出`，`65`是最小迭代位置

## 并行循环结果 ParallelLoopResult

- 当你接收并行循环返回的结果时，它是阻塞的
- `IsCompleted`属性：是否迭代完成
- `LowestBreakIteration`属性：`Break`的线程中最小的迭代位置；如果是因为`Stop`或抛出异常停止迭代，则它的值为`null`

## 并行循环取消

- 使用`ParallelOptions`和`CancellationTokenSource`类
- `new ParallelOptions { CancellationToken = cts.Token }`
- `Parallel.For(0, 1000, options, 循环体委托)`
- 当调用`token.Cancel()`时，`Parallel.For`抛出`TaskCanceledException`

## 并行循环中的线程本地存储

- 线程本地存储（thread local storage）：每个线程自己内部使用的变量；分治法
- `Parallel.For(0, 100, lcoalInit, (i,state,tls)=>{}, localFinally)`
	- `localInit`参数：委托，初始化`tls`并返回
	- `localFinally`参数：委托，线程完成枚举时处理`tls`，依然是线程的一部分，使用共享资源时需要加锁同步