import type { Feedback } from './feedback';
import { okFeedback } from './feedback';
import { containsAny } from './normalize';

export interface ExitAnswer {
  q1: string;
  q2: string;
}
export interface ExitResult {
  q1Ok: boolean;
  q2Ok: boolean;
  points: 0 | 1;
  feedback: Feedback;
}

export const EXIT_QUESTIONS = {
  q1: 'Két lufit ugyanúgy dörzsölsz a hajon. Mit jósolsz, hogyan viselkednek egymással? Miért?',
  q2: 'Egy ismeretlen test vonzza a töltött üvegrudat és a töltött műanyag rudat is. Mit következtetsz a testről?',
} as const;

export function gradeExit(a: ExitAnswer): ExitResult {
  const q1Ok = containsAny(a.q1, ['taszít']);
  const q2Ok = containsAny(a.q2, ['semleges', 'töltetlen', 'nincs töltése', 'nincs töltés']);
  if (q1Ok && q2Ok) {
    return { q1Ok, q2Ok, points: 1, feedback: okFeedback('Mindkét kérdésre jó választ adtál.') };
  }

  const parts1: string[] = [];
  const parts2: string[] = [];
  if (!q1Ok) {
    parts1.push('1. kérdés: Mit tesz egymással két azonos módon feltöltött test?');
    parts2.push('1. kérdés: Hasonlítsd össze a két lufi töltését: egyező vagy ellentétes? Mit okoz ez?');
  }
  if (!q2Ok) {
    const positive = containsAny(a.q2, ['pozitív']) && !containsAny(a.q2, ['negatív']);
    parts1.push(positive
      ? '2. kérdés: Ha a test pozitív lenne, mit csinálna a pozitív üvegrúddal?'
      : '2. kérdés: Mit tennének a rudak egy töltött testtel, és mit egy töltetlennel?');
    parts2.push('2. kérdés: Melyik típusú testet vonzza mindkét előjelű töltött test?');
  }
  return {
    q1Ok, q2Ok, points: 0,
    feedback: {
      ok: false,
      type: 'generic',
      level1: parts1.join(' '),
      level2: parts2.join(' '),
      teacherNote: `Q1: ${q1Ok ? 'jó' : 'hibás'}, Q2: ${q2Ok ? 'jó' : 'hibás'}.`,
    },
  };
}
