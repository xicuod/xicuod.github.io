---
weight: 170
slug: redis-principle
title: Redis 原理
---

## Redis 数据结构

### 动态字符串 sds

redis中所有顶层数据结构都是字符串或字符串的集合；字符串是最常用的；但red没用c的字符串，因为它：本质字符数组，连续内存空间，获取长度需要计算；非二进制安全；不可修改；

因此red自己实现了简单动态字符串 simple dynamic string, sds；结构体，len 已用的字节，alloc 分配的字节（不含`\0`），flags 型号；

![动态字符串 sds](https://img.xicuodev.top/2026/04/8861b106558b8b131fcfa535ae3d63c0.png "动态字符串 sds")

- 如果新字符串小于1M，则新空间为扩展后字符串长度的两倍+1；
- 如果新字符串于1M，则新空间为扩展后字符串度+1M+1；
- 称为**内存预分配**；

sds优点：获取字符串长度的时间复杂度为O(1)；支持动态扩容；减少内存分配次数；根据len读取，二进制安全；可以存任意字节序列；

### intset

intset整数集合是set集合的其中一种实现方式，基于C整数数组，具备长度可变、唯一有序等特征。

```c
typedef struct intset {
    uint32_t enconding; //编码方式，支持存放16位、32位、64位整数
    uint32_t length; //元素个数
    int8_t contents[]; // 整数数组
} intset;
```

encoding三种编码长度，存的整数大小范围不同：如INTSET_ENC_INT16每个整数占2字节；

```c
/* Note that these encodings are ordered, so:
 * INTSET_ENC_INT16 < INTSET_ENC_INT32 < INTSET_ENC_INT64. */
#define INTSET_ENC_INT16 (sizeof(int16_t))/* 2字节整数，同java的short */
#define INTSET_ENC_INT32 (sizeof(int32_t))/* 4字节整数，同java的int */
#define INTSET_ENC_INT64 (sizeof(int64_t))/* 8字节整数，同java的long */
```

contents为方便查询按升序存整数；寻址公式：按索引查的元素地址=起始地址+(编码长度*索引)；

inset`insetUpgradeAndAdd()`类型升级机制实现可扩容：从int16_t编码开始，如果插入超过范围的整数就升级编码到int32_t或int64_t；修改编码encoding；每个元素都要扩展为大的编码长度；每个元素**倒序拷贝**并扩展空间后放到正确位置，防止覆盖；然后尾插一开始要加的元素；最后修改length；

`intsetSearch()`二分查找实现唯一和有序，查询效率不错；

### dict

dict字典，双列集合，redis所有的键值对都是用dict；dict三部分组成：哈希表 dicthashtable dictht 哈希表就是entry数组、哈希节点dictentry、字典dict；

```c
dictht {
    dictentry **table; //哈希表
    unsigned long size; //哈希表大小
    unsigned long sizemask; //哈希表大小掩码=size-1，用于取模算索引
    unsigned long used; //entry个数
}
```

```c
dictentry {
    void *key;//key
    union {
        void *val; //任意value
        uint64 u64;//无符号64位整数value
        int64 s64;//有符号64位整数value
        double d;//双精度浮点数value
    } v;
    dictentry *next;
}
```

c中的union联合体 共用体，一种特殊的结构体，两个成员不会同时有效，用于多个取其一的场景；next指向下一个entry，哈希冲突时的单向链表；

![dictht 结构](https://img.xicuodev.top/2026/04/270d3816db69dc0d3fec69b7ea6f35ea.png "dictht 结构")

添加entry时，先根据key算hash，再hash & sizemask取模算索引；索引相等说明哈希冲突，头插法插入单向链表，性能好，尾插法要遍历链表（然而找key是否已经存在也要遍历，其实没省多少性能；且并发头插会造成死链，但redis的单线程又弥补了这一点）；

> [!note] 数电：位运算替代取模运算
> 
> 二进制运算中，当模数是2的幂时，跟模数-1的与运算可以平替模运算。模数$2^6$=64二进制是0100 0000，64-1就是0011 1111，设x=abcd efgh，此时：x & (模数-1) = abcd efgh & 0011 1111 = 00cd efgh，保留了x的低6位，等效于取模。

```c
dict {
    dicttype *type;//dict类型，内置不同hash函数
    void *privdata;//私有，特殊hash运算用
    dictht ht[2];//两个哈希表，一个当前数据，一个一般为空，只rehash用
    long rehashidx;//rehash进度，-1未进行
    int16 pauserehash;//rehash是否暂停，1暂停，0继续
}
```

![dict 结构](https://img.xicuodev.top/2026/04/81eac69ab3de0ab1c652a33617b592cd.png "dict 结构")

#### dict扩容与收缩

dict的hashtable是数组+单向链表，当集合元素较多，哈希冲突增多，链表过长，查询效率大大降低。解决：负载因子LoadFactor = used:size，触发哈希表扩容的时机：

- 负载因子>=1，且没有bgsave或bgrewriteaof等后台进程，cpu有余力；
- 负载因子>5；

这会将数组扩容为从used+1向上取到的最近的2的幂，保证哈希取模算法成立；

负载因子<0.1，触发哈希表收缩；但不能小于DICT_HT_INITIAL_SIZE=4；

#### dict rehash

为什么rehash？因为sizemask用于计算写入和查询时的索引，扩容收缩后sizemask变了，索引也就变了；rehash就是给每个key重新计算索引，插入新的ht，保证跟新的sizemask对应；

1. 计算新ht的realeSize：

- 扩容：新size为第一个大于等于ht[0].used+1的2的幂
- 收缩：新size为第一个大于等于ht[0].used的2的幂，但不小于4

2. 按新realeSize申请内存，赋值给ht[1]；
3. rehashidx=0，开始rehash；
4. ~~ht[0]每个dictentry都rehash到ht[1]；~~
5. ht[1]赋值给ht[0]完成交接，ht[1]重新置空，释放原ht[0]内存；

第4步如果数百万entry rehash会阻塞主线程，不行；所以rehash是分多次、渐进式的，又称“渐进式rehash”，具体操作是：

4. 每次crud都检查rehashidx是否大于-1，即是否正在rehash，如果在则把ht[0].table[rehashidx]的entry链表rehash到ht[1]，并rehashidx++；直到ht[0]所有数据都rehash到ht[1]；rehash是移动，ht[0]的元素会越来越少；
6. rehashidx=-1，结束rehash；
7. rehash期间crud对ht[0] ht[1]两张表都查，否则不知道key是新增的还是未rehash的；新增操作直接写到ht[1]，查询修改删除两表都做；确保ht[0]只减不增，最后为空；

渐进式rehash是“redis这么快”的原因之一；

### ziplist



### quicklist

### 跳表skiplist

### redisobject

### 五种数据结构

## Redis 网络模型

## Redis 通信协议

## Redis 内存策略
