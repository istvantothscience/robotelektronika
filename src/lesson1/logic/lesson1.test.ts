import { describe, expect, it } from 'vitest';
import { APP_COMPONENT_IDS, COMPONENTS, LESSON_CAP, OPTIONAL_COMPONENTS, OPTIONAL_LIMIT, clampPoints } from '../config';
import { nameKey, normalizeText, formatNumber } from './normalize';
import { emptyM2, gradeM2, M2_CARDS, type M2Answers, type Choice } from './m2';
import { gradeM3 } from './m3';
import { emptyM4, gradeM4, parseCount } from './m4';
import { emptyM5, gradeM5 } from './m5';
import { gradeExit } from './exitTicket';
import { togglePick } from './optionalPick';
import { visibleHint } from './feedback';

const KEY: Record<string, Choice> = { A: 'szigetelo', B: 'vezeto', C: 'szigetelo', D: 'vezeto', E: 'szigetelo', F: 'vezeto', G: 'vezeto', H: 'szigetelo' };
const REASON = 'ez az adat ezt mutatja';

function m2With(f: (id: string) => Choice | null, reason = REASON): M2Answers {
  const a = emptyM2();
  for (const c of M2_CARDS) a[c.id] = { choice: f(c.id), reason };
  return a;
}
const flip = (c: Choice): Choice => (c === 'vezeto' ? 'szigetelo' : 'vezeto');

describe('pontkalibráció', () => {
  it('az elérhető maximum 7 (a három választhatóból csak kettő számít)', () => {
    const fixed = COMPONENTS.filter((c) => !c.optional).reduce((s, c) => s + c.max, 0);
    expect(fixed + OPTIONAL_LIMIT).toBe(LESSON_CAP);
    expect(LESSON_CAP).toBe(7);
  });
  it('tanári pont 3 (órai munka 2 + M1 1), app-pont legfeljebb 4', () => {
    const teacher = COMPONENTS.filter((c) => c.source === 'teacher').reduce((s, c) => s + c.max, 0);
    expect(teacher).toBe(3);
    expect(LESSON_CAP - teacher).toBe(4);
  });
  it('az app-forrású összeg legfeljebb 4 a választható limittel (M2 + 2 + kilépőjegy)', () => {
    const optMax = OPTIONAL_COMPONENTS.length * 1;
    expect(optMax).toBe(3);
    const appMax = COMPONENTS.filter((c) => c.source === 'app' && !c.optional).reduce((s, c) => s + c.max, 0) + OPTIONAL_LIMIT;
    expect(appMax).toBeLessThanOrEqual(4);
    expect(APP_COMPONENT_IDS).not.toContain('ORAI_MUNKA');
    expect(OPTIONAL_LIMIT).toBeLessThanOrEqual(2);
  });
  it('a plafon: a komponens maximuma fölé nem enged', () => {
    expect(clampPoints('M2_adatkartya', 5)).toBe(1);
    expect(clampPoints('M2_adatkartya', -3)).toBe(0);
    expect(clampPoints('ORAI_MUNKA', 9)).toBe(2);
    expect(clampPoints('KILEPOJEGY', Number.NaN)).toBe(0);
  });
  it('legfeljebb két választható jelölhető, a harmadik letiltott', () => {
    let p = togglePick([], 'M3_hajrajz');
    p = togglePick(p, 'M4_meres');
    p = togglePick(p, 'M5_hibas_erveles');
    expect(p).toEqual(['M3_hajrajz', 'M4_meres']);
    expect(togglePick(p, 'M4_meres')).toEqual(['M3_hajrajz']);
  });
});

describe('normalizálás', () => {
  it('kis-nagybetű, ékezet, névsorrend', () => {
    expect(normalizeText('  ÁRVÍZTŰRŐ  tükörfúrógép ')).toBe('arvizturo tukorfurogep');
    expect(nameKey('Kiss Anna')).toBe(nameKey('anna KISS'));
    expect(nameKey('Tóth Éva')).toBe(nameKey('eva toth'));
  });
  it('tizedesvessző és valódi mínuszjel', () => {
    expect(formatNumber(3.5)).toBe('3,5');
    expect(formatNumber(-2)).toBe('−2,0');
  });
});

