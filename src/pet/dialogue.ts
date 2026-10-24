import { humanDuration, type Effect, type PetState } from './model';
import { findItem } from './catalog';

function pick<T>(pool: readonly T[], avoid?: string): string {
  const options = typeof avoid === 'string' && pool.length > 1
    ? (pool as readonly unknown[]).filter((x) => x !== avoid)
    : pool;
  const arr = (options.length ? options : pool) as readonly unknown[];
  return String(arr[Math.floor(Math.random() * arr.length)]);
}

const WARM_IDLE = [
  '（它把脑袋低下来，递到你手边）',
  '叽。',
  '（它蹭了蹭你的袖口，然后假装什么都没发生）',
  '（它对你点头，脖子一伸一缩，一下、一下）',
  '你手指上有昨天那个味道。',
  '（它跳到你手背上，站稳了）',
  '过来。别站着。',
  '（它喉咙动了两下，想把刚吃的东西吐出来喂你——它认为这是最大的礼貌）',
];

const CALM_IDLE = [
  '叽。',
  '（单脚站着，另一只脚缩在羽毛里）',
  '……',
  '笼门我自己会开。别锁。',
  '（它在磨嘴，咯咯的）',
  '（它歪头，用一只眼睛看你，再换另一只）',
];

const SAD_IDLE = [
  '（它盯着你的手，看你有没有瓜子）',
  '碗里没有了。我看过了。',
  '叽、叽、叽。（越叫越急）',
  '（它把脑袋埋进背羽，只留一个后脑勺给你）',
  '（它啄了一下食盆，很响）',
];

const THIRSTY_IDLE = [
  '（它把喙伸进水盆，抬起来，又伸进去——盆底是干的）',
  '水。',
  '（它在水盆边上转圈，一遍一遍）',
];

const DIRTY_IDLE = [
  '（它在反复啄自己的羽毛，啄得有点急）',
  '（它抖了一下，掉了一层灰）',
  '我身上痒。',
];

const COLD_IDLE = [
  '别伸手。',
  '我记得你上次是这么进来的。',
  '（它背对着你，尾羽正对着你的脸）',
  '我不生气。我只是记住了。',
  '叽——！（短，硬，像在骂人）',
  '（它张开嘴，喉咙里有低低的咕声）',
];

const SICK_IDLE = [
  '（它缩成一团，羽毛松着，眼睛半闭）',
  '（它没有理你）',
  '……冷。',
];

const AWAY_IDLE = [
  '（笼子空着。门开了一条缝。）',
  '（窗帘后面有动静，很小。）',
  '（食盆还是满的。它没来吃。）',
];

export function idleLine(pet: PetState, avoid?: string): string {
  if (pet.away) return pick(AWAY_IDLE, avoid);
  if (pet.sick) return pick(SICK_IDLE, avoid);
  if (pet.asleep) return '（它睡着了。呼吸很轻。）';
  if (pet.thirst <= 20) return pick(THIRSTY_IDLE, avoid);
  if (pet.grudge >= 55) return pick(COLD_IDLE, avoid);
  if (pet.clean <= 22) return pick(DIRTY_IDLE, avoid);
  if (pet.whistle.length > 0 && Math.random() < 0.3) {
    return '（它吹了一遍你教的那段，中间错了两个音，然后又从头吹。）';
  }
  if (pet.skills.length > 0 && pet.mood >= 70 && Math.random() < 0.3) {
    return '（它自己把学会的动作做了半套，然后停下来看你有没有在看。）';
  }
  if (pet.mood <= 34) return pick(SAD_IDLE, avoid);
  if (pet.mood >= 70 && pet.grudge < 25) return pick(WARM_IDLE, avoid);
  return pick(CALM_IDLE, avoid);
}

