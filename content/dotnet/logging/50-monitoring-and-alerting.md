---
weight: 50
title: .NET日志(5)：监控与告警
slug: dotnet-logging-monitoring-and-alerting
---

监控涉及系统中的事件或指标，并基于这些数据采取行动，主要目的是为了及时发现并告警系统异常、性能瓶颈或业务逻辑问题。任何停机、任何严重错误、任何 95% 的性能下降等问题，都能基于基于推送至某一平台的日志非常容易地检测到，每个具备一定监控能力的平台都会有自己的**告警系统**。

在 Application Insights 中，监视器 (Monitor)- 告警 (Alerts) 允许用户基于日志数据创建监控规则，并在满足特定条件时触发告警通知。告警规则可以基于各种指标和日志查询来定义，例如响应时间、错误率、请求数量等。

![Application Insights 告警](https://img.xicuodev.top/2026/02/53295d203cdee3802f9cfc6a4e85ffcf.webp "Application Insights 告警")
