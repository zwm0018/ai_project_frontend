<script setup lang="ts">
/* 氛围层：暗房环境光（不进 GSAP）
   video = 影片底（Landing / 合成器）· fluid = 光场+阵列+放大机光束（工作台）· login = 门帘态 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useFluidField } from '../composables/useFluidField'
import { mountBackdropPlaylist } from '../composables/useBackdropPlaylist'

const props = withDefaults(defineProps<{ mode?: 'fluid' | 'video' | 'login' }>(), { mode: 'fluid' })

const fluidHost = ref<HTMLElement | null>(null)
const videoHost = ref<HTMLElement | null>(null)
/* 帘后秩序：阵列先隐后显（登录页保持隐去） */
const latticeHidden = ref(true)
let disposeField: (() => void) | null = null
let disposeBackdrop: (() => void) | null = null

onMounted(() => {
  requestAnimationFrame(() => { latticeHidden.value = false })
  if (props.mode === 'video' && videoHost.value) {
    disposeBackdrop = mountBackdropPlaylist(videoHost.value, { rate: .5 })
  }
  if (props.mode !== 'video' && fluidHost.value) {
    disposeField = useFluidField(fluidHost.value, {
      warmAnchor: props.mode === 'login' ? { x: .5, y: .46 } : undefined,
      boostWarm: props.mode === 'login',
    })
  }
})

onBeforeUnmount(() => {
  disposeBackdrop?.()
  disposeField?.()
})
</script>

<template>
  <div aria-hidden="true" class="atmo">
    <div v-if="mode === 'video'" ref="videoHost" class="bg-video"></div>
    <div v-else ref="fluidHost" class="fluid"><i></i><i></i><i></i></div>

    <div v-if="mode === 'video'" class="video-wash"></div>
    <div v-if="mode === 'video'" class="bg-tint"></div>
    <div v-if="mode === 'video'" class="dotgrid"></div>
    <div v-else class="beam"></div>
    <div class="leak"></div>
    <div v-if="mode !== 'video'" class="lattice" :class="{ 'lattice--hidden': mode === 'login' || latticeHidden }"></div>

    <div class="vignette"></div>
    <div class="grain"></div>
  </div>
</template>
