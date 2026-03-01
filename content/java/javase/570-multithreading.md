---
weight: 570
slug: java-multithreading
title: Java 多线程
---

## 并发和并行

- 并发：在同一时刻，有多个指令在单个 CPU 上交替执行
- 并行：在同一时刻，有多个指令在多个 CPU 上同时执行

## 多线程的三种实现方式

- 继承 `Thread` 类的方式实现
- 实现 `Runnable` 接口的方式实现
- 实现 `Callable` 接口和 `Future` 接口方式实现

| 多线程实现方式       | 优点                                           | 缺点                                           |
| -------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 继承 `Thread` 类     | 编程比较简单，可以直接使用 `Thread` 类中的方法 | 可扩展性较差，不能再继承其他的类               |
| 实现 `Runnable` 接口 | 扩展性强，实现接口的同时还可以继承其他的类     | 编程相对复杂，不能直接使用 `Thread` 类中的方法 |
| 实现 `Callable` 接口 | 同上，且能获取多线程运行的结果                 | 同上                                           |

### 继承 `Thread` 类实现多线程

继承方式会把线程的功能固定，缺乏灵活性。

```java
public static void main(String[] args) {
    MyThread mt1 = new MyThread();
    mt1.start();
    MyThread mt2 = new MyThread();
    mt2.start();
}

private static class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 50; i++) {
            System.out.println(this.getName() + ": " + "Hello, multithread!");
        }
    }
}
```

### 实现 `Runnable` 接口实现多线程

创建 `Thread` 对象时，传入 `Runnable` 接口的实现对象。

```java
public static void main(String[] args) {
    Thread t1 = new Thread(new MyRun());
    t1.start();
    Thread t2 = new Thread(new MyRun());
    t2.start();
}

private static class MyRun implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 50; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + "Hello, multithread!");
        }
    }
}
```

### 实现 `Callable` 接口实现多线程

实现 `Callable` 接口的方式可以获取到多线程运行的结果。

- `Callable` 接口：多线程要运行的任务
- `FutureTask` 类 (实现 `Future` 接口)：管理多线程运行的结果

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    FutureTask<Integer> ft1 = new FutureTask<>(new MyCallable());
    Thread t1 = new Thread(ft1);
    t1.start();
    FutureTask<Integer> ft2 = new FutureTask<>(new MyCallable());
    Thread t2 = new Thread(ft2);
    t2.start();
    Integer res1 = ft1.get();
    System.out.println(res1);
    Integer res2 = ft2.get();
    System.out.println(res2);
}

private static class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
            System.out.println(Thread.currentThread().getName() + ": " + sum);
        }
        return sum;
    }
}
```

## `java.lang.Thread`

`Thread` 静态方法：

- `Thread currentThread()` 获取运行它的线程的对象
  - 如果你在 `main` 方法中运行 `Thread.currentThread().getName()`，会返回 `"main"`：当 JVM 启动之后，会自动地启动多条线程，其中有一条线程就叫做 `main` 线程，它的作用就是去运行 `main` 方法。在以前我们写的所有的代码，其实都是运行在 `main` 线程当中的。
- `sleep(long time)` 让运行它的线程休眠指定的时间，单位毫秒
  - 哪条线程执行到这个方法，那么哪条线程就会停留指定的时间
  - 当时间到了，线程会自动醒来，继续执行下面的代码
- `yield()` 出让线程（礼让线程），出让当前 CPU 的执行权，让线程的执行尽可能均匀一些

`Thread` 成员方法：

- `String getName()` 返回此线程的名称

- `setName(String name)` 设置线程的名字 (构造方法也可以设置)
  - 即使没有给线程设置名字，线程也是有默认的名字的，格式为 `Thread-X` (X = 序号，从 0 开始)

- `setPriority(int newPriority)` 设置线程的优先级，取值范围 1-10，默认 5
  - Java 的线程调度采用**抢占式调度**，具有随机性，优先级高的更可能先执行，但不一定。

- `final int getPriority()` 返回线程的优先级

- `final void setDaemon(boolean on)` 设置为守护线程
  - 当其他的非守护线程执行完毕之后，守护线程会陆续结束

- `join()` 插入线程（插队线程），把调用它的线程插队到当前线程 (运行它的线程) 之前运行
  - 等到插队线程的代码执行完了，当前线程才会继续执行

## 线程的生命周期

线程的 5 个状态：新建、就绪、运行、阻塞、死亡

![线程的生命周期](https://img.xicuodev.top/2026/03/71b514a07834973350b05e344eacc88d.png "线程的生命周期")

## 线程安全与同步

当多个线程操作同一资源时，会争抢该资源，造成线程冲突和资源污染，出现各种出乎意料的污染数据。

### `synchronized` 同步代码块

同步与异步 (中英文的语言差异)：

- 同步：你做完了我 (在你的基础上) 接着做。
- 异步：咱们两个同时做 (相当于汉语中的“同步进行”)。

`synchronized` 同步代码块的声明：

```java
synchronized (锁对象) { 操作共享资源的代码 }
```

- 锁默认打开，有一个线程进去了，锁自动关闭
- 里面的代码全部执行完毕，线程出来，锁自动打开
- 锁对象可以是任何对象，但必须是线程间唯一的，推荐使用当前类的字节码对象
- 一个资源一把锁，不能混用也不能复用

```java
class MyRun implements Runnable {
  static int resource;
  static final Object lock = MyRun.class; /* 设置锁为当前类的字节码对象 */
  
