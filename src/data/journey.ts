// Parcours — source: CV 2026. Most recent first.
import type { L } from './projects'

export interface Step {
  when: L
  title: L
  org: string
  place: L
  points: { fr: string[]; en: string[] }
  current?: boolean
  link?: string
}

export const experience: Step[] = [
  {
    when: { fr: 'Fév. 2026 — aujourd’hui', en: 'Feb 2026 — present' },
    title: { fr: 'Développeur IA & Full-Stack', en: 'AI & Full-Stack Developer' },
    org: 'Groupe Alliances',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    current: true,
    points: {
      fr: [
        'Agents IA, chatbots et assistants internes basés sur des LLM.',
        'Automatisation de processus métier avec n8n : orchestration, intégration d’APIs tierces.',
        'Applications internes full-stack : interfaces web, back-end, APIs REST.',
        'Data : web scraping, structuration et fiabilisation de grands volumes, puis exploitation par l’IA.',
      ],
      en: [
        'AI agents, chatbots and internal assistants built on LLMs.',
        'Business process automation with n8n: orchestration, third-party API integration.',
        'Full-stack internal apps: web interfaces, back-end, REST APIs.',
        'Data: web scraping, structuring and validating large volumes, then putting them to work with AI.',
      ],
    },
  },
  {
    when: { fr: 'Juin — août 2025', en: 'Jun — Aug 2025' },
    title: { fr: 'Stagiaire développeur', en: 'Developer intern' },
    org: 'Mobiconnect Technologies',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['App mobile MVP connectée à une base cloud.', 'Architecture full-stack NestJS, Supabase, Flutter.', 'APIs REST sécurisées, tests et documentation.'],
      en: ['MVP mobile app backed by a cloud database.', 'Full-stack architecture with NestJS, Supabase, Flutter.', 'Secured REST APIs, tests and documentation.'],
    },
  },
  {
    when: { fr: 'Juin — août 2024', en: 'Jun — Aug 2024' },
    title: { fr: 'Stagiaire développeur', en: 'Developer intern' },
    org: 'Exakis Nelite Maroc',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['Solutions SharePoint sur mesure pour des clients internes.', 'Sites SharePoint modernes et Web Parts en SharePoint Framework (SPFx).'],
      en: ['Custom SharePoint solutions for internal clients.', 'Modern SharePoint sites and Web Parts with SharePoint Framework (SPFx).'],
    },
  },
  {
    when: { fr: 'Juin — août 2023', en: 'Jun — Aug 2023' },
    title: { fr: 'Stagiaire data', en: 'Data intern' },
    org: 'Alliances Maroc',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['Bases de données et systèmes réseau ; extraction d’informations en SQL.', 'Intégration de gros volumes Excel en base.', 'Page web interactive en Python pour visualiser les données.'],
      en: ['Databases and network systems; SQL data extraction.', 'Loading large Excel datasets into databases.', 'Interactive Python web page to visualise the data.'],
    },
  },
]

export const education: Step[] = [
  {
    when: { fr: 'Nov. 2024 — juin 2025', en: 'Nov 2024 — Jun 2025' },
    title: { fr: 'B3 IT — Ingénierie réseaux et systèmes', en: 'B3 IT — Network & Systems Engineering' },
    org: 'Collège de Paris',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: { fr: [], en: [] },
  },
  {
    when: { fr: 'Nov. 2024', en: 'Nov 2024' },
    title: { fr: 'Certification Google Advanced Data Analytics', en: 'Google Advanced Data Analytics Certificate' },
    org: 'Google · Coursera',
    place: { fr: 'En ligne', en: 'Online' },
    points: { fr: [], en: [] },
    link: 'https://www.coursera.org/account/accomplishments/professional-cert/F4ZNGIYM16KW',
  },
  {
    when: { fr: 'Août 2021 — mai 2024', en: 'Aug 2021 — May 2024' },
    title: { fr: 'Computer Science — boursier à 93 %', en: 'Computer Science — 93% scholarship' },
    org: 'University of Richmond',
    place: { fr: 'Virginie, États-Unis', en: 'Virginia, USA' },
    points: { fr: ['Architecture des ordinateurs, systèmes, programmation bas niveau.'], en: ['Computer architecture, systems, low-level programming.'] },
  },
  {
    when: { fr: 'Juillet 2021', en: 'July 2021' },
    title: { fr: 'Baccalauréat français — maths / physique, mention Bien', en: 'French Baccalauréat — maths / physics, with honours' },
    org: 'Lycée Maimonide',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: { fr: ['SAT : 770/800 en maths (top 3 % international).'], en: ['SAT: 770/800 in maths (top 3% internationally).'] },
  },
]
