<script setup lang="ts">
/* 语音工坊：F5-TTS · 文本转语音 / 音色克隆 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import { useUiStore } from '../stores/ui'
import { useCapabilitiesStore } from '../stores/capabilities'
import WorkshopLayout from '../shell/WorkshopLayout.vue'
import FileSlot from '../components/FileSlot.vue'
import Icon from '../components/Icon.vue'
import type { Asset, FileRef, Job } from '../types'

const router = useRouter()
const caps = useCapabilitiesStore()
const jobs = useJobsStore()
const ui = useUiStore()
const session = jobs.sessionOf('voice')

const VOICES = caps.caps.voices
const S = reactive({ voice: 'preset-woman', speed: 1, seedN: 42 })
const prompt = ref('')
const refText = ref('')
const refAudio = ref<FileRef | null>(null)

const voice = computed(() => VOICES.find(v => v.id === S.voice)!)
const isCustom = computed(() => S.voice === 'custom')
const canGen = computed(() => !!prompt.value.trim() && (!isCustom.value || !!refAudio.value))
const showWarn = computed(() => isCustom.value && !refText.value.trim())

function submit() {
  if (!canGen.value) return
  S.seedN = Math.floor(Math.random() * 90) + 10
  const job = jobs.submit({
    type: 'audio.tts',
    prompt: prompt.value.trim(),
    eta: 8,
    res: `— · ${voice.value.label}`,
    origin: 'voice',
  })
  jobs.patchJob(job.id, { dur: `0:${8 + S.seedN % 5}` })
  ui.toast(`已加入队列：${voice.value.label} · ${S.speed.toFixed(2)}×`, 'ok')
  prompt.value = ''
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
}

function openJob(j: Job) {
  ui.openLightbox({
    kind: 'audio',
    title: j.prompt,
    seed: j.prompt,
    rows: [
      ['模型', 'F5-TTS'],
      ['音色', voice.value.label],
      ['语速', `${S.speed.toFixed(2)}×`],
      ['时长', j.dur ?? '00:11'],
      ['格式', 'WAV · 48kHz'],
    ],
    actions: [
      { label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') },
      { label: '发唇形工坊', icon: 'send', primary: true, run: () => { ui.closeLightbox(); router.push('/studio/lipsync') } },
      { label: '下载', icon: 'dl', run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

/* 会话卡缩略 = 波形条（会话每段稳定） */
function waveBars(seedN: number, n: number) {
  return Array.from({ length: n }, (_, i) => 18 + ((seedN * 31 + i * 17) % 64))
}

const RECENT: Asset[] = [
  { id: 'r1', kind: 'audio', name: 'F5TTS_片头旁白_1005.wav', seed: '片头旁白', dur: '0:11', origin: 'F5TTS', ts: 12, acts: ['发唇形工坊'] },
  { id: 'r2', kind: 'audio', name: 'F5TTS_台词_夜色_1610.wav', seed: '台词夜色', dur: '0:07', origin: 'F5TTS', ts: 7, acts: ['发唇形工坊'] },
  { id: 'r3', kind: 'audio', name: 'F5TTS_栏目串场_1408.wav', seed: '栏目串场', dur: '0:09', origin: 'F5TTS', ts: 2, acts: ['发唇形工坊'] },
]

function openAsset(a: Asset) {
  ui.openLightbox({
    kind: 'audio', title: a.name, seed: a.seed,
    rows: [['来源', 'F5TTS · 音频'], ['文件', a.name], ['时长', a.dur ?? '—'], ['格式', 'WAV · 48kHz']],
    actions: [
      { label: '发唇形工坊', icon: 'send', run: () => { ui.closeLightbox(); router.push('/studio/lipsync') } },
      { label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

function onAct() { router.push('/studio/lipsync') }
</script>

<template>
  <WorkshopLayout
    title="语音工坊"
    icon="mic"
    eta="~10 秒"
    gen-label="生成语音"
    :can-gen="canGen"
    :session="session"
    unit="段"
    empty-icon="audio"
    empty-title="还没有生成"
    empty-sub="写好文案，选择音色，按下「生成语音」"
    recent-title="最近音频"
    :recent="RECENT"
    @submit="submit"
    @open-job="openJob"
    @open-asset="openAsset"
    @act="onAct"
  >
    <template #job-thumb="{ job }">
      <div class="wavebar" style="height:46px;width:72%">
        <i v-for="(b, i) in waveBars(S.seedN, 30)" :key="i" :style="{ height: b + '%' }"></i>
      </div>
    </template>

    <template #controls>
      <div class="wk-field">
        <label for="wk-prompt">朗读文案</label>
        <textarea
          id="wk-prompt"
          v-model="prompt"
          class="wk-textarea"
          rows="7"
          style="min-height:148px"
          placeholder="输入要朗读的文案，例如：大家好，欢迎体验视听工作站。&#10;&#10;支持中文与多语种文本；换行会保留自然的语句停顿"
          @keydown="onEnter"
        ></textarea>
      </div>

      <div class="wk-field">
        <label>音色</label>
        <div class="voice-row">
          <div
            v-for="v in VOICES"
            :key="v.id"
            class="voice-card"
            :class="{ sel: v.id === S.voice }"
            role="radio"
            :aria-checked="v.id === S.voice"
            tabindex="0"
            @click="S.voice = v.id"
          >
            <span class="vc-dot"></span><span class="vlabel">{{ v.label }}</span>
            <span class="audit" :title="v.preset ? '试听' : '上传参考音频'">
              <Icon :name="v.preset ? 'play' : 'wave'" />
            </span>
          </div>
        </div>

        <div class="voice-extra" :class="{ open: isCustom }">
          <div>
            <FileSlot
              v-if="isCustom"
              v-model="refAudio"
              label="参考音频（10–20 秒干声最佳）"
              kind="audio"
              :optional="false"
              style="margin-top:8px"
            />
            <input
              v-if="isCustom"
              v-model="refText"
              class="ref-text-input"
              placeholder="输入参考音频里说的原话，越准确克隆效果越好"
              aria-label="参考音频原话"
              style="margin-top:8px"
            >
            <div v-if="showWarn" class="warn-line">
              <Icon name="warn" />
              未填写原话文本，克隆质量可能下降
            </div>
          </div>
        </div>
      </div>

      <div class="wk-field field" style="flex:0 0 auto">
        <label>语速 <span class="slider-val">{{ S.speed.toFixed(2) }}×</span></label>
        <input v-model.number="S.speed" type="range" min="0.8" max="1.2" step="0.05" aria-label="语速">
      </div>
    </template>
  </WorkshopLayout>
</template>

<style scoped>
.wk-panel .slot { height: 86px; }
.job-card .job-thumb .wavebar { height: 46px; width: 72%; }
.voice-row { display: flex; gap: 8px; }
.voice-extra { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s var(--ease); }
.voice-extra.open { grid-template-rows: 1fr; }
.voice-extra > div { overflow: hidden; }
</style>
