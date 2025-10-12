import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    }
  },
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: '/src/main.tsx',
    },
  },
})
