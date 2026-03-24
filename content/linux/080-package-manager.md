---
weight: 80
slug: linux-package-manager
title: Linux 软件包管理器
---

不同 Linux 发行版内内置的默认包管理器不一样，CentOS 使用 yum、Ubuntu 使用 apt、Arch Linux 使用 pacman 等。

## yum 包管理器

yum 是一款 RPM 包软件管理器，用于自动化安装配置 Linux 软件，并可以自动解决依赖问题。

- `yum [-y] [install丨remove丨search] 软件名称`
  - 选项：`-y` 自动确认，无需手动确认安装或卸载过程
  - install: 安装，remove: 卸载，search: 搜索
- yum 命令需要 root 权限，需要联网
- `yum -y install wget` 通过 yum 命令安装 wget 程序

## apt 包管理器

apt 是一款 DEB 包管理器，用法同 yum 一样。

## pacman 包管理器

- 通过包名安装一个或多个软件包：

```bash
pacman -S 包名1 包名2 ...
```

- 升级所有软件包 = 升级整个系统：

```bash
pacman -Syu
```

> 在 Arch 上安装软件包时，请避免在还没有[更新系统](https://wiki.archlinuxcn.org/wiki/Pacman#升级软件包)前刷新同步软件包列表 (例如，当官方软件仓库[不再提供某个软件包](https://wiki.archlinuxcn.org/wiki/Pacman#安装时无法获取软件包)时)。实际操作上，请使用 `pacman -Syu 软件包名`, 而**不要**使用 `pacman -Sy 软件包名`，因为后者可能会导致依赖问题。

- 删除单个软件包，保留其全部已经安装的依赖关系：

```bash
pacman -R 包名
```

- 删除指定软件包，及其所有没有被其他已安装软件包使用的依赖关系：

```bash
pacman -Rs 包名
```

更多参见 [Pacman - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Pacman)。
