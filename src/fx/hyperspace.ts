/**
 * Konami easter egg: a 3-second hyperspace jump. Gold star streaks rush out of the centre over a
 * soft night vignette, then everything fades back. pointer-events: none — the page stays usable.
 */
import { prefersReducedMotion } from '../lib/env'

let running = false

export async function warp() {
  if (running) return
  if (prefersReducedMotion()) return // the toast is enough
  running = true
  const { barrelRoll } = await import('./ship')
  barrelRoll()

  const cv = document.createElement('canvas')
  cv.className = 'warp'; cv.setAttribute('aria-hidden', 'true')
  document.body.append(cv)
  const ctx = cv.getContext('2d')!
  const dpr = Math.min(devicePixelRatio, 2), W = innerWidth, H = innerHeight
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr)

  const DURATION = 3000, N = Math.min(420, Math.round((W * H) / 3500))
  const stars = Array.from({ length: N }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 40, v: 0.6 + Math.random() * 2.4 }))
  const cx = W / 2, cy = H / 2, start = performance.now()

  const frame = (now: number) => {
    const p = (now - start) / DURATION
    // envelope: ease in, hold, ease out
    const env = p < 0.2 ? p / 0.2 : p > 0.8 ? Math.max(0, (1 - p) / 0.2) : 1
    const speed = 1 + Math.sin(Math.min(p, 1) * Math.PI) * 14
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = `rgba(18,18,16,${0.6 * env})`; ctx.fillRect(0, 0, W, H)
    ctx.lineCap = 'round'
    for (const s of stars) {
      const d0 = s.d
      s.d += s.v * speed
      if (s.d > Math.hypot(W, H) / 2) { s.d = Math.random() * 30; continue }
      const c = Math.cos(s.a), sn = Math.sin(s.a)
      ctx.strokeStyle = `rgba(217,194,154,${env * Math.min(1, s.d / 120)})`
      ctx.lineWidth = 0.6 + s.d / 500
      ctx.beginPath(); ctx.moveTo(cx + c * d0, cy + sn * d0); ctx.lineTo(cx + c * s.d, cy + sn * s.d); ctx.stroke()
    }
    if (p < 1) requestAnimationFrame(frame)
    else { cv.remove(); running = false }
  }
  requestAnimationFrame(frame)
}
