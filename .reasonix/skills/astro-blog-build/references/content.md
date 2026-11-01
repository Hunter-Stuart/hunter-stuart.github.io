# 内容层与双语

## Content Collections 而不是裸 Markdown

把文章放 `src/pages/` 里会让「文件路径 = URL」，改一次分类就要挪文件。用 Content Collections：

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().default('笔记'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

好处：

- 构建时校验 frontmatter，少字段/写错类型直接报错
- `draft: true` 一行就能下线
- 换布局不用动内容文件
- 以后加 `projects`、`notes` 集合很容易

## frontmatter 字段设计

只保留**真的会用到**的字段。每多一个字段，写文章时就要多想一次。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | |
| `date` | ✅ | `2026-11-01` |
| `description` | | 列表摘要，也进 meta description |
| `category` | | 默认「笔记」 |
| `tags` | | 数组 |
| `draft` | | 构建时过滤 |
| `featured` | | 优先上首页精选 |
| `updated` | | 可选 |

**不要**在 frontmatter 里放 `theme: next` 之类的字段——如果你的站只有一套视觉，这个字段永远不生效，只会让人困惑（这是从 Hexo 迁过来的人最常犯的错）。

## 双语：两个方案，选一个

### 方案 A：目录分语言（推荐）

```
src/content/posts/zh/hello-world.md   →  /posts/hello-world
src/content/posts/en/hello-world.md   →  /en/posts/hello-world
```

读取：

```ts
export async function getPostEntries(locale: 'zh' | 'en') {
  const entries = await getCollection(
    'posts',
    ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft,
  );
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** id 是 `zh/hello-world`，slug 取后半段 */
export const slugOf = (id: string) => id.slice(id.indexOf('/') + 1);
```

优点：两种语言可以各写各的，同一篇文章的中英文不必同标题、同日期。

### 方案 B：frontmatter 加 locale 字段

所有文件平铺，用 `locale: zh` 区分。

缺点：中英同 slug 会撞 id，必须靠文件名加后缀区分，反而更乱。

**用方案 A。**

## 路由：别用 `[locale]` 动态段

能用显式目录就用显式目录：

```
src/pages/index.astro          →  /
src/pages/blog.astro           →  /blog
src/pages/en/index.astro       →  /en
src/pages/en/blog.astro        →  /en/blog
```

理由：`src/pages/[locale]/...` 在某些工具（包括文件写入工具、某些编辑器插件）里会被当成 glob 模式，路径处理容易出问题。显式目录零意外。

英文页面里直接写死 locale：

```astro
---
const locale = 'en' as const;
const posts = await getPosts(locale);
---
```

## 语言切换：保留当前页面

```ts
export const otherLocale = (l: Locale): Locale => (l === 'zh' ? 'en' : 'zh');

export function localizedPath(locale: Locale, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'zh') return normalized;
  return normalized === '/' ? '/en' : `/en${normalized}`;
}
```

在 `BaseLayout` 里接一个 `alternatePath`：

```astro
interface Props {
  locale: Locale;
  alternatePath?: string;   // 当前页在另一种语言里的路径
}
```

然后每个页面传自己的路径：

```astro
<BaseLayout locale="zh" alternatePath="/blog">
```

切换按钮就指向 `localizedPath(otherLocale(locale), alternatePath)`，`/blog` ⇄ `/en/blog` 不会掉回首页。

## 两边都要写 `<link rel="alternate">`

```astro
<link rel="alternate" hreflang="zh-CN" href={canonical} />
<link rel="alternate" hreflang="en" href={new URL(otherHref, origin)} />
<link rel="alternate" hreflang="x-default" href={new URL('/blog', origin)} />
```

## 双语最大的坑：**不要自动回退**

想让「只维护中文，英文自动用中文填充」看起来很省事，实际会毁掉英文页排版：

- 中文比英文短，但**字符宽度大**
- 导航项、按钮、圆角标签都是定宽或紧跟内容的元素
- 一旦中文字符进来，按钮撑破、导航换行、卡片变形

**结论：两份文案各自完整，互不回退。** 维护成本是改两遍，但换来的是一致的排版。

可以用一个检查脚本告诉你哪些还没翻：

```ts
// scripts/check-i18n.ts   —— 用 node 直接跑（Node 22+ 支持 TS）
const containsChinese = (s: string) => /[\u4e00-\u9fff]/.test(s);

function untranslatedPaths(zh: unknown, en: unknown, prefix = ''): string[] {
  // 递归对比，只报告「含中文且英文缺失或相同」的字符串
}
```

```json
"scripts": { "i18n:check": "node scripts/check-i18n.ts" }
```

## 文案分层：三层，别混

| 层 | 放哪 | 内容 |
| --- | --- | --- |
| 站点身份 | `i18n/content.ts` → `identity` | 姓名、邮箱、所在地、座右铭 |
| 章节文案 | `i18n/content.ts` → `chapters` | 每章的名称、代号、定位、描述 |
| 界面文字 | `i18n/ui.ts` | 导航、按钮、空状态、错误提示 |

界面文字单独一层，因为它们的复用人次最高（「返回」「全部日志」会在很多页面出现），集中起来改一次全站生效。

## 文章页要处理的三件事

1. **目录（TOC）**：`render()` 返回的 `headings` 已经带 `slug`，直接生成锚点列表
2. **代码高亮**：`shikiConfig.themes` 配双主题，CSS 里用 `html[data-theme='dark']` 覆盖 `--shiki-dark` 变量
3. **草稿过滤**：`getCollection` 的回调里 `!data.draft`，构建时就不生成

```astro
const { Content, headings } = await render(post);
const toc = headings.filter((h) => h.depth === 2 || h.depth === 3);
```
