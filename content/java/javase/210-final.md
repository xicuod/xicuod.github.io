---
weight: 210
slug: java-final
title: Java final 关键字
---

`final` 意思是 “最终的、不可改变的”，用于修饰类、方法或变量。

- `final` 的正交实体：常量类、常量方法、常量变量
  - 常量类：这个类不能被继承，是继承链的末端
  - 常量方法：这个方法不能被子类重写
  - 常量变量：一旦被赋值，就不能再改变

常量变量的命名约定一般是大写字母加下划线，如 `SOME_FINAL_VALUE`。

- 修饰成员变量：使成员变量首次赋值后不能再修改。
  - 成员变量若用 `final` 关键字修饰，不会隐式初始化，必须显式赋初值。
  - 显式赋值分为两种：在声明时直接赋值；在所有构造方法中赋值。

例子：

```java
public class Final {
    final int num = 100;
    final String str;
    
    public Final() {
        str = "A_Pi";
    }
    
    public Final(String str) {
        this.str = str;
    } 
}
```
