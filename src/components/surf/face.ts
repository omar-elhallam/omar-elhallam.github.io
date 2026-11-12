/**
 * RIDE VIEW — the wave seen from the beach (like a surf photo), drawn in line-art.
 *
 * Readability rules:
 * - The WORLD moves, not just the surfer: a lagging camera follows the rider; face textures, flat-water
 *   lines and foam are anchored in the world (so they stream past), the horizon scrolls in parallax.
 * - Value hierarchy: whitewater = brightest (white + ink stipple), open face = sand, barrel = darkest.
 * - The breaking point visibly travels: foam left behind it, spray thrown ahead in the peel direction,
 *   chevrons showing the direction, and a strip at the top mapping the whole wave.
 * - A gold trail draws the surfer's line on the face, so every turn is visible.
 */
import { clamp, type RideSim, type Callout } from './ride'

const INK = '#1A1A18', GOLD = '#BFA06A', GOLD_INK = '#7D6335', LINE = '#DCD2C1', MUTED = '#5E5A52', RUST = '#9A4E3A'
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
type Lang = 'fr' | 'en'

const CALL: Record<Callout, { fr: string; en: string }> = {
  TUBE: { fr: 'TUBE', en: 'BARREL' }, OUT: { fr: 'SORTIE ✦', en: 'SPAT OUT ✦' }, CARVE: { fr: 'CARVE', en: 'CARVE' },
  SNAP: { fr: 'SNAP', en: 'SNAP' }, CUTBACK: { fr: 'CUTBACK', en: 'CUTBACK' }, SECTION: { fr: 'SECTION', en: 'SECTION' },
  CLOSE: { fr: 'ÇA FERME', en: 'CLOSING OUT' },
}

interface P { p: number; y: number; vy: number; life: number; kind: 0 | 1 } // 0 foam (ink), 1 spray (gold)
export interface FaceState {
  cam: number; camInit: boolean
  parts: P[]
  trail: { p: number; y: number }[]
  lastHeading: number
  map: { ax: number; cam: number; U: number; F: number; yT: number; dir: number; c: number } | null
}
export const newFaceState = (): FaceState => ({ cam: 0, camInit: false, parts: [], trail: [], lastHeading: 0, map: null })

/** Face height factor (0..1) at distance u ahead of the curl. */
export function faceH(u: number, p = 0, t = 0) {
  let h: number
  if (u < -0.9) h = 0.5
  else if (u < 0) h = 0.5 + 0.5 * (1 - u / -0.9) ** 0.6 * 0.95
  else if (u < 1.2) h = 1
  else if (u < 6) h = 1 - 0.07 * (u - 1.2)
  else if (u < 10) h = 0.664 - (0.664 - 0.25) * ((u - 6) / 4)
  else h = 0.25
  return h + 0.025 * Math.sin(p * 1.7 + t * 0.5) + 0.012 * Math.sin(p * 4.3 - t * 0.8)
}

/** Screen → peel space, for pointer aiming. */
export function screenToPeel(fs: FaceState, sx: number, sy: number) {
  const m = fs.map
  if (!m) return null
  const p = m.cam + (sx - m.ax) / (m.dir * m.U)
  const y = (m.yT - sy) / (m.F * faceH(p - m.c))
  return { p, y }
}

