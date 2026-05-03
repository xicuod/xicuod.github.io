---
weight: 5
slug: java-thread-synchronization
title: Java 线程同步
---

关于这部分的知识，可以参考[.NET线程同步]({{% sref "dotnet-multithreading-synchronization" %}})。

## 线程安全问题

两个线程对初始值为 0 的静态变量一个做自增，一个做自减，各做 5000 次，结果是 0 吗？

```java
static int counter = 0;

public static void main(String[] args) throws InterruptedException {
    Thread t1 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            counter++;
        }
    }, "t1");

    Thread t2 = new Thread(() -> {
        for (int i = 0; i < 5000; i++) {
            counter--;
        }
    }, "t2");

    t1.start();
    t2.start();
    t1.join();
    t2.join();
    log.debug("{}", counter);
}
```

以上的结果可能是正数、负数或零。为什么呢？因为 Java 中对静态变量的自增，自减并不是原子操作，要彻底理解，必须从字节码来进行分析。

例如对于 `i++` 而言（i 为静态变量），实际会产生如下的 JVM 字节码指令：

```sh
getstatic i     # 获取静态变量 i 的值
iconst_1        # 准备常量 1
iadd            # 自增
putstatic i     # 将修改后的值存入静态变量 i
```

而对应 `i--` 也是类似：

```sh
getstatic i     # 获取静态变量 i 的值
iconst_1        # 准备常量 1
isub            # 自减
putstatic i     # 将修改后的值存入静态变量 i
```

而 Java 的内存模型如下，完成静态变量的自增，自减需要在主存和工作内存中进行数据交换。如果是单线程，以上 8 行指令是顺序执行（不会交错）没有问题；但多线程下这 8 行指令可能交错运行，造成脏写（dirty write）。

### 临界区 Critical Section

一个程序运行多个线程本身是没有问题的，问题出在多个线程访问**共享资源**：多个线程读共享资源其实也没有问题；但在多个线程对共享资源读写操作时发生指令交错，就会出现问题；一段代码块内如果存在对共享资源的多线程读写操作，称这段代码块为临界区。

### 竞态条件 Race Condition

多个线程在临界区内执行，由于代码的执行序列每次都可能不同而导致结果无法预测，称之为形成了竞态条件。

## 线程同步

当多个线程操作同一资源时，会争抢该资源，造成线程冲突和资源污染，出现各种出乎意料的污染数据，这就是线程安全问题。线程同步是解决线程安全问题的手段之一，分为阻塞式和非阻塞式：

- 阻塞式的线程同步方案：synchronized、Lock
- 非阻塞式的线程同步方案：原子变量

### `synchronized` 同步代码块

synchronized俗称【对象锁】，它采用互斥的方式让同一时刻至多只有一个线程能持有【对象锁】，其它线程再想获取这个【对象锁】时就会阻塞住。这样就能保证拥有锁的线程可以安全的执行临界区内的代码，不用担心线程上下文切换。

虽然synchronized既实现了互斥又实现了同步，但它们还是有区别的：互斥消除了临界区的竞态条件，使得同一时刻只能有一个线程执行临界区代码；同步是由于线程执行的先后顺序不同，需要一个线程等待其它线程运行到某个点。

```java
synchronized (锁对象) {临界区}
```

- 锁默认打开，有一个线程进去了，锁自动关闭
- 里面的代码全部执行完毕，线程出来，锁自动打开
- 锁对象可以是任何对象，但必须是线程间唯一的，推荐使用当前类的字节码对象
- 一个资源一把锁，不能混用也不能复用
- synchronized是悲观锁，应该只锁住那些临界区的代码，不要锁多了浪费性能
- 又要读又要写的资源，读取它的逻辑也要加锁，不然会读到脏数据，有“不可重复读”问题

```java
static int resource;
static final Object lock = This.class; //锁为当前类的字节码对象

public static void main(String[] args) {
    Runnable r = () -> {
        while (true) {
            //同步代码块要写在循环体内，临界区的代码都要写在同步代码块中
            synchronized (lock) { doSomethingWith(resource); }
        }
    };
    new Thread(r).start();
    new Thread(r).start();
    System.out.println(resource);
}
```

### `synchronized` 同步方法

