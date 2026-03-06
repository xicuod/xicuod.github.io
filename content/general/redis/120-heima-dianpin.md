---
weight: 120
slug: heima-dianpin
title: 《黑马点评》项目笔记
---

## 遇到的问题及其原因和解决方案

### CORS 跨域问题

现象：前端请求后端接口时，后端 `request.getHeader("authorization")` 始终返回 `null`，导致 401 未登录。

根本原因：`LoginInterceptor` 拦截器没有放行 `OPTIONS` 预检请求，导致浏览器 CORS 预检失败，真正的请求（携带 `authorization`
header）根本没有发送。

原理：浏览器 CORS 机制：当跨域请求满足以下条件时，浏览器会先发送 `OPTIONS` 预检请求。

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

解决方案：

在 `LoginInterceptor.preHandle()` 中放行 `OPTIONS` 请求：

```java
@Override
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    // 放行 OPTIONS 预检请求
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
        return true;
    }
}
```

或者在 Nginx 中配置反向代理，把前端名义上的 `80` 请求代理到后端实际上的 `8081`，这样浏览器就不认为前端的请求跨域了。

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
> 代理的正反指的是代理本身的方向：反向代理就是把代理那一面朝向客户端，实际那一面朝向服务端；正向代理就是实际那一面朝向客户端，代理那一面朝向服务端。
> 
> 代理的那一面朝向一端，另一端就被代理服务器隐藏了，因为代理朝向的那一端只知道代理服务器的地址，不知道实际服务器的地址。
