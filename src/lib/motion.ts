/**
 * Motion kit, loaded lazily.
 *
 * Why GSAP + ScrollTrigger: timelines with precise sequencing and scrubbed scroll animations are
 * GSAP's core strength, it's framework-agnostic, and it only touches transforms/opacity we ask for.
 *
 * Nothing on screen *depends* on this chunk: the hero intro is pure CSS, content is visible in the
 * pre-rendered HTML. GSAP + Lenis arrive after hydration and only enhance what is below the fold.
 */
import { useEffect, type RefObject } from 'react'
import type Lenis from 'lenis'
import { prefersReducedMotion } from './env'

type GSAP = typeof import('gsap').gsap
type ST = typeof import('gsap/ScrollTrigger').ScrollTrigger
export interface MotionKit { gsap: GSAP; ScrollTrigger: ST; lenis: Lenis | null }

let kit: Promise<MotionKit> | null = null
let lenisRef: Lenis | null = null

export function loadMotion(): Promise<MotionKit> {
  kit ??= (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    gsap.registerPlugin(ScrollTrigger)
    // Lazy widgets, fonts and images change the page height after load: re-measure every trigger
    // when the document resizes, otherwise scroll-linked effects freeze at stale positions.
    let pending = 0
    new ResizeObserver(() => { clearTimeout(pending); pending = window.setTimeout(() => ScrollTrigger.refresh(), 150) }).observe(document.body)
    let lenis: Lenis | null = null
    if (!prefersReducedMotion()) {
      const { default: L } = await import('lenis')
      lenis = new L({ lerp: 0.09, anchors: false })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(t => lenis!.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)
      lenisRef = lenis
    }
    return { gsap, ScrollTrigger, lenis }
  })()
  return kit
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenisRef) lenisRef.scrollTo(el, { duration: 1.6, offset: -20 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  // Move keyboard focus to the section too, so screen-reader / keyboard users land there.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/** Scroll the page to an absolute Y (used by the custom scroll rail). */
export function scrollToY(y: number, immediate: boolean) {
  if (lenisRef) lenisRef.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.2, force: true })
  else window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

export const stopScroll = (on: boolean) => { if (on) lenisRef?.stop(); else lenisRef?.start() }

/** Only animate what the user hasn't seen yet — never hide something already on screen. */
export const belowFold = (el: Element) => el.getBoundingClientRect().top > innerHeight * 0.92

/**
 * Run scroll-driven effects scoped to a section. Skipped entirely under prefers-reduced-motion.
 * Everything created inside is reverted on unmount (gsap.context).
 */
export function useScrollFx(scope: RefObject<HTMLElement | null>, fx: (k: MotionKit, el: HTMLElement) => void) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let ctx: ReturnType<GSAP['context']> | undefined
    let cancelled = false
    loadMotion().then(k => {
      const el = scope.current
      if (cancelled || !el) return
      ctx = k.gsap.context(() => fx(k, el), el)
    })
    return () => { cancelled = true; ctx?.revert() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
