---
weight: 110
slug: linux-time-timezone
title: Linux 时间和时区
---

`date` 命令可以在命令行中查看系统的时间。

用法：`date [-d] [+格式化字符串]`

- `-d` 按照给定的字符串显示日期，一般用于日期计算，可以和格式化字符串配合一起使用
  - 支持的时间标记：year 年，month 月，day 天，hour 小时，minute 分钟，second 秒
  - `date -d "+1 day" +%Y%m%d` 显示后一天的日期
  - `date -d "-1 day" +%Y%m%d` 显示前一天的日期
  - `date -d "-1 month" +%Y%m%d` 显示上一月的日期
  - `date -d "+1 month" +%Y%m%d` 显示下一月的日期
  - `date -d "-1 year" +%Y%m%d` 显示前一年的日期
  - `date -d "+1 year" +sY%m%d` 显示下一年的日期

格式化字符串：通过特定的字符串标记，来控制显示的日期格式

- `%Y` 年份
- `%y` 年份的后两位数字 (00-99)
- `%m` 月份 (01-12)
- `%d` 日 (01-31)
- `%H` 小时 (00-23)
- `%M` 分钟 (00-59)
- `%S` 秒 (00-60)
- `%s` 时间戳 (自 `1970-01-01 00:00:00 UTC` 到现在的秒数)

示例：

```bash
date "+%Y-%m-%d %H:%M:%S" #2025-09-28 07:27:43
```

ntp=network-time-protocol 软件包可以自动校准系统时间，安装 ntp 软件包，启动 ntpd 服务，设置 ntpd 服务开机自启。ntpd 启动后会定期地帮助我们联网校准系统时间。

ntp 也可以手动校准 (需 root 权限)：`ntpdate -u ntp.aliyun.com` 通过阿里云提供的 ntp 服务网址配合 ntpdate 命令 (ntp 附带的命令) 自动校准系统时间
