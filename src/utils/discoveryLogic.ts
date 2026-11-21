import { serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  BUDGET_TIER_MAP,
  CATEGORIES,
  FOLLOW_UPS,
  MOMENTS,
  OPTIONS,
  PAIN_POINTS,
  SIZE_FACTORS,
  TIERS,
  type CategoryDef,
  type CategoryPriority,
  type PainPointDef,
} from '../data/discoveryConfig';

export type { CategoryPriority };

export type FollowUpMap = Record<string, Record<number, number | number[]>>;

export type PipelineStatus = 'new' | 'contacted' | 'site_visit' | 'quoted' | 'won' | 'archived';

export interface DiscoveryState {
  name: string;
  phone: string;
  email: string;
  area: string;
  src?: number;
  ptype?: number;
  size?: number;
  stage?: number;
  elec?: number;
  own?: number;
  people: number[];
  tech?: number;
  decider?: number;
  painPoints: number[];
  painPointNotes: string;
  cats: Record<string, CategoryPriority>;
  fu: FollowUpMap;
  moments: number[];
  rooms: number[];
  control: number[];
  keypad?: number;
  existing: number[];
  budget?: number;
  emi?: number;
  phase?: number;
  timeline?: number;
  designer?: number;
  designerName: string;
  consult?: number;
  notes: string;
}

export interface StoredDiscoveryRecord {
  id: string;
  ownerId: string;
  ownerEmail: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  area?: string;
  sourceIndex?: number;
  propertyTypeIndex?: number;
  sizeIndex?: number;
  stageIndex?: number;
  electricalIndex?: number;
  ownershipIndex?: number;
  people: number[];
  techComfortIndex?: number;
  deciderIndex?: number;
  painPoints: number[];
  painPointNotes?: string;
  cats: Record<string, CategoryPriority>;
  followUps: Record<string, Record<string, number | number[]>>;
  moments: number[];
  rooms: number[];
  control: number[];
  keypadIndex?: number;
  existing: number[];
  budgetIndex?: number;
  emiIndex?: number;
  phaseIndex?: number;
  timelineIndex?: number;
  designerIndex?: number;
  designerName?: string;
  consultIndex?: number;
  notes?: string;
  leadScore: number;
  leadTemp: 'Hot' | 'Warm' | 'Early stage';
  scopeTier: number;
  budgetTier: number;
  status: PipelineStatus;
  advisorNotes: string;
  orbiRef: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AnalysisResult {
  pts: number;
  scope: number;
  bt: number | null;
  score: number;
  temp: 'Hot' | 'Warm' | 'Early stage';
  platform: string;
  flags: string[];
  asks: string[];
  must: CategoryDef[];
  painPointMatches: PainPointDef[];
}

export function createBlankState(): DiscoveryState {
  return {
    name: '',
    phone: '',
    email: '',
    area: '',
    people: [],
    painPoints: [],
    painPointNotes: '',
    cats: {},
    fu: {},
    moments: [],
    rooms: [],
    control: [],
    existing: [],
    designerName: '',
    notes: '',
  };
}

export function createSampleState(): DiscoveryState {
  return {
    ...createBlankState(),
    name: 'Ananya Rao (Sample)',
    phone: '98450 12345',
    email: 'ananya@example.com',
    area: 'Sarjapur Road, Bengaluru',
    src: 4,
    ptype: 1,
    size: 3,
    stage: 0,
    elec: 0,
    own: 0,
    people: [2, 3, 5],
    tech: 1,
    decider: 1,
    painPoints: [0, 2, 3, 6],
    painPointNotes: 'Currently 14 switches in living room wall plate; Wi-Fi drops completely on 2nd floor study.',
    cats: {
      lighting: 2,
      shades: 2,
      climate: 1,
      security: 2,
      safety: 2,
      av: 1,
      energy: 1,
      water: 2,
      outdoor: 1,
      gate: 1,
      acoustic: 0,
      network: 2,
    },
    fu: {
      lighting: { 0: [0, 1, 2], 1: 2, 2: 0 },
      shades: { 0: 1, 1: [0, 1], 2: 1 },
      security: { 0: [0, 1, 2, 3], 1: 1, 2: [0, 1] },
      safety: { 0: [0, 1, 3, 4], 1: [0, 1] },
      water: { 0: [0, 1, 2], 1: 1 },
      network: { 0: [3], 1: 1, 2: 0 },
    },
    moments: [0, 1, 2, 5, 6, 10],
    rooms: [0, 1, 2, 3, 4, 7, 9, 10],
    control: [0, 1, 2],
    keypad: 0,
    existing: [0, 1],
    budget: 4,
    emi: 0,
    phase: 1,
    timeline: 1,
    designer: 0,
    designerName: 'Studio Kaya',
    consult: 1,
    notes: 'Mother uses a walker; wants gentle night path lighting to the bathroom.',
  };
}

export function isPhoneValid(phone: string): boolean {
  return String(phone || '').replace(/\D/g, '').length >= 10;
}

export function isStepZeroValid(s: DiscoveryState): boolean {
  return Boolean(String(s.name || '').trim() && isPhoneValid(s.phone));
}

export function optionLabel(key: keyof typeof OPTIONS, idx?: number): string {
  if (idx == null) return '';
  return OPTIONS[key][idx] ?? '';
}

export function optionLabels(key: keyof typeof OPTIONS, indices?: number[]): string {
  return (indices || [])
    .map((i) => OPTIONS[key][i])
    .filter(Boolean)
    .join(', ');
}

export function getFollowUpValue(s: DiscoveryState, catId: string, qIdx: number): number | number[] | undefined {
  return s.fu?.[catId]?.[qIdx];
}

export function formatFollowUpText(s: DiscoveryState, catId: string): string {
  const qs = FOLLOW_UPS[catId] || [];
  return qs
    .map((q, qIdx) => {
      const val = getFollowUpValue(s, catId, qIdx);
      if (val == null || (Array.isArray(val) && !val.length)) return '';
      const answerText =
        q.mode === 'many' && Array.isArray(val)
          ? val.map((i) => q.options[i]).filter(Boolean).join(', ')
          : typeof val === 'number'
            ? q.options[val] || ''
            : '';
      if (!answerText) return '';
      return `${q.question.replace(/\?$/, '')}: ${answerText}`;
    })
    .filter(Boolean)
    .join('; ');
}

function compactState(s: DiscoveryState): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (v == null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue;
    result[k] = v;
  }
  return result;
}

