<script setup lang="ts">
/* 应用壳：氛围层（随路由 meta 切换）+ 侧栏/顶栏 + 路由过渡（纯 CSS，逐区显影）+ 全局浮层
   注：路由过渡刻意不用 JS 钩子/done 回调——连续导航下与 out-in 调度互相踩踏会
   搞死 Vue 转换机制（parentNode null → 整页失效）；GSAP 编排留在登录/落地页等场景。
   快门光门 .gate 是独立 keyed 元素，只播 CSS 动画，不参与 Vue 过渡调度。 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import AppLightbox from './AppLightbox.vue'
import AppToast from './AppToast.vue'
import AssistantDrawer from './AssistantDrawer.vue'
import { useUiStore } from '../stores/ui'
import { useGlobalA11y } from '../composables/useGlobalA11y'

const route = useRoute()
const ui = useUiStore()
useGlobalA11y()

const pageEl = ref<HTMLElement | null>(null)

/* 路由切换：滚动归零（侧栏/顶栏是稳定参照，仅页面区过渡） */
watch(() => route.path, () => {
  pageEl.value?.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="app" :class="{ collapsed: ui.sidebarCollapsed }">
    <AppSidebar />
    <div class="main">
      <AppTopbar />
      <div class="gate" :key="route.path" aria-hidden="true"></div>
      <main ref="pageEl" class="page">
        <router-view v-slot="{ Component, route: r }">
          <transition name="route" mode="out-in">
            <component :is="Component" :key="r.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
  <AppLightbox />
  <AppToast />
  <AssistantDrawer />

</template>
