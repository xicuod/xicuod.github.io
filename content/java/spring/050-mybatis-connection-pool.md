---
weight: 50
slug: mybatis-connection-pool
title: MyBatis 数据库连接池
---

数据库连接池是个容器，负责分配、管理数据库连接 (Connection)。它允许应用程序重复使用一个现有的数据库连接，而不是再重新建立一个。它会自动释放 (从持有线程中收回) 空闲时间超过最大空闲时间的连接，来避免因为没有释放连接而引起的连接遗漏 (有人分配不到连接)。

- 数据库连接池的优势：资源重用、提升系统响应速度、避免数据库连接遗漏

## 数据库连接池的实现

`DataSource` 接口是 Sun 官方提供的数据库连接池接口，由第三方组织实现此接口。

`DataSource` 方法：

- `Connection getConnection() throws SQLException` 获取连接

常见的数据库连接池实现框架：C3P0、DBCP、Druid、Hikari (SpringBoot 默认)

- [Druid](https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter) (德鲁伊)：Druid 连接池是阿里巴巴开源的数据库连接池项目，功能强大，性能优秀，是 Java 最好的数据库连接池之一。

在 SpringBoot 项目中切换到 Druid 连接池：

- `pom.xml` 引入依赖：

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-3-starter</artifactId>
	<version>1.2.27</version>
</dependency>
```

- SpringBoot 项目会自动切换到引入的 Druid 连接池

- 或者在 `application.properties` 中显式指定 `datasource.druid` (可选)：

```properties
spring.datasource.druid.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.druid.url=jdbc:mysql://localhost:3306/mybatis
spring.datasource.druid.username=root
spring.datasource.druid.password=1234
```
