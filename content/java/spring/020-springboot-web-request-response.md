---
weight: 20
slug: springboot-web-request-response
title: SpringBootWeb 请求响应
---

## Web 请求响应架构

- BS 架构 (Browser/Server, 浏览器 / 服务器架构模式)：客户端只需要浏览器，应用程序的逻辑和数据都存储在服务端。
- CS 架构 (Client/Server, 客户端 / 服务器架构模式)：客户端需要专门的客户端软件，开发、维护麻烦，体验不错。

## DispatcherServlet 请求响应类

![DispatcherServlet](https://img.xicuodev.top/2026/03/a39de72ce8d880ad8a59ab40610803b8.png "DispatcherServlet")

- `DispatcherServlet` 类：Spring Boot 底层的前端控制器，实现 Java EE `Servlet` 接口的请求响应规范
- `HttpServletRequest` 请求类：获取请求数据
- `HttpServletResponse` 响应类：设置响应数据
- 可以在 `@Component` 组件类中用 `@Autowired` 注入 `HttpServletRequest` 和 `HttpServletResponse` 依赖，来随时获取本次请求响应的请求数据和响应数据

## 前端发送请求参数：Postman

Postman 是一款功能强大的网页调试与模拟发送网页 HTTP 请求的软件，常用于进行接口测试。Postman 衍生有 Apipost、Apifox 等软件。

## 后端获取请求参数

原始方式：在原始的 web 程序中，获取请求参数，需要通过加了 `@ResponseBody` 注解的 `RequestController` 类的成员方法的参数中的 `HttpServletRequest` 对象手动获取。

```java
@RequestMapping("/simpleParam")
public String simpleParam(HttpServletRequest request) {
  String name = request.getParameter("name");
  String ageStr = request.getParameter("age");
  int age = Integer.parseInt(ageStr);
  System.out.println(name + ":" + age);
  return "OK";
}
```

Spring Boot 方式：

- 简单参数：参数名与形参变量名相同，定义形参即可接收参数。
  ```java
  @RequestMapping("/simpleParam")
  public String simpleParam(String name，Integer age) {
    System.out.println(name + ":" + age);
    return "OK";
  }
  ```
  - 如果方法形参名称与请求参数名称不匹配，可以使用 `@RequestParam` 完成映射。
  ```java
  @RequestParam(name="uname") String name
  ```
  - `@RequestParam` 中的 `required` 属性默认为 `true`，代表该请求参数必须传递，如果不传递将报错。如果该参数是可选的，可以将 `required` 属性设置为 `false`。
  ```java
  @RequestParam(name="uname", required = false) String name
  ```

- 实体 POJO 参数：
  - 简单实体对象：前端请求参数列表与后端响应方法形参对象属性列表相同，响应方法使用 POJO 类型参数接收，`?name=张三&age=23`，`响应方法头(User user)`，`User{String name, int age}`
  - 复杂实体对象 (对象套对象，对象有对象类型的属性)：前端请求参数中把对象类型的属性拆开来写，`?name=张三&address.province=湖北&address.city=武汉`，`响应方法头(User user)`，`User{String name, Address address}`，`Address{String province, String city}`

- 数组集合参数：多个同键的请求参数，响应方法用数组类型形参接收，如果是集合形参需要用 `@RequestParam` 绑定 POJO 参数关系，`?hobby=game&hobby=java`，`响应方法头(String[] hobby)`，`响应方法头(@RequestParam List<String> hobby)`

- 日期时间参数：使用 `@DateTimeFormat` 注解转换日期 POJO 参数格式，`@DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss") LocalDateTime updateTime`

- JSON 参数：JSON 数据需要放在 POST 请求的请求体中，且键列表与响应方法的形参对象属性列表相同，响应方法的 POJO 类型形参需要使用 `@RequestBody` 注解，`@RequestBody User user`

- 路径参数：通过请求 URL 直接传递参数 (域名和端口号后面直接跟路径参数)，响应方法的 `@RequestMapping` 注解的参数中使用 `{param}` 来标识路径参数，方法形参需要使用 `@PathVariable` 获取路径参数，`localhost:8080/path/1/homepage`，`@RequestMapping("/path/{id}/{pageName}")`，`@PathVariable Integer id, @ParhVariable String pageName`

## 后端响应数据

- `@ResponseBody` 响应体注解：把方法的返回值作为响应体响应，如果返回值类型是实体对象或集合，会转换为 JSON 格式再响应
  - 类型：方法注解、类注解
  - 位置：`Controller` 方法、`Controller` 类
  - 前面提到的 `@RestController`=`@Controller`+`@ResponseBody`，不必另加 `@ResponseBody`
  - 响应的数据格式各式各样，不便管理，难以维护

- `Result` 类：把响应体封装成一个对象。

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {
  //响应码，1代表成功，0代表失败
  private Integer code;
  //提示信息
  private String msg;
  //返回的数据
  private Object data;

  public static Result success() {
      return new Result(1, "success", null);
  }

  public static Result success(Object data) {
      return new Result(1, "success", data);
  }

  public static Result error(String msg) {
      return new Result(0, msg, null);
  }
}
```

响应方法成功时 `return Result.success(响应数据)` 即可。

限定前端的请求方法为一个特定方法：设置 `@RequestMapping` 的 `method` 属性为特定请求方法，如 `@RequestMapping(value = "/books", method = RequestMethod.GET)`，也可以直接使用 `@GetMapping("/books")`，像这样，每种请求方法都有相应的限定注解可用。

公共的请求路径可以提取到类上，底下写相对路径即可，路径相同的不用指定 `value` 属性：

- 一个完整的请求路径，应该是类上的 `@RequestMapping` 的 `value` 属性 + 方法上的 `@RequestMapping` 的 `value` 属性。

```java
@RequestMapping("/books")
public class BookController {
  /*...*/
  @DeleteMapping("/{id}")
  public Result delete(@PathVariable Integer id) {
      log.info("删除id为{}的图书", id);
      return Result.success(bookService.deleteById(id));
  }
  /*...*/
}
```

## 请求响应操作数据库

- 增加记录：`@PostMapping` 方法 + `@RequestBody` 参数
- 删除记录：`@DeleteMapping` 方法 + `@PathVariable` 参数
- 修改记录：`@PutMapping` 方法 + `@RequestBody` 参数
- 查询记录：`@GetMapping` 方法
- 分页查询：`@GetMapping` 方法 + `@RequestParam` 参数，或 MyBatis 的 PageHelper 插件 `pagehelper-spring-boot-starter`
  - `@GetMapping` 的 `params` 属性可以区分同路径不同参数列表的请求，`@GetMapping(params = "!pageIndex")`。
  - `@RequestParam` 的 `defaultValue` 属性可以来设置参数的默认值。
  - 如果请求参数包含日期，则要使用 `@DateTimeFormat(pattern = "yyyy-MM-dd")` 约束请求参数，不用写 `@RequestParam`。

请求路径风格：RESTful API。

### RESTful API

REST (Representational State Transfer, 表述性状态转换) 是一种软件架构风格。

传统风格：

```
http://localhost:8080/user/getById?id=1 // GET：查询id为1的用户
http://localhost:8080/user/saveUser // POST：新增用户
http://1ocalhost:8080/user/updateUser  // POST：修改用户
http://localhost:8080/user/deleteUser?id=1 // GET：删除id为1的用户
```

REST 风格：

```
http://localhost:8080/users/1			GET：查询id为1的用户
http://1ocalhost:8080/users				POST：新增用户
http://localhost:8080/users				PUT：修改用户
http://localhost:8080/users/1			DELETE：删除id为1的用户
```

- REST 用 URL 来定位资源、HTTP 动词来描述操作，简洁、规范、优雅。
- REST 是风格，是约定方式，约定不是规定，可以打破。
- REST 描述模块的功能通常使用复数，也就是加 s 的格式来描述，表示此类资源，而非单个资源。
