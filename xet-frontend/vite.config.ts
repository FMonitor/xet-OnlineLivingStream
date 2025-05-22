import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'emoji-picker'
        }
      }
    }),
    vueDevTools(),
  ],   
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 将 /api 开头的请求代理到后端服务
      '/home': {
        target: 'http://lcmonitor.dynv6.net/home',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/user': {
        target: 'http://lcmonitor.dynv6.net/user',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
  base: './',
})
