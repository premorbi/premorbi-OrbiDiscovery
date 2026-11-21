export type CategoryPriority = 0 | 1 | 2; // 0 = Not needed, 1 = Nice to have, 2 = Must have

export type VisualKind =
  | { kind: 'photo'; src: string; alt: string; caption: string }
  | { kind: 'diagram'; diagramId: 'water' | 'safety' | 'network' | 'climate' | 'acoustic' | 'gate'; caption: string };

export interface CategoryDef {
  id: string;
  name: string;
  description: string;
  example: string;
  weight: number;
  svgClass: string;
  leadTip: string;
  visual: VisualKind;
}

export interface FollowUpQuestion {
  question: string;
  mode: 'one' | 'many';
  options: string[];
}

export interface PainPointDef {
  id: number;
  title: string;
  symptom: string;
  relatedCategories: string[];
  solutionHint: string;
}

export const KEYPAD_PHOTO = {
  src: '/src/assets/images/smart_wall_keypad_1795232618345.jpg',
  alt: 'Brushed bronze smart wall keypad with Morning, Evening, and Away backlit scene buttons',
  caption: 'Designer scene keypad (KNX / Lutron style) replacing cluttered switch banks',
};

export const PHOTO_ASSETS = {
  lighting: '/src/assets/images/smart_lighting_scenes_1795232618692.jpg',
  curtains: '/src/assets/images/smart_curtains_climate_1795232619859.jpg',
  security: '/src/assets/images/smart_security_entry_1795232619390.jpg',
  theatre: '/src/assets/images/smart_theatre_acoustic_1795232623757.jpg',
  solarGarden: '/src/assets/images/smart_solar_garden_1795232619048.jpg',
  keypad: '/src/assets/images/smart_wall_keypad_1795232618345.jpg',
};

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'lighting',
    name: 'Lighting & scenes',
    description: 'Dim, schedule and set moods. One tap for Dinner, Movie or Good night.',
    example: 'All lights off as you leave; warm cove lights dim gently at 6 pm.',
    weight: 3,
    svgClass: 'lgt',
    leadTip:
      'Lighting control and scenes: KNX keypads (Legrand, GM, Ekinex, Vibroxx, Basalte) on new wiring, or wireless dimmers on retrofit. Lutron for architectural dimming and shades.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.lighting,
      alt: 'Modern villa living room at dusk with warm dimmable cove lighting, pendant lamps, and smart wall keypad',
      caption: 'Layered warm cove + pendant dimming triggered from one bedside or entry button',
    },
  },
  {
    id: 'shades',
    name: 'Curtains & blinds',
    description: 'Motorised curtains that open with sunrise and close automatically for privacy.',
    example: 'Bedroom curtains open at 7 am, close softly at sunset.',
    weight: 2,
    svgClass: 'shd',
    leadTip:
      'Motorised curtains and blinds; verify curtain-box depth and a dedicated power point at each track.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.curtains,
      alt: 'Contemporary bedroom with motorized floor-to-ceiling sheer and blackout curtains opening onto a sunlit balcony',
      caption: 'Quiet dual-track sheer + blackout drapery synced to daylight and AC schedules',
    },
  },
  {
    id: 'climate',
    name: 'Climate & fresh air',
    description: 'Control ACs from anywhere, cool the bedroom before you reach home.',
    example: 'AC switches off automatically if a balcony sliding door stays open.',
    weight: 2,
    svgClass: 'clm',
    leadTip:
      'AC control on the app; fresh-air ventilation and heat pump hot water (new Orbi HVAC line).',
    visual: {
      kind: 'diagram',
      diagramId: 'climate',
      caption: 'Room-by-room AC scheduling, balcony door interlock, and fresh-air exchange',
    },
  },
  {
    id: 'security',
    name: 'Security & entry',
    description: 'See who is at the door, unlock remotely for family, get alerts on your phone.',
    example: 'Video door phone rings on your mobile anywhere in the world.',
    weight: 2,
    svgClass: 'sec',
    leadTip: 'Video door phone, smart lock, CCTV and intrusion sensors unified in one app.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.security,
      alt: 'Modern residence entrance porch at twilight with biometric smart lock, slim video doorbell, and eaves camera',
      caption: 'Biometric main lock, video doorbell intercom, and perimeter camera coverage',
    },
  },
  {
    id: 'safety',
    name: 'Safety sensors',
    description: 'Gas, smoke and water leak alerts, plus an SOS button for elderly parents.',
    example: 'Gas leak detected: alert sent immediately and kitchen exhaust turns on.',
    weight: 1,
    svgClass: 'saf',
    leadTip: 'Gas, smoke and water-leak sensors, elder SOS buttons, and night path lighting.',
    visual: {
      kind: 'diagram',
      diagramId: 'safety',
      caption: '24/7 kitchen gas/smoke detection, bathroom leak cutoff, and bedside SOS',
    },
  },
  {
    id: 'av',
    name: 'Home theatre & music',
    description: 'A proper cinema room, or music that follows you seamlessly room to room.',
    example: '"Movie" dims lights, closes curtains, and starts the projector together.',
    weight: 3,
    svgClass: 'av',
    leadTip:
      'Home theatre and multi-room audio; pair with MMT Acoustix treatment for the media room.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.theatre,
      alt: 'Private residential home theatre room with timber acoustic wall panels, recessed warm LED steps, and projection screen',
      caption: 'One-tap cinema scene integrating screen, AV receiver, lights, and shading',
    },
  },
  {
    id: 'energy',
    name: 'Solar & energy',
    description: 'Rooftop solar generation and a live view of what your home consumes.',
    example: 'See today’s solar output, battery reserve, and electricity bill savings.',
    weight: 3,
    svgClass: 'ene',
    leadTip: 'Enphase rooftop solar with monitoring; live energy dashboards in the app.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.solarGarden,
      alt: 'Contemporary villa exterior with rooftop monocrystalline solar array, landscaped garden, and sliding driveway gate',
      caption: 'Panel-level rooftop solar tracking, backup reserve, and high-load monitoring',
    },
  },
  {
    id: 'water',
    name: 'Water management',
    description: 'Tank level on your phone, pump runs itself, and leaks get shut off.',
    example: 'Overhead tank full: borewell or sump motor switches off automatically.',
    weight: 1,
    svgClass: 'wat',
    leadTip: 'Ultrasonic tank level sensing, automatic pump control, and leak shut-off valves.',
    visual: {
      kind: 'diagram',
      diagramId: 'water',
      caption: 'Automated sump-to-overhead pumping with dry-run & overflow protection',
    },
  },
  {
    id: 'outdoor',
    name: 'Garden & facade',
    description: 'Facade and landscape lighting, timed garden irrigation, pool control.',
    example: 'Architectural facade lights turn on at dusk; lawn watered at 5 am.',
    weight: 2,
    svgClass: 'out',
    leadTip: 'Facade and landscape lighting, moisture-aware irrigation, and pool management.',
    visual: {
      kind: 'photo',
      src: PHOTO_ASSETS.solarGarden,
      alt: 'Architectural garden lighting and automated outdoor living landscape',
      caption: 'Astronomical dusk-to-dawn facade lighting and automated garden irrigation',
    },
  },
  {
    id: 'gate',
    name: 'Gate & garage',
    description: 'Open the driveway gate from your car or let a delivery inside from work.',
    example: 'Gate opens smoothly as your car turns into the lane.',
    weight: 1,
    svgClass: 'gat',
    leadTip: 'Gate and shutter motor automation linked to the app and video door phone.',
    visual: {
      kind: 'diagram',
      diagramId: 'gate',
      caption: 'Remote sliding/swing gate + garage shutter control paired with visitor video',
    },
  },
  {
    id: 'acoustic',
    name: 'Acoustic comfort',
    description: 'Quieter bedrooms, clearer living-room conversations, a silent study.',
    example: 'Traffic noise cut down in the master bedroom and media room echo removed.',
    weight: 2,
    svgClass: 'aco',
    leadTip: 'MMT Acoustix soundproofing and panels; walk them past the acoustic display wall.',
    visual: {
      kind: 'diagram',
      diagramId: 'acoustic',
      caption: 'Architectural acoustic panels and glazing seals for echo & street noise isolation',
    },
  },
  {
    id: 'network',
    name: 'Wi-Fi everywhere',
    description: 'Strong, uninterrupted Wi-Fi in every corner so every smart device works.',
    example: 'Full-speed video calls from the terrace, basement, or garden.',
    weight: 1,
    svgClass: 'net',
    leadTip: 'Whole-home Wi-Fi and wired Cat6 backbone: the foundation everything else runs on.',
    visual: {
      kind: 'diagram',
      diagramId: 'network',
      caption: 'Ceiling-mounted enterprise access points per floor on a wired Cat6 backbone',
    },
  },
];

