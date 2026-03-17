---
weight: 120
slug: heima-dianpin
title: 《黑马点评》项目笔记
---

## CORS 跨域问题

现象：前端请求后端接口时，后端 `request.getHeader("authorization")` 始终返回 `null`，导致 401 未登录。

根本原因：`LoginInterceptor` 拦截器没有放行 `OPTIONS` 预检请求，导致浏览器 CORS 预检失败，真正的请求（携带 `authorization`
header）根本没有发送。`OPTIONS` 请求是“无辜”的，它只是来问“服务器允许跨域吗”，却被拦截器当成了未登录请求拦下。

### 原理：CORS 跨域机制

浏览器 CORS 机制：当跨域请求满足以下条件时，浏览器会先发送 `OPTIONS` 预检请求。

- 使用了非简单方法（如 GET/POST 之外的）
- 自定义请求头（如 `authorization`）
- `Content-Type` 不是 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

> [!tip] 什么是跨域？
>
> 浏览器的**同源策略**（Same-Origin Policy）要求：**协议**、**域名**、**端口**，三者必须完全相同。只要有一个不同，就算跨域。

> [!note] CORS 是浏览器的安全机制
>
> CORS 是浏览器的安全机制，目的是防止恶意网站通过浏览器访问用户登录的其他网站的账号数据。浏览器自己要搞跨域检查，发了预检请求，所以后端配合它弄了跨域；如果浏览器本身不搞，那么后端也不会要求。

浏览器流程：

1. 先发 `OPTIONS /user/me`（不含自定义请求头的值）

```
Origin: http://localhost
Access-Control-Request-Headers: authorization
Access-Control-Request-Method: GET
```

2. 等服务器响应允许 CORS 后，才发真正的 `GET /user/me`（含自定义请求头的键值：`authorization: <token-value>`）

### 解决方案：反向代理或 Spring CORS 配置

让运维同学在 Nginx 上配置**反向代理**，把前端名义上的 `80` 请求代理到后端实际上的 `8081`，这样浏览器就不认为前端的请求跨域了。

```{filename="nginx.conf"}
server {
    location /api/ {
        proxy_pass http://localhost:8081/;
    }
}
```

> [!tip] 代理的正反
>
> 代理的正反指的是**代理本身的方向**：反向代理就是把代理那一面朝向客户端，实际那一面朝向服务端；正向代理就是实际那一面朝向客户端，代理那一面朝向服务端。
> 
> 代理的那一面朝向一端，另一端就被代理服务器**隐藏**了，因为代理朝向的那一端只知道代理服务器的地址，不知道实际服务器的地址。

