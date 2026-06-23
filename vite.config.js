import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 1000,
    headers: {
      'Cache-Control': 'no-store',
    },
    watch: {
      usePolling: true,
    },
  },
})
