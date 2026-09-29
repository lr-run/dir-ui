import './tailwind.css'
import { initializeDocumentStyles } from './document-styles.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.tsx'
import { ErrorBoundary } from '../../components/ui/error-boundary.tsx'
initializeDocumentStyles(false)
const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
