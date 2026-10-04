import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/reset.css'
import '@singz/ui/kit.css'
import './styles/tokens.css'
import './styles/atelier.css'
import './styles/studio.css'
import './styles/app.css'
import './styles/singz.css'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
