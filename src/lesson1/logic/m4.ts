import type { Feedback } from './feedback';
import { okFeedback } from './feedback';
import { formatNumber } from './normalize';

export const M4_TIMES = [5, 15, 30] as const;
export type Unit = 's' | 'perc';

export interface M4Row {
  time: number;
  unit: Unit;
  /** A három mérés szövegesen (mezőértékek), az üres mező nem menthető. */
  measurements: [string, string, string];
  /** A diák saját számolt átlaga (nem kötelező, a hibatípushoz használjuk). */
  ownAverage: string;
}
export type M4Answer = M4Row[];

export function emptyM4(): M4Answer {
  return M4_TIMES.map((t) => ({ time: t, unit: 's' as Unit, measurements: ['', '', ''], ownAverage: '' }));
}

/** Csak nemnegatív egész szám 0–50 között. */
export function parseCount(raw: string): number | null {
  const t = raw.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 0 && n <= 50 ? n : null;
}

export interface RowStats {
  mean: number;
  spread: number;
}

export function rowStats(values: number[]): RowStats {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return { mean, spread: Math.max(...values) - Math.min(...values) };
}

export interface M4Result {
  complete: boolean;
  stats: Array<RowStats | null>;
  noisyRows: number[];
  points: 0 | 1;
  feedback: Feedback;
}

export function gradeM4(rows: M4Answer): M4Result {
  const parsed = rows.map((r) => r.measurements.map(parseCount));
  const complete = parsed.every((p) => p.every((v) => v !== null));
  const stats: Array<RowStats | null> = parsed.map((p) => (p.every((v) => v !== null) ? rowStats(p as number[]) : null));

  const noisyRows: number[] = [];
  stats.forEach((s, i) => {
    if (s && s.mean > 0 && s.spread > s.mean * 0.5) noisyRows.push(i);
  });

  if (!complete) {
    const msg = 'Töltsd ki mind a kilenc mérést (0–50 közötti egész szám).';
    return { complete, stats, noisyRows, points: 0, feedback: { ok: false, type: 'generic', level1: msg, level2: msg, teacherNote: 'Hiányos vagy érvénytelen mező.' } };
  }

  // jellegzetes hibák
  const units = new Set(rows.map((r) => r.unit));
  if (units.size > 1) {
    return {
      complete, stats, noisyRows, points: 0,
      feedback: {
        ok: false,
        type: 'mertekegyseg_keveres',
        level1: 'A táblázatban a dörzsölési időket nem ugyanabban a mértékegységben adtad meg. Mit jelent ez az összehasonlításnál?',
        level2: 'Írd át az összes időt ugyanarra a mértékegységre, majd nézd meg újra a sorokat.',
        teacherNote: 'A dörzsölési idő másodpercben és percben vegyesen szerepel.',
      },
    };
  }

  const firstOnly = rows.every((r, i) => {
    const first = parseCount(r.measurements[0]);
    const own = r.ownAverage.trim().replace(',', '.');
    return own !== '' && first !== null && Number(own) === first && stats[i] !== null && stats[i]!.spread > 0;
  });
  if (firstOnly) {
    return {
      complete, stats, noisyRows, points: 0,
      feedback: {
        ok: false,
        type: 'atlag_elso_meres',
        level1: 'Az átlagnak mindhárom mérésből kell számolódnia. Mit jelent az, ha mindhárom átlag egyenlő az első mérés értékével?',
        level2: 'Számold újra az átlagot a három mérésből, és hasonlítsd az eredményt a beírt számmal.',
        teacherNote: 'Mindenhol az első mérést írta be átlagnak.',
      },
    };
  }

  if (noisyRows.length > 0) {
    // A pont megvan (nem az eredmény nagysága számít), de a mérési bizonytalanságra rákérdezünk.
    return {
      complete, stats, noisyRows, points: 1,
      feedback: {
        ok: true,
        type: 'ok',
        level1: 'Az egy időtartamon belül a három mérés nagyon eltér. Mi lehet az oka? Gondolj arra, hogy a dörzsölés ideje mennyire volt egyforma.',
        level2: 'Az egy időtartamon belül a három mérés nagyon eltér. Mi lehet az oka? Gondolj arra, hogy a dörzsölés ideje mennyire volt egyforma.',
        teacherNote: 'Nagy szórás (> az átlag 50%-a) legalább egy sorban.',
      },
    };
  }

  return { complete, stats, noisyRows, points: 1, feedback: okFeedback('A mérési táblázat kész.') };
}

export function describeStats(s: RowStats | null): string {
  return s ? `átlag: ${formatNumber(s.mean)}, szórás: ${formatNumber(s.spread, 0)}` : '–';
}
