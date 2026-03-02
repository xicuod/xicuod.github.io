---
weight: 550
slug: java-io-stream
title: Java IO 流
---

IO 流是用磁盘存储和读取数据的解决方案。

- `File` 类只能对文件本身进行操作，不能读写文件里面存储的数据。
- 由于文件的共享性，IO 流使用原则：随用随创建，不用的时候及时关闭。

IO 流的分类：

- 按流的方向：输入流、输出流
- 按操作文件类型：
  - 字节流：所有类型文件
  - 字符流：纯文本文件

IO 流体系结构：

- 字节流：
  - `InputStream`：字节输入流接口
    - 基本流：
      - `FileInputStream`：操作本地文件的字节输入流
      - `ObjectInputStream`：操作对象的字节输入流
      - `BufferInputStream`：带有缓冲区的字节输入流
    - 缓冲流：`BufferedlnputStream`
    - 序列化流：`ObjectInputStream`
    - 解压缩流：`ZipInputStream`
  - `OutputStream`：字节读取流接口
    - 基本流：`FileOutputStream` 等
    - 缓冲流：`BufferedOutputStream`
    - 序列化流：`ObjectOutputStream`
    - 打印流：`PrintStream`
    - 压缩流：`ZipOutputStream`
- 字符流：
  - `Reader`：字符输入流接口
    - 基本流：`FileReader` 等
    - 缓冲流：`BufferedReader`
    - 转换流：`InputStreamReader`
  - `Writer`：字符输出流接口
    - 基本流：`FileWriter` 等
    - 缓冲流：`BufferedWriter`
    - 转换流：`OutputStreamWriter`
    - 打印流：`PrintWriter`

## 字节流

### 字节输出流 `FileOutputStream`

`FileOutputStream` 输出数据到文件：

1. 创建 `FileOutputStream` 对象：
   - 可以传入路径的字符串或 `File` 对象，默认关闭续写，再传入一个 `boolean append` 指定是否续写
   - 需要保证父级目录存在，否则创建失败
   - 若文件不存在会创建文件，若文件存在默认会先清空文件 = 不续写 (创建对象时就会清空)
2. 写数据：`write` 方法，接收一个字符 (传入 UTF-16 编码) 或字节数组
3. 释放资源：`close` 方法，不释放的话程序会一直占用该文件

`FileOutputStream` 方法：

- `void write(int b)` 一次写一个字节数据
- `void write(byte[])` 一次写一个字节数组数据
- `void write(byte[] b, int off, int len)` 一次写一个字节数组的部分数据
  - `off` 起始索引 (相对于 0 的偏移量 `offset`)，`len` 撷取长度 `length`

### 换行符

不同操作系统的行分隔符（换行符）：

- Windows：CRLF = `\r\n` = 回车 + 换行
- Unix、macOS：LF = `\n` = 换行
- OS X：CR = `\r` = 回车

### 字节输入流 `FileInputStream`

`FileInputStream` 方法：

- 构造方法：传入路径的字符串或 `File` 对象，若找不到文件则直接报错
- 成员方法：
  - `read` 方法：一次读一个字符，返回 UTF-16 编码，读不到返回 `-1`
  - `read(byte[] buffer)` 方法：一次读一个字节数组 `buffer` 的数据，每次尽可能把 `buffer` 装满，返回读的长度
  - `read` 方法是阻塞的，如果输入流中没有数据，也没有结束标记，那么它将挂起线程无限等待

## `IOException` 异常处理

IO 流操作都会报 `IOException`，可以在方法声明中添加 `throws` 把异常抛出给调用者处理，或在方法内使用 `try-catch-finally` 结构处理。

