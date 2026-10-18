<script setup lang="ts">
/* 登录：「进入暗房前的一道门帘」
   收敛光斑场（暖光斑聚拢在卡后，AtmosphereLayer login 模式已处理）+ 阵列隐去；
   登录成功：光斑扩散转场 → 工作台，点阵列表随之浮现（帘后秩序） */
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'
import { gsap, prefersReduced } from '../gsap'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const remember = ref(true)
const err = ref('')
const busy = ref(false)
const card = ref<HTMLElement | null>(null)
const veil = ref<HTMLElement | null>(null)

async function submit() {
  if (busy.value) return
  err.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    err.value = '请输入用户名与密码'
    shake()
    return
  }
  busy.value = true
  try {
    await auth.login(username.value, password.value, remember.value)
    bloomToWorkspace()
  } catch (e) {
    err.value = e instanceof Error ? e.message : '登录失败'
    busy.value = false
    shake()
  }
}

function shake() {
  if (!card.value || prefersReduced()) return
  gsap.fromTo(card.value,
    { x: 0 },
    { x: 0, duration: .42, ease: 'power1.out',
      keyframes: [{ x: -7 }, { x: 6 }, { x: -4 }, { x: 2 }, { x: 0 }] })
}

/* 成功转场：暖光扩散盖过全屏 → 进工作台（阵列在壳内浮现） */
function bloomToWorkspace() {
  const done = () => {
    const redirect = (route.query.redirect as string) || '/home'
    router.push(redirect)
  }
  if (prefersReduced() || !veil.value) { done(); return }
  gsap.set(veil.value, { display: 'block' })
  gsap.fromTo(veil.value,
    { opacity: 0 },
    { opacity: 1, duration: .55, ease: 'power2.in', onComplete: done })
}

onMounted(() => {
  if (!prefersReduced() && card.value) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.login-brand', { y: 10, autoAlpha: 0, duration: .5 }, 0)
      .from('.login-welcome', { y: 14, autoAlpha: 0, duration: .6 }, .12)
      .from(card.value, { y: 22, autoAlpha: 0, duration: .65 }, .2)
      .from('.login-foot', { autoAlpha: 0, duration: .5 }, .5)
    window.setTimeout(() => { if (tl.progress() < 1) tl.progress(1) }, 1400)
  }
})
</script>

<template>

  <div class="login-portal" aria-hidden="true">
    <span class="portal-glow"></span>
    <span class="portal-ring"></span>
    <span class="portal-ring portal-ring--2"></span>
  </div>

  <main class="login">
    <div class="login-inner">
      <div class="login-brand">
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="wordmark">AI STUDIO</span>
        <span class="brand-sub">视听工作站</span>
      </div>

      <form ref="card" class="login-card" @submit.prevent="submit">
        <span class="card-lamp" aria-hidden="true"></span>
        <h1 class="login-welcome">欢迎回到创作现场</h1>

        <div class="field">
          <label for="lg-user">用户名</label>
          <input
            id="lg-user"
            v-model="username"
            class="form-input"
            type="text"
            autocomplete="username"
            placeholder="输入演示用户名"
            :aria-invalid="!!err"
          >
        </div>
        <div class="field">
          <label for="lg-pass">密码</label>
          <input
            id="lg-pass"
            v-model="password"
            class="form-input"
            type="password"
            autocomplete="current-password"
            placeholder="任意密码"
            :aria-invalid="!!err"
          >
        </div>

        <label class="remember">
          <input v-model="remember" type="checkbox">
          记住我
        </label>

        <p v-if="err" class="login-err" role="alert"><Icon name="warn" />{{ err }}</p>

        <button class="gen-btn login-btn" type="submit" :disabled="busy">
          <span v-if="!busy">进入工作台</span>
          <span v-else class="dots" aria-label="登录中"><i></i><i></i><i></i></span>
        </button>

        <p class="login-tip">Mock 演示：任意非空凭据即可进入 · 真实认证 M5 接入</p>
      </form>

      <p class="login-foot">研究组 · 内网部署 · v0.1</p>
    </div>

    <div ref="veil" class="login-veil" aria-hidden="true"></div>
  </main>
</template>

<style scoped>
.login {
  position: relative; z-index: 10;
  height: 100vh; display: grid; place-items: center;
  overflow: hidden;
}
/* —— 门帘：安全灯环 + 呼吸辉光 —— */
.login-portal {
  position: absolute; inset: 0; z-index: 5;
  display: grid; place-items: center; pointer-events: none;
}
.portal-glow {
  position: absolute; width: min(860px, 92vw); height: min(860px, 92vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(189, 174, 255, .09) 0%, transparent 38%), radial-gradient(circle, rgba(30, 88, 96, .26) 0%, rgba(16, 28, 35, .12) 38%, transparent 64%);
  animation: portal-breathe 11s ease-in-out infinite alternate;
}
.portal-ring {
  position: absolute; width: min(560px, 74vw); height: min(560px, 74vw);
  border-radius: 50%;
  border: 1px solid rgba(190, 225, 220, .1);
  animation: portal-turn 90s linear infinite;
}
.portal-ring::before {
  content: ""; position: absolute; inset: -1px; border-radius: 50%;
  border: 1px solid transparent;
  border-top-color: rgba(210, 240, 235, .32);
  border-right-color: rgba(189, 174, 255, .12);
  filter: blur(.2px);
  transform: rotate(0deg);
}
.portal-ring--2 {
  width: min(690px, 84vw); height: min(690px, 84vw);
  border-color: rgba(190, 225, 220, .05);
  animation-duration: 140s;
  animation-direction: reverse;
}
@keyframes portal-turn { to { transform: rotate(360deg); } }
@keyframes portal-breathe {
  from { opacity: .55; transform: scale(.97); }
  to   { opacity: 1; transform: scale(1.04); }
}

