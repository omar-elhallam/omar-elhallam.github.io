import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/lang'
import { education, experience, type Step } from '../data/journey'
import { belowFold, useScrollFx } from '../lib/motion'
import { observeVisible } from '../lib/hooks'
import { prefersReducedMotion } from '../lib/env'
import { Constellation, SectionHead } from './SectionHead'

/**
 * The journey axis is a reading head: a gold line that fills toward a marker riding down the
 * timeline at the reading position (62 % of the viewport). Each frame the head *glides* toward
 * its target (lerp), entries light up as it reaches them, upcoming ones stay dimmed.
 * Positions are measured live every frame → nothing can go stale when the page height changes.
 */
function useReadingHead(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reduce = prefersReducedMotion()
    const tls = [...root.querySelectorAll<HTMLElement>('.tl')]
    const cur = tls.map(() => 0)
    tls.forEach(tl => tl.classList.add('live'))
    let raf = 0, visible = false

    const frame = () => {
      const mark = innerHeight * 0.62
      let moving = false
      tls.forEach((tl, i) => {
        const r = tl.getBoundingClientRect()
        const target = Math.min(r.height, Math.max(0, mark - r.top))
        const next = reduce ? target : cur[i] + (target - cur[i]) * 0.14
        if (Math.abs(next - cur[i]) > 0.3) moving = true
        cur[i] = Math.abs(target - next) < 0.3 ? target : next
        tl.style.setProperty('--head', `${cur[i].toFixed(1)}px`)
        tl.style.setProperty('--p', (cur[i] / Math.max(1, r.height)).toFixed(4))
        tl.querySelectorAll<HTMLElement>(':scope > ol > li').forEach(li => {
          li.classList.toggle('reached', cur[i] >= li.offsetTop - 2)
        })
      })
      raf = visible || moving ? requestAnimationFrame(frame) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const off = observeVisible(root, v => { visible = v; kick() })
    addEventListener('scroll', kick, { passive: true })
    addEventListener('resize', kick)
    frame()
    return () => { off(); removeEventListener('scroll', kick); removeEventListener('resize', kick); cancelAnimationFrame(raf) }
  }, [ref])
}

export function Journey() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  useReadingHead(ref)

  // entries slide in from the axis, their bullet points follow one by one
  useScrollFx(ref, ({ gsap }, el) => {
    el.querySelectorAll<HTMLElement>('.tl > ol > li').forEach(li => {
      if (!belowFold(li)) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' } })
      tl.from(li.querySelectorAll('[data-j]'), { clearProps: 'transform,opacity', x: -36, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out' })
        .from(li.querySelectorAll('[data-pt]'), { clearProps: 'transform,opacity', x: -18, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.25)
    })
  })

  return (
    <section id="journey" ref={ref} className="sec" aria-labelledby="journey-title">
      <div className="gx mb-[10vh]"><Constellation seed={4} /></div>
      <div className="gx">
        <SectionHead n={2} id="journey" label={t.journey.index} title={t.journey.title as [string, string]} />
        <div className="grid grid-cols-12 gap-x-5 gap-y-16">
          <Column title={t.journey.experience} steps={experience} className="col-span-12 lg:col-span-6" />
          <Column title={t.journey.education} steps={education} className="col-span-12 lg:col-span-5 lg:col-start-8" />
        </div>
      </div>
    </section>
  )
}

function Column({ title, steps, className }: { title: string; steps: Step[]; className: string }) {
  const { t, pick, lang } = useLang()
  return (
    <div className={className}>
      <h3 className="mono text-gold-ink mb-8">{title}</h3>
      <div className="tl">
        <span className="tl-line" aria-hidden="true" />
        <span className="tl-head" aria-hidden="true" />
        <ol className="space-y-14">
          {steps.map(s => (
            <li key={s.org + pick(s.when)} className="tl-item relative">
              <span className={`tl-dot ${s.current ? 'now' : ''}`} aria-hidden="true" />
              <p data-j className="mono text-muted">
                {pick(s.when)}
                {s.current && <span className="ml-3 text-gold-ink">● {t.journey.now}</span>}
              </p>
              <h4 data-j className="serif text-[clamp(26px,2.4vw,34px)] leading-[1.1] mt-2">{pick(s.title)}</h4>
              <p data-j className="mt-1">{s.org} <span className="text-muted">· {pick(s.place)}</span></p>
              {s.points[lang].length > 0 && (
                <ul className="mt-4 space-y-1.5 text-muted text-[15.5px] max-w-[58ch]">
                  {s.points[lang].map(p => <li key={p} data-pt className="flex gap-3"><span className="text-gold" aria-hidden="true">—</span><span>{p}</span></li>)}
                </ul>
              )}
              {s.link && <a data-j className="link-u mono text-gold-ink inline-block mt-3" href={s.link} target="_blank" rel="noopener">{t.journey.certificate} ↗</a>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
