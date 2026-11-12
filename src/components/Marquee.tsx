import { useRef } from 'react'
import { useLang } from '../i18n/lang'
import { useScrollFx } from '../lib/motion'

/** A big editorial band that slides sideways as you scroll — two rows, opposite directions. */
export function Marquee() {
  const { lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const a = lang === 'fr'
    ? ['Agents IA', 'Automatisation', 'Data', 'Interfaces']
    : ['AI agents', 'Automation', 'Data', 'Interfaces']
  const b = lang === 'fr'
    ? ['LLM', 'n8n', 'Scraping', 'React', 'NestJS', 'Surf']
    : ['LLM', 'n8n', 'Scraping', 'React', 'NestJS', 'Surf']

  useScrollFx(ref, ({ gsap }, el) => {
    const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    gsap.fromTo(el.querySelector('.mq-a'), { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: st })
    gsap.fromTo(el.querySelector('.mq-b'), { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: st })
  })

  const row = (words: string[], cls: string, italic: boolean) => (
    <div className={`${cls} flex whitespace-nowrap will-change-transform`}>
      {[0, 1, 2].map(k => (
        <span key={k} className="flex items-center">
          {words.map((w, i) => (
            <span key={w + i} className="flex items-center">
              <span className={`serif px-[2.5vw] ${italic === (i % 2 === 0) ? 'italic' : 'mq-outline'}`}>{w}</span>
              <span className="text-gold text-[0.35em]" aria-hidden="true">✦</span>
            </span>
          ))}
        </span>
      ))}
    </div>
  )

  return (
    <div ref={ref} className="overflow-hidden py-[8vh] text-[clamp(56px,10vw,160px)] leading-[1.05] select-none" aria-hidden="true">
      {row(a, 'mq-a', true)}
      {row(b, 'mq-b text-[0.55em] text-muted mt-2', false)}
    </div>
  )
}
