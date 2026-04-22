---
weight: 1
slug: java-thread
title: Java 线程
---

> [!caution] 面试关键词
>
> - 线程创建；线程重要api（start run sleep join interrupt等）；线程状态；
> - 原理方面：栈与栈帧；上下文切换；程序计数器；thread两种创建方式的源码（继承therad和实现runnable）；
> - 模式方面：interrupt两阶段终止模式；

## 创建和运行线程

1. 直接使用thread：`thread t1=new thread(){@override public void run(){do();}};t1.setname("t1");t1.start();`
2. 使用runnable配合thread：`runnable r=()->do();new thread(r,"t2").start();`

方式1是把线程和任务绑定在一起，方式2是把任务单独划一个变量，把线程和任务分开了，更灵活：runnable让任务对象脱离了thread体系；runnable可以单独和线程池等高级api打配合；

3. 使用futuretask，传入callable实现，通过task.get()同步阻塞调用线程获取工作线程执行结果；

| 线程创建方式         | 优点                                           | 缺点                                           |
| -------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 继承 `Thread` 类     | 编程比较简单，可以直接使用 `Thread` 类中的方法 | 可扩展性较差，不能再继承其他的类               |
| 实现 `Runnable` 接口 | 扩展性强，实现接口的同时还可以继承其他的类     | 编程相对复杂，不能直接使用 `Thread` 类中的方法 |
| 实现 `Callable` 接口 | 同上，且能获取工作线程运行的结果               | 同上                                           |

### 直接继承 `Thread`

继承方式会把线程的功能固定，缺乏灵活性。匿名内部类的继承方式：

```java
public static void main(String[] args) {
    Thread t = new Thread() {
        @Override
        public void run() {
            for (int i = 0; i < 20; i++) {
                log.debug("hello thread!");
            }
        }
    };
    t.start();
}
```

继承Thread方式的底层用的就是Runnable类型的target字段；包括run()这方法本身都是从Runnable实现下来的，这叫代理模式：

```java
public class Thread implements Runnable {
    /* What will be run. */
    private Runnable target;

    @Override
    public void run() {
        if (target != null) {
            target.run();
        }
    }
}
```

因此，继承thread的方式本质上就是在实现runnable接口。

### 实现 `Runnable`

创建 `Thread` 对象时，传入 `Runnable` 接口的实现对象。

```java
public static void main(String[] args) {
    Runnable r = () -> {
        for (int i = 0; i < 100; i++) {
            System.out.println(Thread.currentThread().getName() + ": hello runnable!");
        }
    };
    Thread t1 = new Thread(r);
    t1.start();
    Thread t2 = new Thread(r);
    t2.start();
}
```

### 使用 `FutureTask` 和 `Callable`

`FutureTask`可以获取到工作线程运行的结果。它的get()方法可以拿到task的结果；get()方法是同步阻塞调用，它会阻塞调用线程，直到task算出结果或抛出异常。

`FutureTask`类实现`RunnableFuture`接口，而`RunnableFuture`又继承了`Runnable`和`Future`接口，相当于它实现了这两个接口；它用于获取工作线程运行的结果；它实现了runnable所以可以传给thread的构造器。

FutureTask的构造器需要接收一个Callable的实现，该实现就是工作线程要执行的任务，并且将返回结果给task；`Callable<>` 接口：

- Callable相比Runnable，它的call()方法可以返回一个泛型结果，而Runnable的run()返回void，即没有返回值；

```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     *
     * @return computed result
     * @throws Exception if unable to compute a result
     */
    V call() throws Exception;
}
```

