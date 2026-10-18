<script setup lang="ts">
/* 任务海报卡（合成器「最近任务」横滚 / 工坊「本次会话」网格）
   状态即显影阶段：潜影（排队）→ 显影（生成中）→ 定影（完成） */
import { computed } from 'vue'
import type { Job } from '../types'
import { KIND, kindOfJobType } from '../constants/nav'
import { placeholder } from '../utils/placeholder'
import JobBadge from './JobBadge.vue'
import Icon from './Icon.vue'

const props = defineProps<{ job: Job; index: number }>()
const emit = defineEmits<{ (e: 'open', job: Job): void }>()

const kind = computed(() => kindOfJobType(props.job.type))
const k = computed(() => KIND[kind.value])
const thumb = computed(() =>
  props.job.thumb ?? (props.job.status === 'succeeded' ? placeholder(props.job.prompt, kind.value) : null),
)
const pct = computed(() => {
  const s = props.job.status
  if (s === 'succeeded') return 100
  if (s === 'running') return 38
  if (s === 'queued') return 0
  return 24
})
/* 音频任务用波形代替画面：任务卡也能一眼看出模态 */
const bars = computed(() => {
  let h = 0
  for (const c of props.job.prompt) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: 26 }, (_, i) => 16 + ((h >> (i % 24)) % 68))
})
</script>

<template>
  <div
    class="job-card"
    :class="{ running: job.status === 'running', 'no-anim': index > 0 }"
    :data-st="job.status"
    :style="{ '--i': index }"
    tabindex="0"
    v-light
    @click="emit('open', job)"
  >
    <div class="job-thumb" :style="{ '--k': k.tag }">
      <slot name="thumb" :job="job">
        <div v-if="kind === 'audio'" class="wavebar job-wave">
          <i v-for="(b, i) in bars" :key="i" :style="{ height: b + '%', '--bi': i }"></i>
        </div>
        <img v-else-if="thumb" :src="thumb" alt="" />
        <span v-else class="kind-ico"><Icon :name="k.ico" /></span>
      </slot>
      <span v-if="job.dur && job.status === 'succeeded'" class="dur" style="position:absolute;bottom:7px;right:7px;z-index:4;font-size:9.5px;font-family:var(--font-mono);color:#F4F4F4;background:rgba(7,6,5,.62);border:1px solid rgba(255,255,255,.08);padding:1px 5px;border-radius:2px">{{ job.dur }}</span>
    </div>
    <div class="job-body">
      <div class="job-prompt">{{ job.prompt || k.label }}</div>
      <div class="job-meta">
        <JobBadge :job="job" />
        <span class="job-time">{{ job.status === 'succeeded' ? (job.time ?? '') : job.status === 'cancelled' ? (job.time ?? '') : '' }}</span>
      </div>
      <div v-if="job.status === 'failed' && job.err" class="job-err">{{ job.err.code }}: {{ job.err.msg }}</div>
    </div>
    <div class="progress-track">
      <div class="progress" :style="{ width: pct + '%', background: job.status === 'failed' ? 'var(--err)' : undefined }"></div>
    </div>
  </div>
</template>
