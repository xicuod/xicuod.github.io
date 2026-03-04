---
weight: 80
slug: mybatis-xml-sqlmap
title: MyBatis XML 映射文件
---

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

## IntelliJ IDEA MyBatisX 插件

MyBatisX 是一款基于 IntelliJ IDEA 的快速开发 Mybatis 的插件，为效率而生。
