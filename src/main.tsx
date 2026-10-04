import React from 'react'
import { createRoot } from 'react-dom/client'
import { applyPlatformClasses } from '@singz/ui'
import App from './App'

// The two faces night-studio is drawn in. The kit declares the font
// variables but deliberately ships no @font-face set, so the app owns them.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/martian-mono'

// Kit first: its rules are written at low specificity on purpose, so
// anything below can override without a fight.
import '@singz/ui/kit.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/app.css'

// Must run BEFORE the first render: App reads `body.win` during render to
// decide whether to draw its own window buttons, so setting the classes
// later would leave the chrome and the CSS disagreeing.
applyPlatformClasses()

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
