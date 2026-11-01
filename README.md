# hunter-stuart.github.io

按「离地高度」编排的个人站点：卫星从发射台升到月球以远，博客首页就是六段轨道。中英双语，`/` 是中文、`/en` 是英文。

由 Hexo 迁移到 Astro 重建，旧脚手架完整保留在 `legacy-hexo/`。

> **只想改内容、发文章、换照片？看 [操作手册 MANUAL.md](./MANUAL.md)。**
> 本文档讲的是架构、设计取舍和实现细节。

## 页面结构

```
/               欢迎页（两个入口：个人简历 / 博客）
/blog           六章轨道博客（翻页浏览）
/profile        个人简历
/posts          全部日志
/posts/<slug>   单篇文章

/en  /en/blog  /en/profile  /en/posts  /en/posts/<slug>   英文版
```

欢迎页是全屏单页，顶部有 `中文 / EN` 切换；其余页面由页头的语言按钮切换，并保留当前页面（`/blog` ⇄ `/en/blog`）。

## 六章结构

| 章节 | 高度 | 内容 | 锚点 |
| --- | --- | --- | --- |
| 01 发射台 LAUNCH PAD | 0 km | 简介、精选日志、章节入口 | `#launch-pad` |
| 02 对流层 TROPOSPHERE | 12 km | 技术栈 | `#troposphere` |
| 03 卡门线 KÁRMÁN LINE | 100 km | 项目 | `#karman-line` |
| 04 近地轨道 LOW EARTH ORBIT | 400 km | 日志与笔记 | `#low-earth-orbit` |
| 05 地球同步轨道 GEOSTATIONARY | 35,786 km | 日常 | `#geostationary` |
| 06 月球以远 DEEP SPACE | 384,400 km | 友链、联系 | `#deep-space` |

高度跨六个数量级，所以右侧高度轴用 `log10` 刻度（`src/data/orbit.ts` 的 `altitudeOffset`），否则前四章会挤成一个点。

## 博客页的浏览方式：翻页，不是长滚动

`src/scripts/orbit-journey.ts` 负责三件事，全部原生实现：

- **翻页**：桌面滚轮一次推进 / 退回一章，`760ms` 冷却避免一次手势跳过两章。
- **章节内溢出**：某一章内容高于视口时，滚轮先让它自然滚完，抵达边界后才翻章。
- **降级**：触摸设备完全不拦截（保留原生惯性）；`prefers-reduced-motion: reduce` 下不拦截滚轮、跳转不播放动画；键盘 `↑ ↓ PageUp PageDown Home` 同样可用。

脚本最终内联在 HTML 里，没有额外的 JS 请求，也没有框架运行时。

## 两套画风：水墨宣纸 / 油画星空

页头的画笔按钮一键切换，**画风会带着底色一起换**（水墨→浅色宣纸，油画→深色星空），也可以单独再按主题按钮调明暗。选择存在 `localStorage` 的 `orbit-art` / `orbit-theme`。

| | 水墨 `ink` | 油画 `oil` |
| --- | --- | --- |
| 底色 | 黄白宣纸 `#f4eeda` | 黑星空 `#05050b` |
| 笔画 | 墨黑 `#1b1a15`，朱砂/花青/石绿写意点缀 | 繁星 `--art-star-opacity: 1`，朱红/电蓝/青绿重彩 |
| 肌理 | `ink-fiber.png` 纸纤维，`multiply` | `oil-stroke.png` 油画笔触，`overlay` |
| 轨道 | 墨色一笔拖出的虚线 | 章节色发光的虚线 |
| 星星 | 整组隐去 | 闪烁 |

四组色板在 `src/styles/tokens.css`，按 `<html data-art data-theme>` 组合。纹理图由 `scripts/generate-textures.mjs` 用纯 Node 程序化生成（手写 PNG 编码 + zlib），不是素材：

```bash
npm run textures   # 重新生成 public/textures/*.png（约 92 KB）
```

## 轨道系统：运载器的三种运动模式

六章各有一条可见轨迹（`scene-track`），运载器是场景 SVG 里的 `<g>`，和轨道**共用同一套 viewBox 坐标**，永远贴在轨迹上。定义在 `src/data/tracks.ts`：

| 模式 | 章节 | 运动 |
| --- | --- | --- |
| `static` | 发射台 | **完全静止待发**：底部与地平线齐平、未点火、尾焰隐藏 |
| `climb` | 对流层 | 翻到这一屏时**点火发射**（从画面下方 420px 冲入、尾焰暴涨、到位回弹 18px），之后沿上升轨道单向划过（13s 一轮，首尾淡入淡出） |
| `orbit` | 卡门线 / 近地轨道 / 同步轨道 / 深空 | **绕真实天体做椭圆环绕**，360° 连续循环 |

### 环绕怎么实现的

不是关键帧插值（那会在采样点之间抖动），而是六层嵌套变换：

