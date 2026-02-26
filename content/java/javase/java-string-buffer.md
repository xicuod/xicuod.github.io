---
weight: 150
slug: java-string-buffer
title: Java StringBuffer 类
---
**`StringBuffer` 类**维护一个可变长的字符串，它是线程安全的，适合多线程场景，是 [`StringBuilder`]({{< ref "java-string-builder.md" >}}) 的[同步]()版本。

- `StringBuffer` 适合多线程、数据量较大的场景，效率低但安全。
- `StringBuffer` 的方法跟 `StringBuilder` 的基本相同，不同的是它们都是同步方法。
