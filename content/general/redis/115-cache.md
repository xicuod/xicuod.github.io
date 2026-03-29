---
weight: 115
slug: redis-cache
title: Redis 缓存
---

**缓存**（cache，音同 cash）就是数据交互的缓冲区，是存储数据的临时地点，读写性能较高。任何地方都有缓存，浏览器有缓存，Tomcat 有应用层缓存，数据库有缓存，CPU 和磁盘也有缓存，可以说数据链路的每一个环节都有缓存。通过访问缓存，可以“截短”一次的请求响应的数据链路，从而更快响应。

> [!tip] 缓存为什么无处不在？
>
> 正是为了填补 CPU 与内存、内存与磁盘之间巨大的速度鸿沟，缓存才无处不在。缓存就是通过“空间换时间”，将低速存储的数据临时存放在高速存储中，从而避开高延迟的 I/O 路径。

缓存的作用：

- 降低后端负载，避免过多的请求打到性能较差的数据库
- 提高读写效率，降低响应时间

缓存的成本：

- 数据一致性成本：以数据库的数据为最新的版本，如果数据库更新了，但缓存没有及时更新，那么用户可能请求到过期的数据
- 代码维护成本：需要编写处理数据一致性的代码逻辑
- 运维成本：要保证高可用，避免**缓存穿透**、**缓存雪崩**、**缓存击穿**等问题，缓存一般需要大规模集群模式，而缓存集群的部署和维护需要人力成本和硬件成本

> [!note] 强一致性与最终一致性
>
> 为了平衡性能与一致性，通常会对一致性做妥协，接受**最终一致性**（允许短暂的不一致），而不是追求强一致性。因为在分布式高并发场景下，强一致性往往意味着**加锁**，会带来巨大的性能损失。

## 缓存更新策略

缓存不能一直存着，因为原始数据是变化的，原始数据更新了，缓存也要跟着更新，这就是我们说的保证数据一致性。有三种缓存更新策略，它们分别实现不同严格程度的数据一致性：

1. 内存淘汰：不自己维护缓存，而是利用 Redis 的内存淘汰机制，当内存不足时，Redis 会自动淘汰部分数据。下次查询时未命中，就能更新缓存。内存淘汰的一致性较差，因为我们无法掌控 Redis 淘汰哪些数据，容易留下旧数据。内存淘汰的好处是维护成本几乎没有。
2. 超时剔除：利用 Redis 的过期机制，给缓存添加 TTL 时间，到期后自动删除。下次查询时未命中，就能更新缓存。超时剔除的一致性一般，因为虽然它能一定程度上掌控缓存，但如果在缓存未过期的时间里原始数据更新了，缓存不能及时更新。超时剔除的维护成本较低。
3. 主动更新：自己编写业务逻辑，在更新原始数据的当口更新缓存。主动更新的一致性较好，但是维护成本较高。

根据业务场景选择缓存更新策略：

- 低一致性需求：原始数据长期不变，使用内存淘汰机制。如店铺类型的查询缓存。
- 高一致性需求：原始数据经常改变，使用主动更新机制，并以超时剔除作为兜底方案。如店铺详情的查询缓存。

### 主动更新策略的三种实现

1. **旁路缓存** (Cache Aside Pattern)：由缓存调用者在更新数据库的同时更新缓存。它的好处是可控性高，坏处是只能做到最终一致性，且维护成本较高，每个调用者都需要编写旁路缓存逻辑。
2. **读写穿透** (Read/Write Through Pattern)：将缓存与数据库整合为一个服务，由该服务来维护一致性。调用者调用该服务，无需关心一致性问题。它的好处是能做到强一致性（主要是单机，分布式很难），坏处是维护成本较高，需要开发一个通用的代理层。
3. **异步缓存写入** (Write Behind Caching Pattern)：调用者只操作缓存，由另外的独立的线程异步地将缓存数据持久化到数据库，保证最终一致。
   - 它的好处是可以把多次小的更新合并为一个大的更新给到数据库，也就是批处理；对于同一个 `key` 的多次更新，只有最后一次有效，它只会对数据库应用最后一次更新，行话叫“**减少写放大**”，在**写多读少**的场景下，这种模式能极大降低数据库负载。
   - 它的坏处是维护成本很高，需要扎实的异步任务的可靠性设计；它的一致性和可靠性不强，它只保证最终一致性，容许从缓存更新到异步线程应用更新期间的不一致，如果这期间缓存服务器宕机，那么最新的数据就丢失了。

### 主动更新策略的三个问题

1. 删除缓存还是更新缓存？删除缓存。

