/**
 * Case studies — the long version of each project, opened from the project grid.
 * Loaded lazily (only when someone opens a project), so it costs nothing on first load.
 *
 * Add photos: drop a PNG in /assets-src, run `npm run images`, import the WebP below,
 * then add it to a `gallery` block. Videos go in /public/media.
 */
import type { L } from './projects'
import cpu480 from '../assets/img/cpu-480.webp'
import cpu960 from '../assets/img/cpu-960.webp'
import computer480 from '../assets/img/computer-480.webp'
import computer960 from '../assets/img/computer-960.webp'
import alu480 from '../assets/img/alu-480.webp'
import alu960 from '../assets/img/alu-960.webp'
import regfile480 from '../assets/img/regfile-480.webp'
import regfile960 from '../assets/img/regfile-960.webp'
import control480 from '../assets/img/control-480.webp'
import control960 from '../assets/img/control-960.webp'
import bonkus480 from '../assets/img/Bonkus-480.webp'
import bonkus960 from '../assets/img/Bonkus-960.webp'
import gargus from '../assets/img/gargus-480.webp'
import bonkusGames from '../assets/img/bonkus-games.webp'
import agents from '../assets/illustrations/agents.svg'
import ocr from '../assets/illustrations/ocr.svg'
import personal from '../assets/illustrations/personal-agent.svg'
import dataPlatform from '../assets/illustrations/data-platform.svg'
import crow from '../assets/illustrations/crow.svg'
import service from '../assets/illustrations/service-platform.svg'

export interface Media { src: string; srcSet?: string; alt: L; caption: L; w: number; h: number; video?: string }
type Items = { title: L; text: L; tags?: string[] }[]
export type Block =
  | { type: 'text'; title: L; body: L }
  | { type: 'cards'; title: L; intro?: L; items: Items }
  | { type: 'timeline'; title: L; items: { label: L; title: L; text: L }[] }
  | { type: 'challenges'; title: L; items: { title: L; problem: L; solution: L }[] }
  | { type: 'code'; title: L; caption?: L; code: string }
  | { type: 'gallery'; title: L; items: Media[] }
  | { type: 'list'; title: L; items: { fr: string[]; en: string[] } }

export interface CaseStudy {
  overview: L
  role: L
  duration: L
  facts?: { value: string; label: L }[]
  cover: Media
  blocks: Block[]
}

const img = (src: string, srcSet: string | undefined, w: number, h: number, alt: L, caption: L): Media => ({ src, srcSet, w, h, alt, caption })

/* ------------------------------------------------------------------ */
const cpuGallery: Media[] = [
  img(cpu960, `${cpu480} 480w, ${cpu960} 960w`, 1507, 862, { fr: 'Chemin de données complet du processeur', en: 'Complete CPU datapath' }, { fr: 'Le chemin de données : PC, ROM d’instructions, banc de registres, ALU, unité de contrôle.', en: 'The datapath: PC, instruction ROM, register file, ALU, control unit.' }),
  img(computer960, `${computer480} 480w, ${computer960} 960w`, 1198, 925, { fr: 'Bus système reliant le CPU aux contrôleurs', en: 'System bus linking the CPU to the controllers' }, { fr: 'Le bus système : mémoire, terminal, écran RGB, clavier et manette branchés au CPU.', en: 'The system bus: memory, terminal, RGB display, keyboard and joystick wired to the CPU.' }),
  img(alu960, `${alu480} 480w, ${alu960} 960w`, 1147, 912, { fr: 'ALU 32 bits', en: '32-bit ALU' }, { fr: 'ALU 32 bits : arithmétique, logique, décalages, détection de zéro et de dépassement.', en: '32-bit ALU: arithmetic, logic, shifts, zero and overflow detection.' }),
  img(regfile960, `${regfile480} 480w, ${regfile960} 960w`, 1060, 891, { fr: 'Banc de 32 registres', en: '32-register file' }, { fr: 'Banc de 32 registres : deux lectures et une écriture par cycle, $zero câblé à 0.', en: '32-register file: two reads and one write per cycle, $zero hard-wired to 0.' }),
  img(control960, `${control480} 480w, ${control960} 960w`, 850, 851, { fr: 'Unité de contrôle', en: 'Control unit' }, { fr: 'L’unité de contrôle : décode l’opcode et pilote multiplexeurs, écritures et mémoire.', en: 'The control unit: decodes the opcode and drives muxes, writes and memory.' }),
]

