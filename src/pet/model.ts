import type { Pose } from './bird';
import { MAX_LEVEL, SKILLS, UNLOCK_HINT, UNLOCK_LEVEL, skillOf, xpForLevel, type SkillId, type UnlockKey } from './skills';
import { findItem, type DeltaKey } from './catalog';
import { speciesOf, type SpeciesId } from './species';

export const HOUR = 3_600_000;

export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export type MemoryKind =
  | 'birth'
  | 'feed'
  | 'drink'
  | 'bath'
  | 'cleanCage'
  | 'pet'
  | 'play'
  | 'toy'
  | 'scold'
  | 'sorry'
  | 'neglect'
  | 'leave'
  | 'back'
  | 'sick'
  | 'event';

export interface Memory {
  id: string;
  at: number;
  kind: MemoryKind;
  text: string;
  /** 1 = 普通，2 = 有点在意，3 = 刺痛（不清理） */
  weight: number;
}

export type FoodId = 'seed' | 'apple' | 'corn' | 'worm';

export interface Food {
  id: FoodId;
  label: string;
  satiety: number;
  thirst: number;
  mood: number;
  energy: number;
  clean: number;
  /** 它对这个的偏好加成（喂的时候加进 mood） */
  love: number;
}

export const FOODS: Record<FoodId, Food> = {
  seed: { id: 'seed', label: '瓜子', satiety: 12, thirst: -5, mood: 6, energy: 2, clean: -4, love: 10 },
  apple: { id: 'apple', label: '苹果', satiety: 16, thirst: 16, mood: 5, energy: 1, clean: -2, love: 6 },
  corn: { id: 'corn', label: '玉米', satiety: 30, thirst: -6, mood: 3, energy: 3, clean: -7, love: 2 },
  worm: { id: 'worm', label: '面包虫', satiety: 22, thirst: -4, mood: 8, energy: 10, clean: -5, love: 8 },
};

export interface PetState {
  version: 3;
  /** 这只鸟自己的 id（一笼可以有好几只） */
  id: string;
  /** 品种 */
  species: SpeciesId;
  name: string;
  bornAt: number;
  lastTick: number;
  lastVisitAt: number;
  visits: number;
  satiety: number;
  thirst: number;
  energy: number;
  mood: number;
  bond: number;
  grudge: number;
  clean: number;
  health: number;
  sick: boolean;
  asleep: boolean;
  free: boolean;
  /** 它跑出去了（笼子是空的） */
  away: boolean;
  wetUntil: number;
  lastMeal: FoodId | null;
  sameMealCount: number;
  lastEventAt: number;
  memories: Memory[];
  lastLine: string;
  totalScolds: number;
  totalTouches: number;
  /** 等级与经验：等级用来解锁新玩法 */
  level: number;
  xp: number;
  /** 学会的动作 */
  skills: SkillId[];
  /** 今天的心愿 */
  errand: Errand | null;
  errandDay: string;
  /** 你教它的口哨（音阶下标 0-4） */
  whistle: number[];
}

export type ErrandKind = 'feed' | 'play' | 'touch' | 'cleanCage' | 'bath';

export interface Errand {
  kind: ErrandKind;
  food?: FoodId;
  need: number;
  got: number;
}

export type Action =
  | { type: 'feed'; food: FoodId }
  | { type: 'drink' }
  | { type: 'bath' }
  | { type: 'cleanCage' }
  | { type: 'sleep'; on: boolean }
  | { type: 'free'; on: boolean }
  | { type: 'toy' }
  | { type: 'pet' }
  | { type: 'play' }
  | { type: 'scold' }
  | { type: 'sorry' }
  | { type: 'train' }
  | { type: 'perform' }
  | { type: 'whistle'; notes: number[] }
  | { type: 'do'; id: string };

export type Effect =
  | 'feed_ok'
  | 'feed_bored'
  | 'feed_refused'
  | 'drink_ok'
  | 'drink_refused'
  | 'bath_ok'
  | 'bath_refused'
  | 'clean_ok'
  | 'sleep_on'
  | 'sleep_off'
  | 'sleeping'
  | 'free_on'
  | 'free_off'
  | 'free_refused'
  | 'toy_ok'
  | 'toy_bored'
  | 'touch_ok'
  | 'touch_refused'
  | 'play_ok'
  | 'play_tired'
  | 'play_sick'
  | 'scold'
  | 'sorry_ok'
  | 'sorry_refused'
  | 'sorry_soft'
  | 'train_ok'
  | 'train_fail'
  | 'train_done'
  | 'perform_ok'
  | 'no_skill'
  | 'whistle_taught'
  | 'do_ok'
  | 'locked'
  | 'away'
  | 'neutral';

export interface Outcome {
  state: PetState;
  effect: Effect;
  /** 训练/表演时带上动作名 */
  detail?: string;
  /** 这一下升级了 */
  leveled?: boolean;
  /** 行动之外再补一句（比如心愿完成） */
  extraLine?: string;
}

