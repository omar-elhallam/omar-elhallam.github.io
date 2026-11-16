// Compétences, grouped like the CV. No percentages — just what I actually use.
import type { L } from './projects'

export interface SkillGroup { id: string; label: L; items: string[] }

export const skills: SkillGroup[] = [
  { id: 'ai', label: { fr: 'IA & LLM', en: 'AI & LLM' }, items: ['Tool-loop agents', 'Multilingual chatbots', 'Claude API', 'OpenAI API', 'Zod', 'Vision', 'Whisper', 'Context compaction', 'Cost tracking', 'n8n'] },
  { id: 'back', label: { fr: 'Back-end', en: 'Back-end' }, items: ['Node.js', 'TypeScript', 'Python', 'NestJS', 'Hono', 'Next.js', 'REST APIs', 'JWT & bcrypt', 'RBAC', 'Rate limiting'] },
  { id: 'front', label: { fr: 'Front-end', en: 'Front-end' }, items: ['React', 'Next.js', 'Vite', 'Tailwind', 'GSAP', 'Mobile-first'] },
  { id: 'data', label: { fr: 'Données', en: 'Data' }, items: ['PostgreSQL', 'SQLite', 'Prisma', 'SQL', 'Web scraping', 'Deduplication', 'SHA-256'] },
  { id: 'infra', label: { fr: 'Infra & DevOps', en: 'Infra & DevOps' }, items: ['Docker', 'Fly.io', 'Railway', 'Hetzner', 'systemd', 'OAuth 2.0', 'restic', 'pytest'] },
]

export const others = ['C++', 'Java', 'MIPS Assembly', 'Flutter', 'Firebase', 'Supabase', 'SharePoint SPFx', 'Godot']

export const languages: L[] = [
  { fr: 'Français', en: 'French' },
  { fr: 'Anglais', en: 'English' },
  { fr: 'Arabe', en: 'Arabic' },
  { fr: 'Darija (langue maternelle)', en: 'Darija (native)' },
]
