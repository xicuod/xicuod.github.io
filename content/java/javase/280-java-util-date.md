---
weight: 280
slug: java-util-date
title: java.util.Date (Java 7)
---

`Date` 构造方法：

- `Date()` 获取当前系统日期和时间（时间戳）`Wed Mar 13 20:09:10 CST 2024`
- `Date(long time)` 返回传入毫秒值对应的时间戳 `new Date(0L) /* Thu Jan 01 08:00:00 CST 1970 */`

`Date` 成员方法：

- `long getTime()` 返回当前时间戳的毫秒值
- ~~`String toLocaleString()`~~（过时的）返回本地化的当前时间戳
