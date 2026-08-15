---
weight: 202608151230
slug: rabbitmq-java-client-spring-amqp
title: RabbitMQ的Java客户端：Spring AMQP
---

RabbitMQ 采用 AMQP 协议，因此可以直接使用 Spring AMQP 框架作为 RabbitMQ 的 java 客户端。

## 引入依赖

在父工程中引入 spring-amqp 依赖，这样 publisher 和 consumer 服务都可以使用：

```xml
<!-- AMQP依赖，包含RabbitMQ -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

> consumer、publisher 两个微服务都要引入。

## application.yml 配置服务端

在每个微服务中引入 MQ 服务端信息，这样微服务才能连接到 RabbitMQ：

```yaml
spring:
  rabbitmq:
    host: 192.168.150.101 # 主机名
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123 # 密码
```

> consumer、publisher 两个微服务都要配置。

## 发送消息（生产者）

SpringAMQP 提供了 RabbitTemplate 工具类，方便我们发送消息。RabbitTemplate 实例方法 `convertAndSend()` 发送消息，类似 RedisTemplate。

```java
@Autowired
private RabbitTemplate rabbitTemplate;

@Test
public void testSimpleQueue() {
    // 队列名称
    String queueName = "simple.queue";
    // 消息
    String message = "hello, Spring AMQP!";
    // 发送消息
    rabbitTemplate.convertAndSend(queueName, message);
}
```

## 接收消息（消费者）

Spring AMQP 提供声明式的消息监听，我们只需要通过注解在方法上声明要监听的队列名称，将来 Spring AMQP 就会把消息传递给当前方法。`@RabbitListener` 参数：queues 是个数组，指定监听哪些队列。

```java
@Slf4j
@Component
public class SpringRabbitListener {

