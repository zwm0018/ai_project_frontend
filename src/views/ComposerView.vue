<script setup lang="ts">
/* 创作合成器：一句话变成影片——输入区即银幕（16:5 玻璃面板，四模式切换） */
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import { useAssetsStore } from '../stores/assets'
import { useUiStore } from '../stores/ui'
import { useCapabilitiesStore } from '../stores/capabilities'
import { KIND, MODEL_OF_KIND, kindOfJobType } from '../constants/nav'
import { clockNow } from '../utils/format'
import { gsap, prefersReduced } from '../gsap'
import type { Asset, AssetKind, FileRef, GenTypeId, Job, LightboxAction } from '../types'
import CapGroup from '../components/CapGroup.vue'
import FileSlot from '../components/FileSlot.vue'
import JobCard from '../components/JobCard.vue'
import AssetCard from '../components/AssetCard.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const caps = useCapabilitiesStore()
const jobs = useJobsStore()
const assets = useAssetsStore()
const ui = useUiStore()

/* ================= 状态 ================= */
const S = reactive({
  type: 'image' as GenTypeId,
  aspect: {} as Record<GenTypeId, string>,
  tier: {} as Record<GenTypeId, string>,
  voice: 'preset-woman',
  adv: false,
})
for (const t of caps.caps.types) {
  S.aspect[t.id] = caps.caps.aspects[t.id][0] ?? ''
  S.tier[t.id] = caps.caps.tiers[t.id][0]?.id ?? ''
}

const prompt = ref('')
try {
  const raw = sessionStorage.getItem('studio.draft')
  if (raw) {
    const draft = JSON.parse(raw)
    if (caps.caps.types.some(t => t.id === draft.type)) S.type = draft.type
    if (typeof draft.prompt === 'string') prompt.value = draft.prompt
    sessionStorage.removeItem('studio.draft')
  }
} catch { sessionStorage.removeItem('studio.draft') }
const neg = ref('low quality, worst quality, deformed, blurry')
const seed = ref(-1)
const denoise = ref(0.6)
const refImage = ref<FileRef | null>(null)
const refAudio = ref<FileRef | null>(null)
const refVideo = ref<FileRef | null>(null)
const refText = ref('')

const PLACEHOLDER: Record<GenTypeId, string> = {
  image: '描述画面的主体、场景与光线，例如：工作室里的白模与图纸，柔和顶光。',
  video: '描述画面与运镜，例如：黄昏天台，一位研究员望向城市，镜头缓缓推近。',
  voice: '输入要朗读的文案。换行可以保留自然的语句停顿。',
  lipsync: '添加人物视频与配音音频，合成同步口型的片段。',
}
const GEN_LABEL: Record<GenTypeId, string> = { image: '生成图片', video: '生成视频', voice: '生成语音', lipsync: '合成口型' }

const aspects = computed(() => caps.caps.aspects[S.type])
const tiers = computed(() => caps.caps.tiers[S.type])
const tier = computed(() => tiers.value.find(t => t.id === S.tier[S.type]))
const etaTxt = computed(() => tier.value?.etaTxt ?? '')
const genLabel = computed(() => GEN_LABEL[S.type])
const isCustomVoice = computed(() => S.type === 'voice' && S.voice === 'custom')

/* 素材槽布局随类型切换 */
const slotMode = computed<'refImage' | 'refAudio' | 'dual' | 'none'>(() => {
  if (S.type === 'image' || S.type === 'video') return 'refImage'
  if (S.type === 'voice') return S.voice === 'custom' ? 'refAudio' : 'none'
  return 'dual'
})

function needInput(): boolean {
  if (S.type === 'lipsync') return !(refVideo.value && refAudio.value)
  if (S.type === 'voice') return !prompt.value.trim() || (S.voice === 'custom' && !refAudio.value)
  return !prompt.value.trim()
}
const canGen = computed(() => !needInput())

/* ================= 类型下拉 ================= */
function pickType(id: GenTypeId) {
  if (S.type !== id) { S.type = id; prompt.value = '' }
}
/* 类型切换编排：参数区/音色行换内容后依次上浮（素材槽走 CSS swap-in） */
watch(() => S.type, async () => {
  await nextTick()
  if (prefersReduced() || !panelEl.value) return
  const els = panelEl.value.querySelectorAll('.param-group, .voice-row')
  if (els.length) {
    const t = gsap.fromTo(els, { opacity: 0, y: 8 }, {
      opacity: 1, y: 0, duration: .32, ease: 'power2.out', stagger: .05,
      clearProps: 'opacity,transform',
    })
    window.setTimeout(() => { if (t.progress() < 1) t.progress(1) }, 900)
  }
})
/* ================= 提交 ================= */
const slotRef = ref<InstanceType<typeof FileSlot> | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const genBtnEl = ref<HTMLElement | null>(null)
const firing = ref(false)
function flashSlot() { slotRef.value?.flash() }

