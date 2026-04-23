---
weight: 15
slug: c-sharp-data-types
title: C# 数据类型
---

![](https://img.xicuodev.top/2026/04/3162e7090e7061071b652af2474f250d.png)

var与dynamic区别：

* var 是隐式类型，它根据初始值确定变量的实际类型。
	* C#是强类型语言，变量的类型确定之后就不能改了。
	* var 可以接受匿名类的变量，一般配合 new 操作符使用：`var anonymous = new { prop1=val1 };`。
* dynamic 是动态类型，变量的实际类型随每次赋的值的类型而改变，它是C#为模仿弱类型语言而引入的。

## 引用类型与值类型的内存分布

* 引用类型实例（对象）总在堆上，并在栈上存它的引用。
* 值类型的位置取决于它被声明的位置和使用方式。它可以在栈上，也可以在堆上。
	* 在栈上：局部变量
	* 在堆上：成员字段、装箱后、数组元素、被闭包捕获

## 值类型 Value Type

枚举与结构体组成了C#的值类型。

### 枚举 Enumeration

枚举的本质是人为限定取值范围的整数序列。

* 枚举的声明：`enum SomeEnum { A, B, ... }`
* 整数值的对应：默认从0开始，逐个加1。
	* 支持手动赋值，未手动赋值的，按逐个加1处理。
	* 支持设负数。
* 比特位式用法：8421，BCD码，数学把戏
	* 按二进制位错开的规律赋值。
		* 1、2、4和8，对应二进制的0001、0010、0100和1000。
	* 对于错开的二进制数，按位或具有取叠加的意义。
		* 2|4=6（0010|0100=0110）。
	* 对于二进制叠加值，按位与具有判断是否有的意义。
		* 若有则为与值，若无则为0。6&2=2，6&1=0。

### 结构体 Structure

结构体是值类型，是轻类型，直接包含数据，没有额外的指针开销，适合存放轻量级、生命周期短的数据和方法，如坐标、颜色、复数等。

* 可装拆箱
* 可实现接口
	![](https://img.xicuodev.top/2026/04/e8884e9ef938ba4fed54cdc5936c66f1.png)
* 不能继承
* 不能有显式无参构造器：`public FooStruct() {}` (x)
* 可以有显式有参构造器：`public BarStruct(args) {}` (o)

#### 基元类型

C#的基元类型底层都是结构体，如`int`本质就是`System.Int32`（结构体）。

数字类型 numeric-type：sbyte=byte(8) < short=ushort(16) < int=uint=float(32) < long=ulong=double(64) < decimal(128)

|            | 8 位整数 | 短整数 | 整数 | 单精度浮点数 | 长整数 | 双精度浮点数 | 小数    |
| ---------- | -------- | ------ | ---- | ------------ | ------ | ------------ | ------- |
| 有符号     | sbyte    | short  | int  | float        | long   | double       | decimal |
| 无符号     | byte     | ushort | uint | -            | ulong  | -            | -       |
| 长度 (bit) | 8        | 16     | 32   | 32           | 64     | 64           | 128     |

字符 char：`System.Char`，底层是16位Unicode码位数，可以直接隐式转换为ushort或更长的数字类型。

## 引用类型 Reference Type

### 类 Class

#### 对象类型 object

Object 类是所有类的基类，所有C#类（包括自定义类）都能追溯到 Object 类。

#### 字符串类型 string

* `Compare()` 静态方法：从左到右逐个字符比较它们的 Unicode 码，从而得出两个字符串的大小关系。

### 接口（与抽象类）

* 接口和抽象类都是“软件工程的产物”。
* 具体类→抽象类→接口：越来越抽象，内部实现的东西越来越少。

![](https://img.xicuodev.top/2026/04/08061421418bac6e9a25ce84916e9778.png)

#### 抽象类 Abstract Class

抽象类是未完全实现逻辑的类（可以有字段和非public成员，它们代表了“具体逻辑”）。与抽象类相对的是**具体类（concrete class）**。

* 用abstract修饰符声明抽象类或抽象成员。有抽象成员的类一定是抽象类，这点必须用abstract显式声明。
* 抽象类不能实例化，因为它有未实现的抽象成员。
* 抽象类为复用而生：专门作为基类变量来引用子类实例，也具有解耦功能。
* 抽象类体现了[开闭原则 OCP Open-Closed Principle](https://ris3team.feishu.cn/wiki/YfsfwZ15tidTxwkYBSFc7edHnog)。

抽象方法：

* 抽象方法又叫纯虚方法，因为它没有方法体，等着子类实现它的功能。
* 实现抽象方法时，也要加上 override 修饰符。

#### 接口 Interface

**接口**是完全未实现逻辑的“类”（“纯虚类”）。

* 接口只有函数成员，且全部强制为public和abstract，因此不必也不能写访问级别和抽象级别。
	* 相应地，实现类的成员也不必且不能写override。
* 接口为解耦而生：“高内聚，低耦合”，方便单元测试。
	* 代码中有可以替换的地方，这地方就是接口的活。
* 接口是一个“协约”，早已为工业生产所熟知（有分工必有协作，有协作必有协约）。
	* 供方 int[] 和 ArrayList 都实现了 IEnumerable 接口，需方方法只需接收 IEnumerable 类参数即可适配多个供方。接口变量引用具体类实例的特性在这里大放异彩。
* 接口和抽象类都不能实例化，只能用来声明变量、引用具体类的实例。
* C#接口的命名约定是开头为一个大写的 I 表示接口，后加具体名字。`ISomeInterface`
* 接口的产生：自底向上（重构）、自顶向下（设计）
* 接口的实现（隐式，显式，多接口）
	* 隐式实现：实现类内同名同签名
	* 显式实现：实现类内同名同签名，且方法名前加接口名（`ISomeInterface.SomeMethod`）
		* 显式性的体现：实现多接口时，可以区分不同接口的同名方法。
		* 封装性的体现：这个方法属于接口变量，实现类变量不许访问。
	* 实现多接口：一个类可以按需实现多个接口。
* 语言对面向对象设计的内建支持：[依赖倒置原则 DIP](https://ris3team.feishu.cn/wiki/BVhOwYgaTiAqQSkYVg3c8pArnud)，[接口隔离原则 ISP Interface Segregation Principle](https://ris3team.feishu.cn/wiki/TM8owa7IuiwFRvkROO4ciIlvnCc)，[开闭原则 OCP Open-Closed Principle](https://ris3team.feishu.cn/wiki/YfsfwZ15tidTxwkYBSFc7edHnog)……

### 委托 Delegate
