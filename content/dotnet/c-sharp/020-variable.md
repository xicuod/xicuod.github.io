---
weight: 20
slug: c-sharp-variable
title: C# 变量
---

## 变量的初始化

变量的首次赋值称为变量的初始化。变量的初始化有特殊意义，使它区别于之后的每一次赋值。与变量初始化有关的修饰符：

- `readonly` 只读修饰符：只能初始化，不能继续赋值。
- `static` 静态修饰符：程序运行期间只初始化一次。

## `var` 关键字

`var` 把变量类型交给编译器自动推断，使你不必在声明变量时在类型上多费工夫，还可以缩短代码。如从 `Action<int, int, int> act = new Action<int, int, int>(Add);` 到 `var act = new Action<int, int, int>(Add);`。