- Runnable.run()方法签名不允许抛出受检异常，异常只能在线程内部捕获处理；callable还能抛出各种异常（包括受检异常），并在task.get()时包装成`ExecutionException`重新抛出，便于调用者统一处理；

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    Callable<Integer> callable = () -> {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
            System.out.println(Thread.currentThread().getName() + ": " + sum);
        }
        return sum;
    };
    FutureTask<Integer> ft1 = new FutureTask<>(callable);
    Thread t1 = new Thread(ft1);
    t1.start();
    FutureTask<Integer> ft2 = new FutureTask<>(callable);
    Thread t2 = new Thread(ft2);
    t2.start();
    Integer res1 = ft1.get();
    System.out.println(res1);
    Integer res2 = ft2.get();
    System.out.println(res2);
}
```

## 查看进程和线程

win：任务管理器；cmd tasklist taskkill；findstr相当于grep；

linux：`ps -ef`，`ps -fT -p pid>`，`kill`，`top`按`shift+h`切换显示线程；`top -H -p <pid>`查看进程的所有线程；

java：`jps` 查看所有java进程，`jstack <pid>` 查看java进程的所有线程状态，抓当前时刻的快照，每个线程抓当前栈帧；`jconsole <pid>`图形界面查看java进程的线程运行情况；

`top -H -p <java-pid>`：finalizer垃圾回收线程；c1 compilerthread，c2 compilerthread 两个jit优化器线程；t1，t2 你自己创建的两个线程；

jconsole远程监控配置：需要以如下方式运行你的java类；

```sh
java -Djava.rmi.server.hostname='主机名或ip地址' -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port='连接端口' -Dcom.sun.management.jmxremote.ssl='是否安全连接' -Dcom.sun.management.jmxremote.authenticate='是否认证' java启动类
```

修改/etc/hosts文件，将127.0.0.1映射至主机名；如果要认证访问，还需要做如下步骤：复制jmxremote.password文件；修改jmxremote.password和jmxremote.access文件的权限为600，即文件所有者可读写；连接时填入controlRole（用户名），R&D（密码）；

## 栈与栈帧

Java Virtual Machine Stacks (Java 虚拟机栈)：我们都知道 JVM 中由堆、栈、方法区所组成，其中栈内存是给谁用的呢？其实就是线程，每个线程启动后，虚拟机就会为其分配一块栈内存；每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存；每个线程只能有一个活动栈帧，它是线程栈最上面的那个栈帧，对应着当前正在执行的那个方法；

线程栈结构：

- 程序计数器PC：由每个线程栈私有，保存下一条指令的地址；A调用B方法时，PC当前保存的A的下一条指令地址会存到B的栈帧的返回地址中；然后PC更新为B的第一条指令的地址，开始执行B；B返回，JVM取出B帧的返回地址写到PC，从而从A的下一条指令继续执行；
- 栈帧；

栈帧结构：

- 局部变量表：栈帧创建时就会把所有局部变量的空间申请好；
- 返回地址：指向调用方方法中下一条虚拟机指令的地址，即程序计数器的值；
- 锁记录：不是每个栈帧都有，只有同步方法或同步代码块的栈帧中才有；
- 操作数栈：用于存放指令执行过程的中间结果和方法调用的参数；
  - 存放中间结果：字节码指令多是零地址指令（不会使用操作数的地址），如`iadd`整数加法就是从操作数栈顶弹出两个int相加，并将结果压回栈顶；
  - 传递参数：调用方法前需要将参数按顺序压入操作数栈，如`invokevirtual #5`调用`add(2,3)`：压入`iconst_2`，再压入`iconst_3`，调用目标方法时，JVM 从栈顶取出参数传给目标方法的局部变量表；
  - 传递返回值：被调用方法结束时，会将返回值压入调用方栈帧的操作数栈，替换掉调用参数；

## 线程上下文切换

cpu不再执行当前线程，转而执行另一个线程的原因有：线程的cpu时间片用完；垃圾回收；有更高优先级的线程需要运行；线程自己调用了sleep、yield、wait、join、park、synchronized、lock等方法；

线程上下文切换时，由操作系统保存当前线程状态，并恢复另一个线程的状态；线程状态包括程序计数器和虚拟机栈中每个栈帧的信息；其中java的程序计数器发挥了核心作用，它用于记录线程恢复时应该从哪条指令继续执行；

频繁的线程上下文切换会导致性能变差，因为每次切换时操作系统都要保存或恢复线程的状态，这两个过程都会消耗额外的cpu时间；同一时刻活跃的线程数如果超过cpu核心数，那么cpu就要频繁地切换线程上下文，性能很差；选择合适的线程数是之后的一个课题；

## `java.lang.Thread`

`Thread` 静态方法：