export const FOLLOW_UPS: Record<string, FollowUpQuestion[]> = {
  lighting: [
    ['What matters most?', 'many', ['Mood scenes', 'Dimming', 'Automatic on/off with motion', 'Saving energy', 'Colour or tunable white light']],
    ['Kind of lighting', 'one', ['Mostly downlights', 'Lots of cove and profile lights', 'A mix', 'Not sure yet']],
    ['The light fittings', 'one', ['Buying new lights too', 'Keeping my current lights']],
  ].map(([question, mode, options]) => ({
    question: question as string,
    mode: mode as 'one' | 'many',
    options: options as string[],
  })),
  shades: [
    { question: 'How many windows or doors?', mode: 'one', options: ['1–3', '4–8', '9 or more'] },
    { question: 'What would you like?', mode: 'many', options: ['Curtains', 'Roller blinds', 'Zebra or Venetian blinds', 'Not decided'] },
    { question: 'Curtain pockets in the ceiling', mode: 'one', options: ['Already planned', 'Still to plan', 'Existing curtains'] },
  ],
  climate: [
    { question: 'Your ACs', mode: 'many', options: ['Split ACs', 'Central (VRV/VRF)', 'Window ACs', 'None yet'] },
    { question: 'How many?', mode: 'one', options: ['1–2', '3–4', '5 or more'] },
    { question: 'Also interested in', mode: 'many', options: ['Fresh-air ventilation', 'Heat pump hot water', 'Air purifiers'] },
  ],
  security: [
    { question: 'What do you need?', mode: 'many', options: ['Video door phone', 'Smart door lock', 'CCTV cameras', 'Door and window alarms', 'Gate intercom'] },
    { question: 'How many cameras?', mode: 'one', options: ['1–4', '5–8', '9 or more', 'No cameras'] },
    { question: 'Who needs to get in?', mode: 'many', options: ['Family, on their phones', 'Domestic help, at set times', 'Deliveries and visitors'] },
  ],
  safety: [
    { question: 'Which alerts?', mode: 'many', options: ['Gas leak', 'Smoke or fire', 'Water leak', 'SOS buttons', 'No-movement alert for elders'] },
    { question: 'Who should be told?', mode: 'many', options: ['Me', 'Other family members', 'Security guard or neighbour'] },
  ],
  av: [
    { question: 'What are you picturing?', mode: 'one', options: ['A dedicated theatre room', 'Better living room TV and sound', 'Music in many rooms', 'All of these'] },
    { question: 'Seats', mode: 'one', options: ['2–4', '5–8', '9 or more'] },
    { question: 'Screen', mode: 'one', options: ['TV', 'Projector', 'Not sure'] },
  ],
  energy: [
    { question: 'Monthly power bill', mode: 'one', options: ['Under ₹3,000', '₹3,000–6,000', '₹6,000–10,000', 'Over ₹10,000'] },
    { question: 'Terrace space', mode: 'one', options: ['Plenty, mostly free', 'Limited or shared', 'Not sure'] },
    { question: 'Power cuts', mode: 'one', options: ['Want battery backup', 'Grid-connected is fine', 'Not sure'] },
  ],
  water: [
    { question: 'What do you need?', mode: 'many', options: ['Tank level on my phone', 'Pump that runs itself', 'Borewell and sump control', 'Leak shut-off', 'Water use tracking'] },
    { question: 'Your tanks', mode: 'one', options: ['Overhead tank only', 'Sump and overhead', 'Several tanks'] },
  ],
  outdoor: [
    { question: 'What would you like?', mode: 'many', options: ['Facade lighting', 'Garden lighting', 'Irrigation', 'Pool', 'Terrace garden'] },
    { question: 'Outdoor area', mode: 'one', options: ['Small', 'Medium', 'Large'] },
  ],
  gate: [
    { question: 'What should open?', mode: 'many', options: ['Swing gate', 'Sliding gate', 'Rolling shutter', 'Garage door'] },
    { question: 'Already motorised?', mode: 'one', options: ['Yes', 'No'] },
  ],
  acoustic: [
    { question: 'Where?', mode: 'many', options: ['Bedroom', 'Home theatre', 'Study or office', 'Music room', 'Whole house, traffic noise'] },
    { question: 'The main problem', mode: 'one', options: ['Noise coming in', 'Sound leaking out', 'Echo inside the room'] },
  ],
  network: [
    { question: 'What goes wrong today?', mode: 'many', options: ['Dead spots', 'Slow speeds', 'Too many devices', 'Nothing yet, new home'] },
    { question: 'Floors to cover', mode: 'one', options: ['1', '2', '3 or more'] },
    { question: 'Network cables in the walls', mode: 'one', options: ['Yes, can plan them', 'No, wireless only'] },
  ],
};

