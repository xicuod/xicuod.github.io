---
weight: 450
slug: java-util-hash-map
title: java.util.HashMap
---

`HashMap` 是 `Map` 接口的实现类，没有额外需要学习的特有方法，直接使用 `Map` 里面的方法就可以了。

`HashMap` 特点：是由键决定的：无序、不重复、无索引

`HashMap` 底层：跟 `HashSet` 是一模一样的，都是哈希表结构 (数组 + 链表 + 红黑树)

- 哈希值：利用键计算哈希值，跟值无关
- 哈希冲突时，比较属性值只比较键，若键已存在，覆盖原有的键值对
- 依赖 `hashCode` 和 `equals` 方法保证键的唯一性
  - 如果键存储自定义对象，需要重写 `hashCode` 和 `eguals` 方法
  - 如果值存储自定义对象，不需要重写 `hashCode` 和 `equals` 方法

`HashMap` 内部类：

- `Node`：数组和链表节点，实现 `Map.Entry<K,V>` 接口
- `TreeNode`：红黑树节点，实现 `LinkedHashMap.Entry<K,V>` 接口，后者继承 `Map.Entry<K,V>` 接口

`HashMap` 内部方法：

- `HashMap.hash(Object key)`：把键的一般哈希值和数组长度做一些数学运算，得到键对数组的哈希值
- `putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict)`：
  - `int hash` 参数：调用 `hash` 方法计算的键的哈希值
  - `boolean onlyIfAbsent` 参数：只有当键不存在时才插入 = 重复不覆盖，默认 `false` = 重复时覆盖
  - `boolean evict` 参数：暂时不必了解
- `resize` 方法：返回从当前容量扩容后的数组
- `treeifyBin` 方法：数组长达 64 时，把链表转为红黑树

`putVal` 添加元素的三种情况：

1. 数组上的位置为 `null` (键第一次存)：直接存入
2. 数组上的位置不为 `null`，键不重复 (键第一次存但哈希冲突)：挂在下面形成链表或者红黑树
   - 链表长度大于 8 时，调用 `treeifyBin` 方法尝试把链表转为红黑树，`treeifyBin` 方法继续判断数组长度是否达标
   - 调用 `putTreeVal` 方法往红黑树上添加元素
3. 数组上的位置不为 `null`，键重复 (键第二次存)：覆盖原有元素，底层是覆盖老元素的值为新值
   1. 先比较哈希值，不一样说明不重复
   2. 若哈希值一样，由于存在哈希碰撞，还要调用 `key.equals(k)` 确认是否真的重复
   3. 如果不重复，直接 `break` 当前循环轮次；如果重复了，继续往下执行
   4. 局部变量 `e` 引用键重复了的老元素，如果不为 `null` 说明重复了
   5. 把 `e` 的值赋为新值，并返回 `e` 的旧值
