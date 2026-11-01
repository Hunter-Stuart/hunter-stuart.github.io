/**
 * 图片流水线：把原始照片压成网页用的尺寸，并生成相册清单。
 *
 * 用法：
 *   1. 把照片丢进 photos/<分类>/（分类目录名会直接当分类名显示）
 *   2. npm run gallery
 *   3. 提交 public/media/gallery/ 与 src/data/gallery.json
 *
 * 目录约定：
 *   photos/
 *   ├── 旅行/
 *   │   ├── jiuzhaigou.jpg        →  public/media/gallery/travel/jiuzhaigou.jpg
 *   │   └── ...
 *   └── 日常/
 *       └── ...
 *
 * 文件名建议用英文或拼音（会成为 URL）；中文名也能跑，但会被转写。
 * 同名的 .txt 或 .json 可以放一句说明：
 *   photos/旅行/jiuzhaigou.txt   内容「水太清了，看久了会失去深度感」
 * 若不提供，说明会留空，只显示地点与日期。
 *
 * photos/ 本身不进 git（原图太大），生成物才进。
 */

import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'photos');
const OUT_DIR = join(ROOT, 'public', 'media', 'gallery');
const MANIFEST = join(ROOT, 'src', 'data', 'gallery.json');

/** 分类目录名 → 输出目录 id（中文目录名转拼音式 slug 成本高，这里用简单映射） */
const CATEGORY_SLUGS = {
  旅行: 'travel',
  日常: 'life',
  校园: 'campus',
  其他: 'misc',
};

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.tif', '.tiff']);

/** 长边限制与质量：竖图按高度算，横图按宽度算 */
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1600;
const QUALITY = 80;

const toSlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/^-+|-+$/g, '') || 'photo';

/** 从文件名猜日期，猜不到就用文件的修改时间 */
function guessDate(fileName, mtime) {
  const match = fileName.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (match) return `${match[1]}-${match[2]}`;
  const d = new Date(mtime);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function readCaption(dir, fileName) {
  for (const ext of ['.txt', '.json']) {
    const candidate = join(dir, `${fileName}${ext}`);
    if (existsSync(candidate)) {
      const raw = (await readFile(candidate, 'utf8')).trim();
      if (ext === '.json') {
        try {
          return JSON.parse(raw).caption ?? '';
        } catch {
          return raw;
        }
      }
      return raw;
    }
  }
  return '';
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`没有找到 ${SRC_DIR}，先建一个 photos/<分类>/ 目录再跑。`);
    return;
  }

  const categories = [];
  let total = 0;

  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'zh'))) {
    if (!entry.isDirectory()) continue;

    const label = entry.name;
    const slug = CATEGORY_SLUGS[label] ?? toSlug(label);
    const categoryDir = join(SRC_DIR, label);
    const outCategoryDir = join(OUT_DIR, slug);
    await mkdir(outCategoryDir, { recursive: true });

    const photos = [];
    const files = (await readdir(categoryDir, { withFileTypes: true })).filter(
      (file) => file.isFile() && IMAGE_EXT.has(extname(file.name).toLowerCase()),
    );

    for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
      const srcPath = join(categoryDir, file.name);
      const info = await stat(srcPath);
      const base = basename(file.name, extname(file.name));
      const fileName = `${toSlug(base)}.jpg`;
      const outPath = join(outCategoryDir, fileName);

      const image = sharp(srcPath).rotate();
      const meta = await image.metadata();
      const pipeline = image.resize({
        width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH),
        height: Math.min(meta.height ?? MAX_HEIGHT, MAX_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true,
      });

      const encoded = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
      const finalMeta = await sharp(encoded).metadata();
      await writeFile(outPath, encoded);

      const caption = await readCaption(categoryDir, base);
      photos.push({
        src: `/media/gallery/${slug}/${fileName}`,
        width: finalMeta.width ?? 0,
        height: finalMeta.height ?? 0,
        place: label,
        date: guessDate(file.name, info.mtimeMs),
        caption,
      });
      total += 1;

      console.log(
        `  ${label}/${file.name}  →  ${slug}/${fileName}  ${(encoded.length / 1024).toFixed(0)} KB`,
      );
    }

    if (photos.length > 0) {
      // 新的在前
      photos.sort((a, b) => (a.date < b.date ? 1 : -1));
      categories.push({ id: slug, label, photos });
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString().slice(0, 10),
    categories,
  };
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`\n共 ${total} 张，${categories.length} 个分类。清单写入 src/data/gallery.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
