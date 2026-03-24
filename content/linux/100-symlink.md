---
weight: 100
slug: linux-symlink
title: Linux 软链接
---

在 Linux 系统中创建软链接（符号链接），可以将文件、文件夹链接到其它位置。链接只是一个指向，并不是物理移动。

用法：`ln -s [-f] src dest`

- `-s` 创建软链接 = 符号链接，如果目标路径已存在则创建失败
- `-f` 强制创建，删除已存在的目标路径
- 参数 `src`：被链接的文件或文件夹
- 参数 `dest`：要链接去的目的地

实例：

- `ln -s /etc/yum.conf ~/yum.conf`
- `ln -s /etc/yum ~/yum`

软链接在 `ls -l` 中显示为：`yum -> /etc/yum`，`yum.conf -> /etc/yum.conf`

![Linux 软链接](https://img.xicuodev.top/2026/03/e5c1dbace68a5e3a0844c2a3d4672645.png "Linux 软链接")
