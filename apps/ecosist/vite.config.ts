import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ecosist/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/ecosist': {
        target: 'https://aliasist-workers-api.bchooper0730.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ecosist/, '/eco'),
      },
    },
  },
})
