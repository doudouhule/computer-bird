import { speciesOf, type Look, type SpeciesId } from './species';

export type Pose = 'normal' | 'angry' | 'hungry' | 'happy' | 'asleep' | 'away' | 'sick' | 'wet';

export interface BirdOptions {
  pose?: Pose;
  id?: string;
  species?: SpeciesId;
  /** 动作层：互动时做的小动作 */
  motion?: string;
}

/** 树枝、叶子这些跟品种无关的固定颜色 */
const SCENE = {
  bodyEdge: '#BE8526',
  claw: '#9E6A61',
  wood: '#B9855A',
  woodLight: '#CE9B6C',
  woodDark: '#8A5F3D',
  leaf: '#8FA65A',
  leafDark: '#6F8A44',
  pupil: '#2B1512',
  ring: '#FBF7EC',
};

/** 横枝，两个画面共用 */
const BRANCH = 'M24 344 Q120 332 200 334 Q290 336 376 348 L376 366 Q286 352 200 352 Q116 350 24 362 Z';

/**
 * 身体：横着长的蛋形（宽 148 × 高 126），胸在前下方凸出，
 * 背线从肩往臀部斜下去，腹线收进尾基。不是一根竖柱子。
 */
const BODY =
  'M200 176 C236 178 268 202 282 232 C292 258 288 282 272 292 C250 302 220 300 196 290 C166 280 144 254 144 226 C144 196 164 176 200 176 Z';

/** 头的整体缩放：原尺寸是给 92px 画的，缩到脖子处，让头只占身体的一半宽 */
const HEAD_SCALE = 0.85;
const HEAD_PIVOT = `translate(196 196) scale(${HEAD_SCALE}) translate(-196 -196)`;

/**
 * 头：不是正圆——额头在喙根那里压平，后脑圆，下颌有一道转折，
 * 颈后顺着背线接下去。宽 92 × 高 96。
 */
const HEAD =
  'M168 110 C196 110 214 128 216 152 C218 176 204 198 182 202 C160 206 140 194 132 176 C126 162 128 138 140 124 C148 114 158 110 168 110 Z';

function halo(): string {
  return `<ellipse cx="222" cy="226" rx="128" ry="106" fill="url(#bHaloGrad)"/>`;
}

function branch(look: Look): string {
  return `
    <path d="${BRANCH}" fill="url(#bWoodGrad)"/>
    <path d="M52 350 Q140 339 214 342" stroke="${SCENE.woodDark}" stroke-width="1.8" fill="none" opacity="0.45"/>
    <path d="M240 341 Q300 343 350 352" stroke="${SCENE.woodDark}" stroke-width="1.6" fill="none" opacity="0.35"/>
    <path d="M92 356 Q130 349 168 349" stroke="${SCENE.woodLight}" stroke-width="2.2" fill="none" opacity="0.35"/>
    <ellipse cx="320" cy="341" rx="9" ry="6" fill="${SCENE.woodDark}" opacity="0.3"/>
    <g class="b-leaf">
      <path d="M97 350 C88 358 80 368 74 378" stroke="${SCENE.leafDark}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="66" cy="384" rx="15" ry="7.5" transform="rotate(-38 66 384)" fill="${SCENE.leaf}"/>
      <path d="M78 376 C70 380 62 383 55 385" stroke="${SCENE.leafDark}" stroke-width="1.2" fill="none" opacity="0.55" stroke-linecap="round"/>
    </g>`;
}

function contactShadow(): string {
  return `<ellipse cx="227" cy="348" rx="34" ry="5.5" fill="rgba(92,66,40,0.26)"/>`;
}

function feet(look: Look): string {
  const toe = (x: number) => `
    <path d="M${x} 284 L${x - 2} 338" stroke="${look.feet}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M${x - 4} 294 L${x} 298" stroke="${look.feetDark}" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>
    <path d="M${x - 5} 308 L${x - 1} 312" stroke="${look.feetDark}" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>
    <path d="M${x - 5} 322 L${x - 1} 326" stroke="${look.feetDark}" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>
    <path d="M${x - 2} 338 Q${x - 15} 343 ${x - 15} 346" stroke="${look.feetDark}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
    <path d="M${x - 2} 338 Q${x + 2} 344 ${x + 2} 349" stroke="${look.feetDark}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
    <path d="M${x - 2} 338 Q${x + 15} 343 ${x + 15} 346" stroke="${look.feetDark}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
    <circle cx="${x - 15}" cy="346" r="2" fill="${SCENE.claw}"/>
    <circle cx="${x + 2}" cy="349" r="2" fill="${SCENE.claw}"/>
    <circle cx="${x + 15}" cy="346" r="2" fill="${SCENE.claw}"/>`;
  return `<g class="b-feet">${toe(214)}${toe(240)}</g>`;
}

