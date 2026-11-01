# 视觉：设计 token、双主题、场景图形

## 一条铁律

**所有颜色只出现在 `tokens.css` 里。** 组件里写 `color: #5ea0ff` 就再也改不动主题了。

## 语义变量清单

```css
:root {
  color-scheme: light;

  /* 表面与文字 */
  --page: #f4eeda;       /* 页面底色 */
  --page-soft: #ebe2c6;  /* 次级区块 */
  --surface: #faf5e6;    /* 卡片表面 */
  --text: #14130f;       /* 主文字 */
  --muted: #5f5a4b;      /* 次要文字 */
  --line: #d2c7a9;       /* 分隔线 */

  /* 交互色 */
  --accent: #1b1a15;
  --accent-soft: #e5dbc0;
  --accent-strong: #000;
  --focus: #1b1a15;      /* 焦点环，必须和背景有 3:1 对比 */

  /* 章节色：一章一个，id 与章节定义对应 */
  --accent-chapter-one: #a5342a;
  --accent-chapter-two: #3b5a6b;
  --accent-chapter-three: #3f6257;
  --accent-chapter-four: #414a68;
  --accent-chapter-five: #5a4658;
  --accent-chapter-six: #6b5433;

  /* 字体 */
  --font-ui: Inter, ui-sans-serif, system-ui, 'Noto Sans SC', sans-serif;
  --font-display: 'Iowan Old Style', 'Noto Serif SC', 'Songti SC', Georgia, serif;
  --font-mono: ui-monospace, 'JetBrains Mono', Menlo, monospace;

  /* 尺寸 */
  --content-width: 74rem;
  --gutter: clamp(1.25rem, 4vw, 4rem);
  --header-height: 4rem;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --page: #14130e;
  --text: #ece4cd;
  /* ...每个变量都要有深色版本 */
}
```

**深色不是把浅色反相**。浅色是纸，深色是夜，两者应该各自成立。

## 章节色怎么用

HTML 上标章节，CSS 自动继承：

```html
<section data-chapter="chapter-two"> ... </section>
```

```css
[data-chapter='chapter-two'] { --scene: var(--accent-chapter-two); }

/* 章节内所有强调元素都用 --scene */
.chapter-marker { color: var(--scene); }
.scene-line { stroke: var(--scene); }
```

这样一章只要一行 CSS 就能换色，组件里不出现任何具体颜色。

## 双画风（可选，但加分）

明暗之外再叠一层「画风」，用 `data-art` 控制：

```html
<html data-art="ink" data-theme="light">
```

```css
/* 四组色板：画风 × 明暗 */
:root { /* 画风 A × 浅色 */ }
:root[data-theme='dark'] { /* 画风 A × 深色 */ }
:root[data-art='ink'] { /* 画风 B × 浅色 */ }
:root[data-art='ink'][data-theme='dark'] { /* 画风 B × 深色 */ }
```

**画风和明暗要解耦**，各自独立存储：

```js
document.documentElement.dataset.art = localStorage.getItem('art') ?? 'oil';
document.documentElement.dataset.theme = localStorage.getItem('theme') ?? 'dark';
```

不要「切画风顺带切明暗」——用户想同时看四种组合。

## 场景图形：内联 SVG，不用图片

每章一个背景场景，全部手写 SVG：

```astro
---
// components/scenes/SceneOne.astro
---
<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
     fill="none" aria-hidden="true" focusable="false">
  <!-- 分层：远景 → 中景 → 近景 → 细节 -->
  <g class="scene-line scene-line--faint">
    <path d="M0 700h1440" />
  </g>
  <g class="scene-line">
    <path d="M1082 886C1082 786 1082 676 1082 552" />
  </g>
</svg>
```

```css
.scene-line        { fill: none; stroke: var(--scene); stroke-width: 1.4; opacity: .32; }
.scene-line--faint { opacity: .16; }
.scene-fill        { fill: var(--scene); opacity: .09; }
```

**为什么不用图片**：

| 图片 | SVG |
| --- | --- |
| 200 KB ~ 2 MB | 2 ~ 8 KB，且进 HTML 后零请求 |
| 固定分辨率 | 矢量，任意缩放 |
| 换主题要换图 | 换 CSS 变量即可 |
| 手机端裁切要另做一版 | `preserveAspectRatio` 自动处理 |

**画场景的四个层次**（照着填，不会空）：

1. **远景**：地平线 / 弧线 / 网格，opacity 0.1–0.2
2. **中景**：主体轮廓（山脊 / 云层 / 轨道），opacity 0.3
3. **细节**：刻线、坐标点、虚线路径，opacity 0.4–0.6
4. **点缀**：星点 / 光晕 / 粒子，opacity 0.5–0.8，可加极慢动画

## 动效克制

| 可以 | 不要 |
| --- | --- |
| 描线 500–700ms 淡入 | 逐字打字机 |
| 位移 8–12px 淡入 | 大范围缩放 + 模糊 |
| 虚线极慢流动（20s+） | 任何闪烁快于 1s |
| 悬停位移 2–4px | 位移动画超过 6px |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

## 入场动画：纯 CSS，别依赖 JS

**反面教材**（我们实际踩过）：

```css
[data-reveal] { opacity: 0; }                    /* 初始隐藏 */
html[data-ready] [data-reveal] { opacity: 1; }   /* 等 JS 加 class */
```

结果：那个 JS 只在某个页面加载，其他页面的文字要等兜底定时器（1.6 秒）才出现。

**正确做法**：

```css
[data-reveal] {
  animation: reveal-up 480ms cubic-bezier(0.22, 0.68, 0, 1) both;
  animation-delay: calc(var(--step, 0) * 60ms);
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
```

`fill-mode: both` 让元素在动画开始前就处于起始状态，第一帧就能看见，不闪烁、不等 JS。

## 排版基线

| 项 | 建议 |
| --- | --- |
| 正文宽度 | 66–72ch |
| 中文正文行高 | 1.7–1.8 |
| 端到端最大宽度 | 72–76rem（再宽一行太长） |
| 标题字距 | `-0.01em` ~ `-0.03em`（大字号要负字距） |
| 英文小标签 | 等宽字体 + `letter-spacing: 0.16em` + 全大写 |
| 圆角 | 4–10px，不要 20px+ |
| 阴影 | 只给浮层和弹窗，正文区靠分层和留白 |
