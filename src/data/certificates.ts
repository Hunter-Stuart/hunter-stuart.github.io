/**
 * 荣誉与证书。
 *
 * 图片放在 public/media/certificates/，长边压到 1400、质量 82，
 * 单张 60–240 KB。原图不进仓库。
 *
 * sort 规则：先按 level 权重（国家级在前），同级按年份倒序。
 */

export type CertLevel = 'national' | 'international' | 'provincial' | 'program' | 'school';

export interface Certificate {
  /** 同时是图片文件名 */
  slug: string;
  year: string;
  level: CertLevel;
  title: { zh: string; en: string };
  issuer: { zh: string; en: string };
  /** 作品名或备注，可选 */
  work?: { zh: string; en: string };
  /** 横版证书：卡片缩略图用 4:3，竖版用 4:5，避免横图被裁成一条 */
  landscape?: boolean;
}

/** 级别权重，越小越靠前 */
const LEVEL_WEIGHT: Record<CertLevel, number> = {
  national: 0,
  international: 1,
  provincial: 2,
  program: 3,
  school: 4,
};

export const certificates: Certificate[] = [
  {
    slug: 'soc-national-2026-first',
    year: '2026',
    level: 'national',
    title: {
      zh: '第九届全国大学生嵌入式芯片与系统设计竞赛 · 全国总决赛 一等奖',
      en: '9th National Embedded Chip & System Design Contest — National Finals, First Prize',
    },
    issuer: { zh: '中国电子教育学会', en: 'China Electronics Education Society' },
    work: {
      zh: '械随影动 —— 基于 VR 技术操控的机械臂履带车',
      en: 'Motion Follows Shadow — a VR-operated tracked robotic arm',
    },
  },
  {
    slug: 'soc-fpga-2025-second',
    year: '2025',
    level: 'national',
    title: {
      zh: '第八届全国大学生嵌入式芯片与系统设计竞赛 · FPGA 创新设计赛道 决赛 二等奖',
      en: '8th National Embedded Chip & System Design Contest — FPGA Track Finals, Second Prize',
    },
    issuer: { zh: '中国电子教育学会', en: 'China Electronics Education Society' },
    work: { zh: '声源慧眼 AcousticEye', en: 'AcousticEye — acoustic source localisation' },
  },
  {
    slug: 'mcm-icm-2026-participant',
    year: '2026',
    level: 'international',
    title: {
      zh: '美国大学生数学建模竞赛（MCM/ICM）成功参赛奖',
      en: 'Mathematical Contest in Modeling (MCM/ICM) — Successful Participant',
    },
    issuer: { zh: 'COMAP', en: 'COMAP' },
    landscape: true,
  },
  {
    slug: 'optoelectronics-sw-2026-first',
    year: '2026',
    level: 'provincial',
    title: {
      zh: '第十四届全国大学生光电设计竞赛（西南区赛）一等奖',
      en: '14th National Optoelectronic Design Contest — Southwest Region, First Prize',
    },
    issuer: { zh: '西南赛区组织委员会', en: 'Southwest Region Organising Committee' },
  },
  {
    slug: 'honghu-admission-2025',
    year: '2025',
    level: 'program',
    title: {
      zh: '科研育人新工程教育改革专项「鸿鹄拔尖人才计划」录取',
      en: 'Admitted to the Honghu Top Talent Programme (research-oriented engineering reform)',
    },
    issuer: { zh: '电子科技大学 信息与通信工程学院', en: 'UESTC · School of Information and Communication Engineering' },
  },
  {
    slug: 'soc-uestc-2026-second',
    year: '2026',
    level: 'school',
    title: {
      zh: '「中腾」杯电子科技大学嵌入式芯片与系统设计竞赛 二等奖',
      en: 'UESTC "Zhongteng Cup" Embedded Chip & System Design Contest — Second Prize',
    },
    issuer: { zh: '电子科技大学', en: 'UESTC' },
    work: {
      zh: '械随影动 —— 意法半导体赛题',
      en: 'Motion Follows Shadow — STMicroelectronics track',
    },
  },
  {
    slug: 'yingcai-cup-2024-second',
    year: '2024',
    level: 'school',
    title: {
      zh: '第一届电子科技大学「英才杯」电子设计竞赛 二等奖',
      en: '1st UESTC Yingcai Cup Electronic Design Contest — Second Prize',
    },
    issuer: { zh: '英才实验学院', en: 'Yingcai Honours College' },
  },
  {
    slug: 'mcm-simulation-2025-second',
    year: '2024',
    level: 'school',
    title: {
      zh: '2025 年美国数模赛电子科技大学模拟赛 二等奖',
      en: 'UESTC MCM Simulation Contest 2025 — Second Prize',
    },
    issuer: { zh: '电子科技大学 教务处 / 数学科学学院', en: 'UESTC Academic Affairs Office & School of Mathematical Sciences' },
  },
  {
    slug: 'recitation-2024-second',
    year: '2024',
    level: 'school',
    title: {
      zh: '「正青春·向未来」第四届校园艺术节朗诵比赛 二等奖',
      en: '4th Campus Arts Festival Recitation Contest — Second Prize',
    },
    issuer: { zh: '大学生文化素质教育中心', en: 'UESTC Cultural Education Centre' },
  },
];

/** 按级别权重 → 年份倒序排好 */
export const sortedCertificates = [...certificates].sort((a, b) => {
  const byLevel = LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level];
  if (byLevel !== 0) return byLevel;
  return b.year.localeCompare(a.year);
});

export const certificateImage = (slug: string) => `/media/certificates/${slug}.jpg`;
