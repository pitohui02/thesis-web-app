import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import Dashboard from './dashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='grid place-items-center h-screen'>
      <App />
    </div>
  </StrictMode>,
)
