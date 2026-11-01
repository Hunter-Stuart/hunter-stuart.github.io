/**
 * 六章轨道与运载器运动。
 *
 * 三种运动模式：
 *   static —— 停在轨道上不动（第 1 屏待发），页面加载时从地面升到悬停点
 *   climb  —— 沿上升轨道单向滑行（穿云），首尾淡入淡出
 *   orbit  —— 真正绕中心做椭圆环绕（入轨后），360° 连续循环
 *
 * 环绕不做关键帧插值：用嵌套变换实现 ——
 *   平移(中心) → 压扁(ry/rx) → 旋转(0→360°) → 平移(rx,0) → 反向压扁 → 反向旋转
 * 卫星因此始终贴着椭圆轨迹，姿态保持朝上，也不会在关键帧之间"抖"。
 *
 * 构图约定（viewBox 1440×900）：文字列在左侧 0–780，
 * 轨道空域落在 x 690–1360、y 80–700，即视觉中心偏上偏右。
 */

type Pt = [number, number];

export interface Curve {
  p0: Pt;
  p1: Pt;
  p2: Pt;
  p3: Pt;
}

export type MotionMode = 'static' | 'climb' | 'orbit' | 'arc';

export interface OrbitSpec {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tilt: number;
  period: number;
  /** 初始相位（0–1） */
  phase: number;
}

export interface ArcSpec {
  /** 椭圆中心（例如画面下方那颗地球的圆心） */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** 轨面倾角（度） */
  tilt: number;
  /** 起止角度（度）。SVG 里 270° 是正上方，230°→310° 正好横穿画面上三分之一 */
  from: number;
  to: number;
  /** 划过一次的时长 */
  period: number;
}

export interface ClimbSpec {
  curve: Curve;
  from: number;
  to: number;
  period: number;
}

export interface TrackDef {
  mode: MotionMode;
  /** static / climb 的上升轨道 */
  curve?: Curve;
  dock?: number;
  /** 显式停靠点（优先于 dock 参数） */
  dockPoint?: Pt;
  climb?: ClimbSpec;
  orbit?: OrbitSpec;
  arc?: ArcSpec;
  scale: number;
}

const cubicAt = (curve: Curve, t: number): Pt => {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * curve.p0[0] + b * curve.p1[0] + c * curve.p2[0] + d * curve.p3[0],
    a * curve.p0[1] + b * curve.p1[1] + c * curve.p2[1] + d * curve.p3[1],
  ];
};

