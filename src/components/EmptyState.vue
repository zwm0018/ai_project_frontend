<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{ title: string; sub?: string; icon?: string }>()
</script>

<template>
  <div class="empty">
    <Icon v-if="icon" :name="icon" />
    <div class="e-title">{{ title }}</div>
    <div v-if="sub" class="e-sub">{{ sub }}</div>
    <slot />
  </div>
</template>