function submit() {
  if (needInput()) return
  const typeMap = {
    image: refImage.value ? 'image.i2i' : 'image.t2i',
    video: refImage.value ? 'video.i2v' : 'video.t2v',
    voice: 'audio.tts',
    lipsync: 'video.lipsync',
  } as const
  const aspect = S.aspect[S.type]
  const job = jobs.submit({
    type: typeMap[S.type],
    prompt: prompt.value.trim(),
    eta: tier.value?.eta,
    origin: 'composer',
    res: aspect
      ? (S.type === 'image' ? (aspect === '1:1' ? '1024 × 1024' : '1024 × 576') : '768 × 512')
      : `— · ${caps.caps.voices.find(v => v.id === S.voice)?.label ?? ''}`,
  })
  if (S.type === 'video') jobs.patchJob(job.id, { dur: '0:05' })
  if (S.type === 'voice') jobs.patchJob(job.id, { dur: `0:${8 + Math.floor(Math.random() * 5)}` })
  ui.toast(`已加入队列（第 ${job.pos} 位）`, 'ok')
  prompt.value = ''
  /* 快门回弹 + 面板显影闪光（reduced-motion 跳过） */
  if (!prefersReduced()) {
    firing.value = true
    window.setTimeout(() => { firing.value = false }, 760)
  }
  if (!prefersReduced() && genBtnEl.value) {
    gsap.fromTo(genBtnEl.value, { scale: .95 }, {
      scale: 1, duration: .45, ease: 'elastic.out(1.1, .55)', clearProps: 'transform',
    })
  }
}
function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
}

/* ================= 快捷能力 ================= */
const QUICK = [
  { label: '图生图', icon: 'image', act: () => { S.type = 'image'; flashSlot() } },
  { label: '首帧生视频', icon: 'video', act: () => { S.type = 'video'; flashSlot() } },
  { label: '克隆音色', icon: 'wave', act: () => { S.type = 'voice'; S.voice = 'custom' } },
  { label: '对口型合成', icon: 'lipsync', act: () => { S.type = 'lipsync' } },
  { label: '从资产库发起', icon: 'person', act: () => router.push('/assets') },
]

/* ================= 最近任务 / 资产 ================= */
const recentJobs = computed(() => jobs.jobs.slice(0, 4))
const recentAssets = computed(() => assets.assets.slice(0, 8))

function openJob(j: Job) {
  const kind = kindOfJobType(j.type)
  const META: Record<AssetKind, Array<[string, string]>> = {
    image: [['模型', 'Flux'], ['分辨率', '1024 × 576'], ['种子', '82736184930211'], ['状态', '已完成']],
    video: [['模型', 'LTX-Video'], ['分辨率', '768 × 512'], ['时长', '00:05'], ['状态', '已完成']],
    audio: [['模型', 'F5-TTS'], ['音色', '预设女声'], ['时长', '00:11']],
    lipsync: [['模型', 'MuseTalk'], ['分辨率', '768 × 512'], ['时长', '00:08']],
  }
  const meta = META[kind]
  const actions: LightboxAction[] = []
  if (kind !== 'image') actions.push({ label: '播放', icon: 'play', run: () => ui.toast('播放（原型示意）', 'ok') })
  actions.push({
    label: '同参重生成', icon: 'retry', primary: true,
    run: () => { ui.closeLightbox(); prompt.value = j.prompt; submit() },
  })
  actions.push({ label: '下载', icon: 'dl', run: () => ui.toast('下载（原型示意）', 'ok') })
  ui.openLightbox({
    kind, title: j.prompt, seed: j.prompt,
    rows: [['提示词', j.prompt], ...meta, ['创建', j.time ?? clockNow()]],
    actions,
  })
}

function openAsset(a: Asset) {
  const k = KIND[a.kind]
  const rows: Array<[string, string]> = [['来源', `${a.origin} · ${k.label}`], ['文件', a.name]]
  if (a.kind === 'audio') rows.push(['时长', a.dur ?? '00:11'], ['格式', 'WAV · 48kHz'])
  else rows.push(['分辨率', a.kind === 'image' ? '1024 × 576' : '768 × 512'], ['时长', a.dur ?? '00:05'], ['创建', clockNow()])
  const actions: LightboxAction[] = a.acts.map(x => ({ label: x, icon: 'send', run: () => onAct(x) }))
  actions.push({ label: '下载', icon: 'dl', primary: true, run: () => ui.toast('下载（原型示意）', 'ok') })
  ui.openLightbox({ kind: a.kind, title: a.name, seed: a.seed, dur: a.dur, rows, actions })
}

