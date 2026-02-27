---
title: C# var 关键字
slug: c-sharp-keyword-var
---

`var` 把变量类型交给编译器自动推断，使你不必在声明变量时多费工夫，还可以缩短代码。

- 从 `Action<int, int, int> act = new Action<int, int, int>(Add);`
- 到 `var act = new Action<int, int, int>(Add);`
