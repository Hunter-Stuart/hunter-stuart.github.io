/**
 * 生成两张可平铺的灰度肌理图：
 *   public/textures/oil-stroke.png  —— 油画笔触（方向性条纹 + 颗粒）
 *   public/textures/ink-fiber.png   —— 水墨宣纸（横向纤维 + 湿晕）
 *
 * 只依赖 Node 内置模块，不需要任何图形库：手写 PNG 编码 + zlib 压缩。
 * 用法：node scripts/generate-textures.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 256; // 平铺尺寸；CSS 里会放大，肌理本来就是模糊的
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'textures');

/* ---------- PNG 编码 ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/** 8 位灰度 PNG */
function encodeGrayPng(width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 0; // color type: grayscale
  header[10] = 0; // deflate
  header[11] = 0; // adaptive filtering
  header[12] = 0; // no interlace

  const stride = width + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0; // filter: none
    pixels.copy(raw, y * stride + 1, y * width, y * width + width);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- 噪声 ---------- */

const fade = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** 可平铺的 value noise：格点坐标按周期取模，保证左右上下无缝。 */
function makeNoise(period, seed) {
  const grid = new Float32Array(period * period);
  let s = seed;
  for (let i = 0; i < grid.length; i += 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    grid[i] = s / 4294967296;
  }
  const at = (x, y) => grid[((y % period) + period) % period * period + (((x % period) + period) % period)];

  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = fade(x - xi);
    const ty = fade(y - yi);
    return lerp(
      lerp(at(xi, yi), at(xi + 1, yi), tx),
      lerp(at(xi, yi + 1), at(xi + 1, yi + 1), tx),
      ty,
    );
  };
}

function fbm(x, y, octaves, period, seed) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let o = 0; o < octaves; o += 1) {
    const noise = makeNoise(Math.max(2, Math.round(period * frequency)), seed + o * 977);
    value += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / total;
}

/* ---------- 油画笔触 ---------- */

function paintOil() {
  const field = new Float32Array(SIZE * SIZE).fill(0.5);
  const strokes = 5200;

  let seed = 20261031;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const distToSegment = (px, py, x0, y0, x1, y1) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const lengthSq = dx * dx + dy * dy || 1;
    const t = Math.min(1, Math.max(0, ((px - x0) * dx + (py - y0) * dy) / lengthSq));
    const cx = x0 + t * dx - px;
    const cy = y0 + t * dy - py;
    return Math.sqrt(cx * cx + cy * cy);
  };

  for (let i = 0; i < strokes; i += 1) {
    const cx = rnd() * SIZE;
    const cy = rnd() * SIZE;

    // 笔触方向由低频流场决定：相邻的笔触朝同一方向，成片地形成漩涡
    const flow = fbm((cx / SIZE) * 4, (cy / SIZE) * 4, 3, 8, 907) * Math.PI * 2.4;
    const length = 7 + rnd() * 24;
    const halfWidth = 0.9 + rnd() * 2.1;
    const tone = 0.5 + (rnd() - 0.5) * 0.62;

    const x0 = cx - (Math.cos(flow) * length) / 2;
    const y0 = cy - (Math.sin(flow) * length) / 2;
    const x1 = cx + (Math.cos(flow) * length) / 2;
    const y1 = cy + (Math.sin(flow) * length) / 2;

    const minX = Math.max(0, Math.floor(Math.min(x0, x1) - halfWidth - 1));
    const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(x0, x1) + halfWidth + 1));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1) - halfWidth - 1));
    const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(y0, y1) + halfWidth + 1));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const distance = distToSegment(x, y, x0, y0, x1, y1);
        if (distance > halfWidth) continue;
        // 边缘渐隐，笔触之间才有颜料堆叠的软过渡
        const alpha = (1 - distance / halfWidth) * 0.5;
        const index = y * SIZE + x;
        field[index] = field[index] * (1 - alpha) + tone * alpha;
      }
    }
  }

  // 叠一层低频色块和细颗粒，避免笔触之间过于均匀
  const pixels = Buffer.alloc(SIZE * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const u = (x / SIZE) * 6;
      const v = (y / SIZE) * 6;
      const blotch = fbm(u * 0.8, v * 0.8, 2, 7, 71);
      const grain = fbm(u * 7, v * 7, 2, 40, 53);
      let value = field[y * SIZE + x] + (blotch - 0.5) * 0.16 + (grain - 0.5) * 0.09;
      value = Math.min(1, Math.max(0, value));
      pixels[y * SIZE + x] = Math.round(value * 255);
    }
  }

  return pixels;
}

/* ---------- 水墨宣纸 ---------- */

function paintInk() {
  const pixels = Buffer.alloc(SIZE * SIZE);

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const u = (x / SIZE) * 8;
      const v = (y / SIZE) * 8;

      // 纤维：横向低频、纵向高频，像纸浆里的长纤维
      const fiber = fbm(u * 0.5, v * 7, 2, 8, 101);
      // 墨晕：大块低频起伏，模拟水在纸上扩开
      const blotch = fbm(u * 1.1, v * 1.1, 4, 10, 137);
      // 细颗粒
      const grain = fbm(u * 9, v * 9, 2, 40, 163);

      let value = 0.56 + (fiber - 0.5) * 0.2 + (blotch - 0.5) * 0.26 + (grain - 0.5) * 0.1;
      value = Math.min(1, Math.max(0, value));
      pixels[y * SIZE + x] = Math.round(value * 255);
    }
  }

  return pixels;
}

/* ---------- 输出 ---------- */

mkdirSync(OUT_DIR, { recursive: true });

for (const [name, painter] of [
  ['oil-stroke.png', paintOil],
  ['ink-fiber.png', paintInk],
]) {
  const png = encodeGrayPng(SIZE, SIZE, painter());
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`${name}  ${SIZE}x${SIZE}  ${(png.length / 1024).toFixed(1)} KB`);
}
