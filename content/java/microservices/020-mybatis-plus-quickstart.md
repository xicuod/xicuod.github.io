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

## `BaseMapper` 实现基础crud

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
  - @TableField字段名与列名不一致；is开头的布尔字段 is会省略 不想省略就写@TableField；不参与映射到列的字段 写@TableField(exist = false)；手动给列名加 \`反引号\` 防止sql注入，mp不会自动加，除非你[这么配置](https://baomidou.com/reference/question/#如何全局处理数据库关键词)：

```yml
mybatis-plus:
  global-config:
    db-config:
      column-format: "`%s`"
```

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

mp 提供了 `Wrapper` 类作为条件构造器，可以动态组装查询条件。`AbstractWrapper` 通用方法 getEntity setEntity getEntityClass setEntityClass allEq eq ne gt ge lt le like notLike likeLeft likeRight notLikeLeft notLikeRight between notBetween；实现类 `QueryWrapper` 用于查询，特有方法 `select()`，`UpdateWrapper` 用于更新，特有方法 `set()` `setSql()`。lambda版本 `LambdaQueryWrapper` `LambdaUpdateWrapper` 用 getter 的方法引用来解耦字段名，避免硬编码。

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

`in()` 代替 xml foreach 查询指定范围的用户：

```xml
<select id="selectByIds" resultType="User">
    SELECT * FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

```java
List<Integer> ids = Arrays.asList(1,2,3);
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.in(User::getId, ids);
List<User> users = userMapper.selectList(wrapper);
```

## 自定义sql实现复杂sql

问题：复杂sql如更新`set balance = balance - 1`还是要写`setSql("balance = balance - 1")`在代码中硬编码sql语句；`select count(id) as total`又是聚合函数又是别名，仅靠mp无能为力；解决：自定义sql就是各司其职，复杂的where条件用mp的wrapper条件构造器构建，剩下的部分靠自定义mapper代码，也就是用原汁原味的mybatis注解或xml写动态sql；

写mapper方法：每个参数都要加@Param注解，wrapper要加"ew"，这是固定写法，但更好的写法是用mp的常量`Constants.WRAPPER`，其他同名如amount加"amount"；

```java
void updateBalanceByIds(@Param(Constants.WRAPPER) LambdaQueryWrapper<User> wrapper, @Param("amount") int amount);
```

写 xml 动态 sql：`ew.custmSqlSegment`就是自定义的where子句，把它用美元占位符拼接上去即可；

```xml
<update id="updateBalanceByIds">
    UPDATE tb_user SET balance = balance - #{amount} ${ew.custmSqlSegment}
</update>
```

## `IService` 接口实现进阶crud

方法繁多：

- save saveBatch saveOrUpdate saveOrUpdateBatch；
- remove removeByMap removeById removeByIds [delete where id in (?,?,?)] removeBatchByIds [delete where id = ? 批处理]；
- update updateById updateBatchById；
- getById getOne 查一个；list listByIds listByMap 查多个；count；page；
- lambdaQuery lambdaUpdate 使用 lambdaWrapper 构造复杂 where 条件，链式编程，可接查询或更新作为终结方法；

`IService` 的实现类是 `ServiceImpl`，你的 `IUserService` 需要继承 `IService`，你的 `UserServiceImpl` 需要继承 `ServiceImpl` 并实现 `IUserService`。

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {}
```

`IService` 的 batch 方法本身还是生成一条一条的语句，不能实现批量插入，需要配合 MySQL 的配置 `rewriteBatchedStatements=true` 重写成批量语句，把它加到 JDBC 的连接字符串中即可。

## mp 代码生成器

mp 提供了[代码生成器](https://baomidou.com/guides/new-code-generator/)自动生成前面的 mapper、service、xml 等的 orm 代码，减少重复劳动。代码生成器是单独的工具程序，不是集成在 spring 程序当中的，运行之后会在 spring 程序包的指定目录生成 orm 代码。

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.15</version>
</dependency>
```

```java
public class CodeGenerator {

    public static void main(String[] args) {
        // 使用 FastAutoGenerator 快速配置代码生成器
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/mybatis_plus?serverTimezone=GMT%2B8", "root", "password")
        .globalConfig(builder -> {
            builder.author("Your Name") // 设置作者
                .outputDir("src/main/java"); // 输出目录
        })
        .packageConfig(builder -> {
            builder.parent("com.example") // 设置父包名
                .entity("model") // 设置实体类包名
                .mapper("dao") // 设置 Mapper 接口包名
                .service("service") // 设置 Service 接口包名
                .serviceImpl("service.impl") // 设置 Service 实现类包名
                .xml("mappers"); // 设置 Mapper XML 文件包名
        })
        .strategyConfig(builder -> {
            builder.addInclude("table1", "table2") // 设置需要生成的表名
                .entityBuilder()
                .enableLombok() // 启用 Lombok
                .enableTableFieldAnnotation() // 启用字段注解
                .controllerBuilder()
                .enableRestStyle(); // 启用 REST 风格
        })
        .templateEngine(new FreemarkerTemplateEngine()) // 使用 Freemarker 模板引擎
        .execute(); // 执行生成
    }
}
```

