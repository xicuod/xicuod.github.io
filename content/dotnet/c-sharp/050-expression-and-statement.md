---
weight: 50
slug: c-sharp-expression-and-statement
title: C# 表达式与语句
---

## 表达式 Expression

C#表达式是一个或多个操作数和零个或多个操作符组成的序列，可以得出一个值、对象、方法或名称空间。表达式可以包含字面值、方法调用、操作符与操作数或简单的标识符。简单的标识符可以是变量、类型成员、方法形参、名称空间或类型的标识符。

按返回的语法实体，表达式可分为：

* 值表达式
* 变量表达式
* 名称空间表达式
* 类型表达式
* 方法组表达式（返回一个方法的所有重载）
* 空字面值表达式（`null`，值表达式）
* 匿名函数表达式（lambda表达式）
    ```CSharp
    Action a = delegate(){ Console.WriteLine("Hi!"); };
    ```
* 属性访问表达式
* 事件访问表达式
* 索引访问表达式
* 无返回值表达式（调用返回值为 void 的方法）

表达式后加个分号就是**表达式语句**。

## 语句 Statement

语句陈述算法思想，控制（control）逻辑走向，执行（execute）有意义的动作（action）。

* 语句以分号结尾，但指令（如using）和声明也以分号结尾。
* 语句只在方法体中。

C#语句有：

* 标签语句 labeled：标识符后加冒号，作为后面语句的标签。用 goto 加标签加分号可以直接跳转到这条语句，然后继续往下执行。
	* switch 语句中的 case 和 default 标签语句也是 goto 可跳转的语句。如 `goto case 1;` 或 `goto default;`。
* 声明语句 declaration
* 嵌入式语句 embedded：可以嵌在其他语句中。
	* 块语句=块 block：块 {} 中可容纳多条语句，位于同一语句上下文。编译器在块外认为块 {} 是一条语句。块完整，后面不用加分号。
		* 只有在方法体中的 {} 是块。
		* 变量的作用域：块内声明块内用，块外声明随便用。本质是只能在声明所在上下文或子级上下文中用。
	* 空语句 empty
	* **表达式语句** expression：表达式后加分号。
	* 选择语句=判断语句=分支语句 selection
	* 迭代语句=循环语句 iteration
	* 跳转语句 jump
	* try...catch...finally 语句：try-catch-finally 先尝试执行 try 块，如果遇到异常就执行 catch 块，最后执行 finally 块。
		* 一个 try 能跟多个 catch，但只能跟一个 finally。
		* `catch(Exception)` 专门捕捉特定类型的异常。
		* `catch(Exception ex)` 将捕捉到的异常给到 ex。
		* `catch(Exception){throw;}` 把异常抛给主调方法，让它处理。
		* finally 块中一般写释放资源或生成日志的语句。
	* checked/unchecked 语句
	* lock 语句：多线程
	* using 语句
	* yield 语句
