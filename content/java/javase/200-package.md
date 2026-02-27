---
weight: 200
slug: java-package
title: Java 包
---

为了更好地组织类，Java 提供了包机制，用于区别类名的命名空间。

- 包的声明：`package pkg1[.pkg2[.pkg3...]];`
- 一般用公司域名的倒置作为包名，如 `com.bilibili.somepkg`。
- 为了能够使用某一个包的成员，需要在 `.java` 文件开头明确导入该包。
- `import` 语句导入包 = 引入名称空间中的类：`import pkg1[.pkg2...].(classname|*);`
  - `*` 是通配符，匹配该级目录下面所有的类文件。
- `import` 要在 `package` 下面。

---

- `package some.package;` 相当于 C# 中的 `namespace Some.Namespace{}`。
- `import some.package;` 相当于 C# 中的 `using Some.Namespace;`。
- Java 一名称空间一文件 (且强制一公共类一文件)，只需在文件顶部写上包名，不需要大括号划定界限。
