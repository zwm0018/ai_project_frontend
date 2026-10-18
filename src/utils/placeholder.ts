/* ============================================================
   占位画面配方（暗房系：银盐底片 / 接触印样）
   不是随机噪声：按提示词与 seed 选择场景（光幕 / 山野 / 城市 /
   光静物 / 水墨），同一 seed 永远得到同一张图，任务卡与灯箱一致。
   人物一律不画：人像类提示词落到“光幕”抽象布光，避免 SVG 人形。
   全部为矢量 SVG（data URI），无外部请求、无位图解码开销。
   ============================================================ */

type Scene = 'landscape' | 'veil' | 'study' | 'ink' | 'abstract'

interface Palette {
  sky: [string, string]
  glow: string
  glowSoft: string
  ridges: string[]
  accent: string
  night?: boolean
}

const PALETTES: Record<string, Palette> = {
  dusk: {
    sky: ['#2B1520', '#0A0710'],
    glow: '#FF8F6B', glowSoft: 'rgba(255,120,90,.34)',
    ridges: ['#3E2028', '#2A1520', '#190C14', '#0B0609'],
    accent: '#FFC59E',
  },
  night: {
    sky: ['#081416', '#030809'],
    glow: '#9FE8DC', glowSoft: 'rgba(130,225,210,.28)',
    ridges: ['#14302F', '#0D2322', '#091818', '#040B0B'],
    accent: '#8FC7FF', night: true,
  },
  neon: {
    sky: ['#1C0A18', '#06060C'],
    glow: '#FF6F9E', glowSoft: 'rgba(255,90,150,.34)',
    ridges: ['#301028', '#210B1D', '#150814', '#08060B'],
    accent: '#7FFFD8',
  },
  mist: {
    sky: ['#0E1A1A', '#050909'],
    glow: '#D6F2EA', glowSoft: 'rgba(170,235,220,.24)',
    ridges: ['#223E3A', '#172D2A', '#0E1F1D', '#050D0C'],
    accent: '#9FE4D4',
  },
  ink: {
    sky: ['#111111', '#080808'],
    glow: '#E8E4DC', glowSoft: 'rgba(220,215,205,.2)',
    ridges: ['#333333', '#242424', '#181818', '#0B0B0B'],
    accent: '#D6D0C4',
  },
  studio: {
    sky: ['#171717', '#0A0A0A'],
    glow: '#A8D4FF', glowSoft: 'rgba(140,200,255,.3)',
    ridges: ['#2E2A27', '#201D1B', '#151311', '#0A0908'],
    accent: '#6FE8C4',
  },
  teal: {
    sky: ['#081A19', '#020909'],
    glow: '#63FFE3', glowSoft: 'rgba(90,255,225,.26)',
    ridges: ['#0D3A36', '#082824', '#051916', '#020B0A'],
    accent: '#A8D4FF',
  },
}

/* —— 确定性哈希 / 随机 —— */
function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const n = (v: number) => Math.round(v * 10) / 10

const PORTRAIT_RE = /主播|人像|角色|定妆|采访|旁白|口播|人物|肖像|narrator|anchor|portrait|interview|smile|zhou|xia|face|ref-photo|lipsync/i
const INK_RE = /水墨|山水|飞白|ink|brush/i
const OBJECT_RE = /产品|白模|工作室|显卡|图纸|机甲|静物|桌面|设备|product|mecha|studio|desk|tech|model|device|white-model/i
const CITY_RE = /街|城市|霓虹|雨夜|天台|夜景|楼|city|street|neon|rain|rooftop|urban|dusk-corner/i
const WATER_RE = /海|海底|云海|浪|江|湖|coast|sea|deep|cloud-sea|water|river|lake/i
const NIGHT_RE = /夜|晚|月亮|星|night|moon|star/i
const DUSK_RE = /黄昏|日落|晨|曙|sunset|dusk|dawn|morning/i
const MIST_RE = /雾|云|山|航拍|mountain|cloud|mist|aerial|ridge/i
const LAND_RE = /山|海|云|天|街|城市|霓虹|黄昏|日落|晨|雾|航拍|雨|夜|海底|电缆|风景|coast|mountain|cloud|sea|street|neon|dusk|city|deep|night|rooftop|sunset|river|lake|forest/i

