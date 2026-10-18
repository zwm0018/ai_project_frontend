import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LightboxPayload } from '../types'

export interface ToastItem {
  id: number
  msg: string
  cls: string
  out?: boolean
}

/** 界面壳状态：侧栏折叠 / toast / 灯箱 / 助手抽屉 */
export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(localStorage.getItem('studio.sidebar') === '1')
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('studio.sidebar', sidebarCollapsed.value ? '1' : '0')
  }

  const toasts = ref<ToastItem[]>([])
  let tid = 0
  function toast(msg: string, cls = 'ok') {
    const t: ToastItem = { id: ++tid, msg, cls }
    toasts.value.push(t)
    setTimeout(() => { t.out = true }, 2400)
    setTimeout(() => {
      toasts.value = toasts.value.filter(x => x.id !== t.id)
    }, 2700)
  }

  const lightbox = ref<LightboxPayload | null>(null)
  function openLightbox(p: LightboxPayload) { lightbox.value = p }
  function closeLightbox() { lightbox.value = null }

  const assistantOpen = ref(false)

  return {
    sidebarCollapsed, toggleSidebar,
    toasts, toast,
    lightbox, openLightbox, closeLightbox,
    assistantOpen,
  }
})
