import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages: 클라이언트 라우트 새로고침 시 SPA로 복귀 */
function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const indexHtml = resolve(process.cwd(), 'dist/index.html')
      const notFoundHtml = resolve(process.cwd(), 'dist/404.html')
      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, notFoundHtml)
      }
    },
  }
}

export default defineConfig({
  base: '/EK_character_guide/',
  plugins: [react(), spaFallback404()],
  server: {
    host: '0.0.0.0',
    port: 5500,
    strictPort: true,
    open: false,
  },
})
