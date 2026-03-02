---
weight: 1
slug: java-hello-world
title: Java 你好世界
---

## 用 Java 对世界打个招呼！

```java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, world!");
  }
}
```

## Java 命令行传参

> [!tip] 这部分给有终端交互、控制台程序设计基础的人看。

有时运行一个命令行程序时，你希望传递给它运行参数，这要靠传递参数给 `main()` 函数实现。

```java
public class CommandLineArgs {
    public static void main(String[] args) {
        for (int i = 0; i < args.length; i++) {
            System.out.println("args[" + i + "]: " + args[i]);
        }
    }
}
```

```sh
cd /path/to/your/project/root
java some.domain.CommandLineArgs foo bar baz
```

```
args[0]: foo
args[1]: bar
args[2]: baz
```
