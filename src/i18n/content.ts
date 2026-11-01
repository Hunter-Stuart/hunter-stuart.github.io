import type { Locale } from './config';

/** 站点身份：中英各一份。 */
export interface SiteIdentity {
  /** 英文名，用作主视觉标题 */
  name: string;
  /** 中文名 */
  localName: string;
  kicker: string;
  title: string;
  description: string;
  intro: string;
  motto: string;
  email: string;
  /** 备用与校内邮箱 */
  altEmails: Array<{ label: string; address: string }>;
  location: string;
}

export const identity: Record<Locale, SiteIdentity> = {
  zh: {
    name: 'Hunter Stuart',
    localName: '郝瀚宇',
    kicker: '六段轨道，一本日志',
    title: '郝瀚宇 — 一个人的发射日志',
    description: '技术、项目与生活，按离地高度编排的六段轨道。',
    intro:
      '我是郝瀚宇，也叫 Hunter Stuart。这里记录工程笔记、做过的项目，以及那些在深夜想到、白天又忘记的问题。',
    motto: '斗光破冥，无色掩炽。',
    email: 'hunter_stuart@outlook.com',
    altEmails: [
      { label: '校内', address: '2024010913011@std.uestc.edu.cn' },
      { label: '备用', address: '3511139523@qq.com' },
    ],
    location: '成都 / 中国',
  },
  en: {
    name: 'Hunter Stuart',
    localName: '郝瀚宇',
    kicker: 'SIX ORBITS, ONE LOG',
    title: 'Hunter Stuart — A Personal Flight Log',
    description:
      'Notes on engineering, projects and everyday life, arranged by altitude above the ground.',
    intro:
      'I am Hunter Stuart — 郝瀚宇 in Chinese. This is where I keep engineering notes, the projects I finished, and the questions that arrive at midnight and vanish by morning.',
    motto: 'Break the dark; no form can smother the flame.',
    email: 'hunter_stuart@outlook.com',
    altEmails: [
      { label: 'Campus', address: '2024010913011@std.uestc.edu.cn' },
      { label: 'Alt', address: '3511139523@qq.com' },
    ],
    location: 'CHENGDU / CHINA',
  },
};

/** 每章随语言变化的文案。章节的 id、高度、颜色与语言无关，保留在 data/orbit.ts。 */
export interface ChapterCopy {
  name: string;
  codename: string;
  tagline: string;
  heading: string;
  description: string;
  foot: string;
}

export interface HomeCopy {
  featured: string;
  featuredTag: string;
  linksTitle: string;
  linksTag: string;
  galleryTitle: string;
  galleryTag: string;
  contactTitle: string;
  directionTitle: string;
  directionTags: string[];
  contactTag: string;
  quote: string;
  contactNote: string;
  chapters: Record<string, ChapterCopy>;
}

