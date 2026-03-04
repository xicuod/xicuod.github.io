---
weight: 110
slug: springboot-configuration
title: SpringBoot 配置
---

如果把常量参数分散定义在各个类中，修改时定位繁琐，且每次改完都要重新编译，不便维护及管理。要解决这个问题，要把常量参数定义在 SpringBoot 配置文件 `application.properties` 中。

- `@Value` 注解：通常用于外部配置的属性注入，`@Value("${配置文件中的key}")` 写在字段上

## YML 配置文件

SpringBoot 也支持 YML 格式的配置文件，文件名 `application.yml` 或 `application.yaml`。若存在多份配置文件，优先级`.properties`>`.yml`>`.yaml`。虽然 springboot 支持多种格式配置文件，但是在项目开发时，推荐统一使用一种格式的配置 (yml 是主流)。

```yaml
server:
	port: 8080
	address: localhost
```

- XML：开始标签和结束标签，臃肿
- PROPERTIES：层级结构不清晰
- YML/YAML：简洁，以数据为中心

YML 基本语法：

- 大小写敏感

- 冒号后数值前必须有空格，作为分隔符

- 使用缩进表示层级关系，缩进时不允许使用 Tab 制表符，只能用空格 (IDEA 中会自动将 Tab 转换为空格)

- 缩进的空格个数不重要，只要相同层级的元素左侧对齐即可

- 用`#`来写注释，从这个字符一直到行尾，都会被解析器忽略

YML 定义对象、Map 集合：

```yaml
user:
	name: Tom
	age: 20
	address: 北京
```

YML 定义数组、List、Set 集合：

```yaml
hobby:
	- java
	- c/c++
	- c#
	- video game
```

## `@ConfigurationProperties` 注解

`@ConfigurationProperties` 注解可以取代 `@Value` 注解，设置 `prefix` 属性为配置项前缀，并保证配置项名与配置参数名一致。在 pom.xml 引入 `spring-boot-configuration-processor` 依赖来获取 `@ConfigurationProperties` 的自动补全支持，采用更惯用的烤串式配置项命名风格。

- `@ConfigurationProperties` 和 `@Value` 都是用来注入外部配置的属性的。
- `@Value` 注解只能一个一个的进行外部属性的注入，`@ConfigurationProperties` 可以批量的将外部的属性配置注入到 `bean` 对象的属性中。

```yaml
#七牛云OSS
qiniu:
  oss:
    #用户 bucket 绑定的下载域名【必须】
    endpoint: web-101.s3.cn-east-1.qiniucs.com
    #是否使用 https【必须】
    use-https: true
    #下载URL失效时间
    expire-in-seconds: 3600
    #鉴权的通行ID和通行密钥
    access-key-id: WyrMv-H4WPE-yM7N_0YFHtfbuhhRNmnYwSW-Ga-K
    access-key-secret: 3ocLWcmcHevchQqPs1DXpalrQHw-rns7lpNdLDPd
    #存储桶名
    bucket-name: web-101
```

```java
@Data
@Component
@ConfigurationProperties(prefix = "qiniu.oss")
public class QiniuOssProps {
		//    @Value("${qiniu.oss.accessKeyId}")
    private String accessKeyId;
    //    @Value("${qiniu.oss.accessKeySecret}")
    private String accessKeySecret;
		//    @Value("${qiniu.oss.bucketName}")
    private String bucketName;
		//    @Value("${qiniu.oss.endpoint}")
    private String endpoint;
		//    @Value("${qiniu.oss.useHttps}")
    private boolean useHttps;
		//    @Value("${qiniu.oss.expireInSeconds}")
    private long expireInSeconds;
}
```

## SpringBoot 的其他配置方式

SpringBoot 除了支持配置文件属性配置，还支持 Java 系统属性和命令行参数的方式配置属性，优先级 `Java系统属性` < `命令行参数` < `配置文件`，一般用于执行已打包的项目时更改配置。

- Java 系统属性 (虚拟机选项)：`-Dserver.port=9000`
- 命令行参数 (程序实参)：`--server.port=10010`

1. 执行 maven 打包指令 `package`
2. 执行 java 指令，运行 jar 包

   ```sh
   java -Dserver.port=9000 -jar tlias-web-management-0.0.1-SNAPSHOT.jar --server.port=10010
   ```

SpringBoot 项目打包时，需要在 `pom.xml` 的 `<plugins>` 标签下引入插件依赖 `spring-boot-maven-plugin` (基于官网骨架创建项目时，会自动添加该插件)。

> [!note] 我的排错案例：lombok “找不到符号”
>
> 我在用 maven 打包我的项目时，发现依赖 lombok 的符号都报 “找不到符号” 或 “无法将类中的构造器应用到给定类型”，一番查找发现是 lombok 的注解处理器没有配置正确，详见[这里](https://www.cnblogs.com/monsterbude/p/18420844)，注意修改 `<annotationProcessorPaths>` 中的 lombok 版本为自己使用的版本。