function pickScene(seed: string, kind?: string): Scene {
  if (PORTRAIT_RE.test(seed)) return 'veil'
  if (INK_RE.test(seed)) return 'ink'
  if (OBJECT_RE.test(seed)) return 'study'
  if (LAND_RE.test(seed)) return 'landscape'
  if (kind === 'lipsync') return 'veil'
  if (kind === 'video') return 'landscape'
  return 'abstract'
}

function pickPalette(seed: string, scene: Scene): Palette {
  if (scene === 'ink') return PALETTES.ink
  if (scene === 'veil') {
    if (DUSK_RE.test(seed)) return PALETTES.dusk
    const h = hashStr(seed) % 4
    return [PALETTES.studio, PALETTES.teal, PALETTES.mist, PALETTES.ink][h]
  }
  if (scene === 'study') {
    const h = hashStr(seed) % 3
    return [PALETTES.studio, PALETTES.mist, PALETTES.ink][h]
  }
  if (CITY_RE.test(seed) && /霓虹|雨夜|霓虹灯|neon|rain/i.test(seed)) return PALETTES.neon
  if (NIGHT_RE.test(seed) || CITY_RE.test(seed)) return PALETTES.night
  if (WATER_RE.test(seed)) return PALETTES.teal
  if (MIST_RE.test(seed)) return PALETTES.mist
  if (DUSK_RE.test(seed)) return PALETTES.dusk
  return PALETTES.teal
}

/* —— 公共装饰 —— */
function defs(p: Palette): string {
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky[0]}"/>
      <stop offset="1" stop-color="${p.sky[1]}"/>
    </linearGradient>
    <radialGradient id="sunGlow">
      <stop offset="0" stop-color="${p.glow}" stop-opacity=".55"/>
      <stop offset=".45" stop-color="${p.glowSoft}"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".32"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0"/>
      <stop offset=".55" stop-color="${p.glow}" stop-opacity=".10"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grain" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="7" r=".65" fill="#FFF" opacity=".05"/>
      <circle cx="23" cy="17" r=".5" fill="#FFF" opacity=".045"/>
      <circle cx="13" cy="31" r=".6" fill="#FFF" opacity=".04"/>
      <circle cx="31" cy="4" r=".45" fill="#FFF" opacity=".035"/>
    </pattern>
  </defs>`
}

function frameMarks(): string {
  return `
  <rect x=".5" y=".5" width="479" height="299" fill="none" stroke="rgba(255,240,214,.10)"/>
  <path d="M0 0h10M0 0v10M480 0h-10M480 0v10M0 300h10M0 300v-10M480 300h-10M480 300v-10"
        stroke="rgba(255,240,214,.16)" stroke-width="1" fill="none"/>`
}

function overlay(): string {
  return `
  <rect width="480" height="300" fill="#BFDFFF" opacity=".045"/>
  <rect width="480" height="300" fill="url(#grain)"/>
  <rect width="480" height="300" fill="url(#vignette)"/>
  ${frameMarks()}`
}

/* —— 山野 / 城市 / 水 —— */
function landscape(seed: string, p: Palette, r: () => number): string {
  const horizon = 156 + r() * 26
  const sunX = 90 + r() * 300
  const sunY = 66 + r() * 46
  const city = CITY_RE.test(seed)
  const water = WATER_RE.test(seed)
  const moon = !!p.night && !DUSK_RE.test(seed)
  const sunR = moon ? 12 + r() * 5 : 17 + r() * 13

  let stars = ''
  if (p.night) {
    for (let i = 0; i < 26; i++) {
      stars += `<circle cx="${n(r() * 480)}" cy="${n(r() * horizon * .8)}" r="${n(.4 + r() * .9)}" fill="#E8EEF0" opacity="${n(.08 + r() * .4)}"/>`
    }
  }

  /* 层叠山脊（每层一条低频正弦山脊线） */
  let ridges = ''
  for (let i = 0; i < 4; i++) {
    const base = horizon + i * 20 + r() * 10
    const amp = 24 - i * 4
    const f1 = .006 + r() * .005
    const f2 = .015 + r() * .012
    const p1 = r() * 6.28
    const p2 = r() * 6.28
    let d = `M0,${n(base + Math.sin(p1) * amp)}`
    for (let x = 24; x <= 480; x += 24) {
      const y = base + Math.sin(x * f1 + p1) * amp + Math.sin(x * f2 + p2) * amp * .35
      d += ` L${x},${n(Math.min(296, y))}`
    }
    d += ' L480,300 L0,300 Z'
    ridges += `<path d="${d}" fill="${p.ridges[i]}"/>`
    if (i === 0) {
      ridges += `<path d="${d}" fill="none" stroke="${p.accent}" stroke-opacity=".16" stroke-width="1"/>`
    }
  }

  let extra = ''
  if (city) {
    /* 前景区楼群 + 零散窗灯 */
    for (let i = 0; i < 16; i++) {
      const w = 12 + r() * 26
      const x = r() * 460
      const h = 24 + r() * 74
      const y = 300 - h
      extra += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#080605" opacity=".9"/>`
      const lights = 1 + Math.floor(r() * 4)
      for (let k = 0; k < lights; k++) {
        extra += `<rect x="${n(x + 3 + r() * (w - 7))}" y="${n(y + 4 + r() * (h - 10))}" width="1.4" height="1.4" fill="${p.glow}" opacity="${n(.2 + r() * .45)}"/>`
      }
    }
    /* 湿路面反光 */
    extra += `<rect x="0" y="${n(horizon + 76)}" width="480" height="80" fill="url(#haze)" opacity=".9"/>`
    for (let i = 0; i < 7; i++) {
      const x = sunX - 40 + r() * 80
      extra += `<rect x="${n(x)}" y="${n(horizon + 78 + r() * 56)}" width="${n(8 + r() * 30)}" height="1" fill="${p.glow}" opacity="${n(.08 + r() * .22)}"/>`
    }
  } else if (water) {
    /* 水面横向反光 */
    for (let i = 0; i < 12; i++) {
      const y = horizon + 14 + i * 5 + r() * 4
      const w = 20 + r() * 120
      extra += `<rect x="${n(sunX - w / 2 + (r() - .5) * 60)}" y="${n(y)}" width="${n(w)}" height="1" fill="${p.glow}" opacity="${n(.04 + r() * .12)}"/>`
    }
    extra += `<rect x="0" y="${n(horizon + 42)}" width="480" height="2" fill="${p.glow}" opacity=".06"/>`
  } else {
    /* 前景雾带 */
    extra += `<ellipse cx="${n(120 + r() * 240)}" cy="${n(horizon + 26)}" rx="${n(130 + r() * 90)}" ry="14" fill="${p.glow}" opacity=".05"/>`
  }

  return `
  <rect width="480" height="300" fill="url(#sky)"/>
  ${stars}
  <circle cx="${n(sunX)}" cy="${n(sunY)}" r="${n(sunR * 4.6)}" fill="url(#sunGlow)"/>
  <circle cx="${n(sunX)}" cy="${n(sunY)}" r="${n(sunR)}" fill="${p.glow}" opacity="${moon ? .62 : .82}"/>
  ${moon ? `<circle cx="${n(sunX + 4)}" cy="${n(sunY - 2)}" r="${n(sunR * .92)}" fill="${p.sky[0]}" opacity=".55"/>` : ''}
  <rect x="0" y="${n(horizon - 26)}" width="480" height="58" fill="url(#haze)"/>
  ${ridges}
  ${extra}
  ${overlay()}`
}

