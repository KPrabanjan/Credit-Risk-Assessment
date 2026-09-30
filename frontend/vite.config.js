import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies /api/* to your Flask server during `npm run dev`, so the
// browser sees everything as same-origin and you don't need flask-cors
// for local dev. Run Flask with: python backend/api.py (127.0.0.1:5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
