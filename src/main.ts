import { createApp } from 'vue'
import { createPinia } from 'pinia'

/* 字体自托管（内网部署不依赖 CDN） */
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/cascadia-code/400.css'
import '@fontsource/cascadia-code/600.css'

/* 设计系统：令牌 → 基线 → 氛围 → 共享组件 → 运动 */
import './styles/tokens.css'
import './styles/base.css'
import './styles/atmosphere.css'
import './styles/ui.css'
import './styles/motion.css'
import './styles/studio.css'

import App from './App.vue'
import router from './router'
import { vReveal, vLight, vTilt } from './directives/motion'

createApp(App)
  .use(createPinia())
  .use(router)
  .directive('reveal', vReveal)
  .directive('light', vLight)
  .directive('tilt', vTilt)
  .mount('#app')
