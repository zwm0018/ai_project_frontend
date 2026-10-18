/* ============================================================
   导航与映射 单一来源（从 shell.js 迁移，key 为逻辑键而非 UI 文案）
   ============================================================ */
import type { AssetKind, GenType, JobStatus, JobType } from '../types'

export interface NavItem {
  key: string
  to: string
  label: string
  icon: string
  v1?: boolean
  badge?: boolean
}

export const NAV: Array<{ group: string | null; items: NavItem[] }> = [
  { group: null, items: [{ key: 'landing', to: '/', label: '主页', icon: 'home' }] },
  {
    group: '创作', items: [
      { key: 'studio', to: '/home', label: '合成器', icon: 'sparkle' },
      { key: 'image', to: '/studio/image', label: '图片工坊', icon: 'image' },
      { key: 'video', to: '/studio/video', label: '视频工坊', icon: 'video' },
      { key: 'voice', to: '/studio/voice', label: '语音工坊', icon: 'mic' },
      { key: 'lipsync', to: '/studio/lipsync', label: '唇形工坊', icon: 'lipsync' },
    ],
  },
  { group: '项目', items: [{ key: 'projects', to: '/projects', label: '我的剧集', icon: 'grid', v1: true }] },
  {
    group: '资产', items: [
      { key: 'assets', to: '/assets', label: '资产库', icon: 'box' },
      { key: 'characters', to: '/characters', label: '角色库', icon: 'person', v1: true },
    ],
  },
  {
    group: '运行', items: [
      { key: 'jobs', to: '/jobs', label: '任务中心', icon: 'clock', badge: true },
      { key: 'settings', to: '/settings', label: '设置', icon: 'gear' },
    ],
  },
]

/** 模态 → 配色/图标/文案 */
export const KIND: Record<AssetKind, { tag: string; ico: string; label: string }> = {
  image: { tag: 'var(--tag-image)', ico: 'image', label: '图片' },
  video: { tag: 'var(--tag-video)', ico: 'video', label: '视频' },
  audio: { tag: 'var(--tag-audio)', ico: 'audio', label: '音频' },
  lipsync: { tag: 'var(--tag-lipsync)', ico: 'lipsync', label: '对口型' },
}

export const STATUS: Record<JobStatus, { label: string; cls: string }> = {
  queued: { label: '排队中', cls: 'b-queued' },
  running: { label: '生成中', cls: 'b-running' },
  succeeded: { label: '已完成', cls: 'b-done' },
  failed: { label: '失败', cls: 'b-fail' },
  cancelled: { label: '已取消', cls: 'b-cancel' },
}

/** 生成类型（合成器下拉/工坊档位共用；label 仅展示层） */
export const GEN_TYPES: GenType[] = [
  { id: 'image', label: '图片', icon: 'image', tag: 'var(--tag-image)', desc: '生成一张静态图像' },
  { id: 'video', label: '视频', icon: 'video', tag: 'var(--tag-video)', desc: '生成带运镜的影片片段' },
  { id: 'voice', label: '语音', icon: 'audio', tag: 'var(--tag-audio)', desc: '朗读文案生成配音' },
  { id: 'lipsync', label: '对口型', icon: 'lipsync', tag: 'var(--tag-lipsync)', desc: '视频与音频合成、同步口型' },
]

export function kindOfJobType(type: JobType): AssetKind {
  if (type.startsWith('image.')) return 'image'
  if (type === 'audio.tts') return 'audio'
  if (type === 'video.lipsync') return 'lipsync'
  return 'video'
}

export const ORIGIN_OF_KIND: Record<AssetKind, string> = {
  image: 'Flux', video: 'LTXV', audio: 'F5TTS', lipsync: 'MuseTalk',
}

/** 任务行展示用的模型全名 */
export const MODEL_OF_KIND: Record<AssetKind, string> = {
  image: 'Flux', video: 'LTX-Video', audio: 'F5-TTS', lipsync: 'MuseTalk',
}

export const EXT_OF_KIND: Record<AssetKind, string> = {
  image: 'png', video: 'mp4', audio: 'wav', lipsync: 'mp4',
}

export const ACTS_OF_KIND: Record<AssetKind, string[]> = {
  image: ['发视频首帧', '做图生图参考'],
  video: ['发唇形工坊', '抓取末帧'],
  audio: ['发唇形工坊'],
  lipsync: [],
}