/** 尾巴：短、收尖，从臀部往后下方甩出去 */
function tail(look: Look): string {
  const blade = (dy: number, dx: number, fill: string) => `
    <path d="M276 ${272 + dy} C300 ${282 + dy} 320 ${294 + dy} ${332 + dx} ${304 + dy}
             C327 ${314 + dy} 310 ${313 + dy} 288 ${301 + dy}
             C278 ${294 + dy} 270 ${282 + dy} 276 ${272 + dy} Z"
      fill="${fill}" stroke="${look.tailDark}" stroke-width="1.3" stroke-linejoin="round"/>`;
  return `
    <g class="b-tail">
      ${blade(-6, 0, look.tail)}
      ${blade(0, 4, look.tailDark)}
      ${blade(6, 0, look.tail)}
      <path d="M286 278 C308 288 322 296 330 302" stroke="${look.tailDark}" stroke-width="1.1" fill="none" opacity="0.45"/>
      <path d="M282 290 C304 298 316 304 324 308" stroke="${look.tailDark}" stroke-width="1.1" fill="none" opacity="0.3"/>
    </g>`;
}

function bodyShading(pose: Pose, look: Look): string {
  const ruffled = pose === 'angry';
  return `
    <path d="${BODY}" fill="url(#bBodyGrad)"/>
    <path d="${BODY}" fill="url(#bBodyShade)"/>
    <path d="${BODY}" fill="none" stroke="rgba(150,105,40,0.34)" stroke-width="1.7"/>
    <path d="M166 202 C156 226 154 256 162 278" stroke="rgba(255,255,255,0.6)" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.24"/>
    <path d="M178 238 Q192 250 206 245" stroke="${look.bodyDark}" stroke-width="1.5" fill="none" opacity="0.28"/>
    <path d="M183 254 Q197 266 211 261" stroke="${look.bodyDark}" stroke-width="1.5" fill="none" opacity="0.22"/>
    <path d="M188 270 Q202 280 216 275" stroke="${look.bodyDark}" stroke-width="1.5" fill="none" opacity="0.16"/>
    <path d="M214 186 C240 196 258 216 266 240" stroke="rgba(255,255,255,0.45)" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.22"/>
    ${ruffled ? `
      <path d="M206 184 L216 162 L226 186 Z" fill="${look.body}" stroke="${SCENE.bodyEdge}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M232 190 L248 172 L250 194 Z" fill="${look.body}" stroke="${SCENE.bodyEdge}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M254 200 L268 184 L270 204 Z" fill="${look.body}" stroke="${SCENE.bodyEdge}" stroke-width="1.4" stroke-linejoin="round"/>` : ''}`;
}

function wing(look: Look): string {
  return `
    <g class="b-wing">
      <path d="M238 196 C264 214 278 246 270 280 C266 294 246 292 238 280 C250 258 252 218 234 200 Z"
        fill="url(#bWingGrad)" stroke="${look.wingDark}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M242 214 C255 233 257 258 251 276" stroke="${look.wingDark}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <path d="M250 226 C260 243 262 261 257 275" stroke="${look.wingDark}" stroke-width="1.4" fill="none" opacity="0.38"/>
      <path d="M257 240 C265 253 266 265 262 274" stroke="${look.wingDark}" stroke-width="1.4" fill="none" opacity="0.28"/>
      <path d="M237 202 C253 214 257 234 255 250" stroke="rgba(255,255,255,0.5)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.42"/>
    </g>`;
}