export function encodeOrbiRef(s: DiscoveryState): string {
  const json = JSON.stringify(compactState(s));
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

export function decodeOrbiRef(raw: string): DiscoveryState {
  const match = raw.match(/ORBI-REF:\s*([A-Za-z0-9+/=\s]+)/);
  if (!match) {
    throw new Error('No ORBI-REF token found. Paste the entire brief message including the ORBI-REF line.');
  }
  const cleanB64 = match[1].replace(/\s+/g, '');
  const bin = atob(cleanB64);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<DiscoveryState>;
  return {
    ...createBlankState(),
    ...parsed,
    people: Array.isArray(parsed.people) ? parsed.people : [],
    painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
    moments: Array.isArray(parsed.moments) ? parsed.moments : [],
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
    control: Array.isArray(parsed.control) ? parsed.control : [],
    existing: Array.isArray(parsed.existing) ? parsed.existing : [],
    cats: parsed.cats && typeof parsed.cats === 'object' ? parsed.cats : {},
    fu: parsed.fu && typeof parsed.fu === 'object' ? parsed.fu : {},
  };
}

export function buildBriefSections(s: DiscoveryState): Array<[string, Array<[string, string]>]> {
  const must = CATEGORIES.filter((c) => s.cats[c.id] === 2).map((c) => c.name).join(', ');
  const nice = CATEGORIES.filter((c) => s.cats[c.id] === 1).map((c) => c.name).join(', ');
  const home = [optionLabel('size', s.size), optionLabel('ptype', s.ptype), s.area].filter(Boolean).join(', ');
  const painList = (s.painPoints || []).map((id) => PAIN_POINTS[id]?.title).filter(Boolean).join(', ');

  return [
    [
      'Contact',
      [
        ['Name', s.name],
        ['Mobile', s.phone],
        ['Email', s.email],
        ['Heard via', optionLabel('src', s.src)],
      ],
    ],
    [
      'Home',
      [
        ['Property', home],
        ['Stage', optionLabel('stage', s.stage)],
        ['Electrical', optionLabel('elec', s.elec)],
        ['Ownership', optionLabel('own', s.own)],
      ],
    ],
    [
      'Household & Pain Points',
      [
        ['At home', optionLabels('people', s.people)],
        ['Tech comfort', optionLabel('tech', s.tech)],
        ['Decides', optionLabel('decider', s.decider)],
        ['Pain points', painList],
        ['Pain details', s.painPointNotes],
      ],
    ],
    [
      'Priorities & Moments',
      [
        ['Must have', must],
        ['Nice to have', nice],
        ['Daily moments', (s.moments || []).map((i) => MOMENTS[i]?.[0]).filter(Boolean).join(', ')],
      ],
    ],
    [
      'Must-have sizing details',
      CATEGORIES.filter((c) => s.cats[c.id] === 2 && formatFollowUpText(s, c.id)).map((c) => [
        c.name,
        formatFollowUpText(s, c.id),
      ]),
    ],
    [
      'Rooms & control',
      [
        ['Rooms', optionLabels('rooms', s.rooms)],
        ['Control', optionLabels('control', s.control)],
        ['Wall switches', optionLabel('keypad', s.keypad)],
        ['Already has', optionLabels('existing', s.existing)],
      ],
    ],
    [
      'Budget & timeline',
      [
        ['Budget', optionLabel('budget', s.budget)],
        ['EMI', optionLabel('emi', s.emi)],
        ['Approach', optionLabel('phase', s.phase)],
        ['Timeline', optionLabel('timeline', s.timeline)],
        ['Designer', [optionLabel('designer', s.designer), s.designerName].filter(Boolean).join(': ')],
        ['Next step', optionLabel('consult', s.consult)],
        ['Notes', s.notes],
      ],
    ],
  ];
}

export function buildWhatsAppMessage(s: DiscoveryState): string {
  const analysis = analyzeDiscovery(s);
  let text = `Smart Home Discovery Brief — Orbi Automatify\nLead Profile: ${analysis.temp} (${analysis.score}/100) · Scope: ${TIERS[analysis.scope]}\n`;
  buildBriefSections(s).forEach(([heading, rows]) => {
    const filled = rows.filter(([, val]) => Boolean(val && val.trim()));
    if (filled.length) {
      text += `\n${heading.toUpperCase()}\n`;
      filled.forEach(([label, val]) => {
        text += `${label}: ${val}\n`;
      });
    }
  });
  return `${text}\nORBI-REF:${encodeOrbiRef(s)}`;
}

export function buildWhatsAppUrl(s: DiscoveryState, recipientDigits = ''): string {
  const cleanDigits = recipientDigits.replace(/\D/g, '');
  const msg = encodeURIComponent(buildWhatsAppMessage(s));
  return cleanDigits ? `https://wa.me/${cleanDigits}?text=${msg}` : `https://wa.me/?text=${msg}`;
}

export function analyzeDiscovery(s: DiscoveryState): AnalysisResult {
  let pts = 0;
  CATEGORIES.forEach((c) => {
    const v = s.cats[c.id];
    pts += c.weight * (v === 2 ? 1 : v === 1 ? 0.5 : 0);
  });

  let sizeFactor = SIZE_FACTORS[s.size ?? 2] ?? 1;
  if (s.ptype === 1 || s.ptype === 2) sizeFactor *= 1.2;
  if (s.ptype === 3) sizeFactor *= 1.3;

  const getMustFu = (id: string, q: number) => (s.cats[id] === 2 ? getFollowUpValue(s, id, q) : undefined);
  if (getMustFu('shades', 0) === 2) pts += 1;
  if (getMustFu('security', 1) === 2) pts += 1;
  if (getMustFu('climate', 1) === 2) pts += 1;
  if (getMustFu('av', 0) === 0 || getMustFu('av', 0) === 3) pts += 2;
  pts *= sizeFactor;

  const scope = pts < 4 ? 0 : pts < 9 ? 1 : pts < 15 ? 2 : 3;
  const bt = s.budget == null ? null : BUDGET_TIER_MAP[s.budget] ?? null;

  let score = 0;
  score += s.timeline != null ? [30, 24, 14, 6, 0][s.timeline] ?? 0 : 0;
  score += s.decider != null ? [20, 20, 10, 5][s.decider] ?? 0 : 0;
  score += s.budget == null ? 0 : s.budget === 7 ? 6 : 15;
  score += s.stage != null ? [20, 15, 12, 8][s.stage] ?? 0 : 0;
  score += s.consult != null ? [12, 15, 8][s.consult] ?? 0 : 0;

  const temp: AnalysisResult['temp'] = score >= 70 ? 'Hot' : score >= 45 ? 'Warm' : 'Early stage';

  const wired = (s.stage === 0 || s.stage === 1) && [0, 1, 2].includes(s.elec ?? -1);
  const platform =
    s.own === 1
      ? 'Renting: wireless, plug-and-play only. Nothing that needs rewiring or chasing walls; everything should move with them.'
      : wired
        ? 'Walls are open: ideal moment for a wired system. KNX keypads (Legrand, GM, Ekinex, Vibroxx; Basalte for premium) or Lutron, with conduits and deep back boxes planned now. Request electrical drawings before conduits close.'
        : s.elec === 4
          ? 'Electrical stage unknown: confirm on the first call. It decides wired KNX versus wireless retrofit.'
          : 'Finished walls: wireless retrofit (Doch, Cue, Legrand IoT) behind existing switch plates; go hybrid in any room being redone. Home Assistant bridge if unifying existing brands.';

  const hasPerson = (i: number) => (s.people || []).includes(i);
  const flags: string[] = [];
  const asks: string[] = [];

  if (bt != null && bt < scope) {
    flags.push(
      `Wish list (${TIERS[scope]}) exceeds stated budget (${TIERS[bt]}). Propose Phase 1 on must-haves${s.phase === 1 ? ', which they are open to' : ''}${s.emi === 0 ? ', and present Bajaj Finance EMI' : ''}.`
    );
  }
  if (bt != null && bt > scope) {
    flags.push(
      `Budget (${TIERS[bt]}) has headroom above current scope (${TIERS[scope]}). Opportunity to showcase designer keypads, Lutron shades, or media room acoustics.`
    );
  }
  if (s.budget === 7) {
    asks.push('Budget not given: present Essentials, Smart, and Premium packages side by side and observe preference.');
  }
  if (s.emi === 0 && !flags.some((x) => x.includes('EMI'))) {
    flags.push('Interested in EMI: lead with monthly instalment figures via Bajaj Finance.');
  }
  if (s.designer === 0) {
    asks.push(
      `Architect/designer involved${s.designerName ? ` (${s.designerName})` : ''}: connect early and invite them to the Experience Centre.`
    );
  }
  if (s.decider === 3 || s.decider === 2) {
    asks.push('Additional stakeholder signs off: identify them early and include them in the demo.');
  }
  if (hasPerson(2) || (s.painPoints || []).includes(6)) {
    flags.push('Elderly parents / night safety priority: demo SOS button, soft motion night-path lights, and clear tactile keypads.');
  }
  if (hasPerson(6) || (s.moments || []).includes(4) || (s.painPoints || []).includes(9)) {
    flags.push('Frequent travellers: highlight Away Mode presence simulation and mobile security alerts.');
  }
  if (hasPerson(3)) {
    asks.push('Pets at home: specify pet-immune motion sensors and verify roaming zones.');
  }
  if (hasPerson(5)) {
    flags.push('Work-from-home household: prioritize study lighting, acoustic isolation, and wired Cat6 Wi-Fi access points.');
  }
  if (s.tech === 2) {
    flags.push('Prefers simplicity: keep the demo anchored on wall keypad scenes rather than deep app menus.');
  }
  if ((s.painPoints || []).includes(0)) {
    flags.push('Pain point — switch clutter: lead the walkthrough with engraved glass/metal scene keypads.');
  }
  if ((s.painPoints || []).includes(3) && s.cats.water !== 2) {
    asks.push('Mentioned water tank overflow pain point — confirm if automated sump/overhead pump control should move to Must Have.');
  }
  if ((s.painPoints || []).includes(2) && s.cats.network !== 2) {
    asks.push('Reported Wi-Fi dead zones — recommend whole-home mesh/AP backbone before adding smart devices.');
  }
  if (s.elec === 4) asks.push('Confirm electrical readiness and request floor/electrical CAD drawings.');
  if (!(s.rooms || []).length) asks.push('Rooms not selected yet: walk through the floor plan room by room.');
  if (s.timeline === 0) flags.push('Urgent timeline (< 1 month): verify stock availability and installation slot before quoting.');
  if ((s.existing || []).includes(3) && (s.cats.security || 0) > 0) {
    asks.push('Existing CCTV present: check NVR brand/model for integration or upgrade.');
  }

  const incFu = (id: string, q: number, i: number) => {
    const v = getMustFu(id, q);
    return Array.isArray(v) && v.includes(i);
  };
  if ((getMustFu('energy', 0) === 2 || getMustFu('energy', 0) === 3) && getMustFu('energy', 1) === 0) {
    flags.push('Strong rooftop solar case: high monthly bill + open terrace. Model Enphase ROI and payback.');
  }
  if (getMustFu('energy', 2) === 0) asks.push('Wants solar battery backup: audit essential backup loads and inverter location.');
  if (getMustFu('shades', 2) === 1) flags.push('Curtain pockets not planned yet: coordinate pelmet depth & power points before false ceiling closes.');
  if (getMustFu('network', 2) === 0 && wired) flags.push('Open to Cat6 cabling: map ceiling AP drops alongside electrical conduits now.');
  if (getMustFu('lighting', 2) === 0) flags.push('Buying new light fittings: bundle architectural fixtures + dimming drivers in one proposal.');
  if (incFu('security', 2, 1)) asks.push('Domestic help access needed: demonstrate time-windowed PIN codes and entry logs.');
  if (incFu('climate', 2, 0) || incFu('climate', 2, 1)) flags.push('Interested in fresh air or heat pump water heating: involve Orbi HVAC specialists.');
  if (getMustFu('av', 0) === 0) asks.push('Dedicated theatre room: obtain room dimensions for acoustic treatment, throw distance, and seating.');
  if (incFu('water', 0, 2)) asks.push('Borewell & sump automation: check pump HP ratings and starter panel location.');

  const must = CATEGORIES.filter((c) => s.cats[c.id] === 2);
  const painPointMatches = (s.painPoints || []).map((id) => PAIN_POINTS[id]).filter(Boolean);

  return { pts, scope, bt, score, temp, platform, flags, asks, must, painPointMatches };
}

export function toFirestorePayload(
  s: DiscoveryState,
  user: User,
  options: { isNew: boolean; status?: PipelineStatus; advisorNotes?: string }
): Record<string, unknown> {
  const analysis = analyzeDiscovery(s);
  const followUpsForDb: Record<string, Record<string, number | number[]>> = {};
  Object.entries(s.fu || {}).forEach(([catId, qMap]) => {
    const inner: Record<string, number | number[]> = {};
    Object.entries(qMap || {}).forEach(([qIdx, val]) => {
      if (val != null) inner[String(qIdx)] = val;
    });
    if (Object.keys(inner).length > 0) followUpsForDb[catId] = inner;
  });

  const payload: Record<string, unknown> = {
    ownerId: user.uid,
    ownerEmail: (user.email || '').slice(0, 160),
    customerName: s.name.trim().slice(0, 120),
    customerPhone: s.phone.trim().slice(0, 32),
    people: (s.people || []).slice(0, 15),
    painPoints: (s.painPoints || []).slice(0, 20),
    cats: s.cats || {},
    followUps: followUpsForDb,
    moments: (s.moments || []).slice(0, 20),
    rooms: (s.rooms || []).slice(0, 25),
    control: (s.control || []).slice(0, 15),
    existing: (s.existing || []).slice(0, 15),
    leadScore: Math.min(100, Math.max(0, Math.round(analysis.score))),
    leadTemp: analysis.temp,
    scopeTier: analysis.scope,
    budgetTier: analysis.bt == null ? -1 : analysis.bt,
    status: options.status ?? 'new',
    advisorNotes: (options.advisorNotes ?? '').slice(0, 2000),
    orbiRef: encodeOrbiRef(s).slice(0, 4000),
    updatedAt: serverTimestamp(),
  };

  if (options.isNew) {
    payload.createdAt = serverTimestamp();
  }

  if (s.email.trim()) payload.customerEmail = s.email.trim().slice(0, 160);
  if (s.area.trim()) payload.area = s.area.trim().slice(0, 160);
  if (s.src != null) payload.sourceIndex = s.src;
  if (s.ptype != null) payload.propertyTypeIndex = s.ptype;
  if (s.size != null) payload.sizeIndex = s.size;
  if (s.stage != null) payload.stageIndex = s.stage;
  if (s.elec != null) payload.electricalIndex = s.elec;
  if (s.own != null) payload.ownershipIndex = s.own;
  if (s.tech != null) payload.techComfortIndex = s.tech;
  if (s.decider != null) payload.deciderIndex = s.decider;
  if (s.painPointNotes.trim()) payload.painPointNotes = s.painPointNotes.trim().slice(0, 1000);
  if (s.keypad != null) payload.keypadIndex = s.keypad;
  if (s.budget != null) payload.budgetIndex = s.budget;
  if (s.emi != null) payload.emiIndex = s.emi;
  if (s.phase != null) payload.phaseIndex = s.phase;
  if (s.timeline != null) payload.timelineIndex = s.timeline;
  if (s.designer != null) payload.designerIndex = s.designer;
  if (s.designerName.trim()) payload.designerName = s.designerName.trim().slice(0, 120);
  if (s.consult != null) payload.consultIndex = s.consult;
  if (s.notes.trim()) payload.notes = s.notes.trim().slice(0, 1500);

  return payload;
}

export function recordToDiscoveryState(rec: StoredDiscoveryRecord): DiscoveryState {
  const fu: FollowUpMap = {};
  Object.entries(rec.followUps || {}).forEach(([catId, qMap]) => {
    const inner: Record<number, number | number[]> = {};
    Object.entries(qMap || {}).forEach(([k, v]) => {
      inner[Number(k)] = v;
    });
    fu[catId] = inner;
  });

  return {
    name: rec.customerName || '',
    phone: rec.customerPhone || '',
    email: rec.customerEmail || '',
    area: rec.area || '',
    src: rec.sourceIndex,
    ptype: rec.propertyTypeIndex,
    size: rec.sizeIndex,
    stage: rec.stageIndex,
    elec: rec.electricalIndex,
    own: rec.ownershipIndex,
    people: rec.people || [],
    tech: rec.techComfortIndex,
    decider: rec.deciderIndex,
    painPoints: rec.painPoints || [],
    painPointNotes: rec.painPointNotes || '',
    cats: rec.cats || {},
    fu,
    moments: rec.moments || [],
    rooms: rec.rooms || [],
    control: rec.control || [],
    keypad: rec.keypadIndex,
    existing: rec.existing || [],
    budget: rec.budgetIndex,
    emi: rec.emiIndex,
    phase: rec.phaseIndex,
    timeline: rec.timelineIndex,
    designer: rec.designerIndex,
    designerName: rec.designerName || '',
    consult: rec.consultIndex,
    notes: rec.notes || '',
  };
}

function csvEscape(val: unknown): string {
  const str = String(val ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportBriefsToCSV(records: StoredDiscoveryRecord[]): string {
  const headers = [
    'Brief ID',
    'Customer Name',
    'Mobile',
    'Email',
    'Area / City',
    'Property',
    'Size',
    'Stage',
    'Electrical',
    'Lead Temp',
    'Lead Score',
    'Status',
    'Scope Tier',
    'Budget',
    'Timeline',
    'Pain Points',
    'Pain Point Notes',
    'Must Have Features',
    'Nice to Have Features',
    'Moments',
    'Designer',
    'Advisor Notes',
    'Updated At',
  ];

  const rows = records.map((rec) => {
    const s = recordToDiscoveryState(rec);
    const must = CATEGORIES.filter((c) => s.cats[c.id] === 2).map((c) => c.name).join('; ');
    const nice = CATEGORIES.filter((c) => s.cats[c.id] === 1).map((c) => c.name).join('; ');
    const pains = (s.painPoints || []).map((id) => PAIN_POINTS[id]?.title).filter(Boolean).join('; ');
    const moments = (s.moments || []).map((i) => MOMENTS[i]?.[0]).filter(Boolean).join('; ');
    const updated = rec.updatedAt && typeof rec.updatedAt.toDate === 'function'
      ? rec.updatedAt.toDate().toISOString()
      : '';

    return [
      rec.id,
      rec.customerName,
      rec.customerPhone,
      rec.customerEmail || '',
      rec.area || '',
      optionLabel('ptype', rec.propertyTypeIndex),
      optionLabel('size', rec.sizeIndex),
      optionLabel('stage', rec.stageIndex),
      optionLabel('elec', rec.electricalIndex),
      rec.leadTemp,
      rec.leadScore,
      rec.status,
      TIERS[rec.scopeTier] || '',
      optionLabel('budget', rec.budgetIndex),
      optionLabel('timeline', rec.timelineIndex),
      pains,
      rec.painPointNotes || '',
      must,
      nice,
      moments,
      rec.designerName || optionLabel('designer', rec.designerIndex),
      rec.advisorNotes || '',
      updated,
    ].map(csvEscape).join(',');
  });

  return [headers.map(csvEscape).join(','), ...rows].join('\r\n');
}
