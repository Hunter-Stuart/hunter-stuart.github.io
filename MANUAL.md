# 操作手册

日常怎么用这个站。架构和设计决策在 [README.md](./README.md)，这里只讲"怎么做"。

---

## 0. 三分钟上手

```powershell
cd D:\hunter-stuart.github.io
npm install      # 只需第一次，或 package.json 变了之后
npm run dev      # 打开 http://localhost:4321
```

`npm run dev` 是热更新的，改文件保存后浏览器自动刷新。要停下来按 `Ctrl + C`。

---

## 1. 命令速查

| 命令 | 什么时候用 |
| --- | --- |
| `npm run dev` | **日常写东西**，实时预览 |
| `npm run build` | 发布前验证能不能构建（会先自动生成纹理图） |
| `npm run preview` | 用本地服务器看**构建产物**（更接近线上，需先 build） |
| `npm run gallery` | **换了相册照片以后**，压缩图片 + 更新清单 |
| `npm run i18n:check` | 检查哪些字段还缺英文 |
| `npm run og` | 改了分享图上的文字后，重新生成 `public/og-image.png` |
| `npm run textures` | 重新生成油画/水墨两张肌理图（一般不用手动跑） |

端口被占用时 Astro 会自动换端口，看终端打印的实际地址。想指定：`npm run dev -- --port 4400`。

---

## 2. 写一篇博客

> **模板文件**：`example/zh.md`（中文）和 `example/en.md`（英文）。照着复制，改内容即可。

### 2.1 新建文件

中文放 `src/content/posts/zh/`，英文放 `src/content/posts/en/`：

```
src/content/posts/zh/我的新文章.md     →  https://你的域名/posts/我的新文章
src/content/posts/en/my-new-post.md   →  https://你的域名/en/posts/my-new-post
```

**文件名就是 URL**。建议用英文或拼音，避免 URL 里出现中文编码。

### 2.2 写 frontmatter

文件开头必须有一段 `---` 包起来的配置：

```yaml
---
title: 文章标题
description: 一句话摘要，会显示在列表里
date: 2026-11-01
category: 笔记
tags: [Astro, 设计]
draft: false
featured: false
---

正文从这里开始，用 Markdown 写。
```

| 字段 | 必填 | 作用 |
| --- | --- | --- |
| `title` | ✅ | 标题 |
| `date` | ✅ | 日期，格式 `2026-11-01` |
| `description` | | 列表里的摘要 |
| `category` | | 分类，默认「笔记」 |
| `tags` | | 标签数组 |
| `draft` | | `true` 时**不上线**（构建时被过滤，URL 直接消失） |
| `featured` | | `true` 时优先出现在首页「精选日志」 |

### 2.3 支持的 Markdown 语法

普通 Markdown 都支持：标题、列表、表格、引用、代码块、图片、链接。

代码块会自动高亮，且**跟随明暗主题切换配色**：

````markdown
```ts
const answer = 42;
```
````

### 2.4 预览 → 发布

```powershell
npm run dev      # 存盘即刷新，看效果
```

改了 `.ts` 里的数据结构（比如 `catalog.ts`）后，跑一次 `npm run build` 就能发现写错的地方。

满意后：

```powershell
git add -A
git commit -m "新增：我的新文章"
git push         # 推送后自动部署，1–2 分钟后线上生效
```

---

## 3. 改已有文章

直接编辑 `src/content/posts/<语言>/<文件名>.md`。

| 想做的事 | 怎么做 |
| --- | --- |
| 改标题 / 摘要 / 日期 | 改 frontmatter 对应字段 |
| 改正文 | 改 `---` 下面的 Markdown |
| **临时下线** | `draft: true` |
| **提到首页精选** | `featured: true` |
| **改 URL** | 重命名文件（旧链接会失效） |

---

## 4. 改站点信息

所有文案在 **`src/i18n/content.ts`**，中英各一份（`zh` 和 `en`）。

| 想改什么 | 位置 |
| --- | --- |
| **发信邮箱** | `identity` → `zh` 和 `en` 各自改 `email` |
| 备用 / 校内邮箱 | `identity` → `altEmails` 数组 |
| 姓名、所在地、简介、座右铭 | `identity` |
| 六章的标题 / 代号 / 描述 | `homeCopy.chapters` |
| 欢迎页文案 | `welcomeCopy` |
| 简历全部内容 | `profileCopy` |

