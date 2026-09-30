// @deno-types="./source-text.d.ts"
import '@vitejs/plugin-react/preamble'
import('./preview-runtime.tsx').catch((error) => {
  console.error('Screen preview failed to load', error)
  const root = document.getElementById('screen-root')
  if (root) root.textContent = 'Preview could not load. Reload this page to try again.'
})