/* —— 光幕（人像/角色的抽象替身：布光、窗光、景深与胶片边） —— */
function veil(p: Palette, r: () => number): string {
  const cx = 200 + r() * 80
  const cy = 112 + r() * 44
  const tableY = 238 + r() * 18
  const bandX = 40 + r() * 300
  const bandW = 46 + r() * 90
  const winX = 30 + r() * 120
  const winY = 18 + r() * 36
  const winW = 96 + r() * 80
  const winH = 104 + r() * 74

  let bokeh = ''
  for (let i = 0; i < 14; i++) {
    bokeh += `<circle cx="${n(r() * 480)}" cy="${n(20 + r() * 200)}" r="${n(7 + r() * 32)}" fill="${i % 3 === 0 ? p.accent : p.glow}" opacity="${n(.03 + r() * .08)}"/>`
  }

  let holes = ''
  for (let i = 0; i < 8; i++) {
    holes += `<rect x="5" y="${n(16 + i * 34)}" width="5" height="4" rx="1" fill="#242424" opacity=".7"/>`
  }

  return `
  <rect width="480" height="300" fill="url(#sky)"/>
  <radialGradient id="key" cx="${n(cx / 480 * 100)}%" cy="${n(cy / 300 * 100)}%" r="66%">
    <stop offset="0" stop-color="${p.glow}" stop-opacity=".28"/>
    <stop offset=".5" stop-color="${p.glow}" stop-opacity=".09"/>
    <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
  </radialGradient>
  <rect width="480" height="300" fill="url(#key)"/>
  <linearGradient id="win" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${p.glow}" stop-opacity=".22"/>
    <stop offset=".6" stop-color="${p.accent}" stop-opacity=".06"/>
    <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
  </linearGradient>
  <rect x="${n(winX)}" y="${n(winY)}" width="${n(winW)}" height="${n(winH)}" fill="url(#win)" opacity=".55"/>
  <rect x="${n(winX)}" y="${n(winY)}" width="${n(winW)}" height="${n(winH)}" fill="none" stroke="${p.accent}" stroke-opacity=".13"/>
  <path d="M ${n(winX + winW / 2)},${n(winY)} V ${n(winY + winH)} M ${n(winX)},${n(winY + winH / 2)} H ${n(winX + winW)}" stroke="${p.accent}" stroke-opacity=".08" stroke-width="1"/>
  <path d="M ${n(bandX)},0 C ${n(bandX + 28)},80 ${n(bandX - 18)},200 ${n(bandX + 18)},300 L ${n(bandX + bandW)},300 C ${n(bandX + bandW - 24)},200 ${n(bandX + bandW + 10)},80 ${n(bandX + bandW - 8)},0 Z" fill="${p.glow}" opacity=".04"/>
  ${bokeh}
  <rect x="0" y="0" width="14" height="300" fill="#080808" opacity=".42"/>
  ${holes}
  <rect x="0" y="${n(tableY)}" width="480" height="${n(300 - tableY)}" fill="#0A0A0A" opacity=".72"/>
  <rect x="0" y="${n(tableY)}" width="480" height="1" fill="${p.accent}" opacity=".14"/>
  <ellipse cx="${n(cx)}" cy="${n(tableY + 2)}" rx="${n(150 + r() * 70)}" ry="18" fill="${p.glow}" opacity=".09"/>
  <rect x="0" y="${n(tableY - 18)}" width="480" height="40" fill="url(#haze)"/>
  ${overlay()}`
}

