---
weight: 120
slug: springboot-web-login
title: SpringBootWeb 用户登录
---

## 登录功能实现思路

- `Mapper` 层：`select * from user where uname = #{uname} and passwd = #{passwd}`
- `Service` 层：直接 `return`
- `Controller` 层：收到 `null` 返回失败 `Result`，收到 user 返回成功 `Result` (携带 `user`)

## 登录校验

登录校验确保用户在未登录情况下，不可以直接访问部门管理、员工管理等功能页面。

登录校验实现：统一拦截 + 登录标记。

- 登录标记：用户登录成功之后，每一次请求中，都可以获取到该标记。实现：会话技术。
- 统一拦截： [Web 过滤器]()、[Web 拦截器]()

![Web 登录校验](https://img.xicuodev.top/2026/03/895a8c84cbfed298f44970c9c600ca50.png "Web 登录校验")

### 会话技术

会话：用户打开浏览器访问 Web 服务器的资源时，会话建立；直到有一方断开连接时，会话结束。一次会话中可以包含多次请求和响应。

会话跟踪：一种维护浏览器状态的方法，服务器需要识别多次请求是否来自于同一浏览器，以便在同一次会话的多次请求间共享数据。

- 客户端会话跟踪技术：Cookie
  - HTTP 协议支持 Cookie 技术：请求头 Cookie、响应头 Set-Cookie
  - 一个 Cookie 是一个键值对 name=value，一次会话中可以有许多 Cookie，一次请求或响应也可以传递多个 Cookie
  - 如果响应数据中包含响应头 Set-Cookie，那么浏览器会自动存储这些 Cookie (`开发者工具-应用-存储-Cookie`)，浏览器的每次请求都会携带浏览器保存的该服务器地址的所有 Cookie 的请求头
  - Cookie 缺点：
    - 移动端 APP 无法使用 Cookie
    - 不安全，用户可以自己禁用 Cookie
    - Cookie 不能跨域
      - 跨域区分三个维度：协议、IP / 域名、端口，任何一个部分不同都是跨域

![Web 会话跟踪 - Cookie](https://img.xicuodev.top/2026/03/6c991df09dece93b000f1db1914e16ff.png "Web 会话跟踪 - Cookie")

- 服务端会话跟踪技术：Session
  - Cookie 只存 Session 的 id，数据都保存在服务端的 Session 对象中
  - Session 缺点：
    - 服务器集群环境下无法直接使用 Session
    - 包括 Cookie 的缺点

![Web 会话跟踪 - Session](https://img.xicuodev.top/2026/03/2200f9276e522bfe04a1d7e4ca44cd4e.png "Web 会话跟踪 - Session")

- 令牌技术：字符串，用户身份标识，还可以存储共享数据
  - 支持 PC 端、移动端
  - 解决集群环境下的认证问题
  - 减轻服务器端存储压力
  - 缺点：需要自己实现

### JWT 令牌

[JWT 令牌](https://jwt.io/) (JSON Web Token) 定义了一种简洁的、自包含的格式，用于在通信双方以 JSON 数据格式安全地传输信息。由于数字签名的存在，这些信息是可靠的。

JWT 组成：三个部分，每个部分用点分隔

- 第一部分：Header，令牌头，记录令牌类型、签名算法等，`{"alg":"HS256","typ":"JWT"}`
- 第二部分：Payload，有效载荷，携带一些自定义信息、默认信息等，`{"id": "1", "username": "Tom"}`
- 第三部分：Signature，签名，防止令牌被篡改，确保安全性。签名包括 header、payload 和 secret 密钥，通过指定签名算法加密计算而来，如果其中有任何一个内容与签名不符，那么令牌校验失败。
  - signature 是用 secret 密钥关联 header 和 payload 加密的，因此只要没有原来的 secret，就无法伪造篡改后的 header 和 payload 的 signature。

其中，JWT 的第一、二部分采用 Base64 编码。Base64 是一种基于 64 个可打印字符 `[A-Za-z0-9+/]` 来表示二进制数据的编码方式 (有长度规则，长度不符合的编码结果结尾用 `=` 补位)。

`pom.xml` 导入 JWT 的依赖包 `jjwt`：

```xml
<!--JWT令牌-->
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt</artifactId>
  <version>0.9.1</version>
</dependency>
<dependency>
  <groupId>javax.xml.bind</groupId>
  <artifactId>jaxb-api</artifactId>
  <version>2.3.1</version>
</dependency>
```

JWT 生成令牌：

```java
@Test
void testGetJwt() {
    Map<String, Object> claims = new HashMap<>();
    claims.put("name", "zhangsan");
    claims.put("age", 23);
    String jws = Jwts.builder()
            .signWith(SignatureAlgorithm.HS256, "xicuodev") //alg签名算法
            .setClaims(claims) //payload载荷
            .setExpiration(new Date(System.currentTimeMillis() + 3600 * 1000)) //有效期为1h
            .compact();//压制令牌
    System.out.println(jws);
}
```

JWT 解析令牌：

```java
@Test
void testParseJwt() {
    Claims claims = Jwts.parser()
            .setSigningKey("xicuodev")
            .parseClaimsJws("Your.Jwt.String")
            .getBody();
    System.out.println(claims);
}
```

- JWT 支持的加密算法：HS256、HS384、HS512、RS256、RS384、RS512、ES256、ES384、ES512、PS256、PS384、PS512
- JWT 校验时使用的签名密钥，必须和生成 JWT 令牌时使用的密钥是配套的。
- 如果 JWT 令牌解析校验时报错，则说明 JWT 令牌被篡改或失效，令牌非法。

JWT 应用场景：登录认证

- 登录成功后，生成令牌，并返回给前端，后续每个请求，都要携带 JWT 令牌，请求头为 `token`
- 在请求到达服务端后，对令牌统一拦截，校验令牌，令牌存在且合法才放行请求
- 特别地，对于登录请求，不校验 JWT 令牌，这是令牌的生成入口

![Web 登录校验流程图](https://img.xicuodev.top/2026/03/b0cc00a751d6b5bdcbf8506dbfc9807f.png "Web 登录校验流程图")
