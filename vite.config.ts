import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, host: '127.0.0.1', strictPort: false,
    watch: {
      /* 外部编辑器/其它会话的原子写入会短暂产生 .*.tmpdir 目录，
         chokidar 在 Windows 上 watch 它们会 EBUSY 直接崩掉 dev server */
      ignored: ['**/.*.tmpdir/**', '**/*.tmp'],
    },
  },
  preview: { port: 4173, host: '127.0.0.1' },
})