export const PAIN_POINTS: PainPointDef[] = [
  {
    id: 0,
    title: 'Too many confusing wall switches',
    symptom: 'Rows of identical switches where nobody remembers which controls which light or fan.',
    relatedCategories: ['lighting'],
    solutionHint: 'Engraved 4/6-button scene keypads replace switch clutter with Morning, Dinner & Good Night.',
  },
  {
    id: 1,
    title: 'Lights, ACs & geysers left running',
    symptom: 'Wasted power because bathrooms, corridors, or guest rooms stay on after people leave.',
    relatedCategories: ['lighting', 'climate'],
    solutionHint: 'Occupancy sensors + one-tap "All Off" by the door and bedside.',
  },
  {
    id: 2,
    title: 'Patchy Wi-Fi & dead zones',
    symptom: 'Video calls drop in upper bedrooms, study rooms, or the terrace garden.',
    relatedCategories: ['network'],
    solutionHint: 'Wired Cat6 ceiling access points engineered per floor for seamless roaming.',
  },
  {
    id: 3,
    title: 'Water tank overflow or dry pump',
    symptom: 'Climbing stairs to check tank levels or remembering to switch off the sump motor.',
    relatedCategories: ['water'],
    solutionHint: 'Automated ultrasonic tank sensing with dry-run cutoff and phone tank gauge.',
  },
  {
    id: 4,
    title: 'High monthly electricity bills',
    symptom: 'Heavy AC & water-heating bills with no visibility into what is drawing power.',
    relatedCategories: ['energy', 'climate'],
    solutionHint: 'Enphase rooftop solar + circuit-level energy analytics + AC scheduling.',
  },
  {
    id: 5,
    title: 'Unannounced visitors & missed deliveries',
    symptom: 'Walking down to open the gate or missing couriers when nobody is home.',
    relatedCategories: ['security', 'gate'],
    solutionHint: 'Mobile video door phone + remote gate release + timed keypad access.',
  },
  {
    id: 6,
    title: 'Elderly safety & night navigation',
    symptom: 'Worry about parents walking in dark hallways or needing quick emergency help.',
    relatedCategories: ['safety', 'lighting'],
    solutionHint: 'Low-glare motion night path lighting, SOS panic buttons, and inactivity alerts.',
  },
  {
    id: 7,
    title: 'Juggling 5 separate remotes & apps',
    symptom: 'Different apps for TV, AC, cameras, and curtains that family members avoid using.',
    relatedCategories: ['av', 'lighting', 'climate'],
    solutionHint: 'One unified app + physical wall keypads and voice scenes everyone can use.',
  },
  {
    id: 8,
    title: 'Traffic noise & room echo',
    symptom: 'Street noise disturbing bedrooms or harsh echo during movies and calls.',
    relatedCategories: ['acoustic', 'av'],
    solutionHint: 'MMT Acoustix wall/ceiling treatment and acoustic door/window sealing.',
  },
  {
    id: 9,
    title: 'Security worry when travelling',
    symptom: 'Leaving the house dark and unattended during family trips or work travel.',
    relatedCategories: ['security', 'lighting', 'shades'],
    solutionHint: 'Away mode presence simulation (curtains + lights) with instant perimeter alerts.',
  },
];