/* —— 光静物（灯桌 + 相纸/接触印样，不画具体物件） —— */
function study(p: Palette, r: () => number): string {
  const cx = 190 + r() * 100
  const cy = 132 + r() * 28
  const sw = 168 + r() * 56
  const sh = 102 + r() * 34
  const rot = -8 + r() * 16
  const tableY = 232 + r() * 16

  let frames = ''
  for (let i = 0; i < 5; i++) {
    frames += `<rect x="${n(14 + i * 92)}" y="${n(tableY + 11)}" width="70" height="12" rx="2" fill="${p.ridges[i % 3]}" opacity=".32"/>`
  }

  return `
  <rect width="480" height="300" fill="url(#sky)"/>
  <radialGradient id="pool" cx="${n(cx / 480 * 100)}%" cy="${n(cy / 300 * 100)}%" r="58%">
    <stop offset="0" stop-color="${p.glow}" stop-opacity=".24"/>
    <stop offset=".55" stop-color="${p.accent}" stop-opacity=".05"/>
    <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
  </radialGradient>
  <rect width="480" height="300" fill="url(#pool)"/>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#DDEBFF" stop-opacity=".2"/>
    <stop offset=".55" stop-color="${p.glow}" stop-opacity=".07"/>
    <stop offset="1" stop-color="#0A0A0A" stop-opacity=".02"/>
  </linearGradient>
  <rect x="0" y="${n(tableY)}" width="480" height="${n(300 - tableY)}" fill="#0A0A0A" opacity=".8"/>
  <rect x="0" y="${n(tableY)}" width="480" height="1" fill="${p.accent}" opacity=".14"/>
  <g transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})">
    <ellipse cx="${n(cx)}" cy="${n(cy + sh / 2 + 16)}" rx="${n(sw * .62)}" ry="14" fill="#000" opacity=".42"/>
    <rect x="${n(cx - sw / 2)}" y="${n(cy - sh / 2)}" width="${n(sw)}" height="${n(sh)}" rx="10" fill="url(#paper)" stroke="${p.accent}" stroke-opacity=".26"/>
    <rect x="${n(cx - sw / 2 + 7)}" y="${n(cy - sh / 2 + 7)}" width="${n(sw - 14)}" height="${n(sh - 14)}" rx="7" fill="none" stroke="#FFFFFF" stroke-opacity=".06"/>
    <rect x="${n(cx - sw * .34)}" y="${n(cy - sh * .12)}" width="${n(sw * .68)}" height="1" fill="${p.accent}" opacity=".2"/>
  </g>
  ${frames}
  <ellipse cx="${n(cx)}" cy="${n(tableY + 4)}" rx="${n(sw * .8)}" ry="10" fill="${p.glow}" opacity=".06"/>
  ${overlay()}`
}

