import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import type { Lang } from '../i18n/strings'
import { scrollToId, stopScroll } from '../lib/motion'
import { site, SECTIONS } from '../data/site'
import { projects } from '../data/projects'
import { education, experience } from '../data/journey'
import { languages, skills } from '../data/skills'
import { strings } from '../i18n/strings'

/* =====================================================================
 * ⌘K — a small but real shell over a virtual file system built from the
 * portfolio's own data: ls, cd, cat, tree, open, history, tab completion…
 * ===================================================================== */

type File = { type: 'file'; body: () => string[]; open?: () => string | void; size?: number }
type Dir = { type: 'dir'; children: Record<string, Node> }
type Node = File | Dir
type Line = { text: string; cls?: string }

const HOME = '/home/omar'

const T = {
  fr: {
    welcome: ['OEH-OS 2.6 (tty1) — console de bord', 'Tape `help` pour voir les commandes. Tab complète, ↑↓ parcourt l’historique.'],
    notFound: (c: string) => `bash: ${c}: commande introuvable — essaie \`help\``,
    noSuch: (c: string, p: string) => `${c}: ${p}: aucun fichier ou dossier de ce type`,
    isDir: (c: string, p: string) => `${c}: ${p}: est un dossier`,
    notDir: (p: string) => `cd: ${p}: n’est pas un dossier`,
    opening: (p: string) => `ouverture de ${p}…`,
    copied: 'email copié dans le presse-papier ✓',
    sudo: 'omar n’est pas dans le fichier sudoers. Cet incident sera signalé.',
    rm: 'rm: permission refusée — ce portfolio est en lecture seule.',
    vim: 'Essaie plutôt `cat`. (Et personne ne sait quitter vim.)',
    surfLoading: 'interrogation de la bouée… (Open-Meteo)',
    surfFail: 'pas de signal de la bouée, réessaie plus tard.',
    goto: (s: string) => `navigation → ${s}`,
    gotoUsage: `usage: goto <${SECTIONS.join('|')}>`,
    openUsage: 'usage: open <fichier|section>  ex. open cv.pdf, open projects/cpu.md',
    langSet: (l: string) => `langue → ${l}`,
    help: [
      'NAVIGATION',
      '  ls [-a] [-l] [dossier]   lister le contenu',
      '  cd <dossier>             changer de dossier (.., ~, -)',
      '  pwd                      dossier courant',
      '  tree                     arborescence complète',
      '  cat <fichier>            afficher un fichier',
      '  open <fichier|section>   ouvrir (cv.pdf, projects/cpu.md, contact…)',
      '  goto <section>           défiler vers une section du site',
      'INFOS',
      '  whoami · neofetch · git log · date · uname -a · history',
      '  surf                     la houle en direct à Casablanca',
      '  email                    copier mon email',
      '  lang <fr|en>             changer de langue',
      'SHELL',
      '  echo · clear (Ctrl+L) · man <cmd> · exit (Échap)',
    ],
    man: (c: string) => `Pas de page de manuel pour ${c}. Mais \`help\` en sait beaucoup.`,
    chips: ['help', 'ls', 'cd projects', 'cat about.txt', 'open cv.pdf', 'neofetch'],
  },
  en: {
    welcome: ['OEH-OS 2.6 (tty1) — flight console', 'Type `help` to list commands. Tab completes, ↑↓ browses history.'],
    notFound: (c: string) => `bash: ${c}: command not found — try \`help\``,
    noSuch: (c: string, p: string) => `${c}: ${p}: no such file or directory`,
    isDir: (c: string, p: string) => `${c}: ${p}: is a directory`,
    notDir: (p: string) => `cd: ${p}: not a directory`,
    opening: (p: string) => `opening ${p}…`,
    copied: 'email copied to clipboard ✓',
    sudo: 'omar is not in the sudoers file. This incident will be reported.',
    rm: 'rm: permission denied — this portfolio is read-only.',
    vim: 'Try `cat` instead. (Nobody knows how to quit vim anyway.)',
    surfLoading: 'pinging the buoy… (Open-Meteo)',
    surfFail: 'no signal from the buoy, try again later.',
    goto: (s: string) => `navigating → ${s}`,
    gotoUsage: `usage: goto <${SECTIONS.join('|')}>`,
    openUsage: 'usage: open <file|section>  e.g. open cv.pdf, open projects/cpu.md',
    langSet: (l: string) => `language → ${l}`,
    help: [
      'NAVIGATION',
      '  ls [-a] [-l] [dir]       list contents',
      '  cd <dir>                 change directory (.., ~, -)',
      '  pwd                      current directory',
      '  tree                     full tree',
      '  cat <file>               print a file',
      '  open <file|section>      open (cv.pdf, projects/cpu.md, contact…)',
      '  goto <section>           scroll to a site section',
      'INFO',
      '  whoami · neofetch · git log · date · uname -a · history',
      '  surf                     live swell in Casablanca',
      '  email                    copy my email',
      '  lang <fr|en>             switch language',
      'SHELL',
      '  echo · clear (Ctrl+L) · man <cmd> · exit (Esc)',
    ],
    man: (c: string) => `No manual entry for ${c}. But \`help\` knows a lot.`,
    chips: ['help', 'ls', 'cd projects', 'cat about.txt', 'open cv.pdf', 'neofetch'],
  },
}

