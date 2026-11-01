/**
 * 博客页：整屏切换（不是滚动）。
 *
 * 前进时：当前这一屏向下退出，下一屏从上方落下；
 * 后退时相反。运载器在这一屏里的位移与之叠加，
 * 于是视口里看到的是"火箭继续上升，页面跟着换了一屏"。
 *
 * 全部原生 API，没有框架运行时。
 */

const home = document.querySelector<HTMLElement>('[data-orbit-home]');
const panels = Array.from(document.querySelectorAll<HTMLElement>('.orbit-panel'));
const axisItems = Array.from(document.querySelectorAll<HTMLElement>('[data-orbit-item]'));
const links = Array.from(document.querySelectorAll<HTMLElement>('[data-orbit-link]'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let current = -1;
let locked = false;

/** 视口内只留一屏：其余屏移到上方或下方，并标记 inert 让它们不可聚焦 */
/** 视口内只留一屏。只有 oldIndex 与 clamped 这两屏参与过渡，
 *  其余屏直接归位 —— 否则它们也会从 -200% 慢慢滑到 -100%，在视口边缘闪一下。 */
function apply(index: number, direction: 1 | -1, animate: boolean, oldIndex = -1) {
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  const target = panels[clamped];

  if (!animate) home?.classList.add('no-transition');

  panels.forEach((panel, i) => {
    const slot = i === clamped ? 0 : i < clamped ? (direction > 0 ? 1 : -1) : direction > 0 ? -1 : 1;
    const involved = animate && (i === clamped || i === oldIndex);

    panel.classList.toggle('is-moving', involved);
    panel.style.setProperty('--slot', String(slot));
    panel.classList.toggle('is-current', i === clamped);

    if (involved) {
      window.setTimeout(() => panel.classList.remove('is-moving'), 1000);
    }

    if (i === clamped) {
      panel.removeAttribute('inert');
    } else {
      panel.setAttribute('inert', '');
    }
  });

  if (!animate) {
    // 首帧不要过渡，否则会看到整摞屏一起滑
    window.requestAnimationFrame(() => home?.classList.remove('no-transition'));
  }

  current = clamped;
  setActive(target.id);

  const heading = target.querySelector<HTMLElement>('h1, h2');
  if (animate) window.setTimeout(() => heading?.focus({ preventScroll: true }), 620);

  const hash = `#${target.id}`;
  if (location.hash !== hash) {
    history.replaceState(null, '', hash);
  }
}

/** 目标屏的入场动画 */
function target0Class(index: number) {
  const panel = panels[index];
  if (!panel) return;
  panel.classList.remove('is-arriving');
  void panel.offsetWidth;
  panel.classList.add('is-arriving');
  window.setTimeout(() => panel.classList.remove('is-arriving'), 1460);
}

function setActive(id: string) {
  for (const item of axisItems) {
    item.classList.toggle('is-active', item.dataset.orbitItem === id);
  }
  for (const link of links) {
    if (link.dataset.orbitLink === id) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  // 引导栏上的小火箭跟着爬到当前高度
  const craft = document.querySelector<HTMLElement>('[data-axis-craft]');
  const active = axisItems.find((item) => item.dataset.orbitItem === id);
  const offset = active?.dataset.offset;
  if (craft && offset) {
    craft.style.setProperty('--craft-offset', offset);
    craft.style.setProperty('--craft-accent', `var(--accent-${id})`);
  }
}

function go(delta: number) {
  if (locked) return;
  const next = current + delta;
  if (next < 0 || next >= panels.length) return;

  const target = panels[next];
  const leaving = panels[current];
  const direction = delta > 0 ? 1 : -1;

  locked = true;

  // 1) 旧屏点火：运载器先动
  if (leaving) {
    leaving.classList.remove('is-departing');
    void leaving.offsetWidth;
    leaving.classList.add('is-departing');
    window.setTimeout(() => leaving.classList.remove('is-departing'), 820);
  }

  // 2) 200ms 后整屏切换：旧屏向下退出，新屏从上方落下
  window.setTimeout(
    () => {
      apply(next, direction, true, current);

      target.classList.remove('is-arriving');
      void target.offsetWidth;
      target.classList.add('is-arriving');
      window.setTimeout(() => target.classList.remove('is-arriving'), 1460);

      window.setTimeout(() => {
        locked = false;
      }, 700);
    },
    reducedMotion.matches ? 0 : 200,
  );
}

/** 指针下面有没有"还能继续滚"的容器；有的话滚轮交给浏览器原生处理 */
function scrollableUnder(target: EventTarget | null, deltaY: number): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.scrollHeight > el.clientHeight + 2) {
      const style = window.getComputedStyle(el);
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

if (home && panels.length > 0) {
  // 初始：第一屏就位，其余在视口外
  const hashIndex = panels.findIndex((panel) => `#${panel.id}` === location.hash);
  apply(hashIndex >= 0 ? hashIndex : 0, 1, false);

  /* ---------- 滚轮 ---------- */

  window.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaY) < 4) return;

      // 鼠标下的滚动容器（整屏内容、友链列表等）还有余量时，交给浏览器
      if (scrollableUnder(event.target, event.deltaY)) return;

      event.preventDefault();
      go(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  /* ---------- 触摸 ---------- */

  let touchStartY = 0;
  window.addEventListener(
    'touchstart',
    (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    },
    { passive: true },
  );

  window.addEventListener(
    'touchend',
    (event) => {
      const delta = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY);
      if (Math.abs(delta) < 48) return;

      const inner = panels[current]?.querySelector<HTMLElement>('.orbit-panel-inner');
      if (inner && inner.scrollHeight > inner.clientHeight + 2) {
        const atTop = inner.scrollTop <= 0;
        const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
        if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) return;
      }
      go(delta > 0 ? 1 : -1);
    },
    { passive: true },
  );

  /* ---------- 键盘 ---------- */

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      apply(0, -1, true, current);
    } else if (event.key === 'End') {
      event.preventDefault();
      apply(panels.length - 1, 1, true, current);
    }
  });

  /* ---------- 高度轴 / 章节入口 ---------- */

  for (const link of links) {
    link.addEventListener('click', (event) => {
      const id = link.dataset.orbitLink;
      const index = panels.findIndex((panel) => panel.id === id);
      if (index < 0) return;
      event.preventDefault();
      if (index === current) return;
      const from = current;
      const direction = index > from ? 1 : -1;

      if (Math.abs(index - from) === 1) {
        go(direction);
        return;
      }

      // 跨了多屏：直接把两屏滑到位，中间屏不参与
      locked = true;
      apply(index, direction, true, from);
      target0Class(index);
      window.setTimeout(() => {
        locked = false;
      }, 1000);
    });
  }

  /* ---------- 地址栏回到同页 ---------- */

  window.addEventListener('hashchange', () => {
    const index = panels.findIndex((panel) => `#${panel.id}` === location.hash);
    if (index >= 0 && index !== current) apply(index, index > current ? 1 : -1, true, current);
  });
}