- `currentThread()` 获取当前线程对象；
- `sleep(long time)` 让当前线程休眠指定的时间，单位毫秒；sleep()会让当前线程从running变为timed_waiting阻塞状态；其他线程可以用interrupt()打断正在睡眠的线程，睡眠线程会抛出InterruptedException并退出；睡眠结束后的线程未必立刻就得到执行，具体行为依赖操作系统的任务调度器；建议用`TimeUnit.时间单位常量.sleep()`代替`Thread.sleep()`来提高可读性；
- `yield()` 提示（hint）线程调度器出让（礼让）当前线程，出让cpu的执行权；主要用于测试和调试；yield()会让线程从running变为runnable就绪状态，然后调度其他同优先级的线程；如果没有同优先级的，那么不能保证出让效果；具体行为依赖于操作系统的任务调度器；
- `interrupted()`获取是否中断，这会清除中断标记；

`Thread` 成员方法：

- `start()`只是让线程就绪，还要等操作系统的任务调度器给它分配cpu时间片；start()只能调用一次，多次调用抛`IllegalThreadStateException`；
- `run()`如果构造器传入了runnable那么就用传入的runnable；如果没有那就什么都不做；如果没有但是子类重写了run()那么就用重写的run()；

> [!tip] 能不能直接调用run()方法，而不用start()？
>
> 调用run()就是让当前线程直接调用run()，等于是当前线程越过了线程对象，自己调用了线程对象中定义的任务方法，属于是越俎代庖，与让另一个线程异步地执行别的任务的目的相悖。

- `join()` 插入（插队），把调用线程插队到当前线程前面运行；等到插队线程执行完了，当前线程才会继续执行；它有一个有参重载是传入超时时间，如果超时了就不等插队线程执行完了，如果没超时那就没超时，按常理继续执行当前线程；底层就是wait()；
- `getId()`获取线程的长整型id；
- `getName()` 返回线程的名称；
- `setName(String name)` 设置线程的名字 (构造方法也可以设置)；如果没有给线程设置名字，那么默认的名字格式为 `Thread-X` (X是序号，从0开始)；

> [!note] main 线程
>
> `main()` 方法中的 `Thread.currentThread().getName()` 会返回 `"main"`：当 JVM 启动之后，会自动地启动多条线程，其中有一条线程就叫做 `main` 线程，它就是用于运行 `main()` 方法。在以前我们写的所有的代码，其实都运行在 `main` 线程当中。

- `getPriority()` 返回线程的优先级；
- `setPriority(int newPriority)` 设置线程的优先级，取值范围1-10，默认5，最值建议用MAX_PRIORITY和MIN_PRIORITY常量；

> [!tip] Java线程优先级只是个对操作系统任务调度器的提示（hint）
>
> Java线程调度采用“抢占式调度”，在该模式下，操作系统可中断当前正在执行的任务，将处理器资源分配给优先级更高或更紧急的任务，以提高系统响应性与资源利用率；此时优先级高的线程可能先执行，但也可能反过来。
> 
> Java说的优先级权重不大，实际还是操作系统说了算；这仅仅是个提示，任务调度器可以忽略它；具体地说，当cpu繁忙时优先级高的线程会获得更多的时间片，当cpu闲暇时优先级效果甚微，有可能优先级高的反而分到更少的时间片。