界面上的按钮文字（导航、空状态等）在 **`src/i18n/ui.ts`**。

### 中英要改两遍

`zh` 和 `en` 是两份独立字典，改中文不会同步到英文。改完可以跑：

```powershell
npm run i18n:check
```

它列出还缺英文的字段（不补也不影响构建）。

---

## 5. 改简历

### 5.1 文字内容

`src/i18n/content.ts` → `profileCopy`：

```ts
sections: [
  { title: '教育', items: [{ period, title, detail }] },
  { title: '项目', items: [...] },
  { title: '技能', items: [...] },
]
```

- `period` 显示在左列（如 `2026.04 — 2026.08`）
- `title` 加粗
- `detail` 说明文字

身份标签在 `titles` 数组里（左栏照片下方），一行一条。

### 5.2 加一张证书

简历页有一块「荣誉与证书」，图片在 `public/media/certificates/`，条目在 `src/data/certificates.ts`。

**第一步：压图放进目录**

单张建议长边 1400、100–250 KB。用 sharp 一条命令（项目里已有这个依赖）：

```powershell
node -e "import('sharp').then(async s=>{const i=await s.default('原图.jpg').rotate().resize({width:1400,height:1400,fit:'inside'}).jpeg({quality:82,mozjpeg:true}).toFile('public/media/certificates/你的名字.jpg');console.log(i.width+'x'+i.height)})"
```

文件名用英文小写加连字符，它同时是 slug。

**第二步：在 `src/data/certificates.ts` 里加一条**

```ts
{
  slug: 'soc-national-2026-first',        // 与图片文件名一致
  year: '2026',
  level: 'national',                       // national / international / provincial / program / school
  title: { zh: '……一等奖', en: '……First Prize' },
  issuer: { zh: '中国电子教育学会', en: 'China Electronics Education Society' },
  work: { zh: '作品名', en: 'Project name' },   // 可选
},
```

级别决定排序权重（国家级永远在前），同级按年份倒序。数组顺序不用管，`sortedCertificates` 会自动排。

**第三步：** `npm run build` —— 数量会显示在区块标题右边。

### 5.3 换简历照片

替换 **`public/media/profile-photo.jpg`**，建议 **480×640（3:4）**，控制在 100 KB 以内。

Windows 下可以用画图 / 在线工具裁好再放进去。必须是这个文件名，否则要改 `ProfilePage.astro`。

---

## 6. 相册：加照片

### 6.1 三步

```powershell
# 1. 丢照片进分类目录（目录名 = 分类名）
photos/旅行/xxx.jpg
photos/日常/yyy.jpg

# 2. 跑脚本：压缩 + 生成清单
npm run gallery

# 3. 提交生成物
git add -A
git commit -m "相册：新增 xx 张"
git push
```

脚本输出类似：

```
旅行/jiuzhaigou-20251001.jpg  →  travel/jiuzhaigou-20251001.jpg  125 KB
共 3 张，2 个分类。清单写入 src/data/gallery.json
```

### 6.2 规则

| 项目 | 说明 |
| --- | --- |
| 分类 | `photos/` 下的**目录名**就是分类名，没见过的目录会自动新建 |
| 压缩 | 长边压到 1200/1600，质量 80（几 MB → 100–200 KB） |
| 日期 | 从文件名里的 `20251001` 猜，猜不到用文件修改时间 |
| 排序 | 新的在前 |
| **说明文字** | 在照片旁放**同名 `.txt`**，内容就是那句话 |

```
photos/旅行/jiuzhaigou-20251001.jpg
photos/旅行/jiuzhaigou-20251001.txt   ← 内容：水太清了，看久了会失去深度感
```

`photos/` 本身不进 git（原图太大），只有 `public/media/gallery/` 和 `src/data/gallery.json` 会提交。

### 6.3 删除照片

删掉 `photos/` 里的原图 → 再跑一次 `npm run gallery` → `public/media/gallery/` 里对应的压缩图也要手动删掉。

---

## 7. 改友链

`src/data/catalog.ts` → `friends` 数组（中英各一份）：

```ts
{ name: 'iceaxing', realName: '吴昊', note: '雪线之上的个人博客', href: 'https://iceaxing.com' },
```

