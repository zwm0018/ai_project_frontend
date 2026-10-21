<script setup lang="ts">
/* DEV 专用：headless 截图 / E2E 冒烟的自动登录跳板（不进生产构建）
   可选 query：redirect=/path&sidebar=1|0（便于截取侧栏收起态） */
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

onMounted(() => {
  /* 始终覆盖本地会话，避免 live 模式下残留的旧 token 干扰截图/E2E。 */
  auth.devLogin('研究员')
  const side = route.query.sidebar
  if (side === '1' || side === '0') {
    ui.sidebarCollapsed = side === '1'
    localStorage.setItem('studio.sidebar', side === '1' ? '1' : '0')
  }
  router.replace((route.query.redirect as string) || '/home')
})
</script>

<template>
  <main style="position:relative;z-index:10;height:100vh;display:grid;place-items:center;color:var(--text-4)">进入中…</main>
</template>
