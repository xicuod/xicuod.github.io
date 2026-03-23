---
weight: 100
slug: android-activity-launch-mode
title: Activity 启动模式
---

活动（activity）创建后会放到任务栈（task stack）中运行，先进后出。启动（launch）一个活动的行为模式有很多种，如下所述。

## 任务栈

任务栈不属于应用进程，而是由安卓系统的 AMS (`ActivityManagerService`，活动管理服务) 统一管辖的。应用进程只是创建活动实例并指定它的启动模式，然后把它交给 AMS，由 AMS 操作任务栈来把它显示出来。这意味着一个任务栈可以有来自不同应用进程的活动。

- 同时只能有一个任务栈在前台，其他的任务栈都在后台。
- 如果前台的任务栈清空，会自动回到最近的后台任务栈，如果没有后台任务栈了，就返回桌面。

## `launchMode` 在清单中配置 Activity 启动模式

在 `AndroidManifest.xml` 中，通过配置 `<activity>` 节点的 `android:launchMode` 属性来指定 Activity 启动模式。

```xml
<activity android:name=".SomeActivity" android:launchMode="singleTask" />
```

### 标准启动模式 `standard`

标准启动模式 `standard` 就是不管栈中有没有现成的这个活动的实例，每次启动这个活动都创建一个新的实例压入栈中。

### 栈顶复用模式 `singleTop`

栈顶复用模式 `singleTop` 就是如果栈顶就是这个活动的实例，那么就复用栈顶的活动实例，不创建一个新的活动实例。如果栈顶是其子类实例，不会复用（类必须严格匹配）。

### 栈内复用模式 `singleTask`

栈内复用模式 `singleTask` 就是如果栈内已经有这个活动的实例，那么就弹出并销毁它上面所有的实例，然后复用它。

> [!tip] 任务亲和性
>
> `singleTask` 要看这个活动的 `taskAffinity`（任务亲和性）属性，默认是应用包名。启动时，找到包含它的实例且亲和性一致的任务栈，切换到该任务栈，弹出并销毁其上的所有实例，复用该实例；如果找不到，就创建它的实例，并创建一个这样的任务栈放它。

### 全局唯一模式 `singleInstance`

全局唯一模式 `singleInstance`（单例模式）就是第一次启动这个活动时，创建一个专门的任务栈来放它的实例；之后如果再次启动它，就把这个任务栈唤到前台，复用其中的实例。

> [!note] 独占模式
>
> `singleInstance` 栈由其中的一个活动实例独占，从该栈启动其他活动时，不会放入该栈。

## `FLAG` 在代码中配置 Activity 启动模式

在 Java 和 Kotlin 代码中，通过 `Intent` 的实例方法 `setFlags()` 配置意图的标志（flag）来指定活动的启动模式。

```java
intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
```

| 标志                   | 核心行为                                   |
| ---------------------- | ------------------------------------------ |
| `NEW_TASK`             | 在新任务中启动                             |
| `SINGLE_TOP`           | 栈顶复用                                   |
| `CLEAR_TOP`            | 清除目标实例之上（含）的所有实例并新建实例 |
| `CLEAR_TASK`           | 清空整个任务栈后再启动                     |
| `REORDER_TO_FRONT`     | 将已存在的实例移到栈顶（不清除上方）       |
| `NO_HISTORY`           | 不保留在任务栈中                           |
| `MULTIPLE_TASK`        | 允许创建多个相同亲和性的任务               |
| `NEW_DOCUMENT`         | 作为独立文档任务启动                       |
| `RETAIN_IN_RECENTS`    | 任务清空后仍保留在最近任务列表             |
| `EXCLUDE_FROM_RECENTS` | 不显示在最近任务列表                       |

这些标志可以组合使用，但需要注意冲突。AMS 会根据这些标志调整它在不同阶段的决策，而不是简单的先后执行。总之记住一句话，AMS 总是先决定“这个 Activity 应该去哪个任务栈”，然后再决定“在这个栈里怎么处理它（新建、复用还是清场）”。

> [!note] 复用时 `onNewIntent()`
>
> 当 Flag 使得 Activity 复用而非新建时，务必在 `onNewIntent()` 中调用 `setIntent(intent)` 以更新数据。

### 常用 `FLAG` 组合

- 返回首页或关闭其他：`FLAG_ACTIVITY_CLEAR_TOP` + `FLAG_ACTIVITY_SINGLE_TOP`
- 退出登录或重置应用：`FLAG_ACTIVITY_CLEAR_TASK` + `FLAG_ACTIVITY_NEW_TASK`
- 非活动环境启动：`FLAG_ACTIVITY_NEW_TASK`

## 辨析两种配置方式

`FLAG` 是动态配置，更灵活，`launchMode` 是静态配置，用于配置默认行为。当两者同时出现时，`FLAG` 的优先级高于 `launchMode`。它们是两套互补的控制系统，虽然有重叠，但无法完全通过组合互相替代，平时要将它们结合起来使用。
