<script setup lang="ts">
/* 自定义下拉选择：浮层/悬停/选中态与合成器类型下拉同一组件语言（替代原生 select） */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Icon from './Icon.vue'

export interface SelOption { v: string; label: string }

const props = defineProps<{ options: SelOption[]; modelValue: string; ariaLabel?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const sel = computed(() => props.options.find(o => o.v === props.modelValue))

function onDocClick(e: MouseEvent) {
  if (open.value && !root.value?.contains(e.target as Node)) open.value = false
}
function onDocKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onDocKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onDocKey)
})

function pick(v: string) {
  open.value = false
  if (v !== props.modelValue) emit('update:modelValue', v)
}
</script>

<template>
  <div ref="root" class="sel-menu" :class="{ open }">
    <button
      type="button"
      class="sel-btn"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      @click.stop="open = !open"
    >{{ sel?.label }}<Icon name="chevD" class="chev" /></button>
    <div class="sel-pop" role="listbox" :aria-label="ariaLabel">
      <button
        v-for="(o, i) in options"
        :key="o.v"
        type="button"
        class="sel-opt"
        :class="{ sel: o.v === modelValue }"
        role="option"
        :aria-selected="o.v === modelValue"
        :style="{ '--i': i }"
        @click="pick(o.v)"
      >
        <span>{{ o.label }}</span>
        <Icon name="ok" class="so-check" />
      </button>
    </div>
  </div>
</template>
