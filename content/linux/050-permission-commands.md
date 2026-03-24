---
weight: 50
slug: linux-permission-commands
title: Linux 权限命令
---

可以使用 chmod 命令修改文件、文件夹的权限信息。注意，只有文件、文件夹的所属用户或 root 用户可以修改它们的权限信息。

- `chmod [-R] 权限 文件或文件夹`
  - 选项：-R 对文件夹内的全部内容应用同样的操作
- `chmod u=rwx,g=rx,o=x hello.txt` 将文件权限设为 `rwxr-x--×`
  - u：user 所属用户权限，g：group 组权限，o：other 其它用户权限
- `chmod -R u=rwx,g=rx,o=x test` 将文件夹 test 以及文件夹内全部内容权限设为 `rwxr-x--x`

权限的数字写法 (绝对模式)：r=4，w=2，x=1，用它们的和表示权限

- rwx=7，rw-=6，r-x=5，r--=4，-wx=3，-w-=2，--x=1，---=0
- `chmod 751 path` = `chmod u=rwx,g=r-x,o=--x path`

权限的增删改写法 (符号模式)：`chmod [ugoa][+-=][rwx] 文件或文件夹`

- `a`：所有用户，`+`：增加权限，`-`：撤除权限，`=`：设定权限，其他同上
