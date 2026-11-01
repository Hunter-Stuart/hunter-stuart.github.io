import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/config';

/** 文章按语言分目录存放：src/content/posts/<locale>/<slug>.md */
export const slugOf = (id: string) => id.slice(id.indexOf('/') + 1);

export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  tags: string[];
  featured: boolean;
}

/** 取某语言的全部已发布文章，按时间倒序。 */
export async function getPostEntries(locale: Locale) {
  const entries = await getCollection(
    'posts',
    ({ id, data }) => id.startsWith(`${locale}/`) && !data.draft,
  );

  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** 列表用：只要元信息。 */
export async function getPosts(locale: Locale): Promise<PostSummary[]> {
  const entries = await getPostEntries(locale);
  return entries.map((entry) => ({
    slug: slugOf(entry.id),
    title: entry.data.title,
    description: entry.data.description,
    date: entry.data.date,
    category: entry.data.category,
    tags: entry.data.tags,
    featured: entry.data.featured,
  }));
}

/** 首页「精选」优先取 featured，不足时用最新补齐。 */
export function pickFeatured(posts: PostSummary[], limit = 4): PostSummary[] {
  const featured = posts.filter((post) => post.featured);
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}
