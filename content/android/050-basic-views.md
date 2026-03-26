---
weight: 50
slug: android-basic-views
title: Android 基本视图
---

## Android 屏幕相关参数

> [!tip] 屏幕相关参数
>
> **物理分辨率**（physical resolution）是屏幕可显示的像素个数，如 1920*1080 就是横向有 1920 个像素，纵向有 1080 个像素。
>
> **像素密度** (DPI, dots per inch, 每英寸点个数 = PPI, pixels per inch, 每英寸像素个数) 是屏幕每英寸长度上可以显示的像素点数，1 英寸相当于 2.54 厘米。计算 DPI 需要用到勾股定理，把横纵像素个数求平方和再开根，得到对角线上的像素个数 $\sqrt{w^2+h^2}$，再把它除以对角线的物理长度 $d$（英寸），即可得到屏幕的 DPI。
>
> $$ \mathrm{DPI}=\frac{\sqrt{w^2+h^2}}{d} $$
>
> **屏幕密度倍数** (density) 是一个相对比例系数，它不是一个绝对的物理值，而是一个为了适配相同尺寸、不同分辨率的屏幕而人为定义的“倍率”。移动系统通常定义 160 DPI 为“标准密度” 1x，屏幕的 DPI 是这个标准密度的几倍，它的密度倍数就是几，如 320 DPI 的屏幕的密度倍数就是 2x。
>
> $$ \mathrm{density}=\frac{\mathrm{DPI}_{\text{设备}}}{\mathrm{DPI}_{\text{基准}}}=\frac{\mathrm{DPI}_{\text{设备}}}{160} $$
>
> **设备独立像素** (dip, dp, density-independent pixels) 是一个逻辑长度单位，系统会将它乘以设备的屏幕密度倍数，得到实际的 `px` 像素长度。从函数的角度来说，因变量 `px` 与自变量 `dp` 和 `density` 的映射关系为：
>
> $$ \rm{px}={dip}\times{density} $$

## Android 颜色

关于颜色，有两种表示格式，分别是八位十六进制数（ARGB）和六位十六进制数（RGB），二者相差的那个 `A` 就是 `Alpha` 不透明度。每 2 位表示一个通道，如 ARGB 从高到低分别是不透明度、红色浓度、绿色浓度和蓝色浓度。这 2 位数字组成的十六进制数越大，度越高。

`android.graphics.Color` 类中有 12 种系统预定义的颜色常量：

| 颜色常量名    | 十六进制值 (ARGB) | 说明 |
| :------------ | :---------------- | :--- |
| `BLACK`       | `0xFF000000`      | 黑色 |
| `DKGRAY`      | `0xFF444444`      | 深灰 |
| `GRAY`        | `0xFF888888`      | 灰色 |
| `LTGRAY`      | `0xFFCCCCCC`      | 浅灰 |
| `WHITE`       | `0xFFFFFFFF`      | 白色 |
| `RED`         | `0xFFFF0000`      | 红色 |
| `GREEN`       | `0xFF00FF00`      | 绿色 |
| `BLUE`        | `0xFF0000FF`      | 蓝色 |
| `YELLOW`      | `0xFFFFFF00`      | 黄色 |
| `CYAN`        | `0xFF00FFFF`      | 青色 |
| `MAGENTA`     | `0xFFFF00FF`      | 玫红 |
| `TRANSPARENT` | `0x00000000`      | 透明 |

用来表示十六进制的前缀，在 XML 中为 `#`，在代码中为 `0x`。

你可以省略高 2 位用于表示不透明度的数字，在代码中省略默认为 `00`，即全透明；在 XML 中省略默认为 `FF`，即不透明。可以认为代码一律是按 ARGB 的格式处理颜色值的，而 XML 可以分别处理 RGB 和 ARGB 两种颜色格式。

## 基本文本属性

`TextView` 是文本视图，在 XML 布局文件中配置它的属性：

- 文本内容：`text`
- 文本大小：`textSize`（字号单位 `px`, `dp`, `sp`）
- 文本颜色：`textColor`

> [!tip] 从代码设置属性
>
> 在代码中，一般可通过 `setXXX()` 设置视图的属性。如果是从 `R` 资源对象获取 `res` 目录中的静态资源，需要用到 `setXXXResource()`。这是 Android SDK 的一种命名惯例。
> 
> 如果你在代码中发现某个属性没有 `setXXXResource()` 方法，通常意味着你需要先通过 `getResources().getXXX(R.xxx.xxx)` 手动获取资源，再传递给基础的 `setXXX()` 方法。特别地，`setText()` 本身有从资源目录获取的重载，不需要那些额外的步骤。

代码中长度数值的单位一般是 `px`，你可以手动计算出 `dp` 对应的 `px`：

```java
public static int dip2px(Context context, float dip) {
    float density = context.getResources()
        .getDisplayMetrics().density; /* 屏幕密度倍数 */
    return Math.round(dip * density);
}
```

> [!note] 字号单位
>
> `px`、`dp` 和 `sp` 都可以是字号的单位。其中，`px` 是手机屏幕的最小显示单位；`dp` 是只与手机屏幕的物理尺寸有关的单位，与屏幕分辨率无关；`sp` 是专门用于字号的单位，在 Android 系统中可以调整基准字号，从而影响 `sp` 的实际大小。

## 基本视图属性

- 视图宽高：`layout_width` 和 `layout_height`，取值 `match_parent` 匹配父视图、`wrap_content` 包裹自身内容、具体数值和单位
- 视图间距：`layout_margin` 外边距、`padding` 内边距（上下左右都有单独属性）
- 视图对齐方式：`layout_gravity` 自己在父视图中的对齐方式、`gravity` 子视图在自己中的对齐方法，取值上下左右中间，可以用管道符 `|` 组合两个轴的方位使用

