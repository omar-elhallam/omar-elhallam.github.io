/**
 * SESSION — line-art renderer (Canvas 2D). Ivory paper, ink lines, a touch of champagne gold.
 * Three views: the cross-shore PROFILE (reading the sets, take-off), a bird's-eye MINIMAP (reading the
 * wave's shape: peeling peak vs close-out) and the FACE view while riding (pocket, curl, tube).
 */
import { BAR_X, SHORE_X, SurfEngine, clamp, type Wave } from './engine'

const INK = '#1A1A18', GOLD = '#BFA06A', GOLD_INK = '#7D6335', LINE = '#DCD2C1', MUTED = '#5E5A52'
const MONO = '500 10px "JetBrains Mono", ui-monospace, monospace'
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }

export type Lang = 'fr' | 'en'

export interface View { W: number; H: number; lang: Lang }

/* ================================================================ PROFILE */
export function drawProfile(ctx: CanvasRenderingContext2D, v: View, e: SurfEngine) {
  const { W, H } = v
  const y0 = H * 0.5
  const pxM = Math.min(H * 0.1, (H * 0.4) / (2.1 * e.cond.hs))
  const bedPx = (H - 16 - y0) / e.depth(0)
  const X = (x: number) => x * W
  const surf = (x: number) => y0 - e.eta(x) * pxM
  const bed = (x: number) => y0 + e.depth(x) * bedPx

  // sun + horizon + the set showing up far out
  ctx.lineWidth = 1
  ctx.strokeStyle = LINE
  ctx.beginPath(); ctx.arc(W * 0.86, H * 0.17, 13, 0, Math.PI * 2); ctx.stroke()
  const hy = H * 0.24
  ctx.beginPath(); ctx.moveTo(0, hy)
  const hz = e.horizon && e.t > e.horizon.t && e.t < e.horizon.t + 4 ? e.horizon : null
  for (let x = 0; x <= W * 0.5; x += 4) {
    let bump = 0
    if (hz) {
      const k = clamp((e.t - hz.t) / 1.2) * clamp((hz.t + 4 - e.t) / 0.8)
      for (let i = 0; i < hz.n; i++) {
        const cx = W * (0.06 + i * 0.07) + (e.t - hz.t) * 8
        bump += Math.max(0, 1 - Math.abs(x - cx) / 14) * (2 + hz.maxH * 2.2) * k
      }
    }
    ctx.lineTo(x, hy - bump)
  }
  ctx.lineTo(W, hy); ctx.stroke()
  if (hz) {
    ctx.font = MONO; ctx.fillStyle = GOLD_INK
    ctx.globalAlpha = clamp((e.t - hz.t) / 0.6) * clamp((hz.t + 4 - e.t) / 0.6)
    ctx.fillText(v.lang === 'fr' ? `SÉRIE AU LARGE · ${hz.n} VAGUES` : `SET ON THE HORIZON · ${hz.n} WAVES`, W * 0.04, hy - 22)
    ctx.globalAlpha = 1
  }

  // the beach + El Hank lighthouse (Casablanca)
  const by = bed(SHORE_X)
  ctx.strokeStyle = INK; ctx.lineWidth = 1
  const lx = W * 0.952, ly = by - 4, lh = H * 0.24
  ctx.beginPath(); ctx.moveTo(lx - 6, ly); ctx.lineTo(lx - 3.5, ly - lh); ctx.lineTo(lx + 3.5, ly - lh); ctx.lineTo(lx + 6, ly); ctx.stroke()
  ctx.strokeRect(lx - 4.5, ly - lh - 10, 9, 10)
  ctx.beginPath(); ctx.moveTo(lx - 6, ly - lh - 10); ctx.lineTo(lx, ly - lh - 17); ctx.lineTo(lx + 6, ly - lh - 10); ctx.stroke()
  for (const f of [0.3, 0.55, 0.8]) { ctx.beginPath(); ctx.moveTo(lx - 5 + f * 1.5, ly - lh * f); ctx.lineTo(lx + 5 - f * 1.5, ly - lh * f); ctx.stroke() }
  ctx.strokeStyle = 'rgba(191,160,106,.45)'
  const beam = Math.sin(e.t * 0.9)
  ctx.beginPath(); ctx.moveTo(lx, ly - lh - 5); ctx.lineTo(lx - 70, ly - lh - 5 + beam * 10); ctx.stroke()

  // sea floor (sand) — shaded under the line, stippled
  ctx.beginPath(); ctx.moveTo(0, H)
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, Math.min(bed(x / W), x / W > SHORE_X ? by - (x / W - SHORE_X) * 120 : 1e9))
  ctx.lineTo(W, H); ctx.closePath()
  ctx.fillStyle = 'rgba(230,220,203,.55)'; ctx.fill()
  ctx.strokeStyle = LINE; ctx.stroke()
  ctx.fillStyle = 'rgba(94,90,82,.25)'
  for (let i = 0; i < 140; i++) { const x = hash(i) * W, y = bed(x / W) + 4 + hash(i + 99) * (H - bed(x / W)); if (y < H - 2) ctx.fillRect(x, y, 1, 1) }

  // water body + surface (surface sampled once per frame)
  const step = 3, N = Math.floor((W * SHORE_X) / step) + 1
  const ys = new Float32Array(N)
  for (let i = 0; i < N; i++) ys[i] = surf((i * step) / W)
  ctx.beginPath(); ctx.moveTo(0, ys[0])
  for (let i = 1; i < N; i++) ctx.lineTo(i * step, ys[i])
  for (let x = W * SHORE_X; x >= 0; x -= 6) ctx.lineTo(x, bed(x / W))
  ctx.closePath(); ctx.fillStyle = 'rgba(250,248,244,.9)'; ctx.fill()
  ctx.beginPath()
  for (let i = 0; i < N; i++) { const y = ys[i] + 7; i ? ctx.lineTo(i * step, y) : ctx.moveTo(0, y) }
  ctx.strokeStyle = 'rgba(220,210,193,.8)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.beginPath()
  for (let i = 0; i < N; i++) i ? ctx.lineTo(i * step, ys[i]) : ctx.moveTo(0, ys[i])
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke()

  // the peak: where the sandbar makes waves stand up
  ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(191,160,106,.55)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(X(BAR_X), y0 + 12); ctx.lineTo(X(BAR_X), bed(BAR_X) - 2); ctx.stroke(); ctx.setLineDash([])
  ctx.font = MONO; ctx.fillStyle = GOLD_INK; ctx.textAlign = 'center'; ctx.fillText(v.lang === 'fr' ? 'BANC · PIC' : 'SANDBAR · PEAK', X(BAR_X), bed(BAR_X) + 14); ctx.textAlign = 'start'

  // breaking waves: plunging lip, then whitewater
  for (const w of e.waves) {
    if (!w.broken) continue
    const x = X(w.x), H_ = e.height(w), cy = surf(w.x)
    if (w.shape !== 'mushy' && w.breakT < 0.9) {
      const p = clamp(w.breakT / 0.55), reach = W * 0.03 * (0.6 + w.Hb / 2) * p
      ctx.beginPath(); ctx.moveTo(x - 2, cy)
      ctx.quadraticCurveTo(x + reach * 0.6, cy - 10 - w.Hb * 3, x + reach, cy + H_ * pxM * 0.55 * p)
      ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.globalAlpha = 1 - clamp((w.breakT - 0.6) / 0.3); ctx.stroke(); ctx.globalAlpha = 1
    }
    // foam: a stippled cloud riding the bore
    const n = Math.round(30 + H_ * 40)
    ctx.fillStyle = 'rgba(26,26,24,.38)'
    for (let i = 0; i < n; i++) {
      const fx = x - hash(w.id * 31 + i) * W * 0.05 * (1 + H_ * 0.3) + Math.sin(e.t * 3 + i) * 1.5
      const fy = surf(fx / W) + hash(w.id * 17 + i) * H_ * pxM * 0.8 - 2
      ctx.fillRect(fx, fy, 1.4, 1.4)
    }
    // spray above the lip
    ctx.fillStyle = GOLD
    for (let i = 0; i < 10; i++) {
      const a = (e.t * 2 + hash(i + w.id)) % 1
      ctx.globalAlpha = (1 - a) * clamp(H_ - 0.3)
      ctx.fillRect(x + hash(i * 3) * 10 - 4, cy - 6 - a * 14, 1.3, 1.3)
    }
    ctx.globalAlpha = 1
  }
  // spilling (mushy) waves crumble from the top before breaking
  for (const w of e.waves) {
    if (w.broken || w.shape !== 'mushy') continue
    const st = e.steepness(w)
    if (st < 0.6) continue
    ctx.fillStyle = 'rgba(26,26,24,.3)'
    for (let i = 0; i < 18 * st; i++) { const fx = X(w.x) - hash(i + w.id) * 16 + 4; ctx.fillRect(fx, surf(fx / W) - hash(i * 7) * 3, 1.2, 1.2) }
  }

  // size labels on incoming waves: reading the set
  ctx.font = MONO; ctx.textAlign = 'center'
  for (const w of e.waves) {
    if (w.broken || w.x < 0.04 || w.x > 0.6) continue
    const hgt = e.height(w)
    ctx.fillStyle = GOLD_INK; ctx.globalAlpha = clamp((w.x - 0.04) / 0.05) * clamp((0.6 - w.x) / 0.06)
    const hand = v.lang === 'fr' ? (w.hand === 'right' ? 'droite' : 'gauche') : (w.hand === 'right' ? 'right' : 'left')
    ctx.fillText(`${hgt.toFixed(1)} m · ${hand}`, X(w.x), surf(w.x) - 16)
    ctx.fillStyle = MUTED
    ctx.fillText(`${w.idx + 1}/${w.setSize}`, X(w.x), surf(w.x) - 28)
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'start'

  // the surfer
  if (!e.ride) {
    const s = e.surfer, sx = X(s.x), sy = surf(s.x) - 2
    const slope = (surf(s.x + 0.004) - surf(s.x - 0.004)) / (W * 0.008)
    if (s.state === 'inside') drawSurfer(ctx, sx, sy + 4, e.t * 6, 'tumble', 1)
    else if (s.state === 'returning') drawSurfer(ctx, sx, sy, Math.atan(slope), 'paddle', -1, e.t)
    else if (s.state === 'paddling') drawSurfer(ctx, sx, sy, Math.atan(slope), 'paddle', 1, e.t)
    else drawSurfer(ctx, sx, sy, Math.atan(slope) * 0.6, 'sit', 1, e.t)

    // timing ring: tightens as the wave arrives, turns gold inside the take-off window
    const inc = e.incoming(), fw = e.faceWave()
    if ((s.state === 'lineup' || s.state === 'paddling') && (inc || fw)) {
      const st = fw ? e.steepness(fw, s.x) : inc!.steep
      const ready = !!fw && st >= 0.36 && (st <= 0.97 || fw.shape === 'mushy')
      const r = fw ? 10 : 10 + 28 * clamp(inc!.ttc / 2.8)
      ctx.beginPath(); ctx.arc(sx, sy - 6, r, 0, Math.PI * 2)
      ctx.strokeStyle = ready ? GOLD : 'rgba(26,26,24,.25)'; ctx.lineWidth = ready ? 1.6 : 1
      ctx.setLineDash(ready ? [] : [3, 4]); ctx.stroke(); ctx.setLineDash([])
      if (ready) { ctx.font = MONO; ctx.fillStyle = GOLD_INK; ctx.textAlign = 'center'; ctx.fillText(v.lang === 'fr' ? 'RAME !' : 'PADDLE!', sx, sy - r - 12); ctx.textAlign = 'start' }
    }
  }
}

