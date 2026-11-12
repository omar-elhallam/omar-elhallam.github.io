import { useEffect, useState, type RefObject } from 'react'
import { hasFinePointer, prefersReducedMotion } from './env'

/** Becomes true (once) when the element gets near the viewport — used to lazy-mount heavy widgets. */
export function useNear(ref: RefObject<Element | null>, rootMargin = '400px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, near])
  return near
}

/** Live visibility, to pause animation loops when off-screen. */
export function observeVisible(el: Element, cb: (v: boolean) => void) {
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting))
  io.observe(el)
  return () => io.disconnect()
}

/** Magnetic hover: the element leans toward the pointer, then springs back. Pure CSS transitions, no library. */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.transition = 'transform .35s cubic-bezier(.2,.7,.1,1)'
      el.style.transform = `translate3d(${(e.clientX - r.left - r.width / 2) * strength}px,${(e.clientY - r.top - r.height / 2) * strength * 1.3}px,0)`
    }
    const leave = () => {
      el.style.transition = 'transform .9s cubic-bezier(.2,1.8,.4,1)'
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [ref, strength])
}