同步方法会锁住方法里面所有的代码。同步方法的锁对象不能自己指定，而是规定好的：非静态方法使用当前对象（`this`），静态方法使用当前类的字节码对象（`This.class`）。不加synchronized的方法就是不遵守锁规则的人，可以随时随地、不加约束地执行它的代码。

```java
public synchronized void foo() {}
//相当于：
public void foo() {
    synchronized (this) {}
}
```

```java
public class Foo {
    public synchronized static void bar() {}
}
//相当于：
public class Foo {
    public static void bar() {
        synchronized (Foo.class) {}
    }
}
```

线程八锁问题：就是搞清楚两个方法锁的是不是同一个对象；如果是那么就是同步方法，要考虑先后，否则就是几乎同时；

### 变量的线程安全性分析

不共享的资源，那一定线程安全；共享的资源如果只有读，那么线程安全；如果读写都有，那么需要维护线程安全；

- 成员变量和静态变量都能作为共享资源，读写时需要考虑线程安全；
- 局部变量是方法中的变量，与方法共生死（方法的生命周期包含局部变量的生命周期），它如果是值类型那么是线程安全的；它如果是引用类型，那么引用的对象可能逃离该方法在别处也被引用干一些事情，这时需要维护线程安全；例如对于当前类的抽象方法或其他可以重写的方法，它有一个引用类型参数，行为不确定，就可能导致对于引用对象的线程不安全行为，称之为“外星方法”；

父类要做好封装工作，防止子类重写父类的临界区方法，导致线程安全问题：对于需要公开的public方法，加上final防止子类重写；对于不需要公开的方法，果断设置为private，防止子类重写；这就是开闭原则中的close思想的体现。

### 常见的线程安全类

常见的线程安全类有String、Integer、Random、StringBuffer、Vector、HashTable和juc包下的绝大多数类；

- String和Integer的线程安全不是通过加锁实现的，而是通过不可变性（immutability），对象一旦创建不可修改，任何写操作都是创建一个新的对象；
- Random的实现是用CAS比较并交换法；
- StringBuffer、Vector和HashTable的实现就是加了synchronized；
- juc包的实现用了更复杂的技术保证线程安全，性能比synchronized高得多；

然而，这些线程安全类只能保证方法内原子，如果把它们的同步方法组合起来用就不是原子了；比如hashtable先get()校验后put()，这就是两步操作了，有被别的线程穿插的风险，这是典型的“检查后行动”（check-then-act）的竞态条件；

另外，无状态的类也是线程安全的，如工具类，某些dao类等；无状态类就是对象的行为完全由其方法参数决定，且不依赖、不修改任何可变的外部或共享状态。

### `java.lang.Lock`

虽然可以理解同步代码块和同步方法的锁对象问题，但我们并没有直接看到在哪里加上了锁，在哪里释放了锁，为了更清晰的表达如何加锁和释放锁，JDK5提供了一个新的接口`java.lang.Lock`。

`Lock` 提供比 `synchronized` 方式更广泛的锁定操作，提供了获得锁和释放锁的方法。

- `lock()` 获得锁
- `unlock()` 释放锁

`java.lang.Lock` 是接口，不能直接实例化，采用它的实现类 `java.util.concurrent.locks.ReentrantLock` 来实例化。

### 死锁 Deadlock

**死锁**是一个进程集合中的每个进程都在等待只能由其他进程才能发起的事件，从而无限期陷入僵持的局面。详见[死锁]()。

### 等待唤醒机制

**等待唤醒机制** (生产者消费者模式) 是一个十分经典的多线程协作的模式，它可以让两条线程轮流执行，而非随机争抢，其中一条是生产者，另一条是消费者。 等待唤醒机制用一个中介者 (餐桌) 来控制两条线程的执行。

等待唤醒机制的两种情况：

- 消费者等待：
  - 消费者先抢到执行权，但餐桌上没有资源，只能等待 (`wait`)
  - 生产者后抢到执行权，看到餐桌上没有资源，于是生产一个资源，并唤醒 (`notify`) 消费者消费资源
- 生产者等待：
  - 生产者先抢到执行权，但餐桌上已经有资源，只能等待 (`wait`)
  - 消费者后抢到执行权，看到餐桌上有资源，于是消费该资源，并唤醒 (`notify`) 生产者继续生产资源

#### `wait-notify` 实现等待唤醒机制

