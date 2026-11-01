# 交互：整屏切换与章节导航

## 两种方案先选一个

| | 滚动 + 吸附 | 整屏切换 |
| --- | --- | --- |
| 手感 | 自由，可随时停下 | 节奏强，一次一屏 |
| 每章内容量 | 可以很高 | 最好一屏放得下 |
| 实现复杂度 | 低 | 中 |
| 无障碍 | 天然友好 | 要手动补 `inert` / 焦点 |
| 适合 | 内容型站点 | 叙事型站点 |

下面两种都给。

## 方案一：滚动 + `scroll-snap`

```css
.chapters {
  scroll-snap-type: y proximity;   /* proximity 比 mandatory 宽容：内容超高时不会卡住 */
}

.chapter {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-margin-top: var(--header-height);   /* 别让固定页头遮住标题 */
}
```

**用 `proximity` 而不是 `mandatory`**：某章内容超过一屏时，`mandatory` 会把它强行吸回顶部，读不到下半部分。

高亮当前章节：

```ts
const observer = new IntersectionObserver(
  (entries) => {
    let best: IntersectionObserverEntry | undefined;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best) setActive(best.target.id);
  },
  { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.6, 1] },
);
```

`rootMargin: -40%` 把判定区收到视口中线附近，任何时刻只有一个"当前章节"。

## 方案二：整屏切换

### 结构

```css
.chapters-viewport {
  position: fixed;
  inset: var(--header-height) 0 0;   /* 页头之外全是舞台 */
  overflow: hidden;
}

.chapter {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  transform: translateY(calc(var(--slot, 0) * 100%));
  will-change: transform;
}
```

`--slot` 语义：`0` = 当前屏，`-1` = 上方一屏，`1` = 下方一屏。

### 只让参与切换的两屏有过渡

**这是最容易翻车的地方。** 如果给所有屏都加 `transition`，切到第 2 屏时第 3 屏会从 `-200%` 滑到 `-100%`，虽然它始终在视口外，但动画帧边界上会被渲染出来——用户会看到"第 3 屏闪了一下"。

```css
.chapter { will-change: transform; }          /* 默认没有 transition */
.chapter.is-moving { transition: transform 950ms cubic-bezier(0.62, 0.02, 0.34, 1); }
```

```ts
panels.forEach((panel, i) => {
  const involved = animate && (i === target || i === oldIndex);
  panel.classList.toggle('is-moving', involved);
  panel.style.setProperty('--slot', String(slot));
  if (involved) setTimeout(() => panel.classList.remove('is-moving'), 1000);
});
```

### 完整脚本

```ts
const panels = Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
let current = 0;
let locked = false;

function apply(index: number, direction: 1 | -1, animate: boolean, oldIndex = -1) {
  const clamped = Math.max(0, Math.min(panels.length - 1, index));

  panels.forEach((panel, i) => {
    // 前进：已过的向下（+1），未到的在上方（-1）；后退相反
    const slot = i === clamped ? 0 : i < clamped ? (direction > 0 ? 1 : -1) : direction > 0 ? -1 : 1;
    const involved = animate && (i === clamped || i === oldIndex);

    panel.classList.toggle('is-moving', involved);
    panel.style.setProperty('--slot', String(slot));

    // 视口外的屏不可聚焦、不可点击
    if (i === clamped) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');

    if (involved) setTimeout(() => panel.classList.remove('is-moving'), 1000);
  });

  current = clamped;
  history.replaceState(null, '', `#${panels[clamped].id}`);

  const heading = panels[clamped].querySelector<HTMLElement>('h1, h2');
  if (animate) setTimeout(() => heading?.focus({ preventScroll: true }), 620);
}

function go(delta: number) {
  if (locked) return;
  const next = current + delta;
  if (next < 0 || next >= panels.length) return;

  locked = true;

  // 1) 旧屏先动（可以让这一章里有自己的离场动画）
  const leaving = panels[current];
  leaving.classList.add('is-leaving');
  setTimeout(() => leaving.classList.remove('is-leaving'), 820);

  // 2) 延迟一点再整屏切换，视线能跟上
  setTimeout(() => {
    apply(next, delta > 0 ? 1 : -1, true, current);
    locked = false;
  }, 200);
}
```

### 服务端也要给初始 `--slot`

**没有 JS 时不能六屏叠在一起**。每章在 Astro 里写死初始位置：

```astro
<section class="chapter" id={chapter.id} style={`--slot:${index === 0 ? 0 : index}`}>
```

（第一屏 `0`，其余正数表示"在下方"；JS 接管后会重算。）

### 滚轮：别抢走内部滚动

```ts
function scrollableUnder(target: EventTarget | null, deltaY: number): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.scrollHeight > el.clientHeight + 2) {
      const style = getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
        if ((deltaY > 0 && !atBottom) || (deltaY < 0 && !atTop)) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

window.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) return;
  if (scrollableUnder(e.target, e.deltaY)) return;   // 放行给浏览器
  e.preventDefault();
  go(e.deltaY > 0 ? 1 : -1);
}, { passive: false });
```

不加这个判断，页面里所有内部滚动容器（相册横条、友链列表）都会失效——这是必踩的坑。

### 键盘

```ts
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
  if ((e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')) return;

  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  if (e.key === 'Home') { e.preventDefault(); apply(0, -1, true, current); }
  if (e.key === 'End') { e.preventDefault(); apply(panels.length - 1, 1, true, current); }
});
```

### 触摸

```ts
let startY = 0;
window.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', (e) => {
  const delta = startY - (e.changedTouches[0]?.clientY ?? startY);
  if (Math.abs(delta) < 48) return;      // 阈值，避免误触
  go(delta > 0 ? 1 : -1);
}, { passive: true });
```

## 章节导航轴

右侧竖直轴，节点按章节位置分布。

**如果章节标签是真实数值（高度 / 深度 / 距离）且跨越数量级，必须用对数刻度**，否则前几章会挤成一点：

```ts
const LOG_FLOOR = 10;
const raw = chapters.map((c) => Math.log10(c.value + LOG_FLOOR));
const min = Math.min(...raw), max = Math.max(...raw);
const offset = (value: number) =>
  (Math.log10(value + LOG_FLOOR) - min) / (max - min);
```

CSS 里 `bottom: calc(var(--offset) * 100%)`。

### 三个反向的教训

1. **绝对定位的节点不撑开父容器** —— `li` 全是 `position: absolute` 时 `<ol>` 宽度塌陷成 0，所有节点堆在一个点。必须 `<ol> { width: 13rem }` 显式给宽度，`li { right: 0 }` 从右往左排。
2. **文字往轴的外侧排** —— 轴贴在视口右边缘，文字要往**左**伸（`flex-direction: row-reverse`），否则冲出屏幕。
3. **给一个"当前位置"标记** —— 单纯的节点列表只能看出"有几章"，看不出"我在第几章"。加一个小图标，`bottom` 跟着当前章节的 offset 走，加 `transition` 就有爬升感。

## 手机端降级

| 桌面 | 手机 |
| --- | --- |
| 右侧竖轴 + 悬浮文字 | 底部一排紧凑圆点 / 编号 |
| 整屏切换 | 保留，但取消逐章动画 |
| 场景 SVG 完整 | 提高 `translateX` 让主体进入视野 |

整屏切换在手机上最容易出问题的是：`100dvh` 在地址栏收起/展开时变化 → 用 `100dvh` 而不是 `100vh`。
