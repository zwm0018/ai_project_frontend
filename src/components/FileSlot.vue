<script setup lang="ts">
/* 素材上传槽：value = {url,name} | null；filled 态可移除；上传成功后 flash 强调 */
import { ref } from 'vue'
import type { FileRef } from '../types'
import Icon from './Icon.vue'

const props = withDefaults(
  defineProps<{
    label: string
    kind: 'image' | 'audio' | 'video'
    modelValue: FileRef | null
    /** 水平矮槽（合成器侧列） */
    horizontal?: boolean
    optional?: boolean
  }>(),
  { optional: true },
)
const emit = defineEmits<{ (e: 'update:modelValue', v: FileRef | null): void }>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

function flash() {
  root.value?.classList.remove('flash')
  void root.value?.offsetWidth
  root.value?.classList.add('flash')
}
defineExpose({ flash })

function pick() { input.value?.click() }

function onChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const r = new FileReader()
  r.onload = () => {
    emit('update:modelValue', { url: String(r.result), name: f.name })
    flash()
  }
  r.readAsDataURL(f)
  ;(e.target as HTMLInputElement).value = ''
}

function remove() { emit('update:modelValue', null) }
</script>

<template>
  <div
    v-if="modelValue"
    ref="root"
    class="slot filled"
    :class="{ 'slot-h': horizontal }"
    tabindex="0"
    :aria-label="`${label}上传`"
  >
    <img class="thumb" :src="modelValue.url" :alt="label" />
    <button class="slot-x" aria-label="移除" @click.stop="remove"><Icon name="x" /></button>
  </div>
  <div
    v-else
    ref="root"
    class="slot"
    :class="{ 'slot-h': horizontal }"
    tabindex="0"
    role="button"
    :aria-label="`${label}上传`"
    @click="pick"
  >
    <Icon name="upload" class="s-ico" />
    <span>{{ label }}{{ optional && !horizontal ? '（可选）' : '' }}</span>
    <input ref="input" type="file" hidden :accept="kind === 'image' ? 'image/*' : kind === 'audio' ? 'audio/*' : 'video/*'" @change="onChange" />
  </div>
</template>
