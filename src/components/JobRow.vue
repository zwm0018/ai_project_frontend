<script setup lang="ts">
/* 任务行（任务中心）：缩略 + 副信息 + 状态徽章 + 悬停操作 */
import { computed, ref, watch } from 'vue'
import type { Job } from '../types'
import { KIND, MODEL_OF_KIND, kindOfJobType } from '../constants/nav'
import { placeholder } from '../utils/placeholder'
import { useJobsStore } from '../stores/jobs'
import JobBadge from './JobBadge.vue'
import Icon from './Icon.vue'

const props = defineProps<{ job: Job; index: number }>()
const emit = defineEmits<{ (e: 'open', job: Job): void }>()
const jobs = useJobsStore()

/* 失败的一次性红闪 */
const flash = ref(false)
watch(() => props.job.status, s => {
  if (s === 'failed') {
    flash.value = true
    setTimeout(() => { flash.value = false }, 720)
  }
})

const kind = computed(() => kindOfJobType(props.job.type))
const k = computed(() => KIND[kind.value])
const thumb = computed(() =>
  props.job.thumb ?? (props.job.status === 'succeeded' ? placeholder(props.job.prompt, kind.value) : null),
)

const sub = computed(() => {
  const parts = [
    k.value.label,
    MODEL_OF_KIND[kind.value],
    props.job.res ?? '',
    props.job.took ? `耗时 ${props.job.took}` : '',
    props.job.time ?? (props.job.status === 'queued' ? '等待中' : '进行中'),
  ].filter(Boolean)
  return parts
})

const pct = computed(() => {
  const s = props.job.status
  if (s === 'succeeded') return 100
  if (s === 'running') return 42
  if (s === 'queued') return 4
  if (s === 'failed') return 24
  return 0
})
/* 音频任务用微缩波形代替画面 */
const bars = computed(() => {
  let h = 0
  for (const c of props.job.prompt) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: 16 }, (_, i) => 20 + ((h >> (i % 16)) % 64))
})
</script>

<template>
  <div
    class="job-row"
    :class="{
      running: job.status === 'running',
      'always-act': job.status === 'running' || job.status === 'queued',
      'fail-flash': flash,
    }"
    :data-st="job.status"
    :style="{ '--rv-delay': `${Math.min(index, 8) * 35}ms` }"
    tabindex="0"
    v-reveal
    @click="emit('open', job)"
  >
    <div class="jr-thumb" :style="{ '--k': k.tag }">
      <div v-if="kind === 'audio'" class="wavebar row-wave">
        <i v-for="(b, i) in bars" :key="i" :style="{ height: b + '%', '--bi': i }"></i>
      </div>
      <img v-else-if="thumb" :src="thumb" alt="" />
      <span v-else class="kind-ico"><Icon :name="k.ico" /></span>
    </div>
    <div class="jr-main">
      <div class="jr-prompt">{{ job.prompt }}</div>
      <div class="jr-sub">
        <template v-for="(p, i) in sub" :key="i">
          <span v-if="i" class="sep">·</span><span class="m">{{ p }}</span>
        </template>
      </div>
      <div v-if="job.status === 'failed' && job.err" class="jr-err">{{ job.err.code }}: {{ job.err.msg }}</div>
    </div>
    <div class="jr-status"><JobBadge :job="job" /></div>
    <div class="jr-acts">
      <button
        v-if="job.status === 'running' || job.status === 'queued'"
        class="btn sm danger"
        @click.stop="jobs.cancel(job.id)"
      ><Icon name="stop" />取消</button>
      <button
        v-if="job.status === 'failed' || job.status === 'cancelled'"
        class="btn sm"
        @click.stop="jobs.retry(job.id)"
      ><Icon name="retry" />{{ job.status === 'failed' ? '重试' : '重新提交' }}</button>
      <button
        v-if="job.status === 'succeeded'"
        class="btn sm"
        @click.stop="emit('open', job)"
      ><Icon name="external" />查看</button>
    </div>
    <div class="progress-track">
      <div class="progress" :style="{ width: pct + '%', background: job.status === 'failed' ? 'var(--err)' : undefined }"></div>
    </div>
  </div>
</template>
