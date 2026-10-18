<script setup lang="ts">
/* AI 助手抽屉（⌘/Ctrl+K）：mock 流式输出，契约同 POST /assistant/chat SSE */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUiStore } from '../stores/ui'
import { useCapabilitiesStore } from '../stores/capabilities'
import Icon from '../components/Icon.vue'

interface Msg { role: 'user' | 'ai'; text: string; streaming?: boolean }

const ui = useUiStore()
const caps = useCapabilitiesStore()

const msgs = ref<Msg[]>([{ role: 'ai', text: caps.caps.assistant.greeting }])
const input = ref('')
const panel = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
const sending = ref(false)

const QUICK = ['帮我润色提示词', '写一段配音文案', '这台机器能做什么']

/* mock 应答：关键词路由到固定文案；live 模式换成 SSE delta 流 */
function replyFor(q: string): string {
  if (/润色|提示词|prompt/i.test(q)) {
    return '把画面里「有什么」写清楚，比堆华丽词藻更有效。骨架：主体 → 动作/姿态 → 场景 → 光线 → 风格。\n例如：「工作室白模旁散落的显卡与图纸，顶光，写实风格，浅景深」。视频再补一句运镜：「镜头缓缓推近」。'
  }
  if (/配音|旁白|文案|台词/.test(q)) {
    return '配音文案短句更有力，标点决定停顿。给你一段起手式：\n「大家好，欢迎体验视听工作站。您现在看到的画面与声音，全部由本地生成管线驱动——从一张图，到一段影片。」\n需要更正式或更活泼的口吻，告诉我。'
  }
  if (/能做|能力|功能|怎么用|帮助/.test(q)) {
    return '这台机器是一条本地视听管线：生图（Flux）→ 生视频（LTX-Video）→ 配音（F5-TTS）→ 对口型（MuseTalk）。\n合成器一句话发起任意环节；四个工坊提供完整参数控制；产物自动进入资产库，可跨环节流转。'
  }
  return `收到：「${q}」。\n我是本地 mock 助手（qwen2.5-7b 的占位实现，M4 接入真实推理）。目前最擅长：润色提示词、写配音文案、解释工作流。`
}

let typeTimer: number | undefined

function send(text?: string) {
  const q = (text ?? input.value).trim()
  if (!q || sending.value) return
  input.value = ''
  msgs.value.push({ role: 'user', text: q })
  const answer = replyFor(q)
  const m: Msg = { role: 'ai', text: '', streaming: true }
  msgs.value.push(m)
  sending.value = true
  let i = 0
  typeTimer = window.setInterval(() => {
    m.text = answer.slice(0, (i += 2))
    scrollBottom()
    if (i >= answer.length) {
      window.clearInterval(typeTimer)
      m.streaming = false
      sending.value = false
    }
  }, 24)
}

function scrollBottom() {
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
}

function close() { ui.assistantOpen = false }

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    ui.assistantOpen = !ui.assistantOpen
  }
  if (e.key === 'Escape' && ui.assistantOpen) close()
}

onMounted(() => document.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onGlobalKey)
  if (typeTimer) window.clearInterval(typeTimer)
})

watch(() => ui.assistantOpen, async (open) => {
  if (open) {
    await nextTick()
    scrollBottom()
  }
})
</script>

<template>
  <teleport to="body">
    <div v-if="ui.assistantOpen" class="asst-backdrop" @click="close"></div>
    <aside
      v-if="ui.assistantOpen"
      ref="panel"
      class="asst"
      role="dialog"
      aria-modal="false"
      aria-label="AI 助手"
    >
      <div class="asst-head">
        <Icon name="sparkle" />
        <span>AI 助手</span>
        <span class="asst-model">{{ caps.caps.assistant.model }}</span>
        <button class="icon-btn" style="margin-left:auto" aria-label="关闭" @click="close"><Icon name="x" /></button>
      </div>

      <div ref="listEl" class="asst-list">
        <div v-for="(m, i) in msgs" :key="i" class="asst-msg" :class="m.role">
          <div class="asst-bubble">{{ m.text }}<span v-if="m.streaming" class="caret"></span></div>
        </div>
      </div>

      <div class="asst-quick">
        <button v-for="q in QUICK" :key="q" class="chip" @click="send(q)">{{ q }}</button>
      </div>

      <div class="asst-input">
        <textarea
          v-model="input"
          rows="2"
          placeholder="问点什么…（Enter 发送，Shift+Enter 换行）"
          aria-label="发送给 AI 助手"
          @keydown.enter.exact.prevent="send()"
        ></textarea>
        <button class="gen-btn" style="padding:8px 14px" :disabled="!input.trim() || sending" aria-label="发送" @click="send()">
          <Icon name="send" />
        </button>
      </div>
    </aside>
  </teleport>
</template>

<style scoped>
.asst-backdrop {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(0, 0, 0, .4);
}
.asst {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 95;
  width: min(410px, 92vw);
  display: flex; flex-direction: column;
  background:
    radial-gradient(120% 40% at 100% 0%, rgba(189, 174, 255, .06), transparent 60%),
    linear-gradient(180deg, rgba(22, 22, 22, .97) 0%, rgba(14, 14, 14, .98) 100%);
  backdrop-filter: blur(16px) saturate(1.15);
  border-left: 1px solid var(--stroke-1);
  box-shadow: -18px 0 52px rgba(0, 0, 0, .55);
  animation: asst-in .32s var(--ease-out) both;
}
.asst::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(189, 174, 255, .5), rgba(111, 232, 196, .4), transparent);
}
@keyframes asst-in {
  from { transform: translateX(40px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.asst-head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--stroke-hairline);
  font-size: var(--fs-13); font-weight: 600;
}
.asst-head svg { width: 15px; height: 15px; color: var(--brand-soft); }
.asst-model {
  font-family: var(--font-mono); font-size: 10.5px; color: var(--text-4);
  border: 1px solid var(--stroke-1); border-radius: 4px; padding: 0 5px; line-height: 16px;
}
.asst-list {
  flex: 1; overflow-y: auto; padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.asst-bubble {
  max-width: 88%; padding: 9px 12px; border-radius: var(--r-md);
  font-size: var(--fs-12_5); line-height: 1.65; white-space: pre-wrap; word-break: break-word;
}
.asst-msg.user { align-self: flex-end; }
.asst-msg.user .asst-bubble { background: var(--brand-a12); color: var(--text-1); border: 1px solid var(--brand-a20); }
.asst-msg.ai .asst-bubble { background: rgba(255, 255, 255, .045); color: var(--text-2); border: 1px solid var(--stroke-hairline); align-self: flex-start; }
.asst-msg.ai { align-self: flex-start; }
.caret {
  display: inline-block; width: 2px; height: 1em; margin-left: 2px;
  background: var(--brand); vertical-align: text-bottom;
  animation: asst-caret 1s steps(2) infinite;
}
@keyframes asst-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.asst-quick {
  display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 10px;
}
.asst-input {
  display: flex; gap: 8px; align-items: flex-end;
  padding: 12px 14px 14px; border-top: 1px solid var(--stroke-hairline);
}
.asst-input textarea {
  flex: 1; resize: none;
  background: var(--surface-well); border: 1px solid var(--stroke-1); border-radius: var(--r-md);
  padding: 9px 12px; font-size: var(--fs-12_5); color: var(--text-1); line-height: 1.6;
  transition: border-color .15s var(--ease), box-shadow .15s var(--ease);
}
.asst-input textarea:focus {
  outline: none; border-color: rgba(189, 174, 255, .45); box-shadow: 0 0 0 3px var(--brand-a08);
}
</style>
