import type { Locale } from './config';

/** 工具列表页 */
export interface ToolsIndexCopy {
  overline: string;
  title: string;
  intro: string;
  open: string;
  items: Array<{ slug: string; name: string; desc: string; tag: string }>;
}

export const toolsIndexCopy: Record<Locale, ToolsIndexCopy> = {
  zh: {
    overline: 'INSTRUMENTS / THREE',
    title: '工具',
    intro: '几个自己也会用的小工具，全部在浏览器里跑，不上传任何数据。',
    open: '打开',
    items: [
      {
        slug: 'pomodoro',
        name: '番茄钟',
        desc: '专注 / 短休 / 长休循环，进度存在本地，关掉页面也不丢。',
        tag: 'TIME',
      },
      {
        slug: 'smith-chart',
        name: '史密斯圆图',
        desc: '阻抗、导纳、反射系数互相换算，可拖动读数。',
        tag: 'RF',
      },
      {
        slug: 'filter-design',
        name: 'IIR / FIR 滤波器设计',
        desc: '窗函数法与双线性变换，实时看幅频、相频和零极点。',
        tag: 'DSP',
      },
    ],
  },
  en: {
    overline: 'INSTRUMENTS / THREE',
    title: 'Tools',
    intro: 'Small instruments I use myself. Everything runs in the browser; nothing is uploaded.',
    open: 'Open',
    items: [
      {
        slug: 'pomodoro',
        name: 'Pomodoro',
        desc: 'Focus / short break / long break cycles, saved locally so a refresh changes nothing.',
        tag: 'TIME',
      },
      {
        slug: 'smith-chart',
        name: 'Smith chart',
        desc: 'Convert between impedance, admittance and reflection coefficient by dragging.',
        tag: 'RF',
      },
      {
        slug: 'filter-design',
        name: 'IIR / FIR filter design',
        desc: 'Window method and bilinear transform, with live magnitude, phase and pole-zero plots.',
        tag: 'DSP',
      },
    ],
  },
};

/** 番茄钟 */
export interface PomodoroCopy {
  title: string;
  intro: string;
  modes: { focus: string; short: string; long: string };
  actions: { start: string; pause: string; resume: string; reset: string; skip: string };
  settings: string;
  focusMinutes: string;
  shortMinutes: string;
  longMinutes: string;
  longEvery: string;
  round: string;
  roundsDone: string;
  hint: string;
}

