<script setup lang="ts">
/* 任务中心：统计瓦片（数字滚动）→ 筛选（Flip 重排）→ 行列表 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import { useUiStore } from '../stores/ui'
import { KIND, MODEL_OF_KIND, kindOfJobType } from '../constants/nav'
import type { Job, LightboxAction } from '../types'
import CapGroup from '../components/CapGroup.vue'
import JobRow from '../components/JobRow.vue'
import EmptyState from '../components/EmptyState.vue'
import Icon from '../components/Icon.vue'
import { Flip, gsap, prefersReduced } from '../gsap'

const jobs = useJobsStore()
const ui = useUiStore()
const router = useRouter()

/* —— 统计（首载滚动，之后即时）—— */
const counts = computed(() => {
  const c: Record<string, number> = { running: 0, queued: 0, succeeded: 0, failed: 0, cancelled: 0 }
  for (const j of jobs.jobs) c[j.status] = (c[j.status] ?? 0) + 1
  return { running: c.running, queued: c.queued, succeeded: c.succeeded, failed: c.failed }
})
const shown = reactive({ running: 0, queued: 0, succeeded: 0, failed: 0 })

onMounted(() => {
  if (prefersReduced() || document.hidden) {
    Object.assign(shown, counts.value)
    return
  }
  const t = gsap.to(shown, {
    ...counts.value,
    duration: .6, ease: 'power1.out',
    snap: { running: 1, queued: 1, succeeded: 1, failed: 1 },
  })
  /* 自愈：时钟停摆环境强制落定 */
  window.setTimeout(() => { if (t.progress() < 1) t.progress(1) }, 1200)
})
watch(counts, c => Object.assign(shown, c))

/* —— 筛选 —— */
const F = reactive({ status: 'all', type: 'all' })

const STATUS_LIST: Array<[string, string]> = [
  ['all', '全部'],
  ['running', '生成中'],
  ['queued', '排队中'],
  ['succeeded', '已完成'],
  ['failed', '失败'],
  ['cancelled', '已取消'],
]
const TYPE_LIST: Array<[string, string]> = [
  ['all', '全部'], ['image', '图片'], ['video', '视频'], ['audio', '音频'], ['lipsync', '对口型'],
]

const statusItems = computed(() => STATUS_LIST.map(([v, l]) => ({
  v, label: l,
  cnt: v === 'all' ? jobs.jobs.length : jobs.jobs.filter(j => j.status === v).length,
})))
const typeItems = computed(() => TYPE_LIST.map(([v, l]) => ({
  v, label: l,
  cnt: v === 'all' ? jobs.jobs.length : jobs.jobs.filter(j => kindOfJobType(j.type) === v).length,
})))

const visible = computed(() => jobs.jobs.filter(j =>
  (F.status === 'all' || j.status === F.status) &&
  (F.type === 'all' || kindOfJobType(j.type) === F.type),
))

/* Flip：筛选变化 → 行列表空间重排（keyed diff 保元素，Flip 移位） */
const rowsEl = ref<HTMLElement | null>(null)
watch(() => [F.status, F.type], async () => {
  if (!rowsEl.value || prefersReduced()) return
  const state = Flip.getState(rowsEl.value.querySelectorAll('.job-row'))
  await nextTick()
  Flip.from(state, { duration: .45, ease: 'power2.inOut', absolute: true })
})

/* —— 详情灯箱 —— */
function openDetail(j: Job) {
  const kind = kindOfJobType(j.type)
  const rows: Array<[string, string]> = [
    ['提示词', j.prompt],
    ['任务号', j.id],
    ['类型', `${KIND[kind].label} · ${MODEL_OF_KIND[kind]}`],
    ['分辨率', j.res ?? '—'],
  ]
  if (j.took) rows.push(['耗时', j.took])
  if (j.time) rows.push(['时间', j.time])
  if (j.status === 'failed' && j.err) rows.push(['错误', `${j.err.code} — ${j.err.msg}`])

  const actions: LightboxAction[] = []
  if (kind !== 'image' && j.status === 'succeeded') {
    actions.push({ label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') })
  }
  if (j.status === 'succeeded') {
    actions.push({ label: '在资产库打开', icon: 'box', run: () => router.push('/assets') })
  }
  if (j.status === 'failed' || j.status === 'cancelled') {
    actions.push({
      label: '重新提交', icon: 'retry', primary: true,
      run: () => { ui.closeLightbox(); jobs.retry(j.id) },
    })
  }
  ui.openLightbox({ kind, title: j.prompt, seed: j.prompt, rows, actions })
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1>任务中心</h1>
      <span class="ph-sub">共 {{ jobs.jobs.length }} 条 · 更新于刚刚</span>
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="stats">
      <div class="stat" v-reveal style="--sc:rgba(143,199,255,.6)"><div class="st-num">{{ shown.running }}</div><div class="st-label"><Icon name="clock" />生成中</div><div class="st-sub">GPU 正在渲染</div></div>
      <div class="stat" v-reveal="60" style="--sc:rgba(185,185,198,.45)"><div class="st-num">{{ shown.queued }}</div><div class="st-label">排队中</div><div class="st-sub">按提交顺序执行</div></div>
      <div class="stat" v-reveal="120" style="--sc:rgba(111,232,196,.55)"><div class="st-num">{{ shown.succeeded }}</div><div class="st-label">今日完成</div><div class="st-sub">产物已入资产库</div></div>
      <div class="stat" v-reveal="180" style="--sc:rgba(255,107,107,.55)"><div class="st-num">{{ shown.failed }}</div><div class="st-label">今日失败</div><div class="st-sub">可一键重试</div></div>
    </div>

    <div class="filter-bar" v-reveal="220">
      <div class="fgroup"><span class="flabel">状态</span><CapGroup v-model="F.status" :items="statusItems" /></div>
      <div class="fgroup"><span class="flabel">类型</span><CapGroup v-model="F.type" :items="typeItems" /></div>
    </div>

    <div class="rows-wrap">
      <div ref="rowsEl" class="rows">
        <JobRow v-for="(j, i) in visible" :key="j.id" :job="j" :index="i" @open="openDetail" />
      </div>
      <EmptyState
        v-if="!visible.length"
        icon="search"
        title="没有符合筛选条件的任务"
        sub="换个状态或类型试试"
      />
    </div>
  </div>
</template>

<style scoped>
.jr-err { max-width: 520px; }
.rows-wrap {
  max-width: var(--content-outer); margin: 0 auto;
  padding: 0 var(--content-pad) var(--sec-gap-lg); width: 100%;
}
.rows { padding: 0; }
</style>
