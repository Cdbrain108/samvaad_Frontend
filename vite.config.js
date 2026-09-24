import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
// The repo root, one level above frontend/. rag_scriptures/query_intent_rules.json
// lives there and is the single source of truth for verse-count intent and
// scripture routing, shared with rag_engine/query_intent.py. Aliasing it (rather
// than keeping a frontend copy) is what stops the two pipelines drifting apart.
const repoRoot = path.resolve(frontendDir, '..')

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@shared-rules': path.resolve(repoRoot, 'rag_scriptures'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-v3-[hash].js',
        chunkFileNames: 'assets/[name]-v3-[hash].js',
        assetFileNames: 'assets/[name]-v3-[hash].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    // Dev server must be allowed to read the shared rules file above frontend/.
    fs: {
      allow: [frontendDir, path.resolve(repoRoot, 'rag_scriptures')],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
