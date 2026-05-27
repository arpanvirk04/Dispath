import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react(), ],
  server: {
    proxy: {
      '/api': {
        // Route API calls through the gateway so service discovery and CORS apply consistently
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
