---
weight: 100
slug: redis-java-clients
title: Redis Java 客户端
---

Redis 的 API 客户端有很多，支持各种常用的编程语言，具体可以看[这里](https://redis.io/docs/latest/develop/clients/)。Redis 推荐使用的 Java API 客户端有 Jedis、Lettuce 和 Redisson。

**Jedis** 以 Redis 命令作为方法名称，学习成本低，简单实用。但是 Jedis 实例是线程不安全的，没做线程同步，多线程环境下需要基于连接池来使用。

**Lettuce** 是基于 **Netty** 实现的，支持同步、异步和响应式编程方式，并且是线程安全的。Lettuce 还支持 Redis 的哨兵模式、集群模式和管道模式。

**Redisson** 是一个基于 Redis 实现的**分布式**、可伸缩的 Java 数据结构集合，包含诸如 Map、Queue、Lock、Semaphore、AtomicLong 等强大功能。

**Spring Data Redis** 整合了 Jedis 和 Lettuce，对两个 API 库都是兼容的。

## Jedis

Jedis 的 GitHub 仓库地址在[这里](https://github.com/redis/jedis)，快速入门：

1. 引入 maven 依赖

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.7.0</version>
</dependency>
```

2. 建立 jedis 连接

```java
private Jedis jedis;

@BeforeEach
void setUp() {
    jedis = new Jedis("ur-host", 6379);
    jedis.auth("ur-passwd");
    jedis.select(0);
}
```


3. 测试 `String` 类型（使用 `junit-jupiter` 工件）

```java
@Test
void testString() {
    // 插入数据，方法名称就是 redis 命令名称，非常简单
    String result = jedis.set("name", "张三");
    System.out.println("result = " + result);
    // 获取数据
    String name = jedis.get("name");
    System.out.println("name = " + name);
}
```

4. 释放资源

```java
@AfterEach
void tearDown() {
    // 释放资源
    if (jedis != null) {
        jedis.close();
    }
}
```

## Jedis 连接池

Jedis 本身线程不安全，且频繁地创建和销毁 Jedis 连接性能很差，因此推荐使用 Jedis 连接池，而不是单个 Jedis 实例。`JedisPool` 是 Jedis 提供的连接池。

> [!warning] `JedisPool` 在 Jedis 7.2.0 已弃用
>
> 从 [Jedis 7.2.0](https://github.com/redis/jedis/releases/tag/v7.2.0) 起，官方推出了三种全新的客户端类，旨在统一单机、集群和哨兵模式的使用体验。
> 
> - 单机模式：`RedisClient` 取代 `JedisPool` / `JedisPooled`
> - 集群模式：`RedisClusterClient` 取代 `JedisCluster`
> - 哨兵模式：`RedisSentinelClient` 取代 `JedisSentinelPool`

Jedis 连接工厂类：

```java
public class JedisConnectionFactory {
    private static final JedisPool jedisPool;
    
    static {
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        // 最大连接
        jedisPoolConfig.setMaxTotal(8);
        // 最大空闲连接
        jedisPoolConfig.setMaxIdle(8);
        // 最小空闲连接
        jedisPoolConfig.setMinIdle(0);
        // 无可用连接时的最长等待时间（毫秒），-1 永远等待
        jedisPoolConfig.setMaxWaitMillis(200);
        
        jedisPool = new JedisPool(jedisPoolConfig, "ur-host", 6379, 1000, "ur-passwd");
    }
    
    // 获取 Jedis 实例
    public static Jedis getJedis() {
        return jedisPool.getResource();
    }
}
```

从 Jedis 连接池获取 Jedis 实例：

```java
jedis = JedisConnectionFactory.getJedis();
```

Jedis 实例的 `close` 方法封装了连接池的分支逻辑，如果是连接池的实例，会把它归还到连接池，而不是销毁实例。因此，释放资源的逻辑保持原样即可。

```java
jedis.close();
```