/** Wrap long text to the console width. */
const wrap = (s: string, w = 72) => {
  const out: string[] = []
  for (const para of s.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      if ((line + ' ' + word).trim().length > w) { out.push(line); line = word } else line = (line ? line + ' ' : '') + word
    }
    out.push(line)
  }
  return out
}

function buildFs(lang: Lang, close: () => void): Dir {
  const s = strings[lang]
  const pick = <V,>(v: { fr: V; en: V }) => v[lang]
  const openCase = (id: string) => () => { close(); setTimeout(() => { location.hash = `projet-${id}` }, 80) }
  const projectFiles: Record<string, Node> = {}
  for (const p of projects) {
    projectFiles[`${p.id}.md`] = {
      type: 'file', open: openCase(p.id),
      body: () => [
        `# ${pick(p.title)}`,
        `${pick(p.status)}${p.year ? ' · ' + p.year : ''}`,
        '',
        ...wrap(pick(p.problem)),
        '',
        ...p.highlights[lang].flatMap(h => wrap('- ' + h).map((l, i) => (i ? '  ' + l : l))),
        '',
        `stack: ${p.stack.join(', ')}`,
        ...(p.link ? [`link:  ${p.link.href}`] : []),
        '',
        lang === 'fr' ? `→ \`open projects/${p.id}.md\` pour l’étude de cas complète` : `→ \`open projects/${p.id}.md\` for the full case study`,
      ],
    }
  }
  const slug = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const stepFiles = (steps: typeof experience) => Object.fromEntries(steps.map(st => [`${slug(st.org)}.txt`, {
    type: 'file' as const,
    body: () => [`${pick(st.title)} — ${st.org}`, `${pick(st.when)} · ${pick(st.place)}`, '', ...st.points[lang].flatMap(p => wrap('- ' + p))],
  }]))
  const goto = (id: string) => () => { close(); setTimeout(() => scrollToId(id), 80) }

  return {
    type: 'dir', children: {
      'about.txt': { type: 'file', open: goto('about'), body: () => [...s.about.body.flatMap(p => [...wrap(p), ''])] },
      'contact.txt': { type: 'file', open: goto('contact'), body: () => [`email     ${site.email}`, `phone     ${site.phone}`, `github    ${site.github}`, `linkedin  ${site.linkedin}`] },
      'cv.pdf': { type: 'file', size: 41_234, open: () => { window.open(site.cv, '_blank', 'noopener') }, body: () => ['%PDF-1.7', lang === 'fr' ? '(binaire — utilise `open cv.pdf`)' : '(binary — use `open cv.pdf`)'] },
      'skills.txt': { type: 'file', open: goto('skills'), body: () => [...skills.flatMap(g => [`[${pick(g.label)}]`, '  ' + g.items.join(' · '), '']), `${s.skills.languages}: ${languages.map(l => pick(l)).join(', ')}`] },
      'passions.txt': { type: 'file', body: () => lang === 'fr' ? ['surf         — Atlantique, dès que la houle le permet', 'musique      — guitare électrique, piano', 'jeux vidéo   — depuis toujours', 'espace       — en sous-texte de ce site'] : ['surf         — the Atlantic, whenever the swell allows', 'music        — electric guitar, piano', 'video games  — forever', 'space        — the subtext of this site'] },
      projects: { type: 'dir', children: projectFiles },
      journey: { type: 'dir', children: { experience: { type: 'dir', children: stepFiles(experience) }, education: { type: 'dir', children: stepFiles(education) } } },
      '.secrets': { type: 'dir', children: { 'konami.txt': { type: 'file', body: () => ['↑ ↑ ↓ ↓ ← → ← → B A', lang === 'fr' ? '(à taper hors de la console — ou tape `warp`)' : '(type it outside the console — or type `warp`)'] } } },
    },
  }
}

