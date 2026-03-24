---
weight: 90
slug: linux-service-commands
title: Linux 服务命令
---

Linux 系统很多软件 (内置或第三方) 均支持使用 `systemctl` 命令控制它们的启动、停止和开机自启。能够用 `systemctl` 管理的软件，一般也称之为服务或服务单元。

- `systemctl start丨stop丨status丨enable丨disable 服务名`
  - start 启动，stop 关闭，status 查看状态，enable 开启开机自启，disable 关闭开机自启
  - 除了 status，其他的操作都需要 root 权限

- 系统内置的服务比较多，比如：NetworkManager 主网络服务，network 副网络服务，firewalld 防火墙服务，sshd、ssh 服务 (FinalShell 远程登录 Linux 使用的就是 ssh 服务)

- 第三方同步服务：ntpd 时间同步服务，httpd Apache 服务器服务

部分软件安装后没有自动集成到 systemctl 中，我们可以手动添加。
