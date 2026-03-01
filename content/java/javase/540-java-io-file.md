---
weight: 540
slug: java-io-file
title: java.io.File
---

`File` 对象就表示一个路径，可以是文件的路径、也可以是文件夹的路径。这个路径可以是存在的，也允许是不存在的。

绝对路径和相对路径：

- 绝对路径是带盘符或根目录 `/` 的。
- 相对路径是不带盘符或根目录 `/` 的，默认到当前项目下去找。

路径分隔符：

- Windows：`\` (需要转义写法`\\`)
- macOS、Linux：`/`

`File` 构造方法：

- `File(String pathname)` 根据文件路径创建文件对象
- `File(String parent, String child)` 根据父路径名字符串和子路径名字符串创建文件对象
- `File(File parent, String child)` 根据父路径对应文件对象和子路径名字符串创建文件对象

`File` 成员方法：

- 判断、获取文件或文件夹
  - `boolean isDirectory()` 判断此路径名表示的 `File` 是否为文件夹
  - `boolean isFile()` 判断此路径名表示的 `File` 是否为文件
  - `boolean exists()` 判断此路径名表示的 `File` 是否存在
  - `long length()` 返回文件的大小 (字节数量)
  - `String getAbsolutePath()` 返回文件的绝对路径
  - `String getPath()` 返回定义文件时使用的路径
  - `String getName()` 返回文件的名称，带后缀
  - `long lastModified()` 返回文件的最后修改时间 (时间毫秒值)

- 创建、删除文件或文件夹
  - `boolean createNewFile()` 创建一个新的空的文件
    - 如果文件已存在则创建失败，返回 `false`
    - 如果父级路径不存在，那么抛 `IOException`
    - `createNewFile` 创建的一定是文件，如果路径中不包含后缀名，则创建一个没有后缀的文件
  - `boolean mkdir()` 创建单级文件夹 (目录) `make directory`
    - Windows 下的路径一定是唯一的，不存在相同路径的文件和文件夹
    - 如果存在路径 `path\to\some-name` 的无后缀名文件，那么创建路径 `path\to\some-name` 的文件夹会失败
    - `mkdir` 只能创建单级文件夹，`mkdirs` 才能创建多级文件夹
  - `boolean mkdirs()` 创建多级文件夹
    - `mkdirs` 底层创建单级文件夹时复用了 `mkdir`，因此它完全覆盖了 `mkdir` 的逻辑，以后都使用 `mkdirs` 就好了
  - `boolean delete()` 删除文件、空文件夹
    - `delete` 方法默认只能删除文件和空文件夹，且为直接删除，不走回收站

- 获取并遍历文件或文件夹
  - `File[] listFiles()` 获取当前该路径下所有内容，返回它们的 `File[]` 数组
    - 当调用者 `File` 表示的路径不存在、是文件或是需要权限才能访问的文件夹时，返回 `null`
    - 当调用者 `File` 表示的路径是一个空文件夹时，返回一个长度为 0 的数组
    - 当调用者 `File` 表示的路径是一个有内容的文件夹时，将里面所有文件和文件夹的路径放在 `File` 数组中返回，包括隐藏的文件和文件夹
  - `static File[] listRoots()` 列出可用的文件系统根
    - Windows 会遍历所有盘符，macOS、Linux 只有一个根目录，所以只能遍历出一个根
  - `String[] list()` 获取当前该路径下所有内容的名称
  - `String[] list(FilenameFilter filter)` 利用文件名过滤器获取路径下所有内容的名称数组
    - `FilenameFilter` 是个函数式接口，它的抽象方法接收 `File dir` 和 `String filename`，返回是否保留当前路径的 `boolean`，`list` 方法每次遍历时，向 `dir` 传入遍历目录，向 `filename` 传入文件名或文件夹名
  - `File[] listFiles()` 获取当前该路径下所有内容的 `File` 对象数组
  - `File[] listFiles(FileFilter filter)` 利用文件过滤器获取路径下所有内容的 `File` 对象数组
    - `FileFilter` 的抽象方法直接接收 `File file`，并返回是否保留当前路径的 `boolean`，`listFiles` 方法每次遍历时，向 `file` 传入遍历到的 `File` 对象
  - `File[] listFiles(FilenameFilter filter)` 利用文件名过滤器获取路径下所有内容的 `File` 对象数组
