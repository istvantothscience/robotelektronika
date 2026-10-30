/**
 * 1. óra – „Elektromos állapot” (10. évfolyam, Elektrosztatika) – pontkalibráció.
 * Az összeg fix: 7 pont. Tanári: órai munka 2 + M1 1. Diák (játék): M2 1, két választható (M3/M4/M5) 1–1, kilépőjegy 1.
 */
export const LESSON_KEY = 'elektromos-allapot-ora-01';
export const LESSON_CAP = 7;
export const OPTIONAL_LIMIT = 2;

export type ComponentId =
  | 'ORAI_MUNKA'
  | 'M1_szimulacio'
  | 'M2_adatkartya'
  | 'M3_hajrajz'
  | 'M4_meres'
  | 'M5_hibas_erveles'
  | 'KILEPOJEGY';

export type ComponentSource = 'teacher' | 'app';

export interface ComponentConfig {
  id: ComponentId;
  label: string;
  max: number;
  source: ComponentSource;
  optional: boolean;
}

export const COMPONENTS: readonly ComponentConfig[] = [
  { id: 'ORAI_MUNKA', label: 'Órai munka', max: 2, source: 'teacher', optional: false },
  { id: 'M1_szimulacio', label: 'M1 – Szimuláció', max: 1, source: 'teacher', optional: false },
  { id: 'M2_adatkartya', label: 'M2 – Adatkártyák', max: 1, source: 'app', optional: false },
  { id: 'M3_hajrajz', label: 'M3 – Hajrajzoló', max: 1, source: 'app', optional: true },
  { id: 'M4_meres', label: 'M4 – Töltésszétválasztási mérés', max: 1, source: 'app', optional: true },
  { id: 'M5_hibas_erveles', label: 'M5 – Hibás érvelés javítása', max: 1, source: 'app', optional: true },
  { id: 'KILEPOJEGY', label: 'Kilépőjegy', max: 1, source: 'app', optional: false },
];

export const OPTIONAL_COMPONENTS: readonly ComponentId[] = COMPONENTS.filter((c) => c.optional).map((c) => c.id);

export function componentMax(id: ComponentId): number {
  return COMPONENTS.find((c) => c.id === id)?.max ?? 0;
}

/** Pontplafon: a komponens maximuma fölé sosem engedünk, negatívat sem. */
export function clampPoints(id: ComponentId, points: number): number {
  if (!Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(componentMax(id), Math.floor(points)));
}

export const APP_COMPONENT_IDS: readonly ComponentId[] = COMPONENTS.filter((c) => c.source === 'app').map((c) => c.id);
