/**
 * 生成 bird-preview.html：每个品种 × 几种姿态一张卡片。
 * 用法: npm run bird   （先 tsc 编译到 .tmp-ssr）
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', '.tmp-ssr');
if (!fs.existsSync(path.join(BUILD, 'pet', 'bird.js'))) {
  console.error('先编译：npm run bird');
  process.exit(1);
}
fs.writeFileSync(path.join(BUILD, 'package.json'), '{ "type": "commonjs" }');

const { birdSvg, birdCss } = require(path.join(BUILD, 'pet', 'bird.js'));
const { SPECIES_LIST } = require(path.join(BUILD, 'pet', 'species.js'));

const POSES = ['normal', 'happy', 'angry', 'hungry', 'asleep', 'sick', 'wet', 'away'];

const rows = SPECIES_LIST.map((sp) => {
  const cards = POSES.map(
    (pose) => `
      <figure>
        <div class="art">${birdSvg({ pose, species: sp.id, id: `${sp.id}-${pose}` })}</div>
        <figcaption>${pose}</figcaption>
      </figure>`,
  ).join('');
  return `
    <section>
      <h2>${sp.name} <span>${sp.traits.note}</span></h2>
      <div class="grid">${cards}</div>
    </section>`;
}).join('');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>bird preview</title>
<style>
  body { margin: 0; padding: 22px; background: #f6efe6; font-family: "Microsoft YaHei", sans-serif; }
  h2 { font-size: 15px; font-weight: 600; color: #5b4a44; margin: 18px 0 8px; }
  h2 span { font-weight: 400; font-size: 12px; color: #9c8b83; margin-left: 8px; }
  section { max-width: 1080px; margin: 0 auto 10px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  figure { margin: 0; background: radial-gradient(70% 70% at 50% 40%, #fffcf6, #f3e9db);
           border: 1px solid rgba(122,100,82,0.18); border-radius: 16px; padding: 8px; }
  .art { height: 190px; }
  figcaption { text-align: center; font-size: 11px; color: #7d6e69; letter-spacing: 0.08em; }
${birdCss()}
</style>
</head>
<body>${rows}</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'bird-preview.html'), html, 'utf8');
console.log('wrote bird-preview.html:', SPECIES_LIST.length, '品种 ×', POSES.length, '姿态');
