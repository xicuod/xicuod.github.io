---
weight: 202608161101
slug: advanced-rabbitmq
title: RabbitMQ高级：可靠性和顺序性
---

## 消息可靠性问题

### 发送者的可靠性

发送者的可靠性措施包括发送者重连和发送者确认。发送者重连关注的是发送者与 MQ 是否连接成功，发送者确认关注的是发送者发送的消息是否能到达 MQ。

#### 发送者重连

发送者重连：有的时候由于网络波动，可能会出现发送者连接MQ失败的情况。通过配置我们可以开启连接失败后的重连机制。发送者重连可以确保发送者对MQ连接的可靠性。

```yml
spring:
  rabbitmq:
    connection-timeout: 1s # 设置MQ的连接超时时间
    template:
      retry:
        enabled: true # 开启超时重试机制
        initial-interval: 1000ms # 失败后的初始等待时间
        multiplier: 1 # 失败后下次的等待时长倍数，下次等待时长 = initial-interval * multiplier^(attempts-1)
        max-attempts: 3 # 最大重试次数
```

当网络不稳定的时候，利用重试机制可以有效提高消息发送的成功率。不过Spring AMQP提供的重试机制是**阻塞式**的重试，也就是说多次重试等待的过程中，当前线程是被阻塞的，会影响业务性能。如果对于业务性能有要求，建议**禁用**重试机制。

如果一定要使用，请**合理配置**等待时长和重试次数，当然也可以考虑使用**异步线程**来执行发送消息的代码。重试机制是不适合放在“一寸光阴一寸金”的同步流程中的。

#### 发送者确认

Spring AMQP提供了 **Publisher Confirm** 和 **Publisher Return** 两种确认机制，由这两种机制共同完成发送者确认。开启确机制认后，当发送者发送消息给MQ后，MQ会通过Publisher Confirm机制返回确认结果（ACK或NACK）给发送者，并通过Publisher Return机制返回具体处理结果（replyCode和replyText）。也就是说：publisher confirm 是收没收到，publisher return 是收到之后的处理状况。发送者确认中mq返回的结果有以下几种情况：

- 消息投递到了MQ，但是路由失败。此时会通过 **Publisher Return** 返回路由异常原因，然后返回ACK[^1]，以表达投递成功但路由失败的语义。
- 临时消息投递到了MQ，并且入队成功[^2]，返回ACK，告知投递成功。
- 持久消息投递到了MQ，并且入队完成持久化[^3]，返回ACK，告知投递成功。
- 其它情况都会返回**NACK**，告知投递失败。

[^1]: 消息发是发到了，但是路由失败，这个一般是程序员没能处理好交换机和队列的绑定的原因，与MQ无关，MQ是完整接收到发送者投递的消息的，所以返回ACK没有问题。况且路由失败的情况下，MQ 还会通过 Publisher Return 返回给发送者路由异常原因，发送者并不会被蒙在鼓里。
[^2]: 临时消息（non-durable message）保存到内存当中即可，不需要持久化，因此入队成功就算投递成功。
[^3]: 所以持久消息就是比临时消息多了一步持久化。

![发送者确认](https://img.xicuodev.top/2026/08/588f82541c1e47b531437fd4e1b048da.webp)
