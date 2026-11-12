/**
 * SESSION — surf game engine (pure TypeScript, no DOM).
 *
 * Built on real surf/ocean behaviour, slowed down so the eye can read it:
 * - Swell arrives in SETS (3–6 waves) separated by lulls; the biggest waves sit mid-to-late in the set.
 * - Waves SHOAL as the sea floor rises (Green's law, H ∝ d^-¼) and slow down (shallow-water speed √(g·d)).
 * - A wave BREAKS when its height reaches ~0.78 × depth (McCowan breaker index).
 * - Breaker TYPE follows the Iribarren number ξ = tanβ / √(H/L₀): long-period swell → hollow, plunging,
 *   clean waves; short wind-swell → spilling, mushy ones. Offshore wind grooms faces, onshore crumbles them.
 * - Scoring follows the WSL format: each ride is judged out of 10 (size, commitment, critical section,
 *   tube, manoeuvres, length); a heat total is the sum of the TWO best waves. A wave caught before the
 *   horn still counts.
 */
import type { Conditions } from '../../lib/conditions'
import { RideSim, clamp, type Hand, type RideResult, type Shape } from './ride'
export { clamp }
export type { Hand, RideResult, Shape } from './ride'

export type SurferState = 'lineup' | 'paddling' | 'riding' | 'inside' | 'returning'

export interface Wave {
  id: number
  x: number            // crest position, 0 = open ocean (left), 1 = beach (right)
  H0: number           // deep-water height (m)
  shape: Shape
  hand: Hand           // right-hander or left-hander
  set: number; idx: number; setSize: number
  broken: boolean
  breakT: number       // time since breaking (s)
  Hb: number           // height at breaking (m)
  done: boolean
}

export type GameEvent =
  | { type: 'setSoon'; n: number; maxH: number }
  | { type: 'caught'; late: number; shape: Shape; size: number; hand: Hand }
  | { type: 'falls' }
  | { type: 'inside' }
  | { type: 'tube' } | { type: 'turn' } | { type: 'pocket' }
  | { type: 'rideEnd'; result: RideResult }
  | { type: 'horn' }

/* ---------------------------------------------------------------- utilities */
const smooth = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t) }
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

/* ---------------------------------------------------------------- the beach */
export const BAR_X = 0.64          // outer sandbar (main peak)
export const SHORE_X = 0.965
/** Base depth profile (m) for a ~1.3 m day: deep water → outer bar → inner trough → beach. */
export function baseDepth(x: number) {
  if (x <= BAR_X) return 2.2 + 5.8 * Math.pow(1 - clamp(x / BAR_X), 1.6)
  if (x <= 0.75) return 2.2 + 0.9 * Math.sin((Math.PI / 2) * (x - BAR_X) / (0.75 - BAR_X))
  if (x < SHORE_X) return 3.1 * Math.pow(1 - (x - 0.75) / (SHORE_X - 0.75), 1.3)
  return 0
}
const GAMMA: Record<Shape, number> = { clean: 0.78, closeout: 0.78, mushy: 0.7 }

/* ---------------------------------------------------------------- engine */
export class SurfEngine {
  cond: Conditions
  k: number              // depth scale: bigger days break on deeper water
  speedK: number         // longer period → faster swell
  waves: Wave[] = []
  t = 0
  duration = 90
  over = false
  hornSounded = false
  surfer = { x: 0.58, vx: 0, state: 'lineup' as SurferState, paddleT: 0, lineupX: 0.58, insideT: 0, bob: 0, duckT: 0 }
  ride: RideSim | null = null
  rideWave: Wave | null = null
  results: RideResult[] = []
  horizon: { n: number; maxH: number; t: number } | null = null
  events: GameEvent[] = []
  input = { paddle: false, move: 0, ix: 0, iy: 0, aim: null as { p: number; y: number } | null }
  rand: () => number
  private nextSet = 2.2
  private queue: { at: number; wave: Omit<Wave, 'x' | 'broken' | 'breakT' | 'Hb' | 'done' | 'id'> }[] = []
  private ids = 0
  private setNo = 0
  private shapeP: { clean: number; mushy: number; closeout: number }

