/**
 * RIDE — what happens once you're up and riding (pure TypeScript, no DOM).
 *
 * Coordinates ("peel space"): `p` runs along the wave in the direction it peels, `c` is the curl (the
 * point where the lip is pitching) and moves along `p`; `u = p − c` is how far ahead of the curl you
 * are. `y` is your height on the face (0 = trough, 1 = lip). The screen mirrors peel space with `dir`.
 *
 * Feel: arrows / pointer give the direction you WANT to go; the board carves toward it at a limited
 * turn rate and keeps its momentum. Gravity speeds you up going down the face and slows you going up;
 * near the curl the wave pushes you along and lifts you. So you ride like a surfer: drop, bottom turn,
 * climb, top turn / snap off the lip, drop again — juggling the bottom and the top of the wave.
 *
 * Barrels only form on hollow waves, mostly on "sections" where the lip throws harder (announced in
 * advance). To get barreled you stall so the section catches you, hold a mid line under the lip and
 * match the peel speed; too high → the lip lands on you, too slow → the foam ball eats you.
 */
export type Shape = 'clean' | 'mushy' | 'closeout'
export type Hand = 'right' | 'left'
export type EndReason = 'made' | 'kickout' | 'bogged' | 'wipeout'
export type Callout = 'TUBE' | 'OUT' | 'CARVE' | 'SNAP' | 'CUTBACK' | 'SECTION' | 'CLOSE'

export interface RideInput { ix: number; iy: number; aim: { p: number; y: number } | null }
export interface RideResult {
  score: number; reason: EndReason; size: number; time: number; tube: number; tubeExit: boolean
  turns: number; critical: number; late: number; shape: Shape; hand: Hand
}
interface Section { a: number; b: number; k: number }

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const G = 2.6            // gravity along the face (face heights / s²)
const TURN_RATE = 3.4    // rad / s

export class RideSim {
  readonly shape: Shape
  readonly hand: Hand
  /** screen direction of the peel. Viewed from the beach, a right-hander peels toward screen-left. */
  readonly dir: 1 | -1
  readonly size: number
  readonly late: number
  readonly L: number
  readonly sections: Section[] = []
  t = 0
  p = 0.9; y = 0.92; vp: number; vy = -0.6
  c = 0
  inTube = false; tubeT = 0; tubeExit = false
  stalling = false
  critT = 0
  turns: { q: number; kind: Callout }[] = []
  ended: EndReason | null = null; endT = 0; endCause = ''
  labels: { key: Callout; t: number }[] = []
  events: Callout[] = []
  private prevVy = -0.9
  private lastBottom: { t: number; speed: number } | null = null
  private cutStart: number | null = null
  private boggedT = 0
  private warned = new Set<number>()
  private seed: number

  constructor(o: { shape: Shape; hand: Hand; size: number; late: number; rand: () => number }) {
    this.shape = o.shape; this.hand = o.hand; this.size = o.size; this.late = clamp(o.late)
    this.dir = o.hand === 'right' ? -1 : 1
    this.seed = o.rand() * 10
    this.vp = 1.1 + this.late * 0.7
    this.L = o.shape === 'clean' ? 15 + o.rand() * 5 : o.shape === 'mushy' ? 10 + o.rand() * 3 : 7
    if (o.shape === 'clean') {
      // two throwing sections, the second further down the line
      let a = 2.2 + o.rand() * 1.8
      for (let i = 0; i < 2; i++) {
        const len = 2.2 + o.rand() * 1.2
        this.sections.push({ a, b: a + len, k: 0.7 + o.rand() * 0.3 })
        a += len + 3 + o.rand() * 3
      }
    }
  }

  get speed() { return Math.hypot(this.vp, this.vy) }
  get u() { return this.p - this.c }
  power() { return (0.6 + 0.4 * clamp(this.size / 2)) * (this.shape === 'clean' ? 1 : this.shape === 'mushy' ? 0.75 : 0.9) }

