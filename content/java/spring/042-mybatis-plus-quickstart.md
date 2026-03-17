---
weight: 43
slug: java-mybatis-plus-quickstart
title: MyBatisPlus 快速入门
---

[MyBatisPlus](https://baomidou.com/introduce/) 是 MyBatis 的“最佳搭档”，只做增强不做改变，为简化开发、提高效率而生。

## 引入 MyBatisPlus 依赖

创建一个 Spring Boot 项目（版本 2.x 或 3.x），在 pom.xml 中添加 MyBatisPlus 和数据库驱动依赖（以 MySQL 为例）：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.7</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

在 application.yml 中配置数据源：

```yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mybatis_plus_demo?useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```

## User 用户实体类

```java
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("user")  // 指定数据库表名
public class User {
    @TableId(type = IdType.AUTO)  // 主键自增
    private Long id;
    private String name;
    private Integer age;
    private String email;
    
    @TableField(fill = FieldFill.INSERT)  // 插入时自动填充
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时自动填充
    private Date updateTime;
    
    @TableLogic  // 逻辑删除
    private Integer deleted;
}
```

## UserMapper 接口

`BaseMapper` 提供了基础的 CRUD 方法，将你的 `Mapper` 继承它，并指定泛型为 `User` 实体类，即可通过你的 `Mapper` 对象直接调用这些方法。

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承 BaseMapper，即可获得通用的 CRUD 方法
}
```

## 几个快速入门 MyBatisPlus 的小案例

### `BaseMapper` 基础 CRUD

`insert` 插入用户：

```java
int rows = userMapper.insert(user);
System.out.println("影响行数：" + rows);
System.out.println("主键 ID：" + user.getId()); // 主键会自动回填
```

`deleteById` 根据 id 删除用户：

```java
int rows = userMapper.deleteById(1L);
System.out.println("删除行数：" + rows);
```

如果启用了逻辑删除，这里实际是更新 `deleted` 字段为 1。

`selectById` 根据 id 查询用户：

```java
User user = userMapper.selectById(1L);
System.out.println(user);
```

`selectList` 查询所有记录：

```java
List<User> users = userMapper.selectList(null);  // 参数为条件构造器（见下一小节），null 表示无条件
users.forEach(System.out::println);
```

`updateById` 根据 id 更新用户：

```java
User user = userMapper.selectById(1L);
user.setAge(25);
userMapper.updateById(user);
```

### `Wrapper` 条件构造器

MyBatisPlus 提供了 `Wrapper` 类作为条件构造器，可以动态组装查询条件。

使用 `QueryWrapper` 指定查询条件：

```java
wrapper.like("name", "张")     /* where name like '%张%' */
       .between("age", 20, 30) /* and age between 20 and 30 */
       .orderByDesc("age");    /* and order by age desc */
List<User> users = userMapper.selectList(wrapper);
```

使用 `LambdaQueryWrapper` 实现动态字段名：

```java
lambdaWrapper.like(User::getName, "张")
             .between(User::getAge, 20, 30)
             .orderByDesc(User::getAge);
List<User> users = userMapper.selectList(lambdaWrapper);
```

只查询部分字段：

```java
wrapper.select("id", "name", "age");
```

查询年龄等于 24 的用户：

```java
wrapper.eq("age", 24);
```

### `Page` 分页查询

MyBatisPlus 的分页插件会自动拦截 SQL，并生成 count 查询和分页语句，返回的 Page 对象包含了丰富的分页信息。

配置类 `MybatisPlusConfig`：

```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

`Page` 使用分页查询：

```java
Page<User> page = new Page<>(1, 3); /* 当前页=1，每页大小=3 */
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>().ge(User::getAge, 24); /* 年龄大于等于 24 */
Page<User> userPage = userMapper.selectPage(page, wrapper);
List<User> usersInPage = userPage.getRecords(); /* 当前页记录 */
long total = userPage.getTotal(); /* 总记录数 */
long pages = userPage.getPages(); /* 总页数 */
```

### `logic-delete` 逻辑删除

配置逻辑删除：

```yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  # 全局逻辑删除字段名
      logic-delete-value: 1        # 逻辑已删除值
      logic-not-delete-value: 0    # 逻辑未删除值
```

或者在实体字段上使用 `@TableLogic` 注解指定逻辑删除字段。

配置完成后，`deleteById` 等删除方法就会执行逻辑删除，把 `deleted` 或指定的字段设置为 `1` 或指定的值，而不是真的删除。查询时，结果集中不会包含逻辑删除的记录，MP 会自动在 SQL 上拼接 `deleted=0` 的条件。若需要查询包含逻辑删除的数据，可以使用 `selectList` 并传入特殊条件。

### `MetaObjectHandler` 自动填充

实体中的 createTime、updateTime 字段需要在插入或更新时自动赋值，避免手动设置。通过实现 `MetaObjectHandler` 接口并重写 `insertFill` 和 `updateFill` 方法，来自定义自动填充字段的行为：

```java
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.util.Date;

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
