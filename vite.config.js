import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Android >= 5']
    })
  ],
  build: {
    target: 'esnext' // Isso impede o erro de "Transforming to es5"
  },
  server: {
    host: true // Libera o IP para a TV Box
  }
})