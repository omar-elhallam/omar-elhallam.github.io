/**
 * Projects — the only file to touch to add / edit a project.
 *
 * - `image`: import a WebP from src/assets/img (run `npm run images` after dropping a PNG in /assets-src)
 *   or an SVG illustration from src/assets/illustrations.
 * - `link` is optional: leave it out for confidential / school work.
 * - Every text field is bilingual: { fr, en }.
 */
import agents from '../assets/illustrations/agents.svg'
import ocr from '../assets/illustrations/ocr.svg'
import personal from '../assets/illustrations/personal-agent.svg'
import dataPlatform from '../assets/illustrations/data-platform.svg'
import crow from '../assets/illustrations/crow.svg'
import service from '../assets/illustrations/service-platform.svg'
import cpu480 from '../assets/img/cpu-480.webp'
import cpu960 from '../assets/img/cpu-960.webp'
import bonkus480 from '../assets/img/Bonkus-480.webp'
import bonkus960 from '../assets/img/Bonkus-960.webp'

export type L = { fr: string; en: string }
export type Category = 'ai' | 'web' | 'systems'

export interface Project {
  id: string
  title: L
  category: Category
  year: string
  status: L
  problem: L
  highlights: { fr: string[]; en: string[] }
  stack: string[]
  image: { src: string; srcSet?: string; alt: L }
  link?: { href: string; label: L }
  /** number of photos in the case study gallery (shown on the card) */
  photos?: number
}