- 更新缓存：每次更新数据库都更新缓存，无效写操作较多（写时更新）
- 删除缓存：更新数据库时让缓存失效，查询时再更新缓存（读时更新）

删除缓存在“写多读少”的场景下性能更好，因为只写不查意味着除了最近的一次写操作，之前的写操作都是无效的，所以等到查询时再更新缓存，可以减少无效写操作。

2. 如何保证缓存与数据库的写操作（“双写”）同时成功或失败？单体用事务，集群用 TCC 等分布式事务。

缓存与数据库要保证一致性，对它们的操作同时成功或失败是必要的，要确保双写操作的原子性。对于单体系统，将缓存和数据库操作放在一个事务中即可；对于分布式系统，就不得不用到 TCC 等分布式事务方案。

3. 写时先操作缓存还是先操作数据库？先操作数据库。

先删缓存：会导致“读脏数据”，如果线程 2 抓住线程 1 删除缓存但还未更新数据库的空档查询了缓存，就会导致因未命中缓存而查询数据库，并把数据库中还没来得及更新的旧数据又重新写回了缓存，这就成了缓存中的“脏数据”。线程 2 的读操作本身就比线程 1 的写操作快，所以这种情况十分有可能发生。

先操作数据库：线程 2 更新数据库前，线程 1 查询时恰好缓存失效了，于是从数据库查了旧数据，接着又恰好在线程 2 更新数据库并删除缓存后才把旧数据写入缓存。因为这种情况需要两个恰好，且线程 1 的读操作更快，想卡上点很难，时间窗口很小，所以不容易发生。

## 缓存穿透 Cache Passthrough

缓存穿透是指客户端请求的数据在缓存和数据库中都不存在，缓存永远不会生效，所有的请求都会打到数据库。如果有个不怀好意的人发送海量的并发请求查询不存在的数据，就会导致数据库不堪重负。缓存穿透的解决思路是，提前把假请求拒之门外。

### 缓存空值解决缓存穿透

缓存空值是把 `null` 作为值写入缓存，这样以后就能命中缓存了。优点是实现简单，维护方便；缺点是需要消耗额外内存，且可能造成短期不一致。

```java
public Result queryWithPassthrough(Long id) {
   String key = CACHE_SHOP_KEY + id;
   String json = stringRedisTemplate.opsForValue().get(key);
   String notFoundMsg = "Shop with such id not found anywhere.";
   //查redis
   if (StrUtil.isNotBlank(json)) { /*redis有，获取并返回*/
      Shop shop = JSONUtil.toBean(json, Shop.class);
      return Result.ok(shop);
   }
   if (json != null) { /*redis有但是空值或空格，返回错误*/
      return Result.fail(notFoundMsg);
   }
   //redis没有，查数据库
   Shop entity = getById(id);
   //数据库没有，返回错误
   if (entity == null) {
      //空值写入redis
      stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
      return Result.fail(notFoundMsg);
   }
   //数据库有，缓存到redis并返回
   stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(entity), CACHE_SHOP_TTL, TimeUnit.MINUTES);
   return Result.ok(entity);
}
```

### 布隆过滤解决缓存穿透

布隆过滤是在客户端和 Redis 中间插入一个布隆过滤器，如果查的数据存在就放行，如果不存在就拒绝请求。布隆过滤器通过哈希算法匹配是否存在，因此它说存在但不一定存在，它说不存在就一定不存在。优点是内存占用少，没有多余的 `key`；缺点是实现复杂，且存在误判的可能。

然而，这两种都是被动的方案，是别人打你时你格挡。你还可以主动增加 `id` 的复杂度，并做好数据的基础格式校验，提前过滤不合规则的 `id`，避免别人猜测 `id` 规律；加强用户权限校验；对**热点参数**做限流；从而主动规避缓存穿透攻击。

## 缓存雪崩 Cache Avalanche

缓存雪崩是在同一时段大量的缓存 `key` 同时失效，或 Redis 服务器宕机，导致大量请求打到数据库，导致数据库不堪重负。

缓存雪崩的解决方案：

- 给不同的 `key` 的 TLL 添加**随机值**
- 利用 Redis **集群**提高服务的可用性（主从、哨兵）
- 给缓存业务添加**降级限流**策略
- 给业务添加**多级缓存**

## 缓存击穿 Cache Breakdown

**缓存击穿**（热点 `key` 问题）就是一个高并发访问的、缓存重建业务较复杂的 `key` 突然失效了，导致瞬间的海量请求让数据库不堪重负。缓存击穿的解决思路是，不要让那么多的线程都几乎同时重建缓存。