  constructor(cond: Conditions, seed = Date.now()) {
    this.cond = cond
    this.rand = rng(seed)
    // calibrate the bar so a wave of the significant height breaks right on it (H₀·(d₀/d_bar)^¼ = 0.78·d_bar):
    // bigger set waves then break further out, smaller ones on the inside — like a real spot
    this.k = clamp(0.8 * cond.hs, 0.45, 2.6)
    this.speedK = 0.8 + clamp(cond.tp, 5, 18) / 40
    this.shapeP = shapeOdds(cond)
  }

  /* ---- swell physics ---- */
  depth(x: number) { return baseDepth(x) * this.k }
  celerity(x: number) { return 0.05 * Math.sqrt(Math.max(0.35, baseDepth(x))) * this.speedK } // normalized units / s
  height(w: Wave, x = w.x) {
    if (w.broken) return w.Hb * Math.exp(-(x - this.breakX(w)) / 0.13)
    const d0 = baseDepth(0), d = Math.max(0.3, baseDepth(x))
    return w.H0 * Math.pow(d0 / d, 0.25)
  }
  private breakXs = new Map<number, number>()
  breakX(w: Wave) { return this.breakXs.get(w.id) ?? w.x }
  /** 0 offshore → 1 at the breaking point: drives how steep the front face looks. */
  steepness(w: Wave, x = w.x) {
    if (w.broken) return 1
    const r = this.height(w, x) / Math.max(0.2, this.depth(x))
    return clamp((r - 0.3) / (GAMMA[w.shape] - 0.3))
  }
  backLen(x: number) { return (0.07 + 0.004 * this.cond.tp) * (0.55 + 0.45 * this.celerity(x) / this.celerity(0)) }
  frontLen(w: Wave, x = w.x) { return w.broken ? 0.016 : this.backLen(x) * (1 - 0.74 * this.steepness(w, x)) }

  /** Sea-surface elevation (m) at x: the sum of every wave's (asymmetric) profile + a little chop. */
  eta(x: number) {
    let e = 0.05 * Math.sin(x * 47 + this.t * 1.4) + 0.035 * Math.sin(x * 93 - this.t * 2.2)
    for (const w of this.waves) {
      const u = x - w.x
      const Lb = this.backLen(w.x) * (w.broken ? 1.5 : 1), Lf = this.frontLen(w)
      let b = 0
      if (u <= 0 && u > -Lb) b = 0.5 * (1 + Math.cos(Math.PI * u / Lb))
      else if (u > 0 && u < Lf) b = 0.5 * (1 + Math.cos(Math.PI * u / Lf))
      if (!b) continue
      const H = this.height(w)
      e += (w.broken ? H * 0.75 : H * 0.62) * b - (w.broken ? 0 : H * 0.08)
    }
    return e
  }

  /* ---- sets ---- */
  private scheduleSet() {
    const r = this.rand, c = this.cond
    const n = 3 + Math.floor(r() * 3) + (c.tp >= 12 ? 1 : 0)
    const peak = 0.55 + r() * 0.3
    const spacing = Math.max(3.0, 0.34 * c.tp)
    let maxH = 0
    this.setNo++
    for (let i = 0; i < n; i++) {
      const pos = n === 1 ? 0.5 : i / (n - 1)
      const env = Math.exp(-Math.pow((pos - peak) / 0.38, 2))
      const H0 = c.hs * (0.68 + 0.62 * env) * (0.92 + 0.16 * r())
      maxH = Math.max(maxH, H0)
      const pRight = clamp(0.5 + (315 - (c.dir ?? 300)) / 120, 0.25, 0.75)
      this.queue.push({ at: this.nextSet + i * spacing, wave: { H0, shape: pickShape(this.shapeP, env, r()), hand: r() < pRight ? 'right' : 'left', set: this.setNo, idx: i, setSize: n } })
    }
    this.horizon = { n, maxH, t: this.nextSet - 2.6 }
    this.events.push({ type: 'setSoon', n, maxH })
    const lull = 5 + r() * 4
    this.nextSet += (n - 1) * spacing + lull
  }

