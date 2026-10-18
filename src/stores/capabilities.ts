import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Capabilities } from '../types'

/** 能力发现（GET /capabilities 单端点契约）
 *  前端不硬编码任何模型信息——升级模型只改这份 mock / 后端返回 */
const MOCK_CAPS: Capabilities = {
  types: [
    { id: 'image', label: '图片', icon: 'image', tag: 'var(--tag-image)', desc: '生成一张静态图像' },
    { id: 'video', label: '视频', icon: 'video', tag: 'var(--tag-video)', desc: '生成带运镜的影片片段' },
    { id: 'voice', label: '语音', icon: 'audio', tag: 'var(--tag-audio)', desc: '朗读文案生成配音' },
    { id: 'lipsync', label: '对口型', icon: 'lipsync', tag: 'var(--tag-lipsync)', desc: '视频与音频合成、同步口型' },
  ],
  aspects: {
    image: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    video: ['16:9', '9:16', '1:1'],
    voice: [],
    lipsync: [],
  },
  tiers: {
    image: [
      { id: 'fast', label: '极速', eta: 15, res: '512~640px 级', etaTxt: '~15 秒' },
      { id: 'standard', label: '标准', eta: 30, res: '1024~1344px 级', etaTxt: '~30 秒' },
      { id: 'ultra', label: '超清', eta: 60, res: '1280~1536px 级', etaTxt: '~1 分钟' },
    ],
    video: [
      { id: 'fast', label: '极速', eta: 60, res: '640×384 级', etaTxt: '~1 分钟' },
      { id: 'standard', label: '标准', eta: 180, res: '768×512 级', etaTxt: '~3 分钟' },
      { id: 'ultra', label: '超清', eta: 420, res: '1024×576 级', etaTxt: '~7 分钟' },
    ],
    voice: [
      { id: 'fast', label: '快速合成', eta: 8, res: '实时级', etaTxt: '~10 秒' },
    ],
    lipsync: [
      { id: 'standard', label: '标准', eta: 25, res: '跟随原视频', etaTxt: '~25 秒' },
    ],
  },
  voices: [
    { id: 'preset-woman', label: '预设女声', preset: true },
    { id: 'preset-man', label: '预设男声', preset: true },
    { id: 'custom', label: '自定义克隆', preset: false },
  ],
  assistant: {
    model: 'qwen2.5-7b',
    greeting: '我是本地助手 qwen2.5-7b。可以帮你润色提示词、写配音文案，或解释这台机器的能力。',
  },
}

export const useCapabilitiesStore = defineStore('capabilities', () => {
  const caps = ref<Capabilities>(MOCK_CAPS)
  return { caps }
})