### 互斥锁解决缓存击穿

线程未命中时写缓存前先获取互斥锁，这样一开始的线程拿到互斥锁，其他线程都拿不到互斥锁，都休眠一会儿再重试，直到一开始的线程重建缓存。

互斥锁的优点是没有额外的内存消耗，保证强一致性，实现简单；缺点是重建缓存往往较久，互斥锁容易导致大量线程等待，性能很差，且一直等待可能有死锁风险。

实现互斥锁：这里的互斥锁是自定义行为的，Java 的 `lock` 和 `synchronized` 锁拿不到时就阻塞，不符合要求，所以我们需要自己实现一个这样的互斥锁。注意到 Redis 的 `SETNX` 命令就是互斥的，我写了 `lock` 你就不能写了，直到我用 `DEL` 命令释放 `lock`。这样给 `lock` 设置一个有效期，即使我因为一些问题长期没有释放锁，也会有兜底的到期删除机制。

```java
public Result queryWithMutex(Long id) {
   String key = CACHE_SHOP_KEY + id;
   String json = stringRedisTemplate.opsForValue().get(key);
   String notFoundMsg = "Shop with such id not found anywhere.";
   String lockKey = LOCK_SHOP_KEY + id;
   long sleepMillis = 50;
   Shop entity;
   //查redis
   if (StrUtil.isNotBlank(json)) { /*redis有，获取并返回*/
      Shop shop = JSONUtil.toBean(json, Shop.class);
      return Result.ok(shop);
   }
   try {
      /*先获取互斥锁*/
      while (true) {
            boolean locked = tryLock(lockKey);
            if (!locked) { /*获取锁失败，休眠重试*/
               Thread.sleep(sleepMillis);
               continue;
            }
            break;
      }
      /*获取锁成功，先二次检查缓存是否重建*/
      json = stringRedisTemplate.opsForValue().get(key);
      if (StrUtil.isNotBlank(json)) { /*缓存已经重建，直接返回*/
            Shop shop = JSONUtil.toBean(json, Shop.class);
            return Result.ok(shop);
      }
      /*缓存还没重建，查数据库重建缓存*/
      entity = getById(id);
      if (entity == null) { /*数据库没有，返回错误*/
            return Result.fail(notFoundMsg);
      }
      /*数据库有，缓存到redis*/
      stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(entity), CACHE_SHOP_TTL, TimeUnit.MINUTES);
   } catch (InterruptedException e) {
      throw new RuntimeException(e);
   } finally {
      unlock(lockKey); /*释放互斥锁*/
   }
   return Result.ok(entity);
}
```

### 逻辑过期解决缓存击穿

不使用 Redis 的过期机制，而是自己维护一个 `expire` 字段作为逻辑过期时间，且线程未命中还是要先获取互斥锁，但是线程 1 未命中时会新建一个线程 2 来重建缓存，并直接返回旧数据；线程 3 未命中时拿不到互斥锁，也直接返回旧数据；直到线程 2 重建完缓存，重置逻辑过期时间。

> [!note] 逻辑过期的“未命中”
>
> 逻辑过期的缓存建立后不会实际过期，所谓的未命中是指根据自定义的 `expire` 字段判断缓存是否逻辑上过期，如果过期，称作“未命中”。

逻辑过期的优点是线程无需等待，性能较好；缺点是不保证强一致性，只保证最终一致性，有额外内存消耗，且实现复杂。

```java
public Result queryWithLogicalExpire(Long id) {
   String key = CACHE_SHOP_KEY + id;
   String lockKey = LOCK_SHOP_KEY + id;
   long sleepMillis = 200;
   long expireSeconds = 20;
   //查redis
   String redisDataJson = stringRedisTemplate.opsForValue().get(key);
   if (StrUtil.isBlank(redisDataJson)) { /*redis没有，为简化问题，这里不做主动更新*/
      return Result.fail(notFoundMsg);
   }
   //命中，判断是否逻辑过期
   RedisData redisData = JSONUtil.toBean(redisDataJson, RedisData.class);
   Shop shop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
   LocalDateTime expireTime = redisData.getExpireTime();
   if (expireTime.isAfter(LocalDateTime.now())) { /*未过期，返回*/
      return Result.ok(shop);
   }
   /*命中但已过期，异步重建缓存*/
   boolean locked = tryLock(lockKey); /*先获取互斥锁*/
   if (locked) {
      /*拿到锁，先二次检查缓存是否过期*/
      redisDataJson = stringRedisTemplate.opsForValue().get(key);
      redisData = JSONUtil.toBean(redisDataJson, RedisData.class);
      shop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
      expireTime = redisData.getExpireTime();
      if (expireTime.isAfter(LocalDateTime.now())) { /*未过期，直接返回*/
            return Result.ok(shop);
      }
      /*新建线程重建缓存，释放锁，并返回旧数据*/
      CACHE_REBUILD_EXECUTOR.submit(() -> {
            try {
               Thread.sleep(sleepMillis);
               this.saveShop2Redis(id, expireSeconds);
               /*重建完成，这之后的请求才会拿到新数据*/
            } catch (InterruptedException e){
               throw new RuntimeException(e);
            } finally {
               unlock(lockKey);
            }
      });
   }
   /*拿不到锁，直接返回旧数据*/
   return Result.ok(shop);
}
```

