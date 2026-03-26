---
weight: 120
slug: linux-network-commands
title: Linux 网络命令
---

## `ifconfig` 与 `ip address` 命令

> 每一台联网的电脑都会有一个 IP 地址，用于和其它计算机进行通讯。IP 地址主要有 2 个版本，V4 版本和 V6 版本。IPv4 版本的地址格式是：a.b.c.d，其中 abcd 表示 0-255 的数字，如 192.168.88.101 就是一个标准的 IP 地址。

通过命令 `ifconfig` 查看本机的网络配置和 IP 地址

- 如无法使用 `ifconfig` 命令，确保安装 `net-tools` 软件包：`yum -y install net-tools`
- 一些发行版使用 `iproute2` 软件包，可以用 `ip address` 替代 (=`ip a`，只打第一个字母即可匹配)

特殊 IP 地址：

- 127.0.0.1=localhost，这个 IP 地址指代本机
- 0.0.0.0
  - 可以指代本机
  - 可以在端口绑定中确定绑定关系
  - 在一些 IP 地址限制中指代所有 IP ，如放行规则设置为 0.0.0.0，表示允许任意 IP 访问

主机名：每一台电脑除了对外联络地址 (IP 地址) 以外，也可以有一个名字，称之为主机名。无论是 Windows、macOS 或 Linux 系统，都可以给系统设置主机名。

- `hostname` 查看 Linux 系统的主机名
- `hostnamectl set-hostname 主机名` 修改主机名 (需 root)，重新创建一个终端会话即可看到主机名已经正确显示

## 域名解析与静态 IP

IP 地址实在是难以记忆，有没有什么办法可以通过主机名或替代的字符地址去代替数字化的 IP 地址呢？实际上，我们一直都是通过字符化的地址去访问服务器，很少指定 IP 地址。比如，我们在浏览器内输入 `www.baidu.com` 会打开百度网页，其中 `baidu.com` 是百度的域名。域名解析就是把域名映射到 IP 地址。

域名解析的流程：

1. 先查看本机的 `hosts` 记录 (私人地址本)
   - Windows：`C:\Windows\System32\drivers\etc\hosts`
   - Linux/macOS：`/etc/hosts`
   - 每行映射关系的格式：`IP 域名`
2. 再联网去 DNS 服务器 (如 114.114.114.114、8.8.8.8 等) 查询映射记录

可以修改宿主机的 hosts 实现通过域名访问虚拟机，但虚拟机的 IP 地址一般会变，需要设置固定 IP 地址：

> 当前的 Linux 操作系统虚拟机，其 IP 地址是通过 DHCP 服务获取的。
>
> DHCP：动态获取 IP 地址，即每次重启设备后都会获取一次，可能导致 IP 地址频繁变更。

> - 原因 1：办公电脑 IP 地址变化无所谓，但是我们要远程连接到 Linux 系统，如果 IP 地址经常变化我们就要频繁修改适配很麻烦。
> - 原因 2：在刚刚我们配置了虚拟机 IP 地址和主机名的映射，如果 IP 频繁更改，我们也需要频繁更新映射关系。

> 综上所述，我们需要 IP 地址固定下来，不要变化了。

不同发行版的网络配置文件的位置不同，修改各项配置的写法也不同：

- CentOS：`/etc/sysconfig/network-scripts/ifcfg-<interface>`(RHEL 红帽系列)
- Arch：`/etc/systemd/network/<interface>.network`
- `<interface>` 网络接口名，通过 `ifconfig` 或 `ip link` 命令查看

