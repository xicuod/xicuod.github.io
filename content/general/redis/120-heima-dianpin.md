---
weight: 120
slug: heima-dianpin
title: 《黑马点评》项目笔记
---

## 遇到的问题及其原因和解决方案

### CORS 跨域问题

现象：前端请求后端接口时，后端 `request.getHeader("authorization")` 始终返回 `null`，导致 401 未登录。

根本原因：`LoginInterceptor` 拦截器没有放行 `OPTIONS` 预检请求，导致浏览器 CORS 预检失败，真正的请求（携带 `authorization`
header）根本没有发送。`OPTIONS` 请求是“无辜”的，它只是来问“服务器允许跨域吗”，却被拦截器当成了未登录请求拦下。

#### 原理：CORS 跨域机制

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

#### 解决方案：反向代理或 Spring CORS 配置

让运维同学在 Nginx 上配置**反向代理**，把前端名义上的 `80` 请求代理到后端实际上的 `8081`，这样浏览器就不认为前端的请求跨域了。

```{filename="nginx.conf"}
server {
    /* ... */
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
