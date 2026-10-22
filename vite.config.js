import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(frontendDir, '..')

// Single source of truth for query intent rules:
// Prefers repo root if available (local dev in monolithic repo),
// falls back to frontend/src/data/rag_scriptures (GitHub Actions and standalone builds).
const sharedRulesDir = fs.existsSync(path.resolve(repoRoot, 'rag_scriptures', 'query_intent_rules.json'))
  ? path.resolve(repoRoot, 'rag_scriptures')
  : path.resolve(frontendDir, 'src', 'data', 'rag_scriptures')

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@shared-rules': sharedRulesDir,
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
    fs: {
      allow: [frontendDir, sharedRulesDir],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