const marathonGallery: Media[] = [
  img(bonkus960, `${bonkus480} 480w, ${bonkus960} 914w`, 914, 847, { fr: 'Page d’accueil de la plateforme de jeux', en: 'Game platform home page' }, { fr: 'L’accueil : un carrousel de jeux, chacun jouable dans le navigateur.', en: 'The home page: a carousel of games, each playable in the browser.' }),
  { ...img(bonkusGames, undefined, 400, 225, { fr: 'Animation : navigation entre les jeux', en: 'Animation: browsing between games' }, { fr: 'Navigation entre les jeux de la plateforme.', en: 'Browsing between the platform’s games.' }) },
  img(gargus, undefined, 269, 150, { fr: 'Capture du combat contre Bonkus Garkus', en: 'Fight against Bonkus Garkus' }, { fr: '« Fight Bonkus Garkus », le jeu Godot écrit pendant le marathon.', en: '“Fight Bonkus Garkus”, the Godot game written during the marathon.' }),
  { ...img(bonkus960, undefined, 914, 847, { fr: 'Vidéo de démonstration', en: 'Demo video' }, { fr: 'Vidéo : parcours complet du site (1,3 Mo, chargée seulement si tu lances la lecture).', en: 'Video: a full walk-through (1.3 MB, only loaded when you press play).' }), video: '/media/bonkus-navigation.mp4' },
]

