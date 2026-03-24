---
weight: 110
slug: android-intent
title: Android 意图
---

意图（intent）是各个组件之间沟通的桥梁，用于标明通信从哪来、到哪去和怎么走，以及发送方与接收方之间互相的数据传递。意图分为显式意图和隐式意图。

## 显式意图

显式意图是直接指定来源和目标活动，是精确匹配，有三种构建方式：`Intent` 类的构造方法、`setClass()` 实例方法或 `setComponent()` 实例方法。显式意图适合本应用内的活动跳转。

`Intent()` 构造方法：

```java
Intent intent = new Intent(this, NextActivity.class);
```

`setClass()` 实例方法：

```java
intent.setClass(this, NextActivity.class);
```

`setComponent()` 实例方法：传入 `ComponentName` 对象

```java
intent.setComponent(new ComponentName((this, NextActivity.class)));
```

`ComponentName()` 构造方法允许直接传入包名，可以指定拿不到实例但知道包名的组件。

## 隐式意图

隐式意图没有明确指定目标活动，只给出一个动作字符串让系统自动匹配，是模糊匹配。隐式意图适合从本应用启动别的应用提供的活动。但要注意如果需要跨应用协作，需要在动作接收者的 `<activity>` 节点设置 `android:exported` 属性为 `true`，来允许其他应用访问该活动。

应用通常不想向外部暴露活动名称，只给出约定的动作字符串。这个动作字符串可以是自定义的动作，也可以是系统已有的动作，常见的系统动作有：

| 系统动作常量名       | 常量值字符串                        | 功能                     |
| -------------------- | ----------------------------------- | ------------------------ |
| `ACTION_VIEW`        | `android.intent.action.VIEW`        | 特定组件                 |
| `ACTION_MAIN`        | `android.intent.action.MAIN`        | 应用启动入口             |
| `ACTION_SEND`        | `android.intent.action.SEND`        | 通用的分享动作           |
| `ACTION_GET_CONTENT` | `android.intent.action.GET_CONTENT` | 让用户选择特定类型的数据 |

创建隐式意图：

- 构造方法：`Intent(String action)`
- 实例方法：`setAction(String action)`

有些动作需要更详细的匹配参数，需要用到 Uri 和 Category，指定 Uri：

- 构造方法：`Intent(String action, Uri uri)`
- 实例方法：`setData(Uri uri)`

指定 Category：实例方法 `addCategory(String category)`，一个意图可以有多个 Category。

## `<intent-filter>` 自定义意图

你可以在自己的应用清单中的 `<activity>` 节点中加入 `<intent-filter>` 子节点，来自定义别人对你的活动可以有哪些动作意图。

```xml
<intent-filter>
    <action android:name="android.intent.action.XICOUD" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```

别人可以通过下面的代码执行你的动作，而且如果他不特殊指定[启动标志]({{% sref "android-activity-launch-mode#flag-在代码中配置-activity-启动模式" %}})，你的活动会直接放到他的任务栈中：

```java
Intent intent = new Intent();
intent.setAction("android.intent.action.XICOUD");
intent.addCategory(Intent.CATEGORY_DEFAULT);
startActivity(intent);
```

## `Bundle` 用意图发送数据

`Intent` 使用 `Bundle` 携带待传递的发送数据，通过它的 `putExtras(bundle)` 实例方法装载 `Bundle` 对象。

`Bundle` 是双列集合，键是字符串，值支持许多类型，如整型、单精度浮点型、双精度浮点型、布尔型、字符串、字符串数组、字符串列表、可序列化类型（`Parcelable` 或 `Serializable`）等，读写方法名简单易懂，对于整数型就是 `getInt(key)` 和 `putInt(key, value)`，其他同理。

