<script setup lang="ts">
/* 生成管线指示：生图 → 生视频 → 配音 → 对口型
   只做定位表达，不承担导航（导航在侧栏）；当前工序以安全灯标出。 */
import { computed } from 'vue'

const props = defineProps<{ stage: string }>()

const STAGES = [
  { id: 'image', label: '图片', model: 'Flux' },
  { id: 'video', label: '视频', model: 'LTXV' },
  { id: 'voice', label: '语音', model: 'F5' },
  { id: 'lipsync', label: '唇形', model: 'MuseTalk' },
] as const

const idx = computed(() => STAGES.findIndex(s => s.id === props.stage))
const current = computed(() => STAGES[idx.value] ?? STAGES[0])
</script>

<template>
  <div
    class="stage-rail"
    role="img"
    :aria-label="`生成管线：第 ${idx + 1} 步，${current.label}，${current.model}`"
  >
    <span
      v-for="(s, i) in STAGES"
      :key="s.id"
      class="sr-step"
      :class="{ done: i < idx, cur: i === idx }"
    >
      <span class="sr-node" aria-hidden="true"></span>
      <span class="sr-num" aria-hidden="true">0{{ i + 1 }}</span>
      <span class="sr-label">{{ s.label }}</span>
    </span>
  </div>
</template>
