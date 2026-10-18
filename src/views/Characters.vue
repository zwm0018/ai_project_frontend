<script setup lang="ts">
/* 角色库（V1 预留：结构与视觉占位） */
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'
import { placeholder } from '../utils/placeholder'
import Icon from '../components/Icon.vue'

interface Char {
  id: string
  name: string
  desc: string
  seed: string
  voice: string
  assets: number
}

const CHARS: Char[] = [
  { id: 'c1', name: '林晚', desc: '新闻主播 · 藏青西装 · 柔和棚灯 · 写实', seed: 'anchor-portrait', voice: '预设女声', assets: 12 },
  { id: 'c2', name: '老周', desc: '纪录片旁白 · 沉稳男声 · 冷色外景', seed: 'narrator-zhou', voice: '预设男声', assets: 8 },
  { id: 'c3', name: '阿澈', desc: '科技测评 · 白色摄影棚 · 近景构图', seed: 'tech-bench', voice: '自定义克隆', assets: 15 },
  { id: 'c4', name: '主播小夏', desc: '生活栏目 · 暖色布景 · 半身近景', seed: 'anchor-smile', voice: '预设女声', assets: 6 },
  { id: 'c5', name: '旁白 · 低音', desc: '广告片低音旁白 · 黑场字幕配画', seed: 'deep-cable', voice: '自定义克隆', assets: 3 },
]

const ui = useUiStore()
const router = useRouter()

function openDetail(c: Char) {
  ui.openLightbox({
    kind: 'image',
    title: `${c.name} · 角色卡`,
    seed: 'portrait-' + c.seed,
    rows: [
      ['定妆描述', c.desc],
      ['关联音色', c.voice],
      ['关联资产', `${c.assets} 项`],
      ['镜头基准', '半身 · 平视 · 柔光'],
    ],
    actions: [
      { label: '用 TA 生图', icon: 'image', primary: true, run: () => router.push('/studio/image') },
      { label: '用 TA 配音', icon: 'wave', run: () => router.push('/studio/voice') },
      { label: '编辑', icon: 'gear', run: () => ui.toast('角色编辑（V1 原型示意）', 'ok') },
    ],
  })
}

function quickAct(act: string) {
  if (act === 'image') router.push('/studio/image')
  else if (act === 'voice') router.push('/studio/voice')
  else ui.toast('角色编辑（V1 原型示意）', 'ok')
}
</script>

<template>
  <div>
    <div class="page-head">
      <h1>角色库</h1>
      <span class="v1-flag"><b>V1</b>角色系统预留 · 本页为结构与视觉占位</span>
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="char-grid">
      <div
        v-for="(c, i) in CHARS"
        :key="c.id"
        class="char-card"
        :style="{ '--i': i }"
        tabindex="0"
        v-reveal="Math.min(i, 8) * 55"
        v-tilt
        @click="openDetail(c)"
      >
        <div class="char-portrait">
          <img :src="placeholder('portrait-' + c.seed, 'image')" :alt="c.name">
          <span class="char-initial" aria-hidden="true">{{ c.name.slice(0, 1) }}</span>
        </div>
        <div class="char-acts">
          <button class="act-chip" @click.stop="quickAct('image')"><Icon name="image" />生图</button>
          <button class="act-chip" @click.stop="quickAct('voice')"><Icon name="wave" />配音</button>
          <button class="act-chip" @click.stop="quickAct('edit')"><Icon name="gear" />编辑</button>
        </div>
        <div class="char-veil">
          <div class="char-name">{{ c.name }}</div>
          <div class="char-desc">{{ c.desc }}</div>
          <div class="char-tags">
            <span class="char-tag">{{ c.voice }}</span>
            <span class="char-tag">{{ c.assets }} 项资产</span>
          </div>
        </div>
      </div>
      <div class="new-card" :style="{ '--i': CHARS.length }" tabindex="0" role="button" aria-label="新建角色" v-reveal="CHARS.length * 55" @click="ui.toast('新建角色（V1 原型示意）', 'ok')">
        <Icon name="plus" /><span>新建角色</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v1-flag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-11); color: var(--text-4);
  border: 1px solid var(--stroke-1); border-radius: var(--r-sm); padding: 2px 8px;
}
.v1-flag b { font-weight: 600; color: var(--brand-soft); letter-spacing: .04em; }
.char-acts .act-chip { background: rgba(8, 9, 11, .72); }
/* 不画人形：用首字浮雕 + 抽象光幕做角色版式 */
.char-initial {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  display: grid; place-items: center;
  font-family: var(--font-serif); font-size: 92px; font-weight: 600;
  color: rgba(233, 243, 255, .11);
  text-shadow: 0 0 40px rgba(143, 199, 255, .22);
}
</style>
