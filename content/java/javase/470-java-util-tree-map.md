---
weight: 470
slug: java-util-tree-map
title: java.util.TreeMap
---

`TreeMap` 底层：跟 `TreeSet` 一样，都是红黑树结构。

`TreeMap` 特点：不重复、无索引、可排序 (由键决定)

- 可排序：自动对键排序，默认按键的从小到大排序，也可以自定义键的排序规则

`TreeMap` 存储自定义键类型时，指定排序比较规则的两种方式：具体见 [`TreeSet`]({{% sref "java-util-tree-set" %}})

1. 实现 `Comparable` 接口，指定比较规则。
2. 创建集合时传递 `Comparator` 比较器对象，指定比较规则。

`TreeMap` 内部成员：

- 成员变量：`Comparator` 比较器对象、`Entry<K,V> root` 根节点、`int size` 长度
- 空参、带参构造 (初始化比较器对象)
- 成员方法：
  - `put(K key, V value)`：调用三个参数的 `put` 方法，返回被覆盖的元素
  - `put(K key, V value, boolean replaceOld)`：返回被覆盖的元素
    - `boolean replaceOld`：重复是否覆盖
    - 根节点为 `null`：调用 `addEntryToEmptyMap` 方法，返回 `null` 为没有覆盖
    - `parent`：要添加节点的父节点，`cpr`：比较器对象，`t` 是遍历指针
    - 判断是否有比较器：`cpr` 为 `null` 时，采用自然排序；`cpr` 不为 `null` 时，采用比较器排序
    - 采用比较器排序：调用 `cpr.compare(key, t.key)` 比较大小
    - 采用自然排序：把要添加的键 `key` 强转为 `Comparable<? super K> k` (`k` 是消费者，采用有下界泛型，[PECS 原则]())，调用 `k.compareTo(t.key)` 比较大小
    - 比较结果：
      - 如果比较结果为负数，`t` 往左子树遍历
      - 如果比较结果为正数，`t` 往右子树遍历
      - 如果比较结果为 `0`，覆盖 `t` 的值，返回 `oldValue`
    - `t` 为 `null` 时，到达树梢，结束遍历，调用 `addEntry` 方法添加节点，返回 `null`
  - `addEntry` 方法：插入节点后，调用 `fixAfterInsertion` 方法维护红黑树
  - `fixAfterInsertion` 方法：[红黑树]()插入规则
    - `parentOf` 方法：获取父节点；`leftOf` 方法：获取左子节点；`rightOf` 方法：获取右子节点
    - `rotateLeft` 方法：对传入节点左旋；`rotateRight` 方法：对传入节点右旋
    - 当前节点为根：直接变为黑色，退出遍历
    - 当前节点不为根，父节点为黑色：不做任何操作，退出遍历
    - 当前节点不为根，父节点为红色：继续下面的判断
    - 父节点是否为爷爷节点的左子节点：
      - 是：爷爷节点的右子节点为叔叔节点
      - 否：爷爷节点的左子节点为叔叔节点
    - 叔叔节点为红色：父节点和叔叔节点设为黑色，爷爷节点设为红色，继续判断爷爷节点是否满足红黑树规则
    - 叔叔节点为黑色：
      - 当前节点为右子节点：对父节点左旋，继续判断父节点
      - 当前节点为左子节点：父节点设为黑色，爷爷节点设为红色，对爷爷节点右旋，继续判断爷爷节点
    - 爷爷是根节点：退出遍历，设置根节点为黑色
