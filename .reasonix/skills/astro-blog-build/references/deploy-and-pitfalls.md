# 部署与踩坑记录

## GitHub Pages 部署

### 仓库命名决定上线地址

| 仓库名 | 地址 | 说明 |
| --- | --- | --- |
| `<用户名>.github.io` | `https://<用户名>.github.io/` | **用户站**，根路径，推荐 |
| 任意名字 | `https://<用户名>.github.io/<仓库名>/` | 项目站，要配 `base` |

用**用户站**（`<用户名>.github.io`）最省事：不用配 `base`，所有绝对路径 `/media/...` 直接可用。

### `astro.config.mjs` 里的 `site` 必须对

```js
export default defineConfig({
  site: 'https://your-name.github.io',   // 影响 canonical / sitemap / og:url
  output: 'static',
});
```

写错了会导致 sitemap 里的链接全部指向 localhost。

### Actions workflow

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 首次上线必做的两步

1. **仓库 Settings → Pages → Source 选 `GitHub Actions`**
   如果之前用过 `hexo deploy` 或 `gh-pages` 分支，默认是 `Deploy from a branch`，不改的话 Pages 会去 main 根目录找 `index.html`，永远看不到新站。

2. **`npm ci` 要能过**
   本地先跑一遍：

   ```bash
   rm -rf node_modules
   npm ci
   npm run build
   ```

   如果 `npm ci` 报 lockfile 不同步，重跑 `npm install` 更新 `package-lock.json` 再提交。

### 推送即发布

```bash
git add -A
git commit -m "更新"
git push
```

1–2 分钟后访问。进度看 `https://github.com/<用户名>/<仓库>/actions`。

### 以后每次更新

```bash
npm run dev          # 本地看
git add -A && git commit -m "..." && git push
```

换了相册照片才需要额外跑 `npm run gallery`。

---

## 踩坑记录（都是真实撞过的）

### 1. 图片变成长条，`aspect-ratio` 失效

```css
.photo { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
```

配合 `<img width="900" height="1600">` 时**完全无效**。原因：HTML 的 `height` 属性会映射成 CSS，`height` 不再是 `auto`，而 `aspect-ratio` 只在至少一边为 `auto` 时生效。

```css
/* 修法一 */
.photo { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; }
/* 修法二 */
.photo { width: 100%; height: 12rem; object-fit: cover; }
```

### 2. 首屏文字等 1.6 秒才出现

**症状**：`opacity: 0` + 等 JS 加 `html[data-ready]` 才显示，而那个 JS 只在某个页面加载。

**修法**：改成纯 CSS 动画，`fill-mode: both`。

```css
[data-reveal] {
  animation: reveal-up 480ms cubic-bezier(0.22, 0.68, 0, 1) both;
}
```

同时删掉那套"JS 开关"逻辑。

### 3. 整屏切换时有一屏闪过

**症状**：从第 1 屏翻到第 2 屏，第 3 屏闪了一下。

**原因**：切换时给**所有屏**重设 `--slot`，第 3 屏从 `-200%` 变 `-100%`，也在跑过渡。

**修法**：只有参与切换的两屏加 `.is-moving`（带 `transition`）。

### 4. 侧边导航的文字冲出屏幕

**症状**：导航轴贴在右边，文字往右延伸，看不见。

**根因**：`<ol>` 里的 `<li>` 全是 `position: absolute`，而绝对定位**不参与父元素尺寸计算** → `<ol>` 宽度塌陷成 0 → 所有内容堆在右边缘同一个点上，怎么调 padding 都没用。

**修法**：

```css
.nav ol { position: relative; width: 13rem; }   /* 必须显式给宽度 */
.nav li { position: absolute; right: 0; }        /* 从右边缘往左排 */
.nav a { flex-direction: row-reverse; }          /* 文字在左，圆点贴轴 */
```

### 5. 滚轮翻页后，页面里的横向相册不能滚了

**原因**：`wheel` 事件被 `preventDefault()` 拿去翻页，内部滚动容器被一并吞掉。

**修法**：事件里向上遍历祖先，判断指针下面有没有"还能滚"的容器，有就放行（见 `interaction.md` 的 `scrollableUnder`）。

### 6. 动画和定位打架

**症状**：元素定位在右边，加了动效后跑回左上角。

**原因**：CSS 动画里的 `transform` 覆盖了定位用的 `transform`。

**修法**：分层。外层 `<g>` 只负责定位，内层 `<g>` 只负责动画。

```html
<g class="positioner" style="--x:800px; --y:600px">
  <g class="mover"> ... </g>
</g>
```

```css
.positioner { transform: translate(var(--x), var(--y)) scale(var(--s)); }
.mover { animation: float 3s infinite; }   /* 动的是内层 */
```

### 7. 英文页排版全乱

**症状**：英文页按钮被撑破、导航换行。

**原因**：曾尝试"英文缺字段时回退显示中文"。中文单个字符宽度大，定宽元素直接变形。

**修法**：两份文案各自完整，**绝不回退**。维护成本是改两遍，但排版稳定。

### 8. `npm ci` 报文件占用

**症状**：`npm ci` 失败，提示 `file in use or lack permissions`。

**原因**：`npm run dev` / `preview` 的 node 进程还在跑，占着 `node_modules`。

**修法**：

```powershell
Get-Process node | Stop-Process -Force
npm ci
```

### 9. 部署后图片 404，本地正常

**原因**：文件名大小写。Windows 不区分，GitHub Pages（Linux）区分。

**修法**：文件名一律小写，用连字符分词。

### 10. PowerShell 的相对路径写坏了别的项目的文件

**症状**：用 `[System.IO.File]::WriteAllText('src/styles/x.css', ...)` 时，写到了**当前工作区**而不是目标项目。

**原因**：`.` NET 的当前目录 ≠ PowerShell 的 `$PWD`。

**修法**：跨项目操作一律用绝对路径：

```powershell
$p = 'D:\my-repo\src\styles\x.css'
[System.IO.File]::WriteAllText($p, $content, (New-Object System.Text.UTF8Encoding($false)))
```

`UTF8Encoding($false)` 是去掉 BOM，避免 CSS/JSON 首行多出不可见字符。

### 11. `npm run check` 跑不了

`astro check` 需要额外装 `@astrojs/check`（和 `typescript`）。没装的话命令直接报错。要么装上，要么别在文档和 CI 里写这条。

### 12. 中文/英文同 slug 冲突

如果用扁平目录 + `locale` 字段，中英同名的文章 id 会撞。**按语言分目录**（`posts/zh/`、`posts/en/`）可以从根上避免。

---

## 上线前验收

```
□ 构建零 warning
□ dist/ 体积有数（章节站通常 300–900 KB）
□ 浅色/深色都读过
□ 390px 宽度无横向滚动
□ 键盘可完整操作
□ prefers-reduced-motion 下动画全关
□ 禁用 JS 后内容仍可读
□ 所有图片 < 300 KB，首屏零图
□ 中英各点三页
□ 手机端底部不被固定元素遮住
□ 404 页面存在
```
