import type { Feedback } from './feedback';
import { okFeedback } from './feedback';

export type Choice = 'vezeto' | 'szigetelo';

export interface DataCard {
  id: string;
  text: string;
  short: string;
}

/** A kártyák szövege; a kulcs külön, hogy a diák felületére ne kerüljön. */
export const M2_CARDS: readonly DataCard[] = [
  { id: 'A', short: 'műanyag vonalzó', text: 'Töltött műanyag vonalzó végén a töltés egy percig a helyén maradt, nem folyt el.' },
  { id: 'B', short: 'rézhuzal', text: 'Megfogott rézhuzalon a töltés másodpercek alatt elfolyt.' },
  { id: 'C', short: 'papírlap', text: 'Száraz papírlapon a töltés tíz percig megmaradt.' },
  { id: 'D', short: 'alumíniumfólia', text: 'Alumíniumfólián a töltés gyorsan eloszlott.' },
  { id: 'E', short: 'üvegrúd', text: 'Üvegrúdon a töltés egy percig a helyén maradt.' },
  { id: 'F', short: 'emberi test', text: 'Emberi testen a töltés azonnal elfolyt.' },
  { id: 'G', short: 'grafitceruza', text: 'Grafitceruzán a töltés gyorsan elfolyt.' },
  { id: 'H', short: 'porcelán', text: 'Porcelánon a töltés hosszú ideig megmaradt.' },
];

const M2_KEY: Record<string, Choice> = {
  A: 'szigetelo',
  B: 'vezeto',
  C: 'szigetelo',
  D: 'vezeto',
  E: 'szigetelo',
  F: 'vezeto',
  G: 'vezeto',
  H: 'szigetelo',
};

export const M2_MIN_CORRECT = 7;
export const M2_MIN_REASON = 10;

export interface M2Answer {
  choice: Choice | null;
  reason: string;
}
export type M2Answers = Record<string, M2Answer>;

export interface M2Result {
  correctCount: number;
  wrongCount: number;
  wrongIds: string[];
  unclassified: number;
  shortReasons: string[];
  points: 0 | 1;
  feedback: Feedback;
}

export function emptyM2(): M2Answers {
  return Object.fromEntries(M2_CARDS.map((c) => [c.id, { choice: null, reason: '' }]));
}

export function gradeM2(answers: M2Answers): M2Result {
  const wrongIds: string[] = [];
  let correctCount = 0;
  let unclassified = 0;
  const shortReasons: string[] = [];

  for (const card of M2_CARDS) {
    const a = answers[card.id] ?? { choice: null, reason: '' };
    if (a.choice === null) {
      unclassified++;
      wrongIds.push(card.id);
    } else if (a.choice === M2_KEY[card.id]) {
      correctCount++;
    } else {
      wrongIds.push(card.id);
    }
    if (a.reason.trim().length < M2_MIN_REASON) shortReasons.push(card.id);
  }

  const reasonsOk = shortReasons.length === 0;
  const passed = correctCount >= M2_MIN_CORRECT && reasonsOk;
  const classified = M2_CARDS.length - unclassified;

  if (passed) {
    return { correctCount, wrongCount: wrongIds.length, wrongIds, unclassified, shortReasons, points: 1, feedback: okFeedback('Az adatkártyák besorolása és az indoklások rendben vannak.') };
  }

  // A besorolás rendben, csak az indoklás hiányos: nem hibatípus, hanem teendő.
  if (correctCount >= M2_MIN_CORRECT && !reasonsOk) {
    const msg = `Minden besoroláshoz írj legalább ${M2_MIN_REASON} karakteres indoklást. Hiányzik: ${shortReasons.join(', ')}.`;
    return { correctCount, wrongCount: wrongIds.length, wrongIds, unclassified, shortReasons, points: 0, feedback: { ok: false, type: 'generic', level1: msg, level2: msg, teacherNote: 'A besorolás ≥7 helyes, de az indoklás rövid.' } };
  }

  const allWrong = classified === M2_CARDS.length && correctCount === 0;
  const firstTwoOnly =
    ['A', 'B'].every((id) => answers[id]?.choice === M2_KEY[id]) &&
    M2_CARDS.slice(2).every((c) => (answers[c.id]?.reason ?? '').trim().length < M2_MIN_REASON);

  const firstWrong = M2_CARDS.find((c) => wrongIds.includes(c.id) && answers[c.id]?.choice !== null) ?? M2_CARDS.find((c) => wrongIds.includes(c.id))!;
  const second = M2_CARDS.find((c) => c.id !== firstWrong.id && wrongIds.includes(c.id)) ?? M2_CARDS.find((c) => c.id !== firstWrong.id)!;

  if (allWrong) {
    return {
      correctCount, wrongCount: wrongIds.length, wrongIds, unclassified, shortReasons, points: 0,
      feedback: {
        ok: false,
        type: 'inverz_besorolas',
        level1: `A(z) ${firstWrong.id} kártyán ez áll: „${firstWrong.text}” Mit jelent ez a töltés mozgására nézve?`,
        level2: `Hasonlítsd össze az ${firstWrong.id} és a ${second.id} kártyát: melyik adat utal arra, hogy a töltés el tud mozogni?`,
        teacherNote: 'Mind a nyolc besorolás fordított: a „megmarad” és az „elfolyik” jelentését cserélte fel.',
      },
    };
  }

  if (firstTwoOnly && correctCount < M2_MIN_CORRECT) {
    return {
      correctCount, wrongCount: wrongIds.length, wrongIds, unclassified, shortReasons, points: 0,
      feedback: {
        ok: false,
        type: 'fel_megoldas',
        level1: 'Az első két kártyával elkészültél. Mi alapján döntenél a többinél? Írd le röviden mindegyiknél.',
        level2: 'Minden kártyán van egy időadat vagy egy sebességre utaló szó. Ezt keresd meg, és ezt írd az indoklásba.',
        teacherNote: 'Csak az első két kártyát oldotta meg, a többit nem indokolta.',
      },
    };
  }

  return {
    correctCount, wrongCount: wrongIds.length, wrongIds, unclassified, shortReasons, points: 0,
    feedback: {
      ok: false,
      type: 'generic',
      level1: `${wrongIds.length} kártya besorolása nem stimmel. Nézd meg újra az adatokat, és keresd meg, melyik megfigyelés mond ellent a választásodnak.`,
      level2: `Kezdd a(z) ${firstWrong.id} kártyával: mit mutat az idő, amíg a töltés a helyén marad, vagy amíg elfolyik?`,
      teacherNote: `Helyes: ${correctCount}/8. Hibás vagy hiányzó: ${wrongIds.join(', ')}.`,
    },
  };
}
