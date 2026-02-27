---
weight: 80
title: .NET多线程(8)：并发数据结构
slug: dotnet-multithreading-concurrent-data-structures
---
## 并发栈 `ConcurrentStack`

- 并发数据结构为多线程设计，内部支持线程同步（是线程安全的），不必自己加锁
- 可以像使用常规栈那样使用并发栈，但出栈时只能用`TryPop`方法
- 其他并发数据结构大同小异，它们都实现为生产消费量身定制的`IProducerConsumerCollection<T>`接口，不做赘述

## 阻塞集合 `BlockingCollection`

- 阻塞集合是个包装器，用于包装并发数据结构，主要作用于生产消费场景中的缓冲区
- 阻塞 (Blocking) 和边界 (Bounding)
	- 上限阻塞：缓冲区达到上限时生产者阻塞，等待消费
	- 下限阻塞：缓冲区为空时，消费者阻塞，等待生产
- 构造器：第二个参数是阻塞上限
- `GetConsumingEnumerable`方法：获取自动下限阻塞的枚举器，因此`foreach`将不停地消费下去，永无止境（如果没有元素`foreach`就阻塞，而不会退出）

- 输入缓冲区：操作系统本身有一个输入缓冲区，因为阻塞上限阻塞的输入就在输入缓冲区排队
- `CompleteAdding`方法：将集合标记为已完成
- `IsCompleted`属性：集合是否标记为已完成
- 使用上面两个成员让`foreach`主动退出
- `Channel`类：.NET Core 3.0+ 推出的高性能生产者-消费者队列（比 `BlockingCollection` 更适合异步场景）

## 通道 `Channel`

- `Channel`是`ConcurrentQueue`并发队列的包装器
- `CreatUnbounded`静态方法：无边界的，适用于生产慢于消费，或有限生产
- `CreatBounded`静态方法：有边界的，适用于生产快于消费
- `BoundedChannelOptions`类：
	- `FullMode`=通道满了怎么办：`Wait`=阻塞生产；`DropNewest`=丢掉最新；`DropOldest`=丢掉最老；`DropWrite`=丢掉当前
	- `SingleReader`=是否只能有一个消费者；`SingleWriter`=是否只能有一个生产者

- 同步方法：
	- `ChannelWriter.TryWrite`方法：`out`输出写入的资源，本身返回是否成功
	- `ChannelReader.TryRead`方法：同上理
- 异步方法：
	- `ChannelWriter.WriteAsync`方法
	- `ChannelReader.ReadAsync`方法
