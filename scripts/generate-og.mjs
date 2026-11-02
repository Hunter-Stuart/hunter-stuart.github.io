/**
 * 生成全站默认分享图 public/og-image.png（1200×630，Open Graph 标准尺寸）。
 *
 * 用 sharp 把一段 SVG 光栅化成 PNG —— 不引入设计素材，图是画出来的。
 * 改完跑 `npm run og`，产物直接提交进仓库（分享图为静态资源，不需要每次构建）。
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;

/** 固定种子的伪随机，保证每次生成的星点位置一致 */
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = makeRandom(20261101);

const stars = Array.from({ length: 130 }, () => {
  const x = rand() * W;
  const y = rand() * H;
  const r = 0.4 + rand() * 1.5;
  const o = 0.12 + rand() * 0.55;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#efe6cf" opacity="${o.toFixed(2)}"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.45" y2="1">
      <stop offset="0" stop-color="#0a0912"/>
      <stop offset="0.55" stop-color="#0b0917"/>
      <stop offset="1" stop-color="#120d1c"/>
    </linearGradient>
    <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#b8442a" stop-opacity="0"/>
      <stop offset="0.45" stop-color="#c2542c" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#e8874a" stop-opacity="0.95"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="#f7ad74" stop-opacity="0.55"/>
      <stop offset="0.45" stop-color="#e8874a" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#e8874a" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g>${stars}</g>

  <!-- 高度刻度：六条，呼应站点的 log10 高度轴 -->
  <g stroke="#f4ecda" stroke-opacity="0.1" stroke-width="1">
    <line x1="86" y1="150" x2="1114" y2="150"/>
    <line x1="86" y1="228" x2="1114" y2="228"/>
    <line x1="86" y1="306" x2="1114" y2="306"/>
    <line x1="86" y1="384" x2="1114" y2="384"/>
    <line x1="86" y1="462" x2="1114" y2="462"/>
    <line x1="86" y1="540" x2="1114" y2="540"/>
  </g>

  <!-- 上升轨迹 + 运载器光点 -->
  <path d="M 120 612 Q 520 596 760 372 T 1092 132"
        fill="none" stroke="url(#trail)" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="1092" cy="132" r="76" fill="url(#glow)"/>
  <circle cx="1092" cy="132" r="8.5" fill="#f7ad74"/>
  <circle cx="1092" cy="132" r="3.2" fill="#fff6e8"/>

  <!-- 文字 -->
  <text x="88" y="286" fill="#f4ecda" font-size="64" font-weight="600"
        font-family="Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif"
        letter-spacing="1">郝瀚宇 · 成长日记</text>

  <text x="90" y="348" fill="#a89b7e" font-size="31"
        font-family="Georgia, Times New Roman, serif"
        letter-spacing="0.6">Hunter Stuart — A Growth Journal</text>

  <line x1="90" y1="404" x2="330" y2="404" stroke="#e8874a" stroke-opacity="0.6" stroke-width="2"/>

  <text x="90" y="456" fill="#8d846e" font-size="22"
        font-family="Consolas, SFMono-Regular, monospace"
        letter-spacing="3.4">从地面到深空 · 一路写成六章</text>

  <text x="90" y="566" fill="#6f6754" font-size="18"
        font-family="Consolas, SFMono-Regular, monospace"
        letter-spacing="2.6">0 KM — 384,400 KM &#183; SIX CHAPTERS</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-image.png');

const { size } = await sharp('public/og-image.png').metadata();
console.log(`public/og-image.png  ${W}×${H}  ${(size / 1024).toFixed(1)} KB`);