function eye(pose: Pose, look: Look): string {
  if (pose === 'happy') {
    return `
      <g class="b-eye">
        <path d="M143 146 Q156 131 169 146" stroke="${look.iris}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M148 152 Q157 157 166 152" stroke="${look.faceDeep}" stroke-width="1.7" fill="none" stroke-linecap="round" opacity="0.45"/>
      </g>`;
  }

  const dull = pose === 'hungry' || pose === 'sick' || pose === 'wet';
  const shine = dull
    ? `<circle cx="153.5" cy="142" r="2" fill="#FFFFFF" opacity="0.2"/>`
    : `<circle cx="152.5" cy="139" r="3.2" fill="#FFFFFF" opacity="0.92"/>
       <circle cx="160" cy="148" r="1.5" fill="#FFFFFF" opacity="0.5"/>`;

  const lid = `<rect class="b-lid" x="141" y="129" width="30" height="30" fill="${look.face}"/>`;
  const closedArc = `<path d="M144 141 Q156 151 168 141" stroke="${SCENE.pupil}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  const sag = dull
    ? `<path d="M141 136 Q156 129 171 137" stroke="${look.faceDeep}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.38"/>`
    : '';

  return `
    <g class="b-eye">
      <circle cx="156" cy="144" r="13.6" fill="${SCENE.ring}"/>
      <circle cx="156" cy="144" r="13.6" fill="none" stroke="rgba(120,86,70,0.2)" stroke-width="1.1"/>
      <circle cx="156" cy="144" r="8.6" fill="${dull ? look.irisDull : look.iris}"/>
      <circle cx="156" cy="144" r="4.9" fill="${SCENE.pupil}"/>
      ${shine}
      ${sag}
      <path d="M143 137 Q156 128 170 139" stroke="${look.iris}" stroke-width="1.9" fill="none" opacity="0.4" stroke-linecap="round"/>
      ${lid}
      ${pose === 'asleep' ? closedArc : ''}
    </g>`;
}

/**
 * 喙：细长的尖钩。基部 16px 高，一路收到针尖，只有生气时才微微张开。
 * 饿了不张嘴——张不对的样子比不张更糟。
 */
function beak(pose: Pose, look: Look): string {
  const up = pose === 'angry' ? -6 : 0;
  const low = pose === 'angry' ? 9 : 0;
  return `
    <g class="b-beak">
     <g transform="translate(128 150) scale(${0.82 * (look.beakScale ?? 1)}) translate(-128 -150)">
      ${pose === 'angry' ? `<path d="M127 152 C112 158 97 164 87 170 C97 174 111 170 122 162 Z" fill="#6E3B34" opacity="0.9"/>` : ''}
      <g transform="rotate(${low} 127 156)">
        <path d="M130 146 C114 152 98 155 88 155 C85 162 89 171 97 172 C113 172 130 166 130 146 Z"
          fill="${look.beakDark}" stroke="${look.beakEdge}" stroke-width="0.8" stroke-linejoin="round"/>
        <path d="M119 160 C111 163 103 166 97 168" stroke="rgba(255,255,255,0.22)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="rotate(${up} 127 156)">
        <path d="M133 134 C118 136 100 141 88 148 C84 152 84 158 88 159 C100 158 112 156 122 152 C127 149 131 141 133 134 Z"
          fill="url(#bBeakGrad)" stroke="${look.beakEdge}" stroke-width="0.9" stroke-linejoin="miter" stroke-miterlimit="4"/>
        <path d="M125 140 C112 143 100 147 92 152" stroke="rgba(255,255,255,0.7)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.45"/>
        <path d="M126 152 C113 156 100 161 92 166" stroke="${look.beakEdge}" stroke-width="0.7" fill="none" opacity="0.45"/>
        <ellipse cx="126" cy="135" rx="8.5" ry="5.4" transform="rotate(-14 126 135)"
          fill="${look.beakLight}" stroke="${look.beakEdge}" stroke-width="0.9" opacity="0.9"/>
        <ellipse cx="123" cy="134" rx="1.6" ry="2" fill="${look.beakEdge}" opacity="0.55"/>
        <path d="M87 149 C90 152 90 156 88 158" stroke="${look.beakEdge}" stroke-width="0.7" fill="none" opacity="0.5"/>
      </g>
     </g>
    </g>`;
}

/** 玄凤的冠羽：从头顶往上收的几根羽毛，高度由 look.crest 控制 */
function crest(look: Look): string {
  const s = look.crest ?? 0;
  if (s <= 0) return '';
  return `
    <g class="b-crest">
      <path d="M168 112 C170 ${112 - 30 * s} 176 ${112 - 52 * s} 186 ${112 - 62 * s} C182 ${112 - 44 * s} 180 ${112 - 26 * s} 178 112 Z"
        fill="${look.wing}" stroke="${look.wingDark}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M176 113 C180 ${113 - 26 * s} 188 ${113 - 44 * s} 198 ${113 - 52 * s} C192 ${113 - 36 * s} 188 ${113 - 22 * s} 186 113 Z"
        fill="${look.bodyMid}" stroke="${look.wingDark}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M160 114 C160 ${114 - 24 * s} 164 ${114 - 42 * s} 170 ${114 - 52 * s} C166 ${114 - 34 * s} 164 ${114 - 20 * s} 164 114 Z"
        fill="${look.wing}" stroke="${look.wingDark}" stroke-width="1.1" stroke-linejoin="round"/>
    </g>`;
}

function head(pose: Pose, uid: string, look: Look): string {
  return `
    <g class="b-head">
      <path d="${HEAD}" fill="url(#bHeadGrad)"/>
      ${crest(look)}
      <g clip-path="url(#${uid}-headclip)">
        <ellipse cx="154" cy="160" rx="34" ry="40" transform="rotate(-6 154 160)" fill="url(#bFaceGrad)"/>
        ${look.cheek ? `<circle cx="150" cy="176" r="8.5" fill="${look.cheek}" opacity="0.85"/>` : ''}
        ${look.bars
          ? [0, 1, 2, 3]
              .map(
                (i) =>
                  `<path d="M${132 + i * 2} ${112 + i * 9} Q${158} ${104 + i * 9} ${186 + i * 1} ${114 + i * 9}" stroke="${look.bars}" stroke-width="1.9" fill="none" opacity="0.32"/>`,
              )
              .join('')
          : ''}
        <path d="M188 122 C196 146 196 180 186 198" stroke="${look.faceDeep}" stroke-width="2" fill="none" opacity="0.28"/>
        <ellipse cx="142" cy="126" rx="30" ry="16" transform="rotate(-12 142 126)" fill="${look.crown}" opacity="0.5"/>
        <ellipse cx="138" cy="123" rx="20" ry="10" transform="rotate(-14 138 123)" fill="${look.crown}" opacity="0.36"/>
        <ellipse cx="152" cy="178" rx="17" ry="9" transform="rotate(-8 152 178)" fill="${look.faceDeep}" opacity="0.18"/>
        <path d="M136 188 Q150 196 164 190" stroke="${look.faceDeep}" stroke-width="1.4" fill="none" opacity="0.18"/>
        ${eye(pose, look)}
      </g>
      ${beak(pose, look)}
    </g>`;
}

/** 它飞出去的时候：空的栖木、空的食盆、一根掉下来的羽毛 */
function emptyScene(look: Look): string {
  return `
    <g class="b-empty">
      <path d="M276 330 C276 343 306 343 306 330 Z" fill="#DCD3C7" stroke="#B9AC9C" stroke-width="1.3"/>
      <ellipse cx="291" cy="330" rx="15" ry="4.2" fill="#B3A695"/>
      <ellipse cx="291" cy="329.5" rx="10" ry="2.4" fill="#8E8274" opacity="0.55"/>
      <ellipse cx="282" cy="336" rx="2" ry="1.4" fill="#C4B39C" opacity="0.7"/>
      <ellipse cx="299" cy="337" rx="1.7" ry="1.2" fill="#C4B39C" opacity="0.7"/>
      <g class="b-float-feather">
        <path d="M196 224 C208 214 222 218 224 230 C214 240 200 238 196 224 Z" fill="${look.body}"/>
        <path d="M198 227 L218 230" stroke="${look.bodyDark}" stroke-width="1.5" opacity="0.65"/>
        <path d="M200 224 L216 228" stroke="${look.bodyDark}" stroke-width="1" opacity="0.35"/>
      </g>
    </g>`;
}

function defs(uid: string, look: Look): string {
  return `
  <defs>
    <radialGradient id="bHaloGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,252,240,0.34)"/>
      <stop offset="65%" stop-color="rgba(255,248,232,0.1)"/>
      <stop offset="100%" stop-color="rgba(255,248,232,0)"/>
    </radialGradient>
    <radialGradient id="bBodyGrad" cx="26%" cy="24%" r="86%">
      <stop offset="0%" stop-color="${look.bodyLight}"/>
      <stop offset="42%" stop-color="${look.body}"/>
      <stop offset="78%" stop-color="${look.bodyMid}"/>
      <stop offset="100%" stop-color="${look.bodyDark}"/>
    </radialGradient>
    <linearGradient id="bBodyShade" x1="10%" y1="6%" x2="90%" y2="98%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="55%" stop-color="rgba(160,110,40,0)"/>
      <stop offset="100%" stop-color="rgba(140,90,30,0.26)"/>
    </linearGradient>
    <radialGradient id="bHeadGrad" cx="30%" cy="22%" r="88%">
      <stop offset="0%" stop-color="#FEF0BE"/>
      <stop offset="52%" stop-color="${look.body}"/>
      <stop offset="86%" stop-color="${look.bodyMid}"/>
      <stop offset="100%" stop-color="${look.bodyDark}"/>
    </radialGradient>
    <radialGradient id="bFaceGrad" cx="38%" cy="34%" r="78%">
      <stop offset="0%" stop-color="${look.faceLight}"/>
      <stop offset="62%" stop-color="${look.face}"/>
      <stop offset="100%" stop-color="${look.faceDeep}"/>
    </radialGradient>
    <linearGradient id="bWingGrad" x1="20%" y1="6%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#F7D06B"/>
      <stop offset="55%" stop-color="${look.wing}"/>
      <stop offset="100%" stop-color="${look.wingDark}"/>
    </linearGradient>
    <linearGradient id="bBeakGrad" x1="8%" y1="10%" x2="80%" y2="95%">
      <stop offset="0%" stop-color="${look.beakLight}"/>
      <stop offset="55%" stop-color="${look.beak}"/>
      <stop offset="100%" stop-color="${look.beakDark}"/>
    </linearGradient>
    <linearGradient id="bWoodGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SCENE.woodLight}"/>
      <stop offset="45%" stop-color="${SCENE.wood}"/>
      <stop offset="100%" stop-color="${SCENE.woodDark}"/>
    </linearGradient>
    <clipPath id="${uid}-headclip"><path d="${HEAD}"/></clipPath>
  </defs>`;
}

/**
 * 黄桃牡丹鹦鹉（公）。侧身站在横枝上，面向左。
 * 体态：横长的蛋身子、短尖尾、细长尖喙。
 */
export function birdSvg(options: BirdOptions = {}): string {
  const pose = options.pose ?? 'normal';
  const uid = options.id ?? 'b';
  const species = speciesOf(options.species ?? 'lovebird-lutino');
  const motionClass = options.motion ? ` b-motion-${options.motion}` : '';
  const look = species.look;

  if (pose === 'away') {
    return `
<svg viewBox="0 0 400 400" class="bird-svg b-pose-away${motionClass}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="空了的栖木">
  ${defs(uid, look)}
  <g class="b-root">
    ${halo()}
    <g transform="translate(276 272) scale(${look.tailScale ?? 1}) translate(-276 -272)">${tail(look)}</g>
    ${branch(look)}
    ${emptyScene(look)}
  </g>
</svg>`;
  }

  return `
<svg viewBox="0 0 400 400" class="bird-svg b-pose-${pose}${motionClass}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="黄桃牡丹鹦鹉">
  ${defs(uid, look)}
  <g class="b-root">
    ${halo()}
    ${branch(look)}
    ${contactShadow()}
    ${feet(look)}
    <g class="b-bodywrap">
      <g class="b-body">
        ${bodyShading(pose, look)}
      </g>
      ${wing(look)}
    </g>
    <ellipse cx="198" cy="194" rx="28" ry="12" fill="rgba(150,105,40,0.14)"/>
    <g transform="${HEAD_PIVOT}">
      ${head(pose, uid, look)}
    </g>
  </g>
</svg>`;
}

/** 鸟身上的动画。React 和静态预览都往里注入这份。 */
export function birdCss(): string {
  return `
.bird-svg { width: 100%; height: 100%; display: block; overflow: visible; }

.b-bodywrap, .b-body, .b-head, .b-tail, .b-wing, .b-beak, .b-lid, .b-leaf {
  transform-box: fill-box;
}

.b-bodywrap { transform-origin: 50% 80%; animation: b-breathe 4.6s ease-in-out infinite; }
.b-body { transform-origin: 50% 62%; }
.b-head { transform-origin: 78% 96%; animation: b-bob 4.2s ease-in-out infinite; }
.b-tail { transform-origin: 8% 40%; animation: b-tailflick 3.4s ease-in-out infinite; }
.b-leaf { transform-origin: 6% 4%; animation: b-leafsway 5.2s ease-in-out infinite; }
.b-lid { transform-origin: 50% 0%; animation: b-blink 7.4s ease-in-out infinite; }
.b-crest { transform-origin: 50% 100%; animation: b-crest 5.6s ease-in-out infinite; }
@keyframes b-crest {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-2.5deg); }
}

