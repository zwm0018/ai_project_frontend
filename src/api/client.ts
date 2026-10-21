/* ============================================================
   API 统一封装（REST；SSE 待任务中心接入）
   mock 模式：数据与状态机在 Pinia stores 内（jobs/assets/auth）。
   live 模式：认证走 FastAPI；其余 store 可按同一 api 对象逐个迁移。
   ============================================================ */

import { readToken } from './session'

export const API_MODE: 'mock' | 'live' =
  (import.meta.env.VITE_API_MODE as 'mock' | 'live' | undefined) ?? 'mock'

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://127.0.0.1:8000/api/v1'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown }
    if (typeof body?.detail === 'string') return body.detail
    if (Array.isArray(body?.detail)) {
      const first = body.detail[0] as { msg?: string } | undefined
      if (first?.msg) return first.msg
    }
  } catch {
    /* 非 JSON 错误响应走状态码兜底 */
  }
  return `${res.status} ${res.statusText}`
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = readToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(API_BASE + path, { ...init, headers })
  } catch {
    throw new ApiError(0, '无法连接后端，请确认 FastAPI 已启动')
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export interface AuthUserDto {
  id: number
  username: string
  display_name: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUserDto
}

export const api = {
  mode: API_MODE,
  getSystemStatus: () => req('/system/status'),
  getCapabilities: () => req('/capabilities'),
  createJob: (body: unknown) =>
    req('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  cancelJob: (id: string) => req(`/jobs/${id}/cancel`, { method: 'POST' }),
  login: (body: { username: string; password: string }) =>
    req<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => req<AuthUserDto>('/auth/me'),
  logout: () => req<void>('/auth/logout', { method: 'POST' }),
}
