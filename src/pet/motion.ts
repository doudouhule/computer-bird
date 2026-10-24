import type { CatId, Item } from './catalog';
import type { SkillId } from './skills';

/** 互动时它做的动作。全部作用在已有分组上（头/身/翅），不新增几何。 */
export type MotionId =
  | 'peck'
  | 'drink'
  | 'flap'
  | 'hop'
  | 'peek'
  | 'stretch'
  | 'headbob'
  | 'shake'
  | 'spin'
  | 'sing'
  | 'preen'
  | 'shiver';

export const MOTION_LABEL: Record<MotionId, string> = {
  peck: '低头啄',
  drink: '仰头咽',
  flap: '扑翅',
  hop: '跳一下',
  peek: '探头钻进去',
  stretch: '张开翅膀',
  headbob: '蹭你的手',
  shake: '抖羽毛',
  spin: '转个身',
  sing: '抬头叫',
  preen: '梳羽毛',
  shiver: '缩成一团',
};

/** 每个分类的默认动作 */
const CAT_MOTION: Record<CatId, MotionId> = {
  food: 'peck',
  drink: 'drink',
  toy: 'hop',
  touch: 'headbob',
  trick: 'headbob',
  decor: 'hop',
  sound: 'sing',
  daily: 'shake',
};

/** 单条互动的特殊动作 */
const ITEM_MOTION: Record<string, MotionId> = {
  // 吃
  'food-corn': 'peck',
  'food-worm': 'peck',
  'food-melon': 'shake',
  // 喝
  'drink-bigbowl': 'stretch',
  'drink-drip': 'peck',
  // 玩
  'toy-box': 'peek',
  'toy-parcel': 'peek',
  'toy-bag': 'peek',
  'toy-paper': 'peck',
  'toy-towel': 'peck',
  'toy-swing': 'spin',
  'toy-spray': 'shake',
  'toy-chase': 'flap',
  'toy-shred': 'flap',
  'toy-peekaboo': 'peek',
  'toy-pingpong': 'shiver',
  'toy-rattan': 'peck',
  'toy-wood': 'peck',
  'toy-keys': 'peck',
  'toy-mirror-toy': 'headbob',
  // 摸
  'touch-neck': 'headbob',
  'touch-crown': 'headbob',
  'touch-behindear': 'headbob',
  'touch-chin': 'headbob',
  'touch-back': 'shiver',
  'touch-blow': 'shiver',
  'touch-count': 'preen',
  'touch-foot': 'hop',
  'touch-shake': 'hop',
  'touch-beak': 'headbob',
  // 摆件
  'decor-perch': 'hop',
  'decor-swing2': 'spin',
  'decor-ladder': 'hop',
  'decor-bridge': 'hop',
  'decor-mirror': 'sing',
  'decor-bell2': 'shake',
  'decor-bath': 'stretch',
  // 声音
  'sound-vacuum': 'shiver',
  'sound-music': 'headbob',
  'sound-mimic': 'sing',
  'sound-knock': 'flap',
  'sound-quiet': 'preen',
  // 日常
  'daily-sun': 'stretch',
  'daily-window': 'stretch',
  'daily-mist': 'shake',
  'daily-shoulder': 'hop',
  'daily-mirror2': 'sing',
  'daily-scratch': 'headbob',
  'daily-nail': 'shiver',
  'daily-walk': 'flap',
  'daily-wipe': 'peck',
  'daily-nap': 'preen',
  'daily-lamp': 'preen',
};

/** 训练/表演时按技能给动作 */
const SKILL_MOTION: Record<SkillId, MotionId> = {
  nod: 'headbob',
  spin: 'spin',
  hand: 'hop',
  bow: 'preen',
  kiss: 'headbob',
  hang: 'peek',
  opendoor: 'peck',
  dunk: 'peck',
  fetch: 'hop',
  circle: 'flap',
  playdead: 'shiver',
  hello: 'sing',
  ringbell: 'shake',
  flip: 'spin',
};

