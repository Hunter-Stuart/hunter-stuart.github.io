/**
 * 日志（周表）读取。
 *
 * 两种数据源都支持，构建时统一解析成同一种结构：
 *   src/content/journal/<week>.md   正文是一个 Markdown 表格
 *   src/data/journal/<week>.csv     逗号分隔，表头固定
 *
 * 周编号用 ISO 格式（2026-W45），同时作为 URL。
 */

export interface JournalRow {
  /** 日期列，原样保留（11-02 周一 / 2026-11-02 都能写） */
  date: string;
  /** 今天准备干什么 */
  plan: string;
  /** 实际干了什么 */
  done: string;
  /** 收获 */
  learned: string;
  /** 感悟 */
  thought: string;
}

export interface JournalWeek {
  week: string;
  /** 该周周一 */
  start: Date;
  theme: string;
  rows: JournalRow[];
  source: 'md' | 'csv';
}

const COLUMNS = ['date', 'plan', 'done', 'learned', 'thought'] as const;

/* ------------------------------------------------------------------ */
/* Markdown：解析 frontmatter + 第一个表格                              */
/* ------------------------------------------------------------------ */

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    // 去掉包裹的引号
    data[kv[1]!] = kv[2]!.trim().replace(/^['"]|['"]$/g, '');
  }
  return { data, body: match[2] ?? '' };
}

/** 把一个 Markdown 表格解析成二维数组 */
function parseMarkdownTable(body: string): string[][] {
  const lines = body.split(/\r?\n/);
  const tableLines: string[] = [];
  let started = false;

  for (const line of lines) {
    const isRow = line.trim().startsWith('|');
    if (isRow) {
      started = true;
      tableLines.push(line.trim());
    } else if (started) {
      // 表格结束
      break;
    }
  }

  if (tableLines.length < 2) return [];

  const split = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      // 单元格内的 \| 先保护起来，避免被当成分隔符
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim().replace(/\\\|/g, '|'));

  const header = split(tableLines[0]!);
  const bodyRows = tableLines.slice(1);

  // 跳过第二行分隔符（|---|---|）
  const dataRows = /^[\s|:-]+$/.test(bodyRows[0] ?? '') ? bodyRows.slice(1) : bodyRows;

  return [header, ...dataRows.map(split)];
}

/* ------------------------------------------------------------------ */
/* CSV：支持引号包裹、双引号转义                                         */
/* ------------------------------------------------------------------ */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  // 去掉 BOM
  const input = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;

    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows.filter((r) => r.some((v) => v.length > 0));
}

/* ------------------------------------------------------------------ */
/* 合并两种来源                                                         */
/* ------------------------------------------------------------------ */

/** 表头名 → 字段名，中英文都认 */
const HEADER_ALIASES: Record<string, (typeof COLUMNS)[number]> = {
  date: 'date', 日期: 'date',
  plan: 'plan', 计划: 'plan', 准备: 'plan',
  done: 'done', 实际: 'done', 完成: 'done',
  learned: 'learned', 收获: 'learned', 学到: 'learned',
  thought: 'thought', 感悟: 'thought', 感想: 'thought',
};

function rowsFromTable(table: string[][]): JournalRow[] {
  if (table.length < 2) return [];

  const header = table[0]!.map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? null);
  const out: JournalRow[] = [];

  for (const raw of table.slice(1)) {
    if (raw.every((cell) => !cell)) continue;
    const row: JournalRow = { date: '', plan: '', done: '', learned: '', thought: '' };
    header.forEach((field, i) => {
      if (field) row[field] = raw[i] ?? '';
    });
    if (!row.date && !row.plan && !row.done) continue;
    out.push(row);
  }

  return out;
}

/** Markdown 文件：全部来自 src/content/journal */
const mdFiles = import.meta.glob('../content/journal/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** CSV 文件：放在 src/data/journal */
const csvFiles = import.meta.glob('../data/journal/*.csv', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const weekOfPath = (path: string) => (path.split(/[\\/]/).pop() ?? '').replace(/\.[^.]+$/, '');

function buildWeeks(): JournalWeek[] {
  const weeks: JournalWeek[] = [];

  for (const [path, raw] of Object.entries(mdFiles)) {
    const { data, body } = parseFrontmatter(raw);
    if (data.draft === 'true') continue;

    const week = data.week || weekOfPath(path);
    weeks.push({
      week,
      start: new Date(data.start ?? `${week}-1`),
      theme: data.theme ?? '',
      rows: rowsFromTable(parseMarkdownTable(body)),
      source: 'md',
    });
  }

  for (const [path, raw] of Object.entries(csvFiles)) {
    const week = weekOfPath(path);
    const [header, ...rest] = parseCsv(raw);
    if (!header) continue;
    weeks.push({
      week,
      // CSV 没有 frontmatter，start 由周编号推，页面不展示具体日期时无影响
      start: new Date(`${week}-1`),
      theme: '',
      rows: rowsFromTable([header, ...rest]),
      source: 'csv',
    });
  }

  return weeks.sort((a, b) => (a.week < b.week ? 1 : -1));
}

export const journalWeeks = buildWeeks();

export const getWeek = (week: string) => journalWeeks.find((w) => w.week === week);

/** 2026-W45 → 2026 第 45 周 */
export function formatWeekLabel(week: string, locale: 'zh' | 'en'): string {
  const match = /^(\d{4})-W(\d{1,2})$/.exec(week);
  if (!match) return week;
  const [, year, num] = match;
  return locale === 'zh' ? `${year} 年第 ${Number(num)} 周` : `${year} · week ${Number(num)}`;
}

/** 该周周一到周日，用于展示日期范围 */
export function weekRange(week: JournalWeek, locale: 'zh' | 'en'): string {
  const start = week.start;
  if (Number.isNaN(start.valueOf())) return '';
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return locale === 'zh' ? `${fmt(start)} — ${fmt(end)}` : `${fmt(start)} – ${fmt(end)}`;
}
