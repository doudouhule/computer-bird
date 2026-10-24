import { SKILLS, type SkillId } from './skills';
import type { FoodId } from './model';

export type CatId = 'food' | 'drink' | 'toy' | 'touch' | 'trick' | 'decor' | 'sound' | 'daily';

export interface Cat {
  id: CatId;
  label: string;
}

export const CATS: Cat[] = [
  { id: 'food', label: '吃' },
  { id: 'drink', label: '喝' },
  { id: 'toy', label: '玩' },
  { id: 'touch', label: '摸' },
  { id: 'trick', label: '训' },
  { id: 'decor', label: '摆件' },
  { id: 'sound', label: '声音' },
  { id: 'daily', label: '日常' },
];

export type DeltaKey = 'satiety' | 'thirst' | 'energy' | 'mood' | 'bond' | 'grudge' | 'clean' | 'health';
export type Delta = Partial<Record<DeltaKey, number>>;

export interface Item {
  id: string;
  cat: CatId;
  label: string;
  /** 它的反应（会按状态被替换：睡着/生病/生气/吃不下了） */
  line: string;
  d: Delta;
  xp?: number;
  /** 解锁等级 */
  lv?: number;
  /** 对应"今天想吃X"的心愿 */
  food?: FoodId;
  /** 训练类对应的技能 */
  trick?: SkillId;
  /** 会写进记事本 */
  memo?: string;
}

const mk =
  (cat: CatId) =>
  (id: string, label: string, line: string, d: Delta, extra: Partial<Item> = {}): Item => ({
    id: `${cat}-${id}`,
    cat,
    label,
    line,
    d,
    xp: extra.xp ?? 4,
    ...extra,
  });

const food = mk('food');
const drink = mk('drink');
const toy = mk('toy');
const touch = mk('touch');
const decor = mk('decor');
const sound = mk('sound');
const daily = mk('daily');

const FOODS_LIST: Item[] = [
  food('seed', '瓜子', '（叼走，壳掉在地上）', { satiety: 12, thirst: -5, mood: 6, clean: -4 }, { food: 'seed' }),
  food('millet', '谷穗', '（它把整根谷穗按在脚下，一粒一粒剥）', { satiety: 16, mood: 5, clean: -6 }, { food: 'seed' }),
  food('millet2', '小米', '（它低着头啄，头一点一点）', { satiety: 10, mood: 3, clean: -3 }),
  food('corn', '玉米', '（它把玉米粒啃得只剩芯）', { satiety: 30, thirst: -6, mood: 3, clean: -7 }, { food: 'corn' }),
  food('pea', '青豆', '（它把青豆含在嘴里滚了半天才咬破）', { satiety: 14, thirst: 6, mood: 4, clean: -2 }),
  food('broccoli', '西兰花', '（它先撕，再吃，最后把渣甩到笼外）', { satiety: 18, thirst: 8, mood: 3, clean: -6 }),
  food('carrot', '胡萝卜', '（它啃出一圈牙印）', { satiety: 16, thirst: 5, clean: -5 }),
  food('apple', '苹果', '（汁水顺着喙流下来，它甩了甩头）', { satiety: 16, thirst: 16, mood: 5, clean: -2 }, { food: 'apple' }),
  food('banana', '香蕉', '（它把香蕉按在栖木上，吃出了一个坑）', { satiety: 20, thirst: 8, mood: 6, clean: -8 }),
  food('grape', '葡萄', '（它把皮剥了，只吃里面）', { satiety: 14, thirst: 14, mood: 8, clean: -4 }),
  food('melon', '西瓜', '（它把脸埋进去，抬起来满脸是水）', { satiety: 18, thirst: 22, mood: 10, clean: -10 }),
  food('strawberry', '草莓', '（它先咬掉尖，剩下的推给你）', { satiety: 12, thirst: 10, mood: 9, clean: -5 }),
  food('orange', '橙子', '（它嫌酸，眯了一下眼，又去啄第二口）', { satiety: 12, thirst: 14, mood: 5, clean: -6 }),
  food('pear', '梨', '（它啃得很专心，一眼都没看你）', { satiety: 18, thirst: 12, clean: -5 }),
  food('egg', '熟鸡蛋', '（它把蛋黄抠出来，蛋白留在盆里）', { satiety: 26, energy: 8, mood: 7, clean: -6 }),
  food('worm', '面包虫', '（它叼起来甩了两下，一口吞掉）', { satiety: 22, thirst: -4, energy: 10, mood: 8 }, { food: 'worm' }),
  food('mealworm', '大麦虫', '（它咬住一头，像吃面条一样吸进去）', { satiety: 26, energy: 10, mood: 6, clean: -4 }),
  food('nut', '坚果碎', '（它用脚踩着，一下一下砸）', { satiety: 20, energy: 6, mood: 7, clean: -6 }),
  food('honey', '蜂蜜棒', '（它舔了很久，然后去擦栖木）', { satiety: 10, mood: 12, energy: 4, clean: -12 }),
  food('pellet', '滋养丸', '（它把滋养丸泡进水里再吃——它倒是聪明）', { satiety: 24, health: 5, mood: 2 }),
  food('sprout', '发芽种子', '（它挑挑拣拣，只吃最嫩的那几根）', { satiety: 16, health: 4, mood: 4 }),
  food('crisp', '米饼', '（咔一声，碎屑飞了一地）', { satiety: 12, mood: 8, clean: -8 }),
  food('chili', '小米辣', '（它面不改色地吃了。鸟不怕辣，你不知道吗）', { satiety: 8, mood: 4, clean: -3 }),
  food('bone', '墨鱼骨', '（它趴在上面啃，补钙）', { satiety: 6, health: 8, mood: 3, clean: -3 }),
];

