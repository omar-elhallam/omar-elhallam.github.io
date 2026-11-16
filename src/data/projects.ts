/**
 * Projects — the only file to touch to add / edit a project.
 *
 * - `image`: import a WebP from src/assets/img (run `npm run images` after dropping a PNG in /assets-src)
 *   or an SVG illustration from src/assets/illustrations.
 * - `link` is optional: leave it out for confidential / school work.
 * - Every text field is bilingual: { fr, en }.
 */
import ocr from '../assets/illustrations/ocr.svg'
import personal from '../assets/illustrations/personal-agent.svg'
import syndic from '../assets/illustrations/syndic.svg'
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
    id: 'medical-records',
    title: { fr: 'Classement de dossiers médicaux manuscrits', en: 'Handwritten medical records, auto-filed' },
    category: 'ai',
    year: '2026',
    status: { fr: 'En production · mission indépendante', en: 'In production · freelance' },
    problem: {
      fr: 'Un médecin et des milliers de fiches de consultation manuscrites : les numériser, reconnaître le patient et les dates, et les ranger automatiquement dans le bon dossier.',
      en: 'A doctor and thousands of handwritten consultation sheets: digitise them, recognise the patient and the dates, and file each one in the right record automatically.',
    },
    highlights: {
      fr: [
        'Pipeline d’ingestion : PDF ou photos, une fiche par page, stockage adressé par empreinte SHA-256, file d’attente.',
        'Extraction par modèle de vision (Claude) sur deux images par fiche, sortie JSON validée par schéma Zod.',
        'Appariement patient robuste : date de naissance + distance de Levenshtein, jamais de fusion d’homonymes.',
        'Vérification humaine sous un seuil de confiance de 0,9 ; sauvegardes chiffrées nocturnes avec restauration testée.',
      ],
      en: [
        'Ingestion pipeline: PDFs or photos, one sheet per page, SHA-256 content-addressed storage, job queue.',
        'Vision-model extraction (Claude) on two images per sheet, JSON output validated with a Zod schema.',
        'Robust patient matching: date of birth + Levenshtein distance, namesakes are never merged.',
        'Human review below a 0.9 confidence threshold; nightly encrypted backups with tested restores.',
      ],
    },
    stack: ['TypeScript', 'React 19', 'Hono', 'SQLite', 'Claude API', 'Zod', 'Fly.io', 'restic'],
    image: { src: ocr, alt: { fr: 'Fiche avec blocs de texte détectés et scores de confiance', en: 'Sheet with detected text blocks and confidence scores' } },
  },
  {
    id: 'consultant-assistant',
    title: { fr: 'Assistant IA pour un consultant senior', en: 'AI assistant for a senior consultant' },
    category: 'ai',
    year: '2026',
    status: { fr: 'En production · projet personnel', en: 'In production · personal project' },
    problem: {
      fr: 'Un agent sur Telegram qui travaille vraiment pour un consultant : il lit ses mails, prépare ses brouillons, produit ses documents et tient sa feuille de temps — sans jamais pouvoir envoyer un e-mail tout seul.',
      en: 'A Telegram agent that actually works for a consultant: it reads his mail, drafts replies, produces his documents and keeps his timesheet — without ever being able to send an email on its own.',
    },
    highlights: {
      fr: [
        'Agent multimodal (texte, vocal, documents, images) avec boucle d’outils plafonnée à 25 itérations et une trentaine d’outils.',
        'Gmail en lecture + brouillons uniquement : aucun outil d’envoi n’existe, chaque brouillon est vérifié par relecture.',
        'Compaction du contexte au-delà de 80 000 tokens par un modèle plus léger, sans casser les paires outil / résultat.',
        'Exfiltration de secrets par injection bloquée ; 754 tests automatisés ; coûts suivis requête par requête.',
      ],
      en: [
        'Multimodal agent (text, voice, documents, images) with a tool loop capped at 25 iterations and about thirty tools.',
        'Gmail read + drafts only: no send tool exists, every draft is verified by reading it back.',
        'Context compaction past 80,000 tokens by a lighter model, without breaking tool call / result pairs.',
        'Prompt-injection secret exfiltration blocked; 754 automated tests; costs tracked per request.',
      ],
    },
    stack: ['Python 3.12', 'Claude API', 'Whisper', 'Gmail API', 'SQLite', 'Hetzner', 'systemd', 'pytest'],
    image: { src: personal, alt: { fr: 'Un agent relié aux e-mails, à l’agenda et aux documents', en: 'An agent linked to mail, calendar and documents' } },
  },
  {
    id: 'syndic',
    title: { fr: 'Plateforme de syndic de copropriété', en: 'Condominium management platform' },
    category: 'web',
    year: '2026',
    status: { fr: 'Pour une résidence', en: 'For a residence' },
    problem: {
      fr: 'Gérer une copropriété de bout en bout — charges, paiements, relances, assemblées, documents — avec un portail pour le gestionnaire et un autre pour chaque copropriétaire.',
      en: 'Run a condominium end to end — charges, payments, reminders, general meetings, documents — with one portal for the manager and another for every owner.',
    },
    highlights: {
      fr: [
        'Appels de charges trimestriels par tantièmes, idempotents, en centimes entiers pour éviter toute dérive d’arrondi.',
        'Paiements en ligne et manuels, recalcul transactionnel des soldes ; PDF générés côté serveur (relances, convocations).',
        'Champs personnalisés configurables par le client (modèle EAV) sur cinq entités métier.',
        'Durcissement sécurité : JWT httpOnly, RBAC revérifié en base, garde multi-tenant, CSP, anti-brute-force.',
      ],
      en: [
        'Quarterly service-charge calls by ownership shares, idempotent, in integer cents so rounding never drifts.',
        'Online and manual payments, transactional balance recalculation; server-side PDFs (reminders, meeting notices).',
        'Custom fields the client configures (EAV model) across five business entities.',
        'Security hardening: httpOnly JWT, RBAC re-checked in the database, multi-tenant guard, CSP, anti-brute-force.',
      ],
    },
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Zod', 'Docker', 'Railway'],
    image: { src: syndic, alt: { fr: 'Une résidence reliée au portail gestionnaire et au portail copropriétaire', en: 'A residence linked to the manager portal and the owner portal' } },
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
    id: 'service-platform',
    title: { fr: 'Service Platform — MVP', en: 'Service Platform — MVP' },
    category: 'web',
    year: '2025',
    status: { fr: 'Mobiconnect Technologies', en: 'Mobiconnect Technologies' },
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
