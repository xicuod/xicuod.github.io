---
weight: 40
slug: java-mybatis-quickstart
title: MyBatis 快速入门
---

[MyBatis](https://mybatis.org/mybatis-3/zh/index.html) 是一款优秀的持久层 (Dao 层, 数据访问层) 框架，用于简化 JDBC 的开发。MyBatis 本是 Apache 的一个开源项目 iBatis，2010 年这个项目由 Apache 迁移到了 Google Code，并且改名为 MyBatis。2013 年 11 月迁移到 GitHub。

## 在 Spring Boot 项目中使用 MyBatis

1. 创建 springboot 工程、数据库表 `tb_user`、实体类 `User`；
2. 引入 Mybatis 的相关依赖 (创建 spring 工程时勾选 `MyBatis Framework` 和 `MySQL Driver` 依赖)，在 `application.properties` 配置数据库连接配置四要素：

```properties
#数据源驱动类名
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#数据库的url
spring.datasource.url=jdbc:mysql://localhost:3306/ur-db-name
#连接数据库的用户名
spring.datasource.username=ur-uname
#连接数据库的密码
spring.datasource.password=ur-passwd
```

1. 写sql (注解、XML写法)：MyBatis的Mapper层就是DAO层，用 `@Mapper` 注解替代 `@Repository`。`@Mapper` 注解的接口，在运行时会自动生成实现类对象 (动态代理)，并且将该对象交给 IOC 容器管理。

实体类的字段类型和字段名要和数据库表中的字段相对应：

- 类型对应关系：`Integer` 对应 `int`，`Short` 对应 `tinyint`，`String` 对应 `varchar`，`LocalDate` 对应 `date`，`LocalDateTime` 对应 `datetime`
- 名称对应关系：可以用不同的命名风格，只要内容一样就行，如 `lastModified` 对应 `last_modified`

## MyBatis 数据库连接池

数据库连接池是个容器，负责分配、管理数据库连接 (Connection)。它允许应用程序重复使用一个现有的数据库连接，而不是再重新建立一个。它会自动释放 (从持有线程中收回) 空闲时间超过最大空闲时间的连接，来避免因为没有释放连接而引起的连接遗漏 (有人分配不到连接)。

- 数据库连接池的优势：资源重用、提升系统响应速度、避免数据库连接遗漏

### Druid 数据库连接池的实现

`DataSource` 接口是 Sun 官方提供的数据库连接池接口，由第三方组织实现此接口。

`DataSource` 方法：

- `Connection getConnection() throws SQLException` 获取连接

常见的数据库连接池实现框架：C3P0、DBCP、Druid、Hikari (Spring Boot 默认)

- [Druid](https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter) (德鲁伊)：Druid 连接池是阿里巴巴开源的数据库连接池项目，功能强大，性能优秀，是 Java 最好的数据库连接池之一。

在 Spring Boot 项目中切换到 Druid 连接池：

- `pom.xml` 引入依赖：

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-3-starter</artifactId>
	<version>1.2.27</version>
</dependency>
```

- Spring Boot 项目会自动切换到引入的 Druid 连接池

- 或者在 `application.properties` 中显式指定 `datasource.druid` (可选)：

```properties
spring.datasource.druid.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.druid.url=jdbc:mysql://localhost:3306/mybatis
spring.datasource.druid.username=root
spring.datasource.druid.password=1234
```

## MyBatis 预编译 SQL

可以在 `application.properties` 中配置启用 mybatis 的日志，让它输出到控制台。

```properties
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

```
==>  Preparing: delete from book where id = ?
==> Parameters: 17(Integer)
<==    Updates: 1
```

像 `delete from book where id = ?` 这样的 SQL 语句称为预编译 SQL；预编译 SQL 的好处：性能更高 (可使用 MySQL 缓存，不必重复编译)、更安全 (防止 SQL 注入)；SQL 注入：通过操作输入的数据来修改事先定义好的 SQL 语句，以达到执行代码攻击服务器的方法。

![MyBatis 预编译 SQL 性能更高](https://img.xicuodev.top/2026/03/e4d0fb6e25c4c2111acad3cebddde223.png "MyBatis 预编译 SQL 性能更高")

## MyBatis `#` `$` 参数占位符

`#` `$` 参数占位符在注解和xml中都能用，它们的行为和用法是：

- `#{...}` 井号占位符：执行 SQL 时，会将 `#{...}` 替换为 `?`，生成**预编译 SQL**，自动引用参数值，且加**单引号**防止意外注入。数据库先接收到预编译的 **SQL 骨架**，然后再由驱动程序将参数值传递过去。使用时机：**逻辑固定，参数可变**。
  - 如果方法形参只是一个普通参数，占位符里面可以随便写，但要保证可读性最好与形参名一致，如`#{id}`、`${value}`；
  - 如果方法形参是一个实体如 `Person`，占位符里面要直接写实体的字段名，如`#{name}`、`#{age}`。
- `${...}` 美元占位符：直接将参数拼接在 SQL 语句中发给数据库，存在 SQL 注入问题。使用时机：**逻辑不固定**。

> [!note] 数据库如何处理预编译 SQL？为什么井号占位符不能处理表名和列名？
>
> 预编译 SQL 中不能把表名或列名作为参数设为 `?`。数据库不允许将“表名”或“列名”作为一个变量来处理，因为它们决定了 SQL 的逻辑结构，而不是数据内容。数据库需要通过预编译 SQL 的逻辑结构来制定“**执行计划**”（execution plan），完成预编译。数据库需要通过表名和列名来查索引、算成本、做优化，因此它们不能在数据库层面参数化。因此，如果试图用井号占位符将表名或列名参数化，那么数据库是不认的。
> 
> 另外，井号占位符基于 JDBC Type，会自动给字符串参数加单引号，而表名和列名是不能加单引号的，否则它们就变成了字符串常量，失去了结构含义。因此，即便允许参数化表名和列名，井号占位符也是不适用的。

## MyBatis CRUD

因为是在与数据库交互，所以应该在 Mapper 的实现类中写 CRUD 逻辑。

### C 插入行

```java
@Option(keyProperty = "id", useGeneratedKeys = true)
@Insert("insert into book (title, author, published_date, last_modified) values (#{title}, #{author}, #{publishedDate}, #{lastModified})")
int insert(Book book);
```

- 在数据添加成功后，需要获取插入数据库数据的主键。如添加套餐数据时，还需要维护套餐-菜品的关系表数据。
- 在接口方法上加上 `@Option(useGeneratedKeys = true, keyProperty = "字段名")` 来获取生成的主键，`useGeneratedKeys` 使用生成的键，`keyProperty` 封装到实体对象的字段名。

### R 查询所有行

```java
@Select("select * from book")
List<Book> getList();
```

### R 根据主键查询特定行

```java
@Select("select * from book where id = #{id}")
Book getById(int id);
```

- 数据封装：如果实体类属性名和数据库表查询返回的字段名一致，mybatis 会自动封装。如果实体类属性名和数据库表查询返回的字段名不一致，不能自动封装。
- 关于命名风格：MyBatis 从 Java 程序到数据库可以识别并匹配不同命名风格的属性和字段，但反过来默认不行。
- 解决数据封装问题：
  - 方案 1：给字段起别名，让别名与实体类属性一致

    ```java
    @Select("select id,title,author,published_date publishedDate,last_modified lastModified from book where id = #{id}")
    Book getById(int id);
    ```

  - 方案 2：通过 `@Results` 和 `@Result` 注解手动映射封装，`@Results` 的唯一属性是 `@Result` 的数组，`@Result(column="字段",property="属性")` 设置字段到属性的映射

    ```java
    @Results({
      @Result(column = "published_date", property = "publishedDate"),
      @Result(column = "last_modified", property = "lastModified")
    })
    Book getById(int id);
    ```

  - 方案 3：`application.properties` 开启 mybatis 的驼峰命名自动映射开关，默认是关闭的

    ```properties
    mybatis.configuration.map-underscore-to-camel-case=true
    ```

### R 根据条件查询特定行

```java
@Select("select * from book where title like concat('%',#{title},'%') and author like concat('%',#{author},'%') and published_date between #{beginDate} and #{endDate} order by last_modified desc")
List<Book> get(String title, String author, LocalDate beginDate, LocalDate endDate);
```

- `title` 和 `author` 如果用井号占位符`'%#{title}%'`，预编译 SQL 的`?` 会在单引号内`'%?%'`，不起作用。而美元占位符虽然可以解决这个问题，但又有性能低、不安全、存在 SQL 注入等问题，不推荐用。推荐的解决方案：使用 MySQL 的 concat 字符串拼接函数，`concat('%',#{title},'%')`。
- 在 Spring Boot 1.x 版本或单独使用 mybatis 时：每个形参前需要加 `@Param("参数名")` 注解来保证参数映射有效。因为这两种情况下，一旦把 Java 源代码编译成字节码文件，编译器优化就会把原本的形参名全部替换成类似 `var1`、`var2` 的名字，这会让 MyBatis 基于反射的参数映射失效。Spring Boot 高版本引入了编译器插件，避免了这种情况。

### U 更新行

```java
@Update("update book set title=#{title},author=#{author},published_date=#{publishedDate},last_modified=#{lastModified} where id = #{id};")
int update(Book modifiedBook);
```

### D 删除行

删除并返回此次删除操作影响的行数：

```java
@Delete("delete from book where id = #{id}")
int delete(Integer id);
```

## MyBatis XML 映射文件

使用注解来映射简单语句会使代码显得更加简洁，但对于稍微复杂一点的语句，Java 注解不仅力不从心，还会让你本就复杂的 SQL 语句更加混乱不堪。因此，如果你需要做一些很复杂的操作，最好[用 XML 来映射 SQL 语句](https://mybatis.net.cn/sqlmap-xml.html)。

选择何种方式来配置映射，以及认为是否应该要统一映射语句定义的形式，完全取决于你和你的团队。换句话说，永远不要拘泥于于一种方式，你可以很轻松的在基于注解和 XML 的语句映射方式间自由移植和切换。

XML 映射文件规范：

- 一般一个 Mapper 接口对应一个 XML 映射文件。
- XML 映射文件的名称与 Mapper 接口名称一致，并且将 XML 映射文件和 Mapper 接口放置在相同包下 (同包同名)。
  - 如 `java/com.pkg.mapper/SomeMapper.java` 和 `resource/com/pkg/mapper/SomeMapper.xml`
  - resource 目录不是代码路径，IDEA 不能直接创建包，应该用 `/` 分隔来创建多级目录
- XML 映射文件的 mapper 元素的 namespace 属性为 Mapper 接口全限定名一致。
- XML 映射文件中 SQL 语句元素的 id 属性与 Mapper 接口中的方法名一致。
- XML 映射文件中 SQL 语句元素的 resultType 属性是单条记录要封装的类型的全限定名，而不是数组集合类型。

![MyBatis XML 映射文件规范](https://img.xicuodev.top/2026/03/130e9a1ea5ed9b7fae9738bee18ce012.png "MyBatis XML 映射文件规范")

可以在 [MyBatis 中文网](https://mybatis.net.cn/getting-started.html)找到 XML 映射文件的 DTD 约束的导入代码：

```xml
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
```

- IntelliJ IDEA MyBatisX 插件：MyBatisX 是一款基于 IntelliJ IDEA 的快速开发 Mybatis 的插件，为效率而生，与 xml 映射文件配合融洽。

## MyBatis 动态 SQL

MyBatis 支持随着用户的输入或外部条件的变化而变化的 SQL 语句，称为[动态 SQL](https://mybatis.net.cn/dynamic-sql.html)。XML 映射文件中的 `<if>`、`<where>`、`<foreach>`、`<sql>` 和 `<include>` 元素用于动态 SQL。

- `<if>`：用于判断条件是否成立。使用 `test` 属性条件判断，如果条件为 `true`，则拼接 SQL。
- `<where>`：用于表示 `SELECT` 的 `WHERE` 子句，只会在子元素有内容的情况下才插入 `where` 子句，而且会自动去除子句的开头多余的 `AND` 或 `OR`。
- `<set>`：用于表示 `UPDATE` 的 `SET` 子句，动态地在行首插入 `SET` 关键字，并去除子句中多余的逗号。
- `<foreach>`：遍历生成 SQL 片段，一般用于 `in` 等子句后面，属性如下：
  - `collection`：遍历的集合
  - `item`：遍历出来的元素
  - `separator`：分隔符
  - `open`：遍历开始前拼接的 SQL 片段
  - `close`：遍历结束后拼接的 SQL 片段
  - `foreach` 元素中的文本一般写 `item` 属性值的占位符，如`#{id}`
- `<sql>`：把 SQL 片段封装为可复用的功能单元
- `<include>`：引用 `<sql>` 封装的 SQL 片段，自闭合标签，`<include refid="ref-sql-id"/>`，`refid` 属性是 reference id，引用的 `<sql>` 元素的 `id`
