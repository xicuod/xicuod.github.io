---
weight: 110
slug: spring-data-redis
title: Spring Data Redis
---

Spring Data 是 Spring 中数据操作的模块，包含对各种数据库的集成，其中对 Redis 的集成模块就叫做 [SpringDataRedis](https://spring.io/projects/spring-data-redis)。

- 提供了对不同 Redis 客户端的整合（Lettuce 和 Jedis）
- 提供了 `RedisTemplate` 统一 API 来操作 Redis
- 支持 Redis 的发布订阅模型
- 支持 Redis 哨兵和 Redis 集群
- 支持基于 Lettuce 的响应式编程
- 支持基于 JDK、JSON、字符串、Spring 对象的数据序列化及反序列化
- 支持基于 Redis 的 JDK `Collection` 实现（就是把 Java 集合跟 Redis 数据结构做兼容）

Redis 命令有通用的，也有专门用于单一数据结构的，比如 `set` 只能用于 `String`，`hset` 只能用于 `Hash`。SpringDataRedis 提供 `RedisTemplate` 工具类，按通用的和专门的命令划分了不同的 API：

- `ValueOperations redisTemplate.opsForValue()` 操作 `String` 类型的数据
- `HashOperations redisTemplate.opsForHash()` 操作 `Hash` 类型的数据
- `ListOperations redisTemplate.opsForList()` 操作 `List` 类型的数据
- `SetOperations redisTemplate.opsForSet()` 操作 `Set` 类型的数据
- `ZSetOperations redisTemplate.opsForZSet()` 操作 `SortedSet` 类型的数据
- `redisTemplate` 通用的命令

## SpringDataRedis 快速入门

首先要在 IntelliJ IDEA 中创建一个 Spring Boot 项目，然后包管理器选 Maven，接着在下一个页面的 NoSQL 下拉列表中选择 `Spring Data Redis (Access & Driver)`，进入项目后，检查 `pom.xml` 中是否引入下面两个依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

Jedis 和 Lettuce 底层都用 `commons-pool2` 实现数据库连接池。

然后在 `src/main/resources/application.yml` 中添加 Redis 相关配置：

```yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: 213
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: 100
```

然后在你的 `RedisTest` 测试类中注入 `RedisTemplate`：

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
@Autowired
private RedisTemplate redisTemplate;
```

然后在你的测试类中写测试方法：

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
@Test
void testString() {
    redisTemplate.opsForValue().set("name", "Wubai");
    Object name = redisTemplate.opsForValue().get("name");
    System.out.println("name = " + name);
}
```

``` {filename="Console"}
name = Wubai
```

Spring 控制台的输出没有问题，但是你在别的地方可能看到这些东西：

```
key: \xAC\xED\x00\x05t\x00\x04name
value: \xAC\xED\x00\x05\x74\x00\x05\x57\x75\x62\x61\x69
```

这是因为 Spring Data Redis 的 `RedisTemplate` 在保存键值对的时候，会先把键和值经过 **JDK 序列化机制**序列化后再放入 Redis。`RedisTemplate` 使用的默认序列化器是 `JdkSerializationRedisSerializer`。`\xAC\xED` 是 Java 序列化流的魔数（Magic Number），表示这是一个经过 Java 序列化的对象。

### 使用 `StringRedisTemplate`

推荐使用 `StringRedisTemplate` 处理纯字符串场景。避免使用 JDK 序列化，因为它的**可读性差**、**存储体积大**、且**跨语言交互不友好**。因此，之前注入的 `RedisTemplate` 已经是“原始使用”，对于本例，最好使用专门处理字符串类型的 `StringRedisTemplate`。

虽然 `StringRedisTemplate` 专门处理字符串类型，但是基元类型也能通过 `String.valueOf()` 轻松转换成字符串类型，而复杂的对象也能通过 JSON 序列化器和反序列化器快速与字符串互转。所以，对于较为简单的场景，用 `StringRedisTemplate` 并在平时多下点功夫，足以应对大部分情况。

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
@Autowired
private /* RedisTemplate */ StringRedisTemplate redisTemplate;
```

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
/* Object */ String name = redisTemplate.opsForValue().get("name");
```

### 自定义 `RedisTemplate<String,Object>`

容易想到的一种情况是 `key` 用一般的字符串序列化器，`value` 要存 Java 对象所以用 JSON 序列化器，对此你可以做一个这样的 `RedisTemplate<String,Object>` 的 `Bean`，放在 `RedisConfig` 配置类中。

> [!note] 使用 JSON 序列化器会浪费空间，详见[下一节](#统一使用-stringredistemplate)，这一节看看就好。

```java {filename="src/main/java/ur.pkg.demo.config.RedisConfig.java"}
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String,Object> redisTemplate(RedisConnectionFactory connectionFactory){
        RedisTemplate<String,Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        var jsonRedisSerializer = new GenericJackson2JsonRedisSerializer();
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
```

`GenericJackson2JsonRedisSerializer` 依赖 `jackson-databind` 工件，一般使用 `com.fasterxml.jackson.core` 组织的版本。

```xml {filename="pom.xml"}
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

> [!warning] `GenericJackson2JsonRedisSerializer` 已弃用
>
> 自 Spring Data Redis 4.0 开始，`GenericJackson2JsonRedisSerializer` 已被标记为弃用并计划移除。笔者试着换成 `GenericJacksonJsonRedisSerializer` 配合 JSON 工件提供 `ObjectMapper` 使用可以通过测试，具体可问 LLM。

然后写一个测试 POJO 和测试方法，来测试这个自定义 `RedisTemplate<String,Object>`：

```java {filename="src/main/java/ur.pkg.demo.pojo.User.java"}
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String name;
    private Integer age;
}
```

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
@Autowired
private RedisTemplate<String,Object> redisTemplate;
```

```java {filename="src/test/java/ur.pkg.demo.RedisTest.java"}
@Test
void testUser() {
    redisTemplate.opsForValue().set("user:10", new User("伍佰", 40));
    Object user = redisTemplate.opsForValue().get("user:10");
    System.out.println("user = " + user);
}
```

``` {filename="Console"}
user = User(name=伍佰, age=40)
```

存到 Redis 的原始 JSON 数据：

```json
{
  "@class": "top.xicuodev.redisdemo.pojo.User",
  "name": "伍佰",
  "age": 40
}
```

### 统一使用 `StringRedisTemplate`

尽管 JSON 序列化方式可以满足常见需求，但是每个对象都会存一个 `"@class": "top.xicuodev.redisdemo.pojo.User"` 这样的全限定类名，这是为了在反序列化时知道对象的类型，但是这样会带来非常多的冗余，因为这样的对象可能要存成千上万个，于是就会有成千上万个重复的类名字段。

为了节省内存空间，一般并不会使用 JSON 序列化器处理 `value`，而是统一使用 `String` 序列化器，只存储 `String` 类型的 `key` 和 `value`。当需要存储 Java 对象时，手动实现序列化和反序列化。

于是最后还是抛弃了[自定义 `RedisTemplate<String,Object>`](#自定义-redistemplatestringobject)，还是把 [`StringRedisTemplate`](#使用-stringredistemplate) 拿了回来，并且你要手动序列化和反序列化 Java 对象。

手动序列化和反序列化用的还是之前提到的 `ObjectMapper`，写法如下：

```java
private static final ObjectMapper mapper = new ObjectMapper();
```

```java
void testStringUser() throws JsonProcessingException {
    /* ... */
    String json = mapper.writer().writeValueAsString(user);
    /* ... */
}
```

低版本的 `jackson-databind` 可能需要去掉 `.writer()`。

```json
{
  "name": "陶喆",
  "age": 40
}
```

这样就没有那条又臭又长的 `"@class"` 字段了。之后，你可以把这个 JSON 处理逻辑封装成工具类。

### `RedisTemplate` 操作 `Hash` 类型

```java
@Test
    void testHash() {
        stringRedisTemplate.opsForHash().put("user:30","name","周杰伦");
        stringRedisTemplate.opsForHash().put("user:30","age","40");
        Map<@NonNull Object, Object> entries = stringRedisTemplate.opsForHash().entries("user:30");
        System.out.println("entries = " + entries);
    }
```

```
entries = {name=周杰伦, age=40}
```
