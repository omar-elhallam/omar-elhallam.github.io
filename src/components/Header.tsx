import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { scrollToId } from '../lib/motion'
import { useMagnetic } from '../lib/hooks'
import { SECTIONS } from '../data/site'

export function Header({ onMenu }: { onMenu: () => void }) {
  const { t, lang, setLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  useMagnetic(menuRef, 0.25)

  useEffect(() => {
    let last = scrollY, raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = scrollY
        setScrolled(y > 40)
        setHidden(y > 400 && y > last + 4 ? true : y < last - 4 ? false : h => h)
        last = y
      })
    }
    addEventListener('scroll', onScroll, { passive: true })

    // Which section is under the header line? (drives aria-current + dark mode over the contact section)
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { setActive(e.target.id); setDark(e.target.id === 'contact') }
    }, { rootMargin: '-40px 0px -90% 0px' })
    ;['top', ...SECTIONS].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => { removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollToId(id) }
  const navItems = SECTIONS.filter(s => s !== 'skills')

  return (
    <header className={`site-header gx ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden-up' : ''} ${dark ? 'on-dark' : ''}`}>
      <a href="#top" onClick={go('top')} className="serif text-[21px] leading-none" aria-label="Omar El Hallam — haut de page">
        Omar El Hallam
      </a>
      <nav aria-label="Principale" className="hidden lg:flex gap-7">
        {navItems.map(id => (
          <a key={id} href={`#${id}`} onClick={go(id)} className="nav-a mono" aria-current={active === id ? 'true' : undefined}>
            {t.nav[id]}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-5">
        <button type="button" className="mono" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
          <span className={lang === 'fr' ? '' : 'opacity-70'}>FR</span>
          <span className="opacity-70"> / </span>
          <span className={lang === 'en' ? '' : 'opacity-70'}>EN</span>
          <span className="sr-only"> — {t.lang.switchTo}</span>
        </button>
        <button ref={menuRef} type="button" className="pill mono" onClick={onMenu} aria-haspopup="dialog">
          {t.nav.menu} <kbd aria-hidden="true">⌘K</kbd>
        </button>
      </div>
    </header>
  )
}
