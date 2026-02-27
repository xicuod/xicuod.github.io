---
weight: 70
title: .NET多线程(7)：并行LINQ（PLINQ）
slug: dotnet-multithreading-plinq
---
- 集合的数据量非常庞大时，适合使用并行LINQ（PLINQ）
- `AsParallel`方法：获取集合的`ParallelQuery`对象，然后就可以像使用一般`LINQ`一样使用`PLINQ`，如`items.AsParallel().Where(...)`
- `ParallelQuery`的`AsOrdered`方法：在并行处理的同时保持顺序，这肯定会降低性能，但重要的是搞清楚你的需求
- `ParallelQuery`的`ForAll`方法：对并行查询集合的每个元素做特定处理

## PLINQ工作原理

- PLINQ工作原理：生产者-缓冲区-消费者
- 自定义缓冲区大小： `ParallelQuery`的`WithMergeOptions`方法、`ParallelMergeOptions`枚举
	- `NotBuffered`：不缓冲，一生产就消费；但仍然有缓冲区，因为生产消费速度不一致；一次仍然可能生产多个产品，只是不设不可消费的阈值
	- `FullyBuffered`：消费之前完全缓冲，先完成所有生产工作再消费
- `Merge`：将所有数据分区合并成一个

- `foreach`遍历中存在合并行为：`foreach`在主线程消费，PLINQ需要先在工作线程合并生产集合，再给到主线程
- `ForAll`遍历中不存在合并行为：同一个工作线程同时用于生产和消费，此时`FullyBuffered`不起作用
- 如果你有些任务不需要合并集合，你应该用`ForAll`遍历
	- 这在一定程度上替代了`Stream`流的功能

- `ForAll`方法会抛出聚合异常，在这样的消费者外部使用`try-catch`
- 对于聚合异常，可以使用`Handle`方法，传入异常处理委托，这将遍历`InnerExceptions`集合，最后需要返回是否处理成功的布尔值
- 使用`WithCancellation`方法来使用取消令牌：当令牌取消时，所有线程将尽快退出，已经进入的迭代仍会完成
- 操作取消异常`OperationCanceledException`不会放到聚合异常中

## PLINQ的性能考虑

如果迭代任务不是过于繁重，则PLINQ的性能不如LINQ；因为对于较为轻松的工作，创建、启动线程等线程相关操作耗时太长。