export const homeCopy: Record<Locale, HomeCopy> = {
  zh: {
    featured: '精选日志',
    featuredTag: 'SELECTED',
    linksTitle: '常去的坐标',
    linksTag: 'LINKS',
    galleryTitle: '随手拍',
    galleryTag: 'GALLERY',
    contactTitle: '发信',
    contactTag: 'CONTACT',
    quote: '生活不是轨道之外的补偿，它本身就是一段需要定期修正的轨道。',
    contactNote: '指正、建议，或只是打个招呼，都可以写信。',
    chapters: {
      'launch-pad': {
        name: '发射台',
        codename: 'LAUNCH PAD',
        tagline: 'T-0，一切从这里离地。',
        heading: 'HUNTER STUART',
        description: '',
        foot: '',
      },
      troposphere: {
        name: '对流层',
        codename: 'TROPOSPHERE',
        tagline: '穿云，最大动压点。',
        heading: '技术栈',
        description:
          '穿云这一段最耗推进剂：把会用的工具、写过的语言、踩过的坑，一层层压进舱体里。',
        foot: '最大动压点已过，姿态稳定。',
      },
      'karman-line': {
        name: '卡门线',
        codename: 'KÁRMÁN LINE',
        tagline: '天空结束的地方，宇宙开始。',
        heading: '项目',
        description: '一百公里之上，天空结束、宇宙开始。这里放那些真的做完过、或者还在做的东西。',
        foot: '已越过卡门线，进入正式轨道注入段。',
      },
      'low-earth-orbit': {
        name: '近地轨道',
        codename: 'LOW EARTH ORBIT',
        tagline: '入轨，第一次看到完整的地平线。',
        heading: '日志与笔记',
        description: '入轨之后工作才真正开始：工程记录、读书笔记、以及那些没写完的想法。',
        foot: '已建立稳定轨道，开始按周期回传数据。',
      },
      geostationary: {
        name: '地球同步轨道',
        codename: 'GEOSTATIONARY',
        tagline: '一格一格地，绕着地球生活。',
        heading: '日常',
        description:
          '同步轨道的好处是位置固定：每天在同一个点醒来，也在同一个点看见地球转过半圈。',
        foot: '轨道高度 35,786 km，周期 23 小时 56 分。',
      },
      'deep-space': {
        name: '月球以远',
        codename: 'DEEP SPACE',
        tagline: '再往上，就是没有回头路的方向。',
        heading: '关于与联系',
        description:
          '再往外走，就没有地面站的实时覆盖了。所以这一屏留给几个固定的坐标：我在哪、怎么找到我。',
        foot: '',
      },
    },
  },
  en: {
    featured: 'Selected notes',
    featuredTag: 'SELECTED',
    linksTitle: 'Fixed coordinates',
    linksTag: 'LINKS',
    galleryTitle: 'Snapshots',
    galleryTag: 'GALLERY',
    contactTitle: 'Transmit',
    contactTag: 'CONTACT',
    quote:
      'Life is not the compensation for the orbit. It is an orbit of its own that needs regular correction.',
    contactNote: 'Corrections, suggestions, or just hello — email works.',
    chapters: {
      'launch-pad': {
        name: 'Launch pad',
        codename: 'LAUNCH PAD',
        tagline: 'T-0. Everything leaves the ground here.',
        heading: 'HUNTER STUART',
        description: '',
        foot: '',
      },
      troposphere: {
        name: 'Troposphere',
        codename: 'TROPOSPHERE',
        tagline: 'Through the clouds, past max Q.',
        heading: 'Tech stack',
        description:
          'This is the stage that burns the most propellant: languages, tools and lessons learned, packed into the hull one layer at a time.',
        foot: 'Max Q behind us. Attitude is stable.',
      },
      'karman-line': {
        name: 'Kármán line',
        codename: 'KÁRMÁN LINE',
        tagline: 'Where the sky ends and space begins.',
        heading: 'Projects',
        description:
          'A hundred kilometres up, the sky stops. This section holds the things I actually finished — and the ones still in progress.',
        foot: 'Kármán line crossed. Beginning orbit insertion.',
      },
      'low-earth-orbit': {
        name: 'Low Earth orbit',
        codename: 'LOW EARTH ORBIT',
        tagline: 'In orbit, the horizon finally curves.',
        heading: 'Flight log',
        description:
          'The work starts after insertion: engineering notes, reading notes, and thoughts I have not finished yet.',
        foot: 'Stable orbit established. Telemetry on a regular cadence.',
      },
      geostationary: {
        name: 'Geostationary orbit',
        codename: 'GEOSTATIONARY',
        tagline: 'Living around the planet, one grid at a time.',
        heading: 'Everyday life',
        description:
          'The advantage of this orbit is that it never moves: you wake at the same point and watch the planet turn half a revolution from the same seat.',
        foot: 'Altitude 35,786 km. Period 23 h 56 min.',
      },
      'deep-space': {
        name: 'Beyond the Moon',
        codename: 'DEEP SPACE',
        tagline: 'Past this point, there is no return trajectory.',
        heading: 'About & contact',
        description:
          'Further out there is no real-time ground station coverage. So this screen is reserved for fixed coordinates: where I am, and how to reach me.',
        foot: '',
      },
    },
  },
};

/** 欢迎页（两个入口）。 */
export interface WelcomeCopy {
  greeting: string;
  welcome: string;
  overline: string;
  title: string;
  intro: string[];
  divider: string;
  resumeTitle: string;
  resumeLines: string[];
  resumeCta: string;
  resumeId: string;
  blogTitle: string;
  blogLines: string[];
  blogCta: string;
  blogId: string;
  hint: string;
  footerLeft: string;
  footerLeftSub: string;
  footerRight: string;
  footerRightSub: string;
}

