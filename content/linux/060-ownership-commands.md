---
weight: 60
slug: linux-ownership-commands
title: Linux 所属命令
---

使用 chown 命令，可以修改文件、文件夹的所属用户和用户组。普通用户无法修改所属为其它用户或组，所以此命令只适用于 root 用户执行。

语法：`chown [-R] [用户][:][用户组] 文件或文件夹`

- 选项 `-R`：对文件夹内全部内容应用相同规则
- 选项`用户`：修改所属用户
- 选项`用户组`：修改所属用户组
- 冒号`:`：用于分隔用户和用户组

示例：

- `chown root hello.txt` 将 hello.txt 所属用户修改为 root
- `chown :root hello.txt` 将 hello.txt 所属用户组修改为 root
- `chown root:itheima hello.txt` 将 hello.txt 所属用户修改为 root，用户组修改为 itheima
- `chown -R root test` 将文件夹 test 的所属用户修改为 root 并对文件夹内全部内容应用同样规则