function onAct(act: string) {
  if (act.includes('首帧') || act.includes('视频首帧')) { router.push('/studio/video'); return }
  if (act.includes('唇形')) { router.push('/studio/lipsync'); return }
  if (act.includes('图生图')) { router.push('/studio/image'); return }
  ui.toast(`「${act}」（原型示意）`, 'ok')
}
</script>

<template>
  <div class="studio-home">
    <div class="page-head studio-welcome">
      <div><p class="studio-eyebrow">你的创作空间</p><h1>今天，让什么灵感成真？</h1><p class="studio-intro">从画面到声音，把下一段故事留在这里。</p></div>
      <span class="mock-flag">演示工作空间</span>
    </div>
    <div class="mode-bar" aria-label="创作类型">
      <button v-for="t in caps.caps.types" :key="t.id" :class="{ chosen: S.type === t.id }" :aria-pressed="S.type === t.id" @click="pickType(t.id)"><Icon :name="t.icon" />{{ t.label }}<span class="mode-model">{{ t.id === 'image' ? 'FLUX' : t.id === 'video' ? 'LTX-Video' : t.id === 'voice' ? 'F5-TTS' : 'MuseTalk' }}</span></button>
    </div>

    <!-- 光谱合成台：输入区即银幕 -->
    <section ref="panelEl" class="composer" :class="{ firing }" aria-label="生成合成器" v-reveal>
      <span class="expose" aria-hidden="true"></span>
      <div class="composer-top">
        <div class="prompt-wrap">
          <textarea
            v-model="prompt"
            aria-label="提示词"
            :placeholder="PLACEHOLDER[S.type]"
            @keydown="onEnter"
          ></textarea>
          <div class="prompt-tools">
            <button class="mini-btn" @click="ui.toast('AI 润色：已请求本地助手（原型示意）', 'ok')">
              <Icon name="sparkle" />AI 润色
            </button>
          </div>
        </div>

        <div v-if="slotMode !== 'none'" class="slots" :class="{ dual: slotMode === 'dual' }" :key="slotMode + S.type">
          <template v-if="slotMode === 'refImage'">
            <FileSlot ref="slotRef" v-model="refImage" :label="S.type === 'image' ? '参考图' : '首帧图'" kind="image" />
          </template>
          <template v-else-if="slotMode === 'refAudio'">
            <FileSlot ref="slotRef" v-model="refAudio" label="参考音频" kind="audio" horizontal :optional="false" />
          </template>
          <template v-else>
            <FileSlot v-model="refVideo" label="视频底片" kind="video" :optional="false" />
            <FileSlot v-model="refAudio" label="配音音频" kind="audio" :optional="false" />
          </template>
        </div>
      </div>

      <!-- 音色（仅语音） -->
      <div v-if="S.type === 'voice'" class="voice-row" :key="'voice'">
        <div
          v-for="v in caps.caps.voices"
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
      <div class="voice-extra" :class="{ open: isCustomVoice }" :inert="!isCustomVoice">
        <div>
          <input v-model="refText" class="ref-text-input" placeholder="输入参考音频里说的原话，越准确克隆效果越好" aria-label="参考音频原话">
          <div v-if="isCustomVoice && !refText.trim()" class="warn-line">
            <Icon name="warn" />未填写原话文本，克隆质量可能下降
          </div>
        </div>
      </div>

      <!-- 参数行 -->
      <div class="param-row">
        <div v-if="aspects.length" class="param-group" :key="'as-' + S.type">
          <span class="param-label">比例</span>
          <CapGroup v-model="S.aspect[S.type]" :items="aspects.map(v => ({ v, label: v }))" />
        </div>
        <div v-if="tiers.length > 1 || tiers[0]" class="param-group" :key="'ti-' + S.type">
          <span class="param-label">档位</span>
          <CapGroup v-model="S.tier[S.type]" :items="tiers.map(t => ({ v: t.id, label: t.label, tip: `${t.res} · ${t.etaTxt}` }))" />
        </div>

        <button class="adv-toggle" :aria-expanded="S.adv" :class="{ open: S.adv }" @click="S.adv = !S.adv">
          <Icon name="chevD" />高级
        </button>
      </div>

      <!-- 高级参数 -->
      <div class="adv" :class="{ open: S.adv }" :inert="!S.adv">
        <div>
          <div class="adv-grid">
            <div class="field" :style="{ visibility: (S.type === 'voice' || S.type === 'lipsync') ? 'hidden' : 'visible' }">
              <label for="c-neg">负向提示词</label>
              <input id="c-neg" v-model="neg" type="text" aria-label="负向提示词">
            </div>
            <div class="field">
              <label for="c-seed">种子（-1 为随机）</label>
              <div class="seed-wrap">
                <input id="c-seed" v-model.number="seed" type="number" aria-label="随机种子">
                <button class="dice" aria-label="随机种子" title="随机" @click="seed = -1; ui.toast('种子已设为随机', 'ok')">
                  <Icon name="dice" />
                </button>
              </div>
            </div>
            <div v-if="S.type === 'image' && refImage" class="field slider-field">
              <label>重绘幅度 <span class="slider-val">{{ denoise.toFixed(2) }}</span></label>
              <input v-model.number="denoise" type="range" min="0.1" max="1" step="0.05" aria-label="重绘幅度">
            </div>
          </div>
        </div>
      </div>

      <div class="composer-foot">
        <span class="foot-note">预计 <span class="eta">{{ etaTxt }}</span></span>
        <button ref="genBtnEl" class="gen-btn" :disabled="!canGen" @click="submit">
          <Icon name="send" /><span>{{ genLabel }}</span>
        </button>
      </div>
    </section>

    <!-- 快捷能力 -->
    <div class="quick">
      <button v-for="q in QUICK" :key="q.label" class="quick-cap" @click="q.act">
        <Icon :name="q.icon" />{{ q.label }}
      </button>
    </div>

    <!-- 最近任务 -->
    <section class="section" v-reveal="40">
      <div class="sec-head">
        <h2>最近任务</h2><span class="count">{{ jobs.jobs.length }} 条</span>
        <router-link class="sec-link" to="/jobs">任务中心<Icon name="chevR" /></router-link>
      </div>
      <div class="jobs">
        <JobCard v-for="(j, i) in recentJobs" :key="j.id" :job="j" :index="i" @open="openJob" />
      </div>
    </section>

    <!-- 最近素材 -->
    <section class="section" style="padding-bottom:var(--sec-gap-lg)" v-reveal="80">
      <div class="sec-head">
        <h2>最近素材</h2><span class="count">{{ assets.assets.length }} 项</span>
        <router-link class="sec-link" to="/assets">资产库<Icon name="chevR" /></router-link>
      </div>
      <div class="assets-wrap">
        <div class="assets">
          <AssetCard
            v-for="(a, i) in recentAssets"
            :key="a.id"
            :asset="a"
            :index="i"
            @open="openAsset"
            @act="onAct"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* —— 光谱合成台：输入区即银幕 ——
   高度内容驱动 + min-height 保住 16:5 银幕感：语音/对口型的附加行、
   「高级」展开都向下推挤页面内容，不再回头压缩输入区 */
