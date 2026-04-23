---
weight: 
slug: c-sharp-partial-class
title: C# partial 类
---

`partial` 类把一个完整的类分为多个部分，每个部分可以按自己的步调维护和更新。

- `partial` 类可以减少派生类。
- `partial` 类与 Entity Framework (访问数据库，这是 SQL Server 的知识)
  - EF 会自动生成 C# 代码，以便你访问数据库，但它会覆盖旧版本的代码，途中你对这份代码的更新无法保留。因此需要用 `partial` 类把代码分为两部分，一部分由 EF 维护和更新，一部分由你维护和更新。
- `partial` 类与 Windows Forms、WPF 和 ASP.NET Core
  - WinForms：窗体的设计部分 `Form1.Designer.cs` + 窗体的逻辑部分 `Form1.cs`(`partial class Form1`)
  - WPF：窗体的设计部分 `MainWindow.xaml` + 窗体的逻辑部分 `MainWindow.xaml.cs`(`public partial class MainWindow`)
  - ASP.NET Core：页面的前台部分 `Index.cshtml` + 页面的后台部分