有 idea 插件生成代码生成器的代码，官方有 MyBatisX，民间有 MyBatisPlus 等。

## `Db` 静态crud工具类

`Db`工具类的静态方法跟`IService`的方法基本一致，主要静态方法到处都能用，没有恼人的依赖问题，适合在跨service查询或工具类中使用。因为是静态方法，你需要提供实体类的`Class<T>`参数，让它知道应该操作哪张表。

## `logic-delete` 逻辑删除

逻辑删除就是把 `deleted` 或指定的字段设置为 `1` 或指定的值，而不是真的删除；查的时候就查 `deleted` 为 `0` 的行。mp配置启用逻辑删除：

```yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  # 全局逻辑删除字段名
      logic-delete-value: 1        # 逻辑已删除值
      logic-not-delete-value: 0    # 逻辑未删除值
```

在实体字段上使用 `@TableLogic` 注解指定逻辑删除字段，如 `deleted`。配置完成后，`deleteById` 等删除方法就会切换为逻辑删除。查询结果集中不会包含逻辑删除的记录，MP 会自动在 SQL 上拼接 `deleted = 0` 的条件。若要包含已经逻辑删除的行，则可加上 `or delete = 1` 条件，或不通过 mp，使用 xml 只查询已经逻辑删除的行。

逻辑删除的坏处：会导致数据库表垃圾数据越来越多，影响查询效率；SQL 中全都需要对逻辑删除字段做判断，影响查询效率。因此，不太推荐启用逻辑删除功能，如果数据不能彻底删除，可以把删除的数据迁移到特定表。

## `enum-type-handler` 枚举处理器

mp配置全局[枚举处理器](https://baomidou.com/guides/auto-convert-enum/)：`MybatisEnumTypeHandler` 基于枚举常量属性；

```yml
mybatis-plus:
    configuration:
        default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
```

`@EnumValue`标记在数据库里面存哪个字段；`@JsonValue`标记给前端返回哪个字段，这是Jackson提供的注解，spring mvc底层就是用Jackson；原理是请求响应JSON数据时，通过序列化器相关配置可以指定序列化枚举字段的行为。

## `JsonTypeHandler` JSON处理器

mp通过各种typehandler处理各式各样的数据。mp的JsonTypeHandler按照Jackson > Fastjson > Gson的优先级顺序选择JSON序列化器。给前端响应JSON数据时，处理数据库JSON类型字段时，mp用的都是JsonTypeHandler的序列化器。MySQL5.7.8有专门的[JSON数据类型](https://www.cnblogs.com/liuyiyuan/p/16388360.html)处理JSON字符串。

mp并不能通过全局配置把数据库中的JSON自动反序列化成复杂类型字段，只能在每个复杂类型字段上加`@TableField(typeHandler = JacksonTypeHandler.class)`，并且给实体类加上`@TableName(value = "tbname", autoResultMap = true)`，让自定义的 typeHandler 起效。

> [!note] 从 MyBatis 的简单自动映射与复杂 resultMap 到 MyBatis-Plus 的 autoResultMap
>
> 默认情况下，MyBatis 使用简单的自动映射，按列名匹配属性名，这种映射不会考虑 typeHandler。要让 typeHandler 在查询时起作用，必须通过 `<resultMap>` 显式配置。
>
> ```xml
> <resultMap id="userMap" type="User">
>     <result column="info" property="info" typeHandler="com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler"/>
> </resultMap>
> ```
>
> MyBatis-Plus 为了简化开发，提供了 `autoResultMap`，它会在运行时自动生成一个类似上面的 resultMap，并处理那些标注了 typeHandler 的字段。autoResultMap 比 resultMap 粒度更粗，适合简化样板代码。

```java
@Data
@TableName(value = "user", autoResultMap = true)
public class User {
    private Long id;
    private String username;
    @TableField(typeHandler = JacksonTypeHandler.class)
    private UserInfo info;
}
```

```java
@Data
public class UserInfo {
    private Integer age;
    private String gender;
}
```

## mp 拦截器插件

- `TenantLineInnerInterceptor` 多租户插件
- `DynamicTableNameInnerInterceptor` 动态表名插件
- `PaginationInnerInterceptor` 分页插件
- `OptimisticLockerInnerInterceptor` 乐观锁插件
- `IllegalSQLInnerInterceptor` SQL性能规范插件，检测并拦截垃圾SQL
- `BlockAttackInnerInterceptor` 防止全表更新和删除的插件

### `PaginationInnerInterceptor` 分页插件

mp 的分页插件会自动拦截 SQL，并生成 count 查询和分页语句，返回的 Page 对象包含了丰富的分页信息。

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        PaginationInnerInterceptor pageInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        pageInterceptor.setMaxLimit(1000L); // 分页上限
        interceptor.addInnerInterceptor(pageInterceptor);
        return interceptor;
    }
}
```

与 mapper 的 selectPage() 配合使用：

```java
Page<User> page = Page.of(1, 3); // 当前页=1，每页大小=3
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>().ge(User::getAge, 24);
Page<User> p = userMapper.selectPage(page, wrapper);
List<User> users = p.getRecords(); // 当前页记录
long total = p.getTotal(); // 总记录数，page会保存所有记录的统计数值，方便前端显示
long pages = p.getPages(); // 总页数，page会保存所有页的统计数值
```

与 service 的 page() 配合使用：

```java
int pageNo = 1, pageSize = 5;
Page<User> page = Page.of(pageNo, pageSize);
page.addOrder(new OrderItem("balance", false)); //排序参数orderitem，按余额降序
page.addOrder(new OrderItem("id", true)); //然后按id升序
Page<User> p = userService.page(page);
```

自己封装通用分页请求实体 `PageQuery`，其他分页查询实体继承它实现分页查询：

```java
@Data
@ApiModel(description="分页查询实体")
public class PageQuery {
    @ApiModelProperty("页码")
    private Integer pageNo;
    @ApiModelProperty("页大小")
    private Integer pageSize;
    @ApiModelProperty("排序字段")
    private String sortBy;
    @ApiModelProperty("是否升序")
    private Boolean isAsc;

