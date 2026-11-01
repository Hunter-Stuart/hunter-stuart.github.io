/**
 * 中英文案同步体检（不参与构建）。
 *
 *   npm run i18n:check
 *
 * 中英是两份独立字典，各自完整、互不回退 —— 这样英文页不会被中文撑坏排版。
 * 这个脚本只告诉你哪些字段还缺英文，方便你有空时补。
 */

import { homeCopy, identity, profileCopy, welcomeCopy } from '../src/i18n/content.ts';
import { untranslatedPaths } from '../src/i18n/fallback.ts';

const groups: Array<[string, { zh: unknown; en: unknown }]> = [
  ['identity', identity as unknown as { zh: unknown; en: unknown }],
  ['homeCopy', homeCopy as unknown as { zh: unknown; en: unknown }],
  ['welcomeCopy', welcomeCopy as unknown as { zh: unknown; en: unknown }],
  ['profileCopy', profileCopy as unknown as { zh: unknown; en: unknown }],
];

let total = 0;

for (const [name, pair] of groups) {
  const missing = untranslatedPaths(pair.zh, pair.en, name);
  total += missing.length;

  if (missing.length === 0) {
    console.log(`✓ ${name}：已同步`);
    continue;
  }

  console.log(`\n${name}：${missing.length} 处仍是中文`);
  for (const path of missing) console.log(`  · ${path}`);
}

console.log(
  total === 0 ? '\n中英两份字典完全同步。' : `\n共 ${total} 处待补英文（不影响构建）。`,
);
