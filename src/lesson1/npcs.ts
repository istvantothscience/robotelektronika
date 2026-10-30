import type { ComponentId } from './config';

/**
 * Az 1. óra szereplői: robotok az Alsóvárosban. Mindegyik más feladatot ad.
 * A szereplők visszajelzést és kérdést adnak, a megoldást sosem mondják ki.
 */
export interface LessonNpc {
  id: string;
  name: string;
  role: string;
  /** Hex szín (UI és a világ jelzőfénye). */
  color: string;
  colorHex: number;
  component: ComponentId;
  title: string;
  intro: string[];
  done: string;
}

export const LESSON_NPCS: readonly LessonNpc[] = [
  {
    id: 'npc-szikra',
    name: 'Szikra (VOLT-7)',
    role: 'Karbantartó segédautomata',
    color: '#22d3ee',
    colorHex: 0x22d3ee,
    component: 'M1_szimulacio',
    title: 'Szimuláció: lufi és statikus elektromosság',
    intro: [
      'Mielőtt bármit bemérnénk, nézzük meg kicsiben, mi történik a töltésekkel. Nyisd meg a szimulációt, és próbáld ki a lufit a falon.',
      'Rajzold le a töltéseket a füzetedbe, és írd fel egy táblázatba, mi történik, ha távolabb viszed a lufit.',
    ],
    done: 'Megvan a megfigyelés. A pontot a tanár írja be.',
  },
  {
    id: 'npc-szortir',
    name: 'Szortír',
    role: 'Hulladékválogató robot',
    color: '#f59e0b',
    colorHex: 0xf59e0b,
    component: 'M2_adatkartya',
    title: 'Adatkártyák: anyagok besorolása',
    intro: [
      'Ezek a kártyák a roncstelepi mérések eredményei, az anyag nevét viszont lekopták róluk.',
      'Két ládám van: „a töltés elfolyik” és „a töltés a helyén marad”. Sorold be a kártyákat, és mindegyikhez írj egy mondatos indoklást.',
    ],
    done: 'Szép munka, a ládák rendben vannak.',
  },
  {
    id: 'npc-kefe',
    name: 'Kefe',
    role: 'Régi fodrász-automata',
    color: '#a78bfa',
    colorHex: 0xa78bfa,
    component: 'M3_hajrajz',
    title: 'Hajrajzoló: miért áll fel a haj?',
    intro: [
      'Fölöttem lufik lebegtek, mielőtt leállítottak. A hajszálak felálltak, de fogalmam sincs, miért.',
      'Rajzold le a hajszálakat a lufi előtt és után a füzetedbe (fényképet is csatolhatsz), majd írj két mondatot.',
    ],
    done: 'Most már értem, miért állt fel a haj.',
  },
  {
    id: 'npc-mero',
    name: 'Mérő',
    role: 'Mérőállomás-robot',
    color: '#34d399',
    colorHex: 0x34d399,
    component: 'M4_meres',
    title: 'Töltésszétválasztási mérés',
    intro: [
      'Egy mérés kevés. Dörzsölj meg egy vonalzót 5, 15 és 30 másodpercig, és számold meg, hány papírreszelék-darab emelkedik fel.',
      'Mindegyik időt háromszor mérd meg. Az átlagot és a szórást kiszámolom, de az átlagot előbb te is megbecsülheted.',
    ],
    done: 'A mérési táblázat kész.',
  },
  {
    id: 'npc-biro',
    name: 'Bíró',
    role: 'Hibakereső ellenőr-automata',
    color: '#fb7185',
    colorHex: 0xfb7185,
    component: 'M5_hibas_erveles',
    title: 'Hibás érvelés javítása',
    intro: [
      'Három állítást találtam a roncstelep archívumában. Egyik sem teljesen jó.',
      'Válaszd ki azt, amelyik a közös kísérletünknek mond ellent, és írd meg a javítottat: állítás, bizonyíték, indoklás.',
    ],
    done: 'A javított állítás megállja a helyét.',
  },
  {
    id: 'npc-kapuor',
    name: 'Kapuőr',
    role: 'Felvonó-zsilip őre',
    color: '#c084fc',
    colorHex: 0xc084fc,
    component: 'KILEPOJEGY',
    title: 'Kilépőjegy',
    intro: [
      'A felvonóhoz csak az jut, aki a saját szavaival is el tudja mondani, amit ma tanult.',
      'Két kérdésem van. Egyedül válaszolj, a füzeted nélkül.',
    ],
    done: 'A zsilip kinyílt, a jegyed érvényes.',
  },
];

export function npcForComponent(c: ComponentId): LessonNpc | undefined {
  return LESSON_NPCS.find((n) => n.component === c);
}

/** A világbeli jelzőfény azonosítója → feladat. */
export const BEACON_TO_COMPONENT: Record<string, ComponentId> = {
  'beacon-l1-m1': 'M1_szimulacio',
  'beacon-l1-m2': 'M2_adatkartya',
  'beacon-l1-m3': 'M3_hajrajz',
  'beacon-l1-m4': 'M4_meres',
  'beacon-l1-m5': 'M5_hibas_erveles',
  'beacon-l1-exit': 'KILEPOJEGY',
};

export const PHET_URL = 'https://phet.colorado.edu/en/simulations/balloons-and-static-electricity';
