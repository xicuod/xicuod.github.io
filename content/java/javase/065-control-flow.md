---
weight: 65
slug: java-control-flow
title: Java 流程控制
---

## `break` 和 `continue`

`break` 在任何循环语句的主体部分，均可用 `break` 控制循环的流程。`break` 用于强行退出循环，不执行循环中剩余的语句 (`break` 语句也在 `switch` 语句中使用)。

`continue` 用在循环语句体中，用于终止某次循环过程，即跳过循环体中尚未执行的语句，接着进行下一次是否执行循环的判定。

## `goto`

`goto` 关键字很早就在程序设计语言中出现。尽管 `goto` 仍是 Java 的一个保留字，但并未在语言中得到正式使用。Java 没有 `goto`。然而，在 `break` 和 `continue` 这两个关键字的身上，我们仍然能看出一些 `goto` 的影子——带标签的 `break` 和 `continue`。

## 标签 `<label>:`

标签是后面跟一个冒号的标识符，例如 `someLabel:`。标签要与 `goto`、`break` 或 `continue` 配合使用，`goto someLabel` 用于跳到指定标签的位置。

对 Java 来说，唯一用到标签的地方是在循环语句之前。而在循环之前设置标签的唯一理由是：我们希望在其中嵌套另个循环，由于 `break` 和 `continue` 关键字通常只中断当前循环，但若随同标签使用，它们就会中断到存在标签的地方。除非是内循环跳外循环，否则不建议使用。

```java
int count = 0;
outer: for (int i = 101; i < 150; i++) {
    for (int j = 2; j < i / 2; j++) {
        if (i % j == 0) {
            continue outer;
        }
    }
}
```
