import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { LangProvider, useLang } from './i18n/lang'
import type { Lang } from './i18n/strings'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Expertise } from './components/Expertise'
import { Projects } from './components/Projects'
import { Journey } from './components/Journey'
import { Skills } from './components/Skills'
import { Contact } from './components/Contact'
import { ScrollRail } from './components/ScrollRail'
import { Marquee } from './components/Marquee'
import { hasFinePointer, idle, prefersReducedMotion } from './lib/env'

const Terminal = lazy(() => import('./components/Terminal'))


const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function Shell() {
  const { t } = useLang()
  const [palette, setPalette] = useState(false)
  const [paletteLoaded, setPaletteLoaded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false) // client-only extras (not in the pre-rendered HTML)
  useEffect(() => setMounted(true), [])

  const notify = useCallback((msg: string, ms = 2200) => {
    setToast(msg)
    window.setTimeout(() => setToast(cur => (cur === msg ? null : cur)), ms)
  }, [])

  const warp = useCallback(() => {
    notify(t.warp, 3200)
    import('./fx/hyperspace').then(m => m.warp())
  }, [notify, t.warp])

  const openPalette = useCallback(() => { setPaletteLoaded(true); setPalette(true) }, [])

  // Global keys: ⌘K / Ctrl+K / "/" open the console; the Konami code triggers the easter egg.
  useEffect(() => {
    let k = 0
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]')
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openPalette(); return }
      if (e.key === '/' && !typing) { e.preventDefault(); openPalette(); return }
      if (typing) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0
      if (k === KONAMI.length) { k = 0; warp() }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [openPalette, warp])

  // Decorative extras load when the browser is idle — never on the critical path.
  useEffect(() => {
    // A little note for the curious ones who open the devtools.
    console.log('%cOmar El Hallam%c — psst: ↑ ↑ ↓ ↓ ← → ← → B A', 'font: 20px Georgia, serif', 'font: 12px monospace; color:#84693A')
    if (!hasFinePointer() || prefersReducedMotion()) return
    idle(() => import('./fx/ship').then(m => m.mountShip()))
  }, [])

  return (
    <>
      <a className="skip" href="#main">{t.skip}</a>
      <Header onMenu={openPalette} />
      <main id="main">
        <Hero />
        <About />
        <Journey />
        <Expertise />
        <Marquee />
        <Projects />
        <Skills />
      </main>
      {mounted && <ScrollRail />}
      <Contact onCopied={() => notify(t.copiedToast)} />
      {paletteLoaded && (
        <Suspense fallback={null}>
          <Terminal open={palette} onClose={() => setPalette(false)} onWarp={warp} onCopied={() => notify(t.copiedToast)} />
        </Suspense>
      )}
      <div aria-live="polite" className="sr-only">{toast}</div>
      {toast && <div className="toast mono" aria-hidden="true">{toast}</div>}
    </>
  )
}

export default function App({ lang }: { lang: Lang }) {
  return <LangProvider initial={lang}><Shell /></LangProvider>
}
