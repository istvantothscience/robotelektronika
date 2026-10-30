import type { Feedback } from './feedback';
import { okFeedback } from './feedback';
import { containsAny } from './normalize';

export const M3_MIN_TEXT = 25;
export interface M3Answer {
  drew: boolean;
  text: string;
}
export interface M3Result {
  points: 0 | 1;
  feedback: Feedback;
}

const KEY_PHRASES = ['taszít', 'azonos töltés', 'lufi nélkül'];

export function gradeM3(a: M3Answer): M3Result {
  const longEnough = a.text.trim().length >= M3_MIN_TEXT;
  if (a.drew && longEnough && containsAny(a.text, KEY_PHRASES)) {
    return { points: 1, feedback: okFeedback('A rajz és a magyarázat rendben van.') };
  }
  const missing: string[] = [];
  if (!a.drew) missing.push('Jelöld, hogy megrajzoltad a hajat.');
  if (!longEnough) missing.push(`Írj legalább ${M3_MIN_TEXT} karakteres magyarázatot.`);
  const lead = missing.length ? `${missing.join(' ')} ` : '';
  return {
    points: 0,
    feedback: {
      ok: false,
      type: 'generic',
      level1: `${lead}Mi történik a hajszálakkal, miután a lufi rájuk vitte a töltést? Gondolj arra, mit tesz egymással két azonos töltésű test.`.trim(),
      level2: 'Hasonlítsd össze, mi van a hajszálakon a lufi előtt és után, és írd le, miért nem áll fel a haj a lufi nélkül.',
      teacherNote: 'Hiányzik a „taszít” / „azonos töltés” / „lufi nélkül” magyarázat, vagy a jelölő/hossz.',
    },
  };
}
