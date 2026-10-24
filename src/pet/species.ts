/** 一只鹦鹉的"长相参数"：颜色 + 几个几何开关，同一套画法画出不同品种 */
export interface Look {
  body: string;
  bodyLight: string;
  bodyMid: string;
  bodyDark: string;
  face: string;
  faceLight: string;
  faceDeep: string;
  crown: string;
  wing: string;
  wingDark: string;
  tail: string;
  tailDark: string;
  beak: string;
  beakLight: string;
  beakDark: string;
  beakEdge: string;
  feet: string;
  feetDark: string;
  iris: string;
  irisDull: string;
  /** 腮红圆点（玄凤的橙色是圆斑） */
  cheek?: string;
  /** 冠羽高度 0~1 */
  crest?: number;
  /** 尾巴长度倍数 */
  tailScale?: number;
  /** 喙大小倍数 */
  beakScale?: number;
  /** 头部横纹颜色（虎皮） */
  bars?: string;
  /** 画不画明显的脸块 */
  facePatch?: boolean;
}

export type SpeciesId = 'lovebird-lutino' | 'lovebird-green' | 'budgie-blue' | 'budgie-green' | 'cockatiel' | 'quaker' | 'sunconure';

export interface Traits {
  /** 怨气增长倍率 */
  grudge: number;
  /** 训练成功率加成 */
  train: number;
  /** 亲密度增长倍率 */
  bond: number;
  /** 清洁下降倍率 */
  dirt: number;
  /** 心情波动倍率 */
  moodSwing: number;
  /** 清晨叫的强度 0~1 */
  noise: number;
  /** 一句性格说明 */
  note: string;
}

export interface Species {
  id: SpeciesId;
  name: string;
  short: string;
  look: Look;
  traits: Traits;
}