- `getState()`获取线程状态，详见[线程六态](#java-线程六态)；
- `isAlive()`是否存活，即还没有运行完毕；
- 已弃用的可能造成死锁的方法：`stop()`强制停止线程；`suspend()`挂起（暂停）线程；`resume()`恢复线程；
- 另外：`System.exit(int)`强制停止线程所在java进程，终止全部线程；
- `interrupt()`打断线程，设置线程的中断标记为true；如果要打断的线程正在sleep wait join的阻塞状态，那么它会抛出`InterrputedException`，并在抛出之前清除中断标记，即重新设它为false（`catch(InterruptedException e)`中已经是抛出之后了，这时中断标记为false）；如果是正在运行或park的线程，那么它不会清除中断标记；
- `isInterrupted()`获取中断标记，是否被打断；

> [!tip] 中断标记
>
> 这里的中断标记的设计思想是：当线程处于阻塞状态时，它无法主动检查中断标记，因此设计为让被打断的线程抛出异常，并清除中断标记，因为线程已经抛异常退出阻塞状态了（你使用了try-catch捕获并抛出异常，catch完了之后会继续执行下面的其他代码），这相当于是重置它的状态，或者说这次中断信号已通过抛异常消费掉了，所以需要清除中断标记来表明“我已消费”，同时也避免双重信号增加不一致行为风险；
>
> 对于正常运行的线程，它可以主动处理中断标记，所以就让它自行在合适的时机检查`isInterrupted()`，并选择响应或忽略中断信号，这是它的自由；对于park的线程，park通常用于实现高级同步器，如AQS，它的这些组件需要灵活处理中断，而非抛出异常，保留标记可以让上层代码自行判断如何处理这次中断；因此，对于正常运行或park这些需要灵活处理中断的线程，需要设置中断标记，而不是抛出异常来消费中断信号；

> [!note] interrupt()实现“两阶段终止模式”
>
> 在t1中优雅地终止线程t2，优雅是指给t2一个料理后事的机会；第一阶段发送中断信号，第二阶段被中断的线程料理后事；设置一个监控线程轮询是否被打断，如果是就料理后事，如果不是就继续监控，每两次轮询之间睡一觉，如果睡觉期间被打断，那么设置打断标记，等下一次循环料理后事；后面学到volatile可以优化这个两阶段终止模式的代码；

> [!note] interrupt()打断park线程
>
> 调用`LockSupport.park()`的线程会泊车阻塞，直到收到中断信号才起步运行；但`park()`不会主动清除中断标记，因此需要调用`interrupted()`手动清除，或根据业务需求灵活处理；

- `setDaemon(boolean on)` 设置是否为守护线程；只要非守护线程全部结束，守护线程即使没有执行完毕，也会强制结束；只要有一个非守护进程没有结束，java进程就不会结束；gc线程就是守护线程；tomcat的acceptor和poller都是守护线程，所以tomcat收到shutdown命令不会等待它们处理完当前请求；

## 避免忙等待

当没有用cpu计算时，只是轮询一个方法是否已经返回结果，不要用while(true)空转cpu，这是忙等待，浪费cpu资源，因为你一直占用cpu时间片，别人就用不上了；可以用~~yield()或~~sleep()把cpu的使用权让给其他线程；

> [!warning] yield()对于避免忙等待效果甚微
>
> 不要用 yield() 来避免忙等待，它无法可靠地降低 CPU 占用。yield() 只是提示调度器当前线程愿意让出 CPU，但调度器可以忽略这个提示，而且线程让出后仍处于可运行状态，可能立刻又被选中。如果调用 yield() 的循环依然高频执行，本质上仍是轮询；虽然比纯 while(true) 稍好，但 CPU 占用依然很高，尤其在多核环境下。

可以用wait()或条件变量达到类似的效果；不同的是这两种方式需要加锁，且需要手动唤醒，一般适用于线程同步的场景；sleep()适用于无需加锁同步的场景；

## 线程的生命周期（线程状态）

从操作系统层面，线程有5个状态：新建（初始）、就绪（可运行）、运行、阻塞、死亡（终止）。

![线程的生命周期](https://img.xicuodev.top/2026/03/71b514a07834973350b05e344eacc88d.png "线程的生命周期")

在java代码中，枚举`java.lang.Thread.State`定义了thread对象的6个状态：

- 新建状态 (`NEW`)：创建线程对象，但还没调用`start()`方法；
- 就绪状态 (`RUNNABLE`)：调用了`start()`方法；java api层面的runnable涵盖了操作系统层面的可运行状态、运行状态和部分阻塞状态（由于bio导致的阻塞在java中无法辨别，依然认为是可运行，可以认为这种阻塞对java程序来说是“透明”的）；
- 阻塞状态 (`BLOCKED`)：无法获得锁对象；
- 等待状态 (`WAITING`)：调用了`wait()`或`join()`方法；
- 计时等待 (`TIMED_WAITING`)：调用了`sleep()`方法；
- 结束状态 (`TERMINATED`)：全部代码运行完毕或被打断；

线程进入运行态时，JVM 就把它交给操作系统管理了，因此java api中不定义运行态；blocked waiting timed_waiting都是java api层面对阻塞状态的细分，详见下文<!-- TODO Java的3种阻塞状态 -->；

![线程生命周期的3种阻塞态](https://img.xicuodev.top/2026/03/3986e47d0cb24c16ff33d54e0e616c95.png "线程生命周期的3种阻塞态")
