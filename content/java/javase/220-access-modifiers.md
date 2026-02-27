---
weight: 220
slug: java-access-modifiers
title: Java 访问修饰符
---

Java 有 4 种访问修饰符，按从宽到严分别为 `public` > `protected` > (default = package-private) > `private`。

| 访问对象                | `public` | `protected` | (default) | `private` |
| ----------------------- | -------- | ----------- | --------- | --------- |
| 同类 (我自己)           | **YES**  | **YES**     | **YES**   | **YES**   |
| 同包 (我邻居)           | **YES**  | **YES**     | **YES**   | _NO_      |
| 不同包的子类 (我儿子)   | **YES**  | **YES**     | _NO_      | _NO_      |
| 不同包的非子类 (陌生人) | **YES**  | _NO_        | _NO_      | _NO_      |

## 不同实体的权限修饰符可用性

| 实体       | `public` | `protected` | (default) | `private` |
| ---------- | -------- | ----------- | --------- | --------- |
| 外部类     | **YES**  | _NO_        | **YES**   | _NO_      |
| 成员内部类 | **YES**  | **YES**     | **YES**   | **YES**   |
| 局部内部类 | _NO_     | _NO_        | _NO_(\*)  | _NO_      |

\* 局部内部类无修饰符时，作用域是声明语句以下的函数作用域，无类型提升。
