---
weight: 560
slug: java-tools
title: Java 常用工具包
---

## Commons-io 工具包

Commons-io 是 Apache 开源基金组织提供的一组有关 IO 操作的开源工具包，包括操作文件的 `FileUtils` 类、操作 IO 的 `IOUtils` 类等。

- Apache 专门为支持开源软件项目而创办的一个非盈利性组织，成立于 1999 年，总部设于美国马里兰州。
- 约定 Java 项目根目录下的 `lib` 目录专门存放第三方的 Java 软件包 = `jar` 包。

IntelliJ IDEA 导包的操作步骤：

- 在项目根目录下创建一个 `lib` 文件夹
- 将 `jar` 包复制粘贴到 `lib` 文件夹
- 右键点击 `jar` 包，选择 `Add as Library`
- 在类中 `import` 导包使用

`FileUtils` 方法：

- `copyFile(File srcFile, File destFile)` 复制文件
- `copyDirectory(File srcDir, File destDir)` 复制文件夹为指定文件夹
- `copyDirectoryToDirectory(File srcDir, File destDir)` 复制文件夹到指定文件夹下
- `deleteDirectory(File directory)` 删除文件夹
- `cleanDirectory(File directory)` 清空文件夹，保留文件夹本身
- `String readFileToString(File file, Charset encoding)` 读取文件中的数据为字符串
- `write(File file, CharSequence data, String encoding)` 向文件写出数据

`IOUtils` 方法：

- `int copy(InputStream input, OutputStream output)` 复制文件
- `int copyLarge(Reader input, Writer output)` 复制大文件
- `String readLines(Reader input)` 读取数据
- `write(String data, OutputStream output)` 写出数据

## Hutool 工具包

|    Hutool 工具类    |             说明             |
| :-----------------: | :--------------------------: |
|      `IoUtil`       |         流操作工具类         |
|     `FileUtil`      |    文件读写和操作的工具类    |
|   `FileTypeUtil`    |      文件类型判断工具类      |
|   `WatchMonitor`    |        目录、文件监听        |
| `ClassPathResource` | `ClassPath` 中资源的访问封装 |
|    `FileReader`     |         封装文件读取         |
|    `FileWriter`     |         封装文件写入         |

- Hutool 官网：[https://hutool.cn/](https://hutool.cn/)
- Hutool 参考文档：[https://doc.hutool.cn/pages/](https://doc.hutool.cn/pages/)
- Hutool API 文档：[https://plus.hutool.cn/apidocs/](https://plus.hutool.cn/apidocs/)
