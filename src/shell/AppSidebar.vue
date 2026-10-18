<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAV } from '../constants/nav'
import { useJobsStore } from '../stores/jobs'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()
const jobs = useJobsStore()
const auth = useAuthStore()

const active = computed(() => (route.meta.active as string) ?? '')
const userName = computed(() => auth.user?.name ?? '研究员')
const initial = computed(() => userName.value.slice(0, 1))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <router-link to="/home" class="brand" style="text-decoration:none" aria-label="AI Studio 首页">
      <div class="brand-glyph">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5.5v13l11-6.5z"/></svg>
      </div>
      <span class="label brand-name">AI Studio</span>
    </router-link>

    <nav aria-label="主导航">
      <template v-for="g in NAV" :key="g.group ?? 'root'">
        <div class="nav-group" :class="{ 'nav-group--stages': g.group === '创作' }">
          <div v-if="g.group" class="group-title">{{ g.group }}</div>
          <router-link
            v-for="it in g.items"
            :key="it.key"
            :to="it.to"
            class="nav-item"
            :class="{ active: it.key === active }"
            :aria-label="it.label"
            :aria-current="it.key === active ? 'page' : undefined"
          >
            <Icon :name="it.icon" />
            <span class="label">{{ it.label }}</span>
            <span v-if="it.badge" v-show="jobs.activeCount > 0" class="nav-badge">{{ jobs.activeCount }}</span>

          </router-link>
        </div>
      </template>
    </nav>

    <router-link to="/" class="side-return" aria-label="返回灵感首页"><Icon name="external" /><span class="label">返回灵感首页</span></router-link>
    <div class="side-foot">
      <div class="avatar" aria-hidden="true">{{ initial }}</div>
      <div class="label side-foot-text">
        <div>{{ userName }}</div>
        <small>研究组 · 内网</small>
      </div>
      <button class="icon-btn" style="width:26px;height:26px" title="退出登录" aria-label="退出登录" @click="logout">
        <Icon name="external" />
      </button>
    </div>
  </aside>
</template>
