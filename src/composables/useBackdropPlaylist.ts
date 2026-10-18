/* 背景影片轮播：两条 <video> 双缓冲交替，按 hold 依次切换。
   单个 <source> 只能选中一个源；要让三段都出现，必须换源 + 交叉淡入。
   低动态偏好：只保留首帧海报，不播放、不轮播。 */

export type BackdropClip = { src: string; hold: number; start?: number }
/* hold / start 均为毫秒；start 是片段入点，用来跳过前段纯黑 */
export const BACKDROP_CLIPS: BackdropClip[] = [
  { src: '/media/hero-reel.mp4', hold: 15000 },
  { src: '/media/hero-leak.mp4?v=2', hold: 14000, start: 7000 },
  { src: '/media/hero-loop.mp4', hold: 9000 },
]

type BackdropOptions = {
  rate?: number
  crossfade?: number
  poster?: string
}

const POSTER = '/media/hero-poster.png?v=2'

export function mountBackdropPlaylist(host: HTMLElement, opts: BackdropOptions = {}): () => void {
  const rate = opts.rate ?? .5
  const fade = opts.crossfade ?? 1600
  const poster = opts.poster ?? POSTER
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let activeSlot = 0
  let clipIndex = 0
  let switching = false
  let timer = 0
  let fadeTimer = 0
  let primeTimer = 0
  let disposed = false

  const make = (src: string, on: boolean) => {
    const v = document.createElement('video')
    v.muted = true
    v.defaultMuted = true
    v.loop = true
    v.playsInline = true
    v.preload = on ? 'auto' : 'metadata'
    v.poster = poster
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('aria-hidden', 'true')
    v.setAttribute('disablepictureinpicture', '')
    v.dataset.src = src
    v.src = src
    v.style.transition = `opacity ${fade}ms ease`
    if (on) v.classList.add('is-on')
    host.appendChild(v)
    return v
  }

  if (reduced) {
    const still = make(BACKDROP_CLIPS[0].src, true)
    still.preload = 'none'
    still.loop = false
    still.pause()
    return () => {
      still.pause()
      still.removeAttribute('src')
      still.load()
      still.remove()
    }
  }

  const slots = [make(BACKDROP_CLIPS[0].src, true), make(BACKDROP_CLIPS[1].src, false)]

  const play = (v: HTMLVideoElement) => {
    v.play().catch(() => { /* 自动播放被拒时等首次交互 */ })
  }

  const setRate = () => {
    for (const v of slots) {
      try { v.playbackRate = rate } catch { /* 播放器尚未就绪 */ }
    }
  }
  setRate()
  /* 每次换源后浏览器会把 playbackRate 重置回 1，元数据一到就重新压回慢放 */
  slots.forEach(v => v.addEventListener('loadedmetadata', setRate))

  /* 首次交互补播：部分浏览器会拦下非首屏的自动播放 */
  const kick = () => { if (!disposed) play(slots[activeSlot]) }

  const loadInto = (slot: number, idx: number) => {
    const v = slots[slot]
    const src = BACKDROP_CLIPS[idx].src
    if (v.dataset.src === src) return
    v.pause()
    v.preload = 'auto'
    v.dataset.src = src
    v.src = src
    v.load()
    try { v.playbackRate = rate } catch { /* 元数据到达后由 loadedmetadata 再压一次 */ }
  }

  const schedule = (ms: number) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(advance, ms)
  }

  const reveal = (slot: number, idx: number) => {
    if (disposed) return
    const prev = slots[activeSlot]
    const next = slots[slot]
    activeSlot = slot
    clipIndex = idx
    next.currentTime = (BACKDROP_CLIPS[idx].start ?? 0) / 1000
    play(next)
    next.classList.add('is-on')
    prev.classList.remove('is-on')
    window.clearTimeout(fadeTimer)
    fadeTimer = window.setTimeout(() => {
      if (disposed) return
      if (prev !== next) prev.pause()
      /* 等旧画面彻底淡出，再把它换成下一段，避免淡出过程中穿帮 */
      loadInto(1 - slot, (idx + 1) % BACKDROP_CLIPS.length)
    }, fade + 120)
    schedule(BACKDROP_CLIPS[idx].hold)
  }

  const advance = () => {
    if (disposed || switching) return
    switching = true
    const idx = (clipIndex + 1) % BACKDROP_CLIPS.length
    const slot = 1 - activeSlot
    const next = slots[slot]
    loadInto(slot, idx)
    const go = () => {
      if (!switching) return
      switching = false
      reveal(slot, idx)
    }
    if (next.readyState >= 2) {
      go()
      return
    }
    const onReady = () => {
      next.removeEventListener('canplay', onReady)
      go()
    }
    next.addEventListener('canplay', onReady)
    /* 载入兜底：首帧迟到也不把轮播卡死 */
    window.setTimeout(() => {
      next.removeEventListener('canplay', onReady)
      if (next.readyState >= 1) go()
      else {
        switching = false
        schedule(2400)
      }
    }, 1400)
  }

  const onVisibility = () => {
    if (document.hidden) {
      window.clearTimeout(timer)
      slots.forEach(v => v.pause())
    } else if (!disposed) {
      play(slots[activeSlot])
      if (!switching) schedule(BACKDROP_CLIPS[clipIndex].hold)
    }
  }

  document.addEventListener('pointerdown', kick, { once: true })
  document.addEventListener('visibilitychange', onVisibility)
  play(slots[0])
  /* 首个切换前再拉下一段，避免首屏同时下两个 8MB 文件 */
  primeTimer = window.setTimeout(() => {
    if (disposed) return
    const v = slots[1]
    if (v.dataset.src === BACKDROP_CLIPS[1].src) {
      v.preload = 'auto'
      v.load()
    }
  }, Math.max(1500, BACKDROP_CLIPS[0].hold - 7000))
  schedule(BACKDROP_CLIPS[0].hold)

  return () => {
    disposed = true
    window.clearTimeout(timer)
    window.clearTimeout(fadeTimer)
    window.clearTimeout(primeTimer)
    document.removeEventListener('pointerdown', kick)
    document.removeEventListener('visibilitychange', onVisibility)
    for (const v of slots) {
      v.pause()
      v.removeAttribute('src')
      v.load()
      v.remove()
    }
  }
}
