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
    org: 'Groupe Alliances (DSI)',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    current: true,
    points: {
      fr: [
        'Solutions d’IA : agents, chatbots et assistants internes basés sur des LLM.',
        'Automatisation de processus métier et de workflows avec n8n : orchestration, déclencheurs, intégration d’APIs tierces.',
        'Applications internes full-stack, de la conception à la mise en production.',
        'Data : web scraping, structuration et fiabilisation de grands volumes, exploitation par l’IA.',
      ],
      en: [
        'AI solutions: agents, chatbots and internal assistants built on LLMs.',
        'Business process and workflow automation with n8n: orchestration, triggers, third-party API integration.',
        'Full-stack internal applications, from design to production.',
        'Data: web scraping, structuring and validating large volumes, put to work with AI.',
      ],
    },
  },
  {
    when: { fr: 'Oct. 2025 — aujourd’hui', en: 'Oct 2025 — present' },
    title: { fr: 'Développeur indépendant', en: 'Freelance developer' },
    org: 'Missions clients',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    current: true,
    points: {
      fr: [
        'Applications sur mesure intégrant des modèles de vision et de langage, conçues, développées et mises en production.',
        'Tout le cycle : cadrage avec le client, développement, déploiement, exploitation et support.',
        'Mission en cours : classement automatique de dossiers médicaux manuscrits pour un médecin.',
      ],
      en: [
        'Custom applications built on vision and language models, designed, developed and shipped to production.',
        'The whole cycle: scoping with the client, development, deployment, operations and support.',
        'Current mission: automatic filing of handwritten medical records for a doctor.',
      ],
    },
  },
  {
    when: { fr: 'Juin — août 2025', en: 'Jun — Aug 2025' },
    title: { fr: 'Développeur full-stack', en: 'Full-stack developer' },
    org: 'Mobiconnect Technologies',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['App mobile MVP connectée à une base de données cloud.', 'Architecture full-stack : NestJS, Supabase et Flutter.', 'APIs REST sécurisées, tests et documentation technique.'],
      en: ['MVP mobile app backed by a cloud database.', 'Full-stack architecture: NestJS, Supabase and Flutter.', 'Secured REST APIs, tests and technical documentation.'],
    },
  },
  {
    when: { fr: 'Juin — août 2024', en: 'Jun — Aug 2024' },
    title: { fr: 'Développeur SharePoint · mission freelance', en: 'SharePoint developer · freelance' },
    org: 'Exakis Nelite Maroc',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['Solutions SharePoint sur mesure pour des clients internes.', 'Sites modernes adaptés aux besoins métiers et Web Parts en SharePoint Framework (SPFx).'],
      en: ['Custom SharePoint solutions for internal clients.', 'Modern sites tailored to business needs and Web Parts with SharePoint Framework (SPFx).'],
    },
  },
  {
    when: { fr: 'Juin — août 2023', en: 'Jun — Aug 2023' },
    title: { fr: 'Développeur & gestion de données · stage', en: 'Developer & data management · internship' },
    org: 'Alliances Maroc',
    place: { fr: 'Casablanca, Maroc', en: 'Casablanca, Morocco' },
    points: {
      fr: ['Bases de données et systèmes réseau ; extraction d’informations en SQL.', 'Intégration de volumes importants de données Excel en base.', 'Page web interactive en Python restituant les données en diagrammes.'],
      en: ['Databases and network systems; SQL data extraction.', 'Loading large Excel datasets into databases.', 'Interactive Python web page presenting the data as charts.'],
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
    points: { fr: ['SAT : 770/800 en maths (top 3 % international).', 'Brevet, Académie de Bordeaux — mention Très bien (2018).'], en: ['SAT: 770/800 in maths (top 3% internationally).', 'Brevet, Bordeaux academy — highest honours (2018).'] },
  },
]
