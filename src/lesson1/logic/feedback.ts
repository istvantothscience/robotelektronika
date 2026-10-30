export type ErrorType =
  | 'inverz_besorolas'
  | 'fel_megoldas'
  | 'atlag_elso_meres'
  | 'egyenlo_mindket_tolto'
  | 'mertekegyseg_keveres'
  | 'generic';

/**
 * A visszajelzés első két szintje sosem mondja ki a helyes választ.
 * A 3. szint kizárólag a tanári nézetben látszik.
 */
export interface Feedback {
  ok: boolean;
  type: ErrorType | 'ok';
  level1: string;
  level2: string;
  teacherNote: string;
}

export function okFeedback(message = 'Rendben, ez a küldetés teljesült.'): Feedback {
  return { ok: true, type: 'ok', level1: message, level2: message, teacherNote: '' };
}

/** Hányadik próbálkozás után melyik tippet kapja a diák (1. próba → 1. szint, utána 2. szint). */
export function visibleHint(feedback: Feedback, attempts: number): string {
  if (feedback.ok) return feedback.level1;
  return attempts <= 1 ? feedback.level1 : feedback.level2;
}
