---
weight: 55
slug: java-util-scanner
title: java.util.Scanner
---

`java.util.Scanner` 类用于控制台读取用户输入。

`Scanner` 的声明并赋值：

```java
Scanner s = new Scanner(System.in);
```

- `System.in` 对象是 `System.io.InputStream` 类，是输入流

`Scanner` 的方法：

- `hasNext()` 方法：`in` 里面有没有下一个字符串
- `hasNextLine()` 方法：有没有下一行字符串
- `next()` 方法：下一个字符串，以空白字符为结束符，如空格符、制表符、换行符，因此它不能得到带有空白字符的字符串。`next()` 方法读取到有效字符后才结束输入。
- `nextLine()` 方法：下一行字符串，以[换行符]({{% sref "java-io-stream#换行符" %}}) (line separator) `\n`、`\r\n` 或 `\r` 为结束符，如果是空行，则可以获得空字符串。

```
(next方式截取)等待输入：1 12 123
你的输入：1
(nextLine方式截取)等待输入：1 12 123
你的输入：1 12 123
```

- `close` 方法：显式关闭 `in` 输入流
  - 凡是属于 I/O 流的类，如果不关闭会一直占用资源，要养成好习惯用完就关掉
  - 但是关闭 `scanner` 会同时关闭 `in` 输入流，此时其他的 `scanner` 对象无法访问 `in`，只能给出空字符串
  - 最好使用同一个唯一的 `scanner` 对象，否则必须在所有 `scanner` 对象完成操作后再关闭它们
- `hasNextInt()` 一类方法：有没有下一个整数 / 浮点数 / 布尔值 / 字节等
- `nextInt()` 一类方法：返回下一个整数等

* 所有 `hasNext` 打头的方法，如果读到空字符串，就会阻塞并等待用户输入新数据
* 调用 `next` 打头的方法前，一般需要清空输入缓冲区
  - 因为可能有部分之前输入的内容残留在其中，它们会造成意想不到的结果
  - 输入缓冲区的残留内容一般只有一行，可以直接 `sc.nextLine()` 来清空它