```java
FileOutputStream fo = null;
try {
  fo = new FileOutputStream("assets/c.txt");
  fo.write(new byte[]{97, 98, 99, 100, 101}, 1, 2); /* bc */
} catch (IOException e) {
  e.printStackTrace();
} finally {
  if (fo != null)
    try {
        fo.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

无论出不出异常，IO 流都需要释放资源，因此在 `finally` 中释放资源。但是这样写太麻烦了，于是可以用 `AutoCloseable` 接口，它可以在特定情况下释放资源。

![IO 流 try-catch 异常处理](https://img.xicuodev.top/2026/03/450282d4def9558bfdf5c9158f47f09a.png "IO 流 try-catch 异常处理")

`try` 后面的小括号中写创建对象的代码。只有实现了 `AutoCloseable` 接口的类，才能在 `try` 的小括号中创建对象。而 IO 流的类一般都实现了 `AutoCloseable` 接口。

## 字符流

字符流的底层其实就是字节流，字符流 = 字节流 + 字符集。

- 字符输入流 `Reader`：一次读一个字节，遇到中文时，一次读多个字节
- 字符输出流 `Writer`：把数据按照特定的编码方式 (可指定，不指定就是默认的) 编码成字节，再写到文件中
- 字符流的默认编码格式一般是 UTF-8

### 字符输入流 `FileReader`

- 构造方法：接收 `File file` 或 `String pathname` 指定文件路径，以及可选的 `Charset` 对象指定字符集和编码方式，返回关联本地文件的字符输入流
- 成员方法：
  - `read()` 读取数据，读到末尾返回 `-1`

  - `read(char[] buffer)` 读取多个数据，读到末尾返回 `-1`
    - 按字节读取，遇到汉字时一次读多个字节
    - 读取后解码，把解码的结果存到 char 数组中，返回解码出的字节个数的整数
    - `char` 底层是 UTF-16 编码，所以整个过程是：

```
文件中的特定编码 -(FileReader + 特定解码器)-> Unicode 码位 (int) -(UTF-16 编码器)-> char 中的 UTF-16 编码
```

  - `close()` 释放资源

### 字符输出流 `FileWriter`

- 构造方法：传入 `File file` 或 `String pathname` 指定文件路径，可选的 `Charset` 对象指定字符集和编码方式，以及可选的 `boolean append` 指定是否续写
  - 构造时的细节同 [`FileOutputStream`](#javaiofileoutputstream)

- 成员方法：
  - `write` 方法：写字符 (接收 `int char`)，写字符串，写字符串的一部分，写字符数组，写字符数组的一部分
    - `FileOutputStream` 的无参 `write` 方法一次只能写 1 个字节，`FileWriter` 的无参 `write` 方法一次可以写 1 个字符，`fo.write(0b110_0010_0001_0001)` 高位会被截去，只留下低 8 位 `0b0001_0001`，这是控制字符 DC1 的 ASCII 码，`fw.write(0b110_0010_0001_0001)` 可以经编码后完整输出到文件
    - `FileWriter` 写字符时，先把数据按特定的编码方式编码，再写到文件中，因此它一次写的字节个数是不确定的
  - `public void flush()` 将缓冲区中的数据刷新到本地文件中，可继续写数据
    - 如果缓冲区写满了，那么会自动调用一次 `flush` 方法
  - `public void close()` 释放资源 = 关流，并将缓冲区的数据保存到本地文件中，不可继续写数据
    - 虽然 `close` 会先做一下把内部缓冲区剩下的数据保存到文件的收尾工作，但应该养成及时 `flush` 的习惯，尤其是不能关闭流的情况

### 字符流底层原理

`FileReader` 底层：

- `FileReader` 创建对象关联文件时，会在内存中创建一块长度为 8192 的字节数组，作为缓冲区
- 每次调用 `read` 方法读取时，`FileReader` 都会判断缓冲区是否有数据
  - 如果有，按特定的编码方式从缓冲区读取数据
  - 如果没有，从文件读取数据，尽可能装满缓冲区，再从缓冲区读取
  - 如果文件中也没数据了，返回 `-1`
  - 如果缓冲区放不下了，就从头开始覆盖

`FileWrite` 底层：

- `FileWriter` 创建对象关联文件时，也会在内存中创建一块长度为 8192 (后改为 512) 的字节数组，作为缓冲区
- 每次调用 `write` 方法写出时，`FileWriter` 都会往缓冲区中追加数据，直到调用 `flush` 或 `close` 方法才保存数据到文件
- 如果缓冲区放不下了，会自动调用 `flush` 方法保存一次数据，然后再从头开始覆盖缓冲区

## 字节缓冲流 (`BufferedOutputStream`...)

**字节缓冲流**底层自带了长度为 8192 的缓冲区提高性能，包括 `BufferedOutputStream` 类和 `BufferedOutputStream` 类。

- 构造方法：把基本流包装成高级流，提高写出数据的性能
  - `BufferedInputStream(InputStream is)`
  - `BufferedOutputStream(OutputStream os)`
- `BufferedOutputStream` 成员方法：
  - `public void flush()`：将缓冲区中的数据刷新到目的地，可继续写数据
  - 如果缓冲区写满了，那么会自动调用一次 `flush` 方法
  - `BufferedOutputStream` 先写出到内部缓冲区，每次缓冲区满了才会调用一次 flush 方法真正写出到目的地，所以必须在循环写出后手动调用一次 `flush` 方法把内部缓冲区中剩下的数据继续写出，才算把所有数据全部写出

字节缓冲流提高效率的原理：

![字节缓冲流提高效率的原理](https://img.xicuodev.top/2026/03/42f0a6b86e60e64df3c887784b6a5dda.png "字节缓冲流提高效率的原理")

- 倒手变量 `b` 在内存中搬运数据，节约了读写硬盘的时间。
- 若要提高复制效率，就要用字节数组 `byte[]` 做倒手变量，数组越长效率越高。

## 字符缓冲流 (`BufferedReader`...)

**字符缓冲流**底层自带了长度为 8192 的缓冲区提高性能，但字符流本来就有缓冲区，因此字符缓冲流提高的效率不是很明显。不过，字符缓冲流提供了几个额外的方法。

- 字符缓冲输入流 `BufferedReader` 方法：`String readLine()` 读取一行数据，如果没有数据可读了，会返回 `null`；`readLine()` 方法一次读一整行，遇到回车换行结束，但是它不会把回车换行读出。
- 字符缓冲输出流 `BufferedWriter` 方法：`String newLine()` 写出一个跨平台的换行。

## 转换流 (`InputStreamReader`...)

**转换流**是[字符流](#字符流-filereader)和[字节流](#字节流-fileoutputstream)之间的桥梁，把字节流封装成字符流，使它可以像字符流那样读写文本数据。转换流包括 `InputStreamReader` 和 `OutputStreamWriter` 类。

- 作用 1：指定字符集读写 (淘汰，`FileReader` 和 `FileWriter` 取代)
- 作用 2：方便字节流使用字符流中的方法

## 序列化流与反序列化流 (`ObjectOutputStream`...)

**序列化流**（对象操作输出流）`ObjectOutputStream` 类是字节输出流的封装，可以把 Java 对象写到本地文件中。使用序列化流之前，需要让 [Java Bean]({{% sref "java-bean" %}}) 实现 `Serializable` 接口，否则抛 `NotSerializableException` 不可序列化异常。

- `Serializable` 接口中没有抽象方法，是标记型接口。
- 不想序列化到本地文件的字段，用瞬态关键字 `transient` 修饰。

`ObjectOutputStream` 方法：

- `final void writeObject(Object obj)` 把对象序列化 (写出) 到文件中去

**反序列化流**（对象操作输入流）`ObjectInputStream` 类是字节输入流的封装，可以把序列化到本地文件中的对象，读取到程序中来。

- 序列号 (serial number) 是序列化流根据对象的所有成员计算出的一个 `long` 类型的唯一标识数字。
- 若 Bean 在序列化后有修改，就会导致文件中的序列号和 Bean 中的序列号不匹配，反序列化失败，抛 `InvalidClassException` 无效的类异常。
  - 解决方案 1 (推荐)：`IDEA-编辑器-检查`中勾选两个选项：JVM 语言 - 不带 `'serialVersionUID'` 的可序列化类；Java - `transient` 字段在反序列化时未初始化
  - 解决方案 2：给 Bean 自己定义一个序列号：`private static final long serialVersionUID` (固定格式)。

`ObjectInputStream` 方法：

- `final Object readObject()` 把文件中的序列化对象读取到程序中来
- 读到文件末尾还继续读，抛 `EOFException` 文件末尾异常

### 序列化或反序列化多个对象

如果不知道序列化时写出多少个对象，那么反序列化时就不知道读取多少个，不能等到抛 `EOFException` 再处理，这是人为制造异常。因此，约定序列化多个对象时，先把这些对象放到一个集合当中再序列化。

## 打印流

**打印流**可以把数据像打印在控制台中一样打印到文件中，包括字节打印流 `PrintStream` 和字符打印流 `PrintWriter` 两个类。

- 打印流只操作文件目的地，不操作数据源
- 打印流特有的写出方法可以实现数据原样写出
  - 打印：`97`，文件中：`97`
  - 打印：`true`，文件中：`true`
- 打印流特有的写出方法可以实现自动刷新，自动换行
  - 打印一次数据 = 写出 + 换行 + 刷新

### 字节打印流 `PrintStream`

打印数据到控制台最常用的 System.out 对象就是 JVM 提供的一个字节打印流对象，又名标准输出流。标准输出流在程序中是唯一的，不能关闭，否则之后将不能再往控制台输出数据，且无法重新创建。

字节流底层没有缓冲区，开不开自动刷新都一样。

构造方法：

- `PrintStream(OutputStream/File/String)` 关联字节输出流 / 文件 / 文件路径
- `PrintStream(String fileName, Charset charset)` 指定字符编码
- `PrintStream(OutputStream out, boolean autoFlush)` 自动刷新
- `PrintStream(outputStream out, boolean autoFlush, String encoding)` 指定字符编码且自动刷新

成员方法：

- `write(int b)` 常规方法：规则跟之前一样，将指定的字节写出
- `println(Xxx xx)` 特有方法：打印任意数据，自动刷新，自动换行
- `print(Xxx xx)` 特有方法：打印任意数据，不换行
- `printf(String format, Object... args)` 特有方法：带有占位符[^1]的打印语句，不换行

[^1]: 参考 C 语言的 `printf()` 函数的占位符。

### 字符打印流 `PrintWriter`

字符流底层有缓冲区，想要自动刷新需要开启。

构造方法：

- `PrintWriter(Writer/File/String o)` 关联字节输出流 / 文件 / 文件路径
- `PrintWriter(String fileName, Charset charset)` 指定字符编码
- `PrintWriter(Writer w, boolean autoFlush)` 自动刷新
- `PrintWriter(OutputStream out, boolean autoFlush, Charset charset)` 指定字符编码且自动刷新

成员方法：

- `write(...)` 常规方法：规则跟之前一样，写出字节或者字符串
- `println(Xxx xx)` 特有方法：打印任意类型的数据并且换行
- `print(Xxx xx)` 特有方法：打印任意类型的数据，不换行
- `printf(String format, Object...args)` 特有方法：带有占位符的打印语句

## 压缩流与解压缩流

压缩包中的每个文件或文件夹都是一个 `ZipEntry` 对象，解压缩的底层就是把每一个 `ZipEntry` 对象按照层级拷贝到本地另一个文件夹中。解压缩流只能处理`.zip` 文件。

### 解压缩流 `ZipInputStream`

构造方法：传入字节输入流和可选的字符集参数

成员方法：

- `nextZipEntry` 方法：返回下一个 `ZipEntry` 对象，它是递归遍历的，获取不到返回 null
- `read` 方法：读取当前遍历到 `ZipEntry` 对象，每次读取一个字节或尽可能装满传入的字节数据 = 缓冲区
- `closeEntry` 方法：关闭当前遍历到的 `ZipEntry` 对象

### 压缩流 `ZipOutputStream`

构造方法：传入字节输入流和可选的字符集参数

成员方法：

- `putZipEntry` 方法：添加下一个 `ZipEntry` 对象，`ZipEntry` 对象的名称就是文件或文件夹在压缩包中的路径，需要先创建父级目录才能创建子级路径，这点和压缩包外的文件系统一样
  - 如果没有父级目录的 `ZipEntry` 条目，那么有些解压软件可能无法识别出正确的文件层级
- `read` 方法：读取当前遍历到 `ZipEntry` 对象，每次读取一个字节或尽可能装满传入的字节数据 = 缓冲区
- `closeEntry` 方法：关闭当前遍历到的 `ZipEntry` 对象