## 常用布局视图

`ViewGroup` 是 `View` 的子类，但它的作用不是显示内容，而是作为容器来装载其他的视图。

### 线性布局 `LinearLayout`

线性布局的子视图按一条线排列。

- `orientation` 子视图排列方式，取值 `horizontal` 水平排列、`vertical` 垂直排列，默认水平排列
- `layout_weight` 自己在父视图所占地方的权重（自己的权重值占总权重值的比值），如果设置宽或高为 `0dp`，则就按权重来算宽或高

### 相对布局 `RelativeLayout`

相对布局的子视图位置是相对于自己或其他子视图而言的，子视图默认放在相对布局的左上角。

| 相对位置的属性名           | 相对位置                 |
| -------------------------- | ------------------------ |
| `layout_toLeftOf`          | 在指定视图的左边         |
| `layout_toRightOf`         | 在指定视图的右边         |
| `layout_above`             | 在指定视图的上方         |
| `layout_below`             | 在指定视图的下方         |
| `layout_alignLeft`         | 与指定视图的左侧对齐     |
| `layout_alignRight`        | 与指定视图的右侧对齐     |
| `layout_alignTop`          | 与指定视图的顶部对齐     |
| `layout_alignBottom`       | 与指定视图的底部对齐     |
| `layout_centerInParent`    | 在上级视图中间           |
| `layout_centerHorizontal`  | 在上级视图的水平方向居中 |
| `layout_centerVertical`    | 在上级视图的垂直方向居中 |
| `layout_alignParentLeft`   | 与上级视图的左侧对齐     |
| `layout_alignParentRight`  | 与上级视图的右侧对齐     |
| `layout_alignParentTop`    | 与上级视图的顶部对齐     |
| `layout_alignParentBottom` | 与上级视图的底部对齐     |

### 网格布局 `GridLayout`

网格布局支持多行多列的网格排列，按从左到右、从上到下的顺序排列子视图。

- `android:columnCount` 列数
- `android:rowCount` 行数

### 滚动视图 `ScrollView`

滚动视图只能有一个子视图，它应该是一个布局视图，在它里面再放多个具体视图。

- `ScrollView` 垂直方向的滚动视图，高度应为“包裹内容”
- `HorizontalScrollView` 水平方向的滚动视图，宽度应为“包裹内容”

## 常用控件视图

控件（widget）是那些能够直接与用户交互的视图。

### 按钮控件 `Button`

`Button` 继承自 `TextView`，相较于父类的特点有：有默认背景填充，文本默认居中，默认把英文转为全大写。

`Button` 新增的属性：

- `textAllCaps` 属性：是否把英文转为全大写
- `onClick` 属性：指定点击事件的事件处理器，也就是一个方法
- 可以在 `Button` 的文本上下左右添加图片，只要指定 `drawableTop`、`drawableLeft`、`drawableStart` 等属性，`drawablePadding` 指定文本和图片的间距。然而，如果图片过大，`Button` 也并没有调整这些图片尺寸的 XML 属性。

在代码中通过事件监听器 `Listener` 监听 `Button` 的交互事件：

- 点击事件：`setOnClickListener()` 按住低于 500 毫秒时触发
- 长按事件：`setOnLongClickListen()` 按住超过 500 毫秒时触发
- 禁用与恢复按钮：`enabled`，禁用时为灰色或不醒目状态

### 图片视图控件 `ImageView`

- `src` 源文件，图片路径
- `scaleType` 缩放类型

`ImageView` 默认的缩放方式就是等比缩放使得能在容器中正好放下，并居中放置，即 `FIT_CENTER`。

| XML 缩放类型   | `ScaleType` 常量 | 说明                                                     |
| -------------- | ---------------- | -------------------------------------------------------- |
| `fitXY`        | `FIT_XY`         | 拉伸到填满视图（图片可能被拉变形）                       |
| `fitStart`     | `FIT_START`      | 等比缩放到恰好放下，放到视图上侧或左侧                   |
| `fitCenter`    | `FIT_CENTER`     | 等比缩放到恰好放下，居中放置                             |
| `fitEnd`       | `FIT_END`        | 等比缩放到恰好放下，放到视图下侧或右侧                   |
| `center`       | `CENTER`         | 保持原尺寸，居中放置                                     |
| `centerCrop`   | `CENTER_CROP`    | 等比缩放到填满视图，居中放置（超出视图范围的将被裁切）   |
| `centerInside` | `CENTER_INSIDE`  | 放得下时保持原尺寸，放不下时等比缩小到恰好放下，居中放置 |

### 图片按钮控件 `ImageButton`

`ImageButton` 继承自 `ImageView` 而非 `Button`，它与父类 `ImageView` 的区别在于：它没有默认的按钮背景，它的默认缩放类型是 `center`，`ImageView` 的默认缩放类型是 `fitCenter`。

`ImageButton` 与 `Button` 的区别在于：

- `ImageButton` 只能放图片不能放文本，而 `Button` 两个都能放。
- `ImageButton` 的图片是默认等比缩放的，且能通过 `scaleType` 更改，而 `Button` 的背景图片只能拉伸变形，没有 `scaleType`。
- `ImageButton` 能在背景和前景（`src`）各放一张图片，而 `Button` 能在背景和文本的上下左右各放一张。

如果你需要一个纯图标且对图标缩放比例有严格要求的按钮，用 `ImageButton`；如果你需要文字+图标，或者单纯的文字按钮，用 `Button`。