  /* ---- main step ---- */
  step(dt: number) {
    dt = Math.min(dt, 1 / 20)
    this.t += dt
    if (!this.over && this.t >= this.duration) {
      if (!this.hornSounded) { this.hornSounded = true; this.events.push({ type: 'horn' }) }
      if (!this.ride) this.over = true // a wave caught before the horn still counts
    }
    if (this.t > this.nextSet - 2.8) this.scheduleSet()
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (this.queue[i].at <= this.t) {
        const q = this.queue.splice(i, 1)[0]
        this.waves.push({ ...q.wave, id: ++this.ids, x: -0.04, broken: false, breakT: 0, Hb: 0, done: false })
      }
    }
    // move, shoal, break
    for (const w of this.waves) {
      w.x += this.celerity(clamp(w.x, 0, 1)) * dt
      if (!w.broken && this.height(w) >= GAMMA[w.shape] * this.depth(w.x)) {
        w.Hb = this.height(w); w.broken = true; this.breakXs.set(w.id, w.x) // Hb first: once broken, height() follows the bore
      }
      if (w.broken) w.breakT += dt
      if (w.x > SHORE_X + 0.02 || (w.broken && this.height(w) < 0.08)) w.done = true
    }
    this.waves = this.waves.filter(w => !w.done)
    if (this.ride) this.stepRide(dt)
    else this.stepSurfer(dt)
  }

  /* ---- surfer in the line-up ---- */
  /** The wave whose front face the surfer is sitting on (if any). */
  faceWave() {
    const x = this.surfer.x
    for (const w of this.waves) {
      if (w.broken) continue
      const u = x - w.x
      if (u > 0 && u < this.frontLen(w) * 1.05) return w
    }
    return null
  }
  /** Nearest wave still coming at the surfer, with time-to-contact (for the timing ring). */
  incoming() {
    const x = this.surfer.x
    let best: { w: Wave; ttc: number; steep: number } | null = null
    for (const w of this.waves) {
      if (w.broken || w.x > x) continue
      const toe = w.x + this.frontLen(w)
      const ttc = Math.max(0, (x - toe) / this.celerity(w.x))
      if (ttc < 3.2 && (!best || ttc < best.ttc)) best = { w, ttc, steep: this.steepness(w, x) }
    }
    return best
  }

  private stepSurfer(dt: number) {
    const s = this.surfer, inp = this.input
    s.bob += dt
    if (s.state === 'inside') {
      // tumbling in the whitewater, pushed toward the beach
      s.insideT -= dt
      s.x = Math.min(0.9, s.x + this.celerity(s.x) * 0.6 * dt)
      if (s.insideT <= 0) s.state = 'returning'
      return
    }
    if (s.state === 'returning') {
      s.x -= 0.075 * dt
      if (s.x <= s.lineupX) { s.x = s.lineupX; s.state = 'lineup' }
    } else {
      // reposition in the line-up (←/→), paddle for a wave (hold)
      if (inp.move && !inp.paddle) { s.x = clamp(s.x + inp.move * 0.07 * dt, 0.38, 0.8); s.lineupX = s.x }
      if (inp.paddle && !this.over) {
        s.state = 'paddling'; s.paddleT += dt
        s.vx = Math.min(0.045, s.vx + 0.09 * dt)
      } else {
        s.state = 'lineup'; s.paddleT = 0
        s.vx *= Math.exp(-3 * dt)
      }
      s.x = clamp(s.x + s.vx * dt, 0.3, 0.86)
      // catch?
      const w = this.faceWave()
      if (w && s.state === 'paddling' && s.paddleT > 0.3) {
        const steep = this.steepness(w, s.x)
        if (steep > 0.97 && w.shape !== 'mushy') { this.wipeoutInside('falls'); return }
        if (steep >= 0.36) { this.startRide(w, (steep - 0.36) / 0.61); return }
      }
    }
    // whitewater rolling over the surfer: small foam → automatic duck-dive (a short push back);
    // a big bore (≥ 1.4 m) still catches you inside, like on a real heavy day
    if (s.duckT > 0) s.duckT -= dt
    for (const w of this.waves) {
      if (!w.broken) continue
      const u = s.x - w.x, b = this.height(w)
      if (u > -0.02 && u < 0.012 && b > 0.35 && s.duckT <= 0) {
        const fresh = s.x - this.breakX(w) < 0.09
        if (fresh && b >= Math.max(1.4, 1.05 * this.cond.hs) && s.state !== 'returning') { this.wipeoutInside('inside'); return }
        s.duckT = 0.7; s.x = Math.min(0.86, s.x + 0.012 * b); s.vx = 0; s.paddleT = 0
      }
    }
  }

  private wipeoutInside(kind: 'falls' | 'inside') {
    const s = this.surfer
    s.state = 'inside'; s.insideT = kind === 'falls' ? 1.8 : 1.2; s.vx = 0; s.paddleT = 0
    this.events.push({ type: kind })
  }

  /* ---- riding ---- */
  private startRide(w: Wave, late: number) {
    const size = Math.max(this.height(w, this.surfer.x), 0.5)
    this.ride = new RideSim({ shape: w.shape, hand: w.hand, size, late, rand: this.rand })
    this.rideWave = w
    this.surfer.state = 'riding'
    this.events.push({ type: 'caught', late: this.ride.late, shape: w.shape, size, hand: w.hand })
  }

  private stepRide(dt: number) {
    const r = this.ride!, inp = this.input
    r.step(dt, { ix: inp.ix, iy: inp.iy, aim: inp.aim })
    for (const k of r.events) {
      if (k === 'TUBE') this.events.push({ type: 'tube' })
      else if (k === 'CARVE' || k === 'SNAP' || k === 'CUTBACK') this.events.push({ type: 'turn' })
    }
    r.events.length = 0
    if (r.ended && r.endT > 1.25) this.finishRide()
  }

  private finishRide() {
    const result = this.ride!.result()
    this.results.push(result)
    this.events.push({ type: 'rideEnd', result })
    this.ride = null; this.rideWave = null
    const s = this.surfer
    s.x = 0.8; s.vx = 0; s.paddleT = 0; s.state = 'returning'
    if (this.t >= this.duration) this.over = true
  }

  /** WSL-style heat total: the two best waves. */
  heatTotal() { return [...this.results].sort((a, b) => b.score - a.score).slice(0, 2).reduce((n, r) => n + r.score, 0) }
}

