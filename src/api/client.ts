/* ============================================================
   API 统一封装（REST + SSE）
   mock 模式（当前）：数据与状态机在 Pinia stores 内（jobs/assets/auth），
     页面组件只访问 store，不感知数据来源。
   live 模式（M4，FastAPI 就绪后）：实现下方 fetch/EventSource 适配，
     store 的 submit/seed 改为调用 api 并订阅 /events，页面层零改动。
   ============================================================ */

export const API_MODE: 'mock' | 'live' =
  (import.meta.env.VITE_API_MODE as 'mock' | 'live' | undefined) ?? 'mock'

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://127.0.0.1:8000/api/v1'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  mode: API_MODE,
  getSystemStatus: () => req('/system/status'),
  getCapabilities: () => req('/capabilities'),
  createJob: (body: unknown) =>
    req('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  cancelJob: (id: string) => req(`/jobs/${id}/cancel`, { method: 'POST' }),
  login: (body: { username: string; password: string }) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
}
