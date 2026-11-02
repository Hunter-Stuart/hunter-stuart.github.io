import type { Locale } from '../i18n/config';

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillGroup {
  group: string;
  items: SkillItem[];
}

export interface FriendLink {
  /** 站点名 / 昵称 */
  name: string;
  /** 真名，可选 */
  realName?: string;
  note: string;
  href: string;
}

interface Catalog {
  skills: SkillGroup[];
  friends: FriendLink[];
}

export const catalog: Record<Locale, Catalog> = {
  zh: {
    skills: [
      {
        group: '语言与运行时',
        items: [
          { name: 'TypeScript / JavaScript', level: 82 },
          { name: 'Python', level: 70 },
          { name: 'C / 嵌入式', level: 55 },
        ],
      },
      {
        group: '前端与可视化',
        items: [
          { name: 'Astro / React', level: 76 },
          { name: 'CSS 与设计系统', level: 74 },
          { name: 'SVG / Canvas 图形', level: 62 },
        ],
      },
      {
        group: '工程与工具',
        items: [
          { name: 'Git / GitHub Actions', level: 78 },
          { name: 'Linux / Shell', level: 66 },
          { name: '测试与调试', level: 58 },
        ],
      },
    ],
    friends: [
      { name: 'iceaxing', realName: '吴昊', note: '雪线之上的个人博客', href: 'https://iceaxing.com' },
      { name: '小登王', realName: '王登宇', note: '可爱小登王的个人主页', href: 'https://xiaodengwang01.github.io' },
      { name: '林宇祥的技术博客', note: '技术笔记与思考', href: 'https://sevenfriends.xtkx.site/' },
      { name: 'Fabbo', note: 'Fabbo喵~', href: 'https://fabbo.cc' },
      { name: 'LeetCode', note: '刷题记录与算法笔记', href: 'https://leetcode.cn/problemset/' },
      { name: '菜鸟教程', note: '学习编程的入门网站', href: 'https://www.runoob.com/' },
      { name: '母校UESTC', note: '电子科技大学', href: 'https://www.uestc.edu.cn/' },
      { name: 'books', note: 'Z-Library 电子书下载', href: 'https://z-lib.org/' },
    ],
  },
  en: {
    skills: [
      {
        group: 'Languages & runtimes',
        items: [
          { name: 'TypeScript / JavaScript', level: 82 },
          { name: 'Python', level: 70 },
          { name: 'C / Embedded', level: 55 },
        ],
      },
      {
        group: 'Frontend & visualisation',
        items: [
          { name: 'Astro / React', level: 76 },
          { name: 'CSS & design systems', level: 74 },
          { name: 'SVG / Canvas graphics', level: 62 },
        ],
      },
      {
        group: 'Engineering & tooling',
        items: [
          { name: 'Git / GitHub Actions', level: 78 },
          { name: 'Linux / Shell', level: 66 },
          { name: 'Testing & debugging', level: 58 },
        ],
      },
    ],
    friends: [
      { name: 'iceaxing', realName: '吴昊', note: 'A personal blog above the snowline', href: 'https://iceaxing.com' },
      { name: '小登王', realName: '王登宇', note: 'A very cute personal homepage', href: 'https://xiaodengwang01.github.io' },
      { name: '林宇祥的技术博客', note: 'Technical notes and thoughts', href: 'https://sevenfriends.xtkx.site/' },
      { name: 'Fabbo', note: 'Fabbo, meow~', href: 'https://fabbo.cc' },
      { name: 'LeetCode', note: '刷题记录与算法笔记', href: 'https://leetcode.cn/problemset/' },
      { name: '菜鸟教程', note: '学习编程的入门网站', href: 'https://www.runoob.com/' },
      { name: '母校UESTC', note: '电子科技大学', href: 'https://www.uestc.edu.cn/' },
      { name: 'books', note: 'Z-Library e-book downloads', href: 'https://z-lib.org/' },
    ],
  },
};

export const getCatalog = (locale: Locale) => catalog[locale];

/** 与语言无关的站点链接。 */
export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Hunter-Stuart' },
];
