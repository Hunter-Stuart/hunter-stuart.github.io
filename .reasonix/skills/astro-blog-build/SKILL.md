---
name: astro-blog-build
description: Build a personal blog from scratch as a chapter-based static site — pick a vertical metaphor (altitude / time / depth / distance), split it into 4–6 chapters, wire an Astro content layer, design dual themes, add scroll or full-screen chapter navigation, compress images, and deploy to GitHub Pages. Use when someone asks to build or rebuild a personal blog/site, wants a narrative homepage instead of a post list, needs Chinese/English bilingual structure, or is migrating off Hexo/WordPress to a static site.
---

# 从零搭一个章节式个人博客

这是一套**方法**，不是一套皮肤。照它做出来的站可以是「火箭升空」「一天的光线」「下潜剖面」「从家到远方」——结构相同，主题完全不同。

适用场景：

- 想要一个有叙事结构的个人站，而不是「文章列表 + 侧边栏」
- 从 Hexo / WordPress 迁到静态站，想借机重做视觉
- 需要中英双语
- 一个人维护，不想折腾服务器

## 先定一件事：纵向隐喻

所有内容挂在一个**连续的纵向轴**上，每一章是轴上的一个位置。

| 隐喻 | 轴 | 章节标签示例 | 适合 |
| --- | --- | --- | --- |
| **高度** | 离地距离 | `0 km` / `100 km` / `400 km` | 工程、航天、技术栈 |
| **时间** | 一天的光线 | `05:40 黎明` / `12:00 正午` / `23:00 深夜` | 生活、写作、随笔 |
| **深度** | 下潜米数 | `0 m` / `-200 m` / `-4000 m` | 研究、思考、阅读 |
| **距离** | 离家的公里 | `0 km` / `1200 km` / `9000 km` | 旅行、摄影、移动 |
| **层级** | 从地心到电离层 | `地壳` / `对流层` / `磁层` | 科学、科普 |

选定之后，**每一章填满这五格**：

```
位置标签（数值 + 单位）
章节名（2–4 字）
英文代号（全大写，编目感）
一句话定位（这一站在讲什么）
强调色（一章一个，不要复用）
```

先把这张表填完再写代码。表填不出来，说明结构没想清楚，写代码只会返工。

详细设计方法与四套完整示例见 [references/structure.md](references/structure.md)。

## 六个阶段

| 阶段 | 产出 | 关键决策 |
| --- | --- | --- |
| 1 骨架 | 能跑起来的空站 | 单语还是双语 |
| 2 内容层 | collections + schema | 文章怎么归类 |
| 3 视觉 | 设计 token + 场景 | 一套主题还是双主题 |
| 4 交互 | 章节导航方式 | 滚动 / 整屏切换 |
| 5 内容运营 | 发文章、相册、简历 | 哪些做成页面 |
| 6 部署 | 推上去就能访问 | 域名与 Pages 配置 |

**顺序不能乱。** 先做视觉再做内容层，会为了布局反复改数据结构。

### 阶段 1：骨架

```
npm create astro@latest -- --template minimal
```

只装必要的：`@astrojs/sitemap`、`sharp`（图片）。**不要一开始就装 UI 框架**——章节式站点几乎不需要客户端框架。

目录约定见 [references/scaffold.md](references/scaffold.md)。

### 阶段 2：内容层

用 Content Collections 而不是把 Markdown 扔进 `src/pages/`：

```ts
// src/content.config.ts
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().default(''),
    category: z.string().default('笔记'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});
```

双语就直接分目录：`src/content/posts/zh/` 和 `src/content/posts/en/`，文件名即 slug。

详见 [references/content.md](references/content.md)。

### 阶段 3：视觉

三件事，顺序很重要：

1. **设计 token**（`src/styles/tokens.css`）——语义变量，不写死颜色
2. **每章一个强调色**——`--accent-<chapter-id>`
3. **场景图形**——内联 SVG，不加载图片

双主题（明暗）是标配；如果想让视觉更有辨识度，可以再叠一层「画风」（如水墨 / 油画），用 `data-art` 切换，和 `data-theme` 正交。

详见 [references/visual.md](references/visual.md)。

