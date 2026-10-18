<script setup lang="ts">
/* 视频工坊：LTX-Video · 文生视频 / 图生视频 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import { useUiStore } from '../stores/ui'
import { useCapabilitiesStore } from '../stores/capabilities'
import WorkshopLayout from '../shell/WorkshopLayout.vue'
import CapGroup from '../components/CapGroup.vue'
import FileSlot from '../components/FileSlot.vue'
import Icon from '../components/Icon.vue'
import type { Asset, FileRef, Job } from '../types'

const router = useRouter()
const caps = useCapabilitiesStore()
const jobs = useJobsStore()
const ui = useUiStore()
const session = jobs.sessionOf('video')

const TIERS = caps.caps.tiers.video
const ASPECTS = caps.caps.aspects.video
const MOVES = ['固定机位', '缓慢推近', '缓慢拉远', '左右横移']

const S = reactive({
  move: '缓慢推近',
  dur: '5',
  aspect: ASPECTS[0],
  tier: 'standard',
  seed: -1,
})
const prompt = ref('')
const ref_ = ref<FileRef | null>(null)

const tier = computed(() => TIERS.find(t => t.id === S.tier)!)
const mode = computed(() => (ref_.value ? '图生视频' : '文生视频'))
const eta = computed(() => (S.dur === '3' ? tier.value.etaTxt.replace('分钟', '分钟内') : tier.value.etaTxt))
const canGen = computed(() => !!prompt.value.trim())

function submit() {
  if (!canGen.value) return
  const job = jobs.submit({
    type: ref_.value ? 'video.i2v' : 'video.t2v',
    prompt: prompt.value.trim(),
    eta: tier.value.eta,
    res: '768 × 512',
    origin: 'video',
  })
  jobs.patchJob(job.id, { dur: `0:0${S.dur}` })
  ui.toast(`已加入队列：${S.move} · ${S.dur} 秒 · ${S.aspect} · ${tier.value.label}`, 'ok')
  prompt.value = ''
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
}

function openJob(j: Job) {
  ui.openLightbox({
    kind: 'video',
    title: j.prompt,
    seed: j.prompt,
    rows: [
      ['模型', 'LTX-Video'],
      ['模式', mode.value],
      ['运镜', S.move],
      ['时长', `00:0${S.dur}`],
      ['比例', S.aspect],
      ['分辨率', '768 × 512'],
      ['状态', '已完成'],
    ],
    actions: [
      { label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') },
      { label: '同参重生成', icon: 'retry', primary: true, run: () => { ui.closeLightbox(); prompt.value = j.prompt; submit() } },
      { label: '下载', icon: 'dl', run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

const RECENT: Asset[] = [
  { id: 'r1', kind: 'video', name: 'LTXV_雨夜街景_1012.mp4', h: 118, seed: 'neon-street', dur: '0:05', origin: 'LTXV', acts: ['发唇形工坊', '抓取末帧'] },
  { id: 'r2', kind: 'video', name: 'LTXV_天台日落_0930.mp4', h: 118, seed: 'anchor-smile', dur: '0:05', origin: 'LTXV', acts: ['发唇形工坊', '抓取末帧'] },
  { id: 'r3', kind: 'video', name: 'LTXV_海底检修_1520.mp4', h: 118, seed: 'deep-cable', dur: '0:05', origin: 'LTXV', acts: ['发唇形工坊', '抓取末帧'] },
  { id: 'r4', kind: 'video', name: 'LTXV_云海延时_1255.mp4', h: 118, seed: 'cloud-sea', dur: '0:04', origin: 'LTXV', acts: ['发唇形工坊', '抓取末帧'] },
]

function openAsset(a: Asset) {
  ui.openLightbox({
    kind: 'video', title: a.name, seed: a.seed, dur: a.dur,
    rows: [['来源', 'LTXV · 视频'], ['文件', a.name], ['分辨率', '768 × 512'], ['时长', a.dur ?? '—']],
    actions: [
      { label: '发唇形工坊', icon: 'send', run: () => { ui.closeLightbox(); router.push('/studio/lipsync') } },
      { label: '抓取末帧', icon: 'send', run: () => ui.toast('末帧已存为图片资产（原型示意）', 'ok') },
      { label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

function onAct(act: string) {
  if (act.includes('唇形')) router.push('/studio/lipsync')
  else ui.toast('末帧已存为图片资产（原型示意）', 'ok')
}
</script>

<template>
  <WorkshopLayout
    title="视频工坊"
    icon="video"
    :eta="eta"
    gen-label="生成视频"
    :can-gen="canGen"
    :session="session"
    unit="段"
    empty-icon="video"
    empty-title="还没有生成"
    empty-sub="写好画面描述，按下「生成视频」"
    recent-title="最近视频"
    :recent="RECENT"
    @submit="submit"
    @open-job="openJob"
    @open-asset="openAsset"
    @act="onAct"
  >
    <template #controls>
      <div class="wk-field">
        <label for="wk-prompt">画面与运镜</label>
        <textarea
          id="wk-prompt"
          v-model="prompt"
          class="wk-textarea"
          rows="5"
          style="min-height:104px"
          placeholder="描述画面与运镜，例如：黄昏天台，研究员望着城市，镜头缓缓推近&#10;&#10;主体动作 · 镜头运动 · 光影氛围——英文提示词效果通常更佳"
          @keydown="onEnter"
        ></textarea>
      </div>

      <div class="wk-field">
        <div class="label-row">
          <label>首帧图（可选 · 提供后为图生视频）</label>
          <span class="mode-chip">{{ mode }}</span>
        </div>
        <FileSlot v-model="ref_" label="首帧图" kind="image" />
      </div>

      <div class="wk-field">
        <div class="param-group"><span class="param-label">运镜</span>
          <CapGroup v-model="S.move" :items="MOVES.map(v => ({ v, label: v }))" />
        </div>
      </div>

      <div class="wk-field">
        <div class="wk-cols">
          <div class="param-group"><span class="param-label">时长</span>
            <CapGroup v-model="S.dur" :items="[{ v: '3', label: '3 秒' }, { v: '5', label: '5 秒' }]" />
          </div>
          <div class="param-group"><span class="param-label">比例</span>
            <CapGroup v-model="S.aspect" :items="ASPECTS.map(v => ({ v, label: v }))" />
          </div>
        </div>
      </div>

      <div class="wk-field">
        <div class="param-group"><span class="param-label">档位</span>
          <CapGroup v-model="S.tier" :items="TIERS.map(t => ({ v: t.id, label: t.label, tip: `${t.res} · ${t.etaTxt}` }))" />
        </div>
      </div>

      <div class="wk-field field">
        <label for="wk-seed">种子（-1 为随机）</label>
        <div class="seed-wrap">
          <input id="wk-seed" v-model.number="S.seed" type="number">
          <button class="dice" aria-label="随机" title="随机" @click="S.seed = -1; ui.toast('种子已设为随机', 'ok')">
            <Icon name="dice" />
          </button>
        </div>
      </div>
    </template>
  </WorkshopLayout>
</template>

<style scoped>
.wk-panel .slot { height: 84px; }
/* 时长+比例 合并行（短组内联标签，节省一整行） */
.wk-cols { display: flex; align-items: center; gap: 4px 18px; flex-wrap: wrap; }
.wk-cols .param-group { display: flex; align-items: center; gap: 4px; }
.wk-cols .param-label { display: inline; margin-right: 4px; }
.wk-cols .cap { margin: 0 4px 0 0; }
</style>
