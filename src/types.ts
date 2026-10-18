/* ============================================================
   领域类型（契约同构 openapi.yaml）
   「UI 字符串即逻辑键」在此终结：状态/类型均为枚举，label 只在展示层
   ============================================================ */

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type JobType =
  | 'image.t2i' | 'image.i2i'
  | 'video.t2v' | 'video.i2v'
  | 'audio.tts'
  | 'video.lipsync'

export interface JobError {
  code: string
  msg: string
}

export interface Job {
  id: string
  type: JobType
  prompt: string
  status: JobStatus
  /** 排队位次（queued 时展示） */
  pos?: number
  /** running 起始时间戳（ms） */
  startedAt?: number
  /** 结束时间戳（ms） */
  doneAt?: number
  /** 预计耗时（秒，capabilities tier 提供） */
  eta?: number
  err?: JobError
  /** 缩略图（mock：占位配方 dataURI） */
  thumb?: string
  /** 展示字段（任务行副信息） */
  res?: string
  took?: string
  time?: string
  /** 成片时长标签（视频/音频卡角标，如 0:05） */
  dur?: string
  /** 提交来源（composer / 工坊 key）：工坊「本次会话」按此过滤 */
  origin?: string
}

export type AssetKind = 'image' | 'video' | 'audio' | 'lipsync'

export interface Asset {
  id: string
  kind: AssetKind
  name: string
  /** 瀑布流高度（图片类） */
  h?: number
  /** 占位配方种子 */
  seed: string
  /** 时长标签（音视频） */
  dur?: string
  /** 来源：Flux / LTXV / F5TTS / MuseTalk / 上传 / 生成 */
  origin: string
  /** 可发起的流转动作 */
  acts: string[]
  /** 排序序（越大越新） */
  ts?: number
  /** 体积 MB */
  size?: number
}

export type GenTypeId = 'image' | 'video' | 'voice' | 'lipsync'

export interface GenType {
  id: GenTypeId
  label: string
  icon: string
  tag: string
  desc: string
}

export interface Tier {
  id: string
  label: string
  res: string
  etaTxt: string
  eta: number
}

export interface VoiceOption {
  id: string
  label: string
  preset: boolean
}

export interface Capabilities {
  types: GenType[]
  aspects: Record<GenTypeId, string[]>
  tiers: Record<GenTypeId, Tier[]>
  voices: VoiceOption[]
  assistant: { model: string; greeting: string }
}

/** 素材引用（上传槽的值） */
export interface FileRef {
  url: string
  name: string
}

/** 灯箱动作 */
export interface LightboxAction {
  label: string
  icon?: string
  primary?: boolean
  run: () => void
}

export interface LightboxPayload {
  kind: AssetKind
  title: string
  /** 缩略 seed（无 src 时用占位配方）；音色类渲染波形 */
  seed?: string
  src?: string
  dur?: string
  rows: Array<[string, string]>
  actions: LightboxAction[]
}
