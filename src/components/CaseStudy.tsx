import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { projects } from '../data/projects'
import { caseStudies, type Block, type Media } from '../data/case-studies'
import { stopScroll } from '../lib/motion'
import { prefersReducedMotion } from '../lib/env'

/**
 * Full-screen case study. Motion:
 * - opens like a curtain, closes the same way (CSS), title words rise in on every project change
 * - a gold reading-progress line in the top bar
 * - every block reveals as it scrolls into view (IntersectionObserver on the dialog's own scroller),
 *   images uncover through a mask, key figures count up
 */
export default function CaseStudy({ id, onClose, onNavigate }: { id: string; onClose: () => void; onNavigate: (id: string) => void }) {
  const { t, pick } = useLang()
  const dlg = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [lightbox, setLightbox] = useState<{ items: Media[]; i: number } | null>(null)

  const idx = projects.findIndex(p => p.id === id)
  const p = projects[idx]
  const cs = caseStudies[id]
  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const next = projects[(idx + 1) % projects.length]

  useEffect(() => {
    const d = dlg.current!
    if (!d.open) d.showModal()
    stopScroll(true)
    return () => { stopScroll(false); if (d.open) d.close() }
  }, [])

  // reveal-on-scroll + counters, re-armed for every project
  useEffect(() => {
    const sc = scroller.current!
    sc.scrollTo({ top: 0 })
    setLightbox(null)
    const reduce = prefersReducedMotion()
    const els = sc.querySelectorAll<HTMLElement>('.rv, .rv-clip, [data-count]')
    if (reduce) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        el.classList.add('in')
        if (el.dataset.count) countUp(el)
        io.unobserve(el)
      }
    }, { root: sc, threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [id])

  // reading progress
  useEffect(() => {
    const sc = scroller.current!, b = bar.current!
    let raf = 0
    const upd = () => { raf = 0; b.style.transform = `scaleX(${sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight)})` }
    const on = () => { if (!raf) raf = requestAnimationFrame(upd) }
    sc.addEventListener('scroll', on, { passive: true }); upd()
    return () => sc.removeEventListener('scroll', on)
  }, [id])

  const requestClose = () => {
    const d = dlg.current
    if (!d || d.classList.contains('closing')) return
    if (prefersReducedMotion()) { d.close(); return }
    d.classList.add('closing')
    setTimeout(() => d.close(), 520)
  }
  const onCancel = (e: React.SyntheticEvent) => { e.preventDefault(); if (lightbox) setLightbox(null); else requestClose() }

  if (!p || !cs) return null
  const n2 = (n: number) => String(n).padStart(2, '0')
  const words = pick(p.title).split(' ')

  return (
    <dialog ref={dlg} className="case" aria-labelledby="case-title" onCancel={onCancel} onClose={onClose}>
      <div ref={scroller} className="no-scrollbar h-full overflow-y-auto overscroll-contain" data-lenis-prevent>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 gx py-4 bg-ivory/90 backdrop-blur border-b border-line">
          <p className="mono text-gold-ink truncate">{n2(idx + 1)} / {n2(projects.length)} — {t.work.filters[p.category]} · {pick(p.status)}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" className="pill mono" onClick={() => onNavigate(prev.id)} aria-label={`${t.work.prev} : ${pick(prev.title)}`}>←</button>
            <button type="button" className="pill mono" onClick={() => onNavigate(next.id)} aria-label={`${t.work.next} : ${pick(next.title)}`}>→</button>
            <button type="button" className="pill mono" onClick={requestClose} autoFocus>{t.work.close} ✕</button>
          </div>
          <span ref={bar} className="case-progress" aria-hidden="true" />
        </div>

        <article key={id} className="gx pb-24">
          <header className="grid grid-cols-12 gap-x-5 gap-y-8 pt-[8vh]">
            <h2 id="case-title" className="col-span-12 lg:col-span-10 serif text-[clamp(48px,8vw,128px)] leading-[.92] tracking-[-0.03em]" aria-label={pick(p.title)}>
              {words.map((w, i) => (
                <span key={i}><span className="w-mask" aria-hidden="true"><span className="w-in cw" style={{ ['--i' as string]: String(i) }}>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</span>
              ))}
            </h2>
            <p className="col-span-12 lg:col-span-7 serif text-[clamp(22px,2.2vw,32px)] leading-[1.25] rv" style={{ ['--d' as string]: '.35s' }}>{pick(p.problem)}</p>
            <dl className="col-span-12 lg:col-span-4 lg:col-start-9 border-t border-line text-[15px]">
              {[
                [t.work.role, pick(cs.role)],
                [t.work.duration, pick(cs.duration)],
                [t.work.stack, p.stack.join(' · ')],
              ].map(([k, v], i) => (
                <div key={k} className="flex justify-between gap-6 py-3 border-b border-line rv" style={{ ['--d' as string]: `${0.45 + i * 0.08}s` }}><dt className="mono text-muted shrink-0">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
              {p.link && <div className="pt-5 rv" style={{ ['--d' as string]: '.7s' }}><a className="btn btn-solid" href={p.link.href} target="_blank" rel="noopener">{pick(p.link.label)} <span aria-hidden="true">↗</span></a></div>}
            </dl>
          </header>

          {cs.facts && (
            <ul className="grid grid-cols-2 md:grid-cols-4 border-t border-line mt-[8vh]">
              {cs.facts.map((f, i) => (
                <li key={f.value + pick(f.label)} className="py-6 pr-4 border-b border-line md:border-b-0 rv" style={{ ['--d' as string]: `${i * 0.08}s` }}>
                  <span className="serif text-[clamp(44px,5vw,72px)] leading-none text-gold-ink tabular-nums" data-count={f.value}>{f.value}</span>
                  <span className="block mono text-muted mt-2">{pick(f.label)}</span>
                </li>
              ))}
            </ul>
          )}

          <figure className="mt-[8vh]">
            <div className="hud bg-sand-2 rv-clip"><span className="hud-c" />
              <img src={cs.cover.src} srcSet={cs.cover.srcSet} sizes="100vw" alt={pick(cs.cover.alt)} width={cs.cover.w} height={cs.cover.h} className="w-full h-auto max-h-[78vh] object-contain mx-auto" />
            </div>
            <figcaption className="mono text-muted mt-3 rv">{pick(cs.cover.caption)}</figcaption>
          </figure>

          <section className="grid grid-cols-12 gap-x-5 mt-[10vh]">
            <h3 className="col-span-12 lg:col-span-3 mono text-gold-ink mb-4 rv">{t.work.overview}</h3>
            <p className="col-span-12 lg:col-span-8 text-[clamp(18px,1.5vw,21px)] leading-relaxed rv" style={{ ['--d' as string]: '.08s' }}>{pick(cs.overview)}</p>
          </section>

          {cs.blocks.map((b, i) => <BlockView key={i} b={b} onZoom={(items, j) => setLightbox({ items, i: j })} />)}

          <button type="button" onClick={() => onNavigate(next.id)} className="case-next group block w-full text-left border-t border-line mt-[14vh] pt-8 rv">
            <span className="mono text-muted">{t.work.next}</span>
            <span className="flex items-baseline justify-between gap-6 mt-3">
              <span className="serif text-[clamp(40px,6vw,96px)] leading-none tracking-[-0.03em] transition-transform duration-700 group-hover:translate-x-3 group-hover:italic">{pick(next.title)}</span>
              <span className="p-go shrink-0 transition-transform duration-700 group-hover:-rotate-45" aria-hidden="true">→</span>
            </span>
          </button>
        </article>
      </div>

      {lightbox && <Lightbox items={lightbox.items} start={lightbox.i} onClose={() => setLightbox(null)} />}
    </dialog>
  )
}

/** "25+" counts 0 → 25 then shows the suffix; ease-out-expo over 1.4 s. */
function countUp(el: HTMLElement) {
  const raw = el.dataset.count ?? ''
  const m = raw.match(/^(\d+)(.*)$/)
  if (!m) return
  const end = +m[1], suffix = m[2], t0 = performance.now(), D = 1400
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / D), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
    el.textContent = `${Math.round(end * e)}${k === 1 ? suffix : ''}`
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const d = (i: number, base = 0) => ({ ['--d' as string]: `${base + i * 0.08}s` })

function BlockView({ b, onZoom }: { b: Block; onZoom: (items: Media[], i: number) => void }) {
  const { t, pick, lang } = useLang()
  const head = <h3 className="col-span-12 lg:col-span-3 mono text-gold-ink mb-6 rv">{pick(b.title)}</h3>
  const wrap = (children: React.ReactNode) => <section className="grid grid-cols-12 gap-x-5 mt-[12vh]">{head}<div className="col-span-12 lg:col-span-9">{children}</div></section>

  switch (b.type) {
    case 'text':
      return wrap(<p className="text-[18px] leading-relaxed max-w-[62ch] rv">{pick(b.body)}</p>)
    case 'list':
      return wrap(
        <ul className="space-y-3 max-w-[64ch]">
          {b.items[lang].map((x, i) => <li key={x} className="flex gap-4 text-[17px] rv" style={d(i)}><span className="text-gold mt-[1px]" aria-hidden="true">—</span>{x}</li>)}
        </ul>,
      )
    case 'code':
      return wrap(<pre className="console no-scrollbar p-6 overflow-x-auto text-[13px] leading-relaxed rv"><code>{b.code}</code></pre>)
    case 'cards':
      return wrap(<>
        {b.intro && <p className="text-[18px] leading-relaxed text-muted mb-8 max-w-[62ch] rv">{pick(b.intro)}</p>}
        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line">
          {b.items.map((it, i) => (
            <div key={pick(it.title)} className="case-card bg-ivory p-6 rv" style={d(i)}>
              <h4 className="serif text-[28px] leading-tight">{pick(it.title)}</h4>
              <p className="text-muted mt-3">{pick(it.text)}</p>
              {it.tags && <p className="flex flex-wrap gap-2 mono mt-4">{it.tags.map(tg => <span key={tg} className="chip">{tg}</span>)}</p>}
            </div>
          ))}
        </div>
      </>)
    case 'timeline':
      return wrap(
        <ol className="case-tl rv">
          {b.items.map((it, i) => (
            <li key={pick(it.title)} className="grid grid-cols-[56px_1fr] md:grid-cols-[72px_220px_1fr] gap-x-5 gap-y-1 py-5 rv" style={d(i, 0.1)}>
              <span className="mono text-gold-ink pt-1">{pick(it.label)}</span>
              <h4 className="serif text-[24px] leading-tight">{pick(it.title)}</h4>
              <p className="text-muted col-start-2 md:col-start-3">{pick(it.text)}</p>
            </li>
          ))}
        </ol>,
      )
    case 'challenges':
      return wrap(
        <div className="space-y-px bg-line border border-line">
          {b.items.map((it, i) => (
            <div key={pick(it.title)} className="bg-ivory p-6 grid md:grid-cols-[200px_1fr_1fr] gap-4 rv rv-x" style={d(i)}>
              <h4 className="serif text-[24px] leading-tight">{pick(it.title)}</h4>
              <p className="text-muted">{pick(it.problem)}</p>
              <p><span className="mono text-gold-ink block mb-1">{t.work.solution}</span>{pick(it.solution)}</p>
            </div>
          ))}
        </div>,
      )
    case 'gallery': {
      const zoomable = b.items.filter(x => !x.video)
      return wrap(
        <ul className="grid sm:grid-cols-2 gap-5">
          {b.items.map((m, i) => (
            <li key={m.src + i} className={i === 0 ? 'sm:col-span-2' : ''}>
              <figure>
                {m.video ? (
                  <div className="rv-clip" style={d(i % 2)}>
                    <video className="w-full bg-ink" controls preload="none" poster={m.src} playsInline aria-label={pick(m.alt)}>
                      <source src={m.video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <button type="button" className="block w-full hud bg-sand-2 group overflow-hidden rv-clip" style={d(i % 2)} onClick={() => onZoom(zoomable, zoomable.indexOf(m))} aria-label={`${t.work.enlarge} : ${pick(m.alt)}`}>
                    <span className="hud-c" />
                    <img src={m.src} srcSet={m.srcSet} sizes="(min-width: 640px) 50vw, 100vw" alt={pick(m.alt)} loading="lazy" decoding="async" width={m.w} height={m.h}
                      className={`w-full ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'} object-contain group-hover:scale-[1.04]`} />
                    <span className="absolute right-3 bottom-3 mono bg-ink text-ivory px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">⤢ {t.work.enlarge}</span>
                  </button>
                )}
                <figcaption className="text-muted text-[14px] mt-2.5 rv" style={d(i % 2, 0.2)}>{pick(m.caption)}</figcaption>
              </figure>
            </li>
          ))}
        </ul>,
      )
    }
  }
}

function Lightbox({ items, start, onClose }: { items: Media[]; start: number; onClose: () => void }) {
  const { t, pick } = useLang()
  const [i, setI] = useState(start)
  const [dir, setDir] = useState(0)
  const m = items[i]
  const go = (dd: number) => { setDir(dd); setI(x => (x + dd + items.length) % items.length) }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="lightbox fixed inset-0 z-20 bg-night/95 text-ivory flex flex-col" role="group" aria-label={pick(m.alt)}>
      <div className="flex justify-between items-center gx py-4 mono">
        <span className="text-gold-soft">{i + 1} / {items.length}</span>
        <button type="button" className="pill" onClick={onClose} autoFocus>{t.work.close} ✕</button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center gx gap-4">
        {items.length > 1 && <button type="button" className="pill shrink-0" onClick={() => go(-1)} aria-label={t.work.prev}>←</button>}
        <img key={i} src={m.src} srcSet={m.srcSet} sizes="90vw" alt={pick(m.alt)} className="lb-img max-h-full max-w-full object-contain bg-ivory" style={{ ['--dir' as string]: String(dir) }} />
        {items.length > 1 && <button type="button" className="pill shrink-0" onClick={() => go(1)} aria-label={t.work.next}>→</button>}
      </div>
      <p className="gx py-5 text-center text-[#B9B3A7]">{pick(m.caption)}</p>
    </div>
  )
}