export const welcomeCopy: Record<Locale, WelcomeCopy> = {
  zh: {
    greeting: '你好，我是',
    welcome: '此处记录',
    overline: 'EVERYTHING INDEXED BY ALTITUDE',
    title: '从地面到深空|一路写成六章',
    intro: ['六节点记录：技术、项目与日常，按离地高度逐级排列。', '左边是我这个人，右边是我写下的东西。'],
    divider: '先选一个方向',
    resumeTitle: '这个人',
    resumeLines: ['专业、经历，以及正在做的事。', '尽量具体，不加修饰。'],
    resumeCta: 'BORN ON THE GROUND',
    resumeId: '01 / THE PERSON',
    blogTitle: '记录',
    blogLines: ['工程笔记、项目复盘，以及一些还没有结论的思考。', '按时间倒序，也可以按高度读。'],
    blogCta: 'WRITTEN ON THE WAY',
    blogId: '02 / THE RECORD',
    hint: '六章，一次上升。',
    footerLeft: '起点 / 0 公里',
    footerLeftSub: '所有记录都从此处发出。',
    footerRight: 'NO DRAFT IS EVER WRONG',
    footerRightSub: 'HUNTER STUART · 0—384,400 KM',
  },
  en: {
    greeting: 'Hello, I am',
    welcome: 'field notes',
    overline: 'EVERYTHING INDEXED BY ALTITUDE',
    title: 'From the ground to deep space|written as six chapters',
    intro: [
      'Six stations, indexed by altitude — engineering, projects and ordinary days.',
      'The person on the left, the record on the right.',
    ],
    divider: 'Pick an altitude',
    resumeTitle: 'The Person',
    resumeLines: ['What I study, what I have built, what I am working on.', 'Specifics over adjectives.'],
    resumeCta: 'BORN ON THE GROUND',
    resumeId: '01 / THE PERSON',
    blogTitle: 'The Record',
    blogLines: ['Engineering notes, project write-ups, and thoughts without conclusions.', 'Newest first — or by altitude.'],
    blogCta: 'WRITTEN ON THE WAY',
    blogId: '02 / THE RECORD',
    hint: 'Six chapters, one ascent.',
    footerLeft: 'BASE / 0 KM',
    footerLeftSub: 'Every entry departs from here.',
    footerRight: 'NO DRAFT IS EVER WRONG',
    footerRightSub: 'HUNTER STUART · 0—384,400 KM',
  },
};

/** 个人简历页。 */
export interface ProfileCopy {
  overline: string;
  title: string;
  role: string;
  summary: string;
  /** 左栏"身份"小标题 */
  identityTitle: string;
  /** 身份 / 头衔标签 */
  titles: string[];
  sections: Array<{
    title: string;
    items: Array<{ period: string; title: string; detail: string }>;
  }>;
  galleryTitle: string;
  galleryTag: string;
  contactTitle: string;
  directionTitle: string;
  directionTags: string[];
  contactNote: string;
  backToBlog: string;
}