    @RabbitListener(queues = "simple.queue")
    public void listenSimpleQueueMessage(String msg) throws InterruptedException {
        log.info("spring 消费者接收到消息：【" + msg + "】");
    }
}
```

接受者收到消息：

```
03-08 18:54:32:323 INFO 66772 --- [main] c.itheima.consumer.ConsumerApplication : Started ConsumerApplication in 1.413 seconds (JVM running for 2.79)
03-08 18:54:52:091 INFO 66772 --- [ntContainer#0-1] c.i.consumer.mq.SpringRabbitListener : 监听到simple.queue的消息：【hello, Spring AMQP!】
```

## Work Queues 任务模型（工作队列）

Work queues，任务模型。简单来说就是让多个消费者绑定到一个队列，共同消费队列中的消息。多个消费者绑定同一个队列，这个队列就是 Work Queue。

![工作队列](https://img.xicuodev.top/2026/08/713d5bc621dfdb8dcc8c5d8d6e85c7a9.webp)

发送者写法：连发 50 条消息。

```java
@Test
public void testWorkQueue() {
    // 1. 队列名
    String queueName = "work.queue";
    for (int i = 1; i <= 50; i++) {
        // 2. 消息
        String message = "hello, Spring AMQP_" + i;
        // 3. 发送消息
        rabbitTemplate.convertAndSend(queueName, message);
    }
}
```

消费者写法：两个方法的注解的 queues 参数都包含 work.queue。

```java
@RabbitListener(queues = "work.queue")
public void listenWorkQueue1(String message) {
    System.out.println("消费者1接收到消息：" + message + "，" + LocalTime.now());
}

@RabbitListener(queues = "work.queue")
public void listenWorkQueue2(String message) {
    System.out.println("消费者2接收到消息：" + message + "，" + LocalTime.now());
}
```

消费者 2 消费的消息编号为 1 3 5 7 9...

```
消费者2接收到消息：hello, Spring AMQP_1, 18:12:55.207907400
消费者2接收到消息：hello, Spring AMQP_3, 18:12:55.209396
消费者2接收到消息：hello, Spring AMQP_5, 18:12:55.209396
消费者2接收到消息：hello, Spring AMQP_7, 18:12:55.209892900
消费者2接收到消息：hello, Spring AMQP_9, 18:12:55.209892900
消费者2接收到消息：hello, Spring AMQP_11, 18:12:55.209892900
消费者2接收到消息：hello, Spring AMQP_13, 18:12:55.211875500
消费者2接收到消息：hello, Spring AMQP_15, 18:12:55.211875500
消费者2接收到消息：hello, Spring AMQP_17, 18:12:55.212371800
消费者2接收到消息：hello, Spring AMQP_19, 18:12:55.212371800
```

消费者 1 消费的消息编号为 2 4 6 8 10...

```
消费者1接收到消息：hello, Spring AMQP_2, 18:12:55.209396
消费者1接收到消息：hello, Spring AMQP_4, 18:12:55.209396
消费者1接收到消息：hello, Spring AMQP_6, 18:12:55.209892900
消费者1接收到消息：hello, Spring AMQP_8, 18:12:55.209892900
消费者1接收到消息：hello, Spring AMQP_10, 18:12:55.210387700
消费者1接收到消息：hello, Spring AMQP_12, 18:12:55.211875500
消费者1接收到消息：hello, Spring AMQP_14, 18:12:55.212371800
消费者1接收到消息：hello, Spring AMQP_16, 18:12:55.212371800
```

**结论**：两个消费者绑定同一个消息队列，消息不会被两个消费者同时处理，而是轮流处理。

**总结 Work Queues 作用**：人多力量大，多个消费者可以分摊消息处理任务，并发处理，提高效率。

**注意**：实际开发不会同一个实例写两个方法消费消息，这样并没有分摊，没有意义；正确做法是部署多个实例，绑定同一队列。

### 消费者消息推送限制（能者多劳）

**问题**：不同机器配置性能有差异，不能平均分配。

**解决**：消费者消息推送限制，避免消息堆积，按"能者多劳"分配。rabbitmq 默认轮询平均分配，需要配置 `prefetch: 1`，每次都等这一条消息处理完再发下一条，处理快的人自然拿得多。

默认情况下，RabbitMQ 会将消息依次轮询投递给绑定在队列上的每一个消费者，但这并没有考虑到消费者是否已经处理完消息，可能出现消息堆积。因此需要修改 application.yml，设置 prefetch 值为 1，确保同一时刻最多投递给消费者 1 条消息：

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息
```

## Fanout 交换机

交换机的作用主要是接收发送者发送的消息，并将消息路由到与其绑定的队列。

![Fanout交换机](https://img.xicuodev.top/2026/08/09157864b9c4e473d128d86e07cdcb05.webp)

Fanout 交换机是广播模式，例如下单需要同时通知交易服务、短信服务、积分服务等。Fanout Exchange 会将接收到的消息路由到每一个跟其绑定的 queue，所以也叫广播模式。

![Fanout广播模式](https://img.xicuodev.top/2026/08/5c414b48a8702ad2227a171cd867f714.webp)

发送方：`convertAndSend` 三个参数的重载是发送给交换机的（上面的两个参数的重载是直接发给队列的）。

```java
@Test
public void testFanoutExchange() {
    // 交换机名称
    String exchangeName = "itcast.fanout";
    // 消息
    String message = "hello, everyone!";
    // 发送消息，参数分别是：交换机名称、RoutingKey（暂时为空）、消息
    rabbitTemplate.convertAndSend(exchangeName, "", message);
}
```

第二个参数 routingKey 留空，写空字符串 `""` 或 null：

```java
rabbitTemplate.convertAndSend(exchangeName, null, message);
```

## Direct 交换机

Direct 交换机是定向路由。交换机绑定队列时需指定队列的 BindingKey（可以是多个），消息发送到交换机时需指定消息的 RoutingKey；两个 key 要一样，从而能把消息路由到对应队列（可以是多个，这意味着它们对该交换机有着相同的 BindingKey）。

- Direct Exchange 会将接收到的消息根据规则路由到指定的 Queue，因此称为定向路由。
- 每一个 Queue 都与 Exchange 设置一个 BindingKey。
- 发布者发送消息时，指定消息的 RoutingKey。
- Exchange 将消息路由到 BindingKey 与消息 RoutingKey 一致的队列。

![Direct交换机](https://img.xicuodev.top/2026/08/773c0b21742e0209052dc78d19adc69f.webp)

## Topic 交换机

TopicExchange 也是基于 RoutingKey 做消息路由，但是 routingKey 通常是多个单词的组合，并且以 `.` 分割。Topic 交换机后面的队列支持用 BindingKey + 通配符订阅一个"话题"的消息，即一系列 RoutingKey。

- `#`：代指 0 个或多个单词
- `*`：代指一个单词

![Topic交换机通配符](https://img.xicuodev.top/2026/08/2773fa310e3ef81dd13dd672619c2d86.webp)

**优势**：拓展性更强；简化对 BindingKey 的配置。
**缺点**：字符串匹配性能上稍有影响。

## 代码创建队列和交换机

通过代码创建队列交换机：Queue 接口、Exchange 接口、Binding 接口。

SpringAMQP 提供了几个类，用来声明队列、交换机及其绑定关系：

- `Queue`：用于声明队列，可以用工厂类 QueueBuilder 构建
- `Exchange`：用于声明交换机，可以用工厂类 ExchangeBuilder 构建
- `Binding`：用于声明队列和交换机的绑定关系，可以用工厂类 BindingBuilder 构建

Exchange接口继承树：

![Exchange接口继承树](https://img.xicuodev.top/2026/08/6d27156ba45ca685849dc5d9f7eff295.webp)

### Spring Bean 方式【简易】

通过 Spring 配置类 + Spring Bean 准备 Exchange 交换机实例和 Queue 队列实例，并准备 Binding 实例将队列与交换机绑定：

```java
@Configuration
public class FanoutConfig {

    // 声明FanoutExchange交换机
    @Bean
    public FanoutExchange fanoutExchange() {
        return new FanoutExchange("hmall.fanout");
    }

    // 声明第1个队列
    @Bean
    public Queue fanoutQueue1() {
        return new Queue("fanout.queue1");
    }

    // 绑定队列1和交换机
    @Bean
    public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    // 略，以相同方式声明第2个队列，并完成绑定
}
```

构建 Binding 的写法：`BindingBuilder.bind(queue).to(exchange)`。

**【推荐】用 Builder 方式构建交换机和队列的实例**：语义化、规范化。

```java
@Configuration
public class FanoutConfig {

    // 声明FanoutExchange交换机
    @Bean
    public FanoutExchange fanoutExchange() {
        return ExchangeBuilder
                .fanoutExchange("hmall.fanout").build();
    }

    // 声明第1个队列
    @Bean
    public Queue fanoutQueue1() {
        return QueueBuilder.durable("fanout.queue1").build();
    }
}
```

durable 是持久化的，使用它创建的队列的数据会持久化到硬盘。

### @RabbitListener 注解方式【推荐】

对于一个队列绑定多个 RoutingKey 的情况，BindingBuilder 提供的 with 方法只能绑定一个 RoutingKey，不好使。因此如果用 Bean 的方式，会写一堆重复代码：

```java
@Bean
public Binding directQueue1BindingRed(Queue directQueue1, DirectExchange directExchange) {
    return BindingBuilder.bind(directQueue1).to(directExchange).with("red");
}

@Bean
public Binding directQueue1BindingBlue(Queue directQueue1, DirectExchange directExchange) {
    return BindingBuilder.bind(directQueue1).to(directExchange).with("blue");
}
```

`@RabbitListener` 一个注解即可一口气完成队列、交换机和绑定的声明，还支持多个 RoutingKey：

```java
@RabbitListener(bindings = @QueueBinding(
        value = @Queue(name = "direct.queue1"),
        exchange = @Exchange(name = "itcast.direct", type = ExchangeTypes.DIRECT),
        key = {"red", "blue"}
))
public void listenDirectQueue1(String msg) {
    System.out.println("消费者1接收到Direct消息：【" + msg + "】");
}
```

## 消息转换器

`rabbitTemplate.convertAndSend(exchangeName, routingKey, message)` 中的第三个参数 message 是 Object 类型，即消息可以是任意 Java 对象。消息转换器用于转换这些对象为适合 RabbitMQ 的字节序列。

例如，发送一个 HashMap 类型的消息：

```java
// 1. 准备消息
Map<String, Object> msg = new HashMap<>(2);
msg.put("name", "Jack");
msg.put("age", 21);
// 2. 发送消息
rabbitTemplate.convertAndSend("object.queue", msg);
```

rabbitmq web 控制台看到如下消息内容，content_type 标识消息内容的类型，本例就是 application/x-java-serialized-object：

![RabbitMQ-Web控制台消息内容-JDK序列化](https://img.xicuodev.top/2026/08/2ccbfe47a363717950860295e85f1c48.webp)

Spring AMQP 默认采用 jdk 自带的序列化器，内部调用 MessageConverter 接口的 createMessage 方法，基于作为消息传入的 Object 创建 Message 实例。如果传入的消息实例实现了 Serializable 接口，那么调用 SerializationUtils.serialize 方法，内部使用 ObjectOutputStream 对象输出流的 writeObject 序列化方法，即 JDK 默认序列化方法。

Spring 对消息对象的处理是由 `org.springframework.amqp.support.converter.MessageConverter` 来处理的，而默认实现是 SimpleMessageConverter，基于 JDK 的 ObjectOutputStream 完成序列化，存在下列问题：

- JDK 的序列化有安全风险
- JDK 序列化的消息太大
- JDK 序列化的消息可读性差

将 JDK 默认序列化改为 JSON 序列化，建议采用 JSON 序列化代替默认的 JDK 序列化，要做两件事情：

**1. 在 publisher 和 consumer 中都要引入 jackson 依赖：**

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

**2. 在 publisher 和 consumer 中都要配置 MessageConverter：**

```java
@Bean
public MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
}
```

一旦配置好 MessageConverter 的 Spring Bean，Spring Boot 会自动将其注入到 RabbitTemplate 实例中，从而底层方法将采用覆盖的 MessageConverter。rabbitmq web 控制台看到如下消息内容：

![RabbitMQ-Web控制台消息内容-JSON序列化](https://img.xicuodev.top/2026/08/2cd1bb7720463633e466de07e9774c9e.webp)

消费者也要配置 JSON 序列化器，Spring AMQP 会自动调用 JSON 反序列化器创建指定类型的消息实例：

```java
@RabbitListener(queues = "object.queue")
public void listenObjectQueue(Map<String, Object> msg) {
    log.info("消费者2监听到object.queue的消息：【{}】", msg);
}
```

消费者收到消息：

```
03-12 19:16:17:509 INFO 50604 --- [ntContainer#9-1] c.i.consumer... : 消费者2监听到 object.queue的消息：【{name=Jack, age=21}】
```