```
平移(椭圆中心) rotate(轨面倾角)
  └ 压扁 scale(1, ry/rx)          ← 把圆压成椭圆
      └ 旋转 rotate(0→360°)        ← 永不停止的连续运动
          └ 平移(rx, 0)            ← 推到轨道半径上
              └ 反向压扁            ← 卫星本身不变形
                  └ 反向旋转        ← 卫星姿态始终朝上
                      └ 火箭本体
```

`--orbit-period` 控制周期（近地 13s、卡门线 18s、同步 26s、深空 28s），`--orbit-phase` 控制起始角度，`animation-delay` 用负值实现"打开就在半路"。

| 章节 | 绕谁 | 轨道 | 周期 |
| --- | --- | --- | --- |
| 卡门线 | 画面下方的地球（圆心 720,1640 r1000） | r = 1060 / 1220，倾 12° | 20s |
| 近地轨道 | 同一颗地球（圆心 720,1620 r1060） | r = 1130 / 1300，倾 14° | 16s |
| 同步轨道 | 画面中间完整的地球（圆心 1010,520） | 正圆 r430，与场景那条同步环重合 | 26s |
| 深空 | 月球（圆心 1150,560 r186） | r = 268 / 232，倾 -8° | 28s |

前两章不再另画小椭圆：轨道半径只是比地球圆盘大 60–70，画面里看到的正好是贴着地表上方划过的那段弧。`tilt` 顺带把最高点挪到中上偏右。

### 翻页：整屏切换（不是滚动）

`.orbit-home` 是固定视口的容器，六屏叠在一起，靠 `--slot` 上下滑动：

- **前进**：当前屏 `slot 0 → +1`（向下退出），下一屏 `slot -1 → 0`（从上方落下）
- **后退**：方向反转
- 只有**参与切换的两屏**加 `.is-moving`（950ms 过渡），其余屏瞬间归位 —— 否则它们会从 -200% 慢慢滑到 -100%，在视口边缘闪一下

时序：

1. 滚轮 / 键盘 / 高度轴点击 → 当前屏加 `.is-departing`：火箭先动（第 1 屏从**悬停位置**继续冲出 490px，其余屏上移淡出）。
2. **200ms 后**整屏切换。
3. 目标屏加 `.is-arriving`：第 2 屏播放 1400ms 的点火发射（从下方冲入 → 到位回弹 → 稳定）；在轨屏从轨道外淡入。
4. 2 → 3 时额外播放**助推器分离**。

第 1 屏进入后自动点火：静止 0.7s → 尾焰暴涨 → 2s 内升空 170px 悬停，不需要任何交互。发射动效放在第 2 屏而不是第 1 屏：第 1 屏一换页就离开视口，动画播了也看不见。

右侧高度轴上有一枚小火箭（`[data-axis-craft]`），`--craft-offset` 跟着当前章节的高度百分比爬升，`--craft-accent` 同步变色。

所有动画在 `prefers-reduced-motion` 与手机端都会停用（手机只保留环绕与滑行）。

运载器形态由 `src/components/orbit/Rocket.astro` 的 `stage` 决定：1 完整（整流罩+二级+一级+两枚助推器）、2 助推器仍在、3 只剩芯级、4 整流罩外翻+卫星露头、5 太阳翼展开、6 缩小远去。

## 版面：左边文字，右边天空