export const profileCopy: Record<Locale, ProfileCopy> = {
  zh: {
    overline: 'PERSONNEL FILE / 01',
    title: '郝瀚宇',
    role: 'Hunter Stuart · 通信工程 / 硬件、算法、系统',
    summary:
      '电子科技大学通信工程本科在读。做过后端、嵌入式前端与阵列信号处理三类项目，习惯先把复杂系统拆成模块，再把链路一段段接起来。',
    identityTitle: '身份',
    titles: [
      '中共预备党员',
      '电子科技大学 · 本科在读',
      '信通学院科研育人计划（鸿鹄）· 天地一体化',
      '英才科协骨干成员',
    ],
    directionTags: ['硬件', '算法', '系统'],
    sections: [
      {
        title: '教育',
        items: [
          {
            period: '2024.09 — 至今',
            title: '电子科技大学 · 通信工程（本科）',
            detail:
              '主修：信号与系统、数字信号处理、数字逻辑与处理器系统设计、电路分析与电子线路、电磁场与波、数据结构、软件设计思想与方法、天地一体化通信系统（鸿鹄科研育人项目）。',
          },
        ],
      },
      {
        title: '项目',
        items: [
          {
            period: '2026.04 — 2026.08',
            title: '履带式六轴机械臂环境感知系统 · 嵌赛应用赛道全国一等奖',
            detail:
              '履带底盘 + 六轴机械臂 + VR 遥操作 + AI 安全评估的整机系统。负责环境感知扩展板：以 ESP32-S3 挂载 MQ-7 / MQ-4 / AO-03 三路气体、SPS30 颗粒物与 AHT20+BMP280 温湿压，做分压与 ADC 标定后打包 22 字节定长帧，经 IIC 从机（0x31）与 WiFi UDP 双路分发；机械臂侧在 STM32H743 上跑运动学逆解与 CAN 多节点电机调度；VR 端融合环境、机体、关节三路数据流，调用大模型给出安全等级并渲染到 HUD。',
          },
          {
            period: '2025.09 — 2026.01',
            title: '卫星通信仿真软件 · 独立开发',
            detail:
              'Python + PyQt 桌面端，打通数据解析、轨道推演与三维可视化；独立实现经典轨道六根数传播算法，计算卫星三维空间位置，支持任意时刻参数推演与时间拖拽回放；输出星下点轨迹投影、可见性分析与运行数据文件。',
          },
          {
            period: '2025.11 — 2025.12',
            title: '双通道 sEMG 肌电信号控制系统 · 架构设计',
            detail:
              '主导表面肌电采集前端：微弱信号放大、带通滤波与工频陷波；STM32 固件实现双路同步采样与实时传输；上位机完成数字滤波、FFT 与功率谱分析；独立开发 Web 可视化界面，把控制逻辑接进游戏，打通「生物信号—控制—人机交互」闭环。',
          },
          {
            period: '2025.10 — 2025.12',
            title: 'MVDR 声源定位与定向拾音 · 嵌赛 FPGA 全国二等奖',
            detail:
              '把 MVDR 空间滤波工程化（导向矢量、协方差矩阵、权值更新），引入动态更新以适应复杂声学环境；完成阵列与核心板 PCB 设计与打版；多通道 PDM 音频时序对齐与数字抗混叠滤波，保证采集相位一致；实现半平面半径 10 m 拾音与 10° 分辨率定位。',
          },
        ],
      },
      {
        title: '技能',
        items: [
          {
            period: 'Python',
            title: '数据处理 / 桌面应用',
            detail:
              '卫星仿真软件与 sEMG 上位机都以 Python 为主：PyQt 搭界面、NumPy 做数值计算、脚本处理批量数据。',
          },
          {
            period: 'C',
            title: 'STM32 固件',
            detail: '双通道 ADC + DMA 同步采样、串口与定时器外设驱动、实时上传，按键与中断处理。',
          },
          {
            period: 'Verilog',
            title: 'FPGA 逻辑设计',
            detail: '多通道 PDM 音频时序对齐、数字抗混叠滤波器实现，配合 Vivado 做时序约束与联调。',
          },
          {
            period: '模拟',
            title: '模拟前端电路',
            detail: '微弱信号放大、带通滤波、工频陷波的设计与调试；用示波器和信号源逐级排查。',
          },
          {
            period: 'PCB',
            title: '板级设计打版',
            detail: '阵列板与核心板的原理图、布局走线、打版与回板联调。',
          },
          {
            period: '算法',
            title: '阵列与轨道算法',
            detail: 'MVDR 波束形成（导向矢量、协方差估计、权值更新）、FFT 与功率谱分析、轨道六根数传播。',
          },
          {
            period: 'Web',
            title: '前端与可视化',
            detail: 'TypeScript / Astro / React，写数据可视化界面；本站从零手写，无 UI 框架。',
          },
          {
            period: '工具',
            title: '日常工具',
            detail: 'Git、Linux / Shell、Keil 与 STM32CubeMX、Vivado、PyQt、LaTeX。',
          },
        ],
      },
    ],
    contactTitle: '联系方式',
    contactNote: '指正、建议，或只是打个招呼，都可以写信。',
    backToBlog: '去看博客',
  },
  en: {
    overline: 'PERSONNEL FILE / 01',
    title: 'Hunter Stuart',
    role: 'Communication engineering / Hardware, algorithms, systems',
    summary:
      'Undergraduate in Communication Engineering at UESTC. I have built things across backend, embedded hardware and array signal processing, and I like taking a complex system apart into modules before wiring the whole chain back together.',
    identityTitle: 'Identity',
    titles: [
      'Probationary Member of the CPC',
      'Undergraduate, UESTC',
      'Honghu research programme · space-ground integration',
      'Core member, Yingcai Sci-Tech Association',
    ],
    directionTags: ['Hardware', 'Algorithms', 'Systems'],
    sections: [
      {
        title: 'Education',
        items: [
          {
            period: 'Sep 2024 — now',
            title: 'BSc · Communication Engineering, UESTC',
            detail:
              'Coursework: Signals and Systems, Digital Signal Processing, Digital Logic and Processor Systems, Circuit Analysis and Electronics, Electromagnetics and Waves, Data Structures, Software Design, Space-Ground Integrated Communication Systems (honours research track).',
          },
        ],
      },
      {
        title: 'Projects',
        items: [
          {
            period: 'Apr 2026 — Aug 2026',
            title: 'Tracked six-axis arm with environmental sensing · national 1st prize, application track',
            detail:
              'A whole-system build: tracked chassis, six-axis arm, VR teleoperation and an AI safety assessment. Owned the environmental sensing board — ESP32-S3 with MQ-7 / MQ-4 / AO-03 gas sensors, SPS30 particulates and AHT20+BMP280 temperature, humidity and pressure; calibrated the dividers and ADC inputs, packed a fixed 22-byte frame and published it over both I2C-slave (0x31) and WiFi UDP. On the arm side, inverse kinematics and multi-node CAN motor scheduling on STM32H743. The VR client fused environment, chassis and joint streams, asked a large model for a safety grade and rendered it into the HUD.',
          },
          {
            period: 'Sep 2025 — Jan 2026',
            title: 'Satellite communication simulator · solo developer',
            detail:
              'A Python + PyQt desktop tool covering data parsing, orbit propagation and 3D visualisation. Implemented classical six-orbital-element propagation from scratch, with arbitrary-epoch prediction and time-scrubbing replay; exported sub-satellite tracks, visibility windows and telemetry files.',
          },
          {
            period: 'Nov 2025 — Dec 2025',
            title: 'Dual-channel sEMG control system · architecture',
            detail:
              'Led the analog front end for surface EMG: weak-signal amplification, band-pass filtering and mains notch. STM32 firmware for synchronised dual-channel sampling and streaming; host-side digital filtering, FFT and power-spectrum analysis. Wrote the web UI that wired the control logic into a game, closing the biosignal-to-interface loop.',
          },
          {
            period: 'Oct 2025 — Dec 2025',
            title: 'MVDR localisation and directional pickup · FPGA, national 2nd prize',
            detail:
              'Engineered MVDR beamforming (steering vectors, covariance estimation, weight updates) with dynamic updates for changing acoustics. Designed and fabbed the array and core-board PCBs; aligned multi-channel PDM audio and designed anti-aliasing filters to keep phase coherence. Achieved 10 m pickup range and 10° bearing resolution.',
          },
        ],
      },
      {
        title: 'Skills',
        items: [
          {
            period: 'Python',
            title: 'Data handling & desktop apps',
            detail:
              'Python carries both the satellite simulator and the sEMG host tool: PyQt for the UI, NumPy for the maths, scripts for batch data.',
          },
          {
            period: 'C',
            title: 'STM32 firmware',
            detail:
              'Synchronised dual-channel ADC sampling over DMA, UART and timer peripheral drivers, real-time streaming, key and interrupt handling.',
          },
          {
            period: 'Verilog',
            title: 'FPGA logic',
            detail:
              'Multi-channel PDM audio alignment and digital anti-aliasing filters, with Vivado timing constraints and on-board bring-up.',
          },
          {
            period: 'Analog',
            title: 'Analog front ends',
            detail:
              'Design and debug of weak-signal amplification, band-pass filtering and mains notch; traced stage by stage with scope and signal generator.',
          },
          {
            period: 'PCB',
            title: 'Board design',
            detail: 'Schematics, layout and routing, fabrication and bring-up for array and core boards.',
          },
          {
            period: 'Algorithms',
            title: 'Array & orbit algorithms',
            detail:
              'MVDR beamforming (steering vectors, covariance estimation, weight updates), FFT and power spectra, six-element orbit propagation.',
          },
          {
            period: 'Web',
            title: 'Front end & visualisation',
            detail: 'TypeScript / Astro / React for data interfaces; this site is hand-written with no UI framework.',
          },
          {
            period: 'Tooling',
            title: 'Everyday tools',
            detail: 'Git, Linux / Shell, Keil and STM32CubeMX, Vivado, PyQt, LaTeX.',
          },
        ],
      },
    ],
    contactTitle: 'Contact',
    contactNote: 'Corrections, suggestions, or just hello — email works.',
    backToBlog: 'Read the blog',
  },
};