import type { Locale } from '../i18n/config';

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillGroup {
  group: string;
  items: SkillItem[];
}

export interface ProjectEntry {
  name: string;
  summary: string;
  status: string;
  progress: number;
  tags: string[];
}

export interface LifeNote {
  title: string;
  date: string;
  category: string;
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
  projects: ProjectEntry[];
  lifeNotes: LifeNote[];
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
    projects: [
      {
        name: '轨道博客',
        summary: '你现在看到的这个站点：Astro 静态生成、双主题、六章轨道叙事。',
        status: '进行中',
        progress: 72,
        tags: ['Astro', 'CSS', 'SVG'],
      },
      {
        name: '实验数据看板',
        summary: '把实验室里零散的 CSV 变成可对比的图表，带离线缓存。',
        status: '维护中',
        progress: 55,
        tags: ['TypeScript', '图表'],
      },
      {
        name: '小型地面站',
        summary: '用一块 SDR 和几个脚本，接收气象卫星的自动图像传输信号。',
        status: '计划中',
        progress: 20,
        tags: ['SDR', '信号处理'],
      },
    ],
    lifeNotes: [
      { title: '把桌面收拾干净之后，写代码变快了吗', date: '2026-10-18', category: '日常' },
      { title: '这半年读完的几本书，以及没读完的那些', date: '2026-09-30', category: '阅读' },
      { title: '夜跑路线换成沿河之后', date: '2026-09-12', category: '身体' },
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
    projects: [
      {
        name: 'This site',
        summary:
          'What you are reading now: statically generated with Astro, dual themes, six orbital chapters.',
        status: 'In progress',
        progress: 72,
        tags: ['Astro', 'CSS', 'SVG'],
      },
      {
        name: 'Lab data dashboard',
        summary:
          'Turns scattered CSVs from the lab into comparable charts, with offline caching.',
        status: 'Maintained',
        progress: 55,
        tags: ['TypeScript', 'Charts'],
      },
      {
        name: 'Small ground station',
        summary:
          'An SDR and a handful of scripts to receive weather satellite image transmissions.',
        status: 'Planned',
        progress: 20,
        tags: ['SDR', 'Signal processing'],
      },
    ],
    lifeNotes: [
      {
        title: 'Did clearing my desk actually make me write code faster?',
        date: '2026-10-18',
        category: 'Everyday',
      },
      {
        title: 'Books I finished this half-year, and the ones I did not',
        date: '2026-09-30',
        category: 'Reading',
      },
      { title: 'After moving my night runs to the riverside', date: '2026-09-12', category: 'Body' },
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