export function drawFace(ctx: CanvasRenderingContext2D, v: { W: number; H: number; lang: Lang }, r: RideSim, t: number, dt: number, fs: FaceState) {
  const { W, H, lang } = v
  const dir = r.dir
  // narrow screens: zoom out so ~2 wave-heights of the line stay visible
  const F = Math.min(H * (0.44 + 0.16 * clamp(r.size / 3)), W * 0.46)
  const U = F * 1.05
  const yT = H * 0.84
  const ax = W * 0.5 - dir * W * 0.1            // anchor: more room ahead, in the peel direction
  // lagging camera with a little look-ahead: you feel the speed
  // follow the rider, but keep the breaking point in frame (it's the main landmark); never lose the rider
  let target = r.p + r.vp * 0.22
  const lo = r.p - 0.46 * W / U, hi = r.c + 0.36 * W / U
  target = Math.max(lo, Math.min(target, Math.max(lo, hi)))
  if (!fs.camInit) { fs.cam = target - 0.6; fs.camInit = true }
  fs.cam += (target - fs.cam) * Math.min(1, dt * 3.2)
  const cam = fs.cam
  const S = (p: number) => ax + dir * (p - cam) * U
  const pAt = (x: number) => cam + (x - ax) / (dir * U)
  const pL = Math.min(pAt(0), pAt(W)) - 0.5, pR = Math.max(pAt(0), pAt(W)) + 0.5
  // a throwing section ahead stands up: the crest bulges where it will throw
  const hf = (p: number) => faceH(p - r.c, p, t) + (p > r.c + 0.3 ? 0.1 * r.sectionAt(p) : 0)
  const crest = (p: number) => yT - F * hf(p)
  fs.map = { ax, cam, U, F, yT, dir, c: r.c }

  /* ---------- far background, parallax: horizon, distant swell, a cargo ship, the El Hank headland ---------- */
  const yH = yT - F * 1.22
  ctx.strokeStyle = LINE; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, yH); ctx.lineTo(W, yH); ctx.stroke()
  const par = (k: number, period: number) => (((-dir * cam * U * k) % period) + period) % period
  // distant swell lines
  ctx.strokeStyle = 'rgba(220,210,193,.8)'
  for (const [k, dy] of [[0.18, 9], [0.3, 20]] as const) {
    const off = par(k, 220)
    ctx.beginPath()
    for (let x = -220; x < W + 220; x += 220) { const x0 = x + off; ctx.moveTo(x0, yH + dy); ctx.quadraticCurveTo(x0 + 55, yH + dy - 3, x0 + 110, yH + dy) }
    ctx.stroke()
  }
  // cargo ship (port of Casablanca) + headland with the lighthouse
  const shipX = ((W * 0.7 + par(0.06, W * 2)) % (W * 2)) - W * 0.4
  ctx.strokeStyle = 'rgba(94,90,82,.55)'
  ctx.beginPath(); ctx.moveTo(shipX, yH - 1); ctx.lineTo(shipX + 46, yH - 1); ctx.lineTo(shipX + 40, yH - 7); ctx.lineTo(shipX + 4, yH - 7); ctx.closePath(); ctx.stroke()
  for (let i = 0; i < 4; i++) ctx.strokeRect(shipX + 8 + i * 7, yH - 12, 6, 5)
  const hx = ((par(0.1, W * 2.4) + W * 1.6) % (W * 2.4)) - W * 0.7
  ctx.beginPath(); ctx.moveTo(hx - 120, yH); ctx.quadraticCurveTo(hx - 40, yH - 16, hx, yH - 18); ctx.lineTo(hx + 60, yH - 16); ctx.quadraticCurveTo(hx + 110, yH - 6, hx + 150, yH); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(hx + 18, yH - 18); ctx.lineTo(hx + 20, yH - 44); ctx.lineTo(hx + 26, yH - 44); ctx.lineTo(hx + 28, yH - 18); ctx.stroke()
  ctx.strokeRect(hx + 19, yH - 51, 8, 7)
  // gulls
  ctx.strokeStyle = 'rgba(94,90,82,.6)'
  for (let i = 0; i < 3; i++) {
    const gx = ((par(0.12, W + 200) + i * 160 + t * 18) % (W + 200)) - 100, gy = yH - 34 - i * 11 + Math.sin(t * 2 + i) * 3
    ctx.beginPath(); ctx.moveTo(gx - 5, gy); ctx.quadraticCurveTo(gx - 2.5, gy - 3, gx, gy); ctx.quadraticCurveTo(gx + 2.5, gy - 3, gx + 5, gy); ctx.stroke()
  }

  /* ---------- flat water in front: world-anchored dashes, closer rows move faster (parallax) ---------- */
  for (let k = 1; k <= 6; k++) {
    const y = yT + 4 + k * k * 4.2
    if (y > H) break
    const kk = 1 + k * 0.14, step = 0.7, span = W / (U * kk) + 1
    ctx.strokeStyle = `rgba(220,210,193,${0.9 - k * 0.1})`
    ctx.beginPath()
    for (let q = Math.floor((cam - span) / step) * step; q < cam + span; q += step) {
      const sx = ax + dir * (q - cam) * U * kk
      ctx.moveTo(sx, y); ctx.lineTo(sx + dir * U * 0.22, y)
    }
    ctx.stroke()
  }

  /* ---------- the face ---------- */
  const g = ctx.createLinearGradient(0, yT - F, 0, yT)
  g.addColorStop(0, '#F3ECDF'); g.addColorStop(0.55, '#E8DDCA'); g.addColorStop(1, '#DACBB0')
  ctx.beginPath(); ctx.moveTo(S(pL), yT)
  for (let p = pL; p <= pR; p += 0.06) ctx.lineTo(S(p), crest(p))
  ctx.lineTo(S(pR), yT); ctx.closePath(); ctx.fillStyle = g; ctx.fill()

  // face texture anchored in the world: water drawn up the face (dashes travel upward)
  ctx.save()
  ctx.beginPath(); ctx.moveTo(S(pL), yT)
  for (let p = pL; p <= pR; p += 0.08) ctx.lineTo(S(p), crest(p))
  ctx.lineTo(S(pR), yT); ctx.closePath(); ctx.clip()
  ctx.strokeStyle = 'rgba(125,99,53,.2)'; ctx.lineWidth = 1
  ctx.setLineDash([7, 9]); ctx.lineDashOffset = -t * 32
  for (let q = Math.floor(pL / 0.55) * 0.55; q < pR; q += 0.55) {
    if (q < r.c + 0.2) continue
    const top = crest(q + 0.3 * 1)
    ctx.beginPath(); ctx.moveTo(S(q), yT + 2); ctx.bezierCurveTo(S(q + 0.05), yT - (yT - top) * 0.4, S(q + 0.18), top + (yT - top) * 0.2, S(q + 0.32), top + 3); ctx.stroke()
  }
  ctx.setLineDash([])
  // two contour lines across the face
  ctx.strokeStyle = 'rgba(255,253,248,.55)'
  for (const k of [0.3, 0.62]) {
    ctx.beginPath()
    const s0 = Math.max(pL, r.c + 0.1)
    for (let p = s0; p <= pR; p += 0.1) { const y = yT - F * hf(p) * k + Math.sin(p * 2.1 + t) * 1.5; p === s0 ? ctx.moveTo(S(p), y) : ctx.lineTo(S(p), y) }
    ctx.stroke()
  }
  ctx.restore()

  // crest line
  ctx.beginPath()
  for (let p = Math.max(pL, r.c - 0.1); p <= pR; p += 0.06) p === Math.max(pL, r.c - 0.1) ? ctx.moveTo(S(p), crest(p)) : ctx.lineTo(S(p), crest(p))
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.8; ctx.stroke()

  /* ---------- whitewater: the brightest thing on screen ---------- */
  const wwEnd = r.c - (r.shape === 'mushy' ? 0 : 0.15)
  if (wwEnd > pL) {
    ctx.beginPath(); ctx.moveTo(S(pL), yT + 14)
    for (let p = pL; p <= wwEnd; p += 0.05) ctx.lineTo(S(p), crest(p) - 4 - 3 * Math.sin(p * 9 + t * 5) - 2 * hash(Math.floor(p * 20)))
    ctx.lineTo(S(wwEnd), yT + 14); ctx.closePath()
    ctx.fillStyle = '#FFFDF8'; ctx.fill()
    // curly foam edge
    ctx.strokeStyle = 'rgba(26,26,24,.55)'; ctx.lineWidth = 1
    for (let q = Math.floor(pL / 0.22) * 0.22; q < wwEnd; q += 0.22) {
      const x = S(q), y = crest(q) - 4 - 3 * Math.sin(q * 9 + t * 5)
      ctx.beginPath(); ctx.arc(x, y + 3, 3 + hash(Math.round(q * 50)) * 3, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke()
    }
    // static world-anchored stipple inside the foam
    ctx.fillStyle = 'rgba(26,26,24,.32)'
    for (let i = 0; i < 520; i++) {
      const q = Math.floor(pL) + hash(i) * (wwEnd - Math.floor(pL) + 1)
      if (q < pL || q > wwEnd) continue
      const top = crest(q), y = top + hash(i + 300) * (yT + 12 - top)
      ctx.fillRect(S(q) + Math.sin(t * 3 + i) * 1.2, y + Math.cos(t * 2.4 + i) * 1.2, 1.3, 1.3)
    }
  }

  /* ---------- particles (world space): foam left behind the curl, spray thrown ahead ---------- */
  const bs = r.barrel()
  if (!r.ended) {
    for (let i = 0; i < 9; i++) fs.parts.push({ p: r.c - Math.random() * 0.35, y: 0.25 + Math.random() * 0.75, vy: -0.1 - Math.random() * 0.3, life: 1, kind: 0 })
    if (r.shape !== 'mushy') for (let i = 0; i < 3; i++) fs.parts.push({ p: r.c + 0.55 + Math.random() * 0.25, y: 1.02 + Math.random() * 0.05, vy: 0.4 + Math.random() * 0.5, life: 1, kind: 1 })
  }
  for (let i = fs.parts.length - 1; i >= 0; i--) {
    const q = fs.parts[i]
    q.life -= dt * (q.kind ? 1.6 : 0.42); q.y += q.vy * dt; if (q.kind) { q.vy -= 2.2 * dt; q.p += 0.9 * dt }
    if (q.life <= 0) { fs.parts.splice(i, 1); continue }
    const x = S(q.p), y = yT - q.y * F * hf(q.p)
    if (x < -10 || x > W + 10) continue
    ctx.fillStyle = q.kind ? GOLD : INK
    ctx.globalAlpha = q.kind ? q.life : q.life * 0.45
    ctx.fillRect(x, y, q.kind ? 1.6 : 1.4, q.kind ? 1.6 : 1.4)
  }
  ctx.globalAlpha = 1
  if (fs.parts.length > 1400) fs.parts.splice(0, fs.parts.length - 1400)

  /* ---------- the barrel opening (darkest value) ---------- */
  const bw = r.barrelWindow(bs)
  const ox = S(r.c + 0.02), oy = yT - F * 0.4
  const orx = U * 0.42 * (0.45 + bs * 0.75), ory = F * (0.18 + 0.27 * bs)
  if (r.shape === 'clean' || r.shape === 'closeout') {
    const gg = ctx.createRadialGradient(ox - dir * orx * 0.45, oy, 2, ox, oy, Math.max(orx, ory))
    gg.addColorStop(0, 'rgba(26,26,24,.34)'); gg.addColorStop(1, 'rgba(26,26,24,.05)')
    ctx.beginPath(); ctx.ellipse(ox, oy, orx, ory, 0, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill()
    // foam ball at the back of the barrel
    ctx.fillStyle = 'rgba(255,253,248,.95)'
    for (let i = 0; i < 70; i++) {
      const a = hash(i) * Math.PI * 2, rr = Math.sqrt(hash(i + 50))
      const fx = ox - dir * orx * 0.62 + Math.cos(a) * orx * 0.35 * rr + Math.sin(t * 6 + i) * 1.5
      const fy = oy + Math.sin(a) * ory * 0.8 * rr
      ctx.beginPath(); ctx.arc(fx, fy, 1.2 + hash(i + 9) * 2.2, 0, Math.PI * 2); ctx.fill()
    }
  }

  /* ---------- the surfer: trail, spray, figure ---------- */
  const sxp = S(r.p), syp = yT - r.y * F * hf(r.p)
  if (!r.ended) { fs.trail.push({ p: r.p, y: r.y }); if (fs.trail.length > 75) fs.trail.shift() }
  if (fs.trail.length > 2) {
    ctx.lineWidth = 1.6; ctx.lineCap = 'round'
    for (let i = 1; i < fs.trail.length; i++) {
      const a = fs.trail[i - 1], b = fs.trail[i]
      ctx.strokeStyle = `rgba(191,160,106,${(i / fs.trail.length) * 0.75})`
      ctx.beginPath(); ctx.moveTo(S(a.p), yT - a.y * F * hf(a.p)); ctx.lineTo(S(b.p), yT - b.y * F * hf(b.p)); ctx.stroke()
    }
  }
  const hxs = dir * r.vp * U, hys = -r.vy * F
  const heading = Math.atan2(hys, hxs)
  const turnRate = Math.abs(Math.atan2(Math.sin(heading - fs.lastHeading), Math.cos(heading - fs.lastHeading))) / Math.max(dt, 1e-3)
  fs.lastHeading = heading
  if (!r.ended && turnRate > 1.6 && r.speed > 1.4) {
    for (let i = 0; i < 4; i++) fs.parts.push({ p: r.p - Math.sign(r.vp) * 0.08, y: r.y + 0.02, vy: 0.6 + Math.random() * 0.8, life: 0.8, kind: 1 })
  }
  if (r.ended === 'wipeout') drawRider(ctx, sxp, syp + r.endT * 50, r.endT * 8, 1, 0, true)
  else if (r.ended === 'kickout') drawRider(ctx, sxp, syp - r.endT * 60, -Math.PI / 2 + 0.4, 1, 0.3, false, 1 - r.endT)
  else {
    const facing: 1 | -1 = hxs >= 0 ? 1 : -1
    // rotate(angle) then mirror: the board nose must end up along the heading either way
    const ang = facing === 1 ? heading : Math.atan2(-hys, -hxs)
    drawRider(ctx, sxp, syp - 2, ang, facing, r.inTube ? 1 : r.stalling ? 0.7 : turnRate > 1.6 ? 0.5 : 0.25)
  }

  /* ---------- the lip, drawn over the rider: a translucent curtain pitching in front of the barrel ---------- */
  if (r.shape === 'clean' || r.shape === 'closeout') {
    const x0 = S(r.c + 0.8), y0 = crest(r.c + 0.8)
    const xTop = S(r.c + 0.25), yTop = yT - F * (1.04 + 0.12 * bs)
    const xEnd = S(r.c - 0.28 - 0.25 * bs), yEnd = yT - F * 0.06
    const outer = () => { ctx.moveTo(x0, y0); ctx.bezierCurveTo(S(r.c + 0.55), yTop - 6, xTop, yTop, S(r.c - 0.05), yT - F * 0.75); ctx.quadraticCurveTo(xEnd + dir * 6, yT - F * 0.38, xEnd, yEnd) }
    ctx.beginPath(); outer()
    ctx.lineTo(xEnd + dir * U * 0.08, yEnd); ctx.quadraticCurveTo(S(r.c + 0.02), yT - F * 0.42, S(r.c + 0.12), yT - F * 0.82); ctx.quadraticCurveTo(S(r.c + 0.4), yT - F * 0.95, x0, y0 + 2)
    ctx.closePath()
    ctx.fillStyle = r.inTube ? 'rgba(232,221,202,.55)' : 'rgba(243,236,223,.82)'; ctx.fill()
    ctx.beginPath(); outer(); ctx.strokeStyle = INK; ctx.lineWidth = 1.9; ctx.stroke()
    ctx.save(); ctx.translate(dir * 5, 4); ctx.beginPath(); outer(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
  } else {
    // spilling: a white cascade tumbling down the top of the face
    ctx.fillStyle = 'rgba(255,253,248,.92)'
    for (let i = 0; i < 90; i++) {
      const q = r.c - 0.3 + hash(i) * 1.3, top = crest(q)
      const yy = top + Math.pow(hash(i + 40), 1.5) * F * 0.35 * clamp(1 - (q - r.c) / 1.1)
      ctx.beginPath(); ctx.arc(S(q) + Math.sin(t * 5 + i) * 1.5, yy, 1.5 + hash(i + 3) * 2.5, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'rgba(26,26,24,.35)'
    for (let i = 0; i < 60; i++) { const q = r.c - 0.3 + hash(i + 200) * 1.2; ctx.fillRect(S(q), crest(q) + hash(i + 7) * F * 0.3, 1.3, 1.3) }
  }

  /* ---------- barrel vignette while you're inside ---------- */
  if (r.inTube) {
    const vg = ctx.createRadialGradient(sxp, syp, F * 0.25, sxp, syp, Math.max(W, H) * 0.75)
    vg.addColorStop(0, 'rgba(26,26,24,0)'); vg.addColorStop(1, 'rgba(26,26,24,.28)')
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)
    // the light at the exit
    ctx.strokeStyle = 'rgba(191,160,106,.8)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.ellipse(S(r.c + bw.u1), oy, orx * 0.25, ory * 0.85, 0, 0, Math.PI * 2); ctx.stroke()
  }

  /* ---------- section warning: chevrons on the crest ahead ---------- */
  const ns = r.nextSection()
  if (ns && ns.a - r.c < 2.4 && ns.a > r.c - 0.2 && !r.ended) {
    const x = S(ns.a), y = crest(ns.a) - 18
    const blink = 0.55 + 0.45 * Math.sin(t * 9)
    ctx.globalAlpha = blink; ctx.fillStyle = GOLD_INK; ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center'
    ctx.fillText(`${dir < 0 ? '‹‹‹' : '›››'}  ${CALL.SECTION[lang]}`, x, y)
    ctx.globalAlpha = 1; ctx.textAlign = 'start'
  }

  /* ---------- call-outs ---------- */
  ctx.font = '500 13px "JetBrains Mono", monospace'; ctx.textAlign = 'center'
  for (const l of r.labels) {
    if (l.key === 'SECTION') continue
    const age = r.t - l.t
    if (age > 1.4) continue
    ctx.globalAlpha = 1 - age / 1.4; ctx.fillStyle = l.key === 'CLOSE' ? RUST : GOLD_INK
    ctx.fillText(CALL[l.key][lang], sxp, syp - 52 - age * 28)
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'start'

  drawStrip(ctx, v, r, t)
}

/* ---------- top strip: the whole wave at a glance (oriented like the screen) ---------- */
function drawStrip(ctx: CanvasRenderingContext2D, v: { W: number; H: number; lang: Lang }, r: RideSim, t: number) {
  const { W, lang } = v
  const narrow = W < 640
  const w = narrow ? W - 32 : Math.min(460, W * 0.5), x0 = (W - w) / 2, y = narrow ? v.H - 46 : 26
  const L = r.L + 1.5
  const X = (p: number) => (r.dir > 0 ? x0 + (p / L) * w : x0 + w - (p / L) * w)
  // direction tag
  const right = r.hand === 'right'
  const tag = lang === 'fr' ? (right ? 'DROITE' : 'GAUCHE') : (right ? 'RIGHT-HANDER' : 'LEFT-HANDER')
  ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.fillStyle = INK; ctx.textAlign = 'center'
  ctx.fillText(`${tag}  ${r.dir < 0 ? '←' : '→'}`, W / 2, y - 10); ctx.textAlign = 'start'
  // base line, broken part, sections, end
  ctx.strokeStyle = LINE; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke()
  ctx.fillStyle = 'rgba(26,26,24,.4)'
  const cX = X(Math.min(r.c, L))
  for (let i = 0; i < 60; i++) { const q = hash(i) * Math.min(r.c, L); ctx.fillRect(X(q), y - 3 + hash(i + 5) * 6, 1.2, 1.2) }
  ctx.fillStyle = 'rgba(191,160,106,.5)'
  for (const s of r.sections) ctx.fillRect(Math.min(X(s.a), X(s.b)), y + 5, Math.abs(X(s.b) - X(s.a)), 2)
  ctx.strokeStyle = MUTED; ctx.beginPath(); ctx.moveTo(X(r.L), y - 6); ctx.lineTo(X(r.L), y + 6); ctx.stroke()
  // curl + rider
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(cX, y - 5); ctx.lineTo(cX + 4, y); ctx.lineTo(cX, y + 5); ctx.lineTo(cX - 4, y); ctx.closePath(); ctx.fill()
  const sX = X(clamp(r.p, 0, L))
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(sX, y - 3); ctx.lineTo(sX - 4, y - 10); ctx.lineTo(sX + 4, y - 10); ctx.closePath(); ctx.fill()
  ctx.font = '500 8.5px "JetBrains Mono", monospace'; ctx.fillStyle = MUTED; ctx.textAlign = r.dir > 0 ? 'end' : 'start'
  ctx.fillText(lang === 'fr' ? 'CHENAL' : 'CHANNEL', r.dir > 0 ? x0 + w : x0, y + 16); ctx.textAlign = 'start'
  // big direction banner during the first moments
  if (r.t < 1.8) {
    const a = clamp(1.8 - r.t) * clamp(r.t / 0.25)
    ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.font = '400 42px "Instrument Serif", Georgia, serif'; ctx.textAlign = 'center'
    ctx.fillText(lang === 'fr' ? (right ? 'Une droite' : 'Une gauche') : (right ? 'A right' : 'A left'), W / 2, v.H * 0.3)
    ctx.font = '500 16px "JetBrains Mono", monospace'; ctx.fillStyle = GOLD_INK
    const off = ((t * 120) % 60) * r.dir
    ctx.fillText(r.dir < 0 ? '‹ ‹ ‹' : '› › ›', W / 2 + off - r.dir * 30, v.H * 0.3 + 26)
    ctx.globalAlpha = 1; ctx.textAlign = 'start'
  }
  // speed / stall readout
  ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.fillStyle = MUTED
  ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.fillStyle = r.stalling ? GOLD_INK : MUTED
  ctx.fillText(`${lang === 'fr' ? 'VITESSE' : 'SPEED'} ${(r.speed * 6).toFixed(0)} kn${r.stalling ? (lang === 'fr' ? ' · FREIN' : ' · STALL') : ''}`, 16, v.H - 14)
}

/* ---------- the rider (line-art), facing ±1, rotated to the board heading ---------- */
function drawRider(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, facing: 1 | -1, crouch: number, tumble = false, alpha = 1) {
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(facing * 1.25, 1.25)
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 3.2, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-17, 3); ctx.lineTo(-20, 8); ctx.stroke()
  if (tumble) {
    ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(7, -15); ctx.moveTo(0, -12); ctx.lineTo(-4, -2); ctx.moveTo(0, -12); ctx.lineTo(5, -2); ctx.stroke()
    ctx.beginPath(); ctx.arc(11, -17, 3.6, 0, Math.PI * 2); ctx.stroke()
  } else {
    const c = crouch, hip = -13 + c * 6, sh = -25 + c * 9
    ctx.beginPath()
    ctx.moveTo(-8, -2); ctx.lineTo(-2 - c * 4, hip); ctx.lineTo(7, -2)
    ctx.moveTo(-2 - c * 4, hip); ctx.lineTo(1, sh)
    ctx.moveTo(-13, sh + 6 + c * 3); ctx.lineTo(1, sh + 2); ctx.lineTo(13, sh + 5 - c * 4)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(2, sh - 4.5, 3.8, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.restore()
}
