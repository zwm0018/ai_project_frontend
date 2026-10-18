<script setup lang="ts">
/* 工坊公共骨架：左 400px sticky 控制 / 右成果流（本次会话 + 最近产物） */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Job, Asset } from '../types'
import JobCard from '../components/JobCard.vue'
import AssetCard from '../components/AssetCard.vue'
import EmptyState from '../components/EmptyState.vue'
import StageRail from '../components/StageRail.vue'
import Icon from '../components/Icon.vue'

defineProps<{
  title: string
  icon: string
  eta: string
  genLabel: string
  canGen: boolean
  session: Job[]
  unit: string
  emptyIcon: string
  emptyTitle: string
  emptySub: string
  recentTitle: string
  recent: Asset[]
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'open-job', job: Job): void
  (e: 'open-asset', asset: Asset): void
  (e: 'act', act: string, asset: Asset): void
}>()

const route = useRoute()
const stage = computed(() => (route.meta.active as string) ?? 'image')
</script>

<template>
  <div>
    <div class="page-head page-head--rail">
      <h1>{{ title }}</h1>
      <span class="ph-sub">{{ route.meta.sub }}</span>
      <StageRail :stage="stage" />
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="wk">
      <section class="wk-panel" :aria-label="`${title}控制`" v-reveal>
        <div class="wk-title"><Icon :name="icon" />{{ title }}</div>
        <slot name="controls" />
        <div class="wk-foot">
          <span class="foot-note">预计 <span class="eta">{{ eta }}</span><slot name="foot-extra" /></span>
          <button class="gen-btn" style="margin-left:auto" :disabled="!canGen" @click="emit('submit')">
            <Icon name="send" /><span>{{ genLabel }}</span>
          </button>
        </div>
      </section>

      <div class="wk-results">
        <section class="section" style="margin-top:0" v-reveal="60">
          <div class="sec-head">
            <h2>本次会话</h2>
            <span class="count">{{ session.length }} {{ unit }}</span>
          </div>
          <div v-if="session.length" class="jobs grid">
            <JobCard
              v-for="(j, i) in session"
              :key="j.id"
              :job="j"
              :index="i"
              @open="emit('open-job', j)"
            >
              <template v-if="$slots['job-thumb']" #thumb="{ job }">
                <slot name="job-thumb" :job="job" />
              </template>
            </JobCard>
          </div>
          <EmptyState v-else :icon="emptyIcon" :title="emptyTitle" :sub="emptySub" style="margin:0 0 8px" />
        </section>

        <section class="section" v-reveal="120">
          <div class="sec-head">
            <h2>{{ recentTitle }}</h2>
            <span class="count">{{ recent.length }} 项</span>
            <router-link class="sec-link" to="/assets">资产库<Icon name="chevR" /></router-link>
          </div>
          <div class="assets-wrap">
            <div class="assets stagger">
              <AssetCard
                v-for="(a, i) in recent"
                :key="a.id"
                :asset="a"
                :index="i"
                :style="{ '--i': i }"
                @open="emit('open-asset', a)"
                @act="(x, a) => emit('act', x, a)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
