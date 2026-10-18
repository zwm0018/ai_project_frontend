<script setup lang="ts">
/* 资产卡（接触印样）：缩略 + 类型角标 + 悬停流转动作
   指针经过时轻微倾斜并留下一束安全灯光斑（v-tilt）*/
import { computed } from 'vue'
import type { Asset } from '../types'
import { KIND } from '../constants/nav'
import { placeholder } from '../utils/placeholder'
import Icon from './Icon.vue'

const props = defineProps<{ asset: Asset; index: number }>()
const emit = defineEmits<{ (e: 'open', asset: Asset): void; (e: 'act', act: string, asset: Asset): void }>()

const k = computed(() => KIND[props.asset.kind])
const src = computed(() => placeholder(props.asset.seed, props.asset.kind))
/* 波形条：确定性伪随机（同资产稳定） */
const bars = computed(() =>
  Array.from({ length: 36 }, (_, i) => 18 + (((props.asset.ts ?? 0) * 37 + i * 13) % 62)),
)
const isMotion = computed(() => props.asset.kind === 'video' || props.asset.kind === 'lipsync')
</script>

<template>
  <div
    class="asset-card"
    :class="`kind-${asset.kind}`"
    :style="{ '--i': index }"
    tabindex="0"
    v-tilt
    @click="emit('open', asset)"
  >
    <div class="asset-thumb" :style="asset.kind === 'audio' ? {} : { height: (asset.h ?? 140) + 'px' }">
      <div v-if="asset.kind === 'audio'" class="wavebar">
        <i v-for="(b, i) in bars" :key="i" :style="{ height: b + '%', '--bi': i }"></i>
      </div>
      <img v-else :src="src" :alt="asset.name" />
      <span class="kind-chip" :style="{ '--k': k.tag }"><Icon :name="k.ico" /></span>
      <span v-if="asset.dur" class="dur">{{ asset.dur }}</span>
      <span v-if="isMotion" class="motion-cue" aria-hidden="true"><Icon name="play" /></span>
      <div class="asset-overlay">
        <button
          v-for="a in asset.acts"
          :key="a"
          class="act-chip"
          @click.stop="emit('act', a, asset)"
        ><Icon name="send" />{{ a }}</button>
      </div>
    </div>
    <div class="asset-name">{{ asset.name }}</div>
  </div>
</template>
