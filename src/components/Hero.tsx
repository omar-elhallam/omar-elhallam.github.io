import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { scrollToId, useScrollFx } from '../lib/motion'
import { useMagnetic, observeVisible } from '../lib/hooks'
import { hasFinePointer, idle, isLowPower, prefersReducedMotion } from '../lib/env'
import { site } from '../data/site'
import { getConditions, type Conditions } from '../lib/conditions'

/** Bathymetric contour rings — deterministic, so server and client render the same SVG. */
function contourPaths() {
  const out: string[] = []
  for (let k = 0; k < 13; k++) {
    const r = 40 + k * 26
    let d = ''
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2
      const n = Math.sin(a * 3 + k * 0.35) * 10 + Math.sin(a * 5 - k * 0.2) * 6 + Math.cos(a * 2 + k * 0.5) * k * 1.6
      d += `${i ? 'L' : 'M'}${(480 + Math.cos(a) * (r + n) * 1.25).toFixed(1)} ${(300 + Math.sin(a) * (r + n) * 0.8).toFixed(1)}`
    }
    out.push(d + 'Z')
  }
  return out
}
const CONTOURS = contourPaths()

export function Hero() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const cta1 = useRef<HTMLAnchorElement>(null)
  const cta2 = useRef<HTMLAnchorElement>(null)
  useMagnetic(cta1); useMagnetic(cta2)

  // Leaving the hero: the name drifts up at two speeds, the depth lines turn slowly, the report sinks.
  useScrollFx(ref, ({ gsap }, el) => {
    const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.4 }
    gsap.to(el.querySelector('.h-title .row:first-child'), { yPercent: -38, ease: 'none', scrollTrigger: st })
    gsap.to(el.querySelector('.h-title .row:last-child'), { yPercent: -18, ease: 'none', scrollTrigger: st })
    gsap.to(el.querySelector('.hero-contours'), { rotate: 14, scale: 1.12, yPercent: 10, ease: 'none', scrollTrigger: st })
    gsap.to(el.querySelector('.bulletin'), { y: 70, ease: 'none', scrollTrigger: st })
  })

  // WebGL caustics: loaded when idle. Animated on capable desktops, a single still frame elsewhere.
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    let stop: (() => void) | undefined
    let cancelled = false
    idle(() => {
      import('../fx/caustics').then(({ startCaustics }) => {
        if (cancelled) return
        const animate = !prefersReducedMotion() && hasFinePointer() && !isLowPower()
        stop = startCaustics(c, { animate, observe: observeVisible })
        c.classList.add('on')
      })
    }, 2500)
    return () => { cancelled = true; stop?.() }
  }, [])

  return (
    <section id="top" ref={ref} className="hero gx grid grid-cols-12 gap-x-5 content-between pt-[120px] pb-10 md:pt-[130px]" aria-labelledby="hero-title">
      <canvas ref={canvas} className="hero-caustics" aria-hidden="true" />
      <svg className="hero-contours" viewBox="0 0 960 600" aria-hidden="true">
        {CONTOURS.map((d, i) => (
          <path key={i} d={d} className={i === 5 ? 'g' : undefined} pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `draw 2.6s cubic-bezier(.65,0,.35,1) ${0.3 + i * 0.07}s forwards` }} />
        ))}
      </svg>

      <p className="col-span-12 flex justify-between mono text-muted h-fade" style={{ ['--i' as string]: '0' }}>
        <span>{site.spot.label} — 33.59° N</span>
        <span>{t.hero.kicker}</span>
      </p>

      <h1 id="hero-title" className="h-title col-span-12 mt-[6vh]" aria-label="Omar El Hallam">
        <span className="row" aria-hidden="true"><span className="h-word" style={{ ['--i' as string]: '0' }}>Omar</span></span>
        <span className="row" aria-hidden="true">
          <span className="h-word" style={{ ['--i' as string]: '1' }}>El</span>{' '}
          <span className="h-word italic" style={{ ['--i' as string]: '2' }}>Hallam</span>
        </span>
      </h1>

      <div className="col-span-12 lg:col-span-6 self-end mt-10 lg:mt-0">
        <p className="mono text-muted mb-4 h-fade" style={{ ['--i' as string]: '1' }}>{t.hero.role}</p>
        <p className="serif text-[clamp(26px,2.5vw,40px)] leading-[1.12] max-w-[22ch] h-fade" style={{ ['--i' as string]: '2' }}>
          {t.hero.lede[0]}<em className="text-gold-ink">{t.hero.lede[1]}</em>{t.hero.lede[2]}
        </p>
        <div className="flex flex-wrap gap-3.5 mt-8 h-fade" style={{ ['--i' as string]: '3' }}>
          <a ref={cta1} href="#work" className="btn btn-solid" onClick={e => { e.preventDefault(); scrollToId('work') }}>
            {t.hero.ctaWork} <span aria-hidden="true">↓</span>
          </a>
          <a ref={cta2} href={site.cv} className="btn" download>{t.hero.ctaCv}</a>
        </div>
      </div>

      <Bulletin />
    </section>
  )
}