export const MOMENTS: Array<[string, string]> = [
  ['Wake up gently', 'Curtains open, lights warm up slowly, the geyser is already on.'],
  ['Leave with one tap', 'Lights, ACs and fans off, doors locked, cameras armed.'],
  ['Come home to comfort', 'Room cooled, porch light on, gate opens as you arrive.'],
  ['Movie night', 'Lights dim, curtains close, the screen and sound come on.'],
  ['Away on holiday', 'The house looks lived-in, and you get an alert if anything moves.'],
  ['Safe at night', 'Soft path lights to the bathroom, nothing harsh or bright.'],
  ['Look after parents', 'Know they are fine, get an instant alert if they press SOS.'],
  ['Kids’ routines', 'Study lights, bedtime scenes, and schedules on the TV.'],
  ['Hosting guests', 'One tap sets the mood across living, dining, and garden.'],
  ['Lower power bills', 'Solar generation, smart schedules, and nothing left running.'],
  ['Answer the door from anywhere', 'See and speak with visitors and deliveries from your phone.'],
  ['Good night', 'One switch by the bed turns the whole house off safely.'],
];

export const OPTIONS = {
  src: ['Walk-in at the Experience Centre', 'Friend or family', 'Instagram / Facebook', 'Google search', 'Architect or interior designer', 'Builder', 'Other'],
  ptype: ['Apartment', 'Villa', 'Independent house', 'Penthouse', 'Office / commercial', 'Hotel / service apartment'],
  size: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK or more'],
  stage: ['Under construction', 'Being renovated', 'Ready, moving in soon', 'Living in it now'],
  elec: ['Not started', 'Wiring in progress', 'Wiring done, walls still open', 'Walls finished', 'Not sure'],
  own: ['I own it', 'I am renting'],
  people: ['Young children', 'Teenagers', 'Elderly parents', 'Pets', 'Domestic help', 'Someone works from home', 'We travel often'],
  tech: ['I love gadgets', 'Fine with apps', 'Keep it simple, please'],
  decider: ['I decide', 'Me and my family together', 'Our architect or designer advises', 'Someone else decides'],
  rooms: ['Living', 'Dining', 'Kitchen', 'Master bedroom', 'Other bedrooms', 'Kids’ room', 'Home theatre / media', 'Study / office', 'Puja room', 'Balconies', 'Garden / terrace', 'Staircase & corridors', 'Parking'],
  control: ['Mobile app', 'Voice (Alexa, Google, Siri)', 'Elegant wall keypads', 'Automatic, with sensors and schedules', 'A tablet on the wall'],
  keypad: ['Premium designer keypads (glass, metal)', 'Match my existing switches', 'No preference'],
  existing: ['Alexa or Google speaker', 'Smart TV', 'Smart bulbs or plugs', 'CCTV', 'Inverter / UPS', 'Nothing yet'],
  budget: ['Under ₹1.5 lakh', '₹1.5–3 lakh', '₹3–5 lakh', '₹5–8 lakh', '₹8–12 lakh', '₹12–20 lakh', '₹20 lakh +', 'Not sure, guide me'],
  emi: ['Yes, show me EMI options', 'No, upfront is fine'],
  phase: ['Do it all at once', 'Start small and add later'],
  timeline: ['Within a month', '1–3 months', '3–6 months', 'More than 6 months', 'Just exploring'],
  designer: ['Yes', 'No'],
  consult: ['Visit the Experience Centre', 'Site visit at my home', 'Phone or video call'],
};