> [!note] 为什么拿到锁后要做双重检查 (double check)？
>
> 尽管这是一个非阻塞分布式锁，但是在高并发场景下，持锁线程释放锁的那个瞬间，也有许多线程恰好拿到了过期的缓存并刚要准备 `tryLock()`，它们中的一个会拿到锁，几乎是前后脚的功夫再次尝试重建缓存。又由于逻辑过期方案是异步地查询数据库，线程拿到锁之后几乎立刻就释放了，导致如果一直高并发，这个过程就会一直极快速地重复下去，直到第一次缓存重建完毕。导致每次缓存一过期，短时间内数据库的压力就飙升。

## 缓存工具类

从上面的代码可以看出，要实现高可靠、高性能的缓存系统十分复杂，为了简化代码，考虑基于 `StringRedisTemplate` 封装一个缓存工具类，包含以下方法：

- 方法 1：将任意 Java 对象序列化为 JSON 并存储在 `String` 类型的 `key` 中，并且可以设置 TTL 过期时间
- 方法 2：将任意 Java 对象序列化为 JSON 并存储在 `String` 类型的 `key` 中，并且可以设置逻辑过期时间，用于处理**缓存击穿**问题
- 方法 3：根据指定的 `key` 查询缓存，并反序列化为指定类型，利用缓存空值的方式解决**缓存穿透**问题
- 方法 4：根据指定的 `key` 查询缓存，并反序列化为指定类型，需要利用逻辑过期解决**缓存击穿**问题