const FEED_OK = [
  '（叼走，壳掉在地上）',
  '咔。',
  '再来一点。',
  '（它吃完蹭了蹭你的手指）',
  '（它把吃的藏进食盆底下，又刨了两下盖住）',
  '（它吃了一口，忽然把喙凑过来——它想喂你，这是它对最亲的人才做的事）',
];
const FEED_BORED = [
  '（它啄了一口，抬头看看你，又低头啄了一口）',
  '……又是这个。',
  '（它把食物拨到一边，自己玩起了壳）',
];
const FEED_REFUSED = ['（它把食盆啄翻了）', '不要。拿走。', '（它转过头，尾羽对着食盆）'];
const DRINK_OK = [
  '（它把喙伸进水里，仰头咽下去，喉结动了动）',
  '（它喝得很急，水溅了一地）',
  '（它喝完甩了甩喙）',
];
const DRINK_REFUSED = ['（它看了一眼水盆，没有动）', '我不渴。'];
const BATH_OK = [
  '（它张开翅膀，让水淋满全身，然后疯狂地抖）',
  '（它扑进水里，甩了一屋子）',
  '（它湿透了，还嫌水不够）',
];
const BATH_REFUSED = ['（它缩起来，不肯碰水）', '我不舒服，今天不洗。'];
const CLEAN_OK = ['（它跳下栖木，检查了一遍新底盘）', '（它看着你换食盆，没有阻止）'];
const SLEEP_ON = ['（你盖上布。它安静下来，往角落缩了缩。）', '（布下面传来很轻的磨嘴声）'];
const SLEEP_OFF = ['（布掀开了。它眯着眼，还没醒透。）', '（它慢慢把头从背羽里拔出来）'];
const SLEEPING = ['（它睡着了，别吵它。）', '（布下面一动不动。）'];
const FREE_ON = ['（它飞出来了。绕屋子两圈，落在窗帘杆上俯瞰你。）', '（它出来了，第一件事是去咬电线。）'];
const FREE_OFF = ['（它不情不愿地回了笼子，在栖木上重重落了一下。）', '（它进去了，但把尾羽对着你。）'];
const FREE_REFUSED = ['（它病着，飞不动。）', '（它今天没力气出来。）'];
const TOY_OK = [
  '（它把玩具翻过来，用脚踩着咬）',
  '（它把玩具扔下栖木，看你怎么捡）',
  '（它把铃铛摇得整间屋子都听得见）',
];
const TOY_BORED = ['（它啄了两下，走开了）', '（它看了一眼，没兴趣。）'];
const TOUCH_OK = [
  '（它低下头，让你摸后颈）',
  '唔。',
  '（它咬了一下你的指节，没用力）',
  '别停。',
  '（它把脸埋进你的手心，蹭了两下）',
];
const TOUCH_REFUSED = ['（咬）', '（它咬了你一口，然后退开半步）', '我说了别伸手。', '（它张嘴，等你缩手）'];
const PLAY_OK = [
  '（它倒挂在栖木上，翅膀张开）',
  '叽叽叽！',
  '（它对你点头，脖子一伸一缩，一下、一下）',
  '（它把纸片叼到你手边，放下，等你收）',
  '（它把纸片撕成三条，很满意）',
];
const PLAY_TIRED = ['（它单脚站着，眼睛快闭上）', '不玩了。', '（它把脑袋埋进背羽）'];
const PLAY_SICK = ['（它动了动，又缩回去）', '（它今天不想玩。）'];
const SORRY_OK = [
  '（它犹豫了一下，把脑袋低了低）',
  '叽。（短的一声，算答应了）',
  '（它蹭了蹭你的袖口，算是翻篇）',
];
const SORRY_REFUSED = ['（它咬住你的袖口不放）', '（它把头扭到另一边）', '叽——！'];
const SORRY_SOFT = ['（它没走，但也没靠近）', '叽。（不带情绪的那种）', '（它侧过脸听，一只眼睛盯着你）'];
const NEUTRAL = ['叽。', '（它看着你）', '（它啄了一下栖木）'];
const AWAY_LINES = ['（笼子是空的。）', '（没有回音。）', '（门缝里没有动静。）'];

