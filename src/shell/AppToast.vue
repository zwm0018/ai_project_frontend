<script setup lang="ts">
import { useUiStore } from '../stores/ui'
import Icon from '../components/Icon.vue'

const ui = useUiStore()
</script>

<template>
  <div class="toaster" aria-live="polite">
    <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="[t.cls, { out: t.out }]">
      <Icon :name="t.cls === 'ok' ? 'ok' : 'info'" />
      <span>{{ t.msg }}</span>
    </div>
  </div>
</template>