`wait-notify` 方法 (直接写在 `Object` 类里的，任何类都有)：要在各线程中用同一锁对象调用下列方法，以使它们关联同一把锁，从而 `wait-notify` 方法可以联动起来

- `wait()` 让当前线程等待，直到被其他线程唤醒
- `notify()` 随机唤醒单个线程
- `notifyAll()` 唤醒所有线程

#### 阻塞队列实现等待唤醒机制

生产者和消费者之间放一个队列，先进先出，生产者 `put` 数据，消费者 `take` 数据。

- `put` 数据时：放不进去，会等着，叫做阻塞。
- `take` 数据时：取出第一个数据，取不到会等着，也叫做阻塞。

阻塞队列实现了 `Iterable` 迭代器、`Collection` 集合、`Queue` 队列和 `BlockingQueue` 阻塞队列接口：

- `ArrayBlockingQueue` 数组阻塞队列：底层是数组，有界
- `LinkedBlockingQueue` 链式阻塞队列：底层是链表，无界 (实则有界，为 `int` 的上界)

## 线程池

之前的多线程代码的弊端：

- 弊端 1：用到线程的时候就创建，浪费时间
- 弊端 2：用完之后线程退出，浪费资源

线程池核心原理：

- 创建一个池子，一开始池子中是空的
- 提交任务时，池子会创建新的线程对象，任务执行完毕，线程归还给池子
- 下回再次提交任务时，不需要创建新的线程，直接复用已有的线程即可
- 但是如果提交任务时，池子中没有空闲线程，也无法创建新的线程，任务就会排队等待
- 所有的任务全部执行完毕，关闭线程池

### 构造线程池对象

线程池静态工厂方法：`Executors` 是线程池的工具类，提供静态工厂方法返回不同类型的线程池对象。

- `ExecutorService newCachedThreadPool()`构造一个没有上限 (实际为`int`的上限) 的线程池
- `ExecutorService newFixedThreadPool(int nThreads)`构造一个有上限的线程池

线程池中的线程名称默认格式为 `pool-x-thread-y`，`x` 和 `y` 是序号。

`ThreadPoolExecutor` 成员方法：

- `submit()`：提交任务，可以是`Runnable`，或`Callable`和一个可选的`Runnable`结果参数
- `shutdown()`：关闭线程池

`ThreadPoolExecutor` 构造方法：`Executors` 底层调用的就是该类的构造方法，该类是 `ExecutorService` 的子类

| 参数名及类型                        | 类比含义                           | 实际含义                                     | 约束或备注                        |
| ----------------------------------- | ---------------------------------- | -------------------------------------------- | --------------------------------- |
| `int corePoolSize`                  | 正式员工数量                       | 核心线程数量                                 | `>= 0`                            |
| `int maximumPoolSize`               | 餐厅最大员工数                     | 线程池中最多可容纳线程数量                   | `>= corePoolSize`                 |
| `long keepAliveTime`                | 临时员工空闲多长时间被辞退（值）   | 最大空闲时间                                 | `>= 0`                            |
| `TimeUnit unit`                     | 临时员工空闲多长时间被辞退（单位） | 最大空闲时间单位                             | 枚举常量（如 `TimeUnit.SECONDS`） |
| `BlockingQueue<Runnable> workQueue` | 排队的客户                         | 阻塞队列（包括最大队伍长度）                 | `!= null`                         |
| `ThreadFactory threadFactory`       | 从哪里招人                         | 创建线程的线程工厂对象                       | `!= null`                         |
| `RejectedExecutionHandler handler`  | 排队人数过多时的处理（拒绝服务）   | 要执行的任务过多时的解决方案（任务拒绝策略） | `!= null`                         |

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

CPU 密集型运算：预留一个额外的线程位作为替补。

$$
\text{线程池容量} = \text{最大并行数} + 1
$$

I/O 密集型运算：

$$
\text{线程池容量}=\text{期望最大并行计算线程数}\times\dfrac{\text{总时间}}{\text{计算时间}}
$$

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

- $\text{最大线程数}=\text{计算线程数}+\text{阻塞线程数}$

## 多线程扩展知识

Java 的多线程技术点还有 `volatile` 关键字、JMM、悲观锁、乐观锁、CAS、原子性、并发工具类等，这些技术点虽不常用，但面试会问，详见[多线程扩展]({{% sref "java-multithreading-extra" %}})。
