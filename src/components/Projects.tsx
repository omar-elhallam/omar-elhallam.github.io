import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { projects, type Category, type Project } from '../data/projects'
import { belowFold, useScrollFx } from '../lib/motion'
import { Constellation, SectionHead } from './SectionHead'

// The case-study viewer (and all its long-form content + photos) is its own chunk.
const CaseStudy = lazy(() => import('./CaseStudy'))

type Filter = 'all' | Category
const FILTERS: Filter[] = ['all', 'ai', 'web', 'systems']
const HASH = '#projet-'

export function Projects() {
  const { t } = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<string | null>(null)
  const ref = useRef<HTMLElement>(null)

  // Shareable deep links: /#projet-cpu opens the CPU case study directly.
  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.startsWith(HASH) ? location.hash.slice(HASH.length) : null
      setOpen(id && projects.some(p => p.id === id) ? id : null)
    }
    fromHash()
    addEventListener('hashchange', fromHash)
    return () => removeEventListener('hashchange', fromHash)
  }, [])

  const show = useCallback((id: string | null) => {
    setOpen(id)
    history.replaceState(null, '', location.pathname + location.search + (id ? HASH + id : ''))
  }, [])

  // Images open like a curtain the first time they scroll into view.
  useScrollFx(ref, ({ gsap }, el) => {
    el.querySelectorAll<HTMLElement>('.p-card').forEach(card => {
      if (!belowFold(card)) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
      tl.from(card.querySelector('.mask'), { clearProps: 'clipPath', clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' })
        .from(card.querySelector('.zoom'), { clearProps: 'transform', scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.15)
        .from(card.querySelectorAll('[data-m]'), { clearProps: 'transform,opacity', y: 24, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out' }, 0.5)
    })
    el.querySelectorAll<HTMLElement>('.p-card .par').forEach(par => {
      gsap.fromTo(par, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: par.closest('.p-card'), start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  })

  const count = (f: Filter) => (f === 'all' ? projects.length : projects.filter(p => p.category === f).length)

  return (
    <section id="work" ref={ref} className="sec" aria-labelledby="work-title">
      <div className="gx mb-[10vh]"><Constellation seed={3} /></div>
      <div className="gx">
        <SectionHead n={4} id="work" label={t.work.index} title={t.work.title as [string, string]} intro={t.work.intro} />

        <div className="flex flex-wrap gap-2.5 mb-[8vh]" role="group" aria-label={t.work.index}>
          {FILTERS.map(f => (
            <button key={f} type="button" className="filter mono" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {t.work.filters[f]} <sup className="ml-1 opacity-70">{count(f)}</sup>
            </button>
          ))}
        </div>

        <ul className="p-grid" role="list">
          {projects.map((p, i) => (
            <Card key={p.id} p={p} index={i} hidden={filter !== 'all' && p.category !== filter} onOpen={() => show(p.id)} />
          ))}
        </ul>
      </div>
      {open && (
        <Suspense fallback={null}>
          <CaseStudy id={open} onClose={() => show(null)} onNavigate={show} />
        </Suspense>
      )}
      <span className="sr-only" aria-live="polite">{filter !== 'all' ? `${count(filter)} ${t.work.index}` : ''}</span>
    </section>
  )
}

function Card({ p, index, hidden, onOpen }: { p: Project; index: number; hidden: boolean; onOpen: () => void }) {
  const { t, pick } = useLang()
  const frame = useRef<HTMLDivElement>(null)
  // the porthole reveal starts where the pointer enters
  const track = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect()
    frame.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    frame.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const img = (cls: string) => (
    <img className={cls} src={p.image.src} srcSet={p.image.srcSet} sizes="(min-width: 900px) 50vw, 100vw"
      alt={cls === 'base' ? pick(p.image.alt) : ''} loading="lazy" decoding="async" width={960} height={720} />
  )
  return (
    <li className={`p-card ${hidden ? 'out' : ''}`}>
      {/* The whole card is clickable (image, title, arrow). The heading's button is the single
          keyboard stop; mouse clicks anywhere else go through the article's onClick. */}
      <article className="cursor-pointer" onClick={onOpen} onPointerEnter={track} onPointerMove={track}>
        <div ref={frame} className="p-frame hud hud-hover">
          <span className="hud-c" />
          <span className="absolute left-3.5 top-3.5 z-[2] bg-ivory px-2.5 py-1 mono text-gold-ink">{t.work.filters[p.category]} · {pick(p.status)}</span>
          {p.photos ? <span className="absolute right-3.5 bottom-3.5 z-[2] bg-ink text-ivory px-2.5 py-1 mono">{t.work.photos(p.photos)}</span> : null}
          <div className="mask"><div className="par absolute -inset-y-[6%] inset-x-0"><div className="zoom absolute inset-0">{img('base')}{img('lens')}</div></div></div>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 items-baseline pt-5">
          <span data-m className="mono text-gold-ink">{String(index + 1).padStart(2, '0')}</span>
          <h3 data-m className="serif text-[clamp(28px,3vw,44px)] leading-none tracking-[-0.02em]">
            <button type="button" aria-haspopup="dialog" className="text-left" onClick={e => { e.stopPropagation(); onOpen() }}>
              {pick(p.title)}<span className="sr-only"> — {t.work.open}</span>
            </button>
          </h3>
          <span data-m className="p-go" aria-hidden="true">→</span>
          <p data-m className="col-start-2 col-span-2 text-muted max-w-[48ch]">{pick(p.problem)}</p>
          <p data-m className="col-start-2 col-span-2 flex flex-wrap gap-2 mono">
            {p.stack.map(s => <span key={s} className="chip">{s}</span>)}
            {p.year && <span className="chip border-transparent">{p.year}</span>}
          </p>
          <p data-m className="col-start-2 col-span-2 mono text-gold-ink" aria-hidden="true">{t.work.open} →</p>
        </div>
      </article>
    </li>
  )
}
