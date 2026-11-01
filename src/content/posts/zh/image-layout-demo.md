---
title: 图片排版示范：怎么在文章里放图
description: 一篇写作示范文章，把常用的几种图片排版都跑一遍。
date: 2026-11-01
category: 建站
tags: [Markdown, 图片, 排版]
draft: false
featured: false
---

这篇文章是示范，所有图片都真实存在于 `public/media/` 下，所以在本地和线上都能看到效果。

## 一、最基础的写法

图片文件放在 `public/media/articles/`，正文里用**从 `/media/` 开始的绝对路径**：

```markdown
![说明文字](/media/articles/demo-road.jpg)
```

效果：

![骑到没有树荫的那一段](/media/articles/demo-road.jpg)

如果图片显示不出来，九成是路径写成了 `public/media/...` 或 `./media/...`，把前缀统一改成 `/media/` 就对了。

## 二、带图注的图

Markdown 原生的 `![说明](路径)` 里那段说明**只会成为 alt 文本**（给读屏器和搜索引擎看），页面上不显示。要让图注真正显示出来，用 HTML 的 `<figure>`：

```html
<figure>
  <img src="/media/articles/demo-road.jpg" alt="公路">
  <figcaption>骑到没有树荫的那一段，2024 年 10 月</figcaption>
</figure>
```

效果（下面这行灰色小字就是图注）：

<figure>
  <img src="/media/articles/demo-road.jpg" alt="公路">
  <figcaption>骑到没有树荫的那一段，2024 年 10 月</figcaption>
</figure>

## 三、控制图片大小

想让它小一点，加 `width` 属性（单位是像素，高度会自动按比例）：

```html
<img src="/media/articles/demo-portrait.jpg" width="320" alt="竖图示例">
```

效果：

<img src="/media/articles/demo-portrait.jpg" width="320" alt="竖图示例">

竖图如果不限宽，会撑满整个正文栏，看起来很有压迫感。320～420 是比较舒服的宽度。

## 四、两张图并排

Markdown 没有原生的并排语法，用表格最省事，图片会自动各占一列、等宽：

```markdown
| 左图 | 右图 |
| --- | --- |
| ![左](/media/articles/demo-road.jpg) | ![右](/media/articles/demo-portrait.jpg) |
```

效果：

| 左图 | 右图 |
| --- | --- |
| ![左](/media/articles/demo-road.jpg) | ![右](/media/articles/demo-portrait.jpg) |

## 五、复用相册里的图

相册里的图不用再传一遍，直接引用就行：

```markdown
![](/media/gallery/travel/jiuzhaigou-20251001.jpg)
```

效果：

![](/media/gallery/travel/jiuzhaigou-20251001.jpg)

## 六、图片和代码混排

图片、代码块、文字可以随意穿插，行内代码 `像这样` 也没问题：

```python
import numpy as np

# 计算自由空间路径损耗
def fspl(d_km, f_mhz):
    return 32.44 + 20 * np.log10(d_km) + 20 * np.log10(f_mhz)

print(fspl(10, 2400))
```

算完之后可以再贴一张结果图：

<img src="/media/articles/demo-road.jpg" width="420" alt="结果">

## 七、对照表：哪些写法管用

| 写法 | 结果 |
| --- | --- |
| `![](/media/articles/a.jpg)` | ✅ 显示，占满栏宽 |
| `![](public/media/articles/a.jpg)` | ❌ 404 |
| `![](./media/articles/a.jpg)` | ❌ 404 |
| `![[a.jpg]]` | ❌ Obsidian 语法，会原样显示成文字 |
| `<img src="/media/articles/a.jpg" width="300">` | ✅ 显示，宽 300px |
| `<figure>` + `<figcaption>` | ✅ 显示，并带图注 |

## 八、这张图是哪来的

`demo-road.jpg` 和 `demo-portrait.jpg` 是我用项目里已装的 `sharp` 从 `photos/` 的原图压出来的，命令长这样：

```powershell
node -e "require('sharp')('photos/日常/cycling-road-20241001.jpg').resize({width:900}).jpeg({quality:82}).toFile('public/media/articles/demo-road.jpg')"
```

自己往文章里加图时，照这个格式改文件名就行。压到 **200 KB 以内**比较理想，超过 500 KB 访客就要开始等了。

---

示范到此。图片路径、图注、并排、宽度、复用相册这几招够用了，剩下的排版交给 Markdown 本身。
