import type { Feedback } from './feedback';
import { okFeedback } from './feedback';
import { containsAny } from './normalize';

export interface Statement {
  id: 'a' | 'b' | 'c';
  text: string;
}

export const M5_STATEMENTS: readonly Statement[] = [
  { id: 'a', text: 'A dörzsölés új töltést hoz létre, ezért lesz a lufi negatív.' },
  { id: 'b', text: 'A semleges test nem vonzódik a töltött testhez, mert nincs töltése.' },
  { id: 'c', text: 'A pozitív és a negatív töltés azért különbözik, mert más a tömegük.' },
];

/**
 * A kulcs: a vonalzó–reszelék kísérlettel közvetlenül szembemenő állítás (b).
 * Mindhárom állítás hibás; a kiválasztás azt méri, melyiket cáfolja a közös kísérlet.
 */
export const M5_KEY: Statement['id'] = 'b';
export const M5_MIN_FIELD = 15;

export interface M5Answer {
  chosen: Statement['id'] | null;
  claim: string;
  evidence: string;
  reasoning: string;
}
export interface M5Result {
  points: 0 | 1;
  feedback: Feedback;
}

export function emptyM5(): M5Answer {
  return { chosen: null, claim: '', evidence: '', reasoning: '' };
}

export function gradeM5(a: M5Answer): M5Result {
  const fieldsOk = [a.claim, a.evidence, a.reasoning].every((f) => f.trim().length >= M5_MIN_FIELD);

  if (a.chosen !== null && a.chosen !== M5_KEY) {
    return {
      points: 0,
      feedback: {
        ok: false,
        type: 'generic',
        level1: 'Az egyik állítás a kísérlet alapján nem igaz. Gondolj arra, mit mutatott a vonalzó–reszelék kísérlet.',
        level2: 'Mi történik a semleges papírral a töltött vonalzó közelében?',
        teacherNote: `A(z) ${a.chosen}) állítást jelölte; a kulcs a ${M5_KEY}) (a közös kísérlet ezt cáfolja közvetlenül).`,
      },
    };
  }

  if (a.chosen === null) {
    const msg = 'Előbb jelöld meg, melyik állítás mond ellent a kísérleteknek.';
    return { points: 0, feedback: { ok: false, type: 'generic', level1: msg, level2: msg, teacherNote: 'Nincs kiválasztott állítás.' } };
  }

  // jellegzetes félreértés: „a töltés nem változik / marad” a dörzsölés után
  const all = `${a.claim} ${a.evidence} ${a.reasoning}`;
  if (containsAny(all, ['töltése nem változik', 'töltés nem változik', 'töltése változatlan']) && !containsAny(all, ['szétvál', 'átmegy', 'átvándorol', 'átkerül'])) {
    return {
      points: 0,
      feedback: {
        ok: false,
        type: 'egyenlo_mindket_tolto',
        level1: 'Ha a pulóver töltése nem változik, honnan kerülhet töltés a lufira? Gondolj a két test együttes töltésére.',
        level2: 'Hasonlítsd össze a két test töltését a dörzsölés előtt és után: mi lehet az összegük?',
        teacherNote: 'A töltésmegmaradást félreérti: a pulóver töltését változatlannak írja.',
      },
    };
  }

  if (!fieldsOk) {
    const msg = `Mindhárom mezőt (állítás, bizonyíték, indoklás) töltsd ki legalább ${M5_MIN_FIELD} karakterrel.`;
    return { points: 0, feedback: { ok: false, type: 'generic', level1: msg, level2: msg, teacherNote: 'A CER-mezők valamelyike rövid.' } };
  }

  return { points: 1, feedback: okFeedback('A javított állítás és az érvelés kész.') };
}
