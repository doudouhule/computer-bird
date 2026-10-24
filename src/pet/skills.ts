/** 糖糖能学会的动作。训练时随机挑一个没学会的。 */
export type SkillId =
  | 'nod'
  | 'spin'
  | 'hand'
  | 'bow'
  | 'kiss'
  | 'hang'
  | 'opendoor'
  | 'dunk'
  | 'fetch'
  | 'circle'
  | 'playdead'
  | 'hello'
  | 'ringbell'
  | 'flip';

export interface Skill {
  id: SkillId;
  label: string;
  text: string;
}

export const SKILLS: Skill[] = [
  { id: 'nod', label: '点头', text: '（它对着你点头，脖子一伸一缩，一下、一下）' },
  { id: 'spin', label: '转圈', text: '（它原地转了一圈，尾羽扫过栖木）' },
  { id: 'hand', label: '上手', text: '（它跳到你手指上，站得稳稳的）' },
  { id: 'bow', label: '鞠躬', text: '（它把头低下去，停了两秒，再抬起来）' },
  { id: 'kiss', label: '亲亲', text: '（它把喙凑到你指节上，轻轻碰了一下）' },
  { id: 'hang', label: '倒挂', text: '（它倒挂在笼顶，一只脚还晃着）' },
  { id: 'opendoor', label: '开笼门', text: '（它用喙顶开笼门，回头看你一眼，等你夸它）' },
  { id: 'dunk', label: '投篮', text: '（它叼起小球，扔进了食盆）' },
  { id: 'fetch', label: '捡东西', text: '（它把小夹子捡起来，放进你手心）' },
  { id: 'circle', label: '绕圈飞', text: '（它绕着你飞了一圈，落回栖木上）' },
  { id: 'playdead', label: '装死', text: '（它侧躺下来，一动不动，两秒后自己爬起来）' },
  { id: 'hello', label: '说你好', text: '（它含混不清地"你——好"，像在清嗓子）' },
  { id: 'ringbell', label: '摇铃', text: '（它咬住铃铛绳，来回摇给自己听）' },
  { id: 'flip', label: '翻跟头', text: '（它在你的手指上翻了个身，肚皮朝上）' },
];

export function skillOf(id: SkillId): Skill {
  return SKILLS.find((s) => s.id === id) ?? SKILLS[0];
}

/** 每种玩法在第几级解锁 */
export const UNLOCK_LEVEL = {
  bath: 2,
  cleanCage: 2,
  errand: 3,
  toy: 4,
  free: 5,
  train: 6,
  whistle: 7,
  perform: 8,
} as const;

export type UnlockKey = keyof typeof UNLOCK_LEVEL;

export const UNLOCK_HINT: Record<UnlockKey, string> = {
  bath: '洗澡',
  cleanCage: '打扫笼子',
  errand: '每日心愿',
  toy: '玩具',
  free: '放它出来',
  train: '训练',
  whistle: '口哨教学',
  perform: '表演',
};

export const MAX_LEVEL = 8;

/** 从 level 升到 level+1 需要多少经验 */
export function xpForLevel(level: number): number {
  return 24 + level * 8;
}
