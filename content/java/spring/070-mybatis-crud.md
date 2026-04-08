---
weight: 70
slug: mybatis-crud
title: MyBatis CRUD
---

因为是在与数据库交互，所以应该在 Mapper 的实现类中写 CRUD 逻辑。

## 日志和预编译 SQL

可以在 `application.properties` 中打开 mybatis 的日志，并指定输出到控制台。

```properties
#指定mybatis输出日志的位置，输出控制台
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

```
==>  Preparing: delete from book where id = ?
==> Parameters: 17(Integer)
<==    Updates: 1
```

其中 `Preparing` 和 `Parameters` 组成的 SQL 语句称为预编译 SQL。

- 预编译 SQL 的好处：性能更高 (可使用 MySQL 缓存，不必重复编译)、更安全 (防止 SQL 注入)

![MyBatis 预编译 SQL 性能更高](https://img.xicuodev.top/2026/03/e4d0fb6e25c4c2111acad3cebddde223.png "MyBatis 预编译 SQL 性能更高")

- SQL 注入：通过操作输入的数据来修改事先定义好的 SQL 语句，以达到执行代码攻击服务器的方法。

## 注解的参数占位符：`#{...}` 和 `${...}`

- `#{...}` 井号占位符：执行 SQL 时，会将`#{...}` 替换为 `?`，生成预编译 SQL，并自动引用参数值。使用时机：参数传递时。
- `${...}` 美元占位符：拼接 SQL，直接将参数拼接在 SQL 语句中，存在 SQL 注入问题。使用时机：对表名、列表动态设置时。
- 如果方法形参只有一个普通类型的参数，占位符里面的属性名可以随便写，如`#{id}`、`${value}`；如果方法形参是一个实体参数，占位符里面的属性名要直接写实体参数的字段名，如`#{name}`、`#{age}`。

## MyBatis CRUD

### 增加行

```java
@Option(keyProperty = "id", useGeneratedKeys = true)
@Insert("insert into book (title, author, published_date, last_modified) values (#{title}, #{author}, #{publishedDate}, #{lastModified})")
int insert(Book book);
```

- 在数据添加成功后，需要获取插入数据库数据的主键。如添加套餐数据时，还需要维护套餐-菜品的关系表数据。
- 在接口方法上加上 `@Option(useGeneratedKeys = true, keyProperty = "字段名")` 来获取生成的主键，`useGeneratedKeys` 使用生成的键，`keyProperty` 封装到实体对象的字段名。

### 查询所有行

```java
@Select("select * from book")
List<Book> getList();
```

### 根据主键查询特定行

```java
@Select("select * from book where id = #{id}")
Book getById(int id);
```

- 数据封装：

  - 实体类属性名和数据库表查询返回的字段名一致，mybatis 会自动封装。

  - 如果实体类属性名和数据库表查询返回的字段名不一致，不能自动封装。(从 Java 程序到数据库可以识别并匹配不同命名风格的属性和字段，但反过来默认情况下不行)

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

### 根据条件查询特定行

```java
@Select("select * from book where title like concat('%',#{title},'%') and author like concat('%',#{author},'%') and published_date between #{beginDate} and #{endDate} order by last_modified desc")
List<Book> get(String title, String author, LocalDate beginDate, LocalDate endDate);
```

- `title` 和 `author` 如果用井号占位符`'%#{title}%'`，预编译 SQL 的`?` 会在单引号内`'%?%'`，不起作用。而美元占位符虽然可以解决这个问题，但又有性能低、不安全、存在 SQL 注入等问题，不推荐用。推荐的解决方案：使用 MySQL 的 concat 字符串拼接函数，`concat('%',#{title},'%')`。
- 在 Spring Boot 1.x 版本或单独使用 mybatis 时：每个形参前需要加 `@Param("参数名")` 注解来保证参数映射有效。因为这两种情况下，一旦把 Java 源代码编译成字节码文件，编译器优化就会把原本的形参名全部替换成类似 `var1`、`var2` 的名字，这会让 MyBatis 基于反射的参数映射失效。Spring Boot 高版本引入了编译器插件，避免了这种情况。

### 更新行

```java
@Update("update book set title=#{title},author=#{author},published_date=#{publishedDate},last_modified=#{lastModified} where id = #{id};")
int update(Book modifiedBook);
```

### 删除行

删除并返回此次删除操作影响的行数：

```java
@Delete("delete from book where id = #{id}")
int delete(Integer id);
```
