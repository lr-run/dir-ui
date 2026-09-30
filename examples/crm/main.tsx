import { createRoot } from 'react-dom/client'
import { CrmTemplate } from './src/template.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <div className='h-dvh'>
    <CrmTemplate count={100} />
  </div>,
)
