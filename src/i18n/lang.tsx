import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { strings, type Lang, type Strings } from './strings'

interface Ctx { lang: Lang; t: Strings; setLang: (l: Lang) => void; pick: <T>(v: { fr: T; en: T }) => T }
const LangContext = createContext<Ctx | null>(null)

/**
 * Each language is a real, pre-rendered URL: "/" (fr) and "/en/" (en) — good for SEO and hreflang.
 * Toggling swaps the text instantly (no reload) and rewrites the URL with history.replaceState.
 */
export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch { /* private mode */ }
  }, [])

  useEffect(() => {
    const t = strings[lang]
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    const base = import.meta.env.BASE_URL
    const path = lang === 'en' ? `${base}en/` : base
    if (location.pathname !== path) history.replaceState(null, '', path + location.hash)
  }, [lang])

  const value = useMemo<Ctx>(() => ({ lang, t: strings[lang], setLang, pick: v => v[lang] }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const c = useContext(LangContext)
  if (!c) throw new Error('useLang outside LangProvider')
  return c
}
