# 项目骨架

## 初始化

```bash
npm create astro@latest -- --template minimal   # 不要选 blog 模板，会多出一堆用不上的东西
cd <your-repo>
npm i @astrojs/sitemap
npm i -D sharp                                   # 图片压缩脚本要用
```

`minimal` 模板只给你一个 `src/pages/index.astro`，其他全自己建。

## 目录结构

```
├── astro.config.mjs        site + sitemap + markdown 配置
├── package.json            脚本：dev / build / gallery / textures
├── tsconfig.json
├── .gitignore              dist/ node_modules/ photos/(原图)
├── README.md               架构说明（给自己看）
├── MANUAL.md               操作手册（日常怎么写文章）
│
├── src/
│   ├── content.config.ts   Content Collections 的 schema
│   ├── content/posts/
│   │   ├── zh/<slug>.md
│   │   └── en/<slug>.md
│   │
│   ├── data/               纯数据，不含 JSX
│   │   ├── chapters.ts     章节定义（id / 位置 / 编号）
│   │   ├── catalog.ts      技术栈、项目、日常、友链
│   │   └── gallery.json    相册清单（脚本生成，别手改）
│   │
│   ├── i18n/               界面与文案
│   │   ├── config.ts       locales、localizedPath
│   │   ├── content.ts      站点身份、章节文案、简历
│   │   └── ui.ts           按钮、导航、空状态
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro    <html>、主题初始化、页头页脚
│   │
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── ThemeToggle.astro
│   │   ├── chapters/       每章一个组件
│   │   │   ├── ChapterOne.astro
│   │   │   └── ...
│   │   ├── scenes/         每章一个内联 SVG 场景
│   │   │   ├── SceneOne.astro
│   │   │   └── ...
│   │   └── ChapterNav.astro    右侧导航轴
│   │
│   ├── styles/
│   │   ├── tokens.css      设计变量（唯一的配色来源）
│   │   ├── global.css      基础排版、页头页脚
│   │   ├── home.css        章节布局与动效
│   │   └── reading.css     文章、简历、相册
│   │
│   ├── scripts/
│   │   └── journey.ts      章节切换（原生 TS）
│   │
│   └── pages/
│       ├── index.astro         首页 = 章节式长页
│       ├── posts/index.astro   文章列表
│       ├── posts/[...slug].astro
│       ├── profile.astro
│       ├── gallery.astro
│       └── en/                 英文镜像
│
├── public/
│   ├── media/              图片（原样发布，必须先压缩）
│   └── textures/           纹理图（脚本生成）
│
├── photos/                 相册原图（进 .gitignore，不进仓库）
└── scripts/                图片、相册、检查脚本
```

## 几条组织原则

**数据与视图分开。** 章节定义、技术栈列表、友链这些放 `src/data/`，组件只负责渲染。改内容不动组件。

**每章一个组件 + 一个场景。** 不要把所有章节写进一个 500 行的 `index.astro`。一章一个文件，改某一章时不用在长文件里找。

**样式按职责拆四个文件。** `tokens.css` 只有变量，`global.css` 是重置 + 框架，`home.css` 是章节，`reading.css` 是长文。不要一个 `style.css` 装下所有。

**脚本用原生 TS。** 章节切换、主题切换、图片交互都不需要框架。Astro 会把这些脚本内联进 HTML，零额外请求。

## astro.config.mjs 最小可用配置

```js
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://your-name.github.io',   // 影响 canonical / sitemap / og:url
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // 双主题代码高亮，跟随 data-theme 切换
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
```

## package.json 脚本

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "npm run textures && astro build",
    "preview": "astro preview",
    "textures": "node scripts/generate-textures.mjs",
    "gallery": "node scripts/build-gallery.mjs"
  }
}
```

`build` 里串上 `textures`，是为了保证 CI 上纹理图一定存在（它们也可以提交进仓库，双保险）。

## .gitignore

```
dist/
node_modules/
.astro/
photos/          # 相册原图，体积大
.env
```

**注意**：`public/` 不能忽略（要发布），`public/media/` 里的压缩图要进仓库。

## 先做什么，后做什么

| 顺序 | 做什么 | 为什么 |
| --- | --- | --- |
| 1 | `chapters.ts` 填满五格表 | 结构决定后面一切 |
| 2 | `tokens.css` 定色 | 所有组件都引用它 |
| 3 | 一章的内容 + 场景 | 先做能跑通的一章 |
| 4 | 复制出其余章节 | 结构相同，改文案和场景 |
| 5 | 导航轴 | 章节齐了才有意义 |
| 6 | 文章列表 / 详情 | 内容层最后接 |
| 7 | 双语 | 单语先跑通，再镜像 |

**别反过来。** 先做双语再做视觉，改一次配色要改两遍选择器。