    public <T> Page<T> toMpPage(OrderItem ... items){
        Page<T> page = Page.of(pageNo, pagesize);
        if(StrUtil.isNotBlank(sortBy)){
            page.addorder(new OrderItem(sortBy, isAsc));
        }
        else if(items != null) {
            page.addorder(items);
        }
        return page;
    }

    public <T> Page<T> toMpPage(String defaultSortBy, Boolean defaultAsc) {
        return toMpPage(new OrderItem(defaultSortBy, defaultAsc));
    }

    public <T> Page<T> toMpPageSortByCreateTime() {
        return toMpPage(new OrderItem("create_time", false));
    }

    public <T> Page<T> toMpPageSortByUpdateTime() {
        return toMpPage(new OrderItem("update_time", false));
    }
}
```

通用分页响应实体 `PageDTO`：

```java
@Data
@ApiModel(description="分页结果")
public class PageDTO<T> {
    @ApiModelProperty("总条数")
    private Long total;
    @ApiModelProperty("总页数")
    private Long pages;
    @ApiModelProperty("结果集")
    private List<T> list;

    public static <PO,VO> PageDTO<VO> of(Page<PO> p, Function<PO,VO> mapper) {
        PageDTO<VO> dto = new PageDTO<>();
        dto.setTotal(p.getTotal());
        dto.setPages(p.getPages());

        List<PO> records = p.getRecords();
        if (CollUtil.isEmpty(records)) {
            dto.setList(Collections.emptyList());
            return dto;
        }

        dto.setList(records.stream().map(mapper).collect(Collections.toList()));
        return dto;
    }
}
```

最后在 `UserService` 中封装一个 `PageDTO<UserVO> queryUserPage(UserQuery query)`，加入用户实体特有的逻辑：

```java
public PageDTo<UserVO> queryUsersPage(UserQuery query) {
    String name = query.getName();
    Integer status = query.getstatus();

    Page<User> page = query.toMpPageSortByUpdateTime();
    Page<User> p = lambdaQuery()
        .like(name != null, User::getusername, name)
        .eq(status != null, User::getstatus, status)
        .page(page);
    
    return PageDTO.of(p, user -> {
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        //隐藏用户名后两位
        vo.setUsername(vo.getUsername().substring(O, vo.getUsername().length() - 2) + "**");
        return vo;
    });
}
```

## `MetaObjectHandler` 自动填充

User 实体中的 createTime、updateTime 字段需要在插入或更新时自动赋值，避免手动设置。通过 `@TableField(fill = FieldFill.INSERT)` 和 `@TableField(fill = FieldFill.INSERT_UPDATE)` 等来配置字段在何时自动填充。之后，在指定的时机就会触发 `MetaObjectHandler` 的 `insertFill()` 或 `updateFill()` 方法。

通过实现 `MetaObjectHandler` 接口并重写 `insertFill()` 和 `updateFill()` 方法来自定义自动填充行为：

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
