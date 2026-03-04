---
weight: 620
slug: java-junit
title: Java JUnit 单元测试
---

> [!tip] 这篇是黑马官方笔记的转载，但如果有标注块，则是笔者补充的。

## 1.1 什么是单元测试 (掌握)

单元测试就是针对最小的功能单元编写测试代码，Java 程序最小的功能单元是方法，因此单元测试就是针对 Java 方法的测试，进而检查方法的正确性。

原始的测试方式的弊端：

- 只有一个 main 方法，如果一个方法的测试失败了，其他方法测试会受到影响
- 需要程序员自己去观察测试是否成功

## 1.2 JUnit (掌握)

JUnit 是使用 Java 语言实现的单元测试框架，它是开源的，Java 开发者都应当学习并使用 JUnit 编写单元测试。

- JUnit 是一个第三方的工具，需要导入它的 jar 包，hamcrest-core 和 junit 包。把别人写的代码导入项目中，专业叫法是 “导 jar 包”。然而，几乎所有的 IDE 工具都集成了 JUnit，这样我们就可以直接在 IDE 中编写并运行 JUnit 测试。JUnit 目前最新版本是 5。
- JUnit 可以灵活的选择执行哪些测试方法，可以一键执行全部测试方法。
- 单元测试中的某个方法测试失败了，不会影响其他测试方法的测试。
- 运行成功是绿色，运行失败是红色。

## 1.3 基本用法 (掌握)

1. 一定要先写一个方法。该测试方法必须是公共的、无参的、无返回值的、非静态的方法
2. 在这个方法的上面写 @Test
3. 鼠标点一下 @Test  按 alt + 回车，点击 Junit4。此时就可以自动导包，如果自动导包失败 (连接外网，或者自己手动导包)​，如果导包成功在左下角就会出现 Junit4 的相关 jar 包。

### 手动导包 (掌握)

1. 在当前模块下，右键新建一个文件夹 (lib)
2. 把今天资料里面的两个 jar 包，拷贝到 lib 文件夹里面
3. 选中两个 jar 右键点击 add as a lib....
4. 到代码中，找到 @Test，按 alt + 回车，再来导入。

### 运行测试代码 (掌握)

- 只能直接运行无参无返回值的非静态方法
- 想要运行谁，就右键点击哪个方法。如果想要运行一个类里面所有的测试方法，选择类名，有点点击即可。

### Junit 正确的打开方式 (正确的使用方式)(掌握)

并不是直接在要测试的方法上面直接加 @Test，因为要测试的方法有可能是有参数的，有返回值，或者是静态的。正确的使用方式：

1. 新建测试类
2. 新建测试方法，要测试的方法名 + Test：methodTest
3. 在这个方法中直接调用要测试的方法
4. 在测试方法的上面写 @Test

```java
//真正用来测试的类
//测试用例(测试类)
public class JunitTest {

    //在这个类里面再写无参无返回值的非静态方法
    //在方法中调用想要测试的方法

    @Test
    public void method2Test(){
        //调用要测试的方法
        JunitDemo1 jd = new JunitDemo1();
        jd.method2(10);
    }
}
```

### JUnit4 常用注解

- @Test 测试方法
- @Before 用来修饰实例方法，该方法会在每一个测试方法执行之前执行一次
  - @Before 方法一般用于测试之前备份文件
- @After 用来修饰实例方法，该方法会在每一个测试方法执行之后执行一次
  - @After 方法一般用于测试之后恢复文件
- @BeforeClass 用来静态修饰方法，该方法会在所有测试方法之前只执行一次
- @AfterClass 用来静态修饰方法，该方法会在所有测试方法之后只执行一次
- 开始执行的方法：初始化资源。
- 执行完之后的方法：释放资源。

### Assert 类：断言

- 静态方法：`assertEquals(错误消息,预期值,实际值)` 如果实际和预期不符，报错并提示消息

### 实际开发中单元测试的使用方式 (掌握)

需求：测试 File 中的 delete 方法，写的是否正确

开发中的测试原则：不污染原数据。

```java
public class JunitDemo3 {
    //在实际开发中，真正完整的单元测试该怎么写？
    //前提：
    //以后在工作的时候，测试代码不能污染原数据。(修改，篡改)
    //1.利用Before去对数据做一个初始化的动作
    //2.利用Test真正的去测试方法
    //3.利用After去还原数据
    
    //需求：测试File类中的delete方法是否书写正确？？？
    @Before
    public void beforemethod() throws IOException {
        //先备份
        File src = new File("C:\\Users\\moon\\Desktop\\a.txt");
        File dest = new File("C:\\Users\\moon\\Desktop\\copy.txt");

        FileInputStream fis = new FileInputStream(src);
        FileOutputStream fos = new FileOutputStream(dest);
        int b;
        while((b = fis.read()) != -1){
            fos.write(b);
        }
        fos.close();
        fis.close();
    }

    //作为一个标准的测试人员，运行完单元测试之后，不能污染原数据
    //需要达到下面两个要求：
    //1.得到结果
    //2.a.txt还在而且其他的备份文件消失
    @Test
    public void method(){
        File file = new File("C:\\Users\\moon\\Desktop\\a.txt");
        boolean delete = file.delete();

        //检查a.txt是否存在
        boolean exists = file.exists();

        //只有同时满足了下面所有的断言，才表示delete方法编写正确
        Assert.assertEquals("delete方法出错了",delete,true);
        Assert.assertEquals("delete方法出错了",exists,false);
    }


    @After
    public void aftermethod() throws IOException {
        //还要对a.txt做一个还原
        File src = new File("C:\\Users\\moon\\Desktop\\copy.txt");
        File dest = new File("C:\\Users\\moon\\Desktop\\a.txt");

        FileInputStream fis = new FileInputStream(src);
        FileOutputStream fos = new FileOutputStream(dest);
        int b;
        while((b = fis.read()) != -1){
            fos.write(b);
        }
        fos.close();
        fis.close();

        //备份数据要删除
        src.delete();

    }
}
```

作业：测试 Properties 类中的 store 方法是否书写正确？

开发心得：

1. Before  准备数据
2. Test  测试方法
3. After 还原

---

Before

```
准备数据
1.创建Properties的对象
2.put数据到集合当中
//只不过在下面的方法中，我们也需要用到Properties的对象，所以写完之后要挪到成员位置
```

Test

```
调用store方法，保存数据到本地文件

断言1：
	判断当前文件是否存在
断言2：
	文件的大小一定是大于0
断言3：
	再次读取文件中的数据，判断是否跟集合中一致

结论：
	如果所有的断言都通过了，表示store方法是正确的
```

After

```
把本地文件给删除
```

### 扩展点：单元测试里的相对路径

在单元测试中，相对路径是相对当前模块而言的。

代码示例：

```java
File file = new File("aweihaoshuai.txt");
file.createNewFile();
//此时是把aweihaoshuai.txt这个文件新建到模块中了。
```
