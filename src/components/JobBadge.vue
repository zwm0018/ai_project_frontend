<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Job } from '../types'
import { STATUS } from '../constants/nav'
import { mmss } from '../utils/format'
import { useJobsStore } from '../stores/jobs'

const props = defineProps<{ job: Job }>()
const jobs = useJobsStore()

const st = computed(() => STATUS[props.job.status])
const extra = computed(() => {
  if (props.job.status === 'queued') return ` · 第 ${props.job.pos ?? 1} 位`
  if (props.job.status === 'running' && props.job.startedAt) {
    return ` · 已耗时 ${mmss((jobs.now - props.job.startedAt) / 1000)}`
  }
  return ''
})

/* queued→running 的一次性弹跳强调 */
const pop = ref(false)
watch(() => props.job.status, (s, prev) => {
  if (s === 'running' && prev === 'queued') {
    pop.value = true
    setTimeout(() => { pop.value = false }, 320)
  }
})
</script>

<template>
  <span class="badge" :class="[st.cls, { pop }]"><span class="bdot"></span>{{ st.label }}{{ extra }}</span>
</template>
