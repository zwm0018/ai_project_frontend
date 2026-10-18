import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', atmo: 'login', shell: false },
  },
  {
    path: '/',
    component: () => import('../views/LandingView.vue'),
    meta: { title: 'AI Studio', atmo: 'video', shell: false },
  },
  {
    path: '/',
    component: () => import('../shell/AppShell.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('../views/ComposerView.vue'),
        meta: { title: '创作合成器', atmo: 'video', active: 'studio', requiresAuth: true },
      },
      {
        path: 'studio/image',
        component: () => import('../views/WorkshopImage.vue'),
        meta: { title: '图片工坊', atmo: 'fluid', active: 'image', requiresAuth: true, sub: 'Flux · 文生图 / 图生图' },
      },
      {
        path: 'studio/video',
        component: () => import('../views/WorkshopVideo.vue'),
        meta: { title: '视频工坊', atmo: 'fluid', active: 'video', requiresAuth: true, sub: 'LTX-Video · 文/图生视频' },
      },
      {
        path: 'studio/voice',
        component: () => import('../views/WorkshopVoice.vue'),
        meta: { title: '语音工坊', atmo: 'fluid', active: 'voice', requiresAuth: true, sub: 'F5-TTS · 配音与音色克隆' },
      },
      {
        path: 'studio/lipsync',
        component: () => import('../views/WorkshopLipsync.vue'),
        meta: { title: '唇形工坊', atmo: 'fluid', active: 'lipsync', requiresAuth: true, sub: 'MuseTalk · 对口型合成' },
      },
      {
        path: 'projects',
        component: () => import('../views/Projects.vue'),
        meta: { title: '我的剧集', atmo: 'fluid', active: 'projects', requiresAuth: true },
      },
      {
        path: 'assets',
        component: () => import('../views/AssetsLibrary.vue'),
        meta: { title: '资产库', atmo: 'fluid', active: 'assets', requiresAuth: true },
      },
      {
        path: 'characters',
        component: () => import('../views/Characters.vue'),
        meta: { title: '角色库', atmo: 'fluid', active: 'characters', requiresAuth: true },
      },
      {
        path: 'jobs',
        component: () => import('../views/JobsCenter.vue'),
        meta: { title: '任务中心', atmo: 'fluid', active: 'jobs', requiresAuth: true },
      },
      {
        path: 'settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '设置', atmo: 'fluid', active: 'settings', requiresAuth: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
  /* DEV 专用跳板（headless 截图 / 冒烟）：生产构建不含此路由 */
  ...(import.meta.env.DEV
    ? [{
        path: '/dev/login',
        component: () => import('../views/DevAutoLogin.vue'),
        meta: { title: '开发跳板', atmo: 'fluid', shell: false },
      }]
    : []),
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.isAuthed) {
    return { path: '/home' }
  }
})

router.afterEach((to) => {
  document.title = `${(to.meta.title as string) ?? 'AI Studio'} · AI Studio`
})

export default router
