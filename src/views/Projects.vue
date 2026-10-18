<script setup lang="ts">
/* 我的剧集（V1 预留：分镜编辑器占位） */
import { useUiStore } from '../stores/ui'
import { placeholder } from '../utils/placeholder'
import Icon from '../components/Icon.vue'

interface Project {
  id: string
  name: string
  shots: number
  len: string
  up: string
  seeds: string[]
}

const PROJECTS: Project[] = [
  { id: 'p1', name: '《城市观察》第一季', shots: 12, len: '2 分 06 秒', up: '2 小时前', seeds: ['anchor-portrait', 'neon-street', 'dusk-corner', 'studio-wide'] },
  { id: 'p2', name: '产品发布短片', shots: 8, len: '1 分 12 秒', up: '昨天', seeds: ['white-model', 'mecha-sketch', 'ref-photo', 'dusk-corner'] },
  { id: 'p3', name: '台风天气科普', shots: 15, len: '2 分 40 秒', up: '3 天前', seeds: ['cloud-sea', 'deep-cable', 'ink-mountain', 'neon-street'] },
  { id: 'p4', name: '年度回顾混剪', shots: 21, len: '3 分 35 秒', up: '上周', seeds: ['anchor-smile', 'interview-side', 'dusk-corner', 'cloud-sea'] },
  { id: 'p5', name: '《深夜电台》试播集', shots: 9, len: '1 分 30 秒', up: '上周', seeds: ['ink-mountain', 'neon-street', 'dusk-corner', 'studio-wide'] },
]

const ui = useUiStore()
</script>

<template>
  <div>
    <div class="page-head">
      <h1>我的剧集</h1>
      <span class="v1-flag"><b>V1</b>分镜编辑器预留 · 本页为结构与视觉占位</span>
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="proj-grid">
      <div
        v-for="(p, i) in PROJECTS"
        :key="p.id"
        class="proj-card"
        :style="{ '--i': i }"
        tabindex="0"
        v-reveal="Math.min(i, 8) * 55"
        v-tilt
        @click="ui.toast('分镜编辑器将在 V1 提供（原型占位）', 'ok')"
      >
        <div class="proj-cover">
          <img v-for="s in p.seeds" :key="s" :src="placeholder(s, 'image')" alt="">
          <div class="pc-veil"></div>
        </div>
        <div class="proj-body">
          <div class="proj-name">{{ p.name }}</div>
          <div class="proj-meta">
            <span class="mg"><span class="m">{{ p.shots }}</span> 个分镜</span>
            <span class="mg">约 <span class="m">{{ p.len }}</span></span>
            <span class="mg">更新于 {{ p.up }}</span>
          </div>
        </div>
      </div>
      <div class="new-card" :style="{ '--i': PROJECTS.length }" tabindex="0" role="button" aria-label="新建剧集" v-reveal="PROJECTS.length * 55" @click="ui.toast('新建剧集（V1 原型示意）', 'ok')">
        <Icon name="plus" /><span>新建剧集</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v1-flag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-11); color: var(--text-4);
  border: 1px solid var(--stroke-1); border-radius: var(--r-sm); padding: 2px 8px;
}
.v1-flag b { font-weight: 600; color: var(--brand-soft); letter-spacing: .04em; }
</style>