```java
@Slf4j
@Component
public class CacheClient {
    private final StringRedisTemplate stringRedisTemplate;

    private static final String rebuildCacheErrMsg = "缓存重建失败";

    public CacheClient(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public void set(String key, Object value, Long time, TimeUnit timeUnit) {
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(value), time, timeUnit);
    }

    public void setWithLogicalExpire(String key, Object value, Long expireTime, TimeUnit timeUnit) {
        RedisData redisData = new RedisData();
        redisData.setData(value);
        redisData.setExpireTime(LocalDateTime.now().plusSeconds(timeUnit.toSeconds(expireTime)));
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(redisData));
    }

    // 缓存空值解决缓存穿透
    public <E, ID> E queryWithPassthrough(
            String keyPrefix, ID id, Class<E> type,
            Function<ID, E> dbFallback,
            Long time, TimeUnit timeUnit) {
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);
        //查redis
        if (StrUtil.isNotBlank(json)) { /*redis有，获取并返回*/
            return JSONUtil.toBean(json, type);
        }
        if (json != null) { /*redis有但是空值或空格，返回错误*/
            return null;
        }
        //redis没有，查数据库
        E entity = dbFallback.apply(id);
        //数据库没有，返回null
        if (entity == null) {
            //空值写入redis
            stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            return null;
        }
        //数据库有，缓存到redis并返回
        this.set(key, entity, time, timeUnit);
        return entity;
    }

    // 1 互斥锁解决缓存击穿
    public <E, ID> E queryWithMutex(
            String keyPrefix, String lockKeyPrefix, ID id, Class<E> type,
            Function<ID, E> dbFallback,
            Long expireTime, TimeUnit timeUnit) {
        String key = keyPrefix + id;
        String json = stringRedisTemplate.opsForValue().get(key);
        //查redis
        if (StrUtil.isNotBlank(json)) { /*redis有，获取并返回*/
            return JSONUtil.toBean(json, type);
        }
        /*先获取互斥锁*/
        String lockKey = lockKeyPrefix + id;
        int retryCount = 0;
        int maxRetries = 3;
        long sleepMillis = 50;
        while (retryCount < maxRetries) {
            try {
                boolean locked = tryLock(lockKey);
                if (!locked) { /*获取锁失败，休眠重试*/
                    ++retryCount;
                    Thread.sleep(sleepMillis);
                    continue;
                }

                /*获取锁成功，先检查缓存是否已经重建*/
                json = stringRedisTemplate.opsForValue().get(key);
                if (StrUtil.isNotBlank(json)) { /*缓存已经重建，直接返回*/
                    return JSONUtil.toBean(json, type);
                }
                /*缓存还没重建，查数据库重建缓存*/
                E entity = dbFallback.apply(id);
                if (entity == null) { /*数据库没有，返回null*/
                    return null;
                }
                /*数据库有，缓存到redis*/
                this.set(key, entity, expireTime, timeUnit);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            } finally {
                unlock(lockKey); /*释放互斥锁*/
            }
        }
        return null; /*多次重试失败，服务器繁忙*/
    }

    private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);

    // 2 逻辑过期解决缓存击穿
    public <E, ID> E queryWithLogicalExpire(
            String keyPrefix, String lockKeyPrefix, ID id, Class<E> type,
            Function<ID, E> dbFallback,
            Long logicalExpire, TimeUnit timeUnit) {
        String key = keyPrefix + id;
        String lockKey = lockKeyPrefix + id;
        RedisData redisData;
        E entity;
        LocalDateTime expireTime;
        int retryCount = 0;
        int maxRetries = 3;
        long sleepMillis = 50;
        while (retryCount < maxRetries) {
            //查redis
            String redisDataJson = stringRedisTemplate.opsForValue().get(key);
            /*未命中，同步预热缓存*/
            if (StrUtil.isBlank(redisDataJson)) {
                boolean locked = tryLock(lockKey);
                if (locked) {
                    redisDataJson = stringRedisTemplate.opsForValue().get(key);
                    if (redisDataJson != null) { /*先检查缓存是否已经预热*/
                        redisData = JSONUtil.toBean(redisDataJson, RedisData.class);
                        entity = JSONUtil.toBean((JSONObject) redisData.getData(), type);
                        /*再检查缓存是否过期*/
                        expireTime = redisData.getExpireTime();
                        if (expireTime.isAfter(LocalDateTime.now())) {
                            return entity; /*未过期，直接返回*/
                        }
                    }
                    /*缓存未预热或已过期，重建缓存*/
                    try {
                        entity = dbFallback.apply(id);
                        if (entity == null) return null;
                        this.setWithLogicalExpire(key, entity, logicalExpire, timeUnit);
                        return entity;
                    } finally {
                        unlock(lockKey);
                    }
                }
                /*拿不到锁，缓存还在预热，休眠并重试*/
                try {
                    ++retryCount;
                    Thread.sleep(sleepMillis);
                    continue;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
            //命中，判断是否逻辑过期
            redisData = JSONUtil.toBean(redisDataJson, RedisData.class);
            entity = JSONUtil.toBean((JSONObject) redisData.getData(), type);
            expireTime = redisData.getExpireTime();
            if (expireTime.isAfter(LocalDateTime.now())) { /*未过期，返回*/
                return entity;
            }
            /*命中但已过期，异步重建缓存*/
            boolean locked = tryLock(lockKey); /*先获取互斥锁*/
            /*拿到锁，先检查缓存是否已经重建*/
            if (locked) {
                redisDataJson = stringRedisTemplate.opsForValue().get(key);
                redisData = JSONUtil.toBean(redisDataJson, RedisData.class);
                entity = JSONUtil.toBean((JSONObject) redisData.getData(), type);
                expireTime = redisData.getExpireTime();
                if (expireTime.isAfter(LocalDateTime.now())) {
                    /*未过期，直接释放锁并返回数据*/
                    unlock(lockKey);
                    return entity;
                }
                /*新建线程重建缓存，然后释放锁*/
                CACHE_REBUILD_EXECUTOR.submit(() -> {
                    try {
                        this.setWithLogicalExpire(key, dbFallback.apply(id), logicalExpire, timeUnit);
                        /*重建完成，这之后的请求才会拿到新数据*/
                    } catch (Exception e) {
                        log.error(rebuildCacheErrMsg, e);
                    } finally {
                        unlock(lockKey);
                    }
                });
            }
            /*命中但拿不到锁或缓存已过期，直接返回旧数据*/
            return entity;
        }
        /*预热时，重试还不行，只能返回null*/
        return null;
    }

    private boolean tryLock(String key) {
        Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", LOCK_SHOP_TTL, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(flag);
    }

    private void unlock(String key) {
        stringRedisTemplate.delete(key);
    }
}
```