在 VMware 虚拟机上的 CentOS 系统配置固定 IP 地址的步骤参见[黑马 Linux-P35 - 哔哩哔哩](https://www.bilibili.com/video/BV1n84y1i7td?p=35)。

在 OrbStack 虚拟机上的 Arch 上，首先查看 macOS 的网络配置：

```zsh
❯ ifconfig
bridge102: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	options=63<RXCSUM,TXCSUM,TSO4,TSO6>
	ether a2:9a:8e:35:cb:66
	inet 192.168.139.3 netmask 0xfffffe00 broadcast 192.168.139.255
	inet6 fe80::a09a:8eff:fe35:cb66%bridge102 prefixlen 64 scopeid 0x19 
	inet6 fd07:b51a:cc66:0:a617:db5e:ab7:e9f1 prefixlen 64 
	Configuration:
		id 0:0:0:0:0:0 priority 0 hellotime 0 fwddelay 0
		maxage 0 holdcnt 0 proto stp maxaddr 100 timeout 1200
		root id 0:0:0:0:0:0 priority 0 ifcost 0 port 0
		member: vmenet2 flags=10003<LEARNING,DISCOVER,CSUM>
	        ifmaxaddr 0 port 24 priority 0 path cost 0
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active
```

OrbStack 采用网络桥接模式：`macOS->bridge102->Arch虚拟机`，Arch 虚拟机的静态 IP 需要设在桥接接口 `bridge102` 的 `192.168.139.3/23` 网段下才能接通 macOS。

在 Arch 中修改 `/etc/systemd/network/eth0.network`，设置主机地址、网关地址和 DNS 地址：

```ini
[Match]
Name=eth0

[Network]
Address=192.168.139.130/23
Gateway=192.168.139.1
DNS=192.168.139.1
#DHCP=ipv4 #移除DHCP(动态IP)相关配置，因为使用静态IP
```

- 把同目录下的 `eth.network` 重命名为 `eth.network.bak`，以防止它抢占配置 (它是通用的 `eth` 配置)
- 最后，重启 `systemd-networkd` 服务
- 现在运行 `ip a` 即可看到 `eth0` 接口绑定的静态 IP 地址：`inet 192.168.139.130/23 brd 192.168.139.255 scope global eth0`
- macOS 可根据该静态 IP 地址设置 hosts 来永久通过域名访问 Arch 虚拟机

## ping 命令：检查服务器连通状态

可以通过 ping 命令检查指定的网络服务器是否是可联通状态

用法：`ping [-c num] ip或主机名`

- 选项：-c 检查的次数，不使用 -c 选项，将无限次数持续检查
- 参数：ip 或主机名，被检查的服务器的 ip 地址或主机名地址

## wget 命令：下载网络文件

wget 是非交互式的文件下载器，可以在命令行内下载网络文件

用法：`wget [-b] url`

- 选项：-b (可选) 后台下载，会将日志写入到当前工作目录的 wget-log 文件
- 参数：url 下载链接
- `^C` 中途取消 wget，下载到一半的文件不会自动清理，需要手动删除

## curl 命令：发送 http 请求

curl 可以发送 http 网络请求，可用于下载文件、获取信息等

用法：`curl [-O] url`

- 选项：-O 用于下载文件，当 url 是下载链接时，可以使用此选项保存文件
- 参数：url 要发起请求的网络地址

示例：`curl cip.cc`，[cip.cc](https://cip.cc) 是个获取请求主机的公网 IP 地址的网站

## 端口

端口，是设备与外界通讯交流的出入口。端口可以分为物理端口和虚拟端口：

- 物理端口：又称为接口，是可见的端口，如 USB 接口，RJ45 网口，HDMI 端口等
- 虚拟端口：是指计算机内部的端口，是不可见的，是用来操作系统和外部进行交互使用的

计算机程序之间的通讯，通过 IP 只能锁定计算机，但是无法锁定具体的程序。通过虚拟端口可以锁定计算机上具体的程序，确保程序之间进行沟通。

Linux 系统可以支持 65535 个端口，这 6 万多个端口分为 3 类使用：

- 公认端口：1-1023，通常用于一些系统内置或知名程序的预留使用，如 SSH 服务的 22 端口，HTTPS 服务的 443 端口，非特殊需要，**不要**占用这个范围的端口
- 注册端口：1024-49151，通常可以随意使用，用于松散的绑定一些程序或服务
- 动态端口：49152-65535，通常不会固定绑定程序，而是当程序对外网络连接时，用于临时使用

例如，计算机 A 的微信连接计算机 B 的微信，A 使用 50001 动态端口，临时找一个端口作为出口。计算机 B 的微信使用端口 5678 注册端口 (仅为示例，非实际端口)，长期绑定此端口等待别人连接。

## nmap 命令：嗅探端口占用

可以通过 nmap 命令查看指定主机的端口的占用情况。安装 nmap：`yum -y install nmap`。

- 用法：`nmap IP地址`

```bash
[ror@arch ~]$ nmap localhost
Starting Nmap 7.97 ( https://nmap.org ) at 2025-09-28 13:44 +0800
Nmap scan report for localhost (127.0.0.1)
Host is up (0.000016s latency).
Other addresses for localhost (not scanned): ::1
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh

Nmap done: 1 IP address (1 host up) scanned in 0.04 seconds
```

可以看到，本机 (localhost) 上只有一个 22 端口现在被 ssh 程序占用了。

- 22 端口一般是 SSH 服务使用，即 FinalShell 客户端远程连接 Linux 所使用的端口

## netstat 命令：查看指定端口占用

可以通过 netstat 命令查看指定端口的占用情况。安装 netstat：`yum -y install net-tools`。

- 用法：`netstat -anp | grep 端口号`

```bash
[ror@arch ~]$ sudo netstat -anp | grep 22
tcp     0      0 0.0.0.0:22     0.0.0.0:*       LISTEN      193/sshd: /usr/bin/
tcp6    0      0 :::22          :::*            LISTEN      193/sshd: /usr/bin/
```

可以看到当前系统 22 端口被程序 sshd (进程号 193) 占用了。其中，0.0.0.0:22 表示端口 22 绑定在 0.0.0.0 这个 IP 地址上，且允许外部访问。

```bash
[root@arch ~]$ netstat -anp | grep 12345
[root@arch ~]$
```

可以看到，现在系统的 12345 端口无人使用。

由于使用了 grep 过滤，也可以后跟 ` | grep 进程号` 查看指定进程占用了哪些端口。
