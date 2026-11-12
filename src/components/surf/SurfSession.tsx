import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n/lang'
import { getConditions, PRESETS, type Conditions } from '../../lib/conditions'
import { observeVisible } from '../../lib/hooks'
import { prefersReducedMotion } from '../../lib/env'
import { SurfEngine, type GameEvent, type Hand, type RideResult, type Shape } from './engine'
import { drawMinimap, drawProfile } from './render'
import { drawFace, newFaceState, screenToPeel, type FaceState } from './face'

type Mode = 'intro' | 'playing' | 'paused' | 'over'
type CondKey = 'live' | 'classic' | 'big' | 'windy'

const T = {
  fr: {
    title: 'Session',
    sub: '90 secondes. Lis la série, choisis ta vague, reste dans la poche.',
    steps: [
      ['Lire', 'Les vagues arrivent par séries. La vue du ciel montre leur forme : un pic qui déroule, ou une vague qui ferme d’un bloc.'],
      ['Ramer', 'Positionne-toi avec ◀ ▶, puis maintiens RAMER quand l’anneau devient doré. Trop tôt, la vague passe sous toi. Trop tard, tu chutes.'],
      ['Rider', 'Vue depuis la plage : une droite déroule vers la gauche de l’écran. Vise avec les flèches, la souris ou le doigt : descends pour prendre de la vitesse, remonte pour tourner — jongle entre le bas et le haut. Tube : sur une SECTION, freine vers le déferlement, cale-toi à mi-hauteur, ressors.'],
    ],
    scoring: 'Notation façon WSL : chaque vague sur 10, ta note finale = tes 2 meilleures vagues.',
    start: 'Commencer la session',
    replay: 'Rejouer',
    cond: 'Conditions',
    live: 'Réelles', classic: 'Classique', big: 'Gros jour', windy: 'Venteux',
    liveNote: (c: Conditions) => `Casablanca en ce moment : ${c.hs.toFixed(1)} m · ${Math.round(c.tp)} s · vent ${Math.round(c.wind)} kn ${c.kind}.`,
    flat: (h: number) => `Flat aujourd’hui à Casablanca (${h.toFixed(1)} m) — on simule une journée classique.`,
    offline: 'Données en direct indisponibles — conditions simulées.',
    sim: (c: Conditions) => `Simulé : ${c.hs.toFixed(1)} m · ${Math.round(c.tp)} s · ${c.kind}.`,
    time: 'Temps', heat: 'Total (2 meilleures)', waves: 'Vagues',
    paddle: 'RAMER', hold: 'maintenir',
    hintLineup: 'Clavier : ◀ ▶ se placer · Espace maintenu = ramer · P pause',
    touchLineup: '◀ ▶ pour te placer · maintiens RAMER quand l’anneau est doré',
    touchRide: 'Pose le doigt là où tu veux aller sur la vague · vers le déferlement = freiner',
    hintRide: 'Flèches / ZQSD / souris : vise où aller · vers le déferlement près de la poche = freiner',
    pause: 'Pause', resume: 'Reprendre',
    over: 'Fin de la session',
    best: 'Record',
    none: 'Aucune vague notée. Attends les plus grosses de la série, rame quand l’anneau est doré.',
    reason: { made: 'vague terminée', kickout: 'sortie propre', bogged: 'vague morte', wipeout: 'chute' },
    shape: { clean: 'propre', mushy: 'molle', closeout: 'fermeture' } as Record<Shape, string>,
    hand: { right: 'droite', left: 'gauche' } as Record<Hand, string>,
    ev: {
      setSoon: (n: number, h: number) => `Série au large : ${n} vagues, jusqu’à ${h.toFixed(1)} m`,
      caught: (s: string, h: number) => `Vague prise — ${s}, ${h.toFixed(1)} m`,
      falls: 'Trop tard : la lèvre t’a emporté',
      inside: 'Pris dedans par l’écume',
      horn: 'Fin du temps — la vague en cours compte encore',
    },
    tube: 'tube', carves: 'turns', pocket: 'zone critique',
    label: 'Mini-jeu de surf',
  },
  en: {
    title: 'Session',
    sub: '90 seconds. Read the set, pick your wave, stay in the pocket.',
    steps: [
      ['Read', 'Waves come in sets. The bird’s-eye view shows their shape: a peeling peak, or a wave that closes out all at once.'],
      ['Paddle', 'Position yourself with ◀ ▶, then hold PADDLE when the ring turns gold. Too early, the wave passes under you. Too late, you go over the falls.'],
      ['Ride', 'Seen from the beach: a right-hander peels toward the left of the screen. Aim with the arrows, mouse or finger: drop to gain speed, climb to turn — juggle the bottom and the top. Barrel: on a SECTION, stall toward the curl, hold a mid line, get spat out.'],
    ],
    scoring: 'WSL-style judging: each wave out of 10, your heat total = your 2 best waves.',
    start: 'Start the session',
    replay: 'Play again',
    cond: 'Conditions',
    live: 'Live', classic: 'Classic', big: 'Big day', windy: 'Windy',
    liveNote: (c: Conditions) => `Casablanca right now: ${c.hs.toFixed(1)} m · ${Math.round(c.tp)} s · wind ${Math.round(c.wind)} kn ${c.kind}.`,
    flat: (h: number) => `Flat in Casablanca today (${h.toFixed(1)} m) — simulating a classic day.`,
    offline: 'Live data unavailable — simulated conditions.',
    sim: (c: Conditions) => `Simulated: ${c.hs.toFixed(1)} m · ${Math.round(c.tp)} s · ${c.kind}.`,
    time: 'Time', heat: 'Heat total (best 2)', waves: 'Waves',
    paddle: 'PADDLE', hold: 'hold',
    hintLineup: 'Keys: ◀ ▶ position · hold Space = paddle · P pause',
    touchLineup: '◀ ▶ to position · hold PADDLE when the ring turns gold',
    touchRide: 'Touch where you want to go on the wave · toward the curl = stall',
    hintRide: 'Arrows / WASD / mouse: aim where to go · toward the curl near the pocket = stall',
    pause: 'Pause', resume: 'Resume',
    over: 'Session over',
    best: 'Best',
    none: 'No scored waves. Wait for the bigger ones in the set and paddle when the ring turns gold.',
    reason: { made: 'rode it out', kickout: 'clean kick-out', bogged: 'wave died', wipeout: 'wipeout' },
    shape: { clean: 'clean', mushy: 'mushy', closeout: 'close-out' } as Record<Shape, string>,
    hand: { right: 'right', left: 'left' } as Record<Hand, string>,
    ev: {
      setSoon: (n: number, h: number) => `Set on the horizon: ${n} waves, up to ${h.toFixed(1)} m`,
      caught: (s: string, h: number) => `Wave caught — ${s}, ${h.toFixed(1)} m`,
      falls: 'Too late: over the falls',
      inside: 'Caught inside by the whitewater',
      horn: 'Time’s up — the wave you’re on still counts',
    },
    tube: 'barrel', carves: 'turns', pocket: 'critical',
    label: 'Surf mini-game',
  },
}

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function SurfSession() {
  const { lang } = useLang()
  const L = T[lang]
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const eng = useRef<SurfEngine | null>(null)
  const faceRef = useRef<FaceState>(newFaceState())
  const keys = useRef(new Set<string>())
  const modeRef = useRef<Mode>('intro')
  const langRef = useRef(lang)
  langRef.current = lang

  const [mode, setModeState] = useState<Mode>('intro')
  const setMode = (m: Mode) => { modeRef.current = m; setModeState(m) }
  const [condKey, setCondKey] = useState<CondKey>('live')
  const [live, setLive] = useState<Conditions | null | undefined>(undefined) // undefined = loading
  const [hud, setHud] = useState({ time: 90, total: 0, results: [] as RideResult[], riding: false })
  const [card, setCard] = useState<RideResult | null>(null)
  const [msg, setMsg] = useState('')
  const [best, setBest] = useState(0)
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(matchMedia('(pointer: coarse)').matches), [])

  useEffect(() => { getConditions().then(c => setLive(c)); try { setBest(Number(localStorage.getItem('session-best') || 0)) } catch { /* */ } }, [])

  const liveOk = !!live && live.hs >= 0.5
  const cond: Conditions = condKey === 'live' ? (liveOk ? live! : PRESETS.classic) : PRESETS[condKey]
  const condNote = condKey === 'live'
    ? live === undefined ? '…' : live === null ? L.offline : liveOk ? L.liveNote(live) : L.flat(live.hs)
    : L.sim(cond)

  // (re)build the ocean whenever conditions change while not playing — it is the living backdrop of the intro
  useEffect(() => {
    if (modeRef.current === 'playing' || modeRef.current === 'paused') return
    const e = new SurfEngine(cond)
    e.duration = Infinity
    eng.current = e
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cond.hs, cond.tp, cond.kind, cond.wind])

  const start = useCallback(() => {
    const e = new SurfEngine(cond)
    eng.current = e
    if (import.meta.env.DEV) (window as unknown as { __surf: SurfEngine }).__surf = e // dev-only hook for tests
    setCard(null); setHud({ time: 90, total: 0, results: [], riding: false })
    setMode('playing')
    requestAnimationFrame(() => wrap.current?.focus())
  }, [cond])

  /* ---------------- main loop ---------------- */
  useEffect(() => {
    const canvas = cv.current!, box = wrap.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(devicePixelRatio, 1.5)
    let W = 0, H = 0
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }
    let visible = false, raf = 0, last = performance.now(), hudT = 0, lastRide: SurfEngine['ride'] = null, frameDt = 1 / 60

    const onEvent = (ev: GameEvent) => {
      const l = T[langRef.current]
      if (ev.type === 'setSoon') setMsg(l.ev.setSoon(ev.n, ev.maxH))
      else if (ev.type === 'caught') setMsg(l.ev.caught(l.shape[ev.shape], ev.size))
      else if (ev.type === 'falls') setMsg(l.ev.falls)
      else if (ev.type === 'inside') setMsg(l.ev.inside)
      else if (ev.type === 'horn') setMsg(l.ev.horn)
      else if (ev.type === 'rideEnd') { setCard(ev.result); window.setTimeout(() => setCard(c => (c === ev.result ? null : c)), 3200) }
    }

    function draw() {
      const fx = faceRef.current
      const e = eng.current
      if (!e || !W) return
      ctx.clearRect(0, 0, W, H)
      const v = { W, H, lang: langRef.current }
      const r = e.ride ?? lastRide
      // camera transitions: profile ⇄ face, cross-faded
      let face = 0
      if (e.ride) face = e.ride.ended ? 1 - Math.max(0, (e.ride.endT - 0.5) / 0.6) : Math.min(1, e.ride.t / 0.55)
      if (face < 1) { ctx.globalAlpha = 1 - face; drawProfile(ctx, v, e); if (!e.ride) drawMinimap(ctx, v, e); ctx.globalAlpha = 1 }
      if (!e.ride && fx.camInit) { faceRef.current = newFaceState() } // fresh camera + trail for the next wave
      if (face > 0 && r) {
        ctx.globalAlpha = face
        ctx.save()
        const z = 1.06 - 0.06 * face
        ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2)
        ctx.fillStyle = '#FAF8F4'; ctx.fillRect(0, 0, W, H)
        drawFace(ctx, v, r, e.t, frameDt, fx)
        ctx.restore(); ctx.globalAlpha = 1
      }
    }

    const loop = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000); last = now; frameDt = dt
      const e = eng.current
      const m = modeRef.current
      if (e && m !== 'paused' && !(m === 'intro' && prefersReducedMotion())) {
        e.step(dt)
        if (e.ride) lastRide = e.ride
        if (m === 'playing') {
          for (const ev of e.events) onEvent(ev)
          if (now - hudT > 150) {
            hudT = now
            setHud({ time: Math.max(0, e.duration - e.t), total: e.heatTotal(), results: [...e.results], riding: !!e.ride })
          }
          if (e.over) {
            const total = e.heatTotal()
            setHud({ time: 0, total, results: [...e.results], riding: false })
            try { const b = Number(localStorage.getItem('session-best') || 0); if (total > b) { localStorage.setItem('session-best', total.toFixed(2)); setBest(total) } } catch { /* */ }
            setMode('over')
          }
        }
        e.events.length = 0
      }
      draw()
      if (visible && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const kick = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(loop) } }
    const off = observeVisible(box, v => { visible = v; kick() })
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    const onVis = () => kick()
    document.addEventListener('visibilitychange', onVis)
    resize()
    return () => { cancelAnimationFrame(raf); off(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  /* ---------------- input ---------------- */
  // Line-up: ◀ ▶ position, Space/PADDLE hold to paddle.
  // Riding: arrows (or WASD) = the direction you want to go; mouse / finger = the point you aim at.
  const input = () => eng.current?.input
  const playing = mode === 'playing'
  const DIRS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1], a: [-1, 0], d: [1, 0], w: [0, 1], s: [0, -1], q: [-1, 0], z: [0, 1] }
  const syncKeys = () => {
    const i = input(); if (!i) return
    let x = 0, y = 0
    keys.current.forEach(k => { const d = DIRS[k]; if (d) { x += d[0]; y += d[1] } })
    i.ix = Math.sign(x); i.iy = Math.sign(y)
    i.move = eng.current?.ride ? 0 : Math.sign(x)
    if (x || y) i.aim = null
  }
  const keyName = (e: React.KeyboardEvent) => (e.key.length === 1 ? e.key.toLowerCase() : e.key)
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = input(); if (!i || !playing) { if ((e.key === ' ' || e.key === 'Enter') && mode !== 'playing' && mode !== 'paused' && e.target === wrap.current) { e.preventDefault(); start() } return }
    const k = keyName(e)
    if (k === ' ' || k === 'Enter') { e.preventDefault(); i.paddle = true }
    else if (DIRS[k]) { e.preventDefault(); keys.current.add(k); syncKeys() }
    else if (k === 'p') { e.preventDefault(); setMode('paused') }
  }
  const onKeyUp = (e: React.KeyboardEvent) => {
    const i = input(); if (!i) return
    const k = keyName(e)
    if (k === ' ' || k === 'Enter') i.paddle = false
    else if (DIRS[k]) { keys.current.delete(k); syncKeys() }
  }
  const aimAt = (ev: React.PointerEvent) => {
    const e = eng.current, c = cv.current
    if (!e?.ride || !c) return
    const r = c.getBoundingClientRect()
    e.input.aim = screenToPeel(faceRef.current, ev.clientX - r.left, ev.clientY - r.top)
  }
  const onPointerDown = (ev: React.PointerEvent) => {
    const e = eng.current; if (!e || !playing) return
    ;(ev.target as Element).setPointerCapture?.(ev.pointerId)
    if (e.ride) aimAt(ev); else e.input.paddle = true
  }
  const onPointerMove = (ev: React.PointerEvent) => {
    const e = eng.current; if (!e || !playing || !e.ride) return
    if (ev.pointerType === 'mouse' || ev.buttons) aimAt(ev)
  }
  const onPointerUp = (ev: React.PointerEvent) => {
    const e = eng.current; if (!e) return
    e.input.paddle = false
    if (ev.pointerType !== 'mouse') e.input.aim = null // a finger lifted = no more aim; the mouse keeps aiming
  }
  const onPointerLeave = () => { const e = eng.current; if (e) e.input.aim = null }
  const hold = (key: 'paddle' | 'left' | 'right', on: boolean) => {
    const i = input(); if (!i) return
    if (key === 'paddle') i.paddle = on
    else i.move = on ? (key === 'left' ? -1 : 1) : 0
  }

  const top2 = [...hud.results].sort((a, b) => b.score - a.score).slice(0, 2)
  const condKeys: CondKey[] = ['live', 'classic', 'big', 'windy']

  return (
    <div className="surf">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="mono text-muted max-w-[60ch]">{condNote}</p>
        <div className="flex gap-1.5" role="group" aria-label={L.cond}>
          {condKeys.map(k => (
            <button key={k} type="button" className="filter mono !min-h-[32px] !px-3" aria-pressed={condKey === k} disabled={mode === 'playing' || mode === 'paused'} onClick={() => setCondKey(k)}>{L[k]}</button>
          ))}
        </div>
      </div>

      <div ref={wrap} className={`surf-stage hud ${playing ? 'is-playing' : ''}`} tabIndex={0} role="application" aria-label={L.label} aria-describedby="surf-help"
        onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={() => { const i = input(); keys.current.clear(); if (i) { i.paddle = false; i.move = 0; i.ix = 0; i.iy = 0 } }}>
        <span className="hud-c" />
        <canvas ref={cv} aria-hidden="true" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={onPointerLeave} />

        {/* scoreboard */}
        {(mode === 'playing' || mode === 'paused') && (
          <div className="surf-board mono">
            <div><span className="text-muted">{L.time}</span><b className={hud.time < 10 ? 'text-[#9A4E3A]' : ''}>{fmtTime(hud.time)}</b></div>
            <div><span className="text-muted">{L.heat}</span><b className="text-gold-ink">{hud.total.toFixed(2)}</b></div>
            <div className="hidden sm:block"><span className="text-muted">{L.waves}</span><b>{hud.results.length ? hud.results.map(r => r.score.toFixed(1)).join(' · ') : '—'}</b></div>
            <button type="button" className="surf-pause" onClick={() => setMode(mode === 'paused' ? 'playing' : 'paused')}>{mode === 'paused' ? '▶ ' + L.resume : '❚❚ ' + L.pause}</button>
          </div>
        )}

        {/* ride score card */}
        {card && mode === 'playing' && (
          <div className="surf-card" role="status">
            <p className="serif text-[40px] leading-none">{card.score.toFixed(2)}</p>
            <p className="mono text-gold-ink mt-1">{L.reason[card.reason]} · {L.hand[card.hand]} {L.shape[card.shape]} · {card.size.toFixed(1)} m</p>
            <p className="mono text-muted mt-1">{card.time.toFixed(1)} s · {card.turns} {L.carves}{card.tube > 0.2 ? ` · ${L.tube} ${card.tube.toFixed(1)} s${card.tubeExit ? ' ✦' : ''}` : ''} · {L.pocket} {Math.round((card.critical / Math.max(card.time, 0.1)) * 100)} %</p>
          </div>
        )}

        {/* intro */}
        {mode === 'intro' && (
          <div className="surf-overlay">
            <div className="surf-panel">
              <p className="mono text-gold-ink">{L.title} — 90 s</p>
              <p className="serif text-[clamp(26px,3vw,38px)] leading-tight mt-2">{L.sub}</p>
              <button type="button" className="btn btn-solid mt-5" onClick={start}>{L.start} <span aria-hidden="true">→</span></button>
              <ol className="grid sm:grid-cols-3 gap-4 mt-6">
                {L.steps.map(([h, p], i) => (
                  <li key={h}><p className="mono text-gold-ink">0{i + 1} — {h}</p><p className="text-[14px] text-muted mt-1.5 leading-snug">{p}</p></li>
                ))}
              </ol>
              <p className="text-[13px] text-muted mt-5">{L.scoring}</p>
            </div>
          </div>
        )}

        {mode === 'paused' && (
          <div className="surf-overlay"><button type="button" className="btn btn-solid" onClick={() => { setMode('playing'); wrap.current?.focus() }}>▶ {L.resume}</button></div>
        )}

        {/* end of heat */}
        {mode === 'over' && (
          <div className="surf-overlay">
            <div className="surf-panel text-center">
              <p className="mono text-gold-ink">{L.over}</p>
              <p className="serif text-[clamp(56px,8vw,96px)] leading-none mt-2">{hud.total.toFixed(2)}<span className="text-[0.35em] text-muted"> / 20</span></p>
              {hud.results.length ? (
                <ul className="flex flex-wrap justify-center gap-2 mt-5 mono">
                  {hud.results.map((r, i) => (
                    <li key={i} className={`chip ${top2.includes(r) ? '!border-gold !text-gold-ink' : ''}`}>{r.score.toFixed(2)} · {L.shape[r.shape]} · {L.reason[r.reason]}</li>
                  ))}
                </ul>
              ) : <p className="text-muted mt-4 max-w-[44ch] mx-auto">{L.none}</p>}
              <p className="mono text-muted mt-5">{L.best} : {Math.max(best, hud.total).toFixed(2)}</p>
              <button type="button" className="btn btn-solid mt-6" onClick={start}>{L.replay} <span aria-hidden="true">↻</span></button>
            </div>
          </div>
        )}
      </div>

      {/* controls (touch + mouse); keyboard works on the focused stage */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <p id="surf-help" className="mono text-muted text-[11px]">{touch ? (hud.riding ? L.touchRide : L.touchLineup) : hud.riding ? L.hintRide : L.hintLineup}</p>
        <div className={`flex items-center gap-2 transition-opacity ${playing && !hud.riding ? '' : 'opacity-40 pointer-events-none'}`} aria-hidden={!playing || hud.riding}>
          <button type="button" className="surf-btn" aria-label="◀" onPointerDown={() => hold('left', true)} onPointerUp={() => hold('left', false)} onPointerLeave={() => hold('left', false)}>◀</button>
          <button type="button" className="surf-btn surf-btn-main" onPointerDown={() => hold('paddle', true)} onPointerUp={() => hold('paddle', false)} onPointerLeave={() => hold('paddle', false)}>
            {L.paddle} <span className="opacity-60 text-[10px]">· {L.hold}</span>
          </button>
          <button type="button" className="surf-btn" aria-label="▶" onPointerDown={() => hold('right', true)} onPointerUp={() => hold('right', false)} onPointerLeave={() => hold('right', false)}>▶</button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{msg}</p>
    </div>
  )
}