然而，作为一名后端工程师，更标准的做法是交给 **Spring CORS 配置**处理，只要配置正确，Spring 就会自动处理 `OPTIONS` 请求，不会执行拦截器。

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("authorization", "content-type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

> [!warning] CORS “不欢迎”通配符
>
> 注意必须显式指定 `.allowedOrigins("http://localhost")` 和 `.allowedHeaders("authorization")`，因为 `authorization` 是**凭据**头，当跨域请求涉及凭据时，浏览器对服务器的响应头有严格要求：`Access-Control-Allow-Origin` 和 `Access-Control-Allow-Headers` 都不能为 `*`，必须明确列出允许的条目。这是 **CORS 规范**的一部分，目的是防止在凭据模式下**意外**暴露敏感信息。如果服务器允许通配符，攻击者可能利用某些漏洞绕过同源策略。

## 缓存问题

详见[缓存]({{% sref "cache" %}})。

## 秒杀问题

### 全局唯一标识符

订单的标识符不应该重复，应该是全局唯一的。订单的标识符不应该规律明显，让别有用心的人猜到标识符变化规律并利用它攻击你的系统。

全局 ID 生成器是一种在分布式系统上生成全局唯一的 ID 的工具，一般要满足五个特性：唯一性、高可用、高性能、递增性和安全性。

Redis 是实现全局唯一 ID 的好工具。Redis 单线程执行命令，天然支持原子递增操作（`INCR` 和 `INCRBY`），所以它能保证唯一性和递增性。Redis 的主从和哨兵模式可以做到高可用。Redis 基于内存，性能很好。Redis 本身只能简单递增，不能复杂递增，需要在应用层写这方面逻辑，才能提高安全性。

为了提高 ID 的安全性，可以在 Redis 自增的数值的基础上拼接其他内容：

```
0 - 0000000 00000000 00000000 00000000 - 00000000 00000000 00000000 00000000
```

上面复杂 ID 的组成结构：

- 符号位：1 bit，永远为 0
- 时间戳：31 bit，单位秒，可以用 69 年
- 序列号：32 bit，可以做到每秒 $2^{32}$ 个不同的 ID

序列号是独立增长的，与 Redis 中存的实际递增值一致。时间戳只是用于增加复杂度的因子，并不会作为计数维度。

Redis 的递增值是有上限的，所以最好一天换一个递增值的 `key`。这样一个实体的全局唯一 ID 的 `key` 的格式就是 `incr:keyPrefix:yyyy:MM:dd`。每天一个 `key` 还能方便统计每天的订单量。

```java
private static final long BEGIN_TIMESTAMP = 1767225600L; /*2026-01-01T00:00:00+00:00*/

private static final int INCREMENT_BITS = 32; /*序列号位数*/

public long nextId(String keyPrefix) {
    String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
    String key = "incr:" + keyPrefix + ":" + date;
    //生成时间戳
    long timestamp = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
    long relativeTimestamp = timestamp - BEGIN_TIMESTAMP;
    //生成序列号
    Long increment = stringRedisTemplate.opsForValue().increment(key);
    if (increment == null) increment = 0L;
    return relativeTimestamp << INCREMENT_BITS | increment;
}
```

包括这个基于 Redis 自增值和时间戳的，全局唯一 ID 的生成策略有：

- UUID
- Redis 自增
- Snowflake 雪花算法
- 数据库自增：专门弄一张自增表

### 基本秒杀下单

1. 查代金券
2. 查秒杀是否开始或结束
3. 查库存
4. 减库存
5. 建订单
6. 订单写入数据库

这里“减库存”和“订单写入数据库”是两次数据库写入，还是对不同表的写入，所以需要加一个 Spring 的事务注解 `@Transactional`。

```java
@Override
@Transactional
public Result seckillVoucher(Long voucherId) {
    String notOpenMsg = "Seckill is not open yet.";
    String closedMsg = "Seckill is already closed.";
    String ranOutMsg = "Ran out of seckill voucher.";
    //查代金券
    SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
    //查秒杀是否开始或结束
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
        return Result.fail(notOpenMsg);
    }
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
        return Result.fail(closedMsg);
    }
    //查库存
    if (voucher.getStock() < 1) { /*没库存*/
        return Result.fail(ranOutMsg);
    }
    //减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1")
            .eq("voucher_id", voucherId)
            .update();
    if (!success) {
        return Result.fail(ranOutMsg);
    }
    //建订单
    VoucherOrder order = new VoucherOrder();
    long orderId = redisIdWorker.nextId(VOUCHER_ORDER_KEY);
    order.setId(orderId); /*订单id*/
    order.setUserId(UserHolder.getUser().getId()); /*用户id*/
    order.setVoucherId(voucherId); /*代金券id*/
    //订单写入数据库
    save(order);
    return Result.ok(orderId);
}
```

### 悲观锁和乐观锁

锁根据其作风可以分为两种，悲观锁和乐观锁。

- 悲观锁是认为线程安全问题一定会发生，因此在操作共享数据前先获取锁，确保多个线程串行执行。正因如此悲观锁的性能不是很好，在高并发场景不是很适合使用。`synchronized` 和 `lock` 都属于悲观锁。
- 乐观锁是认为线程安全问题不一定会发生，因此它根本就不加锁，只是在更新数据时去判断有没有其他线程修改了数据。如果没有修改，则认为是安全的，自己才更新数据；如果已经修改，说明发生了线程安全问题，此时可以重试或抛异常。

> [!note] 乐观锁怎么知道数据有没有修改过？
>
> - 版本号法：给数据加上一个版本，每次修改都更新版本，如果查完了修改时发现版本和查的时候不同，说明有其他线程先行一步。
> - CAS 法 (compare and swap，比较后交换)：如果查完了修改时发现数值跟查的时候不同，说明有其他线程先行一步。
>
> 如果数据并不复杂，比如说就只是一个数值，容易比较，那么可以直接使用 CAS 法。如果数据比较复杂，比如是一个对象，比较时要比较每一个字段的值，很麻烦，那么就使用版本号法（为此，需要在对象的类中维护一个版本号字段）。

总之，两种锁的特性和适用场景是：

- 悲观锁适合写多读少、冲突严重、强一致性要求极高的场景。它通过牺牲一点并发性能，来换取绝对的稳定。
- 乐观锁适合读多写少、冲突较少，或者操作非常轻量的场景。它通过提高并发能力，来提升系统吞吐量。

### 超卖问题

秒杀场景下并发的请求是非常多的，非常容易出现这样的情况：线程 A 查到库存但还没扣减库存时，其他线程也来查询库存，查到的是跟线程 A 同样的值，于是它们都以**同一个库存值**为准扣减了库存，导致多扣了许多不该扣的库存，最后库存会扣为负数。这就是“超卖问题”。

超卖问题可以用乐观锁解决，使用 CAS 法，即“比较后交换”，在写入时做二次判断，只更新 `tb_seckill_voucher` 中库存大于 0 的行，利用数据库行锁保证的原子性，保障了并发抢购时的线程安全。

### 一人一单问题

为了防止黄牛用脚本一人就抢购了所有秒杀券，需要限制一人一单。基本思路是在“查询库存”和“扣减库存”的中间加入一个“一人一单”的逻辑，判断每次请求的用户 id 和订单 id 是否在 `tb_voucher_order` 表里已经有一条记录了，如果有就返回失败，不扣减库存，否则正常扣减并返回成功。

但是这也存在多线程问题，先判断后写入的过程多个线程非常容易穿插执行，你判断了但还未写入，我就判断了，然后你或我的写入就变成了非法操作，而你我都不知道，心想“明明我都判断了呀”，可事与愿违。

要解决这个问题，需要用到悲观锁，你可以把“一人一单”、“扣减库存”和“创建订单”的逻辑封装为一个 `createVoucherOrder` 方法，然后用 `synchronized` 块包住这些代码。另外，因为“扣减库存”和“创建订单”这两个写入操作被封装走了，你也要把 `@Transactional` 事务注解也拿来这个方法上。

```java
@Override
@Transactional
public Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    //一人一单
    int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
    if (count > 0) { /*用户已经购买过了*/
        return Result.fail(oneForEachMsg);
    }
    /* 减库存 + 建订单 */
    return Result.ok(orderId);
}
```

#### 用好 `synchronized` 悲观锁

> [!tip] 一人一把锁
>
> 不要把 `synchronized` 写到 `createVoucherOrder` 方法上，因为这样就意味着所有用户用的都是同一把锁，而这个一人一单的场景是针对每个用户而言的，你只需要把同一个用户的并发请求串行化就行了，你应该为每个用户都配一把他自己的锁，而不是让所有用户共用一把锁。要实现这个，使用 `synchronized` 块，在括号里指定锁对象为用户 id 的字符串常量（`userId.toString().intern()`）即可。

然而，仅靠 `synchronized` 并不能保证数据库的线程安全。即使 `synchronized` 块退出并释放了锁，还需要等 Spring 把 `createVoucherOrder` 方法的 `@Transactional` 事务提交给数据库（只有提交了事务，数据库才会真正写入更改），而此时因为 `synchronized` 释放了锁，其他线程已经可以进入并发写入逻辑了。因此，我们需要在事务提交之后才去释放锁，具体做法是给调用 `createVoucherOrder` 方法的地方加锁。

```java
@Override
public Result seckillVoucher(Long voucherId) {
    /* 查券 + 查库存 */
    Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
        return proxy.createVoucherOrder(voucherId);
    }
}
```

#### 自我调用问题

> [!tip] “自我调用”：不走动态代理对象，导致 Spring 事务失效
>
> 如果主调者直接调用事务方法，那么主调者就是在用 `this`（目标对象）来调用被调者事务方法，就会构成“自我调用”。Spring 的 `@Transactional` 事务注解是基于 Spring 动态代理的对象来生效的，自我调用没有走 Spring 的动态代理对象，于是 Spring 事务也不会生效。

“自我调用”问题的解决办法也很简单，通过 `AopContext.currentProxy()` 拿到 `this` 的代理对象，然后用代理对象“代理” `this` 来调用事务方法就可以了，详见上面代码块。然而，前提是你要引入动态代理需要的 AOP 依赖 `aspectj`（包含在 `spring-boot-starter-aop` 起步依赖中），并在 Spring 应用的启动类上添加 `@EnableAspectJAutoProxy(exposeProxy = true)` 注解。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

```java
@EnableAspectJAutoProxy(exposeProxy = true)
@MapperScan("com.hmdp.mapper")
@SpringBootApplication
public class HmDianPingApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmDianPingApplication.class, args);
    }
}
```

#### 集群模式下的并发安全问题

集群模式下，nginx 通过反向代理和负载均衡把前端的请求转发给不同的后端服务实例。要配置这个模式，修改 `nginx.conf`：

```conf
http {
    server {
        location /api/ {
            proxy_pass http://backend; #反向代理
        }
    }

    upstream backend { #负载均衡
        server 127.0.0.1:8081 max_fails=5 fail_timeout=10s weight=1;
        server 127.0.0.1:8082 max_fails=5 fail_timeout=10s weight=1;
    }
}
```

然而，集群模式下的悲观锁不在同一个 JVM 实例中，锁不住。具体来说，线程通过锁监视器判断是否有锁，而每个 JVM 用的都是自己独立的锁监视器，因此每个 JVM 都会有一个线程畅通无阻，这就又导致了并发安全问题。

要解决集群模式下的并发安全问题，需要用到跨进程的分布式锁。要有一个能让每个 JVM 都能看到的锁监视器，这点 MySQL、Redis 和 Zookeeper 都能做到。

> [!note] 分布式锁
>
> 分布式锁就是满足分布式系统或集群模式下多进程可见并且互斥的锁。一个基本的分布式锁需要满足多进程可见、互斥、高可用、高性能和安全性的要求。

| 分布式锁 | MySQL                  | Redis              | Zookeeper                  |
| :------: | ---------------------- | ------------------ | -------------------------- |
|   互斥   | MySQL 本身的互斥锁机制 | `SETNX` 互斥命令   | 节点的唯一性和有序性       |
|  高可用  | 好，支持主从           | 好，支持主从和集群 | 好，支持集群               |
|  高性能  | 一般                   | 好                 | 一般，要求强一致性         |
|  安全性  | 断开连接自动释放       | TTL 超时释放机制   | 临时节点，断开连接自动释放 |

Redis 实现分布式锁：

- 获取锁：`SET lock thread1 NX EX 10`（要保证原子性，不能拆成 `SETNX` 和 `EXPIRE` 作两步走）
- 释放锁：`DEL lock` 或超时释放

> [!tip] 互斥锁的三种实现方式
> 
> 互斥锁有三种实现方式，一种是阻塞式的，拿不到锁就睡眠等待；一种是自旋式的，拿不到锁就繁忙等待；一种是非阻塞式的（尝试锁），拿不到锁就直接返回失败。为实现简单、节省 CPU 资源，本例采用非阻塞式。

### 辨析超卖和一人一单的技术选型

> [!note] 为什么超卖问题用乐观锁，一人一单问题用悲观锁？
>
> 超卖问题是更新操作，一人一单问题是插入操作。乐观锁无论是版本号法还是 CAS 法，都是比较现有的数据跟请求的数据是否冲突，因此适合更新操作；而悲观锁则不需要考虑比较的问题，它只是单纯地不让线程并发地执行。
>
> - 更新操作极快，冲突重试代价小（重试容易成功），用乐观锁可避免线程挂起，导致长时间未响应。同时乐观锁保证最终一致性，不追求强一致性，恰好适合超卖场景。
> - 插入操作虽然也可以用数据库的唯一约束来做（就是把用户 id 和订单 id 放在一起作为唯一键），但是为了防止大量请求穿透到数据库导致抛出唯一约束异常，然后又要麻烦业务层处理，直接在业务入口加悲观锁（如分布式锁）做流量管控更为常见。
> - 实际上，数据库的唯一约束基于数据库的行锁，这个行锁也是一种悲观锁。
