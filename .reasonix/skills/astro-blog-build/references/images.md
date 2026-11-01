# 图片流水线

静态站的图片有三个去处，各自一套处理：

| 去处 | 位置 | 处理 |
| --- | --- | --- |
| 文章配图 | `public/media/articles/` | 手动压，或写进脚本 |
| 相册 | `photos/` → `public/media/gallery/` | 脚本自动压缩 + 生成清单 |
| 纹理 / 装饰 | `public/textures/` | 程序化生成，不占仓库 |

**核心原则：`public/` 里的文件会原样进 git、原样发给访客。** 4 MB 的手机原图必须压到 200 KB 以内。

## 一、文章配图（最简单）

```markdown
![说明文字](/media/articles/smith-chart.jpg)
```

路径从 `/media/` 开始，**不要写 `public/`**。

压缩命令（项目里装了 `sharp` 就能直接跑）：

```bash
node -e "require('sharp')('原图.jpg').resize({width:1200}).jpeg({quality:80}).toFile('public/media/articles/smith-chart.jpg')"
```

尺寸建议：

| 用途 | 宽度 | 体积 |
| --- | --- | --- |
| 正文配图 | 1000–1200 | < 200 KB |
| 小图 / 图标 | 400–600 | < 60 KB |
| 全宽大图 | 1600 | < 350 KB |

### 三种排版写法

```markdown
<!-- 基础：占满栏宽 -->
![说明](/media/articles/a.jpg)

<!-- 图注：用 figure，图注会显示 -->
<figure>
  <img src="/media/articles/a.jpg" alt="说明">
  <figcaption>图注文字</figcaption>
</figure>

<!-- 控制大小：加 width，高度自动 -->
<img src="/media/articles/a.jpg" width="320" alt="说明">
```

并排两张用表格最省事：

```markdown
| 之前 | 之后 |
| --- | --- |
| ![之前](/media/articles/before.jpg) | ![之后](/media/articles/after.jpg) |
```

### `aspect-ratio` 的坑

```css
/* ❌ 失效：<img height="1600"> 属性让 height 不是 auto */
.photo { width: 100%; aspect-ratio: 4 / 3; }

/* ✅ 方案一：显式 height: auto */
.photo { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; }

/* ✅ 方案二：直接给固定高度 */
.photo { width: 100%; height: 12rem; object-fit: cover; }
```

## 二、相册（脚本化）

### 目录约定

```
photos/                    ← 原图，进 .gitignore
├── 旅行/
│   ├── jiuzhaigou-20251001.jpg
│   └── jiuzhaigou-20251001.txt    ← 同名 txt = 说明文字
└── 日常/
    └── chengdu-20261101.jpg

public/media/gallery/      ← 压缩产物，进仓库
├── travel/jiuzhaigou-20251001.jpg
└── life/chengdu-20261101.jpg

src/data/gallery.json      ← 清单，脚本生成
```

### 脚本要点

```js
import sharp from 'sharp';

for (const file of files) {
  const image = sharp(srcPath).rotate();              // rotate() 无参 = 按 EXIF 自动转正
  const meta = await image.metadata();
  const encoded = await image
    .resize({
      width: Math.min(meta.width, 1200),
      height: Math.min(meta.height, 1600),
      fit: 'inside',                                   // 等比缩到框内，不裁切
      withoutEnlargement: true,                        // 小图不放大
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  const finalMeta = await sharp(encoded).metadata();   // 必须重新读，否则宽高对不上
  // 写入文件 + 记录 { src, width, height, place, date, caption }
}
```

**关键点**：

- `.rotate()` 必须在 resize **之前**，否则竖拍照片会横着缩
- `fit: 'inside'` + `withoutEnlargement: true`，小图不会被拉伸
- 压缩后的真实宽高要**重新读**，写进清单（前端用 `width`/`height` 属性防布局跳动）
- 日期从文件名里的 `20251001` 猜，猜不到用文件 mtime

### 清单格式

```json
{
  "categories": [
    {
      "id": "travel",
      "label": "旅行",
      "photos": [
        { "src": "/media/gallery/travel/x.jpg", "width": 900, "height": 1600,
          "place": "旅行", "date": "2025-10", "caption": "水太清了" }
      ]
    }
  ]
}
```

前端直接 `import gallery from '../data/gallery.json'`（Astro 支持 JSON 导入）。

### 相册不要塞进章节

把相册放进某一章会让那一屏超出 100dvh，整屏切换就废了。**独立成页**，章节里只放一个入口按钮。

## 三、纹理图（程序化生成）

想要"油画笔触""宣纸纤维"这类肌理，不用找素材，直接用 Node 生成灰度 PNG，CMap 一样平铺：

```js
import { deflateSync } from 'node:zlib';

// 手写 PNG：8 位灰度，无滤波
function encodeGrayPng(width, height, pixels) {
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0;                    // 每行开头是滤波器类型
    pixels.copy(raw, y * (width + 1) + 1, y * width, y * width + width);
  }
  return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', empty)]);
}
```

**笔触的正确做法**：撒几千条**短线段**，方向由低频流场决定，边缘渐隐。

```js
for (let i = 0; i < 5000; i++) {
  const cx = rand() * SIZE, cy = rand() * SIZE;
  const flow = fbm(cx / SIZE * 4, cy / SIZE * 4) * Math.PI * 2.4;   // 方向随区域缓慢变化
  const angle = flow, len = 7 + rand() * 24, halfWidth = 1 + rand() * 2;
  const tone = 0.5 + (rand() - 0.5) * 0.6;
  // 对包围盒内的像素计算到线段的距离，< halfWidth 则按距离渐隐混入 tone
}
```

**不要用 `Math.sin(投影距离)` 生成条纹**——那画出来是等高线，不是笔触。必须是真的短线。

CSS 里当遮罩层用：

```css
.panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--art-texture);
  background-size: 340px 340px;
  opacity: var(--art-texture-opacity);
  mix-blend-mode: var(--art-blend);   /* 浅色 multiply / 深色 screen 或 overlay */
  pointer-events: none;
}
```

256×256 的灰度图约 40–50 KB，两张不到 100 KB，浏览器只下载当前画风那一张。

## 四、Obsidian 用户的注意点

Obsidian 默认用 `![[图片.png]]` 双链语法，**网站不认**。改设置：

```
设置 → 文件与链接
  · 新附件的默认位置：指定文件夹 → media/articles
  · 使用 [[双链]]：关闭          ← 关键
```

关掉之后粘贴图片会写成标准 `![](路径)`，把路径改成 `/media/...` 即可。

另外自己的语法差异：

| Obsidian | 网站 |
| --- | --- |
| `[[笔记]]` | `[文字](/posts/slug)` |
| `![[图.png]]` | `![](/media/x.png)` |
| `> [!note]` callout | 普通引用 `> **注意**：` |
| `$公式$` | 不支持（需装 remark-math + rehype-katex） |
| 正文 `#标签` | 只认 frontmatter 里的 `tags:` |

## 五、检查清单

- [ ] 所有进 `public/` 的图片 < 300 KB
- [ ] 文件名全小写（GitHub Pages 区分大小写）
- [ ] 图片有 `width`/`height` 属性或容器固定高度（防布局跳动）
- [ ] 首屏不加载任何图片
- [ ] 相册图 `loading="lazy" decoding="async"`
- [ ] `photos/` 在 `.gitignore` 里