describe('M2 – adatkártyák', () => {
  it('a fizikai kulcs: A, C, E, H szigetelő; B, D, F, G vezető', () => {
    const r = gradeM2(m2With((id) => KEY[id]));
    expect(r.points).toBe(1);
    expect(r.correctCount).toBe(8);
  });
  it('7 helyes + indoklás elég', () => {
    const r = gradeM2(m2With((id) => (id === 'H' ? flip(KEY[id]) : KEY[id])));
    expect(r.points).toBe(1);
  });
  it('6 helyes nem elég, a hibás kártyák számát mondja, a megoldást nem', () => {
    const r = gradeM2(m2With((id) => (id === 'G' || id === 'H' ? flip(KEY[id]) : KEY[id])));
    expect(r.points).toBe(0);
    expect(r.wrongCount).toBe(2);
    expect(r.feedback.level1).not.toMatch(/vezető|szigetelő/i);
  });
  it('rövid indoklás pontot nem ad', () => {
    const r = gradeM2(m2With((id) => KEY[id], 'rövid'));
    expect(r.points).toBe(0);
  });
  it('inverz_besorolas: minden besorolás fordított', () => {
    const r = gradeM2(m2With((id) => flip(KEY[id])));
    expect(r.feedback.type).toBe('inverz_besorolas');
    expect(r.points).toBe(0);
    expect(r.feedback.level1).not.toMatch(/szigetelő|vezető/i);
    expect(r.feedback.level2).not.toMatch(/szigetelő|vezető/i);
  });
  it('fel_megoldas: csak az első két kártya helyes, a többi nincs indokolva', () => {
    const a = emptyM2();
    a.A = { choice: 'szigetelo', reason: REASON };
    a.B = { choice: 'vezeto', reason: REASON };
    const r = gradeM2(a);
    expect(r.feedback.type).toBe('fel_megoldas');
  });
  it('generic: más hibás válasz', () => {
    const r = gradeM2(m2With((id) => (['A', 'B', 'C', 'D'].includes(id) ? flip(KEY[id]) : KEY[id])));
    expect(r.feedback.type).toBe('generic');
  });
  it('dupla beküldés ugyanazt az eredményt adja (nincs hatás az állapotra)', () => {
    const a = m2With((id) => KEY[id]);
    expect(gradeM2(a).points).toBe(gradeM2(a).points);
  });
});

describe('M3 – hajrajzoló', () => {
  it('pont: jelölő + legalább 25 karakter + kulcskifejezés', () => {
    expect(gradeM3({ drew: true, text: 'A hajszálak azonos töltést kapnak, ezért taszítják egymást.' }).points).toBe(1);
    expect(gradeM3({ drew: true, text: 'Lufi nélkül nincs töltés a hajszálakon, ezért lelóg.' }).points).toBe(1);
  });
  it('nincs pont jelölő, rövid szöveg vagy kulcskifejezés nélkül', () => {
    expect(gradeM3({ drew: false, text: 'azonos töltés taszít és ez elég hosszú szöveg' }).points).toBe(0);
    expect(gradeM3({ drew: true, text: 'taszít' }).points).toBe(0);
    const r = gradeM3({ drew: true, text: 'A haj felállt, mert a lufi megérintette azt.' });
    expect(r.points).toBe(0);
    expect(r.feedback.level1).not.toMatch(/taszít/i);
  });
});

