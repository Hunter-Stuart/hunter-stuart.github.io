/** 中英双语路由：中文不加前缀，英文统一挂在 /en 下。 */

export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const htmlLanguage: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
};

export const localeLabel: Record<Locale, string> = {
  zh: '中文',
  en: 'EN',
};

export const otherLocale = (locale: Locale): Locale => (locale === 'zh' ? 'en' : 'zh');

/** 把站内路径转换成对应语言的路径。 */
export function localizedPath(locale: Locale, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}

/** 从当前 URL 里取出语言。 */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  return segment === 'en' ? 'en' : 'zh';
}
