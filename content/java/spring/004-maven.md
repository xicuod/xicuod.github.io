---
weight: 4
slug: maven
title: Maven 
---

Maven 是 Apache 旗下的一个开源项目，是一款用于管理和构建 Java 项目的工具。Maven 基于项目对象模型 (POM, Project Object Model) 的概念，通过一小段描述信息来管理项目的构建。

- Apache 软件基金会：成立于 1999 年 7 月，是自前世界上最大的最受欢迎的开源软件基金会，也是一个专门为支持开源项目而生的非盈利性组织。Apache 旗下的开源项目见[这里](https://www.apache.org/index.html#projects-list)。

Maven 作用：

- 方便的依赖管理：方便快捷的管理项目依赖的资源 = jar 包，避免版本冲突问题
- 统一的项目结构：提供跨 IDE (eclipse、Myelipse 10、IntelliJ IDEA) 的标准、统一的项目结构
- 标准的项目构建：标准跨平台 (Linux、Windows、macOS) 的自动化项目构建方式，清理、编译、测试、打包、发布

![Maven 体系结构](https://img.xicuodev.top/2026/03/f83ca400d675a959826308e5db62303f.png "Maven 体系结构")

## Maven 的安装和配置

手动安装：

1. 解压 `apache-maven-3.6.1-bin.zip`

2. 配置本地仓库：修改 `conf\settings.xml` 中的 `<localRepository>` 为一个指定目录，通常是安装目录下的 `mvn_repo`

   ```xml
   <localRepository>path/to/apache-maven-3.6.1/mvn_repo</localRepository>
   ```

3. 配置阿里云私服：修改 `conf\settings.xml` 中的 `<mirrors>` 标签，为其添加如下 `<mirror>` 子标签：

   ```xml
   <mirror>
     <id>alimaven</id>
     <name>aliyun maven</name>
     <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
     <mirrorOf>central</mirrorOf>
   </mirror>
   ```

4. 配置环境变量：MAVEN\_HOME 为 maven 的安装目录，并将 `%MAVEN_HOME%\bin` 目录加入 PATH 环境变量

5. 测试安装成败：`mvn -v`

IDE 安装：

- 新版的 IntelliJ IDEA 自带 Maven 环境，新建项目或模块时选择`新建项目-构建系统-Maven` 即可
- 配置自动下载依赖：`设置-构建、执行、部署-构建工具-Maven-正在导入(导入的动名词，翻译有误)-自动下载`

## Maven 仓库

Maven 仓库：用于存储资源，管理各种 jar 包。

- 本地仓库：自己计算机上的一个目录。
- [中央仓库](https://repo1.maven.org/maven2/)：由 Maven 团队维护的全球唯一的仓库。
- 远程仓库 (私服)：一般由公司团队搭建的私有仓库，包括公开的镜像仓库。

Maven 查找 jar 包的顺序：本地仓库 - 远程仓库 - 中央仓库

## Maven 项目结构

- `src/`
  - `main/` 实际项目资源
    - `java/`  java 源代码目录
    - `resources/` 配置文件目录
  - `test/` 测试项目资源
    - `java/`
    - `resources/`
- `pom.xml` 项目配置文件

## Maven 生命周期

Maven 的生命周期就是对所有的 maven 项目构建过程的抽象和统一。

Maven 中有 3 套相互独立的生命周期：

- clean：清理工作。
- default：核心工作，如编译 compile、测试 test、打包 package、安装 install、部署 deploy 等。
- site：生成报告、发布站点等。

每套生命周期细分为若干个阶段，同一生命周期内，各阶段按顺序执行，后一个阶段依赖于前一个阶段，执行一个阶段的脚本会先执行前面的所有阶段，再执行该阶段：

![Maven 生命周期](https://img.xicuodev.top/2026/03/1b8f7a69a70eb70dac7ab41687d70211.png "Maven 生命周期")

clean 生命周期：

- clean 阶段：移除上一次构建生成的文件

default 生命周期：

- compile 阶段：编译项目源代码
- test 阶段：使用合适的单元测试框架运行测试 (junit)
- package 阶段：将编译后的文件打包，如 jar、war 等
- install 阶段：安装项目到本地仓库

执行 maven 生命周期阶段：

- 命令行执行到指定阶段：`mvn 阶段名`
- IDEA 执行到指定阶段：右侧 maven 面板 - 指定 maven 项目 - 生存期 - 指定阶段
- IDEA 跳过测试阶段：右侧 maven 面板 - 上方工具栏 - 切换 “跳过测试” 模式

maven 的生命周期阶段是抽象的，具体的工作都是由相应的插件 jar 包完成的。

## Maven 依赖管理

### pom.xml 依赖管理

依赖是当前项目运行所需要的 jar 包，一个项目中可以引入多个依赖。

- 项目本身属性 = Maven 坐标：唯一标识、定位

  - `<groupId>`：组织 ID

  - `<artifactId>`：模块 = 工件 ID

  - `<version>`：版本号

- `<dependencies>` 依赖的模块：

  - `<dependency>` 一项依赖，里面写依赖的模块的 Maven 坐标

在 IntelliJ IDEA 中编辑 `pom.xml` 修改依赖后，要点击编辑区域右上角浮动的刷新按钮，引入最新加入的坐标。

### Maven 坐标

Maven 坐标是资源的唯一标识，通过该坐标可以唯一定位资源位置。使用 Maven 坐标来定义项目或引入项目中需要的依赖。

- groupId：定义当前 Maven 项目隶属组织名称 (通常是域名反写，例如 com.itheima)
- artifactId：定义当前 Maven 项目名称 (通常是模块名称，例如 order-service、goods-service)
- version：定义当前项目版本号

如果不知道依赖的坐标信息，可以到 [mvnrepository](https://mvnrepository.com/) 搜索。

### 依赖传递

依赖具有传递性。

- 直接依赖：在当前项目中通过依赖配置建立的依赖关系
- 间接依赖：被依赖的资源如果依赖其他资源，当前项目间接依赖其他资源

![Maven 依赖传递](https://img.xicuodev.top/2026/03/dcc74493905ccf2d6760b9e1a86961df.png "Maven 依赖传递")

排除依赖：主动断开依赖的资源，被排除的资源无需指定版本

```xml
<dependency>
  <groupld>com.itheima</groupld>
  <artifactld>maven-projectB</artifactld>
  <version>1.0-SNAPSHOT</version>
  <exclusions>
    <exclusion>
      <groupld>junit</groupld>
      <artifactld>junit</artifactld>
    </exclusion>
  </exclusions>
</dependency>
```

### 依赖范围

项目依赖的 jar 包默认情况下可以在任何地方使用，但可以通过 `<scope>` 设置其作用范围。

作用范围：

- 主程序范围有效：main 文件夹范围内
- 测试程序范围有效：test 文件夹范围内
- 是否参与打包运行：package 指令范围内

| scope 值       | 主程序 | 测试程序 | 打包 (运行) | 范例        |
| -------------- | ------ | -------- | ----------- | ----------- |
| compile (默认) | \[o]   | \[o]     | \[o]        | log4j       |
| test           | \[x]   | \[o]     | \[x]        | junit       |
| provided       | \[o]   | \[o]     | \[x]        | servlet-api |
| runtime        | \[x]   | \[o]     | \[o]        | jdbc 驱动   |
