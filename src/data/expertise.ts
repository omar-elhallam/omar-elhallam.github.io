// Expertise IA — the four pillars, each shown as a runnable workflow.
// Positions are percentages of the canvas: `p` desktop (wide), `m` mobile (tall).
import type { L } from './projects'

export interface FlowNode { id: string; label: L; tag: string; desc: L; p: [number, number]; m: [number, number] }
export interface FlowStep { from: string; to: string; log: L }
export interface Pillar { id: string; title: L; summary: L; nodes: FlowNode[]; steps: FlowStep[] }

export const pillars: Pillar[] = [
  {
    id: 'agents',
    title: { fr: 'Agents autonomes', en: 'Autonomous agents' },
    summary: {
      fr: 'Des agents qui planifient, se souviennent, utilisent des outils et exécutent leur propre code dans une sandbox — sans perdre le fil.',
      en: 'Agents that plan, remember, use tools and run their own code in a sandbox — without losing the thread.',
    },
    nodes: [
      { id: 'goal', label: { fr: 'Objectif', en: 'Goal' }, tag: 'INPUT', desc: { fr: 'Une demande en langage naturel, parfois floue.', en: 'A natural-language request, sometimes vague.' }, p: [8, 50], m: [50, 7] },
      { id: 'plan', label: { fr: 'Planificateur', en: 'Planner' }, tag: 'LLM', desc: { fr: 'Le LLM découpe l’objectif en étapes et choisit quoi faire ensuite.', en: 'The LLM breaks the goal into steps and decides what to do next.' }, p: [32, 50], m: [50, 30] },
      { id: 'mem', label: { fr: 'Mémoire', en: 'Memory' }, tag: 'STORE', desc: { fr: 'Ce que l’agent a déjà appris ou fait : il ne repart pas de zéro.', en: 'What the agent already learned or did: it never starts from scratch.' }, p: [60, 16], m: [17, 56] },
      { id: 'tools', label: { fr: 'Outils', en: 'Tools' }, tag: 'API', desc: { fr: 'Recherche, fichiers, APIs métier : l’agent choisit l’outil adapté.', en: 'Search, files, business APIs: the agent picks the right tool.' }, p: [60, 50], m: [50, 56] },
      { id: 'box', label: { fr: 'Sandbox', en: 'Sandbox' }, tag: 'CODE', desc: { fr: 'Environnement isolé où l’agent écrit et exécute du code en sécurité.', en: 'Isolated environment where the agent writes and runs code safely.' }, p: [60, 84], m: [83, 56] },
      { id: 'out', label: { fr: 'Résultat', en: 'Result' }, tag: 'OUTPUT', desc: { fr: 'Une réponse vérifiée, avec les étapes qui y ont mené.', en: 'A verified answer, with the steps that led to it.' }, p: [90, 50], m: [50, 90] },
    ],
    steps: [
      { from: 'goal', to: 'plan', log: { fr: 'objectif reçu → « compare ces 3 fournisseurs »', en: 'goal received → “compare these 3 suppliers”' } },
      { from: 'plan', to: 'mem', log: { fr: 'mémoire : 2 échanges précédents rappelés', en: 'memory: 2 previous exchanges recalled' } },
      { from: 'plan', to: 'tools', log: { fr: 'outil : fetch_catalogue(fournisseurs=3)', en: 'tool: fetch_catalogue(suppliers=3)' } },
      { from: 'plan', to: 'box', log: { fr: 'sandbox : python compare.py → ok (0.8 s)', en: 'sandbox: python compare.py → ok (0.8 s)' } },
      { from: 'box', to: 'out', log: { fr: 'résultat : tableau comparatif + recommandation', en: 'result: comparison table + recommendation' } },
    ],
  },
  {
    id: 'assistants',
    title: { fr: 'Chatbots & assistants', en: 'Chatbots & assistants' },
    summary: {
      fr: 'Des assistants internes basés sur des LLM, qui répondent à partir des documents de l’entreprise — et citent leurs sources.',
      en: 'Internal LLM assistants that answer from the company’s own documents — and cite their sources.',
    },
    nodes: [
      { id: 'q', label: { fr: 'Question', en: 'Question' }, tag: 'USER', desc: { fr: 'Un collaborateur pose une question métier.', en: 'An employee asks a business question.' }, p: [8, 50], m: [50, 7] },
      { id: 'rag', label: { fr: 'Recherche docs', en: 'Doc search' }, tag: 'RAG', desc: { fr: 'On retrouve les passages pertinents dans la base documentaire.', en: 'Relevant passages are retrieved from the document base.' }, p: [32, 24], m: [26, 30] },
      { id: 'llm', label: { fr: 'Modèle', en: 'Model' }, tag: 'LLM', desc: { fr: 'Le LLM rédige une réponse à partir de ces passages uniquement.', en: 'The LLM drafts an answer from those passages only.' }, p: [52, 64], m: [74, 50] },
      { id: 'guard', label: { fr: 'Garde-fous', en: 'Guardrails' }, tag: 'CHECK', desc: { fr: 'Vérifications : confidentialité, ton, réponse appuyée par une source.', en: 'Checks: confidentiality, tone, answer backed by a source.' }, p: [72, 30], m: [26, 70] },
      { id: 'a', label: { fr: 'Réponse sourcée', en: 'Sourced answer' }, tag: 'OUTPUT', desc: { fr: 'Une réponse claire, avec les liens vers les documents.', en: 'A clear answer, with links to the documents.' }, p: [91, 58], m: [50, 91] },
    ],
    steps: [
      { from: 'q', to: 'rag', log: { fr: 'question : « procédure de remboursement ? »', en: 'question: “refund procedure?”' } },
      { from: 'rag', to: 'llm', log: { fr: 'rag : 4 passages trouvés (score > 0.82)', en: 'rag: 4 passages found (score > 0.82)' } },
      { from: 'llm', to: 'guard', log: { fr: 'llm : brouillon de réponse généré', en: 'llm: draft answer generated' } },
      { from: 'guard', to: 'a', log: { fr: 'garde-fous : ok — 2 sources citées', en: 'guardrails: ok — 2 sources cited' } },
    ],
  },
  {
    id: 'n8n',
    title: { fr: 'Automatisation n8n', en: 'n8n automation' },
    summary: {
      fr: 'Des workflows métier orchestrés avec n8n : un événement arrive, les APIs se parlent, l’IA trie, l’équipe est prévenue.',
      en: 'Business workflows orchestrated with n8n: an event comes in, APIs talk to each other, AI sorts, the team gets notified.',
    },
    nodes: [
      { id: 'hook', label: { fr: 'Déclencheur', en: 'Trigger' }, tag: 'WEBHOOK', desc: { fr: 'Un email, un formulaire ou un webhook lance le workflow.', en: 'An email, a form or a webhook starts the workflow.' }, p: [8, 50], m: [50, 7] },
      { id: 'parse', label: { fr: 'Extraction', en: 'Extract' }, tag: 'PARSE', desc: { fr: 'On extrait les champs utiles du message.', en: 'Useful fields are pulled out of the message.' }, p: [30, 50], m: [50, 28] },
      { id: 'cls', label: { fr: 'Classification', en: 'Classify' }, tag: 'LLM', desc: { fr: 'Un LLM détermine le type de demande et sa priorité.', en: 'An LLM determines the request type and its priority.' }, p: [54, 20], m: [22, 55] },
      { id: 'crm', label: { fr: 'CRM', en: 'CRM' }, tag: 'API', desc: { fr: 'La fiche client est créée ou mise à jour via API.', en: 'The customer record is created or updated via API.' }, p: [54, 80], m: [78, 55] },
      { id: 'notify', label: { fr: 'Notification', en: 'Notify' }, tag: 'CHAT', desc: { fr: 'La bonne équipe est prévenue, avec le contexte.', en: 'The right team is notified, with context.' }, p: [86, 50], m: [50, 88] },
    ],
    steps: [
      { from: 'hook', to: 'parse', log: { fr: 'webhook : nouvelle demande entrante', en: 'webhook: new incoming request' } },
      { from: 'parse', to: 'cls', log: { fr: 'llm : type = « devis », priorité = haute', en: 'llm: type = “quote”, priority = high' } },
      { from: 'parse', to: 'crm', log: { fr: 'api : PATCH /contacts/2481 → 200', en: 'api: PATCH /contacts/2481 → 200' } },
      { from: 'cls', to: 'notify', log: { fr: 'notification : équipe commerciale prévenue', en: 'notify: sales team pinged' } },
      { from: 'crm', to: 'notify', log: { fr: 'workflow terminé en 2.4 s', en: 'workflow done in 2.4 s' } },
    ],
  },
  {
    id: 'data',
    title: { fr: 'Data engineering', en: 'Data engineering' },
    summary: {
      fr: 'Du web scraping à une base propre : collecter, nettoyer, structurer, puis laisser l’IA exploiter des données fiables.',
      en: 'From web scraping to a clean database: collect, clean, structure, then let AI work on reliable data.',
    },
    nodes: [
      { id: 'scrape', label: { fr: 'Scraping', en: 'Scraping' }, tag: 'WEB', desc: { fr: 'Collecte automatisée depuis des sites et des sources ouvertes.', en: 'Automated collection from websites and open sources.' }, p: [8, 55], m: [50, 7] },
      { id: 'clean', label: { fr: 'Nettoyage', en: 'Cleaning' }, tag: 'ETL', desc: { fr: 'Doublons, formats, valeurs manquantes : on fiabilise.', en: 'Duplicates, formats, missing values: make it reliable.' }, p: [29, 30], m: [26, 28] },
      { id: 'struct', label: { fr: 'Structuration', en: 'Structuring' }, tag: 'LLM', desc: { fr: 'L’IA aide à ranger le texte libre dans un schéma clair.', en: 'AI helps map free text into a clear schema.' }, p: [50, 62], m: [74, 50] },
      { id: 'db', label: { fr: 'Base SQL', en: 'SQL database' }, tag: 'DB', desc: { fr: 'Des tables propres, requêtables, versionnées.', en: 'Clean, queryable, versioned tables.' }, p: [71, 32], m: [26, 70] },
      { id: 'use', label: { fr: 'Exploitation IA', en: 'AI insights' }, tag: 'OUTPUT', desc: { fr: 'Tableaux de bord, recherche, agents : la donnée travaille.', en: 'Dashboards, search, agents: the data goes to work.' }, p: [91, 58], m: [50, 91] },
    ],
    steps: [
      { from: 'scrape', to: 'clean', log: { fr: 'scraping : 12 480 lignes collectées', en: 'scraping: 12,480 rows collected' } },
      { from: 'clean', to: 'struct', log: { fr: 'nettoyage : 1 932 doublons retirés', en: 'cleaning: 1,932 duplicates removed' } },
      { from: 'struct', to: 'db', log: { fr: 'structuration : schéma v3 appliqué', en: 'structuring: schema v3 applied' } },
      { from: 'db', to: 'use', log: { fr: 'prêt : données exploitables par l’IA', en: 'ready: data usable by AI' } },
    ],
  },
]