const DRINK_LIST: Item[] = [
  drink('water', '换清水', '（它把喙伸进水里，仰头咽下去）', { thirst: 48, mood: 3, clean: -2 }),
  drink('warm', '温水', '（它喝得很慢，喝完把喙蹭在栖木上）', { thirst: 44, mood: 5 }),
  drink('ice', '冰水', '（它喝了一口，抖了一下，还是喝完了）', { thirst: 46, mood: -2, energy: 2 }),
  drink('honey', '蜂蜜水', '（它喝得头都不抬）', { thirst: 40, mood: 8, energy: 3 }),
  drink('juice', '苹果汁', '（它喝了两口，剩下的用来洗脚）', { thirst: 38, mood: 6, clean: -4 }),
  drink('electrolyte', '电解质水', '（它不太情愿，但还是喝了）', { thirst: 42, health: 6, mood: -1 }),
  drink('bigbowl', '换大澡盆', '（它踩进去站了一会儿，才想起来要喝）', { thirst: 50, mood: 7, clean: -3 }),
  drink('drip', '滴水壶', '（它追着水珠啄，喝一半洒一半）', { thirst: 36, mood: 9, clean: -5 }),
];

const TOY_LIST: Item[] = [
  toy('bell', '铃铛球', '（它把铃铛球摇得整间屋子都听得见）', { mood: 12, energy: -3, bond: 3 }),
  toy('swing', '秋千', '（它站上去荡了两下，然后倒挂）', { mood: 14, energy: -5, bond: 4 }),
  toy('box', '纸箱', '（它钻进纸箱，只露出一个尾巴）', { mood: 15, energy: -4, clean: -6, bond: 3 }),
  toy('towel', '纸巾卷', '（它把纸巾一张张抽出来，直到整卷没了）', { mood: 12, energy: -4, clean: -10 }),
  toy('ring', '塑料环', '（它把环套在脖子上，又甩下来）', { mood: 10, energy: -3 }),
  toy('rattan', '藤球', '（它把藤球拆成了一堆藤条）', { mood: 13, energy: -5, clean: -6 }),
  toy('wood', '木块', '（它啃木块的声音像在磨刀）', { mood: 8, energy: -2, clean: -4 }),
  toy('rope', '绳索', '（它咬住一头往后退，把自己拉得直晃）', { mood: 11, energy: -4 }),
  toy('mirror-toy', '镜面玩具', '（它对着镜子里的自己点头，对方也点头）', { mood: 9, energy: -2 }),
  toy('paper', '旧报纸', '（它把报纸撕成一条一条，排在地上）', { mood: 12, energy: -4, clean: -8 }),
  toy('bag', '纸袋', '（它钻进纸袋，然后从底下咬出一个洞）', { mood: 13, energy: -4, clean: -7 }),
  toy('yarn', '毛线', '（它被毛线缠住了脚，站着不动，等你救）', { mood: 8, energy: -3, bond: 5 }),
  toy('straw', '吸管', '（它把吸管叼在嘴里当烟斗，来回踱步）', { mood: 10, energy: -2, clean: -3 }),
  toy('parcel', '快递箱', '（它宣布这个箱子是它的了）', { mood: 14, energy: -3, clean: -5 }),
  toy('peg', '晒衣夹', '（它把夹子拆开，又试着装回去，装不回去）', { mood: 9, energy: -3 }),
  toy('pingpong', '乒乓球', '（球滚过来它退了两步——它怕这个）', { mood: -4, energy: -2 }),
  toy('shred', '撕纸游戏', '（你把纸举高，它飞起来撕走一条）', { mood: 14, energy: -6, bond: 6 }),
  toy('peekaboo', '躲猫猫', '（你把布一掀，它就把头埋下去；你放下，它又探头）', { mood: 13, bond: 7 }),
  toy('chase', '追手指', '（它追着你的手指跑，追上就轻轻咬一口）', { mood: 12, energy: -5, bond: 6 }),
  toy('spray', '喷水雾', '（它张开翅膀迎上去，甩了一屋子水）', { mood: 12, clean: 20, energy: -4 }),
  toy('ball', '滚小球', '（它一脚把球踢下栖木，然后低头看你）', { mood: 11, energy: -3 }),
  toy('keys', '旧键盘', '（它把键帽一个一个抠下来，很专注）', { mood: 12, energy: -4, clean: -8 }),
];

