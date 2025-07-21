import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          video: ['video.js', 'simple-peer'],
          socket: ['socket.io-client'],
          state: ['zustand']
        }
      }
    },
    // Increase chunk size warning limit to 800kb (from default 500kb)
    chunkSizeWarningLimit: 800
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  }
})
