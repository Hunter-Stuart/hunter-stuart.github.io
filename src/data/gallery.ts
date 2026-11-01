import type { Locale } from '../i18n/config';

/**
 * 第五章「日常」底部的相册。
 * 图片放在 public/media/gallery/，由 `npm run media` 从原始照片压缩生成。
 */
export interface Photo {
  /** public 下的路径 */
  src: string;
  width: number;
  height: number;
  /** 拍摄地点 */
  place: Record<Locale, string>;
  /** 一句话说明 */
  caption: Record<Locale, string>;
}

export const photos: Photo[] = [
  {
    src: '/media/gallery/chengdu-night.jpg',
    width: 760,
    height: 1013,
    place: { zh: '成都', en: 'Chengdu' },
    caption: { zh: '夜里十点，灯比人还多', en: 'Ten at night — more lights than people' },
  },
  {
    src: '/media/gallery/jiuzhaigou.jpg',
    width: 640,
    height: 1138,
    place: { zh: '九寨沟', en: 'Jiuzhaigou' },
    caption: { zh: '水太清了，看久了会失去深度感', en: 'The water is so clear it stops looking deep' },
  },
  {
    src: '/media/gallery/cycling-road.jpg',
    width: 1000,
    height: 750,
    place: { zh: '路上', en: 'On the road' },
    caption: { zh: '骑到没有树荫的那一段', en: 'The stretch with no shade left' },
  },
];