export interface StepMeta {
  title: string;
  subtitle: string;
}

export const STEPS: StepMeta[] = [
  { title: 'About you', subtitle: 'So we know who to get back to. We never share your details outside Orbi.' },
  { title: 'Your home', subtitle: 'Your property and wiring stage decide whether wired KNX or wireless retrofit fits best.' },
  { title: 'Household & pain points', subtitle: 'Tell us who lives at home and what frustrates you today so we solve real problems.' },
  { title: "What's possible", subtitle: 'Visualise each smart home system. Mark what is essential, nice to have, or not needed.' },
  { title: 'Daily moments', subtitle: 'Which everyday scenes would make life calmer? These shape the design more than any hardware list.' },
  { title: 'Rooms & control', subtitle: 'Where you want automation and how everyone at home prefers to control it.' },
  { title: 'Budget & timeline', subtitle: 'An honest range helps us design phase-wise options that fit comfortably.' },
  { title: 'Your brief & export', subtitle: 'Review your discovery brief, save it to the Orbi database, or send directly over WhatsApp.' },
];

export const SIZE_FACTORS = [0.6, 0.8, 1, 1.3, 1.7];
export const TIERS = ['Essentials', 'Smart', 'Premium', 'Signature'];
export const TIER_GUIDE = ['up to ₹3 L', '₹3–8 L', '₹8–20 L', '₹20 L +'];
export const BUDGET_TIER_MAP: Array<number | null> = [0, 0, 1, 1, 2, 2, 3, null];

export const PIPELINE_STATUSES: Array<{ value: 'new' | 'contacted' | 'site_visit' | 'quoted' | 'won' | 'archived'; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'archived', label: 'Archived' },
];
