import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'examples/crm',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/components/crm': resolve('examples/crm/src'),
      '@/components': resolve('packages/ui/src/components'),
      '@/hooks': resolve('packages/ui/src/hooks'),
      '@/lib': resolve('packages/ui/src/lib'),
    },
  },
  server: { port: 5198 },
  build: { outDir: 'dist', emptyOutDir: true },
})
