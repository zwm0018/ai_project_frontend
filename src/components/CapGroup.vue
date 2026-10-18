<script setup lang="ts">
/* 胶囊组：选中态由淡蓝指示条承载，切换时 GSAP 平移到新选中项（reduced-motion 即时落位） */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap, prefersReduced } from '../gsap'

export interface CapItem {
  v: string
  label: string
  tip?: string
  /** 右侧计数（筛选胶囊） */
  cnt?: number
}

const props = defineProps<{ items: CapItem[]; modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const wrap = ref<HTMLElement | null>(null)
const ind = ref<HTMLElement | null>(null)

function place(animate: boolean) {
  const w = wrap.value, el = ind.value
  if (!w || !el) return
  const sel = w.querySelector<HTMLElement>('.cap.sel')
  if (!sel) { gsap.set(el, { opacity: 0 }); return }
  const vars = {
    x: sel.offsetLeft, y: sel.offsetTop,
    width: sel.offsetWidth, height: sel.offsetHeight, opacity: 1,
  }
  if (!animate || prefersReduced()) gsap.set(el, vars)
  else gsap.to(el, { ...vars, duration: .34, ease: 'power3.out', overwrite: 'auto' })
}

/* 选中项或选项集变化（类型切换重挂载、筛选计数刷新）后移位 */
watch(() => [props.modelValue, props.items], () => nextTick(() => place(true)))

let ro: ResizeObserver | null = null
onMounted(() => {
  place(false)
  /* 字体晚加载 / 容器变宽导致胶囊换行时静默校准 */
  ro = new ResizeObserver(() => place(false))
  if (wrap.value) ro.observe(wrap.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <span ref="wrap" class="cap-group">
    <span ref="ind" class="cap-ind" aria-hidden="true"></span>
    <button
      v-for="o in items"
      :key="o.v"
      type="button"
      class="cap"
      :class="{ sel: o.v === modelValue }"
      :data-tip="o.tip || undefined"
      :aria-pressed="o.v === modelValue"
      @click="emit('update:modelValue', o.v)"
    >{{ o.label }}<span v-if="o.cnt !== undefined" class="cnt">{{ o.cnt }}</span></button>
  </span>
</template>

<style scoped>
.cap .cnt {
  margin-left: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-4);
  font-variant-numeric: tabular-nums;
}
.cap.sel .cnt { color: var(--brand-soft); }
</style>
