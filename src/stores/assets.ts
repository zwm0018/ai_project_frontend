import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Asset, Job } from '../types'
import { ACTS_OF_KIND, EXT_OF_KIND, ORIGIN_OF_KIND, kindOfJobType } from '../constants/nav'

function hhmm(d = new Date()) {
  return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`
}

/* 初始样例（与原型 assets.html 同构；ts 越大越新，size 单位 MB） */
const SEED: Asset[] = [
  { id: 'asset_1', kind: 'image', name: 'Flux_新闻主播_1030.png', h: 210, seed: 'anchor-portrait', origin: 'Flux', ts: 15, size: 2.1, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_2', kind: 'video', name: 'LTXV_雨夜街景_1012.mp4', h: 118, seed: 'neon-street', origin: 'LTXV', ts: 14, size: 8.4, dur: '0:05', acts: ['发唇形工坊', '抓取末帧'] },
  { id: 'asset_3', kind: 'image', name: 'Flux_工作室全景_0941.png', h: 150, seed: 'studio-wide', origin: 'Flux', ts: 13, size: 1.8, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_4', kind: 'audio', name: 'F5TTS_片头旁白_1005.wav', seed: '片头旁白', origin: 'F5TTS', ts: 12, size: 1.9, dur: '0:11', acts: ['发唇形工坊'] },
  { id: 'asset_5', kind: 'video', name: 'LTXV_天台日落_0930.mp4', h: 152, seed: 'anchor-smile', origin: 'LTXV', ts: 11, size: 8.1, dur: '0:05', acts: ['发唇形工坊'] },
  { id: 'asset_6', kind: 'lipsync', name: 'MuseTalk_口播成片_1740.mp4', h: 118, seed: 'lipsync-merge', origin: 'MuseTalk', ts: 10, size: 11.2, dur: '0:08', acts: [] },
  { id: 'asset_7', kind: 'image', name: '上传_角色定妆照_0928.png', h: 172, seed: 'ref-photo', origin: '上传', ts: 9, size: 3.4, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_8', kind: 'image', name: 'Flux_水墨山峦_1655.png', h: 130, seed: 'ink-mountain', origin: 'Flux', ts: 8, size: 1.6, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_9', kind: 'audio', name: 'F5TTS_台词_夜色_1610.wav', seed: '台词夜色', origin: 'F5TTS', ts: 7, size: 1.2, dur: '0:07', acts: ['发唇形工坊'] },
  { id: 'asset_10', kind: 'image', name: 'Flux_机甲概念_1551.png', h: 190, seed: 'mecha-sketch', origin: 'Flux', ts: 6, size: 2.4, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_11', kind: 'video', name: 'LTXV_海底检修_1520.mp4', h: 118, seed: 'deep-cable', origin: 'LTXV', ts: 5, size: 8.9, dur: '0:05', acts: ['发唇形工坊'] },
  { id: 'asset_12', kind: 'image', name: 'Flux_黄昏街角_1502.png', h: 144, seed: 'dusk-corner', origin: 'Flux', ts: 4, size: 1.7, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_13', kind: 'lipsync', name: 'MuseTalk_采访侧拍_1430.mp4', h: 118, seed: 'interview-side', origin: 'MuseTalk', ts: 3, size: 9.8, dur: '0:06', acts: [] },
  { id: 'asset_14', kind: 'audio', name: 'F5TTS_栏目串场_1408.wav', seed: '栏目串场', origin: 'F5TTS', ts: 2, size: 1.5, dur: '0:09', acts: ['发唇形工坊'] },
  { id: 'asset_15', kind: 'image', name: 'Flux_产品白模_1330.png', h: 160, seed: 'white-model', origin: 'Flux', ts: 1, size: 2.0, acts: ['发视频首帧', '做图生图参考'] },
  { id: 'asset_16', kind: 'video', name: 'LTXV_云海延时_1255.mp4', h: 118, seed: 'cloud-sea', origin: 'LTXV', ts: 0, size: 7.6, dur: '0:04', acts: ['发唇形工坊'] },
]

/** 资产库（outputs/ 归档的映射；mock 内置样例 + 任务完成自动入库） */
export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>(SEED)

  function addFromJob(job: Job) {
    const kind = kindOfJobType(job.type)
    assets.value.unshift({
      id: `asset_${Date.now().toString(36)}`,
      kind,
      name: `${ORIGIN_OF_KIND[kind]}_${job.prompt.slice(0, 4)}_${hhmm()}.${EXT_OF_KIND[kind]}`,
      h: 140,
      seed: job.prompt,
      dur: kind === 'image' ? undefined : '0:05',
      origin: ORIGIN_OF_KIND[kind],
      acts: ACTS_OF_KIND[kind],
      ts: Math.max(...assets.value.map(a => a.ts ?? 0)) + 1,
      size: +(1 + Math.random() * 8).toFixed(1),
    })
  }

  return { assets, addFromJob }
})