- `name` 站名 / 昵称（必填）
- `realName` 真名（可选，灰色小字显示在站名后面）
- `note` 一句话说明
- **数组顺序就是显示顺序**

---

## 8. 改技术栈

在 `src/data/catalog.ts`，中英各一份：

```ts
{
  group: '语言与运行时',
  items: [{ name: 'TypeScript / JavaScript', level: 82 }],
}
```

`level` 是进度条百分比（0–100）。

> **项目和日常不再是数组了。** 它们已经独立成 Markdown 文件和详情页，见下面两节。

---

## 9. 写项目

> **模板文件**：`example/project.md`。

项目出现在第三章「卡门线」，现在**每条都能点进详情页**。

新建 `src/content/projects/zh/<slug>.md`（英文放 `en/`）：

```yaml
---
title: 项目名
summary: 一句话说明，显示在第三章的列表里
status: 进行中          # 进行中 / 维护中 / 计划中，自由写
progress: 72            # 进度条百分比 0–100
tags: [Astro, CSS]
date: 2026-09-06        # 开始时间
updated: 2026-11-01     # 可选
links:                  # 可选，详情页底部的外部链接
  - label: 线上站点
    href: https://example.com
---

## 想解决什么

正文随便写，支持完整的 Markdown（标题、表格、代码、图片）。
```

**`slug` 就是文件名**：`orbit-blog.md` → `/projects/orbit-blog`。

列表区域有最大高度，条目多了会**在列表内滚动**，不会把章节撑长。

---

## 10. 写日常

> **模板文件**：`example/note.md`。

日常出现在第五章「同步轨道」，同样每条都有详情页。

新建 `src/content/notes/zh/<slug>.md`：

```yaml
---
title: 标题
description: 摘要，显示在列表和搜索结果里
date: 2026-10-18
category: 日常            # 日常 / 阅读 / 身体 …… 自由写
tags: [习惯, 专注]        # 可选
---

正文。
```

**`slug` 就是文件名**：`clean-desk.md` → `/notes/clean-desk`。

`description` 建议写——它是搜索引擎和分享卡片用的摘要。

---

## 11. 写日志（周表）

> **模板文件**：`example/journal.md`（Markdown 表格版）、`example/journal.csv.example`（CSV 版）。

日志在导航的「工具」左边，一周一个表格。**两种格式都支持**，选你顺手的那个。

### 方式一：Markdown 表格

新建 `src/content/journal/2026-W46.md`（文件名就是周编号）：

```yaml
---
week: 2026-W46
start: 2026-11-09      # 该周周一
theme: 一句话概括这周在干什么
---

| 日期 | 计划 | 实际 | 收获 | 感悟 |
| --- | --- | --- | --- | --- |
| 11-09 周一 | 读论文 | 读了两篇 | 搞懂了 FFT 补零 | 效率比想象低 |
| 11-10 周二 | 写代码 | 写了三个模块 | 先对齐数据结构 | 见 [[hello-world]] |
```

### 方式二：CSV

新建 `src/data/journal/2026-W46.csv`，用 Excel / 飞书表格写完导出：

```csv
date,plan,done,learned,thought
"11-09 周一","读论文","读了两篇","搞懂了 FFT 补零","效率比想象低"
"11-10 周二","写代码","写了三个模块","先对齐数据结构","见[[hello-world]]"
```

> 内容里有逗号或引号时，**用双引号把整个单元格包起来**，单元格内的引号写两个（`""`）。

### 两种方式的区别

| | Markdown | CSV |
| --- | --- | --- |
| 表头 | 中文英文都行 | 同上，`date/plan/done/learned/thought` 最稳 |
| 显示在页面上 | 标注「Markdown 表格」 | 标注「CSV」 |
| 适合 | 直接在编辑器里写 | 用表格软件写好导出 |

**表头名中英文都认**：`计划`/`plan`、`实际`/`done`、`收获`/`learned`、`感悟`/`thought`、`日期`/`date`。

周编号决定排序和 URL：`2026-W46` → `/journal/2026-W46`。列表按周**倒序**，最新的在最上面。

### 在日志里引用文章 / 项目 / 日常

单元格里写 `[[slug]]`，构建时会自动：

1. 在文章、项目、日常三处查找这个 slug
2. 找到了 → 变成链接，**显示标题而不是 slug**
3. 找不到 → 原样保留 `[[xxx]]`，页面底部会提示有引用没解析，方便你发现写错

