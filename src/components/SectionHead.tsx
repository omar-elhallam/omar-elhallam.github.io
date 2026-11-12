import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { belowFold, useScrollFx } from '../lib/motion'
import { observeVisible } from '../lib/hooks'
import { prefersReducedMotion } from '../lib/env'

/** "02 / 06 — Expertise IA" — section numbers read like coordinates. */
export function SectionHead({ n, label, title, intro, id, dark = false }: { n: number; label: string; title: [string, string]; intro?: ReactNode; id: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollFx(ref, ({ gsap }, el) => {
    if (!belowFold(el)) return
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
    // each word rises from behind its own mask, then the label and intro settle in
    tl.from(el.querySelectorAll('.w-in'), { clearProps: 'transform', yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.07, ease: 'expo.out' })
      .from(el.querySelectorAll('[data-r]'), { clearProps: 'transform,opacity', y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 0.1)
  })
  return (
    <div ref={ref} className="grid grid-cols-12 gap-x-5 gap-y-6 items-end mb-[8vh]">
      <div className="col-span-12 lg:col-span-8">
        <p data-r className={`mono mb-5 ${dark ? 'text-gold-soft' : 'text-gold-ink'}`}>
          {String(n).padStart(2, '0')} / 06 — {label}
        </p>
        <h2 id={`${id}-title`} className="sec-title" aria-label={title[0] + title[1]}>
          <Words text={title[0]} /><em><Words text={title[1]} /></em>
        </h2>
      </div>
      {intro && <p data-r className={`col-span-12 lg:col-span-4 max-w-[38ch] ${dark ? 'muted' : 'text-muted'}`}>{intro}</p>}
    </div>
  )
}

/** Words wrapped in masks so they can rise into view (screen readers get the h2 aria-label). */
function Words({ text }: { text: string }) {
  return <>{text.split(/(\s+)/).map((w, i) => (/^\s+$/.test(w) ? w : w ? <span key={i} className="w-mask" aria-hidden="true"><span className="w-in">{w}</span></span> : null))}</>
}

/**
 * Constellation divider — rebuilt from scratch.
 *
 * Why the old one froze half-way: it was an SVG stretched with preserveAspectRatio="none" plus
 * vector-effect: non-scaling-stroke and pathLength=1. Chrome then measures the dash in screen space
 * but the path length in user space, so a "fully drawn" line only covered part of a wide screen.
 *
 * Now: the SVG is drawn in real pixels (viewBox = measured width, re-measured on resize), the
 * dash uses the path's real length, and the line follows the scroll — measured live every frame,
 * gliding toward its target. Stars ignite when the tip reaches them; a small comet leads the line.
 */
const H = 28
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function starPoints(seed: number, w: number): [number, number][] {
  const n = w < 600 ? 5 : 7
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const jitter = i === 0 || i === n ? 0 : Math.sin(seed * 9.1 + i * 3.7) * (w / n) * 0.18
    pts.push([Math.round((i / n) * (w - 2) + 1 + jitter), Math.round(H / 2 + Math.sin(seed * 4.3 + i * 2.1) * 8)])
  }
  return pts
}

export function Constellation({ seed = 1, dark = false }: { seed?: number; dark?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const comet = useRef<SVGCircleElement>(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = wrap.current!
    const measure = () => setW(Math.round(el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pts = useMemo(() => (w ? starPoints(seed, w) : []), [seed, w])

  useEffect(() => {
    const el = wrap.current, p = path.current, c = comet.current
    if (!el || !p || !c || !pts.length) return
    const L = p.getTotalLength()
    p.style.strokeDasharray = `${L} ${L}`
    const stars = [...el.querySelectorAll<SVGCircleElement>('.c-star')]
    const starX = pts.slice(1, -1).map(q => q[0])
    const reduce = prefersReducedMotion()
    let cur = reduce ? 1 : 0, raf = 0, visible = false

    const paint = () => {
      p.style.strokeDashoffset = String(L * (1 - cur))
      const tip = p.getPointAtLength(L * cur)
      c.setAttribute('cx', tip.x.toFixed(1)); c.setAttribute('cy', tip.y.toFixed(1))
      c.style.opacity = cur > 0.002 && cur < 0.998 ? '1' : '0'
      stars.forEach((s, i) => s.classList.toggle('on', tip.x >= starX[i] - 0.5))
    }
    const frame = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      // starts drawing when the divider enters the bottom of the screen, complete by mid-screen
      const target = reduce ? 1 : clamp01((innerHeight * 0.96 - r.top) / (innerHeight * 0.5))
      cur += (target - cur) * 0.12
      if (Math.abs(target - cur) < 0.0005) cur = target
      paint()
      if (visible || cur !== target) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const off = observeVisible(el, v => { visible = v; kick() })
    addEventListener('scroll', kick, { passive: true })
    paint(); kick()
    return () => { off(); removeEventListener('scroll', kick); cancelAnimationFrame(raf) }
  }, [pts])

  const ink = dark ? '#D9C29A' : '#1A1A18'
  return (
    <div ref={wrap} className="constellation" style={{ height: H }} aria-hidden="true">
      {w > 0 && (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`}>
          <path ref={path} d={'M' + pts.map(q => q.join(' ')).join(' L')} className="c-line" />
          {pts.slice(1, -1).map(([x, y], i) => (
            <circle key={i} className="c-star" cx={x} cy={y} r={i % 3 === 1 ? 2.6 : 1.8} fill={ink} />
          ))}
          <circle ref={comet} className="c-comet" r={3} cx={0} cy={H / 2} />
        </svg>
      )}
    </div>
  )
}
