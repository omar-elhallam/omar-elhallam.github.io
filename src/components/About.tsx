import { lazy, Suspense, useRef } from 'react'
import { useLang } from '../i18n/lang'
import { useNear } from '../lib/hooks'
import { belowFold, useScrollFx } from '../lib/motion'
import { Constellation, SectionHead } from './SectionHead'

const SurfSession = lazy(() => import('./surf/SurfSession'))

export function About() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const gameSlot = useRef<HTMLDivElement>(null)
  const near = useNear(gameSlot, '600px')

  useScrollFx(ref, ({ gsap }, el) => {
    gsap.from([...el.querySelectorAll('[data-p]')].filter(belowFold), { clearProps: 'transform,opacity', y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '[data-p]', start: 'top 85%' } })
  })

  return (
    <section id="about" ref={ref} className="sec" aria-labelledby="about-title">
      <div className="gx mb-[10vh]"><Constellation seed={1} /></div>
      <div className="gx">
        <SectionHead n={1} id="about" label={t.about.index} title={[t.about.title[0] + ' ', t.about.title[1]]} />
        <div className="grid grid-cols-12 gap-x-5 gap-y-10">
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <p data-p className="serif text-[clamp(24px,2.3vw,34px)] leading-[1.25]">{t.about.body[0]}</p>
            <p data-p className="text-[17px] text-muted max-w-[60ch]">{t.about.body[1]}</p>
            <p data-p className="text-[17px] text-muted max-w-[60ch]">{t.about.body[2]}</p>
          </div>
          <dl data-p className="col-span-12 lg:col-span-4 lg:col-start-9 self-end border-t border-line">
            {t.about.facts.map(f => (
              <div key={f.k} className="flex justify-between gap-4 py-4 border-b border-line">
                <dt className="mono text-muted">{f.k}</dt>
                <dd className="text-right">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-[12vh]">
          <p className="mono text-gold-ink mb-4">{t.game.title} — 33°35′N 7°40′W</p>
          <div ref={gameSlot}>
            {near ? (
              <Suspense fallback={<div className="surf-stage" />}>
                <SurfSession />
              </Suspense>
            ) : (
              <div className="surf-stage" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
