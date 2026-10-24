/**
 * 跑一遍模型，看数值手感 / 升级曲线 / 解锁 / 训练 / 心愿。
 * 用法: npm run sim   （先 tsc 编译到 .tmp-ssr，再用 node 跑）
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', '.tmp-ssr');
if (!fs.existsSync(path.join(BUILD, 'pet', 'model.js'))) {
  console.error('先编译：npm run sim');
  process.exit(1);
}
fs.writeFileSync(path.join(BUILD, 'package.json'), '{ "type": "commonjs" }');

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const M = require(path.join(BUILD, 'pet', 'model.js'));
const S = require(path.join(BUILD, 'pet', 'skills.js'));

const t0 = new Date('2026-10-24T10:00:00+08:00').getTime();
const HOUR = M.HOUR;

const line = (label, pet) =>
  console.log(
    `${label.padEnd(10)} Lv.${String(pet.level).padEnd(2)} xp ${String(pet.xp).padStart(3)}/${M.xpForLevel(pet.level)} ` +
      `饱${pet.satiety.toFixed(0).padStart(3)} 渴${pet.thirst.toFixed(0).padStart(3)} 心${pet.mood.toFixed(0).padStart(3)} ` +
      `亲${pet.bond.toFixed(0).padStart(3)} 怨${pet.grudge.toFixed(0).padStart(3)} | ${M.statusWord(pet)}`,
  );

// ---- 1. 升级曲线 & 解锁 ----
let p = M.createPet('糖糖', t0);
let t = t0;
const total = Array.from({ length: S.MAX_LEVEL - 1 }, (_, i) => M.xpForLevel(i + 1)).reduce((a, b) => a + b, 0);
console.log(`Lv1→2 需要 ${M.xpForLevel(1)} xp；练满 Lv${S.MAX_LEVEL} 共需 ${total} xp`);
line('刚见面', p);

let i = 0;
let prevLevel = p.level;
while (p.level < S.MAX_LEVEL && i < 600) {
  t += 5 * 60_000;
  const out = M.interact(p, { type: 'pet' }, t);
  p = out.state;
  i += 1;
  if (p.level > prevLevel) {
    const keys = Object.entries(S.UNLOCK_LEVEL)
      .filter(([, lv]) => lv === p.level)
      .map(([k]) => S.UNLOCK_HINT[k]);
    console.log(`  第 ${i} 次摸头 → Lv.${p.level}${keys.length ? '，解锁：' + keys.join('、') : ''}`);
    prevLevel = p.level;
  }
}
line('练满', p);

// ---- 2. 训练 / 表演 ----
let tried = 0;
while (p.skills.length < S.SKILLS.length && tried < 80) {
  t += 10 * 60_000;
  const out = M.interact(p, { type: 'train' }, t);
  p = out.state;
  tried += 1;
  if (out.effect === 'train_ok') console.log(`  训练第 ${tried} 次 → 学会「${out.detail}」`);
}
console.log(`训练 ${tried} 次，学会 ${p.skills.length}/${S.SKILLS.length}：${p.skills.join(', ')}`);
const perf = M.interact(p, { type: 'perform' }, t);
console.log('  表演 →', perf.effect, '|', perf.detail);

// ---- 3. 口哨 ----
const w = M.interact(p, { type: 'whistle', notes: [0, 2, 3, 2] }, t);
console.log('  教口哨 →', w.effect, '| 记住:', w.state.whistle.join('-'));

// ---- 4. 每日心愿 ----
let e = M.createPet('二两', t0);
let et = t0;
for (let k = 0; k < 60 && e.level < 3; k += 1) {
  et += 5 * 60_000;
  e = M.interact(e, { type: 'pet' }, et).state;
}
et += 30 * HOUR;
e = M.advance(e, et).state;
console.log(`\nLv.${e.level} 当天心愿：${M.errandText(e.errand)}（${e.errand && e.errand.kind} ${e.errand && e.errand.got}/${e.errand && e.errand.need}）`);

let done = false;
for (let k = 0; k < 6 && !done; k += 1) {
  const kind = e.errand && e.errand.kind;
  const act =
    kind === 'feed' ? { type: 'feed', food: e.errand.food } :
    kind === 'play' ? { type: 'play' } :
    kind === 'touch' ? { type: 'pet' } :
    kind === 'bath' ? { type: 'bath' } :
    { type: 'cleanCage' };
  const out = M.interact(e, act, et);
  e = out.state;
  if (out.extraLine) {
    done = true;
    console.log('  心愿完成 →', out.extraLine);
  }
}
line('做完心愿', e);

// ---- 5. 解锁总表 ----
console.log('\n各玩法开放情况（满级时）:');
Object.keys(S.UNLOCK_LEVEL).forEach((k) => {
  console.log(`  ${S.UNLOCK_HINT[k].padEnd(6)} Lv.${S.UNLOCK_LEVEL[k]}  ${M.isUnlocked(p, k) ? '已开放' : '未开放'}`);
});

// ---- 6. 低等级时锁得住吗 ----
const fresh = M.createPet('小号', t0);
const locked = M.interact(fresh, { type: 'bath' }, t0);
console.log(`\nLv.1 想洗澡 → ${locked.effect}（应该是 locked，提示 Lv.${locked.detail}）`);

console.log('\n需求:', M.needsOf(p).join('、') || '（没什么急事）', '| 脸:', M.poseOf(p, t));

// ---- 7. 互动表体检 ----
const C = require(path.join(BUILD, 'pet', 'catalog.js'));
const D = require(path.join(BUILD, 'pet', 'dialogue.js'));
const items = C.ITEMS;
console.log('\n=== 互动表 ===');
console.log('互动总数:', items.length);
const byCat = {};
items.forEach((i) => { byCat[i.cat] = (byCat[i.cat] || 0) + 1; });
console.log('按分类:', Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join('  '));
const ids = items.map((i) => i.id);
const dup = ids.filter((id, idx) => ids.indexOf(id) !== idx);
console.log('重复 id:', dup.length ? dup.join(',') : '无');
console.log('缺台词:', items.filter((i) => !i.line || !i.line.trim()).length);

let probe = M.createPet('测试', t0);
probe.level = 8;
probe.skills = S.SKILLS.map((s) => s.id);
probe.energy = 100; probe.satiety = 50; probe.thirst = 50; probe.clean = 50; probe.mood = 50; probe.bond = 50;
const effects = {};
let emptyLine = 0;
const samples = [];
for (const it of items) {
  const out = M.interact(probe, { type: 'do', id: it.id }, t0);
  probe = out.state;
  effects[out.effect] = (effects[out.effect] || 0) + 1;
  const line = D.reactionLine(out.effect, out.state, undefined, out.detail);
  if (!line || !line.trim()) emptyLine += 1;
  else if (samples.length < 3) samples.push(`${it.label}: ${line}`);
}
console.log('全部跑一遍 → effect 分布:', JSON.stringify(effects));
console.log('空台词:', emptyLine);
samples.forEach((s) => console.log('  样例', s));
// ---- 8. 用新互动表完成心愿 ----
let g = M.createPet('gogo', t0);
g.level = 3;
g.errand = { kind: 'feed', food: 'worm', need: 1, got: 0 };
const gOut = M.interact(g, { type: 'do', id: 'food-worm' }, t0);
console.log('\n用互动表喂面包虫完成心愿 →', gOut.effect, '| extraLine:', gOut.extraLine);
console.log('心愿进度:', gOut.state.errand.got, '/', gOut.state.errand.need, '| 经验:', gOut.state.xp);

const wrong = M.interact(g, { type: 'do', id: 'food-apple' }, t0);
console.log('喂错东西（苹果）→', wrong.effect, '| 心愿进度:', wrong.state.errand.got, '/', wrong.state.errand.need);
// ---- 9. 一笼子鸟 ----
console.log('\n=== 鸟群 ===');
const SP = require(path.join(BUILD, 'pet', 'species.js'));
let f = { version: 4, activeId: '', birds: [] };
let first = M.createPet('糖糖', t0);
f = { version: 4, activeId: first.id, birds: [first] };
f = M.adoptBird(f, 'budgie-blue', '小蓝', t0);
f = M.adoptBird(f, 'cockatiel', '灰灰', t0);
f = M.adoptBird(f, 'sunconure', '亮亮', t0);
console.log('笼子里:', f.birds.map((b) => `${b.name}(${SP.speciesOf(b.species).short},Lv.${b.level})`).join('  '));
console.log('当前激活:', M.activeBird(f).name, '| 品种:', SP.speciesOf(M.activeBird(f).species).name);

// 各自过 20 小时，状态应该各算各的
const adv = M.advanceFlock({ ...f, birds: f.birds.map((b) => ({ ...b, satiety: 60, thirst: 60, clean: 50 })) }, t0 + 20 * HOUR);
console.log('20 小时后各自的饱食/清洁:');
adv.flock.birds.forEach((b) => console.log(`  ${b.name.padEnd(4)} 饱${b.satiety.toFixed(0)} 渴${b.thirst.toFixed(0)} 洁${b.clean.toFixed(0)} 怨${b.grudge.toFixed(0)}`));

// 摸一只，其他鸟吃醋
const before = f.birds.map((b) => b.grudge);
const jealous = M.nudgeOthers(f, f.activeId, { grudge: 2 });
const diffs = jealous.birds.map((b, i) => `${b.name}+${(b.grudge - before[i]).toFixed(0)}`);
console.log('摸当前这只 → 其他鸟怨气变化:', diffs.join(' '));

// 切换
const sw = M.switchBird(f, f.birds[2].id);
console.log('切到第三只 →', M.activeBird(sw).name, '| activeId 是否正确:', sw.activeId === f.birds[2].id);

// 各品种的画像差异
console.log('\n品种画像:');
SP.SPECIES_LIST.forEach((s) => {
  console.log(`  ${s.name.padEnd(9)} 冠羽${s.look.crest ? '有' : '无 '} 尾×${(s.look.tailScale ?? 1).toFixed(1)} 喙×${(s.look.beakScale ?? 1).toFixed(2)} 怨气×${s.traits.grudge} 训练+${s.traits.train}`);
});
// ---- 10. 动作层覆盖 ----
console.log('\n=== 动作层 ===');
const MO = require(path.join(BUILD, 'pet', 'motion.js'));
const motionIds = new Set(C.ITEMS.map((i) => i.id));
const counts = {};
let missing = 0;
for (const it of C.ITEMS) {
  const m = MO.motionOfItem(it);
  if (!m) missing += 1;
  counts[m] = (counts[m] || 0) + 1;
}
console.log('114 条互动的动作分布:', Object.entries(counts).map(([k, v]) => `${MO.MOTION_LABEL[k] || k}:${v}`).join('  '));
console.log('没有动作的:', missing);
console.log('动作总数（去重）:', Object.keys(counts).length, '/', Object.keys(MO.MOTION_LABEL).length);