---
weight: 150
slug: linux-environment-variables
title: Linux 环境变量
---

> 在讲解 `which` 命令的时候，我们知道使用的一系列命令其实本质上就是一个个的可执行程序。比如，`cd` 命令的本体就是 `/usr/bin/cd` 这个程序文件。为何无论当前工作目录在哪里，都能执行 `/usr/bin/cd` 这个程序呢？这是因为环境变量，具体地说，是因为环境变量 PATH。

**环境变量**是操作系统 (Windows、Linux、macOS 等) 在运行时记录的一些关键性信息，用以辅助系统运行。

## env 命令：查看环境变量

在 Linux 系统中，`env` 命令可以查看当前系统中记录的环境变量。环境变量是一种 KeyValue 型结构，也就是键值对结构，形如 `Key=Value`：

- `HOME=/home/your-username` 用户的 HOME 路径
- `USER=your-username` 当前的操作用户
- `PWD=/path/to/work/dir` 当前工作路径
- `PATH=/path/to/bin` 命令的可执行二进制程序文件路径

 PATH 记录了系统执行任何命令的搜索路径，包括 (路径之间以 `:` 隔开)：

1. `/usr/local/bin`
2. `/usr/bin`
3. `/usr/local/sbin`
4. `/usr/sbin`
5. `/home/your-username/.local/bin`
6. `/home/your-username/bin`

Linux 执行任何命令时，都会按照以上顺序从 PATH 的路径中查找要执行的程序的本体。比如执行 cd 命令，就从第二个目录 `/usr/bin` 中查找到了 `/usr/bin/cd` 程序并执行。

## 美元符号 $：获取环境变量的值

> 在 Linux 系统中，环境变量记录的信息，除了给操作系统自己使用外，如果我们想要取用，也可以拿来自己使用。

`$` 符号用于获取环境变量的值。可以用 `$环境变量名`来取得环境变量的值，比如 `echo $PATH` 就可以取得环境变量 PATH 的值，并通过 echo 命令输出。当和其它内容混合在一起的时候，可以通过美元符和花括号 `${}` 来标注谁是环境变量，如 `echo PATH=${PATH}`。

## Linux 设置环境变量

Linux 环境变量可以用户自行设置，其中分为：

- 临时设置：`export 键=值`

- 永久生效：在配置文件 (shell 脚本) 中添加一行 `export 键=值`

  - 针对当前用户生效，配置在当前用户的`~/.bashrc` 文件中

  - 针对所有用户生效，配置在系统的 `/etc/profile` 文件中

  - 运行 `source 配置文件`来使配置立刻生效，或重新登录终端生效

环境变量 PATH 这个项目里面记录了系统执行命令的搜索路径，我们也可以添加自己程序的路径到 PATH 中去，从而可以在任何工作目录下执行我们自己写的命令。

- 要追加 PATH 的路径，应该写成 `export PATH=$PATH:追加的路径`。

## Linux 环境变量的加载顺序

1. `/etc/environment`
2. `/etc/profile` (一般全局自定义配置写在这)
3. `/etc/bash.bashrc`
4. `/etc/profile.d/test.sh`
5. `~/.profile`
6. `~/.bashrc` (一般用户自定义配置写在这)
