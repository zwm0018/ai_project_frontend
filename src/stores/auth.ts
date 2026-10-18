import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/** 认证（Mock：任意非空凭据通过；契约 POST /auth/login）
 *  真实认证与多用户队列为 M5，此处只留结构 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('studio.token'))
  const user = ref<{ name: string } | null>(
    token.value ? { name: localStorage.getItem('studio.userName') || '研究员' } : null,
  )

  const isAuthed = computed(() => !!token.value)

  async function login(username: string, password: string, remember = true) {
    if (!username.trim() || !password.trim()) throw new Error('请输入用户名与密码')
    await sleep(900)
    token.value = 'mock_' + Math.random().toString(36).slice(2, 10)
    user.value = { name: username.trim().slice(0, 12) }
    const store = remember ? localStorage : sessionStorage
    store.setItem('studio.token', token.value)
    store.setItem('studio.userName', user.value.name)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('studio.token')
    localStorage.removeItem('studio.userName')
    sessionStorage.removeItem('studio.token')
    sessionStorage.removeItem('studio.userName')
  }

  return { token, user, isAuthed, login, logout }
})
