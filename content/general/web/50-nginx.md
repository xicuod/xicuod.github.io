---
weight: 50
slug: nginx
title: Nginx 前端服务器
---

> [!note] 配置文件位置
>
> macOS 上通过 Homebrew 安装的 nginx 的配置文件在 `/opt/homebrew/etc/nginx/nginx.conf`。

重新加载 `nginx.conf` 配置文件：不必每次都重启 nginx 服务

```sh
nginx -s reload
```
