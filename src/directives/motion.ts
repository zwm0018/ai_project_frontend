/* ============================================================
   运动指令（Vue directive）
   v-reveal：进入视口时显影（IO + 兜底，减少动态直接显示）
   v-light ：指针在帧上留下的安全灯光斑（只设 CSS 变量）
   v-tilt  ：轻微视角倾斜（细指针设备；与 v-light 合用同一坐标）
   说明：动画本体全部在 CSS（motion.css），指令只负责状态与变量。
   ============================================================ */
import type { Directive } from 'vue'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

/* ---------------- v-reveal ---------------- */
interface RevealHandle {
  io?: IntersectionObserver
  timer?: number
}
const revealHandles = new WeakMap<HTMLElement, RevealHandle>()

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (reduced()) return
    el.classList.add('rv')
    const delay = typeof binding.value === 'number' ? binding.value : 0
    if (delay > 0) el.style.setProperty('--rv-delay', `${delay}ms`)

    const handle: RevealHandle = {}
    revealHandles.set(el, handle)

    if (!('IntersectionObserver' in window)) {
      el.classList.add('rv-in')
      return
    }

    let done = false
    const show = () => {
      if (done) return
      done = true
      el.classList.add('rv-in')
      handle.io?.disconnect()
      if (handle.timer) window.clearTimeout(handle.timer)
    }

    handle.io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) show() },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    )
    handle.io.observe(el)

    /* 兜底：布局异常/观察器未触发时，只要在视口内就显示（绝不把内容留在透明） */
    handle.timer = window.setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight + 40 && r.bottom > -40) show()
    }, 1500)
  },
  unmounted(el) {
    const h = revealHandles.get(el)
    h?.io?.disconnect()
    if (h?.timer) window.clearTimeout(h.timer)
    revealHandles.delete(el)
  },
}

/* ---------------- v-light ---------------- */
const lightCleanup = new WeakMap<HTMLElement, () => void>()

export const vLight: Directive<HTMLElement> = {
  mounted(el) {
    if (reduced() || !fine()) return
    el.classList.add('fx-light')
    let raf = 0
    const move = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`)
        el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`)
      })
    }
    el.addEventListener('pointermove', move, { passive: true })
    lightCleanup.set(el, () => {
      if (raf) cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
    })
  },
  unmounted(el) {
    lightCleanup.get(el)?.()
    lightCleanup.delete(el)
  },
}

/* ---------------- v-tilt ---------------- */
const MAX_TILT = 1.6
const tiltCleanup = new WeakMap<HTMLElement, () => void>()

export const vTilt: Directive<HTMLElement> = {
  mounted(el) {
    if (reduced() || !fine()) return
    el.classList.add('fx-tilt')
    el.classList.add('fx-light')

    let raf = 0
    const move = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`)
        el.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`)
        el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
        el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
      })
    }
    const enter = () => el.classList.add('tilting')
    const leave = () => {
      el.classList.remove('tilting')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('pointerenter', enter, { passive: true })
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave, { passive: true })
    tiltCleanup.set(el, () => {
      if (raf) cancelAnimationFrame(raf)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    })
  },
  unmounted(el) {
    tiltCleanup.get(el)?.()
    tiltCleanup.delete(el)
  },
}
