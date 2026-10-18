<script setup lang="ts">
/* 唇形工坊：MuseTalk · 视频 + 配音 → 对口型成片 */
import { computed, reactive, ref } from 'vue'
import { useJobsStore } from '../stores/jobs'
import { useUiStore } from '../stores/ui'
import WorkshopLayout from '../shell/WorkshopLayout.vue'
import CapGroup from '../components/CapGroup.vue'
import FileSlot from '../components/FileSlot.vue'
import Icon from '../components/Icon.vue'
import type { Asset, FileRef, Job } from '../types'

const jobs = useJobsStore()
const ui = useUiStore()
const session = jobs.sessionOf('lipsync')

const S = reactive({ qual: 'standard', keep: 'off' })
const note = ref('')
const video = ref<FileRef | null>(null)
const audio = ref<FileRef | null>(null)

const canGen = computed(() => !!(video.value && audio.value))
const eta = computed(() => (S.qual === 'fine' ? '~50 秒' : '~25 秒'))

function submit() {
  if (!canGen.value) return
  const job = jobs.submit({
    type: 'video.lipsync',
    prompt: note.value.trim() || `成片合成 · ${video.value!.name} + ${audio.value!.name}`,
    eta: S.qual === 'fine' ? 50 : 25,
    res: '768 × 512',
    origin: 'lipsync',
  })
  jobs.patchJob(job.id, { dur: '0:08' })
  ui.toast(`已加入队列：${S.qual === 'fine' ? '精细' : '标准'} · ${S.keep === 'keep' ? '保留原声' : '关闭原声'}`, 'ok')
  note.value = ''
}

function openJob(j: Job) {
  ui.openLightbox({
    kind: 'lipsync',
    title: j.prompt,
    seed: j.prompt,
    rows: [
      ['模型', 'MuseTalk'],
      ['口型精度', S.qual === 'fine' ? '精细' : '标准'],
      ['原声', S.keep === 'keep' ? '保留' : '关闭'],
      ['输入视频', video.value?.name ?? '（已移除）'],
      ['输入音频', audio.value?.name ?? '（已移除）'],
      ['时长', '00:08'],
    ],
    actions: [
      { label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') },
      { label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

const RECENT: Asset[] = [
  { id: 'r1', kind: 'lipsync', name: 'MuseTalk_口播成片_1740.mp4', h: 118, seed: 'lipsync-merge', dur: '0:08', origin: 'MuseTalk', acts: [] },
  { id: 'r2', kind: 'lipsync', name: 'MuseTalk_采访侧拍_1430.mp4', h: 118, seed: 'interview-side', dur: '0:06', origin: 'MuseTalk', acts: [] },
  { id: 'r3', kind: 'lipsync', name: 'MuseTalk_栏目片头_1121.mp4', h: 118, seed: 'anchor-open', dur: '0:09', origin: 'MuseTalk', acts: [] },
]

function openAsset(a: Asset) {
  ui.openLightbox({
    kind: 'lipsync', title: a.name, seed: a.seed, dur: a.dur,
    rows: [['来源', 'MuseTalk · 对口型'], ['文件', a.name], ['分辨率', '768 × 512'], ['时长', a.dur ?? '—']],
    actions: [
      { label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') },
      { label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

function onAct() { ui.toast('（原型示意）', 'ok') }
</script>

<template>
  <WorkshopLayout
    title="唇形工坊"
    icon="lipsync"
    :eta="eta"
    gen-label="合成口型"
    :can-gen="canGen"
    :session="session"
    unit="段"
    empty-icon="lipsync"
    empty-title="还没有合成"
    empty-sub="放入视频与配音，按下「合成口型」"
    recent-title="最近成片"
    :recent="RECENT"
    @submit="submit"
    @open-job="openJob"
    @open-asset="openAsset"
    @act="onAct"
  >
    <template #controls>
      <div class="wk-field">
        <label>素材（两者都放好后即可合成）</label>
        <div class="lslots">
          <div><FileSlot v-model="video" label="视频底片" kind="video" :optional="false" /></div>
          <div><FileSlot v-model="audio" label="配音音频" kind="audio" :optional="false" /></div>
        </div>
        <div class="note-line">
          <Icon name="info" />
          建议正面人像、光线均匀的片段，效果最佳
        </div>
      </div>

      <div class="wk-field">
        <div class="param-group"><span class="param-label">口型精度</span>
          <CapGroup v-model="S.qual" :items="[
            { v: 'standard', label: '标准', tip: '~25 秒 · 常规口型' },
            { v: 'fine', label: '精细', tip: '~50 秒 · 边缘更稳' },
          ]" />
        </div>
      </div>
      <div class="wk-field">
        <div class="param-group"><span class="param-label">保留原声</span>
          <CapGroup v-model="S.keep" :items="[
            { v: 'off', label: '关闭', tip: '成片只保留配音' },
            { v: 'keep', label: '保留', tip: '原声与配音混合' },
          ]" />
        </div>
      </div>

      <div class="wk-field">
        <label for="wk-note">备注（可选）</label>
        <input id="wk-note" v-model="note" type="text" class="form-input" placeholder="例如：第三版 · 语速放慢" style="font-family:var(--font-sans)">
      </div>
    </template>
  </WorkshopLayout>
</template>

<style scoped>
.note-line {
  display: flex; align-items: flex-start; gap: 7px;
  margin-top: 8px; font-size: var(--fs-11); color: var(--text-3); line-height: 1.5;
}
.note-line :deep(svg) { width: 12px; height: 12px; flex: none; margin-top: 2px; color: var(--text-4); }
.lslots { display: flex; gap: 10px; }
.lslots > div { flex: 1; min-width: 0; }
.lslots .slot { height: 128px; }
</style>