.composer {
  position:relative; overflow:visible; width:calc(100% - 2 * var(--content-pad)); max-width:var(--content-w); min-height:310px;
  margin:0 auto; padding:22px; border-radius:0 0 16px 16px; display:flex; flex-direction:column;
  background:#23232B; border:1px solid #494153; border-top:0; box-shadow:0 16px 45px #0002;
  transition:border-color .2s;
}
.composer:focus-within { border-color:#9682B6; }
/* 快门：提交时整块面板走一次显影闪光（不阻塞交互） */
.expose {
  position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0;
  background:
    radial-gradient(58% 90% at 50% 44%, rgba(189, 174, 255, .2), transparent 68%),
    linear-gradient(180deg, transparent 40%, rgba(111, 232, 196, .06));
}
.composer.firing .expose { animation: expose-flash .72s var(--ease-out); }
@keyframes expose-flash {
  0% { opacity: 0; }
  16% { opacity: 1; }
  100% { opacity: 0; }
}
.composer-top { position: relative; z-index: 1; flex: 1; display: flex; gap: 16px; }
.prompt-wrap { flex: 1; min-width: 0; display: flex; position: relative; }
.prompt-wrap textarea {
  flex: 1; min-height: 150px; width: 100%; resize: none; overflow-y: auto;
  background: #1B1A22; border: 1px solid #3A3247; border-radius: var(--r-md);
  padding: 16px 18px 46px;
  font-family: var(--font-sans); font-size: var(--fs-15); line-height: 1.8;
  color: var(--text-1);
  transition: border-color var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease), background var(--dur-1);
}
.prompt-wrap textarea::placeholder { color: var(--text-4); font-family: var(--font-sans); font-size: var(--fs-13); line-height: 1.9; }
.prompt-wrap textarea:focus {
  outline: none; border-color: rgba(189, 174, 255, .42);
  background: rgba(14, 14, 14, .74);
  box-shadow: 0 0 0 3px rgba(189, 174, 255, .07);
}
.prompt-tools { position: absolute; left: 12px; bottom: 12px; display: flex; gap: 6px; }

