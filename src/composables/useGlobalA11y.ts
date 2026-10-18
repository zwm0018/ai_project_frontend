/* ============================================================
   全局可达性（AppShell 挂载一次）
   1) 键盘激活：tabindex=0 的非原生控件 Enter/Space 触发点击
   2) 截断文本悬停可读：溢出时同步 title
   ============================================================ */
import { onBeforeUnmount, onMounted } from 'vue'

const TRUNCATE_SELECTOR =
  '.job-prompt,.asset-name,.jr-prompt,.proj-name,.char-name,.job-row'

export function useGlobalA11y() {
  function onKeydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement
    if (
      (e.key === 'Enter' || e.key === ' ') &&
      t?.matches?.('[tabindex="0"]') &&
      !t.matches('button,a,input,textarea,select,[role="button"]')
    ) {
      e.preventDefault()
      t.click()
    }
  }

  function onMouseover(e: MouseEvent) {
    const t = (e.target as HTMLElement)?.closest?.(TRUNCATE_SELECTOR) as HTMLElement | null
    if (!t) return
    if (t.scrollWidth > t.clientWidth + 1) t.title = t.textContent?.trim() ?? ''
    else t.removeAttribute('title')
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('mouseover', onMouseover)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('mouseover', onMouseover)
  })
}
