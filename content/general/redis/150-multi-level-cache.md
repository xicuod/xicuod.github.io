---
weight: 150
slug: multi-level-cache
title: 多级缓存
---

## 传统缓存的弊端与多级缓存的优势

传统缓存的策略 tomcat->redis->数据库；问题是tomcat性能瓶颈和redis缓存击穿和雪崩；

介绍多级缓存；它如何在各个环节提升性能；多级缓存流程：用户，浏览器客户端缓存，nginx本地缓存，redis，tomcat进程缓存，数据库；贴个多级缓存流程图：

![多级缓存流程](https://img.xicuodev.top/2026/04/22db8f2753342b0b115b644c2e9e3aac.png "多级缓存流程")

由于……，nginx职责变大，变成业务nginx，……，所以需要部署为集群，再另外部署一个专门反代和负载的nginx；redis tomcat mysql 都可以变成集群；

预告要学的知识以及它们用在哪个环节：jvm进程缓存；lua脚本；实现多级缓存；缓存同步策略；

## JVM 进程缓存

介绍它，并说明它用于流程中的tomcat进程缓存；分布式缓存（如Redis）优缺点场景，进程本地缓存（如HashMap、GuavaCache）优缺点场景；

案例：导入商品；在docker中从零开始配一个用于学习多级缓存的mysql(版本5.7)，参考在/tmp/mysql目录运行`docker run -p 3306:3306 --name mysql -v $PWD/conf:/etc/mysql/conf.d -v $PWD/logs:/logs -v $PWD/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=213 --privileged -d mysql:5.7`，我是把它装到compose里面了；介绍item数据库表tb_item，tb_item_stock（除了主键外键等，其他随便写几个字段意思一下），垂直分表思想，冷热分离，避免stock热数据牵连其他冷数据频繁重建缓存；

初识Caffeine，介绍它；用Caffeine实现进程缓存：`Cache<String, String> cache = Caffeine.newBuilder().build()`，`getIfPresent()`，`get()`；

Caffeine有三种缓存驱逐策略：基于容量（maximumSize()）/时间（expireAfterWrite()）/引用（GC软弱引用，性能差不推荐）；Caffeine不会立即清除过期缓存，而是在……时清除；

案例：用Caffeine实现商品查询的本地进程缓存：用id查商品，用id查商品库存，未命中查数据库；缓存初始大小100，上限10000；

## Lua 脚本入门

初始Lua：介绍Lua，C语言开发，目的是嵌入应用程序，灵活扩展定制，官网；

Lua的你好世界，print一次可以打印多个值，中间是制表符，或使用字符串拼接符 ..；

Lua数据类型：nil boolean number string function table（关联数组 value可以不同类型 构造表达式 {}空表 数组就是key为索引的table 下标运算符[] . lua的下标从1开始）；

Lua变量和循环（arr和map的for遍历，介绍ipairs()和pairs()），没有分号，大括号，靠缩进划分块；

Lua函数（举例local function printArr(arr)）；

Lua流程控制，逻辑运算符与或非，nil……视为false，……视为true；

案例：自定义函数打印arr，当arr为nil时打印错误信息；

## 多级缓存

### OpenResty 快速入门

安装OpenResty：介绍openresty，精良的lua库，第三方模块，官网；

修改它的nginx.conf：添加openresty lua模块加载；添加~ /api/item/(\d+)路径监听，正则可以获取参数传给lua；

```conf
lua_package_path "/usr/local/openresty/lualib/?.lua;;";
lua_package_cpath "/usr/local/openresty/lualib/?.so;;";

server {
    location ~ /api/item/(\d+) {
        default_type application/json;
        content_by_lua_file lua/item.lua;
    }
}
```

编写openresty/nginx/item.lua，内容ngx.say()返回假json，然后nginx -s reload；

```lua
local id = ngx.var[1]
ngx.say('{"id":'..id..',"name":"SALSA AIR","title":"RIMOWA 26寸托运箱拉杆箱 SALSA AIR系列果绿色 820.70.36.4","price":19900,"image":"https://m.360buyimg.com/mobilecms/s720x720_jfs/t6934/364/1195375010/84676/e9f2c55f/597ece38N0ddcbc77.jpg!q70.jpg.webp","category":"拉杆箱","brand":"RIMOWA","spec":"","status":1,"createTime":"2019-04-30T16:00:00.000+00:00","updateTime":"2019-04-30T16:00:00.000+00:00","stock":2999,"sold":31290}')
```

### OpenResty 请求参数处理

列表格：表头：参数格式，参数示例，lua代码解析参数示例，行头：路径占位符、请求头、Get请求参数、Post表单参数、JSON参数；

### 查询 Tomcat 进程缓存

redis缓存没有预热的话，需要先查tomcat预热redis，所以先用lua实现访问tomcat缓存和预热redis缓存；步骤：获取请求参数中的id；用id请求tomcat，查询商品；用id请求库存；组装商品和库存，序列化为json返回；

用openresty的nginx内部api发送http请求，item.lua代码示例：nginx.location.capture(path,req)；请求对象的字段method,args,body，响应对象的字段status,header,body；path路径不包含ip端口；由于是发给nginx自己的server，需要反代给宿主上的tomcat集群；

```conf
upstream tomcat-cluster {
    ; hash $request_uri; # 按请求uri哈希分流，后面会说
	server host.docker.internal:8081;
	server host.docker.internal:8082;
}
server {
    location /item {
        proxy_pass http://tomcat-cluster;
    }
}
```

在lualib/common.lua封装http查询的函数并_M导出；因为之前在openresty配置中加载了lublib中的所有lua，所以这个脚本也会加载；

```lua
local function read_http(path, params)
	local resp = ngx.location.capture(path, {
		method = ngx.HTTP_GET,
		args = params,
	})
	if not resp then
		ngx.log(ngx.ERR, 'HTTP请求失败, 请求路径：', path, '请求参数：', args)
		ngx.exit(404)
	end
	return resp.body
end

local _M = {
	read_http = read_http
}
return _M
```

介绍require()导包和cjson；重写item.lua：

```lua
local common = require('common')
local cjson = require('cjson')
local read_http = common.read_http
local id = ngx.var[1]
local itemJson = read_http('/item/'..id, nil)
local stockJson = read_http('/item/stock/'..id, nil)
local item = cjson.decode(itemJson)
local stock = cjson.decode(stockJson)
item.stock = stock.stock
item.sold = stock.sold
itemJson = cjson.encode(item)
ngx.say(itemJson)
```

轮询分流->哈希分流：负载均衡会导致同一个请求多次可能到达tomcat集群的不同实例，tomcat缓存容易失效；解决方案是让同一个请求每次都访问同一个tomcat实例；现在负载均衡是轮询，要改为hash $request_uri；简要介绍这里的哈希算法，算完哈希还要对集群实例个数取余；

```conf
upstream tomcat-cluster {
    hash $request_uri;
	server host.docker.internal:8081;
	server host.docker.internal:8082;
}
```

### 查询 Redis 缓存

实际请求在tomcat之前应先查redis；介绍冷启动与缓存预热（提前缓存大数据统计出的热点数据）；
redis缓存预热：docker compose添加redis，开启aof持久化；spring后端pom.xml引入redis依赖，application.yml配置redis地址，编写初始化类（RedisHandler实现InitializingBean，afterPropertiesSet()方法中写预热逻辑，介绍该方法的执行时机，依赖注入之后执行）；

openresty操作redis：介绍lua面向对象的基本语法；在common.lua引入resty.redis模块，创建redis对象，设置超时时间，封装close_redis(red)方法，实则放入连接池，封装read_redis(ip,port,key)；在item.lua封装read_data(key,path,params)和read_item(id)，期间我遇到attempt to call global 'read_data' (a nil value)，发现是lua对函数定义位置有要求，不愧是基于C语言开发的；

目前的common.lua：

```lua
-- 发送HTTP GET请求的方法
local function read_http(path, params)
	local resp = ngx.location.capture(path, {
		method = ngx.HTTP_GET,
		args = params,
	})
	if not resp then
		ngx.log(ngx.ERR, 'HTTP请求失败, 请求路径：', path, '请求参数：', args)
		ngx.exit(404)
	end
	return resp.body
end


local redis = require('resty.redis')

-- 关闭redis连接的方法，其实是放入连接池
local function close_redis(red)
    local pool_max_idle_time = 10000 -- 连接的空闲时间，单位是毫秒
    local pool_size = 100 --连接池大小
    local ok, err = red:set_keepalive(pool_max_idle_time, pool_size)
    if not ok then
        ngx.log(ngx.ERR, "放入redis连接池失败: ", err)
    end
end

-- 查询redis的方法，ip和port是redis地址，key是查询的key
local function read_redis(ip, port, key)
	local red = redis:new()
	red:set_timeouts(1000,1000,1000)
    -- 获取一个连接
    local ok, err = red:connect(ip, port)
    if not ok then
        ngx.log(ngx.ERR, "连接redis失败 : ", err)
        return nil
    end
    -- 查询redis
    local resp, err = red:get(key)
    -- 查询失败处理
    if not resp then
        ngx.log(ngx.ERR, "查询Redis失败: ", err, ", key = " , key)
    end
    --得到的数据为空处理
    if resp == ngx.null then
        resp = nil
        ngx.log(ngx.ERR, "查询Redis数据为空, key = ", key)
    end
    close_redis(red)
    return resp
end

local _M = {
	read_http = read_http,
	read_redis = read_redis
}
return _M
```

目前的item.lua：这里我遇到'redis'连不上redis的情况，解决方法是在nginx.conf添加`resolver 127.0.0.11;`让lua脚本也走docker的dns；

```lua
local common = require('common')
local cjson = require('cjson')
local read_http = common.read_http
local read_redis = common.read_redis

local function read_data(key,path,params)
    local resp = read_redis('redis', 6379, key)
    if not resp then
        ngx.log(ngx.ERR, 'redis查询失败，尝试查询tomcat，key：'..key)
        resp = read_http(path,params)
    end
    return resp
end

local function read_item(id)
    local itemJson = read_data('item:id:'..id, '/item/'..id, nil)
    local stockJson = read_data('item:stock:id:'..id, '/item/stock/'..id, nil)
    local item = cjson.decode(itemJson)
    local stock = cjson.decode(stockJson)
    item.stock = stock.stock
    item.sold = stock.sold
    return item
end

local id = ngx.var[1]
ngx.say(cjson.encode(read_item(id)))
```

### OpenResty Nginx 本地缓存

前面单独的Nginx是专门用于负载均衡到OpenResty的Nginx缓存集群的；现在就差openresty部署nginx集群，并添加nginx本地缓存；

openresty 的 shared dict 共享字典，在nginx worker之间共享数据，相当于本地缓存；开启共享字典：lua_shared_dict item_cache 150m; 操作共享字典：ngx.shared.item_cache，set(key,value,ttl) ttl单位s，默认0永不过期，get()；

在item.lua引入local_item_cache本地缓存，让read_data()先读本地缓存，再读redis，tomcat；本地没有缓存时查完redis或tomcat，写入本地缓存并设置有效期；冷数据商品基本信息有效期30min，热数据库存有效期1min，但秒杀商品的库存属于白热数据，也可不设有效期；

```lua
local local_item_cache = ngx.shared.item_cache

local function read_data(key,expire,path,params)
    local val = local_item_cache:get(key)
    if not val then
        ngx.log(ngx.ERR, '本地缓存查询失败，尝试查询redis，key：'..key)
        val = read_redis('redis', 6379, key)
        if not val then
            ngx.log(ngx.ERR, 'redis查询失败，尝试查询tomcat，key：'..key)
            val = read_http(path,params)
            if not val then
                ngx.log(ngx.ERR, 'tomcat查询也失败，检查连接参数或后端内部报错，key：'..key)
                return nil
            end
        end
        local_item_cache:set(key,val,expire)
    end
    return val
end

local function read_item(id)
    local itemJson = read_data('item:id:'..id,1800,'/item/'..id,nil)
    if (not itemJson) then return nil end
    local stockJson = read_data('item:stock:id:'..id,60,'/item/stock/'..id,nil)
    if (not stockJson) then return nil end
    local item = cjson.decode(itemJson)
    local stock = cjson.decode(stockJson)
    item.stock = stock.stock
    item.sold = stock.sold
    return item
end
```

## 多级缓存同步策略

接下来解决数据库和多级缓存的一致性；常见缓存同步策略：设置有效期，被动；同步双写；异步通知；分别列出优缺点场景。

基于mq消息队列的异步通知，item-service发送消息到mq，cache-service从mq监听消息；item-service发完消息直接写数据库，cache-servi收到消息再更新缓存。基于canal的异步通知，canal从数据库监听binlog更改日志，通知cache-service，让它更新缓存，对item-service零侵入，时效性更强。

介绍canal，阿里基于java开发的，基于MySQL主从同步；MySQL主从同步步骤：master根据变更生成binary log，记录的是binary log events；replica拷贝binlog到它的中继日志relay log；canal原理：把自己伪装成replica从MySQL master同步数据，监听binlog，把变化通知给客户端；replica重放replay中继日志的数据；

开启MySQL主从：my.cnf加两行，log-bin和binlog-do-db；show master status查看binlog是否开启；添加一个仅用于同步的canal@'%'用户：create user...identified by canal;grant...to...;flush privileges；安装canal：在compose中加入1.1.5的canal容器；

监听canal：编写客户端，使用`@CanalTable`和`EntryHandler<Entity>`（这是低版本写法，后面我抛弃了它）；需要用JPA注解保证实体类与数据库对应；spring有resource/static/，宿主访问127.0.0.1:8081可以直接看到管理后台，这个后台直接操作数据库，即可测试缓存同步；

编写canal客户端这部分花了我不少时间，查了[官方文档](https://github.com/alibaba/canal/wiki/ClientExample)，但是没有找到低版本的文档。但为了与时俱进，更是为了摆脱低版本好不容易运行都跑通了，但业务没跑通（到这里我彻底束手无策了）的巨坑，我决定换高版本客户端和高版本服务端，只要我根据高版本文档搞懂高版本客户端怎么写就可以了。于是在查缺补漏，翻阅各种网页资料，问了非常多次deepseek之后，总算写出一个还算健壮的canal客户端，请欣赏：

```xml
<!--canal客户端-->
<dependency>
    <groupId>com.alibaba.otter</groupId>
    <artifactId>canal.client</artifactId>
    <version>1.1.8</version>
</dependency>
<dependency>
    <groupId>com.alibaba.otter</groupId>
    <artifactId>canal.protocol</artifactId>
    <version>1.1.8</version>
</dependency>
```

```java
package com.heima.item.canal;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.TypeUtil;
import com.alibaba.otter.canal.client.CanalConnector;
import com.alibaba.otter.canal.client.CanalConnectors;
import com.alibaba.otter.canal.protocol.CanalEntry.*;
import com.alibaba.otter.canal.protocol.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"rawtypes", "unchecked"})
@Slf4j
@Component
public class CanalClientRunner {

    @Autowired
    private Environment environment;

    private volatile CanalConnector connector;
    private static final int maxRetries = 3;
    private static final int retryCooldownMillis = 2000;

    @Autowired
    private List<IEntryHandler> rawHandlers;
    private Map<IEntryHandler, IEntryHandler.Metadata> handler2Metadata;

    private volatile boolean running = true;
    private Thread worker;
    private String destination;

    @PostConstruct
    public void init() {
        String host = environment.getRequiredProperty("canal.host");
        int port = Integer.parseInt(environment.getProperty("canal.port", "11111"));
        destination = environment.getProperty("canal.destination", ".*");
        String username = environment.getProperty("canal.username", "canal");
        String password = environment.getProperty("canal.password", "canal");

        connector = CanalConnectors.newSingleConnector(new InetSocketAddress(host, port), destination, username, password);

        handler2Metadata = new HashMap<>();
        for (IEntryHandler handler : rawHandlers) {
            CanalTable canalTable = handler.getClass().getDeclaredAnnotation(CanalTable.class);
            Class<?> entityClazz = (Class<?>) TypeUtil.getTypeArgument(handler.getClass());
            if (canalTable == null || entityClazz == null) {
                log.warn("Bad metadata of handler, will skip: {}", handler.getClass());
                continue;
            }
            handler2Metadata.put(handler, new IEntryHandler.Metadata(entityClazz, canalTable));
        }

        worker = new Thread(this::run, "canal-client-thread");
        worker.setDaemon(true);
        worker.start();
    }

    @SuppressWarnings("BusyWait")
    private void run() {
        int retryCount = 0;
        while (running && retryCount <= maxRetries) {
            Long batchId = null;
            try {
                connector.connect();
                String filter = destination + "\\..*";
                connector.subscribe(filter); // 订阅所有dest_db的表
                connector.rollback(); // 回到未确认的ack位置
                log.info("Canal client started, subscribing {}", filter);
                while (running) {
                    Message msg = connector.getWithoutAck(10000);
                    batchId = msg.getId();
                    int size = msg.getEntries().size();
                    if (batchId == -1 || size == 0) { // 无变更数据
                        log.trace("Canal client idle");
                        try {
                            Thread.sleep(1000);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                        continue;
                    }
                    handleMessage(msg);
                    connector.ack(batchId);
                }
            } catch (Exception e) {
                log.error("Canal client error", e);
                if (batchId != null) connector.rollback(batchId);
            }
            ++retryCount;
            try {
                Thread.sleep(retryCooldownMillis);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        if (connector != null) connector.disconnect();
    }

    private void handleMessage(Message msg) {
        List<Entry> entries = msg.getEntries();
        for (Entry entry : entries) {
            if (entry.getEntryType() == EntryType.TRANSACTIONBEGIN ||
                    entry.getEntryType() == EntryType.TRANSACTIONEND) continue;
            try {
                RowChange rowChange = RowChange.parseFrom(entry.getStoreValue());
                EventType eventType = rowChange.getEventType();
                String schemaName = entry.getHeader().getSchemaName();
                String tableName = entry.getHeader().getTableName();
                if (!destination.equals(schemaName)) continue;

                for (IEntryHandler handler : handler2Metadata.keySet()) {
                    IEntryHandler.Metadata metadata = handler2Metadata.get(handler);
                    if (metadata == null || !metadata.canalTable.value().equals(tableName)) continue;
                    for (RowData rowData : rowChange.getRowDatasList()) {
                        Object before = convertColumnsToEntity(rowData.getBeforeColumnsList(), metadata.entityClazz);
                        Object after = convertColumnsToEntity(rowData.getAfterColumnsList(), metadata.entityClazz);
                        switch (eventType) {
                            case INSERT: handler.insert(after); break;
                            case UPDATE: handler.update(before, after); break;
                            case DELETE: handler.delete(before); break;
                            default: throw new IllegalStateException("Unexpected value: " + eventType);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Parse entry error", e);
            }
        }
    }

    private static <E> E convertColumnsToEntity(List<Column> columns, Class<E> entityClazz) {
        if (columns == null || columns.isEmpty()) return null;
        HashMap<String, Object> fieldMap = new HashMap<>();
        columns.forEach(column -> fieldMap.put(StrUtil.toCamelCase(column.getName()), column.getValue()));
        return BeanUtil.fillBeanWithMap(fieldMap, ReflectUtil.newInstance(entityClazz), false);
    }

    @PreDestroy
    public void dispose() {
        running = false;
        if (worker != null) worker.interrupt();
        if (connector != null) connector.disconnect();
    }
}
```

```java
package com.heima.item.canal;

import lombok.AllArgsConstructor;

public interface IEntryHandler<E> {
    void insert(E e);

    void update(E before, E after);

    void delete(E e);

    @AllArgsConstructor
    class Metadata {
        Class<?> entityClazz;
        CanalTable canalTable;
    }
}
```

```java
package com.heima.item.canal;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface CanalTable {
    String value();
}
```

## 多级缓存总结

![多级缓存架构](https://img.xicuodev.top/2026/04/c5bd855dff8cb18849664b1aa0af05e3.png "多级缓存架构")

最终的docker-compose.yml：

```yml
services:
  nginx:
    image: nginx:latest  # 使用的镜像
    container_name: nginx  # 容器名称
    ports:
      - "80:80"   # HTTP 端口映射
      - "443:443" # HTTPS 端口映射
    volumes:
      - ./nginx/html:/usr/share/nginx/html   # 网页目录（相对路径，与 yml 同目录）
      - ./nginx/conf.d:/etc/nginx/conf.d       # 配置目录
      - ./nginx/logs:/var/log/nginx          # 日志目录
    restart: always  # 容器退出后自动重启（保障服务可用性）
    networks:
      - appnet
  openresty:
    image: openresty/openresty:latest
    container_name: openresty
    ports:
      - "8081:8081"
    volumes:
      - ./openresty/logs:/usr/local/openresty/nginx/logs
      - ./openresty/conf.d:/etc/nginx/conf.d
      - ./openresty/lua:/usr/local/openresty/nginx/lua
      - ./openresty/lualib:/usr/local/openresty/lualib
    restart: always
    networks:
      - appnet
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    command: ["redis-server","--appendonly","yes"]
    volumes:
      - ./redis/data:/data
    networks:
      - appnet
  mysql:
    image: mysql:5.7.25
    container_name: mysql
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/conf:/etc/mysql/conf.d
      - ./mysql/logs:/logs
      - ./mysql/data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: 213
    restart: always
    privileged: true
    networks:
      - appnet
  canal:
    image: canal/canal-server:v1.1.8
    container_name: canal
    ports:
      - "11111:11111"
    environment:
      - canal.destinations=heima
      - canal.instance.master.address=mysql:3306
      - canal.instance.dbUsername=canal
      - canal.instance.dbPassword=canal
      - canal.instance.connectionCharset=UTF-8
      - canal.instance.tsdb.enable=false
      - canal.instance.gtidon=false
      - canal.instance.filter.regex=heima\\..*
    volumes:
      - ./canal/logs:/home/admin/canal-server/logs
    networks:
      - appnet
    depends_on:
      - mysql

networks:
  appnet:
    external: true
```
