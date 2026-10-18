<script setup lang="ts">
/* 图片工坊：Flux · 文生图 / 图生图 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import { useUiStore } from '../stores/ui'
import { useCapabilitiesStore } from '../stores/capabilities'
import WorkshopLayout from '../shell/WorkshopLayout.vue'
import CapGroup from '../components/CapGroup.vue'
import FileSlot from '../components/FileSlot.vue'
import Icon from '../components/Icon.vue'
import type { Asset, Job } from '../types'

const router = useRouter()
const caps = useCapabilitiesStore()
const jobs = useJobsStore()
const ui = useUiStore()
const session = jobs.sessionOf('image')

const TIERS = caps.caps.tiers.image
const ASPECTS = caps.caps.aspects.image

const S = reactive({
  aspect: ASPECTS[0],
  tier: 'standard',
  count: '1',
  seed: -1,
})
const prompt = ref('')
const neg = ref('low quality, worst quality, deformed, blurry')
const ref_ = ref<{ url: string; name: string } | null>(null)

const tier = computed(() => TIERS.find(t => t.id === S.tier)!)
const mode = computed(() => (ref_.value ? '图生图' : '文生图'))
const canGen = computed(() => !!prompt.value.trim())

function submit() {
  if (!canGen.value) return
  const job = jobs.submit({
    type: ref_.value ? 'image.i2i' : 'image.t2i',
    prompt: prompt.value.trim(),
    eta: tier.value.eta,
    res: S.aspect === '1:1' ? '1024 × 1024' : '1024 × 576',
    origin: 'image',
  })
  void job
  ui.toast(`已加入队列：${mode.value} · ${S.aspect} · ${tier.value.label}${S.count !== '1' ? ` × ${S.count}` : ''}`, 'ok')
  prompt.value = ''
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
}

function openJob(j: Job) {
  ui.openLightbox({
    kind: 'image',
    title: j.prompt,
    seed: j.prompt,
    rows: [
      ['模型', 'Flux'],
      ['模式', mode.value],
      ['比例', S.aspect],
      ['分辨率', S.aspect === '1:1' ? '1024 × 1024' : '1024 × 576'],
      ['种子', String(S.seed)],
      ['状态', '已完成'],
    ],
    actions: [
      { label: '同参重生成', icon: 'retry', primary: true, run: () => { ui.closeLightbox(); prompt.value = j.prompt; submit() } },
      { label: '下载', icon: 'dl', run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

const RECENT: Asset[] = [
  { id: 'r1', kind: 'image', name: 'Flux_新闻主播_1030.png', h: 150, seed: 'anchor-portrait', origin: 'Flux', acts: ['做图生图参考', '发视频首帧'] },
  { id: 'r2', kind: 'image', name: 'Flux_机甲概念_1551.png', h: 150, seed: 'mecha-sketch', origin: 'Flux', acts: ['做图生图参考', '发视频首帧'] },
  { id: 'r3', kind: 'image', name: '上传_角色定妆照_0928.png', h: 150, seed: 'ref-photo', origin: '上传', acts: ['做图生图参考', '发视频首帧'] },
  { id: 'r4', kind: 'image', name: 'Flux_水墨山峦_1655.png', h: 150, seed: 'ink-mountain', origin: 'Flux', acts: ['做图生图参考', '发视频首帧'] },
  { id: 'r5', kind: 'image', name: 'Flux_工作室全景_0941.png', h: 150, seed: 'studio-wide', origin: 'Flux', acts: ['做图生图参考', '发视频首帧'] },
  { id: 'r6', kind: 'image', name: 'Flux_黄昏街角_1502.png', h: 150, seed: 'dusk-corner', origin: 'Flux', acts: ['做图生图参考', '发视频首帧'] },
]

function openAsset(a: Asset) {
  ui.openLightbox({
    kind: 'image', title: a.name, seed: a.seed,
    rows: [['来源', `${a.origin} · 图片`], ['文件', a.name], ['分辨率', '1024 × 576']],
    actions: [
      { label: '做图生图参考', icon: 'send', run: () => ui.toast('已放入图生图参考槽（原型示意）', 'ok') },
      { label: '发视频首帧', icon: 'send', run: () => { ui.closeLightbox(); router.push('/studio/video') } },
      { label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') },
    ],
  })
}

function onAct(act: string) {
  if (act.includes('首帧')) router.push('/studio/video')
  else ui.toast('已放入参考槽（原型示意）', 'ok')
}
</script>

<template>
  <WorkshopLayout
    title="图片工坊"
    icon="image"
    :eta="tier.etaTxt"
    gen-label="生成图片"
    :can-gen="canGen"
    :session="session"
    unit="张"
    empty-icon="image"
    empty-title="还没有生成"
    empty-sub="写好提示词，按下「生成图片」"
    recent-title="最近图片"
    :recent="RECENT"
    @submit="submit"
    @open-job="openJob"
    @open-asset="openAsset"
    @act="onAct"
  >
    <template #controls>
      <div class="wk-field">
        <label for="wk-prompt">提示词</label>
        <textarea
          id="wk-prompt"
          v-model="prompt"
          class="wk-textarea"
          rows="6"
          style="min-height:118px"
          placeholder="描述一张图：主体、场景、光线与风格，例如：工作室白模旁散落的显卡与图纸，顶光"
          @keydown="onEnter"
        ></textarea>
      </div>

      <div class="wk-field">
        <div class="label-row">
          <label>参考图（可选 · 提供后为图生图）</label>
          <span class="mode-chip">{{ mode }}</span>
        </div>
        <FileSlot v-model="ref_" label="参考图" kind="image" />
      </div>

      <div class="wk-field">
        <label for="wk-neg">负向提示词</label>
        <input id="wk-neg" v-model="neg" type="text">
      </div>

      <div class="wk-field">
        <div class="param-group"><span class="param-label">比例</span>
          <CapGroup v-model="S.aspect" :items="ASPECTS.map(v => ({ v, label: v }))" />
        </div>
      </div>
      <div class="wk-field">
        <div class="param-group"><span class="param-label">档位</span>
          <CapGroup v-model="S.tier" :items="TIERS.map(t => ({ v: t.id, label: t.label, tip: `${t.res} · ${t.etaTxt}` }))" />
        </div>
      </div>
      <div class="wk-field">
        <div class="param-group"><span class="param-label">数量</span>
          <CapGroup v-model="S.count" :items="[1, 2, 4].map(n => ({ v: String(n), label: `${n} 张` }))" />
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
.wk-panel .slot { height: 92px; }
</style>