  /** 0..1: how hard the lip is throwing at curl position c. */
  sectionAt(c = this.c) {
    let s = 0
    for (const sec of this.sections) if (c > sec.a && c < sec.b) s = Math.max(s, Math.sin(Math.PI * (c - sec.a) / (sec.b - sec.a)) * sec.k)
    return s
  }
  /** Size of the barrel opening (0 = none). Small on ordinary stretches, big on throwing sections. */
  barrel(c = this.c) { return this.shape === 'clean' ? 0.18 + 0.82 * this.sectionAt(c) : this.shape === 'closeout' ? 0.3 : 0 }
  peel(c = this.c) {
    if (this.shape === 'closeout') return this.t > 1.6 ? 6.5 : 1.6
    const base = this.shape === 'clean' ? 1.7 : 1.15
    return base * (1 + 0.55 * this.sectionAt(c)) * (1 + 0.12 * Math.sin(c * 1.3 + this.seed))
  }
  /** Next section start ahead of the curl (for the "SECTION" warning). */
  nextSection() { return this.sections.find(s => s.a > this.c - 0.2) ?? null }
  /** The barrel window, in peel space. */
  barrelWindow(bs = this.barrel()) { return { u0: -0.68 * (0.4 + bs), u1: 0.28, y0: 0.08, y1: 0.32 + 0.42 * bs } }

  step(dt: number, inp: RideInput) {
    if (this.ended) { this.endT += dt; return }
    this.t += dt
    this.c += this.peel() * dt
    let u = this.p - this.c
    const pw = this.power()

    // ---- forces: gravity, the pocket's push and lift
    const pf = u > -0.2 ? Math.exp(-Math.max(0, u) / 1.6) : 0.4
    // under the pitching lip the wave's energy is at its peak: a strong push, so you can match the peel
    const underLip = u < 0.35 && u > -0.7 && this.y < 0.75 ? 3.0 * (0.4 + this.barrel()) : 0
    this.vp += (1.3 * pf + underLip) * pw * dt
    this.vy += (-G + 2.1 * pf * pw) * dt

    // ---- steering: carve toward the wanted direction, keep the speed
    let dx = 0, dy = 0
    if (inp.aim) { dx = inp.aim.p - this.p; dy = inp.aim.y - this.y }
    else { dx = inp.ix * this.dir; dy = inp.iy }
    const dl = Math.hypot(dx, dy)
    this.stalling = false
    if (dl > 0.06) {
      dx /= dl; dy /= dl
      const sp = this.speed
      const a = Math.atan2(this.vy, this.vp), b = Math.atan2(dy, dx)
      const da = Math.atan2(Math.sin(b - a), Math.cos(b - a))
      // Pulling back near the curl = STALL (drag a hand, sit back): you brake but keep your line.
      // Pulling back out on the open face = CUTBACK: you carve all the way round toward the curl.
      const stall = Math.abs(da) > 2.2 && u < 1.2 && dx * this.vp < 0
      let na = a, ns = sp
      if (stall) {
        // brake, but keep following the wanted height (you can stall AND drop to a mid line)
        ns = Math.max(0.2, sp - 1.7 * dt)
        const bb = Math.atan2(dy, 0.7 * Math.sign(this.vp || 1))
        const d2 = Math.atan2(Math.sin(bb - a), Math.cos(bb - a))
        na = a + clamp(d2, -TURN_RATE * dt, TURN_RATE * dt)
      } else {
        na = a + clamp(da, -TURN_RATE * dt, TURN_RATE * dt)
        if (Math.cos(da) > 0.6) ns += 0.5 * dt          // pumping along your line
        if (Math.abs(da) > 2.2) ns -= 0.6 * dt          // a hard reverse bleeds speed
      }
      this.stalling = stall
      this.vp = Math.cos(na) * ns; this.vy = Math.sin(na) * ns
    }

    // ---- drag: stall high near the lip, bog in the flats, choke in the whitewater
    const k = 0.28 + 1.3 * clamp((this.y - 0.82) / 0.18) + (u < -0.1 && !this.inTube ? 2.4 : 0) + (this.y < 0.04 ? 1.4 : 0)
    const f = Math.exp(-k * dt)
    this.vp *= f; this.vy *= f

    this.p += this.vp * dt
    this.y += this.vy * dt
    u = this.p - this.c

    // ---- the trough and the lip
    if (this.y < 0) { this.y = 0; this.vy = Math.max(0, this.vy) }
    if (this.y > 1) {
      if (u < 0.45) return this.end('wipeout', 'lip') // straight into the pitching lip
      const wantsOut = (inp.aim ? inp.aim.y > 1.05 : inp.iy > 0.5) && u > (this.shape === 'closeout' ? 0.3 : 1.4)
      if (wantsOut) return this.end('kickout', 'kickout')
      this.y = 1
      if (this.vy > 0.9) this.registerTop(true)
      this.vy = -Math.abs(this.vy) * 0.25
    }

    // ---- the barrel
    const bs = this.barrel(), w = this.barrelWindow(bs)
    const inBarrel = bs > 0.15 && u > w.u0 && u < w.u1 && this.y > w.y0 && this.y < w.y1
    if (inBarrel) {
      if (!this.inTube) { this.inTube = true; this.say('TUBE') }
      this.tubeT += dt
    } else if (this.inTube) {
      this.inTube = false
      if (u >= w.u1) { this.tubeExit = true; this.say('OUT') }                       // shot out of the barrel
      else if (u < 0) return this.end('wipeout', this.y >= w.y1 ? 'lip' : 'foam')     // still under the lip
      // otherwise you simply left the barrel's line ahead of the curl: no exit bonus, no crash
    }
    if (!this.inTube && u < -0.1) return this.end('wipeout', 'foam')
    if (this.shape === 'closeout' && this.t > 0.3 && !this.warned.has(-1)) { this.warned.add(-1); this.say('CLOSE') }

    // ---- section warning
    const ns = this.nextSection()
    if (ns && ns.a - this.c < 2.2 && !this.warned.has(ns.a)) { this.warned.add(ns.a); this.say('SECTION') }

    // ---- manoeuvres: bottom turn → top turn = a turn; going back to the curl and returning = a cutback
    if (u >= 0 && u < 1.6) this.critT += dt
    if (this.vy > 0 && this.prevVy <= 0 && this.y < 0.45) this.lastBottom = { t: this.t, speed: this.speed }
    if (this.vy < 0 && this.prevVy >= 0 && this.y > 0.55) this.registerTop(this.y > 0.9)
    if (this.vp < -0.2 && u > 0.3 && this.cutStart === null) this.cutStart = this.t
    if (this.cutStart !== null) {
      if (this.vp > 0.3) {
        if (this.t - this.cutStart < 3.2 && u > -0.1) { this.turns.push({ q: 0.95 * (u < 1.6 ? 1.2 : 1), kind: 'CUTBACK' }); this.say('CUTBACK') }
        this.cutStart = null
      } else if (this.t - this.cutStart > 3.2) this.cutStart = null
    }
    this.prevVy = this.vy

    // ---- endings
    if (this.c >= this.L) return this.end('made', 'end')
    if (this.t > 15) return this.end('made', 'end')
    this.boggedT = this.speed < 0.3 && u > 3 ? this.boggedT + dt : 0
    if (this.boggedT > 1.2) return this.end('bogged', 'bogged')
  }