export const projects: Project[] = [
  {
    id: 'agents',
    title: { fr: 'Orchestrateur d’agents autonomes', en: 'Autonomous agent orchestrator' },
    category: 'ai',
    year: '2026',
    status: { fr: 'Projet interne', en: 'Internal project' },
    problem: {
      fr: 'Laisser un LLM agir seul sans qu’il se perde : mémoire, gestion du contexte, sandbox où il exécute son propre code, outils branchés.',
      en: 'Letting an LLM act on its own without losing the plot: memory, context management, a sandbox where it runs its own code, plugged-in tools.',
    },
    highlights: {
      fr: [
        'Mémoire courte et longue durée, pour qu’un agent reprenne une tâche là où il l’a laissée.',
        'Gestion du contexte : ne donner au modèle que ce qui compte, au bon moment.',
        'Sandbox isolée dans laquelle l’agent écrit et exécute du code en sécurité.',
        'Catalogue d’outils (APIs, fichiers, recherche) que l’agent choisit lui-même.',
      ],
      en: [
        'Short and long-term memory, so an agent resumes a task where it left it.',
        'Context management: give the model only what matters, at the right time.',
        'Isolated sandbox where the agent writes and runs code safely.',
        'A tool catalogue (APIs, files, search) the agent picks from by itself.',
      ],
    },
    stack: ['LLM APIs', 'Agents', 'Tool calling', 'Sandbox'], // TODO(omar): add exact languages/frameworks
    image: { src: agents, alt: { fr: 'Schéma : planificateur relié à la mémoire, aux outils, au contexte et à la sandbox', en: 'Diagram: planner linked to memory, tools, context and sandbox' } },
  },
  {
    id: 'cpu',
    title: { fr: 'CPU & assembleur MIPS', en: 'CPU & MIPS assembler' },
    category: 'systems',
    year: '2023',
    status: { fr: 'Université de Richmond', en: 'University of Richmond' },
    problem: {
      fr: 'Construire un ordinateur complet, porte logique par porte logique — et y faire tourner Pong.',
      en: 'Building a full computer, logic gate by logic gate — and running Pong on it.',
    },
    highlights: {
      fr: [
        'Assembleur C++ en deux passes : MIPS → binaire, avec table des symboles.',
        'Processeur : banc de 32 registres, ALU 32 bits (15+ opérations), unité de contrôle en machine à états.',
        'Kernel écrit en MIPS, contrôleurs terminal, écran RGB, clavier, manette et son.',
        'Pong jouable, entièrement en assembleur, sur le matériel conçu.',
      ],
      en: [
        'Two-pass C++ assembler: MIPS → binary, with a symbol table.',
        'CPU: 32-register file, 32-bit ALU (15+ operations), FSM control unit.',
        'Kernel written in MIPS; terminal, RGB display, keyboard, gamepad and sound controllers.',
        'Playable Pong, fully in assembly, running on the designed hardware.',
      ],
    },
    stack: ['Logisim', 'C++', 'MIPS Assembly'],
    photos: 5,
    image: { src: cpu960, srcSet: `${cpu480} 480w, ${cpu960} 960w`, alt: { fr: 'Chemin de données du processeur conçu sur Logisim', en: 'CPU datapath designed in Logisim' } },
  },
  {
    id: 'marathon',
    title: { fr: 'Dev Marathon — plateforme de jeux', en: 'Dev Marathon — game platform' },
    category: 'web',
    year: '2024',
    status: { fr: 'En ligne', en: 'Live' },
    problem: {
      fr: 'Une plateforme de jeux livrée en 7 jours, en solo : React d’un côté, jeux Godot exportés en HTML5 de l’autre.',
      en: 'A game platform shipped in 7 days, solo: React on one side, Godot games exported to HTML5 on the other.',
    },
    highlights: {
      fr: ['Prise en main de Godot et premier jeu jouable en une journée.', 'Intégration des exports HTML5 dans React, chargement et erreurs gérés.', 'Déploiement continu sur Netlify.'],
      en: ['Learned Godot and shipped a first playable game in a day.', 'HTML5 exports embedded in React, with loading and error states.', 'Continuous deployment on Netlify.'],
    },
    stack: ['React', 'JavaScript', 'Godot', 'Netlify'],
    photos: 4,
    image: { src: bonkus960, srcSet: `${bonkus480} 480w, ${bonkus960} 914w`, alt: { fr: 'Capture du jeu « Fight Bonkus Garkus »', en: 'Screenshot of the game “Fight Bonkus Garkus”' } },
    link: { href: 'https://atome-marathon-dev.netlify.app/', label: { fr: 'Voir le site', en: 'Visit the site' } },
  },
  {
    id: 'ocr',
    title: { fr: 'OCR documentaire', en: 'Document OCR' },
    category: 'ai',
    year: '2026',
    status: { fr: 'Projet interne', en: 'Internal project' },
    problem: {
      fr: 'Transformer des documents réels — scannés, tordus, multi-colonnes — en texte et en données fiables.',
      en: 'Turning real-world documents — scanned, skewed, multi-column — into reliable text and data.',
    },
    highlights: {
      fr: ['Détection des blocs de texte et de leur ordre de lecture.', 'Score de confiance par bloc pour savoir quand un humain doit relire.', 'Sortie structurée, prête à être exploitée par une IA.'],
      en: ['Detects text blocks and their reading order.', 'Per-block confidence score, to know when a human should check.', 'Structured output, ready to be used by an AI.'],
    },
    stack: ['OCR', 'Computer vision', 'LLM'], // TODO(omar): confirm stack
    image: { src: ocr, alt: { fr: 'Document avec blocs de texte détectés et scores de confiance', en: 'Document with detected text blocks and confidence scores' } },
  },
  {
    id: 'data-platform',
    title: { fr: 'Plateforme de structuration de données', en: 'AI data-structuring platform' },
    category: 'ai',
    year: '2026',
    status: { fr: 'Projet interne', en: 'Internal project' },
    problem: {
      fr: 'Des données brutes — scrapées, exportées, éparpillées — transformées en bases propres que l’IA peut réellement exploiter.',
      en: 'Raw data — scraped, exported, scattered — turned into clean databases an AI can actually use.',
    },
    highlights: {
      fr: ['Collecte par web scraping.', 'Nettoyage, dédoublonnage et fiabilisation de grands volumes.', 'Structuration assistée par IA vers un schéma clair.'],
      en: ['Collection through web scraping.', 'Cleaning, de-duplication and validation of large volumes.', 'AI-assisted structuring into a clear schema.'],
    },
    stack: ['Web scraping', 'SQL', 'LLM', 'n8n'],
    image: { src: dataPlatform, alt: { fr: 'Schéma : données brutes à gauche, table structurée à droite', en: 'Diagram: raw data on the left, structured table on the right' } },
  },
  {
    id: 'personal-agent',
    title: { fr: 'Agent IA personnel', en: 'Personal AI agent' },
    category: 'ai',
    year: '2026',
    status: { fr: 'Pour des particuliers', en: 'For private clients' },
    problem: {
      fr: 'Un assistant sur mesure pour des particuliers, branché à leurs outils du quotidien, qui exécute au lieu de seulement répondre.',
      en: 'A tailor-made assistant for individuals, wired to their everyday tools, that gets things done instead of just answering.',
    },
    highlights: {
      fr: ['Conçu avec et pour chaque client, selon ses usages.', 'Connecté à des services tiers par API.', 'Garde-fous : l’agent demande avant d’agir sur ce qui compte.'],
      en: ['Designed with and for each client, around their habits.', 'Connected to third-party services through APIs.', 'Guardrails: the agent asks before acting on what matters.'],
    },
    stack: ['LLM APIs', 'n8n', 'APIs tierces'],
    image: { src: personal, alt: { fr: 'Illustration : un agent relié à un agenda, des messages et des tâches', en: 'Illustration: an agent linked to a calendar, messages and tasks' } },
  },
  {
    id: 'service-platform',
    title: { fr: 'Service Platform — MVP', en: 'Service Platform — MVP' },
    category: 'web',
    year: '2025',
    status: { fr: 'Stage — Mobiconnect', en: 'Internship — Mobiconnect' },
    problem: {
      fr: 'Une marketplace mobile qui met en relation clients et prestataires : demandes, offres, réservations, paiements, avis.',
      en: 'A mobile marketplace connecting customers and service providers: requests, offers, bookings, payments, reviews.',
    },
    highlights: {
      fr: ['Schéma relationnel complet (rôles, réservations, paiements, avis bidirectionnels).', 'Back-end NestJS modulaire, APIs REST validées par DTO, testées sous Postman.', 'App Flutter multiplateforme branchée sur Supabase (auth, stockage).'],
      en: ['Full relational schema (roles, bookings, payments, two-way reviews).', 'Modular NestJS back-end, DTO-validated REST APIs, tested with Postman.', 'Cross-platform Flutter app on Supabase (auth, storage).'],
    },
    stack: ['NestJS', 'Supabase', 'PostgreSQL', 'Flutter'],
    image: { src: service, alt: { fr: 'Architecture : app Flutter, API NestJS, base Supabase', en: 'Architecture: Flutter app, NestJS API, Supabase database' } },
  },
  {
    id: 'crow',
    title: { fr: 'Service web en C++ (Crow)', en: 'C++ web service (Crow)' },
    category: 'systems',
    year: '',
    status: { fr: 'Projet d’école', en: 'School project' },
    problem: {
      fr: 'Un service web en C++ pensé comme du logiciel sérieux : architecture objet propre, build reproductible, tests.',
      en: 'A C++ web service built like serious software: clean object design, reproducible build, tests.',
    },
    highlights: {
      fr: ['Usage avancé de la composition, de l’héritage et des templates.', 'Makefile complet.', 'Tests unitaires sur les fonctionnalités critiques et les cas limites.'],
      en: ['Advanced use of composition, inheritance and templates.', 'Complete Makefile.', 'Unit tests covering critical features and edge cases.'],
    },
    stack: ['C++', 'Crow', 'Make', 'Unit tests'],
    image: { src: crow, alt: { fr: 'Schéma de routes HTTP vers des contrôleurs C++', en: 'Diagram of HTTP routes to C++ handlers' } },
  },
]