.login-inner {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  width: min(408px, calc(100vw - 48px));
}
.login-brand { display: flex; align-items: center; gap: 10px; }
.brand-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 14px rgba(189, 174, 255, .6);
}
.wordmark { font-size: var(--fs-13); font-weight: 600; letter-spacing: .18em; }
.brand-sub {
  margin-left: 4px; padding-left: 10px;
  border-left: 1px solid var(--stroke-1);
  font-size: 10px; color: var(--text-4); letter-spacing: .12em;
}

.login-card {
  position: relative; width: 100%; overflow: hidden;
  border-radius: var(--r-xl);
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(189, 174, 255, .055), transparent 55%),
    linear-gradient(165deg, rgba(44, 52, 64, .5) 0%, rgba(24, 28, 36, .62) 58%, rgba(14, 17, 22, .7) 100%);
  backdrop-filter: blur(26px) saturate(1.35);
  -webkit-backdrop-filter: blur(26px) saturate(1.35);
  border: 1px solid rgba(255, 255, 255, .16);
  box-shadow: 0 36px 96px rgba(0, 0, 0, .6), inset 0 1px 0 rgba(255, 255, 255, .14);
  padding: 30px 26px 22px;
  display: flex; flex-direction: column; gap: 15px;
  transition: border-color .2s var(--ease), box-shadow .3s var(--ease);
}
.login-card::after {
  content: ""; position: absolute; inset: 7px; pointer-events: none;
  border: 1px solid rgba(255, 255, 255, .05);
  border-radius: var(--r-lg);
}
.card-lamp {
  position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(170, 215, 255, .5), rgba(111, 232, 196, .25), transparent);
}
.login-card:focus-within {
  border-color: rgba(189, 174, 255, .42);
  box-shadow: 0 36px 96px rgba(0, 0, 0, .6), inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 48px -8px rgba(189, 174, 255, .2);
}
.login-welcome {
  position: relative; z-index: 1;
  font-family: var(--font-serif);
  font-size: var(--fs-30); font-weight: 600; letter-spacing: .01em;
  text-align: center; margin-bottom: 5px;
}
.login-card .field { position: relative; z-index: 1; }
.login-card .field label {
  display: block; font-size: var(--fs-10_5); color: var(--text-4);
  letter-spacing: .08em; margin-bottom: 6px;
}
.login-card .form-input {
  font-family: var(--font-sans);
  padding: 10px 12px;
  background: rgba(0, 0, 0, .55);
  border-color: var(--stroke-1);
}
.login-card .form-input:focus { background: rgba(0, 0, 0, .8); }

.remember {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-12); color: var(--text-3); cursor: pointer;
  user-select: none;
}
.remember input { accent-color: var(--brand); width: 13px; height: 13px; }

.login-err {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-12); color: var(--err);
  border: 1px solid color-mix(in srgb, var(--err) 32%, transparent);
  background: color-mix(in srgb, var(--err) 7%, transparent);
  border-radius: var(--r-sm); padding: 7px 10px;
}
.login-err :deep(svg) { width: 12px; height: 12px; flex: none; }

.login-btn { position: relative; z-index: 1; width: 100%; padding: 11px 22px; margin-top: 2px; }
/* 登录中：按钮内三点呼吸 */
.dots { display: inline-flex; gap: 5px; align-items: center; }
.dots i {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--brand-ink);
  animation: dots-breath 1.2s var(--ease) infinite;
}
.dots i:nth-child(2) { animation-delay: .2s; }
.dots i:nth-child(3) { animation-delay: .4s; }
@keyframes dots-breath {
  0%, 100% { opacity: .3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.login-tip {
  position: relative; z-index: 1;
  font-size: var(--fs-10_5); color: var(--text-4); text-align: center;
}
.login-foot {
  font-size: var(--fs-10_5); color: var(--text-4); letter-spacing: .06em;
}

/* 成功转场：暖光扩散盖幕 */
.login-veil {
  display: none; position: absolute; inset: 0; z-index: 50; pointer-events: none;
  background:
    radial-gradient(60% 50% at 50% 46%, rgba(189, 174, 255, .55) 0%, rgba(189, 174, 255, .18) 45%, transparent 75%),
    linear-gradient(180deg, rgba(8, 9, 11, .4), rgba(8, 9, 11, .9));
}

@media (max-width: 760px) {
  .login-card { padding: 26px 20px 20px; }
  .login-welcome { font-size: var(--fs-22); }
  .portal-ring { width: 88vw; height: 88vw; }
  .portal-ring--2 { width: 96vw; height: 96vw; }
}
.login { background:radial-gradient(ellipse at 50% 30%,#59417033,transparent 65%),#16171B; }
.login-card { background:#20251c; border-color:#414c33; box-shadow:0 30px 80px #0003; }
.login-card h1 { font-family:var(--font-sans); font-size:30px; }
.brand-dot { box-shadow:none; }.wordmark { letter-spacing:0; font-size:18px; }
@media(max-width:540px) { .login-inner { max-width:calc(100vw - 32px); } }
</style>
