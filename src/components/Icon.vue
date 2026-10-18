<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from './icons'

const props = defineProps<{ name: string }>()
const html = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <span class="ico" aria-hidden="true" v-html="html"></span>
</template>

<style scoped>
.ico { display: inline-grid; place-items: center; flex: none; }
.ico :deep(svg) { display: block; }
</style>
