import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Todo lo que empiece con /api irá a CodeIgniter local
      '/api': {
        target: 'http://localhost:8080/tbhs-actions', // <-- CI local
        changeOrigin: true,
        secure: false,
        // Deja /apis/... tal cual, solo quita el prefijo /api
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    manifest: true,
    outDir: '../projects/assets/react', // o la ruta que uses
    emptyOutDir: true,
    rollupOptions: { input: '/src/main.jsx' },
  },
  base: '/assets/react/',
})