/* ================================================================ MINIMAP (bird's-eye) */
export function drawMinimap(ctx: CanvasRenderingContext2D, v: View, e: SurfEngine) {
  const w = Math.min(240, v.W * 0.4), h = w * 0.6, x0 = v.W - w - 14, y0 = 14
  ctx.fillStyle = 'rgba(250,248,244,.86)'; ctx.fillRect(x0, y0, w, h)
  // HUD corners
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1
  const c = 8
  for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]] as const) {
    ctx.beginPath(); ctx.moveTo(cx, cy + dy * c); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * c, cy); ctx.stroke()
  }
  const mx = (x: number) => x0 + 10 + clamp(x, 0, 1) * (w - 20)
  const my = (a: number) => y0 + 14 + a * (h - 24)
  ctx.font = '500 8.5px "JetBrains Mono", monospace'; ctx.fillStyle = MUTED
  ctx.fillText(v.lang === 'fr' ? 'VUE DU CIEL' : "BIRD'S-EYE", x0 + 8, y0 + 10)
  // shore
  ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(mx(SHORE_X), my(0)); ctx.lineTo(mx(SHORE_X), my(1)); ctx.stroke()
  // the sandbar: a peak (closest to the open sea in the middle)
  const barX = (a: number) => BAR_X + 0.16 * Math.pow(a - 0.5, 2) * 4
  ctx.strokeStyle = GOLD; ctx.setLineDash([2, 3]); ctx.beginPath()
  for (let a = 0; a <= 1.001; a += 0.05) a ? ctx.lineTo(mx(barX(a)), my(a)) : ctx.moveTo(mx(barX(a)), my(a))
  ctx.stroke(); ctx.setLineDash([])
  // waves: straight lines hit the peak first and peel (clean); lines bent like the bar close out at once
  for (const wv of e.waves) {
    // close-outs hit the whole bar at once; peeling waves come in at an angle (one end touches first)
    const slant = wv.hand === 'right' ? 1 : -1
    const lineX = (a: number) => wv.shape === 'closeout' ? wv.x + 0.16 * Math.pow(a - 0.5, 2) * 4 : wv.x + slant * (a - 0.5) * 0.12
    ctx.setLineDash(wv.shape === 'mushy' ? [3, 3] : [])
    ctx.lineWidth = wv.shape === 'mushy' ? 1 : 1.3
    for (let a = 0; a < 1; a += 0.04) {
      const xa = lineX(a), xb = lineX(a + 0.04)
      const broken = wv.broken && xa > barX(a) - 0.01
      ctx.strokeStyle = broken ? 'rgba(26,26,24,.25)' : wv.shape === 'closeout' ? '#9A4E3A' : INK
      ctx.beginPath(); ctx.moveTo(mx(xa), my(a)); ctx.lineTo(mx(xb), my(a + 0.04)); ctx.stroke()
    }
  }
  ctx.setLineDash([])
  for (const wv of e.waves) {
    if (wv.shape === 'closeout' || wv.x < 0.05) continue
    const slant = wv.hand === 'right' ? 1 : -1
    const ay = my(slant > 0 ? 0.08 : 0.92), ax2 = mx(wv.x + slant * (slant > 0 ? -0.42 : 0.42) * 0.12)
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ax2, ay - slant * 5); ctx.lineTo(ax2 - 3, ay); ctx.lineTo(ax2 + 3, ay); ctx.closePath(); ctx.fill()
  }
  // the surfer
  const s = e.surfer
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(mx(e.ride ? s.lineupX : s.x), my(0.55), 2.6, 0, Math.PI * 2); ctx.fill()
  // legend
  ctx.font = '500 8px "JetBrains Mono", monospace'
  ctx.fillStyle = INK; ctx.fillText(v.lang === 'fr' ? '— pic' : '— peak', x0 + 8, y0 + h - 4)
  ctx.fillStyle = '#9A4E3A'; ctx.fillText(v.lang === 'fr' ? '— ferme' : '— close-out', x0 + 50, y0 + h - 4)
  ctx.fillStyle = MUTED; ctx.fillText(v.lang === 'fr' ? '- - molle' : '- - mushy', x0 + 114, y0 + h - 4)
}

