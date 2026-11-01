import { localizedPath, type Locale } from '../i18n/config';
import { identity } from '../i18n/content';
import { getPosts } from './posts';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

/** 生成某语言的 RSS feed。 */
export async function buildRss(locale: Locale, origin: URL): Promise<Response> {
  const site = identity[locale];
  const posts = await getPosts(locale);
  const postsPath = localizedPath(locale, '/posts');
  const selfPath = localizedPath(locale, '/rss.xml');

  const items = posts
    .map((post) => {
      const url = new URL(`${postsPath}/${post.slug}`, origin).toString();
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${post.date.toUTCString()}</pubDate>`,
        `      <category>${escapeXml(post.category)}</category>`,
        `      <description>${escapeXml(post.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(site.title)}</title>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <link>${new URL(localizedPath(locale, '/'), origin).toString()}</link>`,
    `    <atom:link href="${new URL(selfPath, origin).toString()}" rel="self" type="application/rss+xml"/>`,
    `    <language>${locale === 'zh' ? 'zh-cn' : 'en'}</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