export function motionOfItem(item: Item): MotionId {
  if (item.id in ITEM_MOTION) return ITEM_MOTION[item.id];
  if (item.cat === 'trick' && item.trick) return SKILL_MOTION[item.trick];
  return CAT_MOTION[item.cat];
}

/** 动作层 CSS：全部是 transform，作用在 .b-head / .b-bodywrap / .b-wing 上 */
export function motionCss(): string {
  return `
/* ---------- 动作层 ---------- */
.b-motion-peck .b-head { animation: m-peck 0.42s ease-in-out 3; }
@keyframes m-peck {
  0%, 100% { transform: rotate(0deg) translate(0, 0); }
  45% { transform: rotate(13deg) translate(-3px, 8px); }
}

.b-motion-drink .b-head { animation: m-drink 0.6s ease-in-out 3; }
@keyframes m-drink {
  0%, 100% { transform: rotate(0deg) translate(0, 0); }
  40% { transform: rotate(-11deg) translate(2px, 5px); }
  70% { transform: rotate(-17deg) translate(2px, -2px); }
}

.b-motion-flap .b-wing { animation: m-flap 0.16s ease-in-out 10; }
.b-motion-flap .b-bodywrap { animation: m-hop 0.32s ease-out 3; }
@keyframes m-flap {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-16deg) scale(1.06); }
}

.b-motion-hop .b-bodywrap,
.b-motion-hop .b-head { animation: m-hop 0.34s ease-out 2; }
@keyframes m-hop {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  70% { transform: translateY(1px); }
}

.b-motion-peek .b-bodywrap { animation: m-duck 0.85s ease-in-out 2; }
.b-motion-peek .b-head { animation: m-peekhead 0.85s ease-in-out 2; }
@keyframes m-duck {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-4px, 12px) scale(0.93); }
}
@keyframes m-peekhead {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(9deg) translate(-2px, 4px); }
  60% { transform: rotate(-5deg); }
}

.b-motion-stretch .b-wing { animation: m-stretch 1.1s ease-in-out 1 forwards; }
.b-motion-stretch .b-head { animation: m-lift 1.1s ease-in-out 1 forwards; }
@keyframes m-stretch {
  0% { transform: rotate(0deg); }
  45%, 75% { transform: rotate(-34deg) scale(1.08); }
  100% { transform: rotate(0deg); }
}
@keyframes m-lift {
  0% { transform: rotate(0deg); }
  45%, 75% { transform: rotate(-7deg) translateY(-4px); }
  100% { transform: rotate(0deg); }
}

.b-motion-headbob .b-head { animation: m-bob-motion 0.5s ease-in-out 3; }
@keyframes m-bob-motion {
  0%, 100% { transform: rotate(0deg) translateX(0); }
  35% { transform: rotate(-4deg) translateX(-3px); }
  70% { transform: rotate(3deg) translateX(2px); }
}

.b-motion-shake .b-bodywrap,
.b-motion-shake .b-head { animation: m-shake 0.09s linear 12; }
@keyframes m-shake {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(1.8px); }
}

.b-motion-spin .b-bodywrap { animation: m-spin 0.55s ease-in-out 2; }
@keyframes m-spin {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(-1) translateX(2px); }
  100% { transform: scaleX(1); }
}

.b-motion-sing .b-head { animation: m-sing 0.45s ease-in-out 4; }
@keyframes m-sing {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  40% { transform: rotate(-8deg) translateY(-3px); }
}

.b-motion-preen .b-head { animation: m-preen 0.7s ease-in-out 3; }
@keyframes m-preen {
  0%, 100% { transform: rotate(0deg) translate(0, 0); }
  50% { transform: rotate(-27deg) translate(5px, 9px); }
}

.b-motion-shiver .b-bodywrap { animation: m-shiver 0.1s linear 10; }
.b-motion-shiver .b-head { animation: m-shiver-head 0.1s linear 10; }
@keyframes m-shiver {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.985) translateY(1px); }
}
@keyframes m-shiver-head {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-1.2px); }
}
`;
}