/* ================================================================ SURFER (line-art) */
export function drawSurfer(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, pose: 'sit' | 'paddle' | 'stand' | 'tumble', dir: 1 | -1, t = 0, crouch = 0.2) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(dir, 1)
  ctx.strokeStyle = INK; ctx.lineWidth = 1.25; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  // board
  ctx.beginPath(); ctx.ellipse(0, 0, 21, 2.8, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-15, 2.6); ctx.lineTo(-17.5, 7); ctx.stroke()
  if (pose === 'sit') {
    ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-1, -15); ctx.moveTo(-2, -2); ctx.lineTo(4, 4); ctx.lineTo(3, 9)
    ctx.moveTo(-1, -12); ctx.lineTo(5, -6); ctx.stroke()
    ctx.beginPath(); ctx.arc(-0.5, -19, 3.4, 0, Math.PI * 2); ctx.stroke()
  } else if (pose === 'paddle') {
    const a = Math.sin(t * 7)
    ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(6, -4)
    ctx.moveTo(4, -4); ctx.lineTo(4 + a * 6, 2 + Math.abs(a) * 4)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(10, -6, 3.2, 0, Math.PI * 2); ctx.stroke()
  } else if (pose === 'stand') {
    const c = crouch, hip = -12 + c * 5, sh = -22 + c * 8
    ctx.beginPath()
    ctx.moveTo(-7, -2); ctx.lineTo(-2 - c * 3, hip); ctx.lineTo(6, -2) // legs
    ctx.moveTo(-2 - c * 3, hip); ctx.lineTo(0, sh)                      // torso
    ctx.moveTo(-11, sh + 5 + c * 2); ctx.lineTo(0, sh + 2); ctx.lineTo(11, sh + 4 - c * 3) // arms
    ctx.stroke()
    ctx.beginPath(); ctx.arc(1, sh - 4, 3.4, 0, Math.PI * 2); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -12); ctx.moveTo(0, -10); ctx.lineTo(-3, -1); ctx.moveTo(0, -10); ctx.lineTo(4, -1); ctx.stroke()
    ctx.beginPath(); ctx.arc(9, -14, 3.2, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.restore()
}

export function waveIsReadable(w: Wave) { return !w.broken && w.x > 0.04 && w.x < 0.6 }
