import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { site } from '../data/site'
import { observeVisible, useMagnetic } from '../lib/hooks'
import { belowFold, useScrollFx } from '../lib/motion'
import { prefersReducedMotion } from '../lib/env'
import { Constellation } from './SectionHead'

/**
 * The one spatial moment of the site: deep charcoal, a sober star field, a hint of gold.
 * Stars are painted once to a canvas; only a handful twinkle (and only while visible).
 */
function useStars(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const dpr = Math.min(devicePixelRatio, 1.5)
    let stars: { x: number; y: number; r: number; a: number; gold: boolean; tw: number }[] = []
    let W = 0, H = 0
    // deterministic pseudo-random so the sky doesn't reshuffle on every resize
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const build = () => {
      W = cv.clientWidth; H = cv.clientHeight; seed = 7
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((W * H) / 5200)
      stars = Array.from({ length: n }, (_, i) => ({ x: rnd() * W, y: rnd() * H, r: rnd() < 0.08 ? 1.3 : 0.4 + rnd() * 0.6, a: 0.25 + rnd() * 0.6, gold: rnd() < 0.07, tw: i % 9 === 0 ? rnd() * 6.28 : -1 }))
      paint(0)
    }
    const paint = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const a = s.tw >= 0 ? s.a * (0.55 + 0.45 * Math.sin(t * 0.0012 + s.tw)) : s.a
        ctx.globalAlpha = a
        ctx.fillStyle = s.gold ? '#D9C29A' : '#FAF8F4'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    build()
    const ro = new ResizeObserver(build); ro.observe(cv)
    if (prefersReducedMotion()) return () => ro.disconnect()
    let raf = 0, visible = false, last = 0
    const loop = (t: number) => { if (visible && t - last > 50) { last = t; paint(t) } raf = requestAnimationFrame(loop) } // 20 fps is plenty for twinkling
    const off = observeVisible(cv, v => { visible = v; cancelAnimationFrame(raf); if (v) raf = requestAnimationFrame(loop) })
    return () => { cancelAnimationFrame(raf); off(); ro.disconnect() }
  }, [ref])
}

export function Contact({ onCopied }: { onCopied: () => void }) {
  const { t } = useLang()
  const stars = useRef<HTMLCanvasElement>(null)
  const ref = useRef<HTMLElement>(null)
  const mail = useRef<HTMLAnchorElement>(null)
  const [copied, setCopied] = useState(false)
  useStars(stars)
  useMagnetic(mail, 0.12)

  useScrollFx(ref, ({ gsap }, el) => {
    gsap.from([...el.querySelectorAll('[data-c]')].filter(belowFold), { clearProps: 'transform,opacity', y: 50, opacity: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%' } })
  })

  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); onCopied(); setTimeout(() => setCopied(false), 1800) } catch { location.href = `mailto:${site.email}` }
  }

  const rows: { k: string; v: string; href: string; ext?: boolean; dl?: boolean }[] = [
    { k: 'GitHub', v: 'github.com/omar-elhallam', href: site.github, ext: true },
    { k: 'LinkedIn', v: 'in/omar-abdelmoti-el-hallam', href: site.linkedin, ext: true },
    { k: t.contact.phone, v: site.phone, href: site.phoneHref },
    { k: t.contact.cv, v: 'CV_Omar_El_Hallam.pdf', href: site.cv, dl: true },
  ]

  return (
    <footer id="contact" ref={ref} className="night" aria-labelledby="contact-title">
      <canvas ref={stars} className="stars" aria-hidden="true" />
      <div className="gx pt-[clamp(110px,18vh,200px)] pb-10">
        <p data-c className="mono text-gold-soft mb-6">06 / 06 — {t.contact.index}</p>
        <h2 id="contact-title" data-c className="sec-title max-w-[14ch]">
          {t.contact.title[0]} <em className="text-gold-soft">{t.contact.title[1]}</em>
        </h2>
        <p data-c className="muted mt-8 max-w-[44ch] text-[17px]">{t.contact.intro}</p>

        <div data-c className="mt-[8vh] flex flex-wrap items-center gap-x-6 gap-y-4">
          <a ref={mail} href={`mailto:${site.email}`} className="serif text-[clamp(28px,4.4vw,64px)] leading-none link-u break-all">{site.email}</a>
          <button type="button" onClick={copy} className="pill mono border-[rgba(250,248,244,.35)]">{copied ? `${t.contact.copied} ✓` : t.contact.copy}</button>
        </div>

        <div data-c className="mt-[8vh]">
          {rows.map(r => (
            <div key={r.k} className="c-row">
              <span className="mono muted">{r.k}</span>
              <a href={r.href} className="link-u justify-self-start" {...(r.ext ? { target: '_blank', rel: 'noopener' } : {})} {...(r.dl ? { download: '' } : {})}>{r.v}</a>
              <span className="mono text-gold-soft" aria-hidden="true">{r.ext ? '↗' : r.dl ? '↓' : '→'}</span>
            </div>
          ))}
        </div>

        <div className="mt-[12vh]"><Constellation seed={6} dark /></div>
        <div className="flex flex-wrap justify-between gap-4 mt-6 mono muted">
          <span>© 2026 Omar El Hallam — {t.contact.footer}</span>
          <span>{t.contact.hint}</span>
        </div>
      </div>
    </footer>
  )
}