export const SPECIES: Record<SpeciesId, Species> = {
  'lovebird-lutino': {
    id: 'lovebird-lutino',
    name: '黄桃牡丹鹦鹉',
    short: '黄桃',
    look: {
      body: '#F7CE5E',
      bodyLight: '#FDEBB4',
      bodyMid: '#EFBE49',
      bodyDark: '#D89B2E',
      face: '#F9A184',
      faceLight: '#FDBBA1',
      faceDeep: '#EE7A56',
      crown: '#E2674C',
      wing: '#EFBB43',
      wingDark: '#D89B2E',
      tail: '#F2C552',
      tailDark: '#DDA429',
      beak: '#EFDFC4',
      beakLight: '#FBF3E2',
      beakDark: '#C9AE86',
      beakEdge: '#A98F6B',
      feet: '#E3A99D',
      feetDark: '#C0877C',
      iris: '#8A3229',
      irisDull: '#6E3B33',
      facePatch: true,
    },
    traits: { grudge: 1.25, train: 0, bond: 1, dirt: 1, moodSwing: 1, noise: 0.8, note: '记仇快、咬人狠，但一旦认了你就只认你' },
  },
  'lovebird-green': {
    id: 'lovebird-green',
    name: '绿桃牡丹鹦鹉',
    short: '绿桃',
    look: {
      body: '#8CC152',
      bodyLight: '#C6E29B',
      bodyMid: '#7DB246',
      bodyDark: '#5E8C33',
      face: '#F79C7E',
      faceLight: '#FDC0A6',
      faceDeep: '#E9724F',
      crown: '#DD6A4B',
      wing: '#7FB248',
      wingDark: '#5E8C33',
      tail: '#79A945',
      tailDark: '#5A8231',
      beak: '#E9D8BE',
      beakLight: '#F8F0DD',
      beakDark: '#BFAA88',
      beakEdge: '#94795C',
      feet: '#A8A9A0',
      feetDark: '#84857D',
      iris: '#5B3A2E',
      irisDull: '#4A3A31',
      facePatch: true,
    },
    traits: { grudge: 1.15, train: 0, bond: 1, dirt: 1, moodSwing: 1, noise: 0.8, note: '原色牡丹，脾气比黄桃还冲一点' },
  },
  'budgie-blue': {
    id: 'budgie-blue',
    name: '蓝虎皮鹦鹉',
    short: '蓝虎皮',
    look: {
      body: '#7FB8E8',
      bodyLight: '#DDEEFB',
      bodyMid: '#6BA6DA',
      bodyDark: '#4C86BB',
      face: '#F4F7FA',
      faceLight: '#FFFFFF',
      faceDeep: '#C9DCEC',
      crown: '#F2F6FA',
      wing: '#5D9BD1',
      wingDark: '#3E7CAF',
      tail: '#4C86BB',
      tailDark: '#2F5F8C',
      beak: '#C8D3DC',
      beakLight: '#EDF2F6',
      beakDark: '#9FB0BE',
      beakEdge: '#7C8B99',
      feet: '#BCC3C9',
      feetDark: '#969FA7',
      iris: '#3B3540',
      irisDull: '#4A4652',
      bars: '#3A4356',
      cheek: '#6E7FA8',
      tailScale: 1.5,
      beakScale: 0.72,
      facePatch: false,
    },
    traits: { grudge: 0.85, train: 0.16, bond: 1.1, dirt: 1, moodSwing: 1.1, noise: 0.55, note: '最好教的一只，学东西快，也不怎么记仇' },
  },
  'budgie-green': {
    id: 'budgie-green',
    name: '绿虎皮鹦鹉',
    short: '绿虎皮',
    look: {
      body: '#A8D05B',
      bodyLight: '#E4F3B8',
      bodyMid: '#94BE4A',
      bodyDark: '#70962F',
      face: '#F6F8E8',
      faceLight: '#FDFFF4',
      faceDeep: '#CBD9A6',
      crown: '#F4F8D8',
      wing: '#7FA93A',
      wingDark: '#5C7E27',
      tail: '#6E9A31',
      tailDark: '#4E7122',
      beak: '#D6C9A8',
      beakLight: '#EFE7D3',
      beakDark: '#B0A281',
      beakEdge: '#8A7C5E',
      feet: '#C0B7A8',
      feetDark: '#9A9284',
      iris: '#3A3A2E',
      irisDull: '#4A4A3C',
      bars: '#3A4356',
      cheek: '#7E8F6A',
      tailScale: 1.5,
      beakScale: 0.72,
      facePatch: false,
    },
    traits: { grudge: 0.9, train: 0.14, bond: 1.1, dirt: 1.05, moodSwing: 1.1, noise: 0.6, note: '和蓝虎皮一个脾气，只是换了件衣服' },
  },
  cockatiel: {
    id: 'cockatiel',
    name: '玄凤鹦鹉',
    short: '玄凤',
    look: {
      body: '#A9A9AE',
      bodyLight: '#E2E2E6',
      bodyMid: '#93939A',
      bodyDark: '#6E6E76',
      face: '#F2DA7A',
      faceLight: '#FBEEB4',
      faceDeep: '#E8C54E',
      crown: '#F0D972',
      wing: '#9A9AA0',
      wingDark: '#6E6E76',
      tail: '#8E8E95',
      tailDark: '#5F5F66',
      beak: '#D9CBB4',
      beakLight: '#F0E8D8',
      beakDark: '#B2A187',
      beakEdge: '#8B7A60',
      feet: '#B7A99C',
      feetDark: '#91857A',
      iris: '#3A2F2A',
      irisDull: '#4C413A',
      cheek: '#F08A3C',
      crest: 1,
      tailScale: 1.7,
      beakScale: 0.85,
      facePatch: true,
    },
    traits: { grudge: 0.95, train: 0.08, bond: 1.15, dirt: 0.9, moodSwing: 1.2, noise: 0.75, note: '冠羽最高的一只，吹口哨是它的天赋' },
  },
  quaker: {
    id: 'quaker',
    name: '和尚鹦鹉',
    short: '和尚',
    look: {
      body: '#7FBF5C',
      bodyLight: '#CBE9B4',
      bodyMid: '#6CA94C',
      bodyDark: '#4F8434',
      face: '#D8DCD2',
      faceLight: '#EFF1EA',
      faceDeep: '#B9BEB2',
      crown: '#C9CEC2',
      wing: '#6CA94C',
      wingDark: '#4F8434',
      tail: '#5E9A44',
      tailDark: '#3F6E2C',
      beak: '#E2D8C4',
      beakLight: '#F6EFE0',
      beakDark: '#BEB09A',
      beakEdge: '#8F826D',
      feet: '#B0AFA6',
      feetDark: '#8B8A82',
      iris: '#2F2A26',
      irisDull: '#423C36',
      beakScale: 1.18,
      tailScale: 1.25,
      facePatch: false,
    },
    traits: { grudge: 1, train: 0.1, bond: 1.1, dirt: 1.35, moodSwing: 1, noise: 0.7, note: '最能拆的一只，清洁掉得最快' },
  },
  sunconure: {
    id: 'sunconure',
    name: '太阳锥尾鹦鹉',
    short: '太阳',
    look: {
      body: '#F5A73C',
      bodyLight: '#FFD98C',
      bodyMid: '#F09A28',
      bodyDark: '#C9761A',
      face: '#F8C64A',
      faceLight: '#FDE29B',
      faceDeep: '#E8892A',
      crown: '#F2B03C',
      wing: '#E8912A',
      wingDark: '#B96E1C',
      tail: '#3E7FA6',
      tailDark: '#2A5B7A',
      beak: '#D6CBB6',
      beakLight: '#F2EBDD',
      beakDark: '#AFA48E',
      beakEdge: '#8A7F6B',
      feet: '#B7A896',
      feetDark: '#8F8272',
      iris: '#2E2A2A',
      irisDull: '#413B3B',
      beakScale: 1.05,
      tailScale: 1.9,
      facePatch: true,
    },
    traits: { grudge: 1, train: 0.04, bond: 1.3, dirt: 1.1, moodSwing: 1.35, noise: 1, note: '嗓门能到楼下去，心情一会儿天上一会儿地下' },
  },
};

export const SPECIES_LIST: Species[] = [
  SPECIES['lovebird-lutino'],
  SPECIES['lovebird-green'],
  SPECIES['budgie-blue'],
  SPECIES['budgie-green'],
  SPECIES.cockatiel,
  SPECIES.quaker,
  SPECIES['sunconure'],
];

export function speciesOf(id: SpeciesId): Species {
  return SPECIES[id] ?? SPECIES['lovebird-lutino'];
}

/** 领养它需要多少级 */
export const ADOPT_LEVEL: Record<SpeciesId, number> = {
  'lovebird-lutino': 1,
  'lovebird-green': 4,
  'budgie-blue': 5,
  'budgie-green': 6,
  cockatiel: 7,
  quaker: 8,
  sunconure: 9,
};

/** 家里最多几只 */
export const MAX_BIRDS = 5;
