/* ============================================================
   GSAP 单源注册 + 全站动效策略
   分工边界：环境氛围不进 GSAP（CSS+rAF）；编排与转场进 GSAP。
   红线：transform/opacity only · reduced-motion 全局即时切换。
   ============================================================ */
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(Flip, SplitText)

/** 用户偏好减少动态时，编排退化为即时切换（与 CSS 兜底双保险） */
export function prefersReduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 一次性强调动效的公共包装（reduced 即跳过） */
export function once(target: HTMLElement, vars: gsap.TweenVars): void {
  if (prefersReduced()) return
  gsap.fromTo(target, vars.from ?? {}, { ...vars.to, duration: vars.to.duration ?? .3 })
}

export { gsap, Flip, SplitText }