const KEY = 'grouchy-pet.v1';

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function humanDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} 分钟`;
  const hours = Math.round(ms / HOUR);
  if (hours < 24) return `${hours} 小时`;
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return rest > 0 ? `${days} 天 ${rest} 小时` : `${days} 天`;
}

export function bondTitle(bond: number): string {
  if (bond >= 80) return '只认你';
  if (bond >= 60) return '黏着你';
  if (bond >= 40) return '认得你';
  if (bond >= 20) return '眼熟';
  return '还不熟';
}

export { MAX_LEVEL, UNLOCK_LEVEL, xpForLevel, type SkillId, type UnlockKey };

function dayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function isUnlocked(pet: PetState, key: UnlockKey): boolean {
  return pet.level >= UNLOCK_LEVEL[key];
}

/** 加经验，返回有没有升级 */
function gainXp(pet: PetState, amount: number): boolean {
  if (amount < 0) {
    pet.xp = Math.max(0, pet.xp + amount);
    return false;
  }
  if (pet.level >= MAX_LEVEL) return false;
  pet.xp += amount;
  let leveled = false;
  while (pet.level < MAX_LEVEL && pet.xp >= xpForLevel(pet.level)) {
    pet.xp -= xpForLevel(pet.level);
    pet.level += 1;
    leveled = true;
  }
  if (pet.level >= MAX_LEVEL) pet.xp = 0;
  return leveled;
}

const ERRAND_TEXT: Record<string, string> = {
  feed: '它今天想吃',
  play: '它今天想让你陪它玩',
  touch: '它今天想被摸',
  cleanCage: '它今天嫌笼子脏',
  bath: '它今天想洗澡',
};

export function errandText(errand: Errand | null): string {
  if (!errand) return '';
  if (errand.kind === 'feed' && errand.food) {
    return `${ERRAND_TEXT.feed}${FOODS[errand.food].label}`;
  }
  const base = ERRAND_TEXT[errand.kind] ?? '它今天有件事想让你做';
  return errand.need > 1 ? `${base}（${errand.need} 次）` : base;
}

function rollErrand(pet: PetState, now: number): void {
  pet.errandDay = dayKey(now);
  if (pet.level < UNLOCK_LEVEL.errand) {
    pet.errand = null;
    return;
  }
  const roll = Math.floor(Math.random() * 5);
  if (roll === 0) {
    const foods: FoodId[] = ['seed', 'apple', 'corn', 'worm'];
    pet.errand = { kind: 'feed', food: foods[Math.floor(Math.random() * foods.length)], need: 1, got: 0 };
  } else if (roll === 1) {
    pet.errand = { kind: 'play', need: 3, got: 0 };
  } else if (roll === 2) {
    pet.errand = { kind: 'touch', need: 4, got: 0 };
  } else if (roll === 3) {
    pet.errand = { kind: 'cleanCage', need: 1, got: 0 };
  } else {
    pet.errand = { kind: 'bath', need: 1, got: 0 };
  }
}

function bumpErrand(pet: PetState, kind: ErrandKind, food?: FoodId): boolean {
  const errand = pet.errand;
  if (!errand || errand.kind !== kind) return false;
  if (errand.got >= errand.need) return false;
  if (kind === 'feed' && errand.food !== food) return false;
  errand.got += 1;
  if (errand.got < errand.need) return false;
  return true;
}

/** 哪些动作需要等级才开 */
const GATED: Partial<Record<Action['type'], UnlockKey>> = {
  bath: 'bath',
  cleanCage: 'cleanCage',
  toy: 'toy',
  free: 'free',
  train: 'train',
  whistle: 'whistle',
  perform: 'perform',
};

/** 每个结果给多少经验 */
const XP_BY_EFFECT: Partial<Record<Effect, number>> = {
  feed_ok: 4,
  feed_bored: 1,
  drink_ok: 3,
  drink_refused: 1,
  bath_ok: 6,
  bath_refused: 1,
  clean_ok: 5,
  sleep_on: 2,
  sleep_off: 1,
  free_on: 5,
  free_off: 1,
  free_refused: 1,
  toy_ok: 5,
  toy_bored: 2,
  touch_ok: 4,
  touch_refused: 0,
  play_ok: 7,
  play_tired: 1,
  play_sick: 1,
  scold: -10,
  sorry_ok: 2,
  sorry_soft: 1,
  sorry_refused: 0,
  train_ok: 14,
  train_fail: 4,
  train_done: 1,
  perform_ok: 9,
  whistle_taught: 12,
  neutral: 1,
};

const ERRAND_OF_ACTION: Partial<Record<Action['type'], ErrandKind>> = {
  feed: 'feed',
  play: 'play',
  pet: 'touch',
  cleanCage: 'cleanCage',
  bath: 'bath',
};

const SUCCESS = new Set<Effect>(['feed_ok', 'feed_bored', 'play_ok', 'touch_ok', 'clean_ok', 'bath_ok', 'do_ok']);

function applyDelta(pet: PetState, d: Partial<Record<DeltaKey, number>>): void {
  (Object.keys(d) as DeltaKey[]).forEach((key) => {
    pet[key] = clamp(pet[key] + (d[key] ?? 0));
  });
}

export function createPet(name: string, now: number, species: SpeciesId = 'lovebird-lutino'): PetState {
  const clean = name.trim() || speciesOf(species).short;
  return {
    version: 3,
    id: newId(),
    species,
    name: clean,
    bornAt: now,
    lastTick: now,
    lastVisitAt: now,
    visits: 1,
    satiety: 66,
    thirst: 62,
    energy: 78,
    mood: 58,
    bond: 10,
    grudge: 0,
    clean: 82,
    health: 92,
    sick: false,
    asleep: false,
    free: false,
    away: false,
    wetUntil: 0,
    lastMeal: null,
    sameMealCount: 0,
    lastEventAt: now,
    memories: [
      {
        id: newId(),
        at: now,
        kind: 'birth',
        text: `我记住这个名字了：${clean}。`,
        weight: 2,
      },
    ],
    lastLine: '',
    totalScolds: 0,
    totalTouches: 0,
    level: 1,
    xp: 0,
    skills: [],
    errand: null,
    errandDay: '',
    whistle: [],
  };
}

function migrate(raw: unknown): PetState | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown> & { memories?: Memory[]; name?: string; bornAt?: number };
  if (!Array.isArray(p.memories)) return null;

  // 老存档一律按默认值补齐缺的字段（v1 没口渴/清洁/健康，v2 没等级/技能/心愿）
  const base = createPet(p.name ?? '糖糖', p.bornAt ?? Date.now());
  const merged = { ...base, ...p } as PetState;
  merged.version = 3;
  if (typeof merged.id !== 'string' || !merged.id) merged.id = newId();
  if (typeof merged.species !== 'string' || !(merged.species in Object.fromEntries([['lovebird-lutino', 1], ['lovebird-green', 1], ['budgie-blue', 1], ['budgie-green', 1], ['cockatiel', 1], ['quaker', 1], ['sunconure', 1]]))) merged.species = 'lovebird-lutino';

  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  merged.satiety = num(merged.satiety, base.satiety);
  merged.thirst = num(merged.thirst, 60);
  merged.energy = num(merged.energy, base.energy);
  merged.mood = num(merged.mood, base.mood);
  merged.bond = num(merged.bond, base.bond);
  merged.grudge = num(merged.grudge, 0);
  merged.clean = num(merged.clean, 78);
  merged.health = num(merged.health, 88);
  merged.wetUntil = num(merged.wetUntil, 0);
  merged.sameMealCount = num(merged.sameMealCount, 0);
  merged.lastEventAt = num(merged.lastEventAt, merged.lastTick ?? Date.now());
  merged.totalScolds = num(merged.totalScolds, 0);
  merged.totalTouches = num(merged.totalTouches, 0);
  merged.level = Math.min(MAX_LEVEL, Math.max(1, num(merged.level, 1)));
  merged.xp = num(merged.xp, 0);
  merged.sick = merged.sick === true;
  merged.asleep = merged.asleep === true;
  merged.free = merged.free === true;
  merged.away = merged.away === true;
  merged.lastMeal = (merged.lastMeal ?? null) as FoodId | null;
  merged.skills = Array.isArray(merged.skills) ? (merged.skills as SkillId[]) : [];
  merged.whistle = Array.isArray(merged.whistle) ? (merged.whistle as number[]) : [];
  merged.errand = merged.errand && typeof merged.errand === 'object' ? merged.errand : null;
  merged.errandDay = typeof merged.errandDay === 'string' ? merged.errandDay : '';
  return merged;
}

export function loadPet(): PetState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePet(pet: PetState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(pet));
  } catch {
    /* 隐私模式写不进去就算了 */
  }
}

export function clearPet(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function pushMemory(pet: PetState, memory: Memory): void {
  const all = [...pet.memories, memory];
  const deep = all.filter((m) => m.weight >= 3);
  const light = all.filter((m) => m.weight < 3).slice(-14);
  pet.memories = [...deep, ...light].sort((a, b) => a.at - b.at).slice(-20);
}

interface RandomEvent {
  text: string;
  mood?: number;
  satiety?: number;
  thirst?: number;
  clean?: number;
  energy?: number;
  weight?: number;
}

const EVENTS: RandomEvent[] = [
  { text: '窗外有只麻雀叫了一整天，它跟着叫，嗓子有点哑。', mood: 6, thirst: -6, energy: -6 },
  { text: '楼下在装修，它一整天都没敢从栖木上下来。', mood: -10, energy: -4 },
  { text: '它发现了一个纸箱，撕了一下午。', mood: 10, clean: -10 },
  { text: '它把水盆打翻了，然后站在旁边看我收拾。', thirst: -12, clean: -8, mood: 4 },
  { text: '有人从窗外走过，它伸长脖子警戒地叫了两声。', mood: 2 },
  { text: '它掉了一根尾羽，自己盯着看了很久。', mood: -3 },
  { text: '它把自己的影子当成了另一只鸟，跟它吵了一架。', mood: 5, energy: -5 },
  { text: '太阳移到笼子上了，它张开翅膀晒了很久。', mood: 12, energy: 4 },
  { text: '它把食盆里的壳一颗一颗挑出来排成一条线。', mood: 7, clean: -6 },
  { text: '它磨了很久的嘴，然后睡着了。', mood: 4, energy: 8 },
];

/**
 * 时间流过。关掉页面也照走，回来一次性结算。
 */
export function advance(input: PetState, now: number): { state: PetState; notice: string | null } {
  const pet: PetState = { ...input, memories: [...input.memories] };
  const hours = Math.max(0, (now - pet.lastTick) / HOUR);

  if (hours < 1 / 120) {
    pet.lastTick = now;
    return { state: pet, notice: null };
  }

  const hourOfDay = new Date(now).getHours();
  const night = hourOfDay >= 21 || hourOfDay < 6;
  if (night && !pet.free) pet.asleep = true;
  if (!night && pet.asleep && !pet.free) pet.asleep = false;

  const tr = speciesOf(pet.species).traits;
  const sleeping = pet.asleep;
  pet.satiety = clamp(pet.satiety - (sleeping ? 1.0 : 1.8) * hours);
  pet.thirst = clamp(pet.thirst - (sleeping ? 1.4 : 2.4) * hours);
  pet.energy = clamp(pet.energy + (sleeping ? 8 : -1.2) * hours);
  pet.clean = clamp(pet.clean - (pet.free ? 4 : 1.3) * tr.dirt * hours);
  pet.bond = clamp(pet.bond - 0.35 * hours);

  let grudgeGain = 0;
  if (hours > 5) grudgeGain += (hours - 5) * 1.25 * tr.grudge;
  if (pet.satiety <= 0) grudgeGain += 4;
  if (pet.thirst <= 0) grudgeGain += 4;
  pet.grudge = clamp(pet.grudge + grudgeGain);

  const needy = pet.satiety <= 6 || pet.thirst <= 8 || pet.clean <= 12;
  pet.health = clamp(pet.health + (needy ? -1.6 : 0.9) * hours);
  if (!pet.sick && pet.health <= 34) {
    pet.sick = true;
    pushMemory(pet, {
      id: newId(),
      at: now,
      kind: 'sick',
      text: '我有点不舒服。羽毛松了，谁都不想理。',
      weight: 3,
    });
  }
  if (pet.sick && pet.health >= 62) pet.sick = false;

  const wantMood = clamp(
    62 -
      (100 - pet.satiety) * 0.28 -
      (100 - pet.thirst) * 0.22 -
      (100 - pet.clean) * 0.16 -
      (100 - pet.energy) * 0.1 -
      pet.grudge * 0.4 +
      pet.bond * 0.22 +
      (pet.free ? 8 : 0) -
      (pet.sick ? 20 : 0),
  );
  pet.mood = clamp(pet.mood + (wantMood - pet.mood) * Math.min(1, 0.3 * hours));

  let notice: string | null = null;

  if (hours >= 6) {
    pushMemory(pet, {
      id: newId(),
      at: now,
      kind: 'neglect',
      text: `你离开了 ${humanDuration(hours * HOUR)}，一句话都没留。`,
      weight: 2,
    });
    notice =
      pet.satiety <= 0 || pet.thirst <= 0
        ? `你走了 ${humanDuration(hours * HOUR)}。水盆和食盆都是空的。`
        : `你走了 ${humanDuration(hours * HOUR)}。我一直在听楼道里的脚步声。`;
  }

  // 你不在的时候发生的事：回来能从记事本里读到
  if (now - pet.lastEventAt > 2 * HOUR && hours >= 4 && !pet.away) {
    if (Math.random() < Math.min(0.7, hours / 12)) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      pet.mood = clamp(pet.mood + (event.mood ?? 0));
      pet.satiety = clamp(pet.satiety + (event.satiety ?? 0));
      pet.thirst = clamp(pet.thirst + (event.thirst ?? 0));
      pet.clean = clamp(pet.clean + (event.clean ?? 0));
      pet.energy = clamp(pet.energy + (event.energy ?? 0));
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'event',
        text: event.text,
        weight: event.weight ?? 1,
      });
      pet.lastEventAt = now;
    }
  }

  const wantsToLeave = pet.grudge >= 88 || ((pet.satiety <= 0 || pet.thirst <= 0) && pet.grudge >= 70);
  if (!pet.away && wantsToLeave) {
    pet.away = true;
    pet.asleep = false;
    pet.free = true;
    pushMemory(pet, {
      id: newId(),
      at: now,
      kind: 'leave',
      text: '我把笼门打开了。我不在笼子里。',
      weight: 3,
    });
    notice = '门是开着的。笼子里没有人。';
  }

  // 每天第一次来：换一个新的心愿（顺带给点签到经验）
  if (dayKey(now) !== pet.errandDay) {
    const hadDay = pet.errandDay !== '';
    rollErrand(pet, now);
    if (hadDay) gainXp(pet, 15);
  }

  pet.lastTick = now;
  pet.lastVisitAt = now;
  return { state: pet, notice };
}

function shouldLeave(pet: PetState): boolean {
  return pet.grudge >= 88 || ((pet.satiety <= 0 || pet.thirst <= 0) && pet.grudge >= 70);
}

function applyAction(input: PetState, action: Action, now: number): Outcome {
  const settled = advance(input, now).state;
  const pet: PetState = { ...settled, memories: [...settled.memories] };
  const away = pet.away;
  const asleep = pet.asleep;

  // 碰它一下就醒了——真实的鸟也这样，不能因为夜里睡了就什么都干不了
  if (asleep && action.type !== 'sleep') pet.asleep = false;

  switch (action.type) {
    case 'feed': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.grudge >= 74) {
        pet.grudge = clamp(pet.grudge + 1);
        return { state: pet, effect: 'feed_refused' };
      }
      const food = FOODS[action.food];
      const repeated = pet.lastMeal === food.id;
      pet.sameMealCount = repeated ? pet.sameMealCount + 1 : 1;
      pet.lastMeal = food.id;
      const bored = pet.sameMealCount >= 3;

      pet.satiety = clamp(pet.satiety + food.satiety);
      pet.thirst = clamp(pet.thirst + food.thirst);
      pet.energy = clamp(pet.energy + food.energy);
      pet.clean = clamp(pet.clean + food.clean);
      pet.mood = clamp(pet.mood + (bored ? Math.round(food.mood * 0.4) : food.mood + food.love));
      pet.bond = clamp(pet.bond + 3);
      pet.grudge = clamp(pet.grudge - 4);
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'feed',
        text: `你给了我${food.label}。${bored ? '（连着吃这个，有点腻了）' : ''}`,
        weight: 1,
      });
      return { state: pet, effect: bored ? 'feed_bored' : 'feed_ok' };
    }

    case 'drink': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.thirst >= 95) return { state: pet, effect: 'drink_refused' };
      pet.thirst = clamp(pet.thirst + 48);
      pet.clean = clamp(pet.clean - 2);
      pet.mood = clamp(pet.mood + 3);
      pet.bond = clamp(pet.bond + 1);
      pushMemory(pet, { id: newId(), at: now, kind: 'drink', text: '你换了水。', weight: 1 });
      return { state: pet, effect: 'drink_ok' };
    }

    case 'bath': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.sick) return { state: pet, effect: 'bath_refused' };
      pet.clean = clamp(pet.clean + 55);
      pet.mood = clamp(pet.mood + 12);
      pet.bond = clamp(pet.bond + 4);
      pet.energy = clamp(pet.energy - 5);
      pet.wetUntil = now + 25 * 60_000;
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'bath',
        text: '你给我喷了水。我洗得很彻底，甩了一屋子。',
        weight: 1,
      });
      return { state: pet, effect: 'bath_ok' };
    }

    case 'cleanCage': {
      if (away) return { state: pet, effect: 'away' };
      pet.clean = clamp(pet.clean + 42);
      pet.mood = clamp(pet.mood + 2);
      pet.bond = clamp(pet.bond + 2);
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'cleanCage',
        text: '你把笼子打扫了，底盘的壳全倒了。',
        weight: 1,
      });
      return { state: pet, effect: 'clean_ok' };
    }

    case 'sleep': {
      if (away) return { state: pet, effect: 'away' };
      if (action.on === pet.asleep) return { state: pet, effect: 'sleeping' };
      pet.asleep = action.on;
      pet.mood = clamp(pet.mood + (action.on ? 2 : -4));
      pet.bond = clamp(pet.bond + (action.on ? 2 : -1));
      return { state: pet, effect: action.on ? 'sleep_on' : 'sleep_off' };
    }

    case 'free': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.sick) return { state: pet, effect: 'free_refused' };
      if (action.on === pet.free) return { state: pet, effect: 'neutral' };
      pet.free = action.on;
      pet.asleep = false;
      pet.mood = clamp(pet.mood + (action.on ? 8 : -10));
      pet.bond = clamp(pet.bond + (action.on ? 3 : 1));
      pet.energy = clamp(pet.energy - (action.on ? 4 : 0));
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: action.on ? 'play' : 'pet',
        text: action.on ? '你把我放出来了。我飞了两圈。' : '你把我关回笼子里了。',
        weight: action.on ? 1 : 2,
      });
      return { state: pet, effect: action.on ? 'free_on' : 'free_off' };
    }

    case 'toy': {
      if (away) return { state: pet, effect: 'away' };
      const bored = pet.mood >= 85;
      pet.mood = clamp(pet.mood + (bored ? 3 : 12));
      pet.bond = clamp(pet.bond + 3);
      pet.energy = clamp(pet.energy - 3);
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'toy',
        text: bored ? '你把玩具塞给我，我敷衍地啄了两下。' : '你给了我一个新玩具，我玩得很起劲。',
        weight: 1,
      });
      return { state: pet, effect: bored ? 'toy_bored' : 'toy_ok' };
    }

    case 'pet': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.grudge >= 66) {
        pet.grudge = clamp(pet.grudge + 2);
        return { state: pet, effect: 'touch_refused' };
      }
      pet.mood = clamp(pet.mood + 7);
      pet.bond = clamp(pet.bond + 5);
      pet.grudge = clamp(pet.grudge - 4);
      pet.totalTouches += 1;
      pushMemory(pet, { id: newId(), at: now, kind: 'pet', text: '你伸手进来，我没有咬你。', weight: 1 });
      return { state: pet, effect: 'touch_ok' };
    }

    case 'play': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.sick) return { state: pet, effect: 'play_sick' };
      if (pet.energy < 18 || pet.satiety < 12) return { state: pet, effect: 'play_tired' };
      pet.energy = clamp(pet.energy - 16);
      pet.satiety = clamp(pet.satiety - 5);
      pet.mood = clamp(pet.mood + 15);
      pet.bond = clamp(pet.bond + 7);
      pet.grudge = clamp(pet.grudge - 6);
      pet.clean = clamp(pet.clean - 3);
      pushMemory(pet, { id: newId(), at: now, kind: 'play', text: '你陪我玩了一会儿，我点头点得脖子都酸了。', weight: 1 });
      return { state: pet, effect: 'play_ok' };
    }

    case 'scold': {
      if (away) return { state: pet, effect: 'away' };
      pet.mood = clamp(pet.mood - 18);
      pet.bond = clamp(pet.bond - 7);
      pet.grudge = clamp(pet.grudge + 20 * speciesOf(pet.species).traits.grudge);
      pet.totalScolds += 1;
      pet.asleep = false;
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'scold',
        text: '你冲我发了火。',
        weight: 3,
      });
      return { state: pet, effect: 'scold' };
    }

    case 'sorry': {
      pet.grudge = clamp(pet.grudge - (away ? 16 : 20));
      pet.mood = clamp(pet.mood + 4);
      pet.bond = clamp(pet.bond + 2);
      pushMemory(pet, { id: newId(), at: now, kind: 'sorry', text: '你跟我道歉了。', weight: 2 });
      if (away && pet.grudge <= 45) {
        pet.away = false;
        pet.free = false;
        pushMemory(pet, {
          id: newId(),
          at: now,
          kind: 'back',
          text: '我回来了。不是因为原谅你，是因为饿了。',
          weight: 3,
        });
        return { state: pet, effect: 'sorry_ok' };
      }
      if (away) return { state: pet, effect: 'sorry_soft' };
      if (pet.grudge >= 60) return { state: pet, effect: 'sorry_refused' };
      return { state: pet, effect: 'sorry_ok' };
    }

    case 'train': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.sick) return { state: pet, effect: 'play_sick' };
      const unknown = SKILLS.filter((s) => !pet.skills.includes(s.id));
      if (unknown.length === 0) return { state: pet, effect: 'train_done' };
      if (pet.energy < 25) return { state: pet, effect: 'train_fail', detail: '没力气' };

      const target = unknown[Math.floor(Math.random() * unknown.length)];
      const chance = 0.34 + speciesOf(pet.species).traits.train + pet.bond / 260 + pet.mood / 500 - pet.grudge / 300;
      if (Math.random() < chance) {
        pet.skills = [...pet.skills, target.id];
        pet.mood = clamp(pet.mood + 8);
        pet.bond = clamp(pet.bond + 6);
        pet.energy = clamp(pet.energy - 8);
        pushMemory(pet, {
          id: newId(),
          at: now,
          kind: 'play',
          text: `你教会了我${target.label}。`,
          weight: 2,
        });
        return { state: pet, effect: 'train_ok', detail: target.label };
      }
      pet.energy = clamp(pet.energy - 5);
      pet.mood = clamp(pet.mood - 2);
      return { state: pet, effect: 'train_fail', detail: target.label };
    }

    case 'perform': {
      if (away) return { state: pet, effect: 'away' };
      if (pet.sick) return { state: pet, effect: 'play_sick' };
      if (pet.skills.length === 0) return { state: pet, effect: 'no_skill' };
      if (pet.energy < 15) return { state: pet, effect: 'play_tired' };

      const skill = skillOf(pet.skills[Math.floor(Math.random() * pet.skills.length)]);
      pet.mood = clamp(pet.mood + 12);
      pet.bond = clamp(pet.bond + 5);
      pet.energy = clamp(pet.energy - 6);
      return { state: pet, effect: 'perform_ok', detail: skill.text };
    }

    case 'whistle': {
      if (away) return { state: pet, effect: 'away' };
      const notes = action.notes.slice(0, 8);
      if (notes.length === 0) return { state: pet, effect: 'neutral' };
      pet.whistle = notes;
      pet.mood = clamp(pet.mood + 6);
      pet.bond = clamp(pet.bond + 5);
      pet.energy = clamp(pet.energy - 2);
      pushMemory(pet, {
        id: newId(),
        at: now,
        kind: 'play',
        text: '你把一段口哨教给我了。我会吹。',
        weight: 2,
      });
      return { state: pet, effect: 'whistle_taught' };
    }

    case 'do': {
      const item = findItem(action.id);
      if (!item) return { state: pet, effect: 'neutral' };
      if (away) return { state: pet, effect: 'away' };
      if (pet.asleep) pet.asleep = false; // 碰一下就醒
      if (pet.sick && item.cat !== 'drink' && (item.d.health ?? 0) <= 0) {
        return { state: pet, effect: 'play_sick' };
      }
      if (item.cat === 'food' && pet.satiety >= 96) return { state: pet, effect: 'feed_refused' };
      if (item.cat === 'drink' && pet.thirst >= 96) return { state: pet, effect: 'drink_refused' };
      if (pet.grudge >= 70 && (item.cat === 'touch' || item.cat === 'toy')) {
        return { state: pet, effect: 'touch_refused' };
      }

      // 训练类：没学会就试着教，学会了就做给你看
      if (item.cat === 'trick' && item.trick) {
        if (pet.skills.includes(item.trick)) {
          applyDelta(pet, item.d);
          return { state: pet, effect: 'perform_ok', detail: skillOf(item.trick).text };
        }
        if (pet.energy < 25) return { state: pet, effect: 'train_fail', detail: item.label };
        const chance = 0.34 + speciesOf(pet.species).traits.train + pet.bond / 260 + pet.mood / 500 - pet.grudge / 300;
        if (Math.random() < chance) {
          pet.skills = [...pet.skills, item.trick];
          applyDelta(pet, { mood: 10, bond: 8, energy: -8, grudge: -2 });
          pushMemory(pet, {
            id: newId(),
            at: now,
            kind: 'play',
            text: `你教会了我${item.label}。`,
            weight: 2,
          });
          return { state: pet, effect: 'train_ok', detail: item.label };
        }
        applyDelta(pet, { energy: -5, mood: -2 });
        return { state: pet, effect: 'train_fail', detail: item.label };
      }

      applyDelta(pet, item.d);
      const strongMood = Math.abs(item.d.mood ?? 0) >= 10;
      if (item.cat === 'decor' || item.cat === 'daily' || strongMood) {
        pushMemory(pet, {
          id: newId(),
          at: now,
          kind: item.cat === 'decor' || item.cat === 'daily' ? 'event' : 'play',
          text: item.memo ?? `你${'把' + item.label}这件事做了。`,
          weight: 1,
        });
      }
      return { state: pet, effect: 'do_ok', detail: item.id };
    }
  }
}

export function interact(input: PetState, action: Action, now: number): Outcome {
  // 等级没到的玩法：直接挡在前面
  const gate = GATED[action.type];
  if (gate && input.level < UNLOCK_LEVEL[gate]) {
    return {
      state: { ...input, memories: [...input.memories] },
      effect: 'locked',
      detail: String(UNLOCK_LEVEL[gate]),
    };
  }

  const outcome = applyAction(input, action, now);
  const pet = outcome.state;

  const catalogItem = action.type === 'do' ? findItem(action.id) : undefined;
  const xpAmount = catalogItem ? catalogItem.xp ?? 4 : XP_BY_EFFECT[outcome.effect] ?? 0;
  const leveled = gainXp(pet, xpAmount);
  let extraLine = outcome.extraLine;

  // 今天的心愿
  let errandKind: ErrandKind | undefined;
  let errandFood: FoodId | undefined;
  if (action.type === 'do') {
    if (catalogItem) {
      errandKind =
        catalogItem.cat === 'food'
          ? 'feed'
          : catalogItem.cat === 'toy'
            ? 'play'
            : catalogItem.cat === 'touch'
              ? 'touch'
              : undefined;
      errandFood = catalogItem.food;
    }
  } else {
    errandKind = ERRAND_OF_ACTION[action.type];
    errandFood = action.type === 'feed' ? action.food : undefined;
  }

  if (errandKind && SUCCESS.has(outcome.effect) && bumpErrand(pet, errandKind, errandFood)) {
    gainXp(pet, 30);
    pet.mood = clamp(pet.mood + 10);
    pet.bond = clamp(pet.bond + 4);
    pushMemory(pet, {
      id: newId(),
      at: now,
      kind: 'event',
      text: '它今天想要的事，你做到了。',
      weight: 2,
    });
    extraLine = '（它满意了。今天这件事，你做到了。）';
  }

  if (leveled) {
    const unlocked = (Object.keys(UNLOCK_LEVEL) as UnlockKey[]).filter((k) => UNLOCK_LEVEL[k] === pet.level);
    extraLine =
      unlocked.length > 0
        ? `（升级了。Lv.${pet.level} 解锁：${unlocked.map((k) => UNLOCK_HINT[k]).join('、')}）`
        : `（升级了。Lv.${pet.level}）`;
  }

  // 攒够怨气就走
  if (!pet.away && shouldLeave(pet)) {
    pet.away = true;
    pet.asleep = false;
    pet.free = true;
    pushMemory(pet, {
      id: newId(),
      at: now,
      kind: 'leave',
      text: '我把笼门打开了。我不在笼子里。',
      weight: 3,
    });
  }

  return { ...outcome, state: pet, leveled, extraLine };
}

/** 外部加经验（调试面板用） */
export function addXp(input: PetState, amount: number): { state: PetState; leveled: boolean } {
  const pet: PetState = { ...input, memories: [...input.memories] };
  const leveled = gainXp(pet, amount);
  return { state: pet, leveled };
}

/** 它现在怎么样，一句话，不给数字 */
export function statusWord(pet: PetState): string {
  if (pet.away) return '笼子是空的。';
  if (pet.sick) return '它病了，羽毛松着，缩成一团。';
  if (pet.asleep) return '它睡了，头埋在背羽里。';
  if (pet.grudge >= 70) return '它把羽毛全竖起来了。';
  if (pet.thirst <= 12) return '它在水盆边上转圈。';
  if (pet.satiety <= 12) return '它盯着食盆，一下一下地啄。';
  if (pet.clean <= 20) return '它在反复啄自己的羽毛。';
  if (pet.mood >= 72) return '它在磨嘴，咯咯的。';
  if (pet.mood <= 34) return '它单脚站着，不想理你。';
  if (pet.bond >= 60) return '它认得你的脚步声。';
  return '它在栖木上等你。';
}

/** 现在该用哪张脸 */
export function poseOf(pet: PetState, now: number): Pose {
  if (pet.away) return 'away';
  if (pet.sick) return 'sick';
  if (pet.asleep) return 'asleep';
  if (pet.wetUntil > now) return 'wet';
  if (pet.grudge >= 50) return 'angry';
  if (pet.satiety <= 22 || pet.thirst <= 20) return 'hungry';
  if (pet.mood >= 70 && pet.grudge < 25) return 'happy';
  if (pet.mood <= 30) return 'asleep';
  return 'normal';
}

/** 它有哪几件事想让你做（用于界面上的小提示） */
export function needsOf(pet: PetState): string[] {
  if (pet.away) return ['它不在笼子里'];
  const needs: string[] = [];
  if (pet.satiety <= 25) needs.push('饿了');
  if (pet.thirst <= 25) needs.push('渴了');
  if (pet.clean <= 30) needs.push('脏了');
  if (pet.energy <= 22) needs.push('困了');
  if (pet.mood <= 35 && pet.grudge < 50) needs.push('无聊');
  if (pet.sick) needs.push('不舒服');
  if (pet.grudge >= 55) needs.push('在生你的气');
  return needs;
}


/* ------------------------------------------------------------------ */
/* 一笼子鸟                                                            */
/* ------------------------------------------------------------------ */

export interface Flock {
  version: 4;
  activeId: string;
  birds: PetState[];
}

const FLOCK_KEY = KEY;

export function loadFlock(): Flock | null {
  try {
    const raw = localStorage.getItem(FLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed) return null;

    if (Array.isArray((parsed as { birds?: unknown }).birds)) {
      const birds = ((parsed as { birds: unknown[] }).birds)
        .map((b) => migrate(b))
        .filter((b): b is PetState => b !== null);
      if (birds.length === 0) return null;
      const activeId = typeof parsed.activeId === 'string' ? parsed.activeId : birds[0].id;
      return { version: 4, activeId: birds.some((b) => b.id === activeId) ? activeId : birds[0].id, birds };
    }

    // 老存档：单独一只
    const single = migrate(parsed);
    if (!single) return null;
    return { version: 4, activeId: single.id, birds: [single] };
  } catch {
    return null;
  }
}

export function saveFlock(flock: Flock): void {
  try {
    localStorage.setItem(FLOCK_KEY, JSON.stringify(flock));
  } catch {
    /* ignore */
  }
}

export function activeBird(flock: Flock): PetState {
  return flock.birds.find((b) => b.id === flock.activeId) ?? flock.birds[0];
}

/** 把改过的这一只写回笼子 */
export function replaceBird(flock: Flock, bird: PetState): Flock {
  const birds = flock.birds.map((b) => (b.id === bird.id ? bird : b));
  return { ...flock, birds };
}

export function switchBird(flock: Flock, id: string): Flock {
  return flock.birds.some((b) => b.id === id) ? { ...flock, activeId: id } : flock;
}

/** 领养一只新鸟（等级由品种决定，调用前自己判断） */
export function adoptBird(flock: Flock, species: SpeciesId, name: string, now: number): Flock {
  const bird = createPet(name, now, species);
  bird.bond = 4;
  bird.mood = 52;
  pushMemory(bird, {
    id: newId(),
    at: now,
    kind: 'birth',
    text: `它的名字是${bird.name}。它刚到这个家。`,
    weight: 2,
  });
  return { ...flock, birds: [...flock.birds, bird], activeId: bird.id };
}

/** 全部鸟一起过时间 */
export function advanceFlock(flock: Flock, now: number): { flock: Flock; notices: string[] } {
  const notices: string[] = [];
  const birds = flock.birds.map((b) => {
    const { state, notice } = advance(b, now);
    if (notice) notices.push(`${state.name}：${notice}`);
    return state;
  });
  return { flock: { ...flock, birds }, notices };
}

/** 摸一只的时候，其他鸟会吃醋 */
export function nudgeOthers(flock: Flock, activeId: string, d: Partial<Record<DeltaKey, number>>): Flock {
  const birds = flock.birds.map((b) => {
    if (b.id === activeId) return b;
    const copy: PetState = { ...b, memories: [...b.memories] };
    applyDelta(copy, d);
    return copy;
  });
  return { ...flock, birds };
}
