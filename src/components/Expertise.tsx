import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { pillars, type Pillar } from '../data/expertise'
import { prefersReducedMotion } from '../lib/env'
import { useMagnetic } from '../lib/hooks'
import { Constellation, SectionHead } from './SectionHead'

export function Expertise() {
  const { t, pick } = useLang()
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const n = (i + dir + pillars.length) % pillars.length
    setActive(n); tabs.current[n]?.focus()
  }

  return (
    <section id="expertise" className="sec bg-sand/60" aria-labelledby="expertise-title">
      <div className="gx mb-[10vh]"><Constellation seed={2} /></div>
      <div className="gx">
        <SectionHead n={3} id="expertise" label={t.expertise.index} title={t.expertise.title as [string, string]} intro={t.expertise.intro} />

        <div className="grid grid-cols-12 gap-x-5 gap-y-8">
          <div role="tablist" aria-label={t.expertise.index} aria-orientation="vertical" className="no-scrollbar col-span-12 lg:col-span-4 flex lg:flex-col gap-x-6 overflow-x-auto lg:overflow-visible -mx-[var(--g)] px-[var(--g)] lg:mx-0 lg:px-0">
            {pillars.map((p, i) => (
              <button key={p.id} ref={el => { tabs.current[i] = el }} role="tab" id={`tab-${p.id}`} aria-selected={active === i} aria-controls={`panel-${p.id}`}
                tabIndex={active === i ? 0 : -1} className="tab shrink-0 lg:border-b lg:border-line lg:py-5" onClick={() => setActive(i)} onKeyDown={e => onTabKey(e, i)}>
                <span className="mono text-gold-ink mr-3">{String(i + 1).padStart(2, '0')}</span>
                <span className="serif text-[clamp(20px,2vw,30px)] leading-tight">{pick(p.title)}</span>
                {active === i && <span className="hidden lg:block text-[15px] text-muted mt-2 max-w-[40ch]">{pick(p.summary)}</span>}
              </button>
            ))}
          </div>
          <p className="col-span-12 lg:hidden text-muted -mt-2">{pick(pillars[active].summary)}</p>

          <div className="col-span-12 lg:col-span-8">
            {pillars.map((p, i) => (
              <div key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} hidden={active !== i}>
                {active === i && <Flow pillar={p} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */

function Flow({ pillar }: { pillar: Pillar }) {
  const { t, pick, lang } = useLang()
  const [mobile, setMobile] = useState(false)
  const [lit, setLit] = useState<Set<string>>(new Set())
  const [doneEdges, setDoneEdges] = useState<Set<string>>(new Set())
  const [logs, setLogs] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')
  const [inspect, setInspect] = useState(pillar.nodes[0].id)
  const packet = useRef<HTMLSpanElement>(null)
  const paths = useRef<Record<string, SVGPathElement | null>>({})
  const runId = useRef(0)
  const runBtn = useRef<HTMLButtonElement>(null)
  useMagnetic(runBtn, 0.2)

  useEffect(() => {
    const mq = matchMedia('(max-width: 760px)')
    const on = () => setMobile(mq.matches); on()
    mq.addEventListener('change', on)
    return () => { mq.removeEventListener('change', on); runId.current++ }
  }, [])

  const pos = (id: string) => { const n = pillar.nodes.find(n => n.id === id)!; return mobile ? n.m : n.p }
  const edges = useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of pillar.steps) {
      const key = `${s.from}>${s.to}`
      if (seen.has(key)) continue
      const [x1, y1] = pos(s.from), [x2, y2] = pos(s.to)
      const d = mobile
        ? `M${x1} ${y1} C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`
        : `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`
      seen.set(key, d)
    }
    return [...seen]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillar, mobile])

  const reset = () => { runId.current++; setLit(new Set()); setDoneEdges(new Set()); setLogs([]); setState('idle'); if (packet.current) packet.current.style.opacity = '0' }
  useEffect(reset, [pillar, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  const travel = (key: string, ms: number, id: number) => new Promise<void>(resolve => {
    const path = paths.current[key], dot = packet.current
    if (!path || !dot || prefersReducedMotion()) { resolve(); return }
    const len = path.getTotalLength(), t0 = performance.now()
    dot.style.opacity = '1'
    const frame = (now: number) => {
      if (id !== runId.current) return resolve()
      const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      const p = path.getPointAtLength(e * len)
      dot.style.left = `${p.x}%`; dot.style.top = `${p.y}%`
      if (k < 1) requestAnimationFrame(frame); else { dot.style.opacity = '0'; resolve() }
    }
    requestAnimationFrame(frame)
  })

  const run = async () => {
    reset()
    const id = runId.current
    setState('running')
    const t0 = performance.now()
    const stamp = () => { const s = (performance.now() - t0) / 1000; return `[${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}]` }
    setLit(new Set([pillar.steps[0].from]))
    for (const step of pillar.steps) {
      const key = `${step.from}>${step.to}`
      await travel(key, 650, id)
      if (id !== runId.current) return
      setLit(s => new Set(s).add(step.to))
      setDoneEdges(s => new Set(s).add(key))
      setLogs(l => [...l, `${stamp()} ${pick(step.log)}`])
      setInspect(step.to)
      await sleep(prefersReducedMotion() ? 350 : 220)
      if (id !== runId.current) return
    }
    setState('done')
  }

  const node = pillar.nodes.find(n => n.id === inspect)!
  return (
    <div>
      <div className="flow hud" >
        <span className="hud-c" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map(([key, d]) => (
            <path key={key} ref={el => { paths.current[key] = el }} d={d} className={`edge ${doneEdges.has(key) ? 'done' : ''}`} strokeDasharray={doneEdges.has(key) ? undefined : '3 5'} />
          ))}
        </svg>
        <span ref={packet} className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-gold shadow-[0_0_0_4px_rgba(191,160,106,.25)] opacity-0 pointer-events-none z-10" aria-hidden="true" />
        {pillar.nodes.map(n => {
          const [x, y] = mobile ? n.m : n.p
          return (
            <button key={n.id} type="button" className={`flow-node ${lit.has(n.id) ? 'lit' : ''}`} style={{ left: `${x}%`, top: `${y}%` }}
              aria-pressed={inspect === n.id} onClick={() => setInspect(n.id)}>
              <span className="tag mono text-[10px] text-gold-ink">{n.tag}</span>
              <span className="t">{pick(n.label)}</span>
            </button>
          )
        })}
      </div>

      <div className="grid md:grid-cols-[1fr_minmax(0,280px)] gap-5 mt-8">
        <div className="console p-5 min-h-[168px]" role="log" aria-live="polite" aria-label={t.expertise.console}>
          <div className="flex justify-between mb-3 text-[#8E887C]"><span>{t.expertise.console} — {pick(pillar.title).toLowerCase()}</span><span>{t.expertise.example}</span></div>
          {logs.length === 0 && <p className="text-[#8E887C]">$ {t.expertise.idle}</p>}
          {logs.map((l, i) => <p key={i}><span className="ok">✓</span> {l}</p>)}
          {state === 'running' && <p className="text-gold-soft">▍</p>}
        </div>
        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="mono text-gold-ink">{t.expertise.inspect} — {node.tag}</p>
            <p className="serif text-[26px] leading-tight mt-1">{pick(node.label)}</p>
            <p className="text-muted text-[15px] mt-2">{pick(node.desc)}</p>
          </div>
          <button ref={runBtn} type="button" className="btn btn-solid self-start" onClick={run} disabled={state === 'running'}>
            {state === 'running' ? t.expertise.running : state === 'done' ? t.expertise.replay : t.expertise.run}
            <span aria-hidden="true">{state === 'done' ? '↻' : '▶'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
