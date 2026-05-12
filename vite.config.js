import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteLocalApiPlugin } from './server/vite-local-api.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mergedEnv = { ...process.env, ...env }

  return {
    plugins: [react(), viteLocalApiPlugin(mergedEnv)],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-toast': ['react-hot-toast'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