/* ---------------------------------------------------------------- scoring & odds */
/** Breaker-type odds from the Iribarren number + wind. */
export function shapeOdds(c: Conditions) {
  const L0 = 1.56 * c.tp * c.tp
  const xi = 0.05 / Math.sqrt(Math.max(0.2, c.hs) / L0)
  const plunge = smooth(0.32, 0.8, xi)
  let clean = 0.25 + 0.5 * plunge
  let mushy = 0.1 + 0.55 * (1 - plunge)
  const wf = clamp(c.wind / 15)
  if (c.kind === 'offshore') { clean += 0.15 * wf; mushy -= 0.1 * wf }
  else if (c.kind === 'onshore') { mushy += 0.3 * wf; clean -= 0.25 * wf }
  else mushy += 0.1 * wf
  clean = clamp(clean, 0.12, 0.85); mushy = clamp(mushy, 0.05, 0.8)
  let closeout = Math.max(0.1, 1 - clean - mushy)
  const sum = clean + mushy + closeout
  return { clean: clean / sum, mushy: mushy / sum, closeout: closeout / sum }
}

function pickShape(p: { clean: number; mushy: number; closeout: number }, env: number, r: number): Shape {
  // the biggest waves of a set close out a little more often
  const co = p.closeout + (env > 0.85 ? 0.08 : 0)
  if (r < co) return 'closeout'
  if (r < co + p.mushy) return 'mushy'
  return 'clean'
}
