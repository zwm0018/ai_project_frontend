<script setup lang="ts">
/* 灯箱：焦点陷阱 + Esc/外点关闭 + GSAP 开合编排 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUiStore } from '../stores/ui'
import { KIND } from '../constants/nav'
import { placeholder } from '../utils/placeholder'
import Icon from '../components/Icon.vue'

const ui = useUiStore()
const dialog = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)

const p = computed(() => ui.lightbox)
const kind = computed(() => p.value?.kind ?? 'image')

/* 波形条（音频类灯箱）：确定性伪随机，避免每次渲染跳变 */
const bars = computed(() => {
  let h = 0
  const seed = p.value?.seed ?? 'wave'
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: 64 }, (_, i) => 20 + ((h >> (i % 28)) % 61))
})

let lastFocus: HTMLElement | null = null
let closing = false

function close() {
  if (!ui.lightbox || closing) return
  closing = true
  ui.closeLightbox()
  closing = false
}

function onKeydown(e: KeyboardEvent) {
  if (!ui.lightbox || closing) return
  if (e.key === 'Escape') { e.stopPropagation(); close(); return }
  if (e.key === 'Tab' && dialog.value && panel.value) {
    const focusables = Array.from(
      panel.value.querySelectorAll<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])'),
    ).filter(el => !el.hasAttribute('disabled'))
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown, true))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown, true))

watch(() => ui.lightbox, async (val) => {
  if (val) {
    lastFocus = document.activeElement as HTMLElement | null
    await nextTick()
    panel.value?.querySelector<HTMLElement>('.lb-x')?.focus()
  } else if (lastFocus?.focus) {
    lastFocus.focus()
    lastFocus = null
  }
})
</script>

<template>
  <transition name="lb">
    <div
      v-if="p"
      ref="dialog"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="详情"
      @click.self="close"
    >
    <div ref="panel" class="lb-panel">
      <div class="lb-media" :style="{ '--k': KIND[kind].tag }">
        <button class="lb-x" aria-label="关闭" @click="close"><Icon name="x" /></button>
        <span class="lb-kind"><Icon :name="KIND[kind].ico" />{{ KIND[kind].label }}</span>
        <img v-if="kind !== 'audio'" :src="p.src ?? placeholder(p.seed ?? p.title, kind)" :alt="p.title" />
        <div v-else class="wavebar" style="height:64px;width:80%">
          <i v-for="(b, i) in bars" :key="i" :style="{ height: b + '%' }"></i>
        </div>
      </div>
      <div class="lb-body">
        <div class="lb-title">{{ p.title }}</div>
        <dl class="lb-meta">
          <template v-for="(r, i) in p.rows" :key="i">
            <dt>{{ r[0] }}</dt>
            <dd>{{ r[1] }}</dd>
          </template>
        </dl>
        <div class="lb-actions">
          <button
            v-for="(a, i) in p.actions"
            :key="i"
            class="lb-act"
            :class="{ primary: a.primary }"
            type="button"
            @click="a.run()"
          >
            <Icon v-if="a.icon" :name="a.icon" />{{ a.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </transition>
</template>
