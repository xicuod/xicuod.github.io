---
weight: 100
slug: springboot-web-file-uploading
title: SpringBootWeb 文件上传
---

文件上传是将本地图片、视频、音频等文件上传到服务器，供其他用户浏览或下载的过程。文件上传在项目中应用非常广泛，我们经常发微博、发微信朋友圈都用到了文件上传功能。

## 前端请求文件上传

在 `form` 表单元素中使用 `type` 为 `file` 的 `input` 输入元素，并设置表单的 `action` 请求路径属性为 `/upload`，`method` 请求方式属性为 `post`，`enctype` 编码类型属性为 `multipart/form-data` (用于文件上传，默认为 `application/x-www-form-urlencoded`，这种编码类型只会提交 URL 编码后的文件名)

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  姓名：<input type="text" name="filename"><br>
  头像：<input type="file" name="file"><br>
  <input type="submit" value="提交">
</form>
```

- `application/x-www-form-urlencoded` 的请求

  - 请求头的 `Content-Type`：`application/x-www-form-urlencoded`
  - 请求体（请求有效载荷）`payload`：`key1=value1&key2=value2&file1=filename1`

- `multipart/form-data` 的请求：

  - 请求头的 `Content-Type`：`multipart/form-data; boundary=---WebKitFormBoundaryikBA0fetvL7lG7DA` (浏览器自动生成的表单项分隔符)

  - 请求体 `payload`：

    ```
    ------WebKitFormBoundaryikBA0fetvL7lG7DA
    Content-Disposition: form-data; name="filename"
		
    vue.png
    ------WebKitFormBoundaryikBA0fetvL7lG7DA
    Content-Disposition: form-data; name="file"; filename="vue.png"
    Content-Type: image/png
		
    (Chrome不显示二进制数据)
    ------WebKitFormBoundaryikBA0fetvL7lG7DA--
    ```

## 后端响应文件上传

定义一个 `UploadController` 类，响应方法的参数名要与前端表单项的 `name` 属性值保持一致。

```java
@RestController
public class UploadController {
  @PostMapping("/upload")
  public Result upload(String filename, MultipartFile file) {
  	return Result.success();
  }
}
```

`MultipartFile` 接收到的数据首先会保存为临时文件，每个表单项存一个临时文件，响应结束后自动删除。要持久的保存文件，需要使用存储方案，包括本地存储和 OSS 存储。

- 本地存储：服务端接收到前端上传的文件之后，将文件存储在本地服务器磁盘中。

  - `MultipartFile` 方法：

    - `transferTo(File dest)`：保存文件到本地磁盘，要使用绝对路径，且不要存到部署目录下
    - `String getOriginalFilename()`：获取原始文件名
    - `void transferTo(File dest)`：将接收的文件转存到磁盘文件中
    - `long getSize()`：获取文件的大小，单位：字节
    - `byte[] getBytes()`：获取文件内容的字节数组
    - `InputStream getInputStream()`：获取接收到的文件内容的输入流

  - 使用 UUID 通用唯一识别码重命名文件，防止重名文件覆盖旧文件

    ```java
    String randomFilename = UUID.randomUUID() + file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
    ```

  - 在 Spring Boot 中，文件上传的默认单个文件允许最大大小为 1M。如果需要上传大文件，可以进行如下配置：

    ```properties
    #配置单个文件最大上传大小
    spring.servlet.multipart.max-file-size=10MB
    #配置单个请求最大上传大小(一次请求可以上传多个文件，为它们的总大小)
    spring.servlet.multipart.max-request-size=100MB
    ```

  - 本地存储的弊端：

    - 前端无法直接访问，不能传递需要回访的文件
    - 服务器磁盘容量有限，且倘若磁盘坏了，数据会全部丢失

- FastDFS 分布式存储、MinIO 对象存储服务集群

- OSS 存储云服务：阿里云 OSS

## 使用阿里云 OSS 对象存储服务

阿里云是阿里巴巴集团旗下全球领先的云计算公司，也是国内最大的云服务提供商。阿里云对象存储 (OSS, Object Storage Service) 是一款海量、安全、低成本、高可靠的云存储服务。使用 OSS，您可以通过网络随时存储和调用包括文本、图片、音频和视频等在内的各种文件。

使用第三方服务的通用思路：准备工作、参照官方 SDK 编写入门程序、集成使用

- SDK (Software Development Kit, 软件开发工具包)：辅助软件开发的依赖 (jar 包)、代码示例等，都可以叫做 SDK。

使用阿里云 OSS 的准备工作：

1. 注册阿里云 (实名认证)
2. 充值
3. 开通对象存储服务 (OSS)
4. 创建 bucket：bucket (存储桶) 是用户用于存储对象 (object，文件对象) 的容器，所有的对象都必须隶属于某个存储桶。
1. 获取 `AccessKey` (ID，用户名) 和 `SecretKey` (秘钥，密码)
