/**
 * 不用浏览器，把真实界面渲染成 HTML，检查它到底能不能跑起来。
 *
 *   npm run check        （等价于 tsc -p tsconfig.ssr.json && node tools/ssr-check.cjs）
 *
 * 会做两件事：
 *   1. 有存档时：主界面能不能渲染出来（鸟、名字、记事本、按钮…）
 *   2. 没存档时：起名页能不能渲染，默认名有没有填好
 */
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToString } = require('react-dom/server');

const BUILD = path.join(__dirname, '..', '.tmp-ssr');
const APP = path.join(BUILD, 'App.js');

if (!fs.existsSync(APP)) {
  console.error('先编译：npm run check');
  process.exit(1);
}
// 项目 package.json 是 "type": "module"，编译产物是 CommonJS，需要单独标记
fs.writeFileSync(path.join(BUILD, 'package.json'), '{ "type": "commonjs" }');

function makeStore(seed) {
  const data = { ...seed };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

function render(store) {
  global.localStorage = store;
  global.window = {
    location: { search: '?debug' },
    localStorage: store,
    devicePixelRatio: 1,
  };
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  delete require.cache[require.resolve(APP)];
  const App = require(APP).default;
  return renderToString(React.createElement(App));
}

const now = Date.now();
const savedPet = {
  version: 2,
  name: '糖糖',
  bornAt: now - 86400000,
  lastTick: now - 86400000,
  lastVisitAt: now - 86400000,
  visits: 3,
  satiety: 22,
  thirst: 18,
  energy: 70,
  mood: 61,
  bond: 34,
  grudge: 8,
  clean: 55,
  health: 88,
  sick: false,
  asleep: false,
  free: false,
  wetUntil: 0,
  lastMeal: null,
  sameMealCount: 0,
  lastEventAt: now - 86400000,
  memories: [
    { id: 'm1', at: now - 86400000, kind: 'birth', text: '我记住这个名字了：糖糖。', weight: 2 },
    { id: 'm2', at: now - 3600000, kind: 'scold', text: '你冲我发了火。', weight: 3 },
    { id: 'm3', at: now - 7200000, kind: 'event', text: '它发现了一个纸箱，撕了一下午。', weight: 1 },
  ],
  lastLine: '',
  totalScolds: 1,
  totalTouches: 4,
  level: 4,
  xp: 20,
  skills: ['nod'],
  errand: { kind: 'play', need: 3, got: 1 },
  errandDay: '2026-10-24',
  whistle: [0, 2],
};

let failures = 0;
function check(label, ok) {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}

// ---- 场景 1：有存档，主界面 ----
const live = render(makeStore({ 'grouchy-pet.v1': JSON.stringify(savedPet) }));
console.log(`[主界面] ${live.length} chars`);
check('鸟的 SVG 挂上了', live.includes('bird-svg'));
check('名字是糖糖', live.includes('糖糖'));
check('品种行', live.includes('黄桃牡丹鹦鹉'));
check('记事本面板', live.includes('它写的东西'));
check('记得住那件事', live.includes('你冲我发了火'));
check('随机事件也在', live.includes('纸箱'));
check('常用栏', live.includes('洗澡') && live.includes('盖布睡觉') && live.includes('放它出来') && live.includes('看它表演'));
check('四种食物', ['瓜子', '苹果', '玉米', '面包虫'].every((f) => live.includes(f)));
check('常用互动', live.includes('凶它') && live.includes('道歉') && live.includes('问它记不记得'));
check('需求提示', live.includes('need'));
check('好感等级', live.includes('眼熟') || live.includes('认得你') || live.includes('还不熟'));
check('等级徽章', live.includes('level-badge'));
check('经验条', live.includes('xp-fill'));
check('今日心愿', live.includes('今天的心愿') && live.includes('陪它玩'));
check('会做的事', live.includes('会做的事') && live.includes('点头'));
check('未解锁的玩法带锁', live.includes('Lv.5'));
check('分类页签', (live.match(/class="tab/g) || []).length >= 8);
check('互动面板', live.includes('class="picker"') && live.includes('瓜子'));
check('互动表里有新增的', live.includes('西兰花') && live.includes('西瓜') && live.includes('纸箱'));
check('状态文案', live.includes('pet-status'));
check('时间机器(?debug)', live.includes('时间机器'));
check('姿态 class', live.includes('b-pose-'));
check('没有 undefined/NaN', !/undefined|NaN|\[object Object\]/.test(live));

// ---- 场景 2：没存档，起名页 ----
const naming = render(makeStore({}));
console.log(`[起名页] ${naming.length} chars`);
check('起名页渲染', naming.includes('onboard-card'));
check('默认名已填糖糖', naming.includes('value="糖糖"'));
check('没有 undefined/NaN', !/undefined|NaN|\[object Object\]/.test(naming));

console.log(failures === 0 ? '\nALL OK' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
