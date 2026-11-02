import { getCollection } from 'astro:content';
import { localizedPath, type Locale } from '../i18n/config';

export const slugOf = (id: string) => id.slice(id.indexOf('/') + 1);

/* ------------------------------------------------------------------ */
/* 项目                                                                 */
/* ------------------------------------------------------------------ */

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  status: string;
  progress: number;
  tags: string[];
  date: Date;
  updated?: Date;
}

export async function getProjectEntries(locale: Locale) {
  const entries = await getCollection(
    'projects',
    ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft,
  );
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects(locale: Locale): Promise<ProjectSummary[]> {
  const entries = await getProjectEntries(locale);
  return entries.map((entry) => ({
    slug: slugOf(entry.id),
    title: entry.data.title,
    summary: entry.data.summary,
    status: entry.data.status,
    progress: entry.data.progress,
    tags: entry.data.tags,
    date: entry.data.date,
    updated: entry.data.updated,
  }));
}

/* ------------------------------------------------------------------ */
/* 日常                                                                 */
/* ------------------------------------------------------------------ */

export interface NoteSummary {
  slug: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  tags: string[];
}

export async function getNoteEntries(locale: Locale) {
  const entries = await getCollection(
    'notes',
    ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft,
  );
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNotes(locale: Locale): Promise<NoteSummary[]> {
  const entries = await getNoteEntries(locale);
  return entries.map((entry) => ({
    slug: slugOf(entry.id),
    title: entry.data.title,
    description: entry.data.description,
    date: entry.data.date,
    category: entry.data.category,
    tags: entry.data.tags,
  }));
}

/* ------------------------------------------------------------------ */
/* [[slug]] 跨内容引用                                                   */
/* ------------------------------------------------------------------ */

/**
 * 建立 slug → 链接 的索引。
 * 日志表格里的 [[hello-world]] 会按这个索引解析，找不到就原样保留。
 */
export async function buildRefIndex(locale: Locale) {
  const [posts, notes, projects] = await Promise.all([
    getCollection('posts', ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft),
    getCollection('notes', ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft),
    getCollection('projects', ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft),
  ]);

  const index = new Map<string, { title: string; href: string; kind: string }>();

  for (const entry of posts) {
    index.set(slugOf(entry.id), {
      title: entry.data.title,
      href: localizedPath(locale, `/posts/${slugOf(entry.id)}`),
      kind: 'post',
    });
  }
  for (const entry of notes) {
    index.set(slugOf(entry.id), {
      title: entry.data.title,
      href: localizedPath(locale, `/notes/${slugOf(entry.id)}`),
      kind: 'note',
    });
  }
  for (const entry of projects) {
    index.set(slugOf(entry.id), {
      title: entry.data.title,
      href: localizedPath(locale, `/projects/${slugOf(entry.id)}`),
      kind: 'project',
    });
  }

  return index;
}

const WIKI_LINK = /\[\[([A-Za-z0-9_-]+)\]\]/g;

/** 把 [[slug]] 变成带标题的链接；解析不到的保持原样，方便发现写错 */
export function resolveRefs(
  text: string,
  index: Map<string, { title: string; href: string; kind: string }>,
): string {
  if (!text.includes('[[')) return text;
  return text.replace(WIKI_LINK, (whole, slug: string) => {
    const hit = index.get(slug);
    if (!hit) return whole;
    return `<a class="journal-ref" href="${hit.href}" data-kind="${hit.kind}">${hit.title}</a>`;
  });
}

/** 是否含有未解析的引用——用于在页面上提示写错了 */
export function hasUnresolvedRef(text: string, index: Map<string, unknown>): boolean {
  for (const match of text.matchAll(WIKI_LINK)) {
    if (!index.has(match[1]!)) return true;
  }
  return false;
}
