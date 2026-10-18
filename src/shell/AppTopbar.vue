<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../stores/ui'
import { useJobsStore } from '../stores/jobs'
import Icon from '../components/Icon.vue'

const route = useRoute()
const ui = useUiStore()
const jobs = useJobsStore()

const title = computed(() => (route.meta.title as string) ?? '')
const isMac = ref(false)
onMounted(() => {
  isMac.value = /mac/i.test(navigator.platform || navigator.userAgent)
})
</script>

<template>
  <header class="topbar">
    <button class="icon-btn" :aria-label="ui.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'" title="收起/展开侧边栏" @click="ui.toggleSidebar()">
      <Icon name="menu" />
    </button>
    <span class="topbar-title">{{ title }}</span>

    <div class="topbar-right">
      <span class="workspace-label">研究组工作空间</span>
      <router-link to="/jobs" class="queue-link"><Icon name="clock" />队列 {{ jobs.activeCount }}</router-link>
      <span class="demo-label">演示模式</span>
      <button class="assistant-btn" @click="ui.assistantOpen = true">
        <Icon name="sparkle" />AI 助手<kbd>{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
      </button>
    </div>
  </header>
</template>