/* ------------------------------------------------------------------ */
export const caseStudies: Record<string, CaseStudy> = {
  cpu: {
    overview: {
      fr: 'Un voyage complet à travers l’architecture d’un ordinateur : des portes logiques jusqu’à la programmation en assembleur. En un semestre, j’ai conçu un processeur fonctionnel dans Logisim, écrit l’assembleur en C++ qui le programme, puis un kernel et des jeux qui tournent dessus.',
      en: 'A full journey through computer architecture: from logic gates all the way up to assembly programming. In one semester I designed a working CPU in Logisim, wrote the C++ assembler that programs it, then a kernel and games that run on it.',
    },
    role: { fr: 'Conception & développement, seul', en: 'Design & development, solo' },
    duration: { fr: 'Un semestre — automne 2023, CS 301', en: 'One semester — Fall 2023, CS 301' },
    facts: [
      { value: '25+', label: { fr: 'instructions MIPS', en: 'MIPS instructions' } },
      { value: '32', label: { fr: 'registres 32 bits', en: '32-bit registers' } },
      { value: '15+', label: { fr: 'opérations de l’ALU', en: 'ALU operations' } },
      { value: '6', label: { fr: 'composants majeurs', en: 'major components' } },
    ],
    cover: cpuGallery[0],
    blocks: [
      {
        type: 'cards', title: { fr: 'Architecture du CPU', en: 'CPU architecture' },
        intro: { fr: 'Une architecture RISC multi-cycle : chaque instruction passe par cinq étapes — fetch, decode, execute, mémoire, write-back.', en: 'A multi-cycle RISC architecture: every instruction goes through five stages — fetch, decode, execute, memory, write-back.' },
        items: [
          { title: { fr: 'Banc de registres', en: 'Register file' }, text: { fr: '32 registres de 32 bits, deux ports de lecture et un d’écriture synchronisés sur l’horloge. $zero est câblé à 0, comme le veut la convention MIPS. Construit avec des bascules D et des multiplexeurs.', en: '32 × 32-bit registers, two read ports and one clock-synchronised write port. $zero is hard-wired to 0, per MIPS convention. Built from D flip-flops and multiplexers.' }, tags: ['32 bits', '2R / 1W'] },
          { title: { fr: 'ALU', en: 'ALU' }, text: { fr: 'ALU 32 bits en complément à deux : toutes les opérations arithmétiques et logiques MIPS, multiplication et division avec la paire de registres HI/LO, détection de zéro et de dépassement.', en: '32-bit two’s-complement ALU: every MIPS arithmetic and logic operation, multiplication and division with the HI/LO register pair, zero and overflow detection.' }, tags: ['15+ ops', 'HI/LO'] },
          { title: { fr: 'Unité de contrôle', en: 'Control unit' }, text: { fr: 'Une machine à états qui décode l’instruction et génère les signaux de contrôle : multiplexeurs, activations des registres, mémoire — conçue à partir de tables de vérité.', en: 'A finite-state machine that decodes the instruction and generates control signals: multiplexers, register enables, memory — designed from truth tables.' }, tags: ['FSM', '25+ opcodes'] },
          { title: { fr: 'Mémoire', en: 'Memory' }, text: { fr: 'Mémoires d’instructions et de données séparées : ROM de 4 Ko pour le programme, RAM adressable à l’octet pour les données, bus de données 32 bits.', en: 'Separate instruction and data memories: 4 KB ROM for the program, byte-addressable RAM for data, 32-bit data bus.' }, tags: ['4 KB', '32-bit bus'] },
        ],
      },
      { type: 'gallery', title: { fr: 'Galerie', en: 'Gallery' }, items: cpuGallery },
      {
        type: 'cards', title: { fr: 'L’assembleur C++', en: 'The C++ assembler' },
        intro: { fr: 'Un programme en deux passes qui traduit l’assembleur MIPS en code machine binaire, directement importable dans la ROM et la RAM de Logisim.', en: 'A two-pass program that translates MIPS assembly into binary machine code, ready to load into Logisim’s ROM and RAM.' },
        items: [
          { title: { fr: 'Deux passes', en: 'Two passes' }, text: { fr: 'Première passe : table des symboles (labels → adresses). Seconde passe : encodage de chaque instruction en résolvant les labels.', en: 'First pass: a symbol table (labels → addresses). Second pass: encode every instruction, resolving the labels.' } },
          { title: { fr: 'Encodage', en: 'Encoding' }, text: { fr: 'Types R (add, sub, slt, mult, div, décalages), I (addi, beq, bne, lw, sw, la) et J (j, jal), chacun sur 32 bits.', en: 'R-type (add, sub, slt, mult, div, shifts), I-type (addi, beq, bne, lw, sw, la) and J-type (j, jal), each on 32 bits.' } },
          { title: { fr: 'Mémoire statique', en: 'Static memory' }, text: { fr: 'Gestion de la section .data (.word, références de labels, .asciiz) et image binaire séparée de la mémoire statique.', en: 'Handles the .data section (.word, label references, .asciiz) and emits a separate static-memory binary image.' } },
          { title: { fr: 'Double sortie', en: 'Dual output' }, text: { fr: 'Deux fichiers binaires — instructions et données — chargés tels quels dans la ROM et la RAM pour tester immédiatement le CPU.', en: 'Two binary files — instructions and data — loaded as-is into ROM and RAM to test the CPU straight away.' } },
        ],
      },
      {
        type: 'code', title: { fr: 'Exemple d’utilisation', en: 'Usage example' },
        code: `# assemble one or more files
./assemble program.asm static_memory.bin instructions.bin

.data
array: .word 10 20 30

.text
main:
    la   $t0, array      # load array address
    lw   $t1, 0($t0)     # load first element
    addi $t1, $t1, 5     # add 5
    sw   $t1, 0($t0)     # store it back`,
      },
      {
        type: 'timeline', title: { fr: 'Étapes du projet', en: 'How it was built' },
        items: [
          { label: { fr: '01', en: '01' }, title: { fr: 'L’assembleur', en: 'The assembler' }, text: { fr: 'Traduction MIPS → binaire en C++, résolution des labels, sorties séparées pour instructions et données.', en: 'MIPS → binary in C++, label resolution, separate outputs for instructions and data.' } },
          { label: { fr: '02', en: '02' }, title: { fr: 'Le circuit du CPU', en: 'The CPU circuit' }, text: { fr: 'ALU, banc de registres, unité de contrôle et mémoires, chacun testé seul avant l’intégration.', en: 'ALU, register file, control unit and memories, each tested alone before integration.' } },
          { label: { fr: '03', en: '03' }, title: { fr: 'Bus & contrôleurs', en: 'Bus & controllers' }, text: { fr: 'Bus système et entrées/sorties mappées en mémoire : clavier, écran RGB, terminal, manette, son.', en: 'System bus and memory-mapped I/O: keyboard, RGB display, terminal, joystick, sound.' } },
          { label: { fr: '04', en: '04' }, title: { fr: 'Le kernel', en: 'The kernel' }, text: { fr: 'Un kernel écrit entièrement en MIPS : interruptions, pilotes de périphériques, appels système.', en: 'A kernel written entirely in MIPS: interrupts, device drivers, system calls.' } },
          { label: { fr: '05', en: '05' }, title: { fr: 'Des jeux', en: 'Games' }, text: { fr: 'Un Pong jouable en assembleur : manette, collisions, score et affichage, sur le matériel conçu.', en: 'A playable Pong in assembly: joystick, collisions, score and rendering, on the designed hardware.' } },
        ],
      },
      {
        type: 'challenges', title: { fr: 'Difficultés rencontrées', en: 'Challenges' },
        items: [
          { title: { fr: 'Synchronisation', en: 'Timing' }, problem: { fr: 'Tous les composants doivent tenir dans un cycle d’horloge sans conditions de course.', en: 'Every component has to fit in one clock cycle without race conditions.' }, solution: { fr: 'Analyse des délais de propagation et registres placés aux bons endroits.', en: 'Propagation-delay analysis and registers placed at the right spots.' } },
          { title: { fr: 'Déboguer des milliers de portes', en: 'Debugging thousands of gates' }, problem: { fr: 'Une erreur peut se cacher n’importe où dans le circuit.', en: 'A bug can hide anywhere in the circuit.' }, solution: { fr: 'Bancs de test dédiés et programmes de test du plus simple au plus complexe.', en: 'Dedicated test benches and test programs from simplest to most complex.' } },
          { title: { fr: 'Références en avant', en: 'Forward references' }, problem: { fr: 'Un saut peut viser un label défini plus loin dans le fichier.', en: 'A jump can target a label defined later in the file.' }, solution: { fr: 'Deux passes : on construit la table des symboles avant d’encoder.', en: 'Two passes: build the symbol table before encoding.' } },
        ],
      },
      {
        type: 'list', title: { fr: 'Ce que j’en retiens', en: 'What I took from it' },
        items: {
          fr: ['Comment un programme de haut niveau devient des instructions, puis des signaux électriques.', 'La conception de circuits combinatoires et séquentiels, et l’analyse temporelle.', 'L’organisation d’un CPU : jeu d’instructions, hiérarchie mémoire, contrôle du chemin de données.', 'La programmation système : fichiers binaires, parsing, outils de développement écrits de zéro.'],
          en: ['How high-level code becomes instructions, then electrical signals.', 'Combinational and sequential circuit design, and timing analysis.', 'CPU organisation: instruction set, memory hierarchy, datapath control.', 'Systems programming: binary files, parsing, developer tools written from scratch.'],
        },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  marathon: {
    overview: {
      fr: 'Un défi d’une semaine : construire et mettre en ligne, seul, une plateforme de jeux complète — un site React d’un côté, des jeux faits avec Godot de l’autre, réunis dans le navigateur.',
      en: 'A one-week challenge: build and ship, solo, a complete game platform — a React site on one side, Godot games on the other, together in the browser.',
    },
    role: { fr: 'Développeur unique', en: 'Sole developer' },
    duration: { fr: '7 jours — novembre 2024', en: '7 days — November 2024' },
    facts: [
      { value: '7', label: { fr: 'jours, du concept à la prod', en: 'days, concept to production' } },
      { value: '3', label: { fr: 'jeux jouables', en: 'playable games' } },
      { value: '1', label: { fr: 'développeur', en: 'developer' } },
    ],
    cover: marathonGallery[0],
    blocks: [
      {
        type: 'cards', title: { fr: 'Le défi', en: 'The challenge' },
        items: [
          { title: { fr: 'Temps', en: 'Time' }, text: { fr: 'Conception, développement, tests et déploiement en sept jours.', en: 'Design, development, testing and deployment in seven days.' } },
          { title: { fr: 'Plusieurs technos', en: 'Several technologies' }, text: { fr: 'React pour le site, Godot pour les jeux, Netlify pour la mise en ligne.', en: 'React for the site, Godot for the games, Netlify for hosting.' } },
          { title: { fr: 'Jeu ↔ web', en: 'Game ↔ web' }, text: { fr: 'Intégrer des exports HTML5 de Godot dans React sans sacrifier la fluidité.', en: 'Embedding Godot HTML5 exports in React without hurting smoothness.' } },
          { title: { fr: 'Finition', en: 'Polish' }, text: { fr: 'Malgré le délai, une expérience propre : navigation claire, animations, sons.', en: 'Despite the deadline, a clean experience: clear navigation, animations, sound.' } },
        ],
      },
      { type: 'gallery', title: { fr: 'Galerie', en: 'Gallery' }, items: marathonGallery },
      {
        type: 'timeline', title: { fr: 'Les 7 jours', en: 'The 7 days' },
        items: [
          { label: { fr: 'J1', en: 'D1' }, title: { fr: 'Plan & architecture', en: 'Plan & architecture' }, text: { fr: 'Périmètre, maquettes, stack. Choix de Godot plutôt qu’Unity pour ses exports HTML5.', en: 'Scope, wireframes, stack. Picked Godot over Unity for its HTML5 exports.' } },
          { label: { fr: 'J2', en: 'D2' }, title: { fr: 'Le site React', en: 'The React site' }, text: { fr: 'Structure, composants réutilisables (navigation, cartes de jeux), responsive en Grid et Flexbox.', en: 'Structure, reusable components (navigation, game cards), responsive with Grid and Flexbox.' } },
          { label: { fr: 'J3', en: 'D3' }, title: { fr: 'Godot & premier jeu', en: 'Godot & first game' }, text: { fr: 'Apprentissage intensif de Godot et GDScript, premier jeu jouable : logique, collisions, physique.', en: 'Crash course in Godot and GDScript, first playable game: logic, collisions, physics.' } },
          { label: { fr: 'J4', en: 'D4' }, title: { fr: 'Export & intégration', en: 'Export & integration' }, text: { fr: 'Exports HTML5 optimisés, intégration dans React, écrans de chargement et gestion d’erreurs.', en: 'Optimised HTML5 exports, React integration, loading screens and error handling.' } },
          { label: { fr: 'J5', en: 'D5' }, title: { fr: 'Polish & open source', en: 'Polish & open source' }, text: { fr: 'Mécaniques et visuels affinés, deux jeux open source sélectionnés et intégrés.', en: 'Refined mechanics and visuals, two open-source games picked and integrated.' } },
          { label: { fr: 'J6', en: 'D6' }, title: { fr: 'Optimisation', en: 'Optimisation' }, text: { fr: 'Chargement différé, compression des assets, tests multi-navigateurs, mobile, son.', en: 'Lazy loading, asset compression, cross-browser and mobile testing, sound.' } },
          { label: { fr: 'J7', en: 'D7' }, title: { fr: 'Mise en ligne', en: 'Launch' }, text: { fr: 'Déploiement continu sur Netlify, tests en production, documentation.', en: 'Continuous deployment on Netlify, production testing, documentation.' } },
        ],
      },
      {
        type: 'challenges', title: { fr: 'Difficultés rencontrées', en: 'Challenges' },
        items: [
          { title: { fr: 'Code généré par IA', en: 'AI-generated code' }, problem: { fr: 'La logique de jeu générée par IA était difficile à déboguer et pleine d’erreurs subtiles.', en: 'AI-generated game logic was hard to debug and full of subtle errors.' }, solution: { fr: 'Réécriture à la main : plus lent au départ, mais un code compris, propre et stable.', en: 'Rewrote it by hand: slower at first, but understood, clean and stable code.' } },
          { title: { fr: 'Godot ↔ React', en: 'Godot ↔ React' }, problem: { fr: 'Faire communiquer le jeu et le site (score, état, navigation).', en: 'Making the game and the site talk (score, state, navigation).' }, solution: { fr: 'Pont JavaScript côté Godot et écouteurs d’événements côté React.', en: 'A JavaScript bridge on the Godot side and event listeners on the React side.' } },
          { title: { fr: 'Mobile', en: 'Mobile' }, problem: { fr: 'Des contrôles pensés clavier/souris et un canvas mal dimensionné sur petit écran.', en: 'Keyboard/mouse controls and a badly sized canvas on small screens.' }, solution: { fr: 'Contrôles tactiles et redimensionnement dynamique du canvas.', en: 'Touch controls and dynamic canvas resizing.' } },
          { title: { fr: 'Poids des exports', en: 'Export size' }, problem: { fr: 'Des exports Godot de plus de 10 Mo, trop lents à charger.', en: 'Godot exports over 10 MB, too slow to load.' }, solution: { fr: 'Modules inutiles retirés, assets compressés, écrans de progression.', en: 'Removed unused modules, compressed assets, progress screens.' } },
        ],
      },
      {
        type: 'list', title: { fr: 'Ce que j’en retiens', en: 'What I took from it' },
        items: {
          fr: ['Prioriser en mode MVP et décider vite sans sacrifier la qualité.', 'Les bases du jeu vidéo : boucle de jeu, collisions, physique, exports HTML5.', 'Assembler des technologies différentes en une seule application cohérente.', 'Quand l’IA aide, et quand il vaut mieux écrire le code soi-même.'],
          en: ['Prioritising MVP-style and deciding fast without sacrificing quality.', 'Game-dev fundamentals: game loop, collisions, physics, HTML5 exports.', 'Combining different technologies into one coherent application.', 'When AI helps — and when it’s better to write the code yourself.'],
        },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  'service-platform': {
    overview: {
      fr: 'Pendant mon stage chez Mobiconnect Technologies, j’ai conçu seul, de zéro, une marketplace mobile qui met en relation clients et prestataires de services : demandes, offres, réservations, paiements et avis.',
      en: 'During my internship at Mobiconnect Technologies, I designed solo, from scratch, a mobile marketplace connecting customers with service providers: requests, offers, bookings, payments and reviews.',
    },
    role: { fr: 'Full-stack, seul', en: 'Full-stack, solo' },
    duration: { fr: 'Été 2025 — stage de 3 mois', en: 'Summer 2025 — 3-month internship' },
    facts: [
      { value: '8', label: { fr: 'modules NestJS', en: 'NestJS modules' } },
      { value: '3', label: { fr: 'rôles utilisateurs', en: 'user roles' } },
      { value: '4', label: { fr: 'phases', en: 'phases' } },
    ],
    cover: img(service, undefined, 800, 600, { fr: 'Architecture : app Flutter, API NestJS, base Supabase', en: 'Architecture: Flutter app, NestJS API, Supabase database' }, { fr: 'Flutter → API REST NestJS → PostgreSQL sur Supabase.', en: 'Flutter → NestJS REST API → PostgreSQL on Supabase.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Une stack sobre et évolutive', en: 'A lean, scalable stack' },
        intro: { fr: 'Les contraintes d’un stage — coût, délai, une seule personne — sans fermer la porte à la suite.', en: 'Internship constraints — cost, time, one person — without closing the door on what comes next.' },
        items: [
          { title: { fr: 'Mobile — Flutter', en: 'Mobile — Flutter' }, text: { fr: 'Multiplateforme, rendu natif, hot reload ; extensible au web plus tard.', en: 'Cross-platform, native rendering, hot reload; can extend to the web later.' } },
          { title: { fr: 'API — NestJS', en: 'API — NestJS' }, text: { fr: 'TypeScript, structure modulaire, facile à maintenir et à faire grandir.', en: 'TypeScript, modular structure, easy to maintain and grow.' } },
          { title: { fr: 'Données — PostgreSQL / Supabase', en: 'Data — PostgreSQL / Supabase' }, text: { fr: 'Relationnel, fiable, avec authentification et stockage de fichiers intégrés.', en: 'Relational, reliable, with built-in authentication and file storage.' } },
          { title: { fr: 'Paiement — CMI', en: 'Payment — CMI' }, text: { fr: 'La passerelle standard au Maroc, acceptée par la majorité des commerçants.', en: 'The standard gateway in Morocco, accepted by most merchants.' } },
        ],
      },
      {
        type: 'timeline', title: { fr: 'Les 4 phases', en: 'The 4 phases' },
        items: [
          { label: { fr: '01', en: '01' }, title: { fr: 'Analyse', en: 'Analysis' }, text: { fr: 'Besoins fonctionnels (comptes multi-rôles, services, réservations) et techniques (fiabilité, sécurité, réactivité), choix de la stack, architecture.', en: 'Functional needs (multi-role accounts, services, bookings) and technical ones (reliability, security, responsiveness), stack choice, architecture.' } },
          { label: { fr: '02', en: '02' }, title: { fr: 'Base de données', en: 'Database' }, text: { fr: 'Schéma relationnel en DBML (dbdiagram.io), implémenté dans PostgreSQL et validé sous DBeaver.', en: 'Relational schema in DBML (dbdiagram.io), implemented in PostgreSQL and validated with DBeaver.' } },
          { label: { fr: '03', en: '03' }, title: { fr: 'Back-end', en: 'Back-end' }, text: { fr: 'Un module NestJS par entité, CRUD complet, validation par DTO, routes protégées, tests Postman.', en: 'One NestJS module per entity, full CRUD, DTO validation, protected routes, Postman tests.' } },
          { label: { fr: '04', en: '04' }, title: { fr: 'App mobile', en: 'Mobile app' }, text: { fr: 'Authentification, catalogue de services, création de demandes, offres et réservations.', en: 'Authentication, service catalogue, request creation, offers and bookings.' } },
        ],
      },
      {
        type: 'cards', title: { fr: 'Le modèle de données', en: 'The data model' },
        items: [
          { title: { fr: 'Utilisateurs & rôles', en: 'Users & roles' }, text: { fr: 'Client, prestataire, admin — mots de passe délégués à Supabase Auth.', en: 'Customer, provider, admin — passwords delegated to Supabase Auth.' } },
          { title: { fr: 'Demandes', en: 'Requests' }, text: { fr: 'Urgence, rayon maximal, description et pièces jointes.', en: 'Urgency, maximum radius, description and attachments.' } },
          { title: { fr: 'Réservations', en: 'Bookings' }, text: { fr: 'Statuts suivis : planifiée, en cours, livrée, terminée, annulée.', en: 'Tracked statuses: scheduled, in progress, delivered, completed, cancelled.' } },
          { title: { fr: 'Avis', en: 'Reviews' }, text: { fr: 'Bidirectionnels : ponctualité, communication, qualité, prix.', en: 'Two-way: punctuality, communication, quality, price.' } },
        ],
      },
      {
        type: 'code', title: { fr: 'Modules du back-end', en: 'Back-end modules' },
        code: `src/
├── users/              # roles: CUSTOMER · PROVIDER · ADMIN
├── service-providers/  # profiles, verification
├── services/           # catalogue
├── service-requests/   # urgency, radius, attachments
├── offers/
├── bookings/           # SCHEDULED → IN_PROGRESS → DELIVERED → COMPLETED
├── payments/           # card · CMI · cash · wallet
└── reviews/`,
      },
      {
        type: 'challenges', title: { fr: 'Difficultés rencontrées', en: 'Challenges' },
        items: [
          { title: { fr: 'Authentification', en: 'Authentication' }, problem: { fr: 'Sessions qui expirent et rafraîchissement des jetons JWT de Supabase.', en: 'Expiring sessions and refreshing Supabase JWT tokens.' }, solution: { fr: 'Rafraîchissement automatique et gestion propre des sessions expirées.', en: 'Automatic refresh and clean handling of expired sessions.' } },
          { title: { fr: 'Seul sur un projet neuf', en: 'Solo on a greenfield project' }, problem: { fr: 'Chaque décision — stack, architecture, organisation — reposait sur moi.', en: 'Every decision — stack, architecture, organisation — was mine.' }, solution: { fr: 'Recherche, documentation rigoureuse et développement incrémental testé.', en: 'Research, thorough documentation and tested incremental development.' } },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  crow: {
    overview: {
      fr: 'Un service web écrit en C++ avec le framework Crow, dans le cadre de mes études. L’objectif n’était pas seulement que ça marche, mais que ce soit construit comme un vrai logiciel.',
      en: 'A web service written in C++ with the Crow framework, as part of my studies. The goal wasn’t only for it to work, but for it to be built like real software.',
    },
    role: { fr: 'Développeur', en: 'Developer' },
    duration: { fr: 'Projet d’école', en: 'School project' },
    cover: img(crow, undefined, 800, 600, { fr: 'Routes HTTP vers des contrôleurs C++', en: 'HTTP routes to C++ handlers' }, { fr: 'Des routes HTTP servies par Crow, testées unitairement.', en: 'HTTP routes served by Crow, unit-tested.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Ce qui comptait', en: 'What mattered' },
        items: [
          { title: { fr: 'Conception objet', en: 'Object design' }, text: { fr: 'Usage avancé de la composition, de l’héritage et des templates pour un code générique et réutilisable.', en: 'Advanced use of composition, inheritance and templates for generic, reusable code.' }, tags: ['OOP', 'templates'] },
          { title: { fr: 'Build reproductible', en: 'Reproducible build' }, text: { fr: 'Un Makefile complet : compilation, tests et nettoyage en une commande.', en: 'A complete Makefile: build, tests and clean in one command.' }, tags: ['Make'] },
          { title: { fr: 'Tests', en: 'Tests' }, text: { fr: 'Des tests unitaires sur les fonctionnalités critiques et les cas limites.', en: 'Unit tests covering critical features and edge cases.' }, tags: ['unit tests'] },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  agents: {
    overview: {
      fr: 'Un LLM seul répond. Un agent agit : il planifie, choisit des outils, exécute du code, se souvient. Ce projet, c’est toute l’infrastructure qui rend ça fiable.',
      en: 'An LLM alone answers. An agent acts: it plans, picks tools, runs code, remembers. This project is all the infrastructure that makes that reliable.',
    },
    role: { fr: 'Conception & développement', en: 'Design & development' },
    duration: { fr: '2026 — Groupe Alliances', en: '2026 — Groupe Alliances' },
    cover: img(agents, undefined, 800, 560, { fr: 'Planificateur relié à la mémoire, aux outils, au contexte et à la sandbox', en: 'Planner linked to memory, tools, context and sandbox' }, { fr: 'Les briques d’un agent autonome.', en: 'The building blocks of an autonomous agent.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Les briques', en: 'The building blocks' },
        items: [
          { title: { fr: 'Mémoire', en: 'Memory' }, text: { fr: 'Ce que l’agent a déjà vu et fait, pour reprendre une tâche sans repartir de zéro.', en: 'What the agent already saw and did, so it can resume a task without starting over.' } },
          { title: { fr: 'Contexte', en: 'Context' }, text: { fr: 'Choisir ce que le modèle voit à chaque étape : assez pour bien décider, pas trop pour ne pas se perdre.', en: 'Choosing what the model sees at each step: enough to decide well, not so much it gets lost.' } },
          { title: { fr: 'Sandbox', en: 'Sandbox' }, text: { fr: 'Un environnement isolé où l’agent écrit et exécute son propre code, sans risque pour le reste.', en: 'An isolated environment where the agent writes and runs its own code, safely.' } },
          { title: { fr: 'Outils', en: 'Tools' }, text: { fr: 'Des APIs et des actions branchées, que l’agent choisit lui-même selon la tâche.', en: 'Plugged-in APIs and actions the agent picks by itself depending on the task.' } },
        ],
      },
      { type: 'text', title: { fr: 'Pas de capture publique', en: 'No public screenshots' }, body: { fr: 'Projet interne : le code et les écrans restent confidentiels. Je peux en parler plus en détail en entretien.', en: 'Internal project: code and screens stay confidential. Happy to go into detail in an interview.' } },
    ],
  },

  ocr: {
    overview: {
      fr: 'Les documents réels ne ressemblent jamais aux exemples : scans de travers, tampons, colonnes, écriture. L’objectif : en tirer un texte fiable et des données structurées.',
      en: 'Real documents never look like the examples: skewed scans, stamps, columns, handwriting. The goal: get reliable text and structured data out of them.',
    },
    role: { fr: 'Conception & développement', en: 'Design & development' },
    duration: { fr: '2026', en: '2026' },
    cover: img(ocr, undefined, 800, 560, { fr: 'Document avec blocs de texte détectés', en: 'Document with detected text blocks' }, { fr: 'Détection des blocs et score de confiance.', en: 'Block detection and confidence score.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'L’approche', en: 'The approach' },
        items: [
          { title: { fr: 'Lire dans le bon ordre', en: 'Read in the right order' }, text: { fr: 'Détecter les blocs de texte et reconstruire l’ordre de lecture.', en: 'Detect text blocks and rebuild the reading order.' } },
          { title: { fr: 'Savoir quand douter', en: 'Know when to doubt' }, text: { fr: 'Un score de confiance par bloc pour signaler ce qu’un humain doit relire.', en: 'A confidence score per block to flag what a human should check.' } },
          { title: { fr: 'Sortir des données', en: 'Output data' }, text: { fr: 'Un résultat structuré, directement exploitable par une IA ou une base.', en: 'Structured output, directly usable by an AI or a database.' } },
        ],
      },
    ],
  },

  'personal-agent': {
    overview: {
      fr: 'En dehors du travail, je conçois des agents IA personnels pour des particuliers : des assistants branchés à leurs outils, qui agissent à leur place sur les tâches répétitives.',
      en: 'Outside work, I build personal AI agents for individuals: assistants wired to their tools that act on their behalf on repetitive tasks.',
    },
    role: { fr: 'Freelance', en: 'Freelance' },
    duration: { fr: '2026', en: '2026' },
    cover: img(personal, undefined, 800, 600, { fr: 'Un agent relié à un agenda, des messages et des tâches', en: 'An agent linked to a calendar, messages and tasks' }, { fr: 'Un agent au centre des outils du quotidien.', en: 'An agent at the centre of everyday tools.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Principes', en: 'Principles' },
        items: [
          { title: { fr: 'Sur mesure', en: 'Tailor-made' }, text: { fr: 'Chaque agent part des habitudes réelles de la personne, pas d’un modèle générique.', en: 'Each agent starts from the person’s real habits, not a generic template.' } },
          { title: { fr: 'Connecté', en: 'Connected' }, text: { fr: 'Branché à des services tiers par API et orchestré avec n8n.', en: 'Wired to third-party services through APIs and orchestrated with n8n.' } },
          { title: { fr: 'Garde-fous', en: 'Guardrails' }, text: { fr: 'L’agent demande confirmation avant toute action qui compte.', en: 'The agent asks for confirmation before any action that matters.' } },
        ],
      },
    ],
  },

  'data-platform': {
    overview: {
      fr: 'L’IA ne vaut que ce que valent ses données. Cette plateforme transforme des données brutes — scrapées, exportées, éparpillées — en bases propres et fiables.',
      en: 'AI is only as good as its data. This platform turns raw data — scraped, exported, scattered — into clean, reliable databases.',
    },
    role: { fr: 'Conception & développement', en: 'Design & development' },
    duration: { fr: '2026 — Groupe Alliances', en: '2026 — Groupe Alliances' },
    cover: img(dataPlatform, undefined, 800, 600, { fr: 'Données brutes à gauche, table structurée à droite', en: 'Raw data on the left, structured table on the right' }, { fr: 'Du nuage de points à la table.', en: 'From a cloud of points to a table.' }),
    blocks: [
      {
        type: 'timeline', title: { fr: 'Le pipeline', en: 'The pipeline' },
        items: [
          { label: { fr: '01', en: '01' }, title: { fr: 'Collecte', en: 'Collect' }, text: { fr: 'Web scraping et import de sources existantes.', en: 'Web scraping and import of existing sources.' } },
          { label: { fr: '02', en: '02' }, title: { fr: 'Nettoyage', en: 'Clean' }, text: { fr: 'Doublons, formats, valeurs manquantes : fiabiliser de grands volumes.', en: 'Duplicates, formats, missing values: make large volumes reliable.' } },
          { label: { fr: '03', en: '03' }, title: { fr: 'Structuration', en: 'Structure' }, text: { fr: 'L’IA aide à ranger le texte libre dans un schéma clair.', en: 'AI helps map free text into a clear schema.' } },
          { label: { fr: '04', en: '04' }, title: { fr: 'Exploitation', en: 'Use' }, text: { fr: 'Des données SQL prêtes pour la recherche, les tableaux de bord et les agents.', en: 'SQL data ready for search, dashboards and agents.' } },
        ],
      },
    ],
  },
}

export const photoCount = (id: string) => caseStudies[id]?.blocks.reduce((n, b) => n + (b.type === 'gallery' ? b.items.length : 0), 0) ?? 0