桌面端内容列靠左，右侧 `padding-right: min(32vw, 26rem)` 让出轨道空域；视口窄于 64rem 时取消留白，窄于 56rem 时整幅场景左移 14%、火箭缩到角落并停掉飞入动画，避免竖屏把轨道裁出视野。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 生成 dist/
npm run preview
```

需要 Node.js 22.23.4 以上。

## 改内容

> **这个站没有可视化后台。** 所有内容都是仓库里的文本文件：文章是 Markdown，章节文案和列表是 TypeScript 数据。改完 `npm run dev` 立即看到效果，`git push` 就发布。
>
> （参考范例那套 Keystatic 可视化编辑器这里没有接入。需要的话可以加，但那会引入一整套编辑后台和 OAuth 配置，是另一个量级的改动。）

### 速查：想改什么，去哪个文件

| 想改的东西 | 文件 | 具体位置 |
| --- | --- | --- |
| **发信邮箱** | `src/i18n/content.ts` | `identity.zh.email` 和 `identity.en.email` 两处 |
| 姓名、所在地、站点简介、座右铭 | `src/i18n/content.ts` | `identity` |
| 六章的标题 / 代号 / 一句话定位 / 章节描述 | `src/i18n/content.ts` | `homeCopy.chapters` |
| 欢迎页两个入口的文案 | `src/i18n/content.ts` | `welcomeCopy` |
| 简历页内容 | `src/i18n/content.ts` | `profileCopy` |
| 导航、按钮、空状态等界面文字 | `src/i18n/ui.ts` | — |
| **技术栈列表** | `src/data/catalog.ts` | `catalog.zh.skills` / `catalog.en.skills` |
| **项目列表** | `src/data/catalog.ts` | `catalog.zh.projects` |
| **日常条目** | `src/data/catalog.ts` | `catalog.zh.lifeNotes` |
| **友链** | `src/data/catalog.ts` | `catalog.zh.friends`（`[name, note, href]`） |`n| **相册** | `photos/<分类>/` → `npm run gallery` | 生成 `src/data/gallery.json` |`n| 简历照片 | `public/media/profile-photo.jpg` | 480×640 |
| 章节 id、高度、轨道与卫星参数 | `src/data/orbit.ts`、`src/data/tracks.ts` | — |
| 配色、画风、线宽 | `src/styles/tokens.css` | 四组色板 |

### 中英是两份独立字典

`src/i18n/content.ts` 里 `zh` 和 `en` 各自完整、互不影响。改中文不会动英文，反之亦然。

**为什么不合成一份**：试过让英文缺字段时回退中文，结果中文的长度和英文差很多，按钮、导航、按钮里的小标签这类定宽元素会被撑变形。所以两边各写各的，谁也不干扰谁。

代价是改文案要改两遍。用体检命令能看出漏了哪些：

```bash
npm run i18n:check
```

它只列出「含中文但英文缺失 / 两边完全相同」的字段，不补也不影响构建。
### 发文章（两种语言各发一份）

```bash
# 1. 新建文件
src/content/posts/zh/                 我的新文章.md
src/content/posts/en/                 my-new-post.md
```

文件名（去掉 `.md`）就是 URL 里的 slug：`src/content/posts/zh/我的新文章.md` → `/posts/我的新文章`。
建议用英文文件名，避免 URL 里出现编码问题。

### 改已有文章

直接编辑 `src/content/posts/<语言>/<文件名>.md` 的正文或 frontmatter，保存即可。

- 改 **标题 / 摘要 / 日期 / 分类 / 标签** → 改文件顶部的 frontmatter
- 改 **正文** → 改 frontmatter 下面的 Markdown
- 想**临时下线** → 把 `draft` 改成 `true`（构建时会被过滤掉，URL 直接消失）
- 想**让它在首页「精选日志」优先出现** → `featured: true`
- 改 **URL** → 重命名文件（旧的链接会失效，除非在 `astro.config.mjs` 的 `redirects` 里加一条）

frontmatter 字段：

```
src/content/posts/zh/<slug>.md   →  /posts/<slug>
src/content/posts/en/<slug>.md   →  /en/posts/<slug>
```

frontmatter：

```yaml
---
title: 标题
description: 摘要，会显示在列表里
date: 2026-10-20
category: 建站
tags: [Astro, 设计]
draft: false
featured: true   # 首页「精选日志」优先展示
---
```

某种语言暂时没有文章也可以：对应页面会显示空状态，不影响构建。

## 相册：一条命令上传

相册独立成页（`/gallery`），第五章只留一个入口，所以那一屏不会因为照片多而变长。

```bash
# 1. 把照片丢进分类目录（目录名会直接当分类名显示）
photos/旅行/jiuzhaigou-20251001.jpg
photos/日常/chengdu-night-20261101.jpg

# 2. 跑一条命令：压缩 + 生成清单
npm run gallery

# 3. 提交生成物
public/media/gallery/**      src/data/gallery.json
```

脚本做的事：

- 长边压到 1200 / 1600 以内，`mozjpeg` 质量 80（几 MB 的原图 → 100–200 KB）
- 自动读 EXIF 方向、写入宽高（避免布局跳动）
- 日期从文件名里的 `20251001` 猜，猜不到用文件修改时间
- 说明文字：在照片旁放同名 `.txt`，内容就是那句话

`photos/` 在 `.gitignore` 里（原图不进仓库），只有压缩产物和清单会提交。

## 改视觉

- 全站配色与字体：`src/styles/global.css` 顶部两组变量（`:root` 浅色，`:root[data-theme='dark']` 深色）。
- 博客六章布局与高度轴：`src/styles/home.css`。
- 欢迎页：`src/styles/welcome.css`。
- 文章、列表、简历：`src/styles/reading.css`。
- 六个轨道场景 + 欢迎页背景全部是内联 SVG，位于 `src/components/orbit/scenes/` 与 `WelcomePage.astro`，没有图片资源。

新增一章需要动四处：`src/data/orbit.ts` 加定义、`src/i18n/content.ts` 两种语言各加文案、`src/components/chapters/` 加内容组件、`src/components/BlogPage.astro` 挂载顺序。

## 部署

推送到 `main` 触发 `.github/workflows/deploy.yml`：构建 `dist/` 并通过 GitHub Pages 发布。

首次部署前需要在仓库 Settings → Pages 里把 **Source** 设为 **GitHub Actions**（旧的 `hexo deploy` 方式不再使用）。

## 回滚到 Hexo

旧的 `_config.yml`、`source/`、`themes/`、`package.hexo.json` 都完整保留在 `legacy-hexo/`：

```powershell
Get-ChildItem legacy-hexo
# 需要时把它们移回根目录，并把 package.hexo.json 恢复成 package.json 后重新 npm install
```
