---
weight: 40
slug: c-sharp-operators
title: C# 操作符
---

![](https://img.xicuodev.top/2026/04/a0e83752aa3354e826492952e40e60c2.webp)

* 越往上的操作符越先运算，越往下越后运算。
* 除了赋值操作符是从右往左运算，其他操作符都是从左往右运算。

## 基本操作符

### 成员访问操作符 x.y

x.y 是访问 x 下的 y。成员访问操作符访问的对象可以是：

* 名称空间下的子名称空间
* 名称空间下的类
* 类下的静态成员
* 对象下的成员

### 调用操作符 f(x)

f(x) 是以实参 x 调用函数 f 或方法 f。

* C#调用函数或方法时必须使用调用操作符，即使实参为空也不可省略。
* C#委托时不使用调用操作符，因为此时不是要调用函数或方法。

### 元素访问操作符 `a[x]`

`a[x]` 是访问集合 a 中索引为 x 的元素。

* 索引 x 的类型：对于数组 a，索引 x 是偏移量，为整数型；对于字典 a，索引 x 是键，与键的类型相同。
	* 偏移量是从 0 开始到要访问的元素要数几个数。
	* 例如若字典的键的类型为字符串型，则元素访问操作符的索引也应为字符串型。

### 后置自增减操作符 x++ x--

先算其他，再算自增减。本质上是后置自增减操作符返回了操作数原本的值。

### 实例创建操作符 new

new T() 创建类 T 的一个新的对象，这会调用该类的实例构造器。

* 调用类 T 的初始化器：`new T() { prop1=val1, prop2=val2, ... };`。
* 创建并使用一次性对象：`new T(){ prop1=val1 }.Method();`。
* 创建匿名类对象：`var anonymous = new{ prop1=val1 };`。
* new 操作符会造成类与类之间的**紧耦合 Tight Coupling**，在类间建立起强依赖关系。要实现**松耦合 Loosely Coupled**，需要遵循**依赖注入 DI, Dependency Injection** 的设计模式。
* new 作为方法修饰符时，可使子类方法隐藏、屏蔽父类的同名方法。

### 类型元数据操作符 typeof(T)

typeof(T) 可以获取类型 T 的元数据，它返回一个 Type 类对象，其中包含该类型的所有信息。

### 类型缺省值操作符 default(T)

default(T) 可以获取类型 T 的缺省值。

* 值类型的缺省值为 0，引用类型的缺省值是 null。

### 溢出检查操作符 checked unchecked

* 类型 变量名 = checked(表达式); 检查表达式的值对于类型规定的内存空间来说是否溢出，如果有，则抛出 OverflowException 溢出异常。
* 类型 变量名 = unchecked(表达式); 不检查表达式的值是否溢出，C#默认采用 unchecked 模式。
* 在 checked 或 unchecked 后跟一个代码块（语句块），此时它们作上下文修饰符，检查或不检查语句块内所有的溢出异常。

### 委托操作符 delegate

delegate 可用于挂接匿名函数。

```CSharp
// 位置：WpfApp MainWindow 构造器
DispatcherTimer timer = new DispatcherTimer();
timer.Interval = TimeSpan.FromSeconds(1); // 设置定时器间隔为 1 秒
timer.Tick += delegate (object? sender, EventArgs e)
{
    textBoxNowTime.Text = DateTime.Now.ToString();
}
; // 挂接匿名函数
timer.Start(); // 启动定时器
```

然而，这种用法已经被 lambda 表达式（箭头函数，匿名函数）取代。

```CSharp
// 位置：WpfApp MainWindow 构造器
DispatcherTimer timer = new DispatcherTimer();
timer.Interval = TimeSpan.FromSeconds(1); // 设置定时器间隔为 1 秒
timer.Tick += (sender, e) =>
{
    textBoxNowTime.Text = DateTime.Now.ToString();
}
; // 挂接匿名函数
timer.Start(); // 启动定时器
```

### 尺寸获取操作符 sizeof

sizeof(类型、变量或字面量) 返回结构体类型的实例在内存中占用的字节数。如 int 占 4 字节，long、ulong、double 占 8 字节，decimal 占 16 字节。

* sizeof 只能处理基本的结构体类型。
* 在编译器允许不安全的代码时，unsafe 修饰的语句块中，sizeof 可以处理自定义结构体类型。

### 指针成员访问操作符 x->y

x->y 通过对象指针 x 访问对象的成员 y。

* -> 在编译器允许不安全的代码时，unsafe 修饰的语句块中才能使用。

## 一元操作符

### 取相反数操作符 `-x`

`-x` 取 x 的相反数。不可贸然取相反数，这可能导致溢出，因为有符号类型的最值不对称。

* 有符号类型的最大值与最小值是不对称的，即它们的绝对值差 1。
	* 这是因为补码表示法为避免负零问题，把 -0 拿去当作负数的最小值。

```CSharp
int a = int.MaxValue;
int b = int.MinValue;
Console.WriteLine(" a: " + Convert.ToString(a,2).PadLeft(32,'0') + "\t " + a);
Console.WriteLine(" b: " + Convert.ToString(b,2).PadLeft(32,'0') + "\t" + b);
Console.WriteLine("~b: " + Convert.ToString(~b,2).PadLeft(32,'0') + "\t " + ~b);
Console.WriteLine("-b: " + Convert.ToString(-b,2).PadLeft(32,'0') + "\t" + -b); // 溢出
```

```PlainText
 a: 01111111111111111111111111111111     2147483647
 b: 10000000000000000000000000000000    -2147483648
~b: 01111111111111111111111111111111     2147483647
-b: 10000000000000000000000000000000    -2147483648
```

### 按位取反操作符 `~x`

`~x` 使二进制的 x 的 1 变 0，0 变 1。

* `~x` 是 -x 的原理，计算机求相反数的原理就是按位取反再加 1。

### 取非操作符 `!x`

`!x` 返回 x 的相反布尔值。

```CSharp
Student s = new Student(""); // 实参异常：名称不应为空。

class Student
{
    public Student(string name)
    {
        if (!string.IsNullOrEmpty(name)) // 取非操作符
        {
            this.name = name;
        }
        else
        {
            throw new ArgumentException("实参异常：名称不应为空。");
        }
    }
    string name;
}
```

### 强制显式类型转换操作符 `(T)x`

`(T)x` 把 x 强制转换为 T 类型，也称显式类型转换操作符。见[CSharp类型转换](CSharp类型转换.md)。

若显式转换也不行，则说明确实转换不了，编译器会告诉你不能这样做（报错，抛异常）。为防止出现这种事，可以用更柔和、更安全的显式类型转换操作符 as，见[CSharp操作符](CSharp操作符.md)。

## 乘除余操作符 `x*y`  `x/y`  `x%y`

* 一些特定乘法运算得到的特殊值表 (NaN 是 Not a Number 非数字)
	![](https://img.xicuodev.top/2026/04/4b82f9092ce885919ca7869b6ff071db.png)

* 一些特定除法运算得到的特殊值表
	![](https://img.xicuodev.top/2026/04/aa10cffafe6a9d00569c40c86de9a6fd.png)

* 一些特定余数运算得到的特殊值表
	![](https://img.xicuodev.top/2026/04/1ca8f0f670b94a79451a8ea2ffbbee7c.png)

* 两个不同宽度的类型的数字相乘、相除或求余时，会发生**类型提升**，即小尺寸的数字类型会隐式转换为大尺寸的数字类型。

## <span style="color: #E0E1E4">加减操作符 x+y  x-y</span>

## 移位操作符 `x<<a`  `x>>a`

把二进制数的各位整体向左或向右移动 a 位，若有位数移出该数的内存空间，则抛出<u>溢出异常</u>。

* 对于负数，移位时最高位充当负号的 1 也跟着移动，同时最高位补进来的也是 1（保持负号）。

## 关系操作符 `x<y`  `x>y`  `x<=y`  `x>=y`

略。

## 类型检测操作符 x is y

is 是检测 x 是否为 y 类或为 y 类的子类，返回布尔值。

* x 为 null 时，is 返回 False。

## 安全显式类型转换操作符 `x as y`

as 是更安全的显式类型转换操作符。as 假设 x 是 y 类，是则把 x 转换为 y 类并返回，不是则返回 null。[CSharp类型转换](CSharp类型转换.md)

## 相等操作符 `x==y`  `x!=y`

## 位与、位异或、位或操作符 `x&y`  `x^y`  `x|y`

* 先与，再异或，后或。
* 按二进制位比较。操作二进制数据（如图片）时会用到。

## 条件与、条件或操作符 `x&&y`  `x||y`

* 先与后或。
* `&&` 和 || 有短路效应，&& 前面的表达式若已经有假，则不执行后面的表达式；|| 前面的表达式若已经有真，则不执行后面的表达式。
	* `1==2 && x++>y` 和 `1==1 || x++>y` 中 x 不会自增。
	* 短路效应是为了提高性能，不是为了奇技淫巧。写代码时要避开短路效应。

## Null 合并操作符 `x??y`

`x??y` 在 x 为 null 时返回 y，在 x 不为 null 时返回 x。

C#提供一个可空类型 `Nullable<T>`，其对象可以为 T 类型的值或 null 值。C#吸收可空类型为 ? 关键字，可用 T? 表示可空类型。

* `Nullable<T> x = null;` 可写为 `T? x = null;`。

## 条件操作符 `x?y:z`

`x?y:z` 在 x 为真时返回 y，在 x 为假时返回 z。

## 赋值操作符 `x=y`  `x*=y`  `x/=y`  `x%=y`  `x+=y`  `x-=y`  `x<<=y`  `x>>=y`  `x&=y`  `x^=y`  `x|=y`

* 赋值操作符的运算顺序从右向左。
* 赋值操作符本身返回左边的值。`x=y` 会将 y 的值赋给 x，同时返回赋值后的 x 的值。

## Lambda 表达式操作符 `(x)=>{y};`

Lambda 表达式=匿名函数，通常用于委托。

* `(x)` 是形参列表，一般不给类型，编译器可自动推断。
* `{y}` 是匿名函数体。

```CSharp
DispatcherTimer timer = new DispatcherTimer();
timer.Interval = TimeSpan.FromSeconds(1); // 设置定时器间隔为 1 秒
timer.Tick += (sender, e) => // 挂接匿名函数
{ textBoxNowTime.Text = DateTime.Now.ToString(); };
timer.Start(); // 启动定时器
```