describe('M4 – mérés', () => {
  const full = () => {
    const rows = emptyM4();
    rows[0].measurements = ['4', '5', '6'];
    rows[1].measurements = ['10', '11', '12'];
    rows[2].measurements = ['20', '22', '21'];
    return rows;
  };
  it('csak nemnegatív egész szám fogadható el 0–50', () => {
    expect(parseCount('7')).toBe(7);
    expect(parseCount('')).toBeNull();
    expect(parseCount('-1')).toBeNull();
    expect(parseCount('2,5')).toBeNull();
    expect(parseCount('51')).toBeNull();
  });
  it('átlag és szórás (max − min)', () => {
    const r = gradeM4(full());
    expect(r.stats[0]).toEqual({ mean: 5, spread: 2 });
    expect(r.points).toBe(1);
  });
  it('üres mező nem menthető', () => {
    const rows = full();
    rows[1].measurements[2] = '';
    expect(gradeM4(rows).points).toBe(0);
  });
  it('a pont nem függ az eredmény nagyságától', () => {
    const rows = emptyM4();
    rows.forEach((r) => (r.measurements = ['0', '0', '0']));
    expect(gradeM4(rows).points).toBe(1);
  });
  it('nagy szórás: pont jár, de a visszajelzés a bizonytalanságra kérdez rá, okot nem mond', () => {
    const rows = full();
    rows[0].measurements = ['1', '10', '3'];
    const r = gradeM4(rows);
    expect(r.points).toBe(1);
    expect(r.noisyRows).toContain(0);
    expect(r.feedback.level1).toMatch(/Mi lehet az oka/);
  });
  it('atlag_elso_meres', () => {
    const rows = full();
    rows[0].ownAverage = '4';
    rows[1].ownAverage = '10';
    rows[2].ownAverage = '20';
    const r = gradeM4(rows);
    expect(r.feedback.type).toBe('atlag_elso_meres');
    expect(r.points).toBe(0);
  });
  it('mertekegyseg_keveres', () => {
    const rows = full();
    rows[2].unit = 'perc';
    const r = gradeM4(rows);
    expect(r.feedback.type).toBe('mertekegyseg_keveres');
  });
});

describe('M5 – hibás érvelés', () => {
  const cer = { claim: 'A semleges test is vonzódik a töltötthöz.', evidence: 'A papírreszelék felugrik a vonalzóra.', reasoning: 'A töltött test a semleges testben töltéseket tol el, ezért vonzza.' };
  it('helyes kiválasztás + három kitöltött mező = pont', () => {
    expect(gradeM5({ chosen: 'b', ...cer }).points).toBe(1);
  });
  it('rossz állítás kiválasztva: tipp, a megoldás nélkül', () => {
    const r = gradeM5({ chosen: 'a', ...cer });
    expect(r.points).toBe(0);
    expect(r.feedback.level1).not.toMatch(/\bb\)|polariz/i);
    expect(r.feedback.level2).toMatch(/semleges papír/);
  });
  it('rövid CER-mező nem ad pontot', () => {
    expect(gradeM5({ chosen: 'b', claim: 'rövid', evidence: cer.evidence, reasoning: cer.reasoning }).points).toBe(0);
  });
  it('nincs kiválasztás', () => {
    expect(gradeM5({ ...emptyM5(), ...cer }).points).toBe(0);
  });
  it('egyenlo_mindket_tolto: a pulóver töltése nem változik', () => {
    const r = gradeM5({ chosen: 'b', claim: 'A pulóver töltése nem változik dörzsöléskor.', evidence: 'A lufi mégis töltött lett a dörzsölés után.', reasoning: 'Mert a lufi új töltést kapott valahonnan.' });
    expect(r.feedback.type).toBe('egyenlo_mindket_tolto');
    expect(r.points).toBe(0);
  });
});

describe('Kilépőjegy', () => {
  it('mindkét kérdés helyes = pont', () => {
    const r = gradeExit({ q1: 'Taszítják egymást, mert azonos töltésűek.', q2: 'A test semleges, mert mindkettőt vonzza.' });
    expect(r.points).toBe(1);
  });
  it('részenként ellenőrizhető', () => {
    const r = gradeExit({ q1: 'Taszítják egymást.', q2: 'A test pozitív.' });
    expect(r.q1Ok).toBe(true);
    expect(r.q2Ok).toBe(false);
    expect(r.points).toBe(0);
    expect(r.feedback.level1).toMatch(/pozitív lenne/);
    expect(r.feedback.level1).not.toMatch(/semleges/i);
  });
  it('a szint 2 sem mondja ki a megoldást', () => {
    const r = gradeExit({ q1: 'vonzzák', q2: 'negatív' });
    expect(r.feedback.level2).not.toMatch(/taszít|semleges/i);
  });
});

describe('visszajelzési szintek', () => {
  it('1. próba → 1. szint, később 2. szint', () => {
    const fb = gradeM2(m2With((id) => flip(KEY[id]))).feedback;
    expect(visibleHint(fb, 1)).toBe(fb.level1);
    expect(visibleHint(fb, 2)).toBe(fb.level2);
    expect(visibleHint(fb, 5)).toBe(fb.level2);
  });
});
