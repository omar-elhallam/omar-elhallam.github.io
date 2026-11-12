// Static pre-rendering: turns the client build into real HTML for "/" (fr) and "/en/" (en).
// The page is readable before any JavaScript runs — great for slow connections, SEO and LCP.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const SITE = 'https://omar-elhallam.github.io'

const pages = [
  { lang: 'fr', out: 'index.html', url: `${SITE}/`, locale: 'fr_FR', alt: 'en_GB' },
  { lang: 'en', out: 'en/index.html', url: `${SITE}/en/`, locale: 'en_GB', alt: 'fr_FR' },
]

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const p of pages) {
  const { html, meta } = render(p.lang)
  let out = template
    .replace('<!--app-html-->', html)
    .replace('<html lang="fr">', `<html lang="${p.lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(meta.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${p.url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${p.url}`)
    .replace(/(<meta property="og:locale" content=")[^"]*/, `$1${p.locale}`)
    .replace(/(<meta property="og:locale:alternate" content=")[^"]*/, `$1${p.alt}`)
  if (p.lang === 'en') out = out.replace('"jobTitle":"Développeur IA & Full-Stack"', '"jobTitle":"AI & Full-Stack Developer"')
  await mkdir(resolve(dist, p.out, '..'), { recursive: true })
  await writeFile(resolve(dist, p.out), out)
  console.log(`prerendered ${p.out}  (${(out.length / 1024).toFixed(1)} KB)`)
}
await rm(resolve('dist-ssr'), { recursive: true, force: true })