  private registerTop(snap: boolean) {
    const b = this.lastBottom
    if (!b || this.t - b.t > 2.2) return
    const u = this.u
    const q = clamp(Math.max(this.speed, b.speed) / 3) * (u < 1.6 ? 1.35 : 1) * (snap ? 1.15 : 1)
    this.turns.push({ q, kind: snap ? 'SNAP' : 'CARVE' })
    this.say(snap ? 'SNAP' : 'CARVE')
    this.lastBottom = null
  }
  private say(key: Callout) { this.labels.push({ key, t: this.t }); this.events.push(key) }
  private end(reason: EndReason, cause: string) { this.ended = reason; this.endCause = cause; this.endT = 0 }

  /** WSL-style 0–10: size, commitment, turns (quality), barrel (+ clean exit), critical section, length. */
  result(): RideResult {
    const sizeF = clamp(this.size / 3)
    const turnQ = clamp([...this.turns].sort((a, b) => b.q - a.q).slice(0, 4).reduce((n, x) => n + x.q, 0) / 3.2)
    const tubeF = clamp(this.tubeT / 2.4 + (this.tubeExit ? 0.25 : 0))
    const critF = clamp(this.critT / Math.max(this.t, 1))
    const lenF = clamp(this.t / 10)
    const raw = 2.0 * sizeF + 0.9 * this.late + 2.6 * turnQ + 2.4 * tubeF + 1.1 * critF + 1.0 * lenF
    const r = this.ended ?? 'made'
    const mult = r === 'made' ? 1 : r === 'kickout' ? 0.9 : r === 'bogged' ? 0.8 : this.tubeT > 0.5 ? 0.6 : 0.45
    return {
      score: Math.max(0.1, Math.round(Math.min(10, raw * mult) * 100) / 100), reason: r, size: this.size, time: this.t,
      tube: this.tubeT, tubeExit: this.tubeExit, turns: this.turns.length, critical: this.critT, late: this.late, shape: this.shape, hand: this.hand,
    }
  }
}
