import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Job, JobType } from '../types'
import { kindOfJobType } from '../constants/nav'
import { placeholder } from '../utils/placeholder'
import { shortId } from '../utils/format'
import { useAssetsStore } from './assets'
import { useUiStore } from './ui'

/* 初始样例（契约同构 openapi.yaml /jobs；与原型 jobs.html 同一套演示数据） */
function seedJobs(): Job[] {
  const now = Date.now()
  return [
    { id: 'job_c77m', type: 'video.i2v', prompt: '黄昏天台，研究员望着远处的城市，镜头缓缓推近', status: 'running', startedAt: now - 47e3, eta: 180, res: '768 × 512' },
    { id: 'job_k81v', type: 'audio.tts', prompt: '大家好，欢迎体验视听工作站。您现在看到的动态画面与同步口型，都由生成管线驱动。', status: 'succeeded', took: '11 秒', time: '今天 14:07', res: '— · 预设女声' },
    { id: 'job_e68q', type: 'video.t2v', prompt: '雨夜街道，霓虹灯牌倒影在湿滑路面，镜头缓慢横移', status: 'queued', pos: 1, eta: 180, res: '768 × 512' },
    { id: 'job_a51f', type: 'video.i2v', prompt: '清晨薄雾中的山脊线，无人机视角缓缓前推', status: 'succeeded', took: '2 分 41 秒', time: '今天 13:58', res: '768 × 512' },
    { id: 'job_b92k', type: 'image.t2i', prompt: '新闻主播半身像，藏青西装，柔和工作室光，写实风格', status: 'succeeded', took: '28 秒', time: '今天 13:21', res: '1024 × 576' },
    { id: 'job_p43n', type: 'audio.tts', prompt: '本期节目，我们聊聊本地推理与内容生产的几种组合方式。', status: 'succeeded', took: '9 秒', time: '今天 12:47', res: '— · 预设男声' },
    { id: 'job_d34x', type: 'video.lipsync', prompt: '主播口播成片 · 对口型合成', status: 'succeeded', took: '31 秒', time: '今天 12:30', res: '768 × 512' },
    { id: 'job_m29t', type: 'image.t2i', prompt: '水墨山峦叠嶂，留白构图，飞白笔触', status: 'succeeded', took: '26 秒', time: '今天 11:52', res: '1024 × 1024' },
    { id: 'job_q57w', type: 'video.t2v', prompt: '海底光缆检修机器人，探照灯扫过沉积物，镜头环绕', status: 'succeeded', took: '3 分 05 秒', time: '今天 11:20', res: '768 × 512' },
    { id: 'job_r82y', type: 'image.i2i', prompt: '参考图重绘：改成黄昏色调，保持构图', status: 'succeeded', took: '31 秒', time: '今天 10:44', res: '1024 × 576' },
    { id: 'job_s15u', type: 'audio.tts', prompt: '开场白：夜色渐深，故事才刚刚开始。', status: 'succeeded', took: '7 秒', time: '今天 10:31', res: '— · 预设女声' },
    { id: 'job_t63i', type: 'video.lipsync', prompt: '侧拍采访片段 · 口型同步', status: 'succeeded', took: '36 秒', time: '今天 09:58', res: '768 × 512' },
    { id: 'job_f19r', type: 'image.t2i', prompt: '夜景城市全景，冷蓝色调，景深虚化', status: 'failed', err: { code: 'NODE_ERROR', msg: 'CUDA out of memory. Tried to allocate 2.50 GiB (GPU 0, 30.9GiB total)' }, time: '今天 09:12', res: '1280 × 720' },
    { id: 'job_g02s', type: 'audio.tts', prompt: '这段台词在提交后被手动取消。', status: 'cancelled', time: '今天 08:40', res: '— · 预设女声' },
  ]
}

/**
 * 任务队列（mock 状态机：queued →1.4s→ running → eta 加权 → succeeded）
 *
 * 状态变更一律走 patchJob（数组条目替换，不可变更新）：引用变化 = props 变化，
 * 组件更新由 Vue 的浅比较保证——不依赖「数组内对象字段变更」的深层触发
 * （该链路在浅响应 props + 子组件组合下不可靠，实测会漏更新）。
 * 页面组件只与本 store 交互；live 模式（M4）改为 SSE 事件驱动同一 patch。
 */
