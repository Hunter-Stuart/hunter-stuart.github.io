/**
 * 六章轨道阶梯：卫星从发射台升到深空。
 * 高度跨 6 个数量级（0 → 384,400 km），右侧导航轴因此使用对数刻度，
 * 否则前四章会全部挤在轴的最底端。
 *
 * 这里只放与语言无关的结构（id、高度、编号）。
 * 章节名称、代号与文案按语言放在 src/i18n/content.ts，
 * 强调色放在 src/styles/global.css 的 --accent-<id> 变量里。
 */

export interface OrbitChapter {
  /** 锚点 id，同时决定 data-chapter 与 --accent-<id> */
  id: string;
  /** 章节编号 '01' */
  index: string;
  /** 真实高度，单位 km */
  altitudeKm: number;
  /** 展示用高度文本，语言无关（数字 + KM） */
  altitude: string;
}

export const chapters: OrbitChapter[] = [
  { id: 'launch-pad', index: '01', altitudeKm: 0, altitude: '0 KM' },
  { id: 'troposphere', index: '02', altitudeKm: 12, altitude: '12 KM' },
  { id: 'karman-line', index: '03', altitudeKm: 100, altitude: '100 KM' },
  { id: 'low-earth-orbit', index: '04', altitudeKm: 400, altitude: '400 KM' },
  { id: 'geostationary', index: '05', altitudeKm: 35786, altitude: '35,786 KM' },
  { id: 'deep-space', index: '06', altitudeKm: 384400, altitude: '384,400 KM' },
];

const LOG_FLOOR = 10; // 让 0 km 也能取对数
const rawOffsets = chapters.map((chapter) => Math.log10(chapter.altitudeKm + LOG_FLOOR));
const minOffset = Math.min(...rawOffsets);
const maxOffset = Math.max(...rawOffsets);

/**
 * 归一化到 0–1 的对数位置：0 表示发射台（轴最底部），1 表示深空（轴最顶部）。
 */
export const altitudeOffset = (altitudeKm: number) =>
  (Math.log10(altitudeKm + LOG_FLOOR) - minOffset) / (maxOffset - minOffset);

/** 供 CSS 使用的百分比字符串，用于导航轴节点定位 */
export const altitudePercent = (altitudeKm: number) =>
  `${(altitudeOffset(altitudeKm) * 100).toFixed(2)}%`;