值得注意的是，`Bundle` 并不是支持所有 `List`，它主要支持 `Integer`、`String` 和 `CharSequence` 类型的 `ArrayList`。如果是自定义对象的 `ArrayList`，则该对象必须实现 `Parcelable` 接口（用于序列化和反序列化，是安卓推荐的接口，比 Java 原生的 `Serializable` 性能更好）。

你还能 `Bundle` 套 `Bundle`，也就是把一个 `Bundle` 对象作为另一个 `Bundle` 中的一个值。

如果业务不复杂，可以直接用 `Intent` 的不带复数的 `putExtra(key, value)` 实例方法，也是一样的。`putExtra()` 和 `putExtras()` 都是把键值对存到同一个内部的双列集合（也是 `Bundle` 类型的变量 `mExtras`）。

```java
Bundle bundle = new Bundle();
bundle.putString("request_time",
        LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
bundle.putString("request_content", editor.getText().toString());
intent.putExtras(bundle);
intent.putExtra("request_activity", this.toString());
```

在意图的接收方，通过 `getIntent()` 获取发送过来的意图，再通过 `getExtras()` 获取意图携带的 `Bundle`。

```java
Bundle bundle = getIntent().getExtras();
```

## `Result` 用意图返回数据

接收方要返回数据给发送方，首先发送方需要调用 ~~`startActivityForResult()`~~ 表明它需要接收方返回响应数据，接着接收方处理请求数据，最后接收方打包响应数据到一个意图中，并调用 `setResult(intent)` 和 `finish()` 方法完成返回。

> [!warning] `startActivityForResult()` 已弃用
>
> `startActivityForResult()` 在更高的 API 版本中已弃用，替代方案为 `registerForActivityResult()` 与 `ActivityResultLauncher`（即该方法的返回值）。后者方法是注册操作，需要写在生命周期的 `onCreate()` 方法中。它的第二个参数是一个函数式接口 `ActivityResultCallback<ActivityResult>`，用于回调，发送方需要实现接口的 `onActivityResult()` 方法来获取并处理响应数据。当然，这属于经典表述，实际就是写 lambda 表达式。

在这个过程中，数据是随着接收方 Activity 栈帧的弹出，由系统进程 AMS 从被销毁的接收方 Activity 中“取走”，并在唤醒发送方 Activity 时“塞给”它的。但要注意，接收方和发送方必须要在同一个任务栈内，跨任务栈是无法通过此机制返回结果的；用户手动按返回键退出接收方 Activity 也是不行的，会视为取消操作（如果你不想这样，则需要重写按下返回键的生命周期方法）。这两种情况下，发送方会立即收到一个代码为 `RESULT_CANCELED` 的 `Result`。

```java {filename=receiver}
private void response(String requestTime) {
    Intent intent = new Intent();
    Bundle bundle = new Bundle();
    bundle.putString("response_time", LocalDateTime.now().toString());
    bundle.putString("response_content",
            LocalDateTime.parse(requestTime).plusYears(1000).toString());
    intent.putExtras(bundle);
    setResult(RESULT_OK, intent);
    finish();
}
```

```java {filename=sender}
@Override
protected void onCreate(Bundle savedInstanceState) {
    /* ... */
    ActivityResultLauncher<Intent> launcher = registerForActivityResult(
        new ActivityResultContracts.StartActivityForResult(),
        this::handleResponse
    );
    requestBtn.setOnClickListener(view -> {
        /* ... */
        launcher.launch(intent);
    });
    /* ... */
}

private void handleResponse(ActivityResult result) {
    String responseMsg = "没有响应数据或接收方处理异常";
    Intent intent = result.getData();
    int resultCode = result.getResultCode();
    Bundle bundle = null;
    if (intent != null && resultCode == RESULT_OK) bundle = intent.getExtras();
    if (bundle != null) {
        String responseTime = bundle.getString("response_time");
        String responseContent = bundle.getString("response_content");
        responseMsg = String.format("[%s] %s", responseTime, responseContent);
    }
    debugText.setText(responseMsg);
}
```
