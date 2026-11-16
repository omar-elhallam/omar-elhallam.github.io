import { useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { languages, others, skills } from '../data/skills'
import { projects } from '../data/projects'
import { belowFold, useScrollFx } from '../lib/motion'
import { Constellation, SectionHead } from './SectionHead'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, '')
/** How many projects list this skill in their stack — computed, so it stays true as projects.ts grows. */
const usage = (skill: string) => projects.filter(p => p.stack.some(s => norm(s) === norm(skill) || norm(s).startsWith(norm(skill)))).map(p => p.id)

export function Skills() {
  const { t, pick } = useLang()
  const ref = useRef<HTMLElement>(null)
  const [hot, setHot] = useState<string | null>(null)

  useScrollFx(ref, ({ gsap }, el) => {
    el.querySelectorAll<HTMLElement>('[data-col]').forEach((col, i) => {
      if (!belowFold(col)) return
      gsap.from(col.querySelectorAll('li, h3'), { clearProps: 'transform,opacity', y: 18, opacity: 0, duration: 0.9, stagger: 0.04, delay: i * 0.08, ease: 'expo.out', scrollTrigger: { trigger: col, start: 'top 85%' } })
    })
  })

  return (
    <section id="skills" ref={ref} className="sec pt-0" aria-labelledby="skills-title">
      <div className="gx mb-[10vh]"><Constellation seed={5} /></div>
      <div className="gx">
        <SectionHead n={5} id="skills" label={t.skills.index} title={t.skills.title as [string, string]} intro={t.skills.intro} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-12 border-t border-line pt-8">
          {skills.map(g => (
            <div key={g.id} data-col>
              <h3 className="serif text-[34px] leading-none mb-5">{pick(g.label)}</h3>
              <ul className="space-y-2.5">
                {g.items.map(s => {
                  const used = usage(s)
                  return (
                    <li key={s} className="mono text-[12.5px] flex items-baseline gap-2"
                      onPointerEnter={() => used.length && setHot(s)} onPointerLeave={() => setHot(null)}>
                      <span className={`transition-colors ${hot === s ? 'text-gold-ink' : ''}`}>{s}</span>
                      {used.length > 0 && <sup className="text-gold-ink" title={t.skills.usedIn(used.length)}>{used.length}<span className="sr-only"> — {t.skills.usedIn(used.length)}</span></sup>}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="mono text-muted mt-14">
          {t.skills.others} — {others.join(' · ')}<br />
          {t.skills.languages} — {languages.map(l => pick(l)).join(' · ')}
        </p>
      </div>
    </section>
  )
}
