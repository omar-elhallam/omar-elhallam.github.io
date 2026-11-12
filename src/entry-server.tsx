import { renderToString } from 'react-dom/server'
import App from './App'
import type { Lang } from './i18n/strings'
import { strings } from './i18n/strings'

export function render(lang: Lang) {
  return { html: renderToString(<App lang={lang} />), meta: strings[lang].meta }
}