export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>(seedJobs())

  /** 全局秒针：驱动 running 计时展示；无活动任务时停止 */
  const now = ref(Date.now())
  let tick: number | undefined
  function ensureTick() {
    if (tick) return
    tick = window.setInterval(() => { now.value = Date.now() }, 1000)
  }
  function maybeStopTick() {
    if (activeCount.value === 0 && tick) {
      clearInterval(tick)
      tick = undefined
    }
  }
  if (jobs.value.some(j => j.status === 'running')) ensureTick()

  const activeCount = computed(() =>
    jobs.value.filter(j => j.status === 'queued' || j.status === 'running').length,
  )

  function patchJob(id: string, fields: Partial<Job>) {
    jobs.value = jobs.value.map(j => (j.id === id ? { ...j, ...fields } : j))
  }

  const timers = new Map<string, number[]>()

  function schedule(id: string, eta: number) {
    const runDelay = 1300 + Math.random() * 400
    const doneDelay = runDelay + Math.min(12000, Math.max(4000, eta * 100))
    const t1 = window.setTimeout(() => {
      patchJob(id, { status: 'running', pos: undefined, startedAt: Date.now() })
      ensureTick()
    }, runDelay)
    const t2 = window.setTimeout(() => succeed(id), doneDelay)
    timers.set(id, [t1, t2])
  }

  function succeed(id: string) {
    const job = jobs.value.find(j => j.id === id)
    if (!job || job.status !== 'running') return
    const kind = kindOfJobType(job.type)
    const fields: Partial<Job> = {
      status: 'succeeded',
      doneAt: Date.now(),
      thumb: placeholder(job.prompt, kind),
      time: '刚刚',
    }
    if (job.startedAt) {
      const s = Math.round((Date.now() - job.startedAt) / 1000)
      fields.took = s >= 60 ? `${Math.floor(s / 60)} 分 ${String(s % 60).padStart(2, '0')} 秒` : `${s} 秒`
    }
    patchJob(id, fields)
    timers.delete(id)
    maybeStopTick()
    useAssetsStore().addFromJob({ ...job, ...fields } as Job)
    useUiStore().toast('生成完成，已存入资产库', 'ok')
  }

  function submit(p: { type: JobType; prompt: string; eta?: number; res?: string; origin?: string }): Job {
    const job: Job = {
      id: shortId('job'),
      type: p.type,
      prompt: p.prompt,
      status: 'queued',
      pos: activeCount.value + 1,
      eta: p.eta,
      res: p.res,
      origin: p.origin,
    }
    jobs.value = [job, ...jobs.value]
    schedule(job.id, job.eta ?? 30)
    return jobs.value[0]
  }

  function cancel(id: string) {
    const job = jobs.value.find(j => j.id === id)
    if (!job || (job.status !== 'queued' && job.status !== 'running')) return
    timers.get(id)?.forEach(clearTimeout)
    timers.delete(id)
    patchJob(id, { status: 'cancelled', doneAt: Date.now(), time: '刚刚', startedAt: undefined })
    maybeStopTick()
  }

  /** 失败/取消后的重新入队（保留原参数） */
  function retry(id: string) {
    const job = jobs.value.find(j => j.id === id)
    if (!job || (job.status !== 'failed' && job.status !== 'cancelled')) return
    patchJob(id, {
      status: 'queued', pos: activeCount.value + 1,
      err: undefined, took: undefined, thumb: undefined,
    })
    schedule(id, job.eta ?? 30)
    useUiStore().toast('已重新加入队列', 'ok')
  }

  function resubmit(job: Job): Job {
    return submit({ type: job.type, prompt: job.prompt, eta: job.eta, res: job.res, origin: job.origin })
  }

  function clearFinished() {
    jobs.value = jobs.value.filter(j => j.status === 'queued' || j.status === 'running')
  }

  /** 工坊「本次会话」：按来源过滤，单一数据源（跨路由往返不丢） */
  function sessionOf(origin: string) {
    return computed(() => jobs.value.filter(j => j.origin === origin))
  }

  return { jobs, now, activeCount, submit, cancel, retry, resubmit, clearFinished, patchJob, sessionOf }
})