@keyframes b-breathe {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.014, 1.026); }
}

@keyframes b-bob {
  0%, 100% { transform: rotate(0deg); }
  35% { transform: rotate(-2.2deg) translate(0, -1px); }
  70% { transform: rotate(1.4deg) translate(0, 1px); }
}

@keyframes b-tailflick {
  0%, 88%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(4.5deg); }
  96% { transform: rotate(-1.5deg); }
}

@keyframes b-leafsway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3.5deg); }
}

@keyframes b-blink {
  0%, 90%, 100% { transform: scaleY(0); }
  91.5% { transform: scaleY(1); }
  93% { transform: scaleY(0); }
  94.5% { transform: scaleY(1); }
  96% { transform: scaleY(0); }
}

.b-pose-angry .b-bodywrap { animation-duration: 1.5s; }
.b-pose-angry .b-head { animation: b-jitter 0.35s steps(2) infinite; }
.b-pose-angry .b-lid { animation: none; transform: scaleY(0.42); }

@keyframes b-jitter {
  0% { transform: rotate(-1.4deg); }
  100% { transform: rotate(1.4deg); }
}

/* 饿了：只仰头盯着，不张嘴 */
.b-pose-hungry .b-head { animation: b-beg 1.1s ease-in-out infinite; }
.b-pose-hungry .b-lid { animation: none; transform: scaleY(0.24); }