export const pomodoroCopy: Record<Locale, PomodoroCopy> = {
  zh: {
    title: '番茄钟',
    intro: '一轮专注结束会自动切到休息，走完设定的轮数后进入长休息。',
    modes: { focus: '专注', short: '短休息', long: '长休息' },
    actions: { start: '开始', pause: '暂停', resume: '继续', reset: '重置', skip: '跳过' },
    settings: '设置',
    focusMinutes: '专注',
    shortMinutes: '短休',
    longMinutes: '长休',
    longEvery: '每几轮长休',
    round: '第',
    roundsDone: '已完成',
    hint: '关掉页面后进度会保留；计时器暂停在标签页隐藏时继续按真实时间走。',
  },
  en: {
    title: 'Pomodoro',
    intro: 'A finished focus block switches to a break automatically; after N rounds you get a long break.',
    modes: { focus: 'Focus', short: 'Short break', long: 'Long break' },
    actions: { start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', skip: 'Skip' },
    settings: 'Settings',
    focusMinutes: 'Focus',
    shortMinutes: 'Short',
    longMinutes: 'Long',
    longEvery: 'Long break every',
    round: 'Round',
    roundsDone: 'Completed',
    hint: 'Progress is kept across reloads; the timer keeps real time even when the tab is hidden.',
  },
};

/** 史密斯圆图 */
export interface SmithCopy {
  title: string;
  intro: string;
  impedance: string;
  admittance: string;
  reflection: string;
  vswr: string;
  resistance: string;
  reactance: string;
  hint: string;
  short: string;
  open: string;
  legend: string;
}

export const smithCopy: Record<Locale, SmithCopy> = {
  zh: {
    title: '史密斯圆图',
    intro: '拖动圆点或输入数值，实时看阻抗、导纳与反射系数的对应关系。',
    impedance: '阻抗 Z',
    admittance: '导纳 Y',
    reflection: '反射系数 Γ',
    vswr: '驻波比 VSWR',
    resistance: '电阻 R',
    reactance: '电抗 X',
    hint: '归一化到 50 Ω。拖动圆点，或在右侧输入精确数值。',
    short: '短路',
    open: '开路',
    legend: '实线圆：等电阻 R · 细弧：等电抗 ±jX · 圆心为完全匹配点',
  },
  en: {
    title: 'Smith chart',
    intro: 'Drag the point or type numbers to see impedance, admittance and reflection coefficient together.',
    impedance: 'Impedance Z',
    admittance: 'Admittance Y',
    reflection: 'Reflection Γ',
    vswr: 'VSWR',
    resistance: 'Resistance R',
    reactance: 'Reactance X',
    hint: 'Normalised to 50 Ω. Drag the dot, or type exact values on the right.',
    short: 'Short',
    open: 'Open',
    legend: 'Circles: constant R · Arcs: constant ±jX · The centre is a perfect match',
  },
};

/** 滤波器设计 */
export interface FilterCopy {
  title: string;
  intro: string;
  kind: string;
  kinds: { lowpass: string; highpass: string; bandpass: string };
  design: string;
  designs: { butterworth: string; chebyshev: string; fir: string };
  order: string;
  cutoff: string;
  ripple: string;
  window: string;
  windows: { hamming: string; hann: string; blackman: string };
  magnitude: string;
  phase: string;
  poles: string;
  coeffs: string;
  hint: string;
  unstable: string;
}

export const filterCopy: Record<Locale, FilterCopy> = {
  zh: {
    title: 'IIR / FIR 滤波器设计',
    intro: '选类型、阶数和截止频率，下面实时给出频响与零极点。',
    kind: '响应类型',
    kinds: { lowpass: '低通', highpass: '高通', bandpass: '带通' },
    design: '设计方法',
    designs: { butterworth: '巴特沃斯 (IIR)', chebyshev: "切比雪夫 I 型 (IIR)", fir: '窗函数法 (FIR)' },
    order: '阶数',
    cutoff: '截止频率',
    ripple: '通带纹波',
    window: '窗函数',
    windows: { hamming: 'Hamming', hann: 'Hann', blackman: 'Blackman' },
    magnitude: '幅频响应',
    phase: '相频响应',
    poles: '零极点',
    coeffs: '系数',
    hint: '归一化频率以奈奎斯特频率为 1。FIR 采用线性相位设计。',
    unstable: '该配置不稳定（极点跑到单位圆外），请降低阶数或提高截止频率。',
  },
  en: {
    title: 'IIR / FIR filter design',
    intro: 'Pick a type, order and cutoff; the response and pole-zero map update live.',
    kind: 'Response',
    kinds: { lowpass: 'Low-pass', highpass: 'High-pass', bandpass: 'Band-pass' },
    design: 'Method',
    designs: {
      butterworth: 'Butterworth (IIR)',
      chebyshev: 'Chebyshev I (IIR)',
      fir: 'Window method (FIR)',
    },
    order: 'Order',
    cutoff: 'Cutoff',
    ripple: 'Passband ripple',
    window: 'Window',
    windows: { hamming: 'Hamming', hann: 'Hann', blackman: 'Blackman' },
    magnitude: 'Magnitude',
    phase: 'Phase',
    poles: 'Pole–zero',
    coeffs: 'Coefficients',
    hint: 'Normalised frequency, Nyquist = 1. The FIR branch is linear phase.',
    unstable: 'This configuration is unstable (poles outside the unit circle). Lower the order or raise the cutoff.',
  },
};
