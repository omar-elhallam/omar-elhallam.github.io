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
import ocr from '../assets/illustrations/ocr.svg'
import personal from '../assets/illustrations/personal-agent.svg'
import syndic from '../assets/illustrations/syndic.svg'
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
      fr: 'Chez Mobiconnect Technologies, j’ai conçu seul, de zéro, une marketplace mobile qui met en relation clients et prestataires de services : demandes, offres, réservations, paiements et avis.',
      en: 'At Mobiconnect Technologies, I designed solo, from scratch, a mobile marketplace connecting customers with service providers: requests, offers, bookings, payments and reviews.',
    },
    role: { fr: 'Full-stack, seul', en: 'Full-stack, solo' },
    duration: { fr: 'Juin – août 2025', en: 'Jun – Aug 2025' },
    facts: [
      { value: '8', label: { fr: 'modules NestJS', en: 'NestJS modules' } },
      { value: '3', label: { fr: 'rôles utilisateurs', en: 'user roles' } },
      { value: '4', label: { fr: 'phases', en: 'phases' } },
    ],
    cover: img(service, undefined, 800, 600, { fr: 'Architecture : app Flutter, API NestJS, base Supabase', en: 'Architecture: Flutter app, NestJS API, Supabase database' }, { fr: 'Flutter → API REST NestJS → PostgreSQL sur Supabase.', en: 'Flutter → NestJS REST API → PostgreSQL on Supabase.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Une stack sobre et évolutive', en: 'A lean, scalable stack' },
        intro: { fr: 'Des contraintes fortes — coût, délai, une seule personne — sans fermer la porte à la suite.', en: 'Tight constraints — cost, time, one person — without closing the door on what comes next.' },
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
  'medical-records': {
    overview: {
      fr: 'Un médecin exerçant à titre particulier accumule des fiches de consultation manuscrites. L’application les numérise, lit l’identité du patient et les dates avec un modèle de vision, puis classe chaque fiche dans le bon dossier — et ne demande l’avis du médecin que lorsqu’elle doute. Développée seul, de bout en bout, elle tourne en production.',
      en: 'A doctor in private practice piles up handwritten consultation sheets. The app digitises them, reads the patient’s identity and the dates with a vision model, then files each sheet in the right record — and only asks the doctor when it’s unsure. Built solo, end to end, and running in production.',
    },
    role: { fr: 'Développeur unique · mission indépendante', en: 'Sole developer · freelance' },
    duration: { fr: 'Oct. – nov. 2026 · en production', en: 'Oct – Nov 2026 · in production' },
    facts: [
      { value: '7 800', label: { fr: 'lignes de TypeScript', en: 'lines of TypeScript' } },
      { value: '23', label: { fr: 'endpoints HTTP', en: 'HTTP endpoints' } },
      { value: '0.9', label: { fr: 'seuil de confiance', en: 'confidence threshold' } },
      { value: '300', label: { fr: 'PDF d’archives à migrer', en: 'archive PDFs to migrate' } },
    ],
    cover: img(ocr, undefined, 800, 560, { fr: 'Fiche avec blocs de texte détectés et scores de confiance', en: 'Sheet with detected text blocks and confidence scores' }, { fr: 'Lire une écriture manuscrite, et savoir quand douter.', en: 'Reading handwriting — and knowing when to doubt.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Comment ça marche', en: 'How it works' },
        items: [
          { title: { fr: 'Ingestion', en: 'Ingestion' }, text: { fr: 'Dépôt de PDF ou de photos, conversion, découpage en une fiche par page, stockage adressé par empreinte SHA-256 et mise en file d’attente.', en: 'Upload PDFs or photos, convert, split into one sheet per page, SHA-256 content-addressed storage, then queue.' }, tags: ['SHA-256', 'queue'] },
          { title: { fr: 'Vision', en: 'Vision' }, text: { fr: 'Deux images par fiche : l’en-tête recadré en haute résolution pour l’identité, la page entière pour les dates. Sortie JSON validée par schéma Zod.', en: 'Two images per sheet: a high-resolution crop of the header for identity, the full page for dates. JSON output validated by a Zod schema.' }, tags: ['Claude Sonnet', 'Zod'] },
          { title: { fr: 'Appariement patient', en: 'Patient matching' }, text: { fr: 'Arbitrage par date de naissance et distance de Levenshtein : deux homonymes nés à des dates différentes ne sont jamais fusionnés automatiquement.', en: 'Decided by date of birth and Levenshtein distance: two namesakes born on different dates are never merged automatically.' }, tags: ['Levenshtein'] },
          { title: { fr: 'Vérification humaine', en: 'Human review' }, text: { fr: 'Sous un seuil de confiance de 0,9, la fiche part dans une file où le médecin corrige l’identité et les dates.', en: 'Below a 0.9 confidence threshold, the sheet goes to a queue where the doctor corrects identity and dates.' }, tags: ['0.9'] },
        ],
      },
      {
        type: 'list', title: { fr: 'Pour le médecin', en: 'For the doctor' },
        items: {
          fr: ['Interface web mobile-first : recherche, tris multiples, historique chronologique dédoublonné.', 'Visionneuse page entière et thème clair / sombre.', 'Outils CLI dédiés : import en masse, mesure de précision du modèle, diagnostic de sauvegarde.'],
          en: ['Mobile-first web app: search, multiple sorts, de-duplicated chronological history.', 'Full-page viewer and light / dark theme.', 'Dedicated CLI tools: bulk import, model accuracy measurement, backup diagnostics.'],
        },
      },
      {
        type: 'cards', title: { fr: 'Exploitation & sécurité', en: 'Operations & security' },
        items: [
          { title: { fr: 'Authentification', en: 'Authentication' }, text: { fr: 'bcrypt avec hachage leurre contre les attaques temporelles, double limitation de débit (par IP et globale).', en: 'bcrypt with a decoy hash against timing attacks, double rate limiting (per IP and global).' } },
          { title: { fr: 'Sauvegardes', en: 'Backups' }, text: { fr: 'Instantané SQLite cohérent par VACUUM INTO chaque nuit, envoi chiffré restic vers Backblaze B2, rétention 14 jours / 8 semaines / 24 mois.', en: 'Consistent nightly SQLite snapshot via VACUUM INTO, encrypted restic upload to Backblaze B2, retention 14 days / 8 weeks / 24 months.' } },
          { title: { fr: 'Restauration testée', en: 'Tested restores' }, text: { fr: 'Restauration vérifiée de bout en bout : intégrité de la base et recalcul des empreintes des fichiers restaurés.', en: 'Restores verified end to end: database integrity and re-hashing of every restored file.' } },
          { title: { fr: 'Déploiement', en: 'Deployment' }, text: { fr: 'Docker multi-étapes sur Fly.io, Node 22, SQLite en module natif.', en: 'Multi-stage Docker on Fly.io, Node 22, native SQLite module.' } },
        ],
      },
      {
        type: 'challenges', title: { fr: 'Difficultés résolues', en: 'Problems solved' },
        items: [
          { title: { fr: 'Doublons fantômes', en: 'Ghost duplicates' }, problem: { fr: 'Chaque redépôt du même PDF créait des doublons : la librairie injectait des horodatages dans les pages découpées.', en: 'Re-uploading the same PDF created duplicates: the library stamped timestamps into the split pages.' }, solution: { fr: 'Découpage PDF déterministe sans ré-encodage, horodatages neutralisés : même entrée, même empreinte.', en: 'Deterministic PDF splitting without re-encoding, timestamps neutralised: same input, same hash.' } },
          { title: { fr: 'Plusieurs consultations par feuille', en: 'Several visits per sheet' }, problem: { fr: 'Certaines feuilles portent plusieurs consultations, le modèle n’en voyait qu’une.', en: 'Some sheets carry several visits, the model only saw one.' }, solution: { fr: 'Seconde image dédiée et passage à une relation 1→N, avec reprise des données existantes.', en: 'A dedicated second image and a move to a 1→N relation, migrating existing data.' } },
          { title: { fr: 'Sauvegardes silencieuses', en: 'Silent backups' }, problem: { fr: 'Les sauvegardes échouaient sans aucune erreur visible.', en: 'Backups were failing without any visible error.' }, solution: { fr: 'Diagnostic : magasin de certificats absent de l’image Docker, combiné à un backend qui avalait ses erreurs. Corrigé et surveillé.', en: 'Root cause: no certificate store in the Docker image, plus a backend swallowing its errors. Fixed and monitored.' } },
        ],
      },
      {
        type: 'code', title: { fr: 'Stack', en: 'Stack' },
        code: `TypeScript · React 19 · Vite 6 · Hono 4 · Node 22
SQLite (native module) · Anthropic API (Claude Sonnet, structured output via Zod)
Fly.io · multi-stage Docker · restic → Backblaze B2 (S3)

~7,800 lines of TypeScript · 37 files · 23 HTTP endpoints · 1,131 lines of docs`,
      },
    ],
  },

  'consultant-assistant': {
    overview: {
      fr: 'Un assistant IA personnel, utilisé tous les jours par un consultant senior sur un programme de coopération internationale. Il vit dans Telegram, comprend la voix, lit les e-mails, prépare des brouillons, génère des documents à partir de ses modèles et met à jour sa feuille de temps — avec la sécurité pensée dès la conception.',
      en: 'A personal AI assistant used every day by a senior consultant on an international cooperation programme. It lives in Telegram, understands voice, reads email, prepares drafts, generates documents from his templates and updates his timesheet — with security designed in from the start.',
    },
    role: { fr: 'Conception & développement, seul', en: 'Design & development, solo' },
    duration: { fr: 'Mai – juil. 2026 · en production sur VPS', en: 'May – Jul 2026 · in production on a VPS' },
    facts: [
      { value: '754', label: { fr: 'tests automatisés', en: 'automated tests' } },
      { value: '30', label: { fr: 'outils côté client', en: 'client-side tools' } },
      { value: '80k', label: { fr: 'tokens avant compaction', en: 'tokens before compaction' } },
      { value: '12 %', label: { fr: 'de dépense invisible retrouvée', en: 'hidden spend uncovered' } },
    ],
    cover: img(personal, undefined, 800, 600, { fr: 'Un agent relié aux e-mails, à l’agenda et aux documents', en: 'An agent linked to mail, calendar and documents' }, { fr: 'Un agent au centre des outils du quotidien.', en: 'An agent at the centre of everyday tools.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Ce qu’il sait faire', en: 'What it does' },
        items: [
          { title: { fr: 'Agent multimodal', en: 'Multimodal agent' }, text: { fr: 'Texte, note vocale, document et image sur Telegram, avec une boucle d’outils agentique plafonnée à 25 itérations.', en: 'Text, voice notes, documents and images on Telegram, with an agentic tool loop capped at 25 iterations.' }, tags: ['Claude Sonnet', 'Haiku'] },
          { title: { fr: 'Gmail, sans envoi', en: 'Gmail, no sending' }, text: { fr: '11 outils en lecture et brouillons uniquement. Aucun outil d’envoi n’existe par construction ; chaque mise à jour de brouillon est vérifiée par relecture.', en: '11 read-and-draft-only tools. No send tool exists by design; every draft update is verified by reading it back.' }, tags: ['OAuth 2.0'] },
          { title: { fr: 'Documents', en: 'Documents' }, text: { fr: 'docx, xlsx avec formules, pdf, pptx. Le bot classe les modèles reçus et produit les livrables par copie du modèle.', en: 'docx, xlsx with formulas, pdf, pptx. The bot files the templates it receives and builds deliverables by copying them.' } },
          { title: { fr: 'Voix', en: 'Voice' }, text: { fr: 'Transcription Whisper en français, synthèse vocale en réponse ; c’est le modèle qui décide de répondre à l’oral.', en: 'Whisper transcription in French, spoken replies via TTS; the model itself decides when to answer by voice.' }, tags: ['Whisper', 'TTS', 'ffmpeg'] },
        ],
      },
      {
        type: 'list', title: { fr: 'Contexte & proactivité', en: 'Context & proactivity' },
        items: {
          fr: ['Sessions persistantes avec rotation à l’inactivité et rappel des conversations passées.', 'Compaction par résumé d’un modèle plus léger au-delà de 80 000 tokens, avec découpe sûre des paires appel d’outil / résultat.', 'Tâche planifiée : feuille de temps mise à jour chaque jour à partir des e-mails envoyés, déposée en brouillon — une fois par jour, week-ends exclus, rattrapage au redémarrage.'],
          en: ['Persistent sessions with inactivity rotation and recall of past conversations.', 'Summary-based compaction by a lighter model past 80,000 tokens, safely splitting tool call / result pairs.', 'Scheduled task: the timesheet is updated daily from sent emails and left as a draft — once a day, weekends excluded, caught up on restart.'],
        },
      },
      {
        type: 'challenges', title: { fr: 'Sécurité & fiabilité', en: 'Security & reliability' },
        items: [
          { title: { fr: 'Exfiltration par injection', en: 'Injection exfiltration' }, problem: { fr: 'Un e-mail entrant contenant un marqueur de pièce jointe pointant vers le jeton OAuth Gmail aurait pu le faire livrer sur Telegram.', en: 'An incoming email carrying an attachment marker that pointed to the Gmail OAuth token could have had it delivered on Telegram.' }, solution: { fr: 'Liste blanche des sources autorisées à émettre ces marqueurs, liste noire sur toutes les surfaces de sortie, processus confiné par systemd (ProtectSystem=strict, NoNewPrivileges).', en: 'Allow-list of sources allowed to emit those markers, deny-list on every output surface, process sandboxed by systemd (ProtectSystem=strict, NoNewPrivileges).' } },
          { title: { fr: 'Historique corrompu', en: 'Corrupted history' }, problem: { fr: 'La troncature d’un appel d’outil pouvait laisser un historique incohérent.', en: 'Truncating a tool call could leave an inconsistent history.' }, solution: { fr: 'Détection, reprise et annulation atomique du tour.', en: 'Detection, recovery and atomic rollback of the turn.' } },
          { title: { fr: 'Coûts invisibles', en: 'Invisible costs' }, problem: { fr: 'Les tours échoués étaient facturés sans que personne ne le voie.', en: 'Failed turns were billed without anyone noticing.' }, solution: { fr: 'Registre de coûts par requête et alertes à l’opérateur : environ 12 % de dépense jusque-là invisible.', en: 'Per-request cost ledger and operator alerts: about 12% of previously invisible spend.' } },
        ],
      },
      {
        type: 'code', title: { fr: 'Stack & volumétrie', en: 'Stack & size' },
        code: `Python 3.12 · python-telegram-bot (async) · Anthropic API (Claude Sonnet & Haiku)
OpenAI Whisper & TTS · Gmail API (OAuth 2.0) · SQLite (WAL)
Hetzner Cloud · Ubuntu · systemd (sandboxed) · pytest

~12,750 lines of Python · ~12,050 lines of tests · 754 tests in 26 files`,
      },
    ],
  },

  syndic: {
    overview: {
      fr: 'Une plateforme complète pour gérer une résidence en copropriété : un back-office pour le gestionnaire et le comptable, un portail pour chaque copropriétaire. Menée seul, sans cahier des charges, avec un périmètre défini en continu avec le client.',
      en: 'A complete platform to run a condominium: a back office for the manager and the accountant, a portal for every owner. Built solo, without a spec, with the scope defined continuously with the client.',
    },
    role: { fr: 'Développeur unique', en: 'Sole developer' },
    duration: { fr: 'Juin 2026', en: 'June 2026' },
    facts: [
      { value: '13 600', label: { fr: 'lignes de TypeScript', en: 'lines of TypeScript' } },
      { value: '34', label: { fr: 'pages', en: 'pages' } },
      { value: '55', label: { fr: 'Server Actions', en: 'Server Actions' } },
      { value: '26', label: { fr: 'modèles de données', en: 'data models' } },
    ],
    cover: img(syndic, undefined, 800, 600, { fr: 'Une résidence reliée au portail gestionnaire et au portail copropriétaire', en: 'A residence linked to the manager portal and the owner portal' }, { fr: 'Deux portails, une seule source de vérité.', en: 'Two portals, one source of truth.' }),
    blocks: [
      {
        type: 'cards', title: { fr: 'Le métier', en: 'The business' },
        items: [
          { title: { fr: 'Appels de charges', en: 'Service-charge calls' }, text: { fr: 'Trimestriels, répartis en tantièmes, générés de façon idempotente (upsert transactionnel), montants en centimes entiers : aucune dérive d’arrondi.', en: 'Quarterly, split by ownership shares, generated idempotently (transactional upsert), amounts in integer cents: no rounding drift.' }, tags: ['tantièmes', 'idempotent'] },
          { title: { fr: 'Paiements', en: 'Payments' }, text: { fr: 'Virement, chèque, espèces ou paiement en ligne ; statut des appels et soldes recalculés en transaction.', en: 'Transfer, cheque, cash or online payment; call statuses and balances recalculated in a transaction.' } },
          { title: { fr: 'Documents', en: 'Documents' }, text: { fr: 'PDF générés côté serveur — relances à trois niveaux, convocations d’assemblée — classés automatiquement dans la GED.', en: 'Server-side PDFs — three-level reminders, meeting notices — filed automatically in the document store.' }, tags: ['pdf-lib'] },
          { title: { fr: 'Modules', en: 'Modules' }, text: { fr: 'GED, SAV bi-portail, budget contre réalisé, trésorerie, fournisseurs, annonces, sondages et assemblées générales.', en: 'Document store, two-portal support desk, budget vs actuals, treasury, suppliers, announcements, polls and general meetings.' } },
        ],
      },
      {
        type: 'list', title: { fr: 'Pensée pour évoluer', en: 'Built to evolve' },
        items: {
          fr: ['Plateforme modulable : listes de valeurs et champs personnalisés (modèle EAV) configurables par le client sur cinq entités.', 'Architecture découplée : paiement, e-mail et stockage derrière des interfaces, avec des implémentations de démonstration remplaçables par les vrais services sans toucher au reste.'],
          en: ['Configurable platform: value lists and custom fields (EAV model) the client sets up on five entities.', 'Decoupled architecture: payment, email and storage behind interfaces, with demo implementations swappable for real services without touching the rest.'],
        },
      },
      {
        type: 'cards', title: { fr: 'Audit & durcissement de sécurité', en: 'Security audit & hardening' },
        items: [
          { title: { fr: 'Sessions', en: 'Sessions' }, text: { fr: 'JWT httpOnly, secret de session en fail-closed en production.', en: 'httpOnly JWT, session secret fail-closed in production.' } },
          { title: { fr: 'Accès', en: 'Access' }, text: { fr: 'Rôles revérifiés en base à chaque requête, garde multi-tenant sur le périmètre de la résidence.', en: 'Roles re-checked in the database on every request, multi-tenant guard on the residence scope.' } },
          { title: { fr: 'Défenses', en: 'Defences' }, text: { fr: 'Anti-brute-force, en-têtes de sécurité et CSP, liste blanche MIME et téléchargements par route authentifiée.', en: 'Anti-brute-force, security headers and CSP, MIME allow-list and downloads through an authenticated route.' } },
        ],
      },
      {
        type: 'code', title: { fr: 'Stack & volumétrie', en: 'Stack & size' },
        code: `Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4
Prisma 6 · PostgreSQL 16 · Zod · jose (JWT) · bcryptjs · pdf-lib
Docker Compose · Railway

~13,600 lines of TypeScript · 110 files · 34 pages · 55 Server Actions
26 data models · 15 enums · 12 migrations`,
      },
    ],
  },
}

export const photoCount = (id: string) => caseStudies[id]?.blocks.reduce((n, b) => n + (b.type === 'gallery' ? b.items.length : 0), 0) ?? 0
