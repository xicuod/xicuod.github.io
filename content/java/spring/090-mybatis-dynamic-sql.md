---
weight: 90
slug: mybatis-dynamic-sql
title: MyBatis 动态 SQL
---

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