const TOUCH_LIST: Item[] = [
  touch('neck', '摸后颈', '（它低下头，把后颈递给你）', { mood: 8, bond: 5, grudge: -3 }),
  touch('crown', '摸头顶', '（它眯起眼，头顶的羽毛被你压平了又弹回来）', { mood: 7, bond: 4, grudge: -2 }),
  touch('behindear', '挠耳后', '（它把头歪过来，让你正好够到）', { mood: 9, bond: 6, grudge: -3 }),
  touch('beak', '碰它的喙', '（它轻轻咬住你的指尖，没用力）', { mood: 5, bond: 6 }),
  touch('back', '摸背', '（它一抖，羽毛塌下去，然后侧过身躲开）', { mood: -3, grudge: 4 }),
  touch('foot', '托它的脚', '（它把一只脚抬起来，让你托着）', { mood: 6, bond: 5 }),
  touch('shake', '握手', '（它把脚搭在你手指上，停了两秒）', { mood: 7, bond: 6 }),
  touch('blow', '朝它吹气', '（它被吹得往后退，瞪着你）', { mood: -8, grudge: 12 }),
  touch('chin', '挠下巴', '（它把下巴抬得高高的，眼睛快闭上了）', { mood: 10, bond: 6, grudge: -4 }),
  touch('count', '数它的羽毛', '（你一根一根数，它一动不动，很有耐心）', { mood: 6, bond: 8, energy: -1 }),
];

const TRICK_LIST: Item[] = SKILLS.map((s) =>
  mk('trick')(s.id, s.label, s.text, { mood: 8, bond: 4, energy: -6 }, { trick: s.id, xp: 10, lv: 6 }),
);

const DECOR_LIST: Item[] = [
  decor('perch', '加一根栖木', '（它立刻跳上去，试了试弹性）', { mood: 8, clean: 4 }, { xp: 6 }),
  decor('swing2', '换新秋千', '（它先站上去，再倒挂，再下来——检查完毕）', { mood: 10, clean: 3 }, { xp: 6 }),
  decor('mirror', '挂镜子', '（它对着镜子叫了一整天，以为多了个同伴）', { mood: 12, energy: -4 }, { xp: 6 }),
  decor('bell2', '挂铃铛', '（它每隔十分钟去摇一次）', { mood: 9 }, { xp: 6 }),
  decor('paperbase', '铺纸底', '（它低头看着洁白的底盘，很快又弄得一团糟）', { clean: 12, mood: 3 }, { xp: 6 }),
  decor('bath', '加澡盆', '（它绕着澡盆走了三圈才敢下去）', { mood: 7, clean: 10 }, { xp: 6 }),
  decor('halfcover', '遮一半布', '（它退到布后面，只留一个喙尖在外面）', { mood: 6, energy: 3 }, { xp: 6 }),
  decor('newdish', '换新食盆', '（它检查了新食盆，确认是空的，然后看你）', { mood: 4 }, { xp: 6 }),
  decor('stone', '磨喙石', '（它趴上去磨了很久，声音很规律）', { mood: 5, clean: 3 }, { xp: 6 }),
  decor('plant', '放一盆绿植', '（它对叶子很感兴趣，你决定先移走）', { mood: 9, clean: -4 }, { xp: 6 }),
  decor('ladder', '加梯子', '（它上下爬了四趟，纯粹为了好玩）', { mood: 8, energy: -3 }, { xp: 6 }),
  decor('bridge', '装吊桥', '（它在吊桥上晃了半天，找到了最晃的点）', { mood: 9, energy: -3 }, { xp: 6 }),
];

