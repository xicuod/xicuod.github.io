---
title: C# 数组
slug: c-sharp-array
---

- 初始化：可以用 `[ 元素个数 ]` 或 `{ 元素列表 }` 两种**初始化器**来初始化数组。它们可以分别使用，也可以同时使用，但同时使用时必须相互匹配。

```cs
int[] myIntArr1 = new int[10];
int[] myIntArr2 = new int[]{ 1, 2, 3, 4, 5 };
int[] myIntArr3 = new int[5]{ 1, 2, 3, 4, 5 };
```
