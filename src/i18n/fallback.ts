/**
 * 检查中英文案是否同步（只做体检，不参与构建）。
 *
 *   npm run i18n:check
 *
 * 中英是两份独立字典，互相不影响。这个脚本只列出
 * 「含中文但英文缺失 / 英文与中文完全相同」的路径，
 * 方便你补翻译；不补也不影响构建与排版。
 */

type Unknown = unknown;

function isPlainObject(value: Unknown): value is Record<string, Unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function untranslatedPaths(source: Unknown, override: Unknown, prefix = ''): string[] {
  if (Array.isArray(source)) {
    const list = Array.isArray(override) ? override : [];
    return source.flatMap((item, index) =>
      untranslatedPaths(item, list[index], `${prefix}[${index}]`),
    );
  }

  if (isPlainObject(source)) {
    const patch = isPlainObject(override) ? override : {};
    return Object.keys(source).flatMap((key) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return untranslatedPaths(source[key], patch[key], path);
    });
  }

  // 只关心含中文的字符串；`FOCUS`、`2024 — 至今` 这类本来就该两边一样
  if (typeof source === 'string') {
    if (!/[\u4e00-\u9fff]/.test(source)) return [];
    return override === undefined || override === source ? [prefix] : [];
  }

  return [];
}
