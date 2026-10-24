const path = require('path');
const BUILD = path.join(__dirname, '..', '.tmp-ssr');
const fs = require('fs');
fs.writeFileSync(path.join(BUILD, 'package.json'), '{ "type": "commonjs" }');

// 模拟用户当前的存档：上一版的 version 2，没有 level/skills/errand/whistle
const v2 = {
  version: 2, name: '糖糖', bornAt: Date.now() - 200000, lastTick: Date.now() - 3600000,
  lastVisitAt: Date.now() - 3600000, visits: 5, satiety: 40, thirst: 30, energy: 70,
  mood: 61, bond: 33, grudge: 12, clean: 50, health: 90, sick: false, asleep: false,
  free: false, away: false, wetUntil: 0, lastMeal: 'seed', sameMealCount: 2,
  lastEventAt: Date.now() - 7200000, lastLine: '',
  memories: [{ id: 'a', at: Date.now() - 86400000, kind: 'birth', text: '我记住这个名字了：糖糖。', weight: 2 }],
  totalScolds: 1, totalTouches: 3,
};
global.localStorage = { getItem: () => JSON.stringify(v2), setItem() {}, removeItem() {} };
const M = require(path.join(BUILD, 'pet', 'model.js'));
const pet = M.loadPet();
console.log('迁移后 version:', pet.version, '| level:', pet.level, '| xp:', pet.xp);
console.log('skills:', Array.isArray(pet.skills) ? `[] (${pet.skills.length})` : 'NOT ARRAY');
console.log('whistle:', Array.isArray(pet.whistle) ? `[] (${pet.whistle.length})` : 'NOT ARRAY');
console.log('errand:', pet.errand, '| errandDay:', JSON.stringify(pet.errandDay));
console.log('保留原名/亲密度/记忆:', pet.name, pet.bond, pet.memories.length);
console.log('needsOf 不崩:', JSON.stringify(M.needsOf(pet)));
console.log('poseOf 不崩:', M.poseOf(pet, Date.now()));
