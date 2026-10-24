/**
 * 把每个品种的 normal 姿态导出成 json，给 rasterize.py 用。
 * 用法: node tools/emit-svg.cjs
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', '.tmp-ssr');
fs.writeFileSync(path.join(BUILD, 'package.json'), '{ "type": "commonjs" }');
const { birdSvg } = require(path.join(BUILD, 'pet', 'bird.js'));
const { SPECIES_LIST } = require(path.join(BUILD, 'pet', 'species.js'));

const out = {};
const POSES = ['normal', 'hungry', 'angry', 'happy', 'asleep', 'sick', 'wet', 'away'];
for (const sp of SPECIES_LIST) {
  for (const pose of POSES) {
    out[`${sp.id}/${pose}`] = birdSvg({ pose, species: sp.id, id: `${sp.id}-${pose}` });
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'bird-shapes.json'), JSON.stringify(out), 'utf8');
console.log('wrote bird-shapes.json:', Object.keys(out).length, 'shapes');