export default function Terminal({ open, onClose, onWarp, onCopied }: { open: boolean; onClose: () => void; onWarp: () => void; onCopied: () => void }) {
  const { lang, setLang } = useLang()
  const L = T[lang]
  const dlg = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const outRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<Line[]>(() => T[lang].welcome.map(text => ({ text, cls: 'dim' })))
  const [cwd, setCwd] = useState(HOME)
  const [prevCwd, setPrevCwd] = useState(HOME)
  const [value, setValue] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)

  const close = () => dlg.current?.close()
  const fs = useMemo(() => buildFs(lang, close), [lang])

  useEffect(() => {
    const d = dlg.current!
    if (open && !d.open) { d.showModal(); stopScroll(true); requestAnimationFrame(() => input.current?.focus()) }
    if (!open && d.open) d.close()
  }, [open])
  useEffect(() => { outRef.current?.scrollTo({ top: outRef.current.scrollHeight }) }, [lines])

  /* ---------- paths ---------- */
  const resolve = (p: string) => {
    if (!p || p === '~') return HOME
    if (p === '-') return prevCwd
    const abs = p.startsWith('/') ? p : p.startsWith('~') ? HOME + p.slice(1) : cwd + '/' + p
    const parts: string[] = []
    for (const seg of abs.split('/')) { if (!seg || seg === '.') continue; if (seg === '..') parts.pop(); else parts.push(seg) }
    return '/' + parts.join('/')
  }
  const nodeAt = (abs: string): Node | null => {
    if (abs === '/' || abs === '/home') return { type: 'dir', children: abs === '/' ? { home: { type: 'dir', children: { omar: fs } } } : { omar: fs } }
    if (!abs.startsWith(HOME)) return null
    let n: Node = fs
    for (const seg of abs.slice(HOME.length).split('/').filter(Boolean)) {
      if (n.type !== 'dir' || !n.children[seg]) return null
      n = n.children[seg]
    }
    return n
  }
  const pretty = (abs: string) => (abs.startsWith(HOME) ? '~' + abs.slice(HOME.length) : abs)
  const prompt = `omar@casablanca:${pretty(cwd)}$`

  /* ---------- commands ---------- */
  const run = async (raw: string) => {
    const line = raw.trim()
    const echo: Line = { text: `${prompt} ${raw}`, cls: 'cmd' }
    if (!line) { setLines(l => [...l, echo]); return }
    setHist(h => [...h, line]); setHi(-1)
    const [cmd, ...args] = line.split(/\s+/)
    const flags = args.filter(a => a.startsWith('-') && a !== '-').join('')
    const pos = args.filter(a => !a.startsWith('-') || a === '-')
    const out: Line[] = []
    const say = (text: string, cls?: string) => out.push({ text, cls })
    let after: (() => void) | null = null

    switch (cmd) {
      case 'help': L.help.forEach(h => say(h, /^[A-Z]/.test(h) ? 'gold' : undefined)); break
      case 'clear': setLines([]); return
      case 'pwd': say(cwd); break
      case 'whoami': say(lang === 'fr' ? 'omar — développeur IA & full-stack, Casablanca' : 'omar — AI & full-stack developer, Casablanca'); break
      case 'date': say(new Date().toString()); break
      case 'echo': say(args.join(' ')); break
      case 'uname': say(flags.includes('a') ? 'OEH-OS 2.6.0 casablanca preact-10 wasm32 surf/guitar GNU/Portfolio' : 'OEH-OS'); break
      case 'history': (hist.length ? hist : []).concat(line).forEach((h, i) => say(`${String(i + 1).padStart(4)}  ${h}`)); break
      case 'ls': {
        const target = resolve(pos[0] ?? '.')
        const n = nodeAt(target)
        if (!n) { say(L.noSuch('ls', pos[0]), 'err'); break }
        if (n.type === 'file') { say(pos[0]); break }
        const names = Object.keys(n.children).filter(k => flags.includes('a') || !k.startsWith('.')).sort()
        if (flags.includes('a')) names.unshift('.', '..')
        if (flags.includes('l')) {
          say(`total ${names.length}`)
          for (const k of names) {
            const c = n.children[k]
            const isDir = !c || c.type === 'dir'
            const size = isDir ? 4096 : c.type === 'file' ? c.size ?? c.body().join('\n').length : 0
            say(`${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  omar  ${String(size).padStart(6)}  nov. 12  ${k}${isDir ? '/' : ''}`, isDir ? 'gold' : undefined)
          }
        } else {
          say(names.map(k => (!n.children[k] || n.children[k].type === 'dir' ? k + '/' : k)).join('   '), undefined)
        }
        break
      }
      case 'cd': {
        const target = resolve(pos[0] ?? '~')
        const n = nodeAt(target)
        if (!n) say(L.noSuch('cd', pos[0]), 'err')
        else if (n.type !== 'dir') say(L.notDir(pos[0]), 'err')
        else { setPrevCwd(cwd); setCwd(target) }
        break
      }
      case 'cat': case 'less': case 'more': case 'head': {
        if (!pos.length) { say(`usage: ${cmd} <file>`, 'err'); break }
        for (const p of pos) {
          const n = nodeAt(resolve(p))
          if (!n) say(L.noSuch(cmd, p), 'err')
          else if (n.type === 'dir') say(L.isDir(cmd, p), 'err')
          else n.body().forEach(t => say(t))
        }
        break
      }
      case 'tree': {
        const walk = (d: Dir, prefix: string) => {
          const keys = Object.keys(d.children).filter(k => flags.includes('a') || !k.startsWith('.')).sort()
          keys.forEach((k, i) => {
            const last = i === keys.length - 1, c = d.children[k]
            say(`${prefix}${last ? '└── ' : '├── '}${k}${c.type === 'dir' ? '/' : ''}`, c.type === 'dir' ? 'gold' : undefined)
            if (c.type === 'dir') walk(c, prefix + (last ? '    ' : '│   '))
          })
        }
        const n = nodeAt(resolve(pos[0] ?? '.'))
        if (n?.type === 'dir') { say(pos[0] ?? '.'); walk(n, '') } else say(L.noSuch('tree', pos[0] ?? '.'), 'err')
        break
      }
      case 'open': case 'xdg-open': {
        const p = pos[0]
        if (!p) { say(L.openUsage, 'err'); break }
        if ((SECTIONS as readonly string[]).includes(p)) { say(L.goto(p)); after = () => { close(); setTimeout(() => scrollToId(p), 80) }; break }
        if (/^https?:\/\//.test(p)) { window.open(p, '_blank', 'noopener'); say(L.opening(p)); break }
        const n = nodeAt(resolve(p))
        if (!n) say(L.noSuch('open', p), 'err')
        else if (n.type === 'dir') { setPrevCwd(cwd); setCwd(resolve(p)) }
        else if (n.open) { say(L.opening(p)); const o = n.open; after = () => { o() } }
        else n.body().forEach(t => say(t))
        break
      }
      case 'goto': case 'nav': {
        const p = pos[0]
        if (!p || !(SECTIONS as readonly string[]).includes(p)) { say(L.gotoUsage, 'err'); break }
        say(L.goto(p)); after = () => { close(); setTimeout(() => scrollToId(p), 80) }
        break
      }
      case 'email': case 'mail': navigator.clipboard?.writeText(site.email).then(onCopied); say(L.copied, 'gold'); break
      case 'lang': {
        const l = (pos[0] === 'en' || pos[0] === 'fr') ? pos[0] : lang === 'fr' ? 'en' : 'fr'
        say(L.langSet(l)); after = () => setLang(l)
        break
      }
      case 'git': {
        if (args[0] !== 'log') { say(`git: '${args[0] ?? ''}' — ${lang === 'fr' ? 'seul `git log` est disponible ici' : 'only `git log` is available here'}`, 'err'); break }
        const all = [...experience, ...education]
        all.forEach((st, i) => {
          const hash = (Math.abs([...st.org].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 0xfffffff).toString(16).padStart(7, '0')
          say(`commit ${hash}${i === 0 ? ' (HEAD -> main)' : ''}`, 'gold')
          say(`Date:   ${st.when[lang]}`)
          say(`    ${st.title[lang]} @ ${st.org}`)
          say('')
        })
        break
      }
      case 'neofetch': {
        const art = ['     /\\      ', '    /  \\     ', '   / /\\ \\    ', '  /_/  \\_\\   ', '   ~~~~~~    ', '  ~~~~~~~~   ']
        const info = [
          'omar@casablanca', '---------------',
          `OS: OEH-OS 2.6 (Houle)`, `Role: ${lang === 'fr' ? 'Développeur IA & Full-Stack' : 'AI & Full-Stack Developer'}`,
          'Shell: bash-ish 1.0', `Stack: TS · Python · n8n · React · NestJS`,
          `Uptime: ${new Date().getFullYear() - 2021} ${lang === 'fr' ? 'ans de code' : 'years of code'}`,
          `${lang === 'fr' ? 'Passions' : 'Into'}: surf, guitar, piano, games`,
        ]
        for (let i = 0; i < Math.max(art.length, info.length); i++) say(`${(art[i] ?? '').padEnd(14)}${info[i] ?? ''}`, i < 1 ? 'gold' : undefined)
        break
      }
      case 'surf': {
        setLines(l => [...l, echo, { text: L.surfLoading, cls: 'dim' }])
        try {
          const { lat, lon } = site.spot
          const m = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period,wave_direction`).then(r => r.json())
          const h = m.current.wave_height as number
          const verdict = h < 0.6 ? (lang === 'fr' ? 'flat — journée code.' : 'flat — coding day.') : h < 2.2 ? (lang === 'fr' ? 'ça rentre — à l’eau !' : 'it’s on — paddle out!') : (lang === 'fr' ? 'gros — réservé aux confirmés.' : 'big — experienced surfers only.')
          setLines(l => [...l, { text: `${site.spot.label}: ${h.toFixed(1)} m · ${Math.round(m.current.wave_period)} s · ${Math.round(m.current.wave_direction)}°` , cls: 'gold' }, { text: verdict }])
        } catch { setLines(l => [...l, { text: L.surfFail, cls: 'err' }]) }
        return
      }
      case 'warp': case 'hyperspace': say('▓▒░ ' + (lang === 'fr' ? 'saut en hyperespace' : 'hyperspace jump') + ' ░▒▓', 'gold'); after = () => { close(); setTimeout(onWarp, 150) }; break
      case 'sudo': say(L.sudo, 'err'); break
      case 'rm': case 'mv': case 'touch': case 'mkdir': say(L.rm, 'err'); break
      case 'vim': case 'vi': case 'nano': case 'emacs': say(L.vim); break
      case 'man': say(L.man(args[0] ?? '')); break
      case 'exit': case 'logout': case 'quit': close(); return
      default: say(L.notFound(cmd), 'err')
    }
    setLines(l => [...l, echo, ...out])
    if (after) setTimeout(after, 250)
  }

  /* ---------- completion ---------- */
  const COMMANDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'open', 'goto', 'whoami', 'neofetch', 'git', 'date', 'uname', 'history', 'surf', 'email', 'lang', 'echo', 'clear', 'man', 'exit']
  const complete = () => {
    const parts = value.split(' ')
    const last = parts[parts.length - 1]
    let candidates: string[] = []
    if (parts.length === 1) candidates = COMMANDS.filter(c => c.startsWith(last))
    else if (parts[0] === 'goto') candidates = SECTIONS.filter(s => s.startsWith(last))
    else {
      const slash = last.lastIndexOf('/')
      const dirPart = slash >= 0 ? last.slice(0, slash + 1) : ''
      const base = last.slice(slash + 1)
      const d = nodeAt(resolve(dirPart || '.'))
      if (d?.type === 'dir') candidates = Object.keys(d.children).filter(k => k.startsWith(base) && (base.startsWith('.') || !k.startsWith('.'))).map(k => dirPart + k + (d.children[k].type === 'dir' ? '/' : ''))
    }
    if (candidates.length === 1) { parts[parts.length - 1] = candidates[0]; setValue(parts.join(' ') + (candidates[0].endsWith('/') ? '' : ' ')) }
    else if (candidates.length > 1) setLines(l => [...l, { text: `${prompt} ${value}`, cls: 'cmd' }, { text: candidates.join('   ') }])
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); const v = value; setValue(''); run(v) }
    else if (e.key === 'Tab') { e.preventDefault(); complete() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!hist.length) return; const i = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1); setHi(i); setValue(hist[i]) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < 0) return; const i = hi + 1; if (i >= hist.length) { setHi(-1); setValue('') } else { setHi(i); setValue(hist[i]) } }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]) }
    else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) { e.preventDefault(); setLines(l => [...l, { text: `${prompt} ${value}^C`, cls: 'cmd' }]); setValue('') }
  }

  return (
    <dialog ref={dlg} className="palette term" aria-label="Terminal" onClose={() => { stopScroll(false); onClose() }}
      onClick={e => { if (e.target === dlg.current) close() }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D2C28] font-mono text-[11px] text-[#8E887C]">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold" aria-hidden="true" /> omar@casablanca — bash — {lang.toUpperCase()}</span>
        <button type="button" className="hover:text-ivory px-1" onClick={close} aria-label="exit">esc ✕</button>
      </div>
      <div className="no-scrollbar flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-[#2D2C28]" aria-label="Commandes rapides">
        {[...L.chips, ...SECTIONS.map(s => `goto ${s}`)].map(c => (
          <button key={c} type="button" className="shrink-0 font-mono text-[11.5px] px-2.5 py-1 border border-[#3A3833] rounded-full text-[#CFC8BA] hover:border-gold hover:text-gold-soft" onClick={() => { run(c); input.current?.focus() }}>{c}</button>
        ))}
      </div>
      <div ref={outRef} className="term-out no-scrollbar flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.65]" data-lenis-prevent onClick={() => input.current?.focus()} role="log" aria-live="polite">
        {lines.map((l, i) => <pre key={i} className={`whitespace-pre-wrap break-words ${l.cls === 'cmd' ? 'text-ivory' : l.cls === 'gold' ? 'text-gold-soft' : l.cls === 'err' ? 'text-[#E3A089]' : l.cls === 'dim' ? 'text-[#8E887C]' : 'text-[#CFC8BA]'}`}>{l.text || ' '}</pre>)}
        <div className="flex items-baseline gap-2">
          <label htmlFor="term-in" className="shrink-0 text-gold-soft whitespace-pre">{prompt}</label>
          <input id="term-in" ref={input} value={value} onChange={e => setValue(e.currentTarget.value)} onKeyDown={onKey}
            autoComplete="off" autoCapitalize="off" spellCheck={false} enterKeyHint="send" className="flex-1 min-w-0 !text-[12.5px]" aria-label="Commande" />
        </div>
      </div>
    </dialog>
  )
}