const SOUND_LIST: Item[] = [
  sound('name', '叫它的名字', '（它抬头，然后装作没听见）', { mood: 3, bond: 3 }),
  sound('whistle', '吹口哨', '（它歪头听了两秒，开始跟着哼）', { mood: 6, bond: 4 }),
  sound('music', '放音乐', '（它跟着节奏点头，点到第四下就不点了）', { mood: 7 }),
  sound('mimic', '学它叫', '（它叫一声，你学一声；它越叫越急，最后生气了）', { mood: 4, grudge: 5 }),
  sound('snap', '弹响指', '（它在响指声里转过头，眼睛亮了一下）', { mood: 5, bond: 2 }),
  sound('knock', '敲桌子', '（它把桌子当成领地，飞下来赶你）', { mood: -2, energy: -3 }),
  sound('vacuum', '开吸尘器', '（它炸成一团刺球，贴在笼子最远的角落）', { mood: -14, grudge: 8 }),
  sound('quiet', '安静十分钟', '（十分钟过去，它自己玩得很忙）', { mood: 6, energy: -2 }),
  sound('tv', '开电视', '（它盯着屏幕看了很久，然后对着里面的人叫）', { mood: 5, energy: -2 }),
  sound('sing', '唱歌给它听', '（你跑调了，它把头埋进翅膀，不评价）', { mood: 4, bond: 7 }),
];

const DAILY_LIST: Item[] = [
  daily('window', '开窗', '（它伸长脖子闻了很久，尾巴一直在抖）', { mood: 10, energy: -2 }),
  daily('sun', '晒太阳', '（它张开翅膀，把整个身子摊在光里）', { mood: 12, energy: 5, health: 3 }),
  daily('mist', '喷水雾', '（它张开翅膀接着，然后疯狂甩头）', { mood: 10, clean: 14, energy: -3 }),
  daily('ac', '开空调', '（它把喙张开又合上，很满意这个温度）', { mood: 7, energy: 2 }),
  daily('lamp', '关灯', '（屋子暗下来，它安静了）', { mood: 3, energy: 4 }),
  daily('shoulder', '放它上肩', '（它站到你肩膀上，开始啃你的领子）', { mood: 14, bond: 8, clean: -3 }),
  daily('mirror2', '带它照镜子', '（它对着镜子里的自己吐了口水）', { mood: 8, energy: -2 }),
  daily('scratch', '给它挠痒', '（你挠到第三十秒，它把眼睛闭上了）', { mood: 9, bond: 6 }),
  daily('weigh', '称体重', '（秤上是 52 克，它对这个数字很满意）', { mood: 3, health: 2 }),
  daily('nail', '剪指甲', '（它记住了这件事。它会记很久）', { mood: -18, grudge: 26, bond: -4 }),
  daily('walk', '带它出门', '（外面的世界太大，它紧紧抓着你的手指）', { mood: 6, bond: 10, energy: -8 }),
  daily('wipe', '擦笼子', '（它看着你擦，顺便把擦干净的地方弄脏了）', { clean: 16, mood: 2 }),
  daily('bedding', '换垫纸', '（新的垫纸被它当场撕了一个角）', { clean: 14, mood: 4 }),
  daily('nap', '陪它打个盹', '（你眯了一会儿，醒来发现它在看你）', { mood: 11, bond: 9, energy: 6 }),
];

export const ITEMS: Item[] = [
  ...FOODS_LIST,
  ...DRINK_LIST,
  ...TOY_LIST,
  ...TOUCH_LIST,
  ...TRICK_LIST,
  ...DECOR_LIST,
  ...SOUND_LIST,
  ...DAILY_LIST,
];

export function findItem(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function itemsOf(cat: CatId): Item[] {
  return ITEMS.filter((i) => i.cat === cat);
}