  @Override
  public void run() {
    while (true) {
      //同步代码块
      synchronized (lock) { doSth(resource); }
    }
  }
}
```

- 同步代码块要写在循环体内，操作共享资源的代码都要写在同步代码块中

### `synchronized` 同步方法

`synchronized` 同步方法的声明：

```java
synchronized 方法头(参数列表) {方法体}
```

- 同步方法会锁住方法里面所有的代码
- 同步方法的锁对象不能自己指定，而是 Java 规定好的：
  - 非静态：当前对象 `this`
  - 静态：当前类的字节码文件（`.class` 文件）对象

## `java.lang.Lock` 接口

虽然可以理解同步代码块和同步方法的锁对象问题，但我们并没有直接看到在哪里加上了锁，在哪里释放了锁，为了更清晰的表达如何加锁和释放锁，JDK 5 以后提供了一个新的 `java.lang.Lock` 接口。

`Lock` 提供比 `synchronized` 方式更广泛的锁定操作，提供了获得锁和释放锁的方法。

- `lock()` 获得锁
- `unlock()` 释放锁

`java.lang.Lock` 是接口，不能直接实例化，采用它的实现类 `java.util.concurrent.locks.ReentrantLock` 来实例化。

## 死锁 Deadlock

**死锁**是一个进程集合中的每个进程都在等待只能由其他进程才能发起的事件，从而无限期陷入僵持的局面。详见[死锁]()。

## 等待唤醒机制

**等待唤醒机制** (生产者消费者模式) 是一个十分经典的多线程协作的模式，它可以让两条线程轮流执行，而非随机争抢，其中一条是生产者，另一条是消费者。 等待唤醒机制用一个中介者 (餐桌) 来控制两条线程的执行。

等待唤醒机制的两种情况：

- 消费者等待：
  - 消费者先抢到执行权，但餐桌上没有资源，只能等待 (`wait`)
  - 生产者后抢到执行权，看到餐桌上没有资源，于是生产一个资源，并唤醒 (`notify`) 消费者消费资源
- 生产者等待：
  - 生产者先抢到执行权，但餐桌上已经有资源，只能等待 (`wait`)
  - 消费者后抢到执行权，看到餐桌上有资源，于是消费该资源，并唤醒 (`notify`) 生产者继续生产资源

### `wait-notify` 方法实现等待唤醒机制

`wait-notify` 方法 (直接写在 `Object` 类里的，任何类都有)：要在各线程中用同一锁对象调用下列方法，以使它们关联同一把锁，从而 `wait-notify` 方法可以联动起来

- `wait()` 让当前线程等待，直到被其他线程唤醒
- `notify()` 随机唤醒单个线程
- `notifyAll()` 唤醒所有线程

### 阻塞队列方式实现等待唤醒机制

生产者和消费者之间放一个队列，先进先出，生产者 `put` 数据，消费者 `take` 数据。

- `put` 数据时：放不进去，会等着，叫做阻塞。
- `take` 数据时：取出第一个数据，取不到会等着，也叫做阻塞。

阻塞队列实现了 `Iterable` 迭代器、`Collection` 集合、`Queue` 队列和 `BlockingQueue` 阻塞队列接口：

- `ArrayBlockingQueue` 数组阻塞队列：底层是数组，有界
- `LinkedBlockingQueue` 链式阻塞队列：底层是链表，无界 (实则有界，为 `int` 的上界)

## `java.lang.Thread.State` 线程六态

`java.lang.Thread.State` 枚举定义的线程的 6 个状态：

- 新建状态 (`NEW`)：创建线程对象
- 就绪状态 (`RUNNABLE`)：`start` 方法
- 阻塞状态 (`BLOCKED`)：无法获得锁对象
- 等待状态 (`WAITING`)：`wait` 方法
- 计时等待 (`TIMED_WAITING`)：`sleep` 方法
- 结束状态 (`TERMINATED`)：全部代码运行完毕

线程进入运行态时，JVM 就把它交给操作系统管理了，因此代码中不定义运行态。

![线程的生命周期的 3 种阻塞态](https://img.xicuodev.top/2026/03/3986e47d0cb24c16ff33d54e0e616c95.png "线程的生命周期的 3 种阻塞态")

## 线程池

引入线程池之前的多线程代码的弊端：

- 弊端 1：用到线程的时候就创建，浪费时间
- 弊端 2：用完之后线程退出，浪费资源

线程池核心原理：

- 创建一个池子，一开始池子中是空的
- 提交任务时，池子会创建新的线程对象，任务执行完毕，线程归还给池子
- 下回再次提交任务时，不需要创建新的线程，直接复用已有的线程即可
- 但是如果提交任务时，池子中没有空闲线程，也无法创建新的线程，任务就会排队等待
- 所有的任务全部执行完毕，关闭线程池

线程池创建方法：`Executors` 是线程池的工具类，提供方法返回不同类型的线程池对象。

- `static ExecutorService newCachedThreadPool()` 创建一个没有上限 (`int` 类型的上限) 的线程池
- `static ExecutorService newFixedThreadPool (int nThreads)` 创建有上限的线程池
- 线程池中的线程名称默认格式为 `pool-x-thread-y`，`x` 和 `y` 是序号

`ThreadPoolExecutor` 成员方法：

- `submit()` 方法：提交任务，可以是 `Runnable` 或 `Callable` 的实现对象和一个可选的 `Runnable` 实现的结果参数
- `shutdown()` 方法：关闭线程池

`ThreadPoolExecutor` 构造方法：`Executors` 底层调用的就是该类的构造方法，该类是 `ExecutorService` 的子类

- 参数一：正式员工数量 = 核心线程数量 >= `0`
- 参数二：餐厅最大员工数 = 线程池中最多可容纳线程数量 >= 核心线程数量
- 参数三：临时员工空闲多长时间被辞退 (的值) = 最大空闲时间 (值) >= `0`
- 参数四：临时员工空闲多长时间被辞退 (的单位) = 最大空闲时间 (`TimeUint` 单位)
- 参数五：排队的客户 = 阻塞队列 (包括最大队伍长度) != `null`
- 参数六：从哪里招人 = 创建线程的线程工厂对象 != `null`
- 参数七：当排队人数过多，超出顾客请下次再来 (拒绝服务) = 要执行的任务过多时的解决方案 (任务拒绝策略) != `null`

`ThreadPoolExecutor` 任务处理策略：

- 核心线程先承接任务
- 核心线程满了，先不启动临时线程，而是让在这之后提交的任务进入阻塞队列
- 阻塞队列也满了，再启动临时线程，执行在这之后提交的任务 (而非阻塞队列的任务，它们仍在等待)
- 临时线程也满了，对在这之后提交的任务采取任务拒绝策略

`ThreadPoolExecutor` 任务拒绝策略类：

- `ThreadPoolExecutor.AbortPolicy` 默认策略：丢弃任务并抛出 `RejectedExecutionException` 异常
- `ThreadPoolExecutor.DiscardPolicy` 丢弃任务，但是不抛出异常，这是不推荐的做法
- `ThreadPoolExecutor.DiscardOldestPolicy` 抛弃队列中等待最久的任务 (第一个排队的任务)，然后把当前任务加入队列末尾
- `ThreadPoolExecutor.CallerRunsPolicy` 调用任务的 `run()` 方法绕过线程池直接执行

### 线程池容量的计算公式

代码的计算操作较多，是 CPU 密集型运算；代码的文件读写操作较多，是 I/O 密集型运算。

#### CPU 密集型运算

$$
\text{线程池容量} = \text{最大并行数} + 1
$$

- 预留一个额外的线程位作为替补。

#### I/O 密集型运算

$$
\text{线程池容量}=\text{期望最大并行计算线程数}\times\dfrac{\text{总时间}}{\text{计算时间}}
$$

其中：

- $\text{总时间}=\text{计算时间}+\text{等待时间}$
- $\text{期望最大并行计算线程数}=\text{最大并行数}\times\text{期望 CPU 利用率}$
- 最大并行数：最多可同时运行、执行计算任务的线程个数。执行 I/O 操作的线程处于等待 I/O 完成的阻塞状态，不是计算线程，不计入并行数。

> [!note] 最大并行数
>
> 一颗 X 核 Y 线程的 CPU，X 核表示有几个物理核心，Y 表示最多并行几个逻辑线程。一般 JVM 可使用 CPU 的所有 Y 个线程，则最大并行数就是 Y。
>
> 如果采用**超线程技术** (HT, Hyper-Threading)，一个物理核心通常能模拟出两条逻辑线程，所以会有 4 核 8 线程、8 核 16 线程的 CPU。但要注意，同一时刻每个核心实际只能运行一个线程，超线程能让核心高效利用闲置资源，提升整体吞吐量。因此，Y 是操作系统和应用程序可同时调度的线程数上限，实际同一时刻的并行计算的线程数一般不超过物理核心数 X。

保证 CPU 等待时间也有事做：当线程因为 I/O 或其他原因等待时，让其他线程继续占用 CPU 进行计算，从而避免 CPU 空闲。

$$
\dfrac{\text{最大线程数}}{\text{期望最大并行计算线程数}}=\dfrac{\text{总时间}}{\text{计算时间}}
$$

其中：

- $\text{最大线程数}=\text{计算线程数}+\text{阻塞线程数}$

## 多线程扩展知识

Java 的多线程技术点还有 `volatile` 关键字、JMM、悲观锁、乐观锁、CAS、原子性、并发工具类等，这些技术点虽不常用，但面试会问。

### `volatile` 关键字

### 原子性

### 并发工具类

