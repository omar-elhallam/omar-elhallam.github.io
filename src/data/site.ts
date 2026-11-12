// Personal links and constants — edit here, the layout picks them up.
export const site = {
  name: 'Omar El Hallam',
  url: 'https://omar-elhallam.github.io/',
  email: 'omar.elhallam8@gmail.com',
  phone: '+212 669 809 246',
  phoneHref: 'tel:+212669809246',
  github: 'https://github.com/omar-elhallam',
  linkedin: 'https://www.linkedin.com/in/omar-abdelmoti-el-hallam-73850a347',
  cv: '/cv/CV_Omar_El_Hallam_2026.pdf',
  // Surf bulletin (hero). Coordinates of the spot whose swell is shown live.
  spot: { label: 'Casablanca', lat: 33.6, lon: -7.68 },
} as const

export const SECTIONS = ['about', 'journey', 'expertise', 'work', 'skills', 'contact'] as const
export type SectionId = (typeof SECTIONS)[number]
