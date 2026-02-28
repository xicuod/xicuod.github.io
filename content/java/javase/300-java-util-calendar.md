---
weight: 300
slug: java-util-calendar
title: java.util.Calendar (Java 7)
---

`Calendar` 类增强和扩展了 `Date` 类的方法，取代了 `Date` 类。

`Calendar` 方法：

- `static Calendar getInstance()` 返回一个向上转型 ([多态]({{% sref "java-polymorphism" %}})) 得到的 `Calendar` 对象，实现语言敏感性
- `int get(int field)` 传入指定[字段索引](#calendar-成员常量)，返回指定字段值
- `void set(int field, int value)` 将指定字段设为指定值
- `void set(int year, int month, int date)` 设定相应字段为指定年月日
- `abstract void add(int field, int amount)` 按照日历规则，变动指定字段以指定的量
- `Date getTime()` 返回一个表示当前 `Calendar` 时间值 (从历元到现在的毫秒偏移量) 的 `Date` 对象

## `Calendar` 成员常量

`Calendar` 常量：`static final int`

| 常量名                  | 值   | 含义           |
| ----------------------- | ---- | -------------- |
| `YEAR`                  | `1`  | 年             |
| `MONTH`                 | `2`  | 月 (0\~12)     |
| `DAY_OF_MONTH` / `DATE` | `5`  | 月几天／几号   |
| `HOUR`                  | `10` | 时 (12 小时制) |
| `HOUR_OF_DAY`           | `11` | 时 (24 小时制) |
| `MINUTE`                | `12` | 分             |
| `SECOND`                | `13` | 秒             |

- 给成员方法传参时，传入 `Calendar.常量名`即可。
- **类常量索引**跟枚举的索引有异曲同工之妙。
