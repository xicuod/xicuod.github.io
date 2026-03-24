---
weight: 120
slug: android-activity-extras
title: Activity 附加数据
---

Activity 可以从非源码目录拿取 `Resource` 静态资源，比如通过 `getString()` 和 `R.string` 可以拿到 `res/values/strings.xml` 中的字符串：

```java
String value = getString(R.string.test_from_res);
text_resource.setText(value);
```

## 元数据

通过 `getPackageManager()` 得到当前应用的包管理器，通过包管理器的 `getActivityInfo()` 获得当前活动的信息对象，通过信息对象的 `metaData` 可以拿到 `AndroidManifest.xml` 中 `<activity>` 的子节点 `<meta-data>` 中的元数据，这种方式一般用于使用接入第三方 SDK 的 `token`：

```xml {filename=strings.xml}
<string name="sdk_token">5cba9bc46a341e97cdd4a7f1258a263</string>
```

```xml {filename=AndroidManifest.xml}
<meta-data android:name="sdk_token" android:value="@string/sdk_token" />
```

```java
try {
    Bundle metaDataBundle = getPackageManager()
            .getActivityInfo(getComponentName(), PackageManager.GET_META_DATA)
            .metaData;
    String token = metaDataBundle.getString("sdk_token");
    textView.setText(String.format("SDK token: %s", token));
} catch (PackageManager.NameNotFoundException e) {
    throw new RuntimeException(e);
}
```

### 元数据实现快捷方式菜单

元数据不仅能传递简单的字符串参数，还能传递复杂的资源，比如支付宝的快捷方式菜单，这是 Android 7.0 的新功能。

```xml {filename=AndroidManifest.xml}
<meta-data
    android:name="android.app.shortcuts"
    android:resource="@xml/shortcuts" />
```

在 `res/xml/shortcuts.xml` 中配置具体的快捷方式：

```xml {filename=shortcuts.xml}
<?xml version="1.0" encoding="utf-8" ?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">

    <shortcut
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutId="action"
        android:shortcutLongLabel="@string/shortcut_action_long"
        android:shortcutShortLabel="@string/shortcut_action_short">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetClass="top.xicuodev.android.quickstart.ActionDemo"
            android:targetPackage="top.xicuodev.android.quickstart" />
        <categorires android:name="android.shortcut.conversation" />
    </shortcut>

    <shortcut
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutId="meta"
        android:shortcutLongLabel="@string/shortcut_meta_long"
        android:shortcutShortLabel="@string/shortcut_meta_short">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetClass="top.xicuodev.android.quickstart.MetaDataDemo"
            android:targetPackage="top.xicuodev.android.quickstart" />
        <categorires android:name="android.shortcut.conversation" />
    </shortcut>

</shortcuts>
```
