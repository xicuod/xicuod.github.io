---
weight: 60
slug: lombok
title: Lombok
---

原来的实体类需要显式包含大量 Getter、Setter 等方法，过于臃肿。Lombok 可以借助注解减少实体类的代码量。

Lombok 是一个实用的 Java 类库，能通过注解的形式自动生成构造器、`getter`/`setter`、`equals`、`hashCode`、`toString` 等方法，并可以自动化生成日志变量，简化 java 开发，提高效率。

- `@Getter`/`@Setter`：为所有的属性提供 get/set 方法
- `@ToString`：给类自动生成易阅读的 toString 方法
- `@EqualsAndHashCode`：根据类所拥有的非静态字段自动重写 equals 方法和 hashCode 方法
- `@Data`：综合的生成代码功能 (=`@Getter`+`@Setter`+`@ToString`+`@EqualsAndHashCode`)
- `@NoArgsConstructor`：为实体类生成无参的构造器
- `@AllArgsConstructor`：为实体类生成带有除了静态字段之外的所有参数的构造器

`pom.xml` 引入 `lombok` 依赖：

```xml
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
</dependency>
```
