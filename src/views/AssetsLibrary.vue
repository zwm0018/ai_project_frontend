<script setup lang="ts">
/* 资产库：类型筛选 + 搜索 + 排序 → 瀑布流 */
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetsStore } from '../stores/assets'
import { useUiStore } from '../stores/ui'
import { KIND } from '../constants/nav'
import type { Asset, LightboxAction } from '../types'
import CapGroup from '../components/CapGroup.vue'
import SelectMenu from '../components/SelectMenu.vue'
import AssetCard from '../components/AssetCard.vue'
import EmptyState from '../components/EmptyState.vue'
import Icon from '../components/Icon.vue'

const assets = useAssetsStore()
const ui = useUiStore()
const router = useRouter()

const F = reactive({ kind: 'all', q: '', sort: 'new' })

const KIND_LIST: Array<[string, string]> = [
  ['all', '全部'], ['image', '图片'], ['video', '视频'], ['audio', '音频'], ['lipsync', '对口型'],
]
const kindItems = computed(() => KIND_LIST.map(([v, l]) => ({
  v, label: l,
  cnt: v === 'all' ? assets.assets.length : assets.assets.filter(a => a.kind === v).length,
})))

const visible = computed(() => {
  let list = assets.assets.filter(a => F.kind === 'all' || a.kind === F.kind)
  if (F.q) list = list.filter(a => a.name.toLowerCase().includes(F.q.toLowerCase()))
  if (F.sort === 'new') list = [...list].sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
  else if (F.sort === 'old') list = [...list].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
  else list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  return list
})

const totalGB = computed(() =>
  (assets.assets.reduce((s, a) => s + (a.size ?? 0), 0) / 1).toFixed(1),
)

/* 流转动效：不同动作跳对应工坊（M4 接真实跨工坊参数传递） */
function onAct(act: string) {
  if (act.includes('首帧')) { router.push('/studio/video'); return }
  if (act.includes('视频')) { router.push('/studio/video'); return }
  if (act.includes('图生图')) { router.push('/studio/image'); return }
  if (act.includes('唇形')) { router.push('/studio/lipsync'); return }
  ui.toast(`「${act}」（原型示意）`, 'ok')
}

function openDetail(a: Asset) {
  const k = KIND[a.kind]
  const rows: Array<[string, string]> = [
    ['来源', `${a.origin} · ${k.label}`],
    ['文件', a.name],
    ['大小', `${a.size ?? '—'} MB`],
  ]
  if (a.kind === 'audio') {
    rows.push(['时长', a.dur ?? '00:10'], ['格式', 'WAV · 48kHz'])
  } else {
    rows.push(['分辨率', a.kind === 'image' ? '1024 × 576' : '768 × 512'], ['时长', a.dur ?? '—'])
  }
  const hh = String(9 + (a.ts ?? 0) % 9).padStart(2, '0')
  const mm = String(((a.ts ?? 0) * 17) % 60).padStart(2, '0')
  rows.push(['入库', `今天 ${hh}:${mm}`])

  const actions: LightboxAction[] = a.acts.map(x => ({ label: x, icon: 'send', run: () => onAct(x) }))
  actions.push({ label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') })
  ui.openLightbox({ kind: a.kind, title: a.name, seed: a.seed, rows, actions })
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1>资产库</h1>
      <span class="ph-sub">{{ visible.length }} / {{ assets.assets.length }} 项 · 共 {{ totalGB }} GB</span>
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="filter-bar">
      <div class="fgroup"><span class="flabel">类型</span><CapGroup v-model="F.kind" :items="kindItems" /></div>
      <div class="fgroup" style="margin-left:auto">
        <label class="search" for="asset-q">
          <Icon name="search" />
          <input id="asset-q" v-model="F.q" type="text" placeholder="搜索文件名…" autocomplete="off" />
        </label>
        <SelectMenu
          v-model="F.sort"
          aria-label="排序"
          :options="[
            { v: 'new', label: '最新优先' },
            { v: 'old', label: '最早优先' },
            { v: 'name', label: '按文件名' },
          ]"
        />
      </div>
    </div>

    <div class="assets-wrap" style="padding-bottom:var(--sec-gap-lg)">
      <div class="assets stagger">
        <AssetCard
          v-for="(a, i) in visible"
          :key="a.id"
          :asset="a"
          :index="i"
          :style="{ '--i': i }"
          v-reveal="Math.min(i, 10) * 32"
          @open="openDetail"
          @act="onAct"
        />
      </div>
      <EmptyState
        v-if="!visible.length"
        icon="box"
        title="没有匹配的资产"
        sub="换个关键词，或清除类型筛选"
      />
    </div>
  </div>
</template>

<style scoped>
.assets { column-fill: balance; }
</style>