### 阶段 4：交互

两种方案，按内容量选：

| 方案 | 实现 | 适合 |
| --- | --- | --- |
| 滚动 + 章节吸附 | `scroll-snap` + `IntersectionObserver` | 每章内容多、需要自由浏览 |
| **整屏切换** | `position: fixed` + `translateY(var(--slot))` | 每章就是一屏、节奏感强 |

整屏切换的完整脚本（含 `inert`、hash、键盘、触摸、内容溢出降级）见 [references/interaction.md](references/interaction.md)。

> **最容易翻车的地方**：整屏切换时如果给所有屏都加过渡，未激活的屏也会从 `-200%` 滑到 `-100%`，在视口边缘闪一下。只让参与切换的两屏有 `transition`。

### 阶段 5：内容运营

| 功能 | 要不要做 |
| --- | --- |
| 文章列表 / 详情 | 必须 |
| 相册 | 有照片就做，独立成页，别塞进章节（会撑破一屏） |
| 简历 | 找工作就做，做成两栏版式 |
| 友链 | 有圈子就做 |
| 搜索 | 文章 > 30 篇再考虑（Pagefind） |
| 评论 | 静态站需要第三方服务，慎加 |

图片流水线（压缩、相册清单、纹理生成）见 [references/images.md](references/images.md)。

### 阶段 6：部署

GitHub Pages + Actions 最省事，免费、无服务器、推上去就发布。

完整 workflow 与 Pages 设置见 [references/deploy-and-pitfalls.md](references/deploy-and-pitfalls.md)。

## 十条真实踩过的坑

这些是实际做站时一条条撞出来的，提前知道能省好几个小时：

1. **`aspect-ratio` 会被 `<img height>` 属性打掉** —— 图片带 `width/height` 属性时 `height` 不是 `auto`，`aspect-ratio` 直接失效，竖图变长条。要么显式 `height: auto`，要么直接给固定高度。
2. **入场动画不要依赖 JS 开关** —— 把 `opacity: 0` 等某个 JS 设置的 class 才显示，结果是首屏文字等 1.6 秒才出现。用纯 CSS `@keyframes` + `fill-mode: both`。
3. **绝对定位的列表项不会撑开父容器** —— `li` 全是 `position: absolute` 时容器宽度塌陷成 0，所有内容堆在一个点上。必须显式给容器宽度。
4. **CSS 动画的 `translate` 会覆盖定位的 `transform`** —— 动画和定位要分层：外层管定位，内层管动画。
5. **中文回退进英文页会撑坏排版** —— 按钮、导航、标签这类定宽元素遇到中文字符直接变形。双语就老老实实两份文案。
6. **滚轮事件被 `preventDefault` 后，内部滚动容器就废了** —— 事件里要向上遍历判断指针下面有没有还能滚的容器，有就放行。
7. **`npm ci` 会因为残留 node 进程失败** —— 本地报文件占用时，先关掉 dev server 再装。
8. **GitHub Pages 区分文件名大小写** —— Windows 上 `Smith.PNG` 和 `smith.png` 都能开，推上去就 404。文件名一律小写。
9. **`public/` 里的文件原样进 git 并原样发给访客** —— 4 MB 的手机原图必须压到 200 KB 以内。
10. **Hybrid 心智负担**：先用 `astro check` 之前，确认装了 `@astrojs/check`，否则命令直接报错。

更多细节（含每条的修法）见 [references/deploy-and-pitfalls.md](references/deploy-and-pitfalls.md)。

## 验收清单

上线前逐条确认：

- [ ] 六章内容都在，每章能独立打开（`#chapter-id` 锚点有效）
- [ ] 浅色 / 深色都读过一遍，对比度够
- [ ] 手机宽度（390px）没有横向滚动
- [ ] 键盘能走完全程（Tab / 方向键 / Esc）
- [ ] `prefers-reduced-motion: reduce` 下动画全关
- [ ] 禁用 JavaScript 后内容仍然可读
- [ ] 所有图片 < 300 KB，首屏零图片
- [ ] 中英文各点三页，排版都不错位
- [ ] 构建无 warning，`dist/` 体积你心里有数
