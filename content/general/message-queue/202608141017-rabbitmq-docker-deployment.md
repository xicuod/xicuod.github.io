---
weight: 202608141017
slug: rabbitmq-docker-deployment
title: RabbitMQ在Docker部署
---

在docker compose中配置rabbitmq：

```yml
name: xm-infra

networks:
  xmnet:
    name: xmnet
    driver: bridge

services:
  xm-mq:
    image: rabbitmq:3.8-management
    container_name: xm-mq
    restart: always
    ports:
      - 15672:15672
      - 5672:5672
    environment:
      - RABBITMQ_DEFAULT_USER=mq
      - RABBITMQ_DEFAULT_PASS=mq
    volumes:
      - ./rabbitmq/plugins:/plugins
    healthcheck:
      test: ["CMD", "/opt/rabbitmq/sbin/rabbitmqctl", "node_health_check"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - xmnet
```

## 参见

- [Linux程序退出码以及它在docker compose健康检查中的应用-系错博客](https://blog.xicuodev.top/linux-exit-code-and-application-in-docker/ "Linux程序退出码以及它在docker compose健康检查中的应用-系错博客")