const cubicTangent = (curve: Curve, t: number): number => {
  const mt = 1 - t;
  const dx =
    3 * mt * mt * (curve.p1[0] - curve.p0[0]) +
    6 * mt * t * (curve.p2[0] - curve.p1[0]) +
    3 * t * t * (curve.p3[0] - curve.p2[0]);
  const dy =
    3 * mt * mt * (curve.p1[1] - curve.p0[1]) +
    6 * mt * t * (curve.p2[1] - curve.p1[1]) +
    3 * t * t * (curve.p3[1] - curve.p2[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export const sampleAt = (curve: Curve, t: number, tiltScale = 1) => {
  const [x, y] = cubicAt(curve, t);
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    rot: Math.round((cubicTangent(curve, t) + 90) * tiltScale),
  };
};

export const pathOf = (curve: Curve) =>
  `M${curve.p0[0]} ${curve.p0[1]}C${curve.p1[0]} ${curve.p1[1]} ${curve.p2[0]} ${curve.p2[1]} ${curve.p3[0]} ${curve.p3[1]}`;

/* ---------- 六章定义 ---------- */

export const tracks: Record<string, TrackDef> = {
  // 0 km 发射台：垂直待发；页面打开时从地面点火升到悬停点
  'launch-pad': {
    mode: 'static',
    // 只用来画那条垂直虚线；火箭本身停在 dockPoint
    curve: { p0: [820, 720], p1: [820, 600], p2: [820, 460], p3: [820, 300] },
    // 底部与地平线（y=744）齐平：中心 = 744 - 尾部偏移(200 × 0.36)
    dockPoint: [820, 672],
    scale: 0.36,
  },
  // 12 km 对流层：助推器还在，沿上升轨道单向划过
  troposphere: {
    mode: 'climb',
    curve: { p0: [780, 810], p1: [820, 660], p2: [880, 520], p3: [980, 400] },
    dock: 0.4,
    climb: {
      curve: { p0: [780, 810], p1: [820, 660], p2: [880, 520], p3: [980, 400] },
      from: 0.18,
      to: 0.78,
      period: 13,
    },
    scale: 0.28,
  },
  // 100 km 卡门线：沿画面下方那颗地球（圆心 720,1640）的轨道弧，从左侧划到右侧
  'karman-line': {
    mode: 'arc',
    arc: { cx: 720, cy: 1640, rx: 1220, ry: 1060, tilt: 12, from: 230, to: 310, period: 26 },
    scale: 0.2,
  },
  // 400 km 近地轨道：同一颗地球（圆心 720,1620），轨道更高
  'low-earth-orbit': {
    mode: 'arc',
    arc: { cx: 720, cy: 1620, rx: 1300, ry: 1130, tilt: 14, from: 232, to: 308, period: 22 },
    scale: 0.17,
  },
  // 35,786 km 同步轨道：正圆同步环，与场景里画的那条环完全重合
  geostationary: {
    mode: 'orbit',
    orbit: { cx: 1010, cy: 520, rx: 430, ry: 430, tilt: 0, period: 26, phase: 0.82 },
    scale: 0.13,
  },
  // 384,400 km 深空：绕月球
  'deep-space': {
    mode: 'orbit',
    orbit: { cx: 1150, cy: 560, rx: 268, ry: 232, tilt: -8, period: 28, phase: 0.75 },
    scale: 0.12,
  },
};

/** 停靠点（static / climb 用） */
export const dockOf = (def: TrackDef) => {
  if (def.dockPoint) {
    return { x: def.dockPoint[0], y: def.dockPoint[1], rot: 0 };
  }
  if (!def.curve) return { x: 0, y: 0, rot: 0 };
  return sampleAt(def.curve, def.dock ?? 0.5);
};

/** 第 1 屏：页面打开时火箭从地面这个点起飞 */
export const launchStartOf = (def: TrackDef) => {
  if (!def.curve) return { x: 0, y: 0 };
  const [x, y] = cubicAt(def.curve, 0);
  return { x: Math.round(x), y: Math.round(y) };
};

/** static / climb 的内联变量 */
export function dockVars(def: TrackDef) {
  const dock = dockOf(def);
  const start = launchStartOf(def);
  return [
    `--launch-x:${start.x}px`,
    `--launch-y:${start.y}px`,
    `--dock-x:${dock.x}px`,
    `--dock-y:${dock.y}px`,
    `--dock-rot:${dock.rot}deg`,
    `--scale:${def.scale}`,
  ].join(';');
}

/** 环绕 rig 的内联变量 */
export function orbitVars(spec: OrbitSpec, scale: number) {
  const squash = spec.ry / spec.rx;
  return [
    `--orbit-cx:${spec.cx}px`,
    `--orbit-cy:${spec.cy}px`,
    `--orbit-rx:${spec.rx}px`,
    `--orbit-ry:${spec.ry}px`,
    `--orbit-tilt:${spec.tilt}deg`,
    `--orbit-period:${spec.period}s`,
    `--orbit-phase:${spec.phase}`,
    `--orbit-squash:${squash.toFixed(4)}`,
    `--orbit-unsquash:${(1 / squash).toFixed(4)}`,
    `--scale:${scale}`,
  ].join(';');
}

/** climb 关键帧：沿曲线单向划过，起终点淡入淡出 */
const CLIMB_STEPS = 9;

function climbKeyframes(id: string, spec: ClimbSpec, scale: number): string {
  const frames: string[] = [];
  for (let i = 0; i < CLIMB_STEPS; i += 1) {
    const progress = i / (CLIMB_STEPS - 1);
    const t = spec.from + (spec.to - spec.from) * progress;
    const sample = sampleAt(spec.curve, t);
    const percent = Math.round(progress * 100);
    // 位移除以 scale，因为外层已经缩放过
    const x = (sample.x / scale).toFixed(1);
    const y = (sample.y / scale).toFixed(1);
    const opacity =
      progress < 0.12 ? progress / 0.12 : progress > 0.88 ? (1 - progress) / 0.12 : 1;
    frames.push(
      `  ${percent}% { transform: translate(${x}px, ${y}px) rotate(${sample.rot}deg); opacity: ${opacity.toFixed(2)}; }`,
    );
  }
  return `@keyframes climb-${id} {\n${frames.join('\n')}\n}`;
}

export const climbStyles = Object.entries(tracks)
  .filter(([, def]) => def.mode === 'climb' && def.climb)
  .map(([id, def]) => climbKeyframes(id, def.climb as ClimbSpec, def.scale))
  .join('\n\n');

/* ---------- arc：沿椭圆轨道的一段弧从左划到右 ---------- */

/** 椭圆轨道上某角度的点（已应用轨面倾斜） */
const arcPoint = (spec: ArcSpec, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = spec.rx * Math.cos(rad);
  const dy = spec.ry * Math.sin(rad);
  const tilt = (spec.tilt * Math.PI) / 180;
  return {
    x: spec.cx + dx * Math.cos(tilt) - dy * Math.sin(tilt),
    y: spec.cy + dx * Math.sin(tilt) + dy * Math.cos(tilt),
  };
};

const ARC_STEPS = 15;

function arcKeyframes(id: string, spec: ArcSpec, scale: number): string {
  const frames: string[] = [];
  for (let i = 0; i < ARC_STEPS; i += 1) {
    const progress = i / (ARC_STEPS - 1);
    const angle = spec.from + (spec.to - spec.from) * progress;
    const point = arcPoint(spec, angle);
    const ahead = arcPoint(spec, angle + 2);
    // 切向倾角打个对折，卫星不至于横躺
    const rot = Math.round(
      ((Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI + 90) * 0.5,
    );
    const x = (point.x / scale).toFixed(1);
    const y = (point.y / scale).toFixed(1);
    // 首尾淡入淡出：划到右边后回到左侧重新开始，不会硬跳
    const opacity =
      progress < 0.08 ? progress / 0.08 : progress > 0.92 ? (1 - progress) / 0.08 : 1;
    frames.push(
      `  ${Math.round(progress * 100)}% { transform: translate(${x}px, ${y}px) rotate(${rot}deg); opacity: ${opacity.toFixed(2)}; }`,
    );
  }
  return `@keyframes arc-${id} {\n${frames.join('\n')}\n}`;
}

/** climb + arc 的全部关键帧，注入页面内联 <style> */
export const motionStyles = [
  ...Object.entries(tracks)
    .filter(([, def]) => def.mode === 'climb' && def.climb)
    .map(([id, def]) => climbKeyframes(id, def.climb as ClimbSpec, def.scale)),
  ...Object.entries(tracks)
    .filter(([, def]) => def.mode === 'arc' && def.arc)
    .map(([id, def]) => arcKeyframes(id, def.arc as ArcSpec, def.scale)),
].join('\n\n');