---
weight: 5
slug: tomcat
title: Tomcat
---

[Tomcat](https://tomcat.apache.org/) 是 Apache 软件基金会一个核心项目，是一个开源免费的轻量级 Web 服务器，支持 Servlet、JSP 等少量 JavaEE 规范。

- JavaEE (Java Enterprise Edition, Java 企业版)：Java 企业级开发的技术规范总和，包含 13 项技术规范：JDBC、JNDI、EJB、RMI、JSP、Servlet、XML、JMS、Java IDL、JTS、JTA、JavaMail、JAF。

Tomcat 也称为 Web 容器、Servlet 容器。Servlet 程序需要依赖于 Tomcat 才能运行。

## Tomcat 维持会话

Tomcat 会自动把当前 HTTP 会话的 Session ID 通过 `Set-Cookie` 响应头字段传回客户端，来让客户端在多次无状态的 HTTP 通信中保持同一个 Session ID，实现了有状态的会话。Tomcat 默认使用维持会话状态的 Cookie 名称是 `JSESSIONID`。这是 Servlet 规范中维持会话状态的核心机制。

如果用户禁用了 Cookie，那么 Tomcat 会使用备选方案：**URL 重写**。Tomcat 会将会话 ID 直接附在请求的 URL 后面，如 `index.html;jsessionid=1234`。
