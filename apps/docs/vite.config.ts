import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { documentationFiles } from './documentation.ts'

const previewDocument = (entry: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRM example</title></head><body><div id="screen-root"></div><script type="module" src="${entry}"></script></body></html>`

export default defineConfig({
  root: 'apps/docs',
  base: '/',
  resolve: {
    alias: {
      '@/components/crm': resolve('examples/crm/src'),
      '@/components': resolve('packages/ui/src/components'),
      '@/hooks': resolve('packages/ui/src/hooks'),
      '@/lib': resolve('packages/ui/src/lib'),
    },
  },
  publicDir: 'public',
  plugins: [react(), tailwindcss(), {
    name: 'static-example-entry',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = new URL(req.url ?? '/', 'http://localhost').pathname
        if (path.startsWith('/preview/crm/')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(previewDocument('/src/pages/studio/preview-boot.ts'))
        } else if (path.endsWith('.md')) {
          const content = documentationFiles().get(path.slice(1))
          res.statusCode = content ? 200 : 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(content ?? 'Document not found')
        } else next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = new URL(req.url ?? '/', 'http://localhost').pathname
        if (path.startsWith('/preview/crm/')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await readFile(resolve('dist/preview.html'), 'utf8'))
        } else next()
      })
    },
  }],
  server: { port: 5190 },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    cssTarget: 'esnext',
    rolldownOptions: {
      preserveEntrySignatures: 'strict',
      input: { main: resolve('apps/docs/index.html'), preview: resolve('apps/docs/preview.html') },
    },
  },
})
