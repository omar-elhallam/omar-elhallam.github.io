import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

const base = import.meta.env.BASE_URL
const lang = location.pathname.startsWith(`${base}en`) ? 'en' : 'fr'
const root = document.getElementById('root')!
const app = <StrictMode><App lang={lang} /></StrictMode>

// Production HTML is pre-rendered (scripts/prerender.mjs) → hydrate. In dev the root is empty → render.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
