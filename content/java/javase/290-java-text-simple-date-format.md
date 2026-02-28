---
weight: 290
slug: java-text-simple-date-format
title: java.text.SimpleDateFormat (Java 7)
---

`java.text.SimpleDateFormat` 类用于按传入的模式参数创建指定格式的日期时间字符串。

构造方法：`SimpleDateFormat(String pattern)` 按模式参数（一个包含特定匹配符字符串）生成时间戳

成员方法：

* `format(Date date): String` 转换 `Date` 时间戳参数为当前模式串
* `parse(String source): Date` 转换模式参数为 `Date` 时间戳

抛出异常：

* `PraseException` 模式异常，模式参数与当前模式不一

## `SimpleDateFormat` 的模式匹配符

- 常用格式：`yyyy-MM-dd HH:mm:ss`

| 匹配符 | 日期或时间元素           | 表示                | 示例                                  |
| ------ | ------------------------ | ------------------- | ------------------------------------- |
| `G`    | Era 标志符               | `Text`              | AD                                    |
| `y`    | 年份                     | `Year`              | 1996; 96                              |
| `M`    | 月份                     | `Month`             | July; Jul; 07                         |
| `w`    | 年几周                   | `Number`            | 27                                    |
| `W`    | 月几周                   | `Number`            | 2                                     |
| `D`    | 年几天                   | `Number`            | 189                                   |
| `d`    | 月几天                   | `Number`            | 10                                    |
| `F`    | 月几周                   | `Number`            | 2                                     |
| `E`    | 星期几                   | `Text`              | Tuesday; Tue                          |
| `a`    | AM / PM                  | `Text`              | PM                                    |
| `H`    | 天几时 (0~23)            | `Number`            | 0                                     |
| `k`    | 天几时 (24 小时制, 1~24) | `Number`            | 24                                    |
| `K`    | 天几时 (12 小时制, 0~11) | `Number`            | 0                                     |
| `h`    | 天几时 (12 小时, 1~12)   | `Number`            | 12                                    |
| `m`    | 时几分                   | `Number`            | 30                                    |
| `s`    | 分几秒                   | `Number`            | 55                                    |
| `S`    | 毫秒                     | `Number`            | 978                                   |
| `z`    | 时区                     | `General time zone` | Pacific Standard Time; PST; GMT-08:00 |
| `Z`    | 时区                     | `RFC 22 time zone`  | -0800                                 |
