---
weight: 20
slug: java-mybatis-plus-quickstart
title: MyBatis-Plus 快速入门
---

[MyBatis 快速入门]({{% sref "java-mybatis-quickstart" %}})

[MyBatis-Plus](https://baomidou.com/introduce/) 是 MyBatis 的“最佳搭档”，只做增强不做改变，为简化开发、提高效率而生。效率高，快速实现对单表 crud；代码生成、自动分页、逻辑删除、自动填充；

引入起步依赖：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.2</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

在 application 配置中配置数据源：

```yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mybatis_plus_demo?useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

写mapper，继承`basemapper<entity>`：`usermapper extends basemapper<user>`，即可获得crud方法：

- 增：insert；
- 删：deleteById deleteByMap delete deleteBatchIds；
- 查：selectById selectBatchIds selectOne selectCount selectList selectPage；
- 改：updateById update；

这些都是单表操作，mp不好弄多表关联查询，还是要手写mapper sql的xml；

## mp实现orm原理

- `basemapper<entity>`扫描entity实体类，反射获取实体类信息作为数据库表信息；
- 约定大于配置：类名驼峰转下划线作为表名；名为id的字段作为主键；字段名驼峰转下划线作为列名；
- 常见注解自定义配置：@TableName表名 @TableId主键 @TableField一般字段；
  - @TableId(value="id", type=IdType.AUTO) type：AUTO 数据库自增长；INPUT 自己写setter；ASSIGN_ID 分配id，基于接口IdentifierGenerator.nextId() 默认实现类 DefaultIdentifierGenerator雪花算法；
  - @TableField字段名与列名不一致；is开头的布尔字段 is会省略 不想省略就写@TableField；不参与映射到列的字段 写@TableField(exist = false)；列名加 \`反引号\` 防止sql注入；

案例 用户实体类：

```java
@Data
@TableName("user")  // 指定数据库表名
public class User {
    // @TableId(type = IdType.AUTO)  // 主键自增，约定的默认值，可不写
    private Long id;
    private String name;
    private Integer age;
    private String email;
    
    @TableField(fill = FieldFill.INSERT)  // 插入时自动填充
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时自动填充
    private Date updateTime;
    
    @TableLogic  // 逻辑删除用
    private Integer deleted;
}
```

## mp在application中的配置

mp继承mybatis所有配置，外加一些特有配置：

```yml
mybatis-plus:
    type-aliases-package: com.itheima.mp.domain.po # 别名扫描包
    mapper-locations: "classpath*:/mapper/**/*.xml" # mapper.xml文件地址，默认值
    configuration:
        map-underscore-to-camel-case: true # 是否开启下划线和驼峰的映射
        cache-enabled: false # 是否开启二级缓存
    global-config:
        db-config:
            id-type: assign_id # id雪花算法生成
            update-strategy: not_null # 更新策略：只更新非空字段
```

## `Wrapper` 条件构造器

mp 提供了 `Wrapper` 类作为条件构造器，可以动态组装查询条件。`QueryWrapper` 用于查询，特有方法 `select()`，`UpdateWrapper` 用于更新，特有方法 `set()` `setSql()`。lambda版本 `LambdaQueryWrapper` `LambdaUpdateWrapper` 用getter的方法引用解耦字段名。

用 `QueryWrapper` 构造复杂查询条件：

```java
wrapper.like("name", "张")     /* where name like '%张%' */
       .between("age", 20, 30) /* and age between 20 and 30 */
       .orderByDesc("age");    /* and order by age desc */
List<User> users = userMapper.selectList(wrapper);
```

用 `LambdaQueryWrapper` 解耦字段名：

```java
lambdaWrapper.like(User::getName, "张")
             .between(User::getAge, 20, 30)
             .orderByDesc(User::getAge);
List<User> users = userMapper.selectList(lambdaWrapper);
```

`select()` 只查询部分字段：

```java
wrapper.select("id", "name", "age");
```

`eq()` 查询年龄等于 24 的用户：

```java
wrapper.eq("age", 24);
```

## `Page` 分页查询

MyBatis-Plus 的分页插件会自动拦截 SQL，并生成 count 查询和分页语句，返回的 Page 对象包含了丰富的分页信息。

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        /* 添加分页拦截器，并指定数据库类型 */
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

```java
Page<User> page = new Page<>(1, 3); /* 当前页=1，每页大小=3 */
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>().ge(User::getAge, 24); /* 年龄大于等于 24 */
Page<User> userPage = userMapper.selectPage(page, wrapper);
List<User> usersInPage = userPage.getRecords(); /* 当前页记录 */
long total = userPage.getTotal(); /* 总记录数 */
long pages = userPage.getPages(); /* 总页数 */
```

## `logic-delete` 逻辑删除

mp配置启用逻辑删除：在实体字段上使用 `@TableLogic` 注解映射用于实现逻辑删除的字段；

```yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  # 全局逻辑删除字段名
      logic-delete-value: 1        # 逻辑已删除值
      logic-not-delete-value: 0    # 逻辑未删除值
```

配置完成后，`deleteById` 等删除方法就会执行逻辑删除，把 `deleted` 或指定的字段设置为 `1` 或指定的值，而不是真的删除。查询时，结果集中不会包含逻辑删除的记录，MP 会自动在 SQL 上拼接 `deleted=0` 的条件。若需要查询包含逻辑删除的数据，可以使用 `selectList` 并传入特殊条件。

### `MetaObjectHandler` 自动填充

实体中的 createTime、updateTime 字段需要在插入或更新时自动赋值，避免手动设置。通过实现 `MetaObjectHandler` 接口并重写 `insertFill` 和 `updateFill` 方法，来自定义自动填充字段的行为：

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        // 插入时自动填充 createTime 和 updateTime
        this.strictInsertFill(metaObject, "createTime", Date.class, new Date());
        this.strictInsertFill(metaObject, "updateTime", Date.class, new Date());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新时自动填充 updateTime
        this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
    }
}
```

在 User 实体中通过 `@TableField(fill = FieldFill.INSERT)` 和 `@TableField(fill = FieldFill.INSERT_UPDATE)` 等配置在何时自动填充。之后，在指定的时机就会触发 `insertFill` 或 `updateFill` 方法。
