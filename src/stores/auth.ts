import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { API_MODE, ApiError, api, type AuthUserDto } from '../api/client'
import {
  clearSession,
  isRemembered,
  readToken,
  readUser,
  saveSession,
  type SessionUser,
} from '../api/session'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function mapUser(user: AuthUserDto): SessionUser {
  return {
    id: user.id,
    username: user.username,
    name: user.display_name || user.username,
  }
}

function loginError(error: unknown): Error {
  if (error instanceof ApiError) {
    if (error.status === 401) return new Error('用户名或密码错误')
    if (error.status === 0) return new Error(error.message)
    return new Error(error.message || '登录失败，请稍后重试')
  }
  return error instanceof Error ? error : new Error('登录失败，请稍后重试')
}

/** 认证：mock 模式任意非空凭据通过；live 模式调用 FastAPI /auth/login。 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readToken())
  const user = ref<SessionUser | null>(readUser())
  /** live 模式下本地 token 是否已向后端验证过；mock 无需验证。 */
  const validated = ref(API_MODE === 'mock')

  const isAuthed = computed(() => !!token.value)

  function applySession(nextToken: string, nextUser: SessionUser, remember: boolean) {
    token.value = nextToken
    user.value = nextUser
    validated.value = true
    saveSession(nextToken, nextUser, remember)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    validated.value = API_MODE === 'mock'
    clearSession()
  }

  async function login(username: string, password: string, remember = true) {
    const name = username.trim()
    if (!name || !password.trim()) throw new Error('请输入用户名与密码')

    if (API_MODE === 'mock') {
      await sleep(900)
      applySession('mock_' + Math.random().toString(36).slice(2, 10), { name: name.slice(0, 12) }, remember)
      return
    }

    try {
      const result = await api.login({ username: name, password })
      applySession(result.access_token, mapUser(result.user), remember)
    } catch (error) {
      throw loginError(error)
    }
  }

  /** 路由守卫调用：live 模式下用 /auth/me 验证本地 token 是否仍有效。 */
  async function ensureSession(): Promise<boolean> {
    const currentToken = token.value
    if (!currentToken) return false
    if (API_MODE === 'mock' || validated.value) return true
    try {
      const current = await api.me()
      const nextUser = mapUser(current)
      user.value = nextUser
      saveSession(currentToken, nextUser, isRemembered())
      validated.value = true
      return true
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuth()
        return false
      }
      // 后端暂时不可达时保留本地会话；真正失效会在 401 时清理。
      return true
    }
  }

  function logout() {
    if (API_MODE === 'live' && token.value) {
      void api.logout().catch(() => { /* 本地退出不依赖服务端 */ })
    }
    clearAuth()
  }

  /** DEV 截图 / E2E 跳板使用，不参与真实认证。 */
  function devLogin(displayName = '研究员') {
    applySession('dev_headless', { name: displayName }, true)
  }

  return { token, user, isAuthed, login, logout, ensureSession, devLogin }
})