/* 素材槽列：单槽窄列；对口型双槽改为并排横放，随内容自然定高 */
.slots { width: 156px; flex: none; display: flex; flex-direction: column; gap: 10px; }
.slots .slot { flex: 1; min-height: 128px; }
.slots .slot-h { min-height: 96px; }
.slots.dual { width: 330px; flex-direction: row; }
.slots.dual .slot { min-height: 128px; }

/* 音色 */
.voice-row { position: relative; z-index: 1; display: flex; gap: 8px; margin-top: 12px; animation: swap-in .26s var(--ease-out); }
.voice-extra { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s var(--ease); }
.voice-extra.open { grid-template-rows: 1fr; }
.voice-extra > div { overflow: hidden; }
.voice-extra .ref-text-input { margin-top: 10px; }

/* 参数行 */
.param-row {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--stroke-hairline);
}
.adv-toggle { margin-left: auto; }
.adv-grid { display: flex; gap: 12px; padding-top: 14px; }
.adv-grid .field { flex: 1; min-width: 0; }
.slider-field { flex: 0 0 220px; }
.adv.open .adv-grid { animation: swap-in .3s var(--ease-out) .08s both; }

/* 面板脚 */
.composer-foot {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 14px;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--stroke-hairline);
}
.composer-foot .gen-btn { margin-left: auto; }

/* 快捷能力（与面板、区块标题共线） */
.quick {
  max-width: var(--content-outer); margin: 16px auto 0;
  padding: 0 var(--content-pad);
  display: flex; gap: 8px; flex-wrap: wrap;
}
.quick-cap {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 13px; border-radius: var(--r-sm);
  border: 1px solid var(--stroke-1);
  background: rgba(22, 22, 22, .55); color: var(--text-2);
  font-size: var(--fs-12);
  transition: border-color var(--dur-1) var(--ease), color var(--dur-1) var(--ease), background var(--dur-1) var(--ease), transform var(--dur-1) var(--ease);
}
.quick-cap:hover {
  color: var(--text-1); border-color: rgba(189, 174, 255, .38);
  background: rgba(189, 174, 255, .06); transform: translateY(-1px);
}
.quick-cap :deep(svg) { width: 13px; height: 13px; color: var(--text-3); }
.quick-cap:hover :deep(svg) { color: var(--brand-soft); }
.studio-welcome { padding-top:42px; padding-bottom:30px; align-items:center; }
.studio-welcome h1 { font-family:var(--font-sans); font-size:32px; font-weight:500; line-height:1.4; }
.studio-eyebrow { font-size:12px; color:var(--brand); margin-bottom:10px; }
.studio-intro { font-size:14px; color:var(--text-3); margin-top:10px; }
.mode-bar { display:flex; gap:5px; width:calc(100% - 2 * var(--content-pad)); max-width:var(--content-w); margin:auto; padding:9px; background:#23232B; border:1px solid #494153; border-bottom:1px solid #393242; border-radius:16px 16px 0 0; }
.mode-bar button { white-space:nowrap; display:flex; align-items:center; gap:9px; padding:12px 17px; border-radius:8px; font-size:14px; color:var(--text-3); transition:background .2s,color .2s; }
.mode-bar button.chosen { background:#3A304D; color:var(--brand); }
.mode-bar button:hover { color:var(--text-1); }
.mode-bar .mode-model { font-size:10px; opacity:.65; font-family:var(--font-mono); }
.mode-bar :deep(svg) { width:18px; height:18px; }
@media(max-width:1000px) { .mode-bar .mode-model { display:none; }.mode-bar button { padding:11px 13px; } }
@media(max-width:640px) { .studio-welcome h1 { font-size:25px; }.studio-welcome .mock-flag { margin-left:0; }.composer { padding:14px; }.composer-top { flex-direction:column; }.slots,.slots.dual { width:100%; }.mode-bar { gap:0; padding:6px; }.mode-bar button { flex:1; justify-content:center; padding:10px 5px; font-size:12px; gap:5px; }.param-row { flex-wrap:wrap; gap:12px; }.adv-grid { flex-direction:column; } }
</style>
