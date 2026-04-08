---
weight: 40
slug: java-mybatis-quickstart
title: MyBatis 快速入门
---

[MyBatis](https://mybatis.org/mybatis-3/zh/index.html) 是一款优秀的持久层 (Dao 层, 数据访问层) 框架，用于简化 JDBC 的开发。MyBatis 本是 Apache 的一个开源项目 iBatis，2010 年这个项目由 Apache 迁移到了 Google Code，并且改名为 MyBatis。2013 年 11 月迁移到 GitHub。

在 Spring Boot 项目中使用 MyBatis：

1. 准备工作 (创建 springboot 工程、数据库表 `user`、实体类 `User`)

2. 引入 Mybatis 的相关依赖 (勾选 `MyBatis Framework` 和 `MySQL Driver` 依赖)，在 `application.properties` 配置 Mybatis 数据库连接信息

```properties
#数据库连接配置四要素
#DBMS驱动类名称
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#数据库的url
spring.datasource.url=jdbc:mysql://localhost:3306/ur-db-name
#连接数据库的用户名
spring.datasource.username=root
#连接数据库的密码
spring.datasource.password=ur-passwd
```

3. 编写 SQL 语句 (注解写法、XML 写法)

在 MyBatis 项目中，Dao 层称为 Mapper 层，并使用 `@Mapper` 注解替代 `@Repository`。`@Mapper` 注解的接口，在运行时会自动生成实现类对象 (动态代理)，并且将该对象交给 IOC 容器管理。

实体类的字段类型和字段名要和数据库表中的字段相对应：

- 类型对应关系：`Integer` 对应 `int`，`Short` 对应 `tinyint`，`String` 对应 `varchar`，`LocalDate` 对应 `date`，`LocalDateTime` 对应 `datetime`
- 名称对应关系：可以用不同的命名风格，只要内容一样就行，如 `lastModified` 对应 `last_modified`
