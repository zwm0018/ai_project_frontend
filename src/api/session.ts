/* 登录会话的本地持久化。
   独立于 Pinia / api client，避免 store 与 client 互相 import 形成环。 */

export interface SessionUser {
  id?: number
  username?: string
  name: string
}

const TOKEN_KEY = 'studio.token'
const USER_KEY = 'studio.user'
const LEGACY_NAME_KEY = 'studio.userName'

function parseUser(raw: string | null): SessionUser | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<SessionUser>
    return typeof value.name === 'string' && value.name ? (value as SessionUser) : null
  } catch {
    return null
  }
}

export function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function readUser(): SessionUser | null {
  const localToken = localStorage.getItem(TOKEN_KEY)
  const sessionToken = sessionStorage.getItem(TOKEN_KEY)
  const store = localToken ? localStorage : sessionToken ? sessionStorage : null
  const stored = parseUser(store?.getItem(USER_KEY) ?? null)
  if (stored) return stored
  const legacyName = store
    ? store.getItem(LEGACY_NAME_KEY)
    : localStorage.getItem(LEGACY_NAME_KEY) ?? sessionStorage.getItem(LEGACY_NAME_KEY)
  return legacyName ? { name: legacyName } : null
}

export function isRemembered(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null
}

export function saveSession(token: string, user: SessionUser, remember: boolean): void {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
  store.setItem(LEGACY_NAME_KEY, user.name)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LEGACY_NAME_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(LEGACY_NAME_KEY)
}
