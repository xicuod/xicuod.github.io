---
weight: 600
slug: java-dynamic-proxy
title: Java 动态代理
---

**动态代理**可以无侵入式地给代码增加额外的功能。

- 侵入式修改：直接修改原有代码的内部逻辑。侵入式修改容易造成“牵一发而动全身”的 bug，因此需要采用动态代理。
- 代理：对象如果嫌身上干的事太多，那么可以通过代理来转移部分职责。
- 对象有什么方法需要代理，代理就一定要有对应的方法，它们在底层要调用原来的方法。
- 通过接口约定需要代理的方法。

`java.lang.reflectProxy`：提供了为对象产生代理对象的方法

- `static Object newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)`
  - `loader` 参数：用于指定用哪个类加载器，去加载生成的代理类
  - `interfaces` 参数：指定接口，这些接口用于指定生成的代理长什么，也就是有哪些方法
  - `h` 参数：用来指定生成的代理对象要干什么事情

- `InvocationHandler` 是个函数式接口，需要实现它的抽象方法 `Object invoke(object proxy, Method method, Object[] args)`
  - `proxy` 参数：代理对象
  - `method` 参数：被代理的方法
  - `args` 参数：调用被代理的方法时，传递的实参
