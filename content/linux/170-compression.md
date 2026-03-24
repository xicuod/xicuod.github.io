---
weight: 170
slug: linux-compression
title: Linux 压缩与解压
---

市面上有非常多的压缩格式：

- zip：Linux、Windows、macOS 常用
- 7z (7zip)：Windows 常用
- rar：Windows 常用
- tar：Linux、macOS 常用
- gz (gzip)：Linux、macOS 常用

其中 Linux 常用 tar、gzip 和 zip 格式的压缩包。

## tar 命令：压缩与解压 tar 或 tar.gz

Linux 和 mac 系统常用有 2 种压缩格式，后缀名分别是：

- `.tar`：称为 tarball，归档文件，简单地将文件组装成一个`.tar` 文件，仅仅是简单的封装，并没有减少文件体积，反而往往会增加文件体积
- `.gz`：也常为`.tar.gz`，gzip 格式压缩文件，使用 gzip 压缩算法将文件压缩到一个文件内，可以极大的减少压缩前的体积

针对这两种格式，tar 命令均可以压缩和解压缩。

用法：`tar [-c -v -x -f -z -C] 参数1 参数2 ...`

- -c：创建归档或压缩文件，归档或压缩模式
- -v：显示压缩或解压过程，用于查看进度
- -x：extract，提取模式，与 - c 互为冲突选项
- -f：要创建或解压的文件，-f 选项**必须**是最后一个选项
- -z：gzip 模式，不写就是普通的 tarball 归档格式
- -C：选择解压的目的地，用于提取模式

> [!WARNING]
>
> 如果解压的目的地有压缩包中的同名文件或同路径文件，将覆盖原来的文件！建议指定一个空的文件夹作为解压目录。

常用选项组合：

- `tar -cvf test.tar 1.txt 2.txt 3.txt`，打包后 3 份 txt 文件为 `test.tar`
- `tar -zcvf test.tar.gz 1.txt 2.txt 3.txt`，使用 gzip 算法压缩后 3 份 txt 文件为 `test.tar.gz`
- `tar -xvf test.tar`，解包 `test.tar` 到当前目录下
- `tar -xvf test.tar -C test-unarc`，提取 `test.tar` 到 `test-unarc` 目录下
- `tar -zxvf test.tar.gz -C test-unzip`，解压 `test.tar.gz` 到 `test-unzip` 目录下
- `-z` 选项如果使用则一般处于选项位第一个
- `-f` 选项**必须**在选项位最后一个
- `-C` 选项单独使用，和解压所需的其它参数分开

## zip 命令：压缩 zip

可以使用 zip 命令压缩文件为 zip 压缩包。

用法：`zip [-r] 参数1 参数2 ... 参数N`

- -r：压缩的路径中包含文件夹时需要加上

示例：

- `zip test.zip a.txt b.txt c.txt` 将 a.txt、b.txt 和 c.txt 文件压缩到 test.zip
- `zip -r test.zip test itheima a.txt` 将 test 和 itheima 两个文件夹和 a.txt 文件压缩到 test.zip

## unzip 命令：解压 zip

使用 unzip 命令可以方便的解压 zip 压缩包，注意它可能会覆盖解压目录下的同路径文件。

用法：`unzip [-d] 参数`

- -d：指定要解压到的目录
- 参数：要解压的 zip 压缩包

示例：

- `unzip test.zip` 将 test.zip 解压到当前目录
- `unzip test.zip -d /home/itheima` 将 test.zip 解压到指定的 /home/itheima 文件夹