export function reactionLine(effect: Effect, pet: PetState, avoid?: string, detail?: string): string {
  switch (effect) {
    case 'feed_ok':
      return pick(pet.grudge < 20 ? FEED_OK : [...FEED_OK, '（它叼走，转身背对你吃）'], avoid);
    case 'feed_bored':
      return pick(FEED_BORED, avoid);
    case 'feed_refused':
      return pick(FEED_REFUSED, avoid);
    case 'drink_ok':
      return pick(DRINK_OK, avoid);
    case 'drink_refused':
      return pick(DRINK_REFUSED, avoid);
    case 'bath_ok':
      return pick(BATH_OK, avoid);
    case 'bath_refused':
      return pick(BATH_REFUSED, avoid);
    case 'clean_ok':
      return pick(CLEAN_OK, avoid);
    case 'sleep_on':
      return pick(SLEEP_ON, avoid);
    case 'sleep_off':
      return pick(SLEEP_OFF, avoid);
    case 'sleeping':
      return pick(SLEEPING, avoid);
    case 'free_on':
      return pick(FREE_ON, avoid);
    case 'free_off':
      return pick(FREE_OFF, avoid);
    case 'free_refused':
      return pick(FREE_REFUSED, avoid);
    case 'toy_ok':
      return pick(TOY_OK, avoid);
    case 'toy_bored':
      return pick(TOY_BORED, avoid);
    case 'touch_ok':
      return pick(TOUCH_OK, avoid);
    case 'touch_refused':
      return pick(TOUCH_REFUSED, avoid);
    case 'play_ok':
      return pick(PLAY_OK, avoid);
    case 'play_tired':
      return pick(PLAY_TIRED, avoid);
    case 'play_sick':
      return pick(PLAY_SICK, avoid);
    case 'scold':
      return pick(
        [
          '（它张开嘴，喉咙里发出低低的咕声）',
          '（它把身体压平，羽毛全竖起来了）',
          '叽——！！',
          '（它转过身，尾羽对着你，一动不动）',
          '（它飞起来，在你头顶绕了一圈，又落下）',
        ],
        avoid,
      );
    case 'sorry_ok':
      return pick(SORRY_OK, avoid);
    case 'sorry_refused':
      return pick(SORRY_REFUSED, avoid);
    case 'sorry_soft':
      return pick(SORRY_SOFT, avoid);
    case 'train_ok':
      return `（它做对了。）它学会了：${detail ?? '一个新动作'}。`;
    case 'train_fail':
      return pick(
        [
          `（它对你示范的${detail ?? '动作'}完全没兴趣，转头去啃栖木了）`,
          '（它看懂了，但假装没懂。）',
          '（它试了一下，做成了别的样子。）',
        ],
        avoid,
      );
    case 'train_done':
      return '（你会的它都会了。它现在有点得意。）';
    case 'perform_ok':
      return detail ?? '（它一口气把会的都做了一遍）';
    case 'no_skill':
      return '（它什么都不会。它歪头看你，好像这该是你的问题。）';
    case 'whistle_taught':
      return '（它把你的调子学了一遍，第二声高了半度。）';
    case 'locked':
      return '（它还不会这个。你们得先熟一点。）';
    case 'do_ok': {
      const item = detail ? findItem(detail) : undefined;
      if (!item) return pick(NEUTRAL, avoid);
      // 气头上，被摸被逗都不领情
      if (pet.grudge >= 60 && (item.cat === 'touch' || item.cat === 'toy')) return pick(COLD_IDLE, avoid);
      return item.line;
    }
    case 'away':
      return pick(AWAY_LINES, avoid);
    case 'neutral':
    default:
      return pick(NEUTRAL, avoid);
  }
}

/** 翻旧账：它记得的是你做过的事，不是你说过的话 */
export function recallLine(pet: PetState, now: number): string {
  const notable = pet.memories.filter((m) => m.weight >= 2);
  const pool = notable.length > 0 ? notable : pet.memories;
  if (pool.length === 0) return '叽。（它什么都没说。）';

  const target = pool[Math.floor(Math.random() * pool.length)];
  const ago = humanDuration(now - target.at);

  switch (target.kind) {
    case 'scold':
      return `（它歪头。）你还记得你凶过我吗。${ago}前的事。`;
    case 'neglect':
      return `（它看着你。）${ago}。你一句话都没留就走了。`;
    case 'leave':
      return '（它不看你。）那次我出去了。是你把我饿出去的。';
    case 'back':
      return '（它低声叫了一下。）我回来过。你是不是没注意。';
    case 'sick':
      return '（它把羽毛收紧。）那次我病了。你后来才发现的。';
    case 'sorry':
      return '（它想了想。）你道过歉。这个我记着。';
    case 'bath':
      return '（它抖了抖。）你给我洗过澡。甩水那下是故意的。';
    case 'feed':
      return '（它张了张嘴。）你给过我好吃的。我记着是哪种。';
    case 'birth':
      return `我记住这个名字了：${pet.name}。第一天就记住了。`;
    default:
      return `（它想了一下。）${ago}前的那件事，我记得。`;
  }
}

export const FIRST_LINE = '（笼子里有动静。它侧过脸看你——先一只眼睛，然后转过来另一只。）';

export const NAME_QUESTION = '叽。（它歪着头，等你先开口。你叫它什么？）';

export function namedLine(name: string): string {
  return `（它歪头，把「${name}」这几个音学了一遍，没学会，但记住了。）`;
}

export function awayLine(): string {
  return '（笼子空着。门开了一条缝，栖木上还有一只温热的印子。）';
}

export function dawnLine(): string {
  return '（天刚亮，它开始叫了。一声接一声，整栋楼都听得见。）';
}

export function isDawn(now: number): boolean {
  const hour = new Date(now).getHours();
  return hour >= 5 && hour < 8;
}
