import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // stellar-sdk uses Buffer and process
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    // stellar-sdk is large by nature; suppress the warning
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'stellar': ['@stellar/stellar-sdk'],
          'freighter': ['@stellar/freighter-api'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