```markdown
| 11-10 周二 | 写代码 | 三个模块 | 先对齐数据结构 | 见 [[hello-world]] |
```

没有「文章 / 日常」的区分——你只写 slug，系统自己判断它属于哪一类。

> 表格单元格**只认 `[[slug]]`**，不解析 `[文字](链接)` 这种 Markdown 链接语法。要写外部链接就直接贴网址。

---

## 12. 改配色和画风

`src/styles/tokens.css` 顶部有**四组色板**：

```
油画 × 浅色    油画 × 深色    水墨 × 浅色    水墨 × 深色
```

改 `--page`、`--text`、`--accent` 这几个就能换整体色调，六个章节色是 `--accent-launch-pad` 那一组。

画风按钮切换的是 `data-art`，明暗按钮切换的是 `data-theme`，两者独立。

---

## 13. 发布上线

```powershell
git add -A
git commit -m "说明这次改了什么"
git push
```

推送后 GitHub Actions 自动构建并发布，进度看：

```
https://github.com/Hunter-Stuart/hunter-stuart.github.io/actions
```

1–2 分钟后访问 <https://hunter-stuart.github.io>。

> 首次部署需要在仓库 **Settings → Pages → Source** 里选 **GitHub Actions**（只需设置一次）。

---

## 14. 出问题了

| 现象 | 原因 / 解决 |
| --- | --- |
| 启动报端口占用 | Astro 会自动换端口，看终端实际地址 |
| 页面没更新 | 改了 `astro.config.mjs` / `package.json` 要重启 `npm run dev` |
| 照片不显示 | 忘了跑 `npm run gallery`，或文件名不是 `profile-photo.jpg` |
| 文章没上线 | 检查 `draft:` 是不是 `true` |
| 构建报错 `Cannot find module` | 路径写错了，注意 `../` 的层数 |
| 英文页排版挤 | 英文文案比中文长，改 `home.css` 里 `:root[lang='en']` 那一段 |
| 中文显示成乱码 | 文件保存成 UTF-8 编码 |

构建失败时，先看终端里的报错行号，通常是：

- frontmatter 少了 `title` 或 `date`
- 数组少了逗号
- `detail` 里的引号没配对

---

## 15. 目录速查

```
src/
├── content/
│   ├── posts/{zh,en}/       文章（Markdown）
│   ├── projects/{zh,en}/    项目（Markdown，每条一个详情页）
│   ├── notes/{zh,en}/       日常（Markdown，每条一个详情页）
│   └── journal/             日志周表（Markdown 表格）
├── data/
│   ├── catalog.ts           技术栈 / 友链
│   ├── certificates.ts      荣誉证书条目
│   ├── journal/             日志周表（CSV 格式的可放这里）
│   ├── gallery.json         相册清单（脚本生成，别手改）
│   ├── orbit.ts             六章的高度与编号
│   └── tracks.ts            轨道曲线与卫星运动参数
├── i18n/
│   ├── content.ts           姓名、邮箱、六章文案、欢迎页、简历
│   ├── ui.ts                界面按钮文字
│   └── tools.ts             工具页与日志页文案
├── lib/
│   ├── posts.ts             文章读取
│   ├── content.ts           项目 / 日常读取 + [[slug]] 引用解析
│   └── journal.ts           周表解析（Markdown 与 CSV 两种）
├── components/              页面组件
├── styles/
│   ├── tokens.css           配色（四组色板）
│   ├── global.css           基础排版、页头页脚
│   ├── home.css             六章布局与动效
│   ├── reading.css          文章、简历、相册、日志表格
│   ├── tools.css            工具页
│   ├── smith.css            史密斯圆图
│   └── welcome.css          欢迎页
└── pages/                   路由

public/
├── og-image.png             全站分享图（npm run og 生成）
├── robots.txt               告诉搜索引擎 sitemap 在哪
├── media/certificates/      证书图（长边 1400）
├── media/profile-photo.jpg  简历照片
├── media/gallery/           相册压缩图（脚本生成）
└── textures/                肌理图（脚本生成）

photos/                      相册原图（不进 git）
scripts/                     纹理 / 相册 / 分享图 / 翻译检查脚本
example/                     写作模板（文章 / 项目 / 日常 / 日志两种格式）
```
