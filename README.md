# Omar El Hallam — Portfolio

Portfolio bilingue (FR / EN)

**En ligne :** https://omar-elhallam.github.io/ (FR) · https://omar-elhallam.github.io/en/ (EN)

## Stack

- **Vite + TypeScript + Preact** (`preact/compat` : API React, ~55 Ko gzip de moins que React DOM)
- **Tailwind CSS v4** (tokens dans `src/styles/index.css`)
- **GSAP + ScrollTrigger** pour les animations au scroll, **Lenis** pour le smooth scroll — chargés *après* l'affichage
- Pré-rendu statique des deux langues (`scripts/prerender.mjs`) : la page est lisible avant le moindre JavaScript

## Commandes

```bash
npm install        # dépendances
npm run dev        # serveur de dev → http://localhost:5173
npm run build      # typecheck + build + pré-rendu FR/EN → dist/
npm run preview    # sert dist/ → http://localhost:4173
npm run images     # convertit les PNG/JPG de assets-src/ en WebP (src/assets/img/)
```

## Ajouter un projet

Tout se passe dans **`src/data/projects.ts`** — le layout ne bouge pas.

1. (Image raster) dépose un PNG dans `assets-src/`, lance `npm run images`, importe les WebP générés.
   (Illustration) ou ajoute un SVG dans `src/assets/illustrations/`.
2. Ajoute un objet au tableau `projects` : `title`, `problem`, `highlights`, `stack`, `category` (`ai` | `web` | `systems`), `year`, `status`, `image`, `link` (optionnel). Chaque texte est `{ fr, en }`.

Chaque projet peut avoir une **étude de cas** (vue d’ensemble, chiffres clés, sections, galerie photo, vidéo) dans **`src/data/case-studies.ts`**, chargée seulement quand on ouvre le projet. Lien direct : `/#projet-<id>`. Pour afficher le nombre de photos sur la carte, renseigner `photos` dans `projects.ts`.

Autres contenus : `src/data/journey.ts` (parcours), `src/data/skills.ts`, `src/data/expertise.ts` (workflows IA), `src/data/site.ts` (liens, email, spot du bulletin), `src/i18n/strings.ts` (textes d'interface).

## Déploiement

Push sur `main` → GitHub Actions (`.github/workflows/deploy.yml`) build et publie sur GitHub Pages.
Dans les réglages du repo : **Settings → Pages → Source : GitHub Actions**.

`base` est `'/'` dans `vite.config.ts` car le repo `omar-elhallam.github.io` est un *site utilisateur* servi à la racine.

## Ce qui se cache dedans

- `⌘K` / `Ctrl+K` / `/` : un vrai terminal (`help`, `ls`, `cd`, `cat`, `tree`, `open`, `git log`, `neofetch`, `surf`…) sur un système de fichiers virtuel généré depuis les données du site
- Le curseur est un vaisseau (souris uniquement, désactivé sous `prefers-reduced-motion`)
- **Session** (section À propos) : un jeu de surf de 90 s généré à partir de la **houle réelle** de Casablanca (Open-Meteo). Séries de vagues, levée sur le banc (loi de Green), déferlement à 0,78 × profondeur (McCowan), type de vague selon le nombre d'Iribarren et le vent ; take-off au timing ; ride vue depuis la plage (gauches et droites), caméra qui suit, contrôle à 4 directions avec inertie (carves, snaps, cutbacks, stall), tubes sur les sections qui lancent ; notation façon WSL (2 meilleures vagues sur 20). Moteur : `src/components/surf/engine.ts` (vagues) + `ride.ts` (ride), rendu : `render.ts` (profil) + `face.ts` (ride).
- Le bulletin du hero affiche la vraie houle de Casablanca (Open-Meteo, sans clé, sans cookie)
- ↑ ↑ ↓ ↓ ← → ← → B A

## Performance & accessibilité

Lighthouse mobile (throttling 4G lente) : **Performance 98 · Accessibilité 100 · Best practices 100 · SEO 100**.
`prefers-reduced-motion` respecté partout, navigation clavier complète, contrastes AA, responsive dès 360 px.
