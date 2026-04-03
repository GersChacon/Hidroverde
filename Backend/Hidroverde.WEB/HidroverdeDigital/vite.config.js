import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7067',
        changeOrigin: true,
        secure: false,
      },
      '/swagger': {
        target: 'https://localhost:7067',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