/* ---------------------------------------------------------------- */

const FR16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
const EN16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const compass = (deg: number, lang: 'fr' | 'en') => (lang === 'fr' ? FR16 : EN16)[Math.round(deg / 22.5) % 16]

function Bulletin() {
  const { t, lang } = useLang()
  const [c, setC] = useState<Conditions | null>(null)
  const [failed, setFailed] = useState(false)
  const spark = useRef<SVGPathElement>(null)
  const box = useRef<HTMLElement>(null)

  // Real swell + wind for the spot, fetched once the page is idle (shared with the surf game).
  useEffect(() => {
    let alive = true
    idle(() => { getConditions().then(r => { if (!alive) return; if (r) setC(r); else setFailed(true) }) }, 3000)
    return () => { alive = false }
  }, [])

  // The sparkline breathes with the real swell: amplitude ~ height, frequency ~ 1/period.
  useEffect(() => {
    const path = spark.current, el = box.current
    if (!path || !el) return
    const amp = Math.min(12, 4 + (c?.hs ?? 1.5) * 3), k = 0.9 / (c?.tp ?? 11)
    let t = 0, raf = 0, visible = true
    const draw = () => {
      let d = ''
      for (let x = 0; x <= 200; x += 5) d += `${x ? 'L' : 'M'}${x} ${(18 + Math.sin(x * k + t) * amp * 0.75 + Math.sin(x * k * 2.7 + t * 1.6) * 2).toFixed(1)}`
      path.setAttribute('d', d)
    }
    draw()
    if (prefersReducedMotion()) return
    const loop = () => { if (visible) { t += 0.03; draw() } raf = requestAnimationFrame(loop) }
    const off = observeVisible(el, v => { visible = v })
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); off() }
  }, [c])

  const fmt = (n: number, d = 1) => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: d, minimumFractionDigits: d })

  return (
    <aside ref={box} className="bulletin hud col-span-12 md:col-span-6 lg:col-span-4 lg:col-start-9 self-end mt-12 lg:mt-0 h-fade" style={{ ['--i' as string]: '4' }} aria-label={`${t.bulletin.title} — ${site.spot.label}`}>
      <span className="hud-c" />
      <h2 className="mono flex justify-between mb-3.5 font-medium">
        <span>{t.bulletin.title} — {site.spot.label}</span>
        <span className="inline-flex items-center gap-2 text-gold-ink">
          <span className={`live-dot ${c ? 'on' : ''}`} aria-hidden="true" />
          {failed ? t.bulletin.offline : t.bulletin.live}
        </span>
      </h2>
      <dl>
        <dt>{t.bulletin.swell}</dt>
        <dd>{c ? `${fmt(c.hs)} m · ${Math.round(c.tp)} s · ${compass(c.dir, lang)}` : '— m · — s'}</dd>
        <dt>{t.bulletin.wind}</dt>
        <dd>{c ? `${Math.round(c.wind)} kn · ${c.kind}` : '— kn'}</dd>
        <dt>{t.bulletin.focus}</dt>
        <dd>{t.bulletin.focusValue}</dd>
        <dt>{t.bulletin.stack}</dt>
        <dd>TS · Python · n8n</dd>
      </dl>
      <svg className="block w-full h-9 mt-3.5" viewBox="0 0 200 36" preserveAspectRatio="none" aria-hidden="true">
        <path ref={spark} fill="none" stroke="#BFA06A" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mono text-[10px] text-muted mt-2">{t.bulletin.source}</p>
    </aside>
  )
}
