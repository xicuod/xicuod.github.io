---
weight: 45
slug: jdbc
title: JDBC
---

JDBC (Java Data Base Connectivity) 就是使用 Java 语言操作关系型数据库的一套 API。

- Sun 公司官方定义的一套操作所有关系型数据库的规范，即接口。
- 各个数据库厂商去实现这套接口，提供数据库的驱动 jar 包。
- 我们可以使用 JDBC 这套接口编程，真正执行的代码是驱动 jar 包中的实现类。

JDBC 的弊端与 Spring MyBatis 的优势：

- 注册驱动和获取连接是硬编码，容易变动的数据库连接信息写死在了 Java 代码中。Spring MyBatis 的 `application.properties` 解耦连接信息到外部配置文件。
- 结果集中字段的值要一个个获取，繁琐。Spring MyBatis 的 `@Select` 自动获取 `List<Pojo>`。
- 频繁获取和释放连接，造成资源浪费，性能降低。Spring MyBatis 的数据库连接池统一管理。
