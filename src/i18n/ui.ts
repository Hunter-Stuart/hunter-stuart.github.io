import type { Locale } from './config';

/** 界面文案：导航、按钮、标签，与具体内容无关。 */
export interface UiCopy {
  skipToContent: string;
  nav: {
    home: string;
    blog: string;
    profile: string;
    posts: string;
    friends: string;
    tools: string;
  journal: string;
  };
  navLabel: string;
  mobileNavLabel: string;
  menuOpen: string;
  menuClose: string;
  theme: string;
  language: string;
  switchToOther: string;
  axisLabel: string;
  dockLabel: string;
  axis: string;
  nextStation: string;
  backToPad: string;
  readBlog: string;
  readPosts: string;
  backToPosts: string;
  toc: string;
  entries: (count: number) => string;
  empty: string;
  rss: string;
  contact: string;
  rights: string;
  postsIndexTitle: string;
  postsIndexIntro: (count: number) => string;
  tabPosts: string;
  tabNotes: string;
  tabProjects: string;
  noNotes: string;
  noProjects: string;
  sortDesc: string;
  sortAsc: string;
  sortLabel: string;
  emailPrimary: string;
  galleryTitle: string;
  galleryIntro: string;
  friendsTitle: string;
  friendsIntro: string;
  friendsAll: string;
  backToFriends: string;
  notFoundTitle: string;
  notFoundIntro: string;
}

export const ui: Record<Locale, UiCopy> = {
  zh: {
    skipToContent: '跳到主要内容',
    nav: { home: '首页', blog: '博客', profile: '个人简历', posts: '所有文章', friends: '友链', tools: '工具', journal: '日志' },
    navLabel: '主导航',
    mobileNavLabel: '移动导航',
    menuOpen: '打开导航菜单',
    menuClose: '关闭导航菜单',
    theme: '切换深浅主题',
    art: '切换画风（油画 / 水墨）',
    language: '切换语言',
    switchToOther: 'English',
    axisLabel: '轨道高度导航',
    dockLabel: '章节快速导航',
    axis: '高度',
    nextStation: '下一站',
    backToPad: '回到发射台',
    readBlog: '读博客',
    readPosts: '所有文章',
    backToPosts: '返回文章',
    toc: '目录',
    entries: (count) => `${count} 篇`,
    empty: '还没有发布任何文章。',
    rss: 'RSS',
    contact: '联系方式',
    rights: '保留所有权利',
    postsIndexTitle: '所有文章',
    tabPosts: '笔记',
    tabNotes: '日常',
    tabProjects: '项目',
    noNotes: '还没有写过日常。',
    noProjects: '还没有项目。',
    sortDesc: '倒序',
    sortAsc: '正序',
    sortLabel: '切换排序方式',
    postsIndexIntro: (count) => `共 ${count} 篇，按升空时间排列`,
    emailPrimary: '邮箱',
    galleryTitle: '随手拍',
    galleryIntro: '路上拍的一些，按时间分类。',
    friendsTitle: '友链',
    friendsIntro: '这些坐标上的站点，都是我常去的地方。',
    friendsAll: '全部友链',
    backToFriends: '返回友链',
    notFoundTitle: '这里没有信号',
    notFoundIntro: '你要找的页面已经脱离轨道，或者从未发射过。',
  },
  en: {
    skipToContent: 'Skip to content',
    nav: { home: 'Home', blog: 'Blog', profile: 'Résumé', posts: 'All posts', friends: 'Friends', tools: 'Tools', journal: 'Journal' },
    navLabel: 'Main navigation',
    mobileNavLabel: 'Mobile navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    theme: 'Toggle theme',
    art: 'Switch art style (oil / ink)',
    language: 'Switch language',
    switchToOther: '中文',
    axisLabel: 'Altitude navigation',
    dockLabel: 'Chapter navigation',
    axis: 'ALTITUDE',
    nextStation: 'Next',
    backToPad: 'Back to launch pad',
    readBlog: 'Read the blog',
    readPosts: 'All posts',
    backToPosts: 'Back to posts',
    toc: 'Contents',
    entries: (count) => `${count} entries`,
    empty: 'No posts published yet.',
    rss: 'RSS',
    contact: 'Contact',
    rights: 'All rights reserved',
    postsIndexTitle: 'All entries',
    tabPosts: 'Notes',
    tabNotes: 'Life',
    tabProjects: 'Projects',
    noNotes: 'No notes yet.',
    noProjects: 'No projects yet.',
    sortDesc: 'Newest',
    sortAsc: 'Oldest',
    sortLabel: 'Change sort order',
    postsIndexIntro: (count) => `${count} entries, newest first.`,
    emailPrimary: 'Email',
    galleryTitle: 'Gallery',
    galleryIntro: 'Frames from the road, grouped by when they were taken.',
    friendsTitle: 'Friends',
    friendsIntro: 'Stations at these coordinates are places I keep returning to.',
    friendsAll: 'All friends',
    backToFriends: 'Back to friends',
    notFoundTitle: 'Signal lost',
    notFoundIntro: 'The page you are looking for has left its orbit, or never launched.',
  },
};

export const getUi = (locale: Locale) => ui[locale];