@keyframes b-beg {
  0%, 100% { transform: rotate(-6deg) translateY(-2px); }
  50% { transform: rotate(-9deg) translateY(-4px); }
}

/* 公鸟的点头求偶舞 */
.b-pose-happy .b-head { animation: b-nod 1.6s ease-in-out infinite; }
@keyframes b-nod {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-3deg) translateY(-5px); }
  60% { transform: rotate(4deg) translateY(4px); }
}

.b-pose-asleep .b-lid { animation: none; transform: scaleY(1); }
.b-pose-asleep .b-bodywrap { animation-duration: 6.5s; }
.b-pose-asleep .b-head { animation: none; transform: rotate(6deg); }

/* 病了：整只鸟发灰、头耷拉着、呼吸变慢 */
.b-pose-sick { filter: saturate(0.62) brightness(0.97); }
.b-pose-sick .b-lid { animation: none; transform: scaleY(0.42); }
.b-pose-sick .b-head { animation: none; transform: rotate(9deg) translateY(3px); }
.b-pose-sick .b-bodywrap { animation-duration: 7.4s; }
.b-pose-sick .b-tail { animation: none; }

/* 湿身：羽毛贴身、抖水 */
.b-pose-wet { filter: saturate(0.85) brightness(0.92); }
.b-pose-wet .b-lid { animation: none; transform: scaleY(0.34); }
.b-pose-wet .b-head { animation: b-shiver 0.55s ease-in-out infinite; }
@keyframes b-shiver {
  0%, 100% { transform: rotate(-1.2deg); }
  50% { transform: rotate(1.4deg) translateY(0.5px); }
}

.b-float-feather { animation: b-drift 9s ease-in-out infinite; }
@keyframes b-drift {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0.65; }
  50% { transform: translate(-16px, 34px) rotate(-24deg); opacity: 0.95; }
  100% { transform: translate(-6px, 68px) rotate(-8deg); opacity: 0; }
}
`;
}
