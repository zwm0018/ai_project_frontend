/* 数据格式化：真数据一律 mono + tabular-nums（tokens 已保证字体侧） */

export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 10) return '刚刚'
  if (s < 60) return `${s} 秒前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d === 1) return '昨天'
  if (d < 7) return `${d} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

export function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

export function clockNow(d = new Date()): string {
  return `今天 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 生成短 id，如 job_k3f2 */
export function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 6)}`
}
