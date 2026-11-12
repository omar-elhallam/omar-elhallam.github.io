import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { SECTIONS } from '../data/site'
import { scrollToY } from '../lib/motion'

/**
 * A quiet custom scrollbar: a hairline rail on the right with an ink thumb, section ticks
 * (hover to read them, click to jump) and drag support. The native scrollbar is hidden only
 * once this is mounted, so without JavaScript the browser's own scrollbar is still there.
 */
export function ScrollRail() {
  const { t } = useLang()
  const rail = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const [ticks, setTicks] = useState<{ id: string; top: number; label: string }[]>([])
  const [active, setActive] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('custom-scroll')
    const r = rail.current!, th = thumb.current!
    let railH = 0, thumbH = 0, max = 1, raf = 0, idleT = 0

    const measure = () => {
      railH = r.clientHeight
      max = Math.max(1, root.scrollHeight - innerHeight)
      thumbH = Math.max(36, (innerHeight / root.scrollHeight) * railH)
      th.style.height = `${thumbH}px`
      setTicks(SECTIONS.map((id, i) => {
        const el = document.getElementById(id)
        return { id, top: el ? Math.min(1, (el.getBoundingClientRect().top + scrollY) / max) : 0, label: `${String(i + 1).padStart(2, '0')} — ${t.nav[id]}` }
      }))
      update()
    }
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, scrollY / max))
      th.style.transform = `translate3d(0,${p * (railH - thumbH)}px,0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
      setActive(true); clearTimeout(idleT); idleT = window.setTimeout(() => setActive(false), 1100)
    }
    measure()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', measure)
    const ro = new ResizeObserver(measure); ro.observe(document.body)

    // drag the thumb
    let dragging = false, grabY = 0
    const down = (e: PointerEvent) => { dragging = true; grabY = e.clientY - th.getBoundingClientRect().top; th.setPointerCapture(e.pointerId); root.classList.add('rail-drag') }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const y = e.clientY - r.getBoundingClientRect().top - grabY
      scrollToY((y / Math.max(1, railH - thumbH)) * max, true)
    }
    const up = () => { dragging = false; root.classList.remove('rail-drag') }
    th.addEventListener('pointerdown', down); th.addEventListener('pointermove', move); th.addEventListener('pointerup', up); th.addEventListener('pointercancel', up)

    return () => {
      root.classList.remove('custom-scroll')
      removeEventListener('scroll', onScroll); removeEventListener('resize', measure); ro.disconnect()
      th.removeEventListener('pointerdown', down); th.removeEventListener('pointermove', move); th.removeEventListener('pointerup', up); th.removeEventListener('pointercancel', up)
    }
  }, [t])

  // click on the track → glide there
  const onTrack = (e: React.PointerEvent) => {
    if (e.target !== rail.current) return
    const r = rail.current!.getBoundingClientRect()
    scrollToY(((e.clientY - r.top) / r.height) * (document.documentElement.scrollHeight - innerHeight), false)
  }

  return (
    <div className={`rail ${active ? 'is-active' : ''}`} aria-hidden="true">
      <div ref={rail} className="rail-track" onPointerDown={onTrack}>
        {ticks.map(k => (
          <button key={k.id} type="button" tabIndex={-1} className="rail-tick" style={{ top: `${k.top * 100}%` }} onClick={() => scrollToY(k.top * (document.documentElement.scrollHeight - innerHeight), false)}>
            <span className="rail-label mono">{k.label}</span>
          </button>
        ))}
        <div ref={thumb} className="rail-thumb" />
      </div>
    </div>
  )
}
