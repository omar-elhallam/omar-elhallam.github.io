/**
 * The ship cursor — a tiny gold line-art vessel that follows the pointer with inertia, faces its
 * direction of travel and leaves a V-shaped wake. Over interactive elements it turns into an anchor ring.
 * Only mounted on fine pointers without reduced motion (see App.tsx). Vanilla DOM: zero React re-renders.
 */
const HULL = '<svg class="hull" viewBox="0 0 28 28" fill="none" stroke="#BFA06A" stroke-width="1.1" stroke-linejoin="round"><path d="M14 3 L19 19 L14 16.5 L9 19 Z"/><path d="M14 8.5 V13"/><path d="M9 19 L6.5 23 M19 19 L21.5 23" stroke-width=".9"/></svg>'
const ANCHOR = '<svg class="anchor" viewBox="0 0 28 28" fill="none" stroke="#1A1A18" stroke-width="1"><circle cx="14" cy="14" r="6"/><path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke-width=".8"/><circle cx="14" cy="14" r="1.4" fill="#BFA06A" stroke="none"/></svg>'

// The old portfolio normalised angles with `%`, which keeps the sign in JS (-190 % 360 === -190),
// so the rocket sometimes spun the long way round. atan2(sin, cos) always gives the shortest turn.
const shortest = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

let mounted = false
export let barrelRoll = () => {}

export function mountShip() {
  if (mounted) return
  mounted = true
  const root = document.documentElement
  const ship = document.createElement('div')
  ship.className = 'ship'; ship.setAttribute('aria-hidden', 'true'); ship.innerHTML = HULL + ANCHOR
  ship.style.opacity = '0' // invisible until the mouse actually moves
  const cv = document.createElement('canvas')
  cv.className = 'ship-trail'; cv.setAttribute('aria-hidden', 'true')
  document.body.append(cv, ship)
  const ctx = cv.getContext('2d')!
  const dpr = Math.min(devicePixelRatio, 2)
  const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
  size(); addEventListener('resize', size)

  let mx = -100, my = -100, x = mx, y = my, ang = 0, target = false, seen = false, roll = 0
  let dirty = false, sleeping = true, raf = 0
  const wake: { x: number; y: number; vx: number; vy: number; life: number }[] = []
  const rings: { x: number; y: number; r: number; life: number }[] = []

  const wakeUp = () => { if (sleeping) { sleeping = false; raf = requestAnimationFrame(tick) } }
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return
    mx = e.clientX; my = e.clientY
    if (!seen) { seen = true; x = mx; y = my; root.classList.add('ship-on'); ship.style.opacity = '' }
    wakeUp()
  }, { passive: true })
  addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') { rings.push({ x, y, r: 3, life: 1 }); wakeUp() } })
  document.addEventListener('pointerover', e => {
    const el = e.target as Element
    target = !!el.closest?.('a, button, [role="button"], [role="tab"], [role="option"], summary, label, input, select, textarea')
    ship.classList.toggle('target', target)
    ship.classList.toggle('dark', !!el.closest?.('.night, .console, dialog.palette, .bg-night'))
  })
  document.addEventListener('pointerleave', () => { ship.style.opacity = '0' })
  document.addEventListener('pointerenter', () => { if (seen) ship.style.opacity = '' })
  const rehome = () => {
    const open = document.querySelectorAll('dialog[open]')
    const host = (open[open.length - 1] as HTMLElement | undefined) ?? document.body
    if (ship.parentElement !== host) host.append(cv, ship)
  }
  new MutationObserver(rehome).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })

  barrelRoll = () => { roll = Math.PI * 4; wakeUp() }

  function tick() {
    const dx = mx - x, dy = my - y, sp = Math.hypot(dx, dy)
    x += dx * 0.6; y += dy * 0.6
    if (target) ang += shortest(ang, 0) * 0.2
    else if (sp > 1.2) ang += shortest(ang, Math.atan2(dy, dx) + Math.PI / 2) * 0.15
    roll *= 0.94
    ship.style.transform = `translate3d(${x}px,${y}px,0) rotate(${ang + roll}rad)`

    if (sp > 3 && !target) {
      const sx = Math.sin(ang), cy = Math.cos(ang)
      for (const side of [-1, 1]) wake.push({ x: x - sx * 17 + cy * side * 2, y: y + cy * 17 + sx * side * 2, vx: cy * side * 0.25, vy: sx * side * 0.25, life: 1 })
    }
    if (wake.length || rings.length || dirty) {
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      dirty = wake.length + rings.length > 0
      ctx.fillStyle = '#BFA06A'
      for (let i = wake.length - 1; i >= 0; i--) {
        const p = wake[i]; p.life -= 0.09; p.x += p.vx; p.y += p.vy
        if (p.life <= 0) { wake.splice(i, 1); continue }
        ctx.globalAlpha = p.life * 0.65; ctx.fillRect(p.x, p.y, 1.2, 1.2)
      }
      ctx.strokeStyle = '#BFA06A'; ctx.lineWidth = 1
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.life -= 0.025; r.r += 1.6
        if (r.life <= 0) { rings.splice(i, 1); continue }
        ctx.globalAlpha = r.life * 0.8; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    // Go to sleep when nothing moves: zero CPU while the user reads.
    if (sp < 0.1 && !wake.length && !rings.length && !dirty && Math.abs(roll) < 0.001) { sleeping = true; return }
    raf = requestAnimationFrame(tick)
  }
  void raf
}
