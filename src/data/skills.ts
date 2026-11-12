// Compétences, grouped. No percentages — just what I actually use.
import type { L } from './projects'

export interface SkillGroup { id: string; label: L; items: string[] }

export const skills: SkillGroup[] = [
  { id: 'ai', label: { fr: 'IA', en: 'AI' }, items: ['Agents IA', 'Chatbots LLM', 'LLM APIs', 'Prompt engineering', 'Tool calling', 'n8n', 'OCR'] },
  { id: 'front', label: { fr: 'Front', en: 'Front' }, items: ['React', 'TypeScript', 'JavaScript', 'Tailwind', 'GSAP', 'Flutter', 'SharePoint SPFx'] },
  { id: 'back', label: { fr: 'Back', en: 'Back' }, items: ['NestJS', 'Node.js', 'Python', 'C++', 'Java', 'REST APIs', 'Supabase', 'Firebase', 'Unix / Linux', 'MIPS Assembly'] },
  { id: 'data', label: { fr: 'Data', en: 'Data' }, items: ['SQL', 'PostgreSQL', 'Web scraping', 'Nettoyage de données', 'Structuration', 'Google Data Analytics'] },
]

export const languages: L[] = [
  { fr: 'Français', en: 'French' },
  { fr: 'Anglais', en: 'English' },
  { fr: 'Arabe', en: 'Arabic' },
]
