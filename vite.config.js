import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8888/tbhs-actions',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/api/, ''), // "/api/apis/..." -> "/apis/..."
      }
    }
  },
  base: '/assets/react/',
})