/* —— 水墨 —— */
function inkScene(p: Palette, r: () => number): string {
  const horizon = 168 + r() * 30
  let ridges = ''
  for (let i = 0; i < 3; i++) {
    const base = horizon + i * 30
    const amp = 30 - i * 8
    const p1 = r() * 6.28
    let d = `M0,${n(base + Math.sin(p1) * amp)}`
    for (let x = 30; x <= 480; x += 30) {
      d += ` L${x},${n(base + Math.sin(x * .012 + p1) * amp + Math.sin(x * .03 + p1 * 2) * amp * .3)}`
    }
    d += ' L480,300 L0,300 Z'
    ridges += `<path d="${d}" fill="${p.ridges[i]}" opacity="${.85 - i * .12}"/>`
  }
  const sunX = 300 + r() * 110
  const sunY = 62 + r() * 26
  let strokes = ''
  for (let i = 0; i < 5; i++) {
    const y = 200 + r() * 80
    strokes += `<path d="M ${n(20 + r() * 120)},${n(y)} C ${n(150 + r() * 80)},${n(y - 10)} ${n(280 + r() * 80)},${n(y + 8)} ${n(420 + r() * 40)},${n(y - 4)}" fill="none" stroke="${p.glow}" stroke-opacity="${n(.05 + r() * .08)}" stroke-width="1"/>`
  }
  return `
  <rect width="480" height="300" fill="url(#sky)"/>
  <radialGradient id="paper" cx="64%" cy="24%" r="52%">
    <stop offset="0" stop-color="${p.glow}" stop-opacity=".12"/>
    <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
  </radialGradient>
  <rect width="480" height="300" fill="url(#paper)"/>
  <circle cx="${n(sunX)}" cy="${n(sunY)}" r="${n(16 + r() * 10)}" fill="${p.glow}" opacity=".28"/>
  <rect x="0" y="${n(horizon - 24)}" width="480" height="52" fill="url(#haze)"/>
  ${ridges}
  <ellipse cx="240" cy="${n(horizon + 34)}" rx="210" ry="16" fill="${p.glow}" opacity=".035"/>
  ${strokes}
  ${overlay()}`
}

/* —— 抽象（无场景线索时的银盐试片） —— */
function abstractScene(p: Palette, r: () => number): string {
  const cx = 120 + r() * 240
  const cy = 90 + r() * 100
  let bands = ''
  for (let i = 0; i < 4; i++) {
    bands += `<ellipse cx="${n(cx + (r() - .5) * 120)}" cy="${n(cy + (r() - .5) * 80)}" rx="${n(80 + r() * 130)}" ry="${n(30 + r() * 46)}" fill="none" stroke="${i % 2 ? p.glow : p.accent}" stroke-opacity="${n(.05 + r() * .07)}" stroke-width="1"/>`
  }
  return `
  <rect width="480" height="300" fill="url(#sky)"/>
  <radialGradient id="core" cx="${n(cx / 480 * 100)}%" cy="${n(cy / 300 * 100)}%" r="58%">
    <stop offset="0" stop-color="${p.glow}" stop-opacity=".18"/>
    <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
  </radialGradient>
  <rect width="480" height="300" fill="url(#core)"/>
  ${bands}
  <rect x="0" y="${n(150 + r() * 90)}" width="480" height="1" fill="${p.accent}" opacity=".12"/>
  ${overlay()}`
}

/* —— 对外入口 —— */
const cache = new Map<string, string>()

export function placeholder(seedStr: string, kind?: string): string {
  const key = `${kind ?? ''}|${seedStr}`
  const hit = cache.get(key)
  if (hit) return hit

  const seed = seedStr || 'untitled'
  const scene = pickScene(seed, kind)
  const palette = pickPalette(seed, scene)
  const rng = makeRng(hashStr(seed))

  let body = ''
  if (scene === 'veil') body = veil(palette, rng)
  else if (scene === 'study') body = study(palette, rng)
  else if (scene === 'ink') body = inkScene(palette, rng)
  else if (scene === 'landscape') body = landscape(seed, palette, rng)
  else body = abstractScene(palette, rng)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">${defs(palette)}${body}</svg>`
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  if (cache.size > 240) cache.clear()
  cache.set(key, url)
  return url
}
