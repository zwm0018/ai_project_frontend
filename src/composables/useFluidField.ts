/* ============================================================
   有机光斑场 + 悬浮尘埃（暗房空气里的银盐微粒）
   低分辨率 canvas 多频正弦叠加 + lighter 混合，平滑放大即柔焦；
   轨迹互质频率合成、永不重复；暖光斑缓慢追随指针（或锚定登录卡）。
   性能红线：24fps 上限 · 页面隐藏暂停 · reduced-motion 只画一帧静置。
   用法：const dispose = useFluidField(host, opts)（在 onMounted 里调用，
   由调用方在自己的 onBeforeUnmount 里执行 dispose——生命周期钩子必须
   在 setup 期间注册，composable 在 onMounted 内运行时注册无效）。
   ============================================================ */

export interface FluidFieldOptions {
  /** 暖光斑锚点（登录态：聚拢在卡片之后，不追随指针）；boostWarm 时提高暖斑强度 */
  warmAnchor?: { x: number; y: number }
  /** 登录态：暖光斑更醒目（聚拢在卡后作为唯一主角） */
  boostWarm?: boolean
  /** 悬浮尘埃（默认开） */
  dust?: boolean
}

interface Blob {
  c: [number, number, number]
  a: number
  r: number
  sp: [number, number, number]
  ph: [number, number, number]
  amp: [number, number]
  warm?: boolean
}

interface Mote {
  x: number
  y: number
  r: number
  vy: number
  sw: number
  sp: number
  ph: number
  a: number
  warm: boolean
}

const BLOBS: Blob[] = [
  { c: [30, 88, 96], a: .3, r: .47, sp: [.040, .027, .019], ph: [0.0, 2.1, 4.2], amp: [.30, .22] },
  { c: [58, 72, 78], a: .2, r: .44, sp: [.030, .043, .022], ph: [1.3, 0.4, 3.1], amp: [.26, .30] },
  { c: [143, 199, 255], a: .07, r: .25, sp: [.058, .036, .026], ph: [2.6, 5.0, 1.0], amp: [.34, .24], warm: true },
  { c: [24, 62, 70], a: .18, r: .33, sp: [.022, .033, .040], ph: [4.0, 1.8, 5.3], amp: [.32, .28] },
  { c: [200, 214, 208], a: .035, r: .27, sp: [.047, .018, .033], ph: [0.7, 3.6, 2.2], amp: [.26, .34] },
  { c: [111, 232, 196], a: .035, r: .18, sp: [.072, .051, .036], ph: [5.7, 2.9, 0.6], amp: [.36, .30] },
]

export function useFluidField(host: HTMLElement, opts: FluidFieldOptions = {}): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'fluid-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const anchor = opts.warmAnchor ?? null
  const warmBoost = opts.boostWarm ? 1.8 : 1
  let W = 0
  let H = 0

  const ptr = { x: .5, y: .42 }
  const warm = { x: .5, y: .42 }

  const onPointer = (e: PointerEvent) => {
    ptr.x = e.clientX / window.innerWidth
    ptr.y = e.clientY / window.innerHeight
  }
  if (!anchor) window.addEventListener('pointermove', onPointer, { passive: true })

  /* —— 尘埃：确定性随机，缓慢上浮、左右微摆 —— */
  let motes: Mote[] = []
  function spawnDust() {
    if (opts.dust === false) { motes = []; return }
    let seed = 0x9e3779b9
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    motes = Array.from({ length: 38 }, () => ({
      x: rnd(),
      y: rnd(),
      r: .35 + rnd() * .75,
      vy: 2 + rnd() * 5,
      sw: 4 + rnd() * 16,
      sp: 6 + rnd() * 8,
      ph: rnd() * Math.PI * 2,
      a: .12 + rnd() * .3,
      warm: rnd() < .55,
    }))
  }

  function draw(t: number) {
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'lighter'
    for (const b of BLOBS) {
      let x = .5 + b.amp[0] * .55 * (Math.sin(t * b.sp[0] * 6 + b.ph[0]) + .6 * Math.sin(t * b.sp[1] * 6 + b.ph[1]))
      let y = .42 + b.amp[1] * .55 * (Math.sin(t * b.sp[1] * 5.4 + b.ph[2]) + .6 * Math.sin(t * b.sp[2] * 5.4 + b.ph[0]))
      const R = b.r * (1 + .2 * Math.sin(t * b.sp[2] * 7 + b.ph[1])) * Math.max(W, H)
      if (b.warm) {
        const target = anchor ?? ptr
        warm.x += (target.x - warm.x) * .035
        warm.y += (target.y - warm.y) * .035
        x = x * .45 + warm.x * .55
        y = y * .45 + warm.y * .55
      }
      const a = (b.warm ? b.a * warmBoost : b.a) * (anchor && b.warm ? 1.2 : 1)
      const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, R)
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x * W, y * H, R, 0, 6.2832)
      ctx.fill()
    }
    /* 尘埃：上浮 + 横摆；画布放大后成为柔焦光点 */
    for (const m of motes) {
      const px = (m.x + Math.sin(t / m.sp + m.ph) * (m.sw / W)) * W
      const py = (((m.y - (t * m.vy) / H) % 1) + 1) % 1 * H
      ctx.beginPath()
      ctx.fillStyle = m.warm
        ? `rgba(200, 230, 255, ${m.a})`
        : `rgba(190, 214, 206, ${m.a * .8})`
      ctx.arc(px, py, m.r, 0, 6.2832)
      ctx.fill()
    }
  }

  function resize() {
    const w = host.clientWidth || window.innerWidth
    const h = host.clientHeight || window.innerHeight
    W = Math.max(140, Math.min(300, Math.round(w / 6)))
    H = Math.max(90, Math.round(W * h / w))
    canvas.width = W
    canvas.height = H
    spawnDust()
    if (reduced) draw(7.7)
  }

  let raf = 0
  let last = 0
  const t0 = performance.now()

  function frame(now: number) {
    raf = 0
    if (now - last >= 41) {
      last = now
      draw((now - t0) / 1000)
    }
    if (!document.hidden) raf = requestAnimationFrame(frame)
  }

  const onVisibility = () => {
    if (!document.hidden && !raf && !reduced) raf = requestAnimationFrame(frame)
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', resize)

  resize()
  if (reduced) {
    draw(7.7)
  } else {
    raf = requestAnimationFrame(frame)
  }

  /* 由调用方在自己的 onBeforeUnmount 里执行 */
  return () => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    canvas.remove()
  }
}
