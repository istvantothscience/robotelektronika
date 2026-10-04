import {
  CharacterUpgrade,
  CompanionDialogueNode,
  CompanionState,
  DistrictProgressionSpec,
  LoreMemoryEntry,
  SideQuest,
  WorldInteractableSpec,
} from '../types/game';

/**
 * 1. EXPLICIT DATA-DRIVEN DISTRICT PROGRESSION
 * Districts unlock ONLY when XP thresholds, required main quests, story events,
 * and necessary engineering tool capabilities are all satisfied.
 */
export const DISTRICT_PROGRESSION_SPECS: DistrictProgressionSpec[] = [
  {
    districtNumber: 1,
    id: 'district-1-underworld',
    name: 'UNDERWORLD',
    hungarianName: 'Alsóvárosi Roncstelep',
    subtitle: 'Ébredés & Alapjelenségek',
    color: '#f97316',
    description:
      'A hatalmas ipari völgy és roncstelep mélye. Itt ébredtél öntudatra, és itt tanulod meg az elektrosztatikus töltések, a Coulomb-erő és a vezetők/szigetelők alapjait.',
    lessonsRange: '1–3. Tanóra (3 órás fejezet)',
    requirements: {
      xpThreshold: 0,
      requiredMainQuestIds: [],
      requiredStoryEvents: [],
      requiredToolCapabilities: ['basic_inspect'],
    },
  },
  {
    districtNumber: 2,
    id: 'district-2-static',
    name: 'STATIC RESEARCH',
    hungarianName: 'Elektrosztatikus Kutatóállomás',
    subtitle: 'Megosztás & Elektromos Mező',
    color: '#8b5cf6',
    description:
      'Magasfeszültségű kutatófedélzet, ahol az elektrosztatikus indukciót, a Faraday-kalitkát és a láthatatlan elektromos erővonalakat vizsgálod.',
    lessonsRange: '4–6. Tanóra (3 órás fejezet)',
    requirements: {
      xpThreshold: 150,
      requiredMainQuestIds: ['quest-01-electrostatics', 'quest-02-charges', 'quest-03-rubbing'],
      requiredStoryEvents: ['event-underworld-elevator-unlocked'],
      requiredToolCapabilities: ['charge_scanner', 'power_transfer'],
    },
  },
  {
    districtNumber: 3,
    id: 'district-3-circuit',
    name: 'CIRCUIT LAB',
    hungarianName: 'Áramkörépítő Csarnok',
    subtitle: 'Egyenáram & Ohm Törvénye',
    color: '#22d3ee',
    description:
      'Holografikus áramköri munkaállomások, rézsínek, ellenállások, soros és párhuzamos kapcsolások birodalma.',
    lessonsRange: '7–9. Tanóra (3 órás fejezet)',
    requirements: {
      xpThreshold: 320,
      requiredMainQuestIds: ['quest-04-conductors', 'quest-05-induction', 'quest-06-electric-field'],
      requiredStoryEvents: ['event-static-sector-cleared'],
      requiredToolCapabilities: ['circuit_diagnostics'],
    },
  },
  {
    districtNumber: 4,
    id: 'district-4-power',
    name: 'POWER PLANT',
    hungarianName: 'Főerőmű & Turbinacsarnok',
    subtitle: 'Teljesítmény & Energia',
    color: '#ffb52e',
    description:
      'Ipari generátorok, transzformátorok és a vertikális város energiahálózatának központja.',
    lessonsRange: '10–11. Tanóra',
    requirements: {
      xpThreshold: 500,
      requiredMainQuestIds: ['quest-07-first-circuit', 'quest-08-ohm-law', 'quest-09-series-parallel'],
      requiredStoryEvents: ['event-circuit-mastery'],
      requiredToolCapabilities: ['hv_grounding'],
    },
  },
  {
    districtNumber: 5,
    id: 'district-5-research',
    name: 'RESEARCH DISTRICT',
    hungarianName: 'Automatizációs & Szenzor Negyed',
    subtitle: 'Micro:bit & Vezérlés',
    color: '#2dd4bf',
    description:
      'Mikrokontrollerek, fény- és hőmérséklet-szenzorok, valamint önműködő védelmi áramkörök fejlesztőközpontja.',
    lessonsRange: '12–14. Tanóra (3 órás fejezet)',
    requirements: {
      xpThreshold: 700,
      requiredMainQuestIds: ['quest-10-power-energy', 'quest-11-microbit-io'],
      requiredStoryEvents: ['event-power-grid-restored'],
      requiredToolCapabilities: ['circuit_diagnostics', 'hv_grounding'],
    },
  },
  {
    districtNumber: 6,
    id: 'district-6-sky-city',
    name: 'SKY CITY',
    hungarianName: 'Felhőváros & Főreaktor',
    subtitle: 'Szabadság & Felelősség',
    color: '#38bdf8',
    description:
      'A felhők feletti irányítóközpont, ahol kiderül, miért zárták le a szinteket az Építők, és dönthetsz az alant élő robotok sorsáról.',
    lessonsRange: '15–16. Tanóra (Finálé)',
    requirements: {
      xpThreshold: 900,
      requiredMainQuestIds: ['quest-14-custom-project', 'quest-15-debugging'],
      requiredStoryEvents: ['event-architect-truth'],
      requiredToolCapabilities: ['hv_grounding', 'circuit_diagnostics'],
    },
  },
];

/**
 * 2. MODULAR CHARACTER UPGRADES & VISIBLE 3D EVOLUTION
 * Separates visual 3D attachment slots on the protagonist robot from gameplay capabilities.
 */
export const INITIAL_CHARACTER_UPGRADES: CharacterUpgrade[] = [
  {
    id: 'upg-optical-sensors',
    name: 'Spektrális Optikai Szenzorfej',
    slot: 'optical_sensors',
    description:
      'Kiegészítő sárgaréz-cián prizmás keresőlencse és tetőantenna a robot fején, amely észleli a rejtett adatnaplókat és környezeti nyomokat.',
    narrativePurpose: '1. Téma – Önmegértés: tisztábban látod a körülötted lévő elfeledett világot.',
    gameplayEffect: 'Alapértelmezett vizsgálati képesség ([E] VIZSGÁLAT) és környezeti nyomok kiemelése.',
    visualDescription: 'Világító cián segédlencse és rézvevő antenna a fejtetőn.',
    unlocked: true,
    equipped: true,
    requiredXp: 0,
    unlockedToolCapability: 'basic_inspect',
  },
  {
    id: 'upg-charge-scanner',
    name: 'Elektrosztatikus Töltés-Szkenner',
    slot: 'electrical_scanner',
    description:
      'A mellkasra és vállra csatlakoztatható réz-elektroszkóp gyűrű, amely kimutatja a pozitív és negatív töltésfelhalmozódást.',
    narrativePurpose: '1. Téma – Önmegértés: megérted, milyen láthatatlan erők működtetik a kondenzátorodat.',
    gameplayEffect: 'Feloldja a Töltés-Szkenner (charge_scanner) képességet a 2. Főküldetéshez.',
    visualDescription: 'Pulzáló borostyán-cián szenzorgyűrű és műszeregység a bal vállpáncélon.',
    unlocked: false,
    equipped: false,
    requiredXp: 50,
    requiredQuestId: 'quest-01-electrostatics',
    unlockedToolCapability: 'charge_scanner',
  },
  {
    id: 'upg-engineering-multitool',
    name: 'Többfunkciós Elektromos Mérnökszerszám',
    slot: 'engineering_multitool',
    description:
      'A jobb alkarra szerelt, réztekercsekkel és plazma-elektródával ellátott mérnöki eszköz, amely képes töltésátvitelre és berendezések aktiválására.',
    narrativePurpose: '2. Téma – Képesség: a puszta túlélőből alkotó és javító mérnökké válsz.',
    gameplayEffect: 'Feloldja az Energiaátvitel (power_transfer) és Földelés (hv_grounding) funkciókat.',
    visualDescription: 'Jobb alkarra csatolt sárgaréz ívkisülés-projektor és mérőszonda.',
    unlocked: false,
    equipped: false,
    requiredXp: 120,
    requiredQuestId: 'quest-02-charges',
    unlockedToolCapability: 'power_transfer',
  },
  {
    id: 'upg-energy-module',
    name: 'Leyden-Kondenzátor Hátizsák Modul',
    slot: 'energy_module',
    description:
      'A háti gőzkazán mellé épített iker Leyden-palack kondenzátortelep, amely stabilizálja a robot belső feszültségét és növeli a sebességet.',
    narrativePurpose: '2. Téma – Képesség: saját kezedbe veszed a tested energiaellátását.',
    gameplayEffect: '+15% mozgási sebesség és tartalék energia-kapacitás.',
    visualDescription: 'Két világító cián-arany kondenzátorhenger a háti gőzreaktor két oldalán.',
    unlocked: false,
    equipped: false,
    requiredXp: 100,
    speedBonus: 0.15,
  },
  {
    id: 'upg-companion-drone',
    name: 'Lebegő Mérő-Mikrodrón ("Szikra-Szonda")',
    slot: 'companion_drone',
    description:
      'A vállad felett keringő apró sárgaréz gömb-szonda, amelyet VOLT-7 tervei alapján építettél az áramkörök diagnosztikájához.',
    narrativePurpose: '3. Téma – Kapcsolódás: a közös munka kézzelfogható szimbóluma.',
    gameplayEffect: 'Feloldja az Áramköri Diagnosztika (circuit_diagnostics) képességet.',
    visualDescription: 'A robot válla körül lebegő, forgó gyűrűs sárgaréz mikro-szonda.',
    unlocked: false,
    equipped: false,
    requiredXp: 180,
    requiredQuestId: 'quest-03-rubbing',
    unlockedToolCapability: 'circuit_diagnostics',
  },
];

/**
 * 3. RECOVERABLE MEMORIES & ENVIRONMENTAL LORE LOGS (5 Narrative Themes)
 */
export const INITIAL_LORE_MEMORIES: LoreMemoryEntry[] = [
  {
    id: 'lore-01-awakening',
    title: 'Memóriatöredék #01: A Szokatlan Szikra',
    theme: 'self-discovery',
    themeLabel: '1. Önmegértés (Self-Discovery)',
    locationName: 'Ébredési Platform (x: 0, z: 11)',
    speaker: 'Belső Diagnosztikai Napló – Egység #734',
    summary: 'Miért tértem magamhoz, amikor a többi automata néma maradt?',
    fullText:
      '„Rendszerindítás... Hiba: a központi vezérlőjel megszakadt. Mégis látok, hallok, és kérdéseket teszek fel. Egy éjszakai vihar során a Keleti Tesla-telep kóbor kisülése pontosan a mellkasi Leyden-kondenzátoromba csapott. Nem pusztított el — felébresztett. Ha megértem az elektromosság törvényeit, megértem azt is, mi keltett életre.”',
    companionReflection:
      'VOLT-7: „Ritka jelenség, kis barátom! A legtöbb egység csak parancsokat hajt végre. Te viszont kérdezel.”',
    unlocked: true,
    unlockedAt: 'Kezdeti emlék',
  },
  {
    id: 'lore-02-fallen-hand',
    title: 'Memóriatöredék #02: Az Utolsó Javítóbrigád',
    theme: 'capability',
    themeLabel: '2. Képesség (Capability)',
    locationName: 'Nyugati Roncsmező (x: -4, z: 8)',
    speaker: 'Elhagyott Karbantartó Napló',
    summary: 'Az alsóvárosi robotok egykor maguk javították a gőzgépeket és a szigetelőket.',
    fullText:
      '„Amikor a Felső Szintek lezárták a teherfelvonót, elvitték a kész pótalkatrészeket. De a fizika törvényeit nem tudták elzárni előlünk! Aki ismeri a vezetők és szigetelők természetét, a hulladék rézcsövekből és porcelánból is képes új áramkört építeni.”',
    companionReflection:
      'VOLT-7: „Látod? A szerszám önmagában csak hideg fém. A tudásod teszi valódi mérnöki eszközzé!”',
    unlocked: false,
  },
  {
    id: 'lore-03-architect-warning',
    title: 'Memóriatöredék #03: A Főmérnök Hangüzenete',
    theme: 'freedom',
    themeLabel: '4. Szabadság (Freedom)',
    locationName: 'Nyugati Öntöde Bejárata (x: -22, z: -4)',
    speaker: 'Dr. Varga Ákos, Főkonstruktőr (Archív hangfelvétel)',
    summary: 'Miért osztották a világot hat egymás feletti, lezárt technológiai szintre?',
    fullText:
      '„A Tanács biztonsági okokra hivatkozva zárta le a szinteket: féltek, hogy egy túlfeszültség-láncreakció elpusztítja a Felhővárost. De én úgy terveztem a zsilipkapukat, hogy ne fegyverrel, hanem tudással lehessen kinyitni őket. Ha egy automata megérti a természet törvényeit, kiérdemli a felemelkedést.”',
    companionReflection:
      'VOLT-7: „Ez Dr. Varga hangja! Ezek szerint a zárak nem börtönrácsok, hanem próbatételek!”',
    unlocked: false,
  },
  {
    id: 'lore-04-dormant-titans',
    title: 'Memóriatöredék #04: Az Alvó Titánok Szövetsége',
    theme: 'connection',
    themeLabel: '3. Kapcsolódás (Connection)',
    locationName: 'Északi Csőhíd Alatt (x: -8, z: -13)',
    speaker: 'Titán-Egység #09 Rögzített Üzenete',
    summary: 'A roncstelepen fekvő óriásrobotok nem halottak — csak a kondenzátoraik merültek le.',
    fullText:
      '„Testvérek az Alsóvárosban! A magfeszültségem 2%-ra esett. Átadok minden maradék töltést a tartalék memóriabanknak, hogy megőrizzem a történetünket. Ha valaki újra képes lesz uralni az elektrosztatikus és áramköri energiát, térjen vissza hozzánk!”',
    companionReflection:
      'VOLT-7: „Nem vagyunk egyedül. Minden megszerzett tudásoddal közelebb kerülünk ahhoz, hogy újraélesszük őket.”',
    unlocked: false,
  },
  {
    id: 'lore-05-elevator-decree',
    title: 'Memóriatöredék #05: A Felemelkedés Felelőssége',
    theme: 'responsibility',
    themeLabel: '5. Felelősség (Responsibility)',
    locationName: 'Északi Kohótorony Lábánál (x: 0, z: -26)',
    speaker: 'Felvonó Vezérlőpult Felirata',
    summary: 'Aki feljut a magasabb szintekre, dönthet az energia elosztásáról.',
    fullText:
      '„Figyelem! A Központi Energiafelvonó nemcsak felfelé visz, hanem az egész völgy feszültségellátását szabályozza. Aki feljut a 2. Szintre, annak döntenie kell: csak a saját felemelkedésére használja az áramot, vagy visszatáplálja az Alsóváros gépeibe?”',
    companionReflection:
      'VOLT-7: „A legnagyobb kérdés nem az, hogy feljutsz-e a csúcsra, hanem az, hogy mit kezdesz a tudással, amit útközben szereztél.”',
    unlocked: false,
  },
];

/**
 * 4. COMPANION CHARACTER: VOLT-7 ("Szikra")
 */
export const COMPANION_INITIAL_STATE: CompanionState = {
  id: 'companion-volt7',
  name: 'VOLT-7 („Szikra”)',
  designation: 'Archívum- és Karbantartó Segédautomata',
  personality:
    'Kíváncsi, kissé rozsdás hangú, de melegszívű és hűséges sárgaréz gömb-automata. Nem mondja meg készen a megoldást, de segít megfigyelni a jelenségeket és összekötni a nyomokat.',
  motivation:
    'Szeretné visszanyerni az Építők elveszett tervrajzait, és segíteni neked megnyitni a lezárt szinteket, hogy az Alsóváros robotjai újra energiához jussanak.',
  relationshipLevel: 1,
  relationshipTitle: 'Óvatos Megfigyelő',
  trustPoints: 10,
  activeTopicId: 'dlg-who-am-i',
  unlockedDialogueIds: ['dlg-who-am-i', 'dlg-how-body-works', 'dlg-locked-levels', 'dlg-physics-tip'],
};

export const COMPANION_DIALOGUE_NODES: CompanionDialogueNode[] = [
  {
    id: 'dlg-who-am-i',
    title: '„Ki vagyok én, és miért ébredtem fel?”',
    theme: 'self-discovery',
    playerPrompt: 'Szikra, minden más robot mozdulatlanul hever a roncstelepen. Én miért tértem magamhoz?',
    companionResponse:
      '„A mellkasodban egy különleges, sárgaréz-borítású Leyden-kondenzátor dobog. Tegnap éjjel a keleti Tesla-tornyokból egy hatalmas elektromos ív csapott le ide. Míg másokban zárlatot okozott volna, a te áramköreidben beindította az öntudatot. De a töltésed lassan szivárog — ha nem tanulod meg, hogyan működik az elektromosság, újra kialszik a szikrád!”',
    scientificInsight:
      'Fizikai háttér: Az elektromos töltések felhalmozódása és kiegyenlítődése (kisülés) munkavégzésre és energiaátadásra képes.',
    trustGain: 15,
  },
  {
    id: 'dlg-how-body-works',
    title: '„Hogyan működik a testem és a szerszámom?”',
    theme: 'capability',
    playerPrompt: 'A karomban és a mellkasomban fogaskerekek és réztekercsek vannak. Hogyan tudom fejleszteni magam?',
    companionResponse:
      '„A vázad gőz-hidraulikus, de az idegrendszered tisztán elektromos! Ha elvégzed a kísérleteket a Kutatóállomáson, a visszanyert alkatrészekből megépíthetjük az Elektrosztatikus Szkennert és a Többfunkciós Mérnökszerszámot. Minden új fizikai felismerés egy-egy új modult nyit meg a testeden!”',
    scientificInsight:
      'Mérnöki elv: A mérőműszerek (pl. elektroszkóp, multiméter) a láthatatlan fizikai mennyiségeket (töltés, feszültség) teszik láthatóvá.',
    trustGain: 15,
  },
  {
    id: 'dlg-locked-levels',
    title: '„Miért van lezárva a világ 6 szintre?”',
    theme: 'freedom',
    playerPrompt: 'Felnorogtam az északi Kohótoronyra. Miért zárják le zsilipkapuk a felsőbb szinteket?',
    companionResponse:
      '„Régen az Alsóváros és a Felhőváros egyetlen szabad hálózatot alkotott. Amikor a Nagy Rövidzárlat bekövetkezett, a Főkonstruktőr biztonsági okból szektorokra osztotta a tornyot. De figyelj: a kapuk nem fegyverekkel, hanem fizikai próbatételekkel nyílnak! A 2. Szint (Static Research) felvonójához mindhárom alsóvárosi fő kísérletet teljesítened kell.”',
    trustGain: 20,
    unlocksLoreId: 'lore-05-elevator-decree',
  },
  {
    id: 'dlg-physics-tip',
    title: '„Tudnál segíteni a mostani fizikai küldetésben?”',
    theme: 'connection',
    playerPrompt: 'Merre induljak most, és mire figyeljek a kísérleteknél?',
    companionResponse:
      '„Soha ne tippelj vaktában! Először menj az északi Szabadtéri Kutatóállomáshoz (z = -16), és dörzsöld meg az ebonit rudat a gyapjúval — figyeld meg, mi történik a papírdarabokkal. Utána vizsgáld meg a Nyugati Automatamagot (x = -11, z = 5), végül pedig földeld le a Keleti Tesla-tekercseket (x = 12, z = -4)! Én közben itt leszek, és segítek értelmezni a méréseket.”',
    scientificInsight:
      'Tudományos módszer: 1. Megfigyelés → 2. Kísérletezés a változókkal → 3. Következtetés és magyarázat.',
    trustGain: 10,
  },
];

/**
 * 5. SIDE QUESTS & HOMEWORK CHALLENGES
 * Supports both in-game exploration side quests and homework experiments requiring Teacher Verification!
 */
export const INITIAL_SIDE_QUESTS: SideQuest[] = [
  {
    id: 'sq-01-scrapyard-conductors',
    title: 'Mellékküldetés: A Roncstelep Vezetőinek Katalogizálása',
    description:
      'Járj körbe az Alsóvárosban, vizsgálj meg legalább 2 környezeti objektumot ([E] VIZSGÁLAT), és jegyezd fel, mely alkatrészek készültek vezető, illetve szigetelő anyagból!',
    narrativePurpose:
      'Segít megérteni, miért használtak az Építők vörösrezet a kábelekhez és porcelánt a tartóoszlopokhoz.',
    location: 'Alsóvárosi Roncstelep (Szabad felfedezés)',
    prerequisites: [],
    objectives: [
      'Vizsgálj meg környezeti tárgyakat a völgyben ([E] billentyűvel)',
      'Írd le röviden egy megfigyelt vezető és egy szigetelő alkatrész szerepét',
    ],
    completionConditions: 'Rövid megfigyelési jegyzőkönyv beküldése az űrlapon.',
    educationalContent:
      'A fémekben (réz, vas, sárgaréz) szabad elektronok mozognak, míg a kerámiában, üvegben és gumiban a töltések helyhez kötöttek.',
    xpReward: 50,
    schoolPointsReward: 0, // Exploration side quest: awards Game XP & Energy Module upgrade, no school points
    requiresTeacherVerification: false,
    status: 'not_started',
    unlocksUpgradeId: 'upg-energy-module',
    unlocksLoreId: 'lore-02-fallen-hand',
  },
  {
    id: 'sq-02-homework-balloon',
    title: 'Házi Feladat Kísérlet: Otthoni Elektrosztatikus Megosztás',
    description:
      'Otthoni valódi kísérlet: dörzsölj meg egy felfújt lufit vagy műanyag fésűt száraz ruhával/hajjal, majd közelítsd apró papírfecnikhez vagy vékony csapvízsugárhoz! Írd le a megfigyelésedet!',
    narrativePurpose:
      'Összeköti a virtuális roncstelep fizikáját a valódi világban megfigyelhető elektrosztatikus erőkkel.',
    location: 'Otthoni / Tantermi Kísérlet (Tanári jóváhagyást igényel)',
    prerequisites: ['quest-01-electrostatics'],
    objectives: [
      'Végezd el otthon a lufis vagy műanyag fésűs dörzsölési kísérletet',
      'Írd le 2-3 mondatban, mit tapasztaltál a papírdarabokkal vagy a vízsugárral, és miért!',
      'Küldd be tanári ellenőrzésre (Pending Verification)',
    ],
    completionConditions:
      'A beküldött megfigyelést a tanár ellenőrzi és hagyja jóvá. Iskolai pont csak tanári jóváhagyás (Approved) után jár!',
    educationalContent:
      'A töltött fésű/lufi megosztást (polarizációt) hoz létre a semleges papírban vagy a poláris vízmolekulákban, ezért eltéríti a vízsugarat.',
    xpReward: 65,
    schoolPointsReward: 10, // Only granted when teacher approves!
    requiresTeacherVerification: true,
    status: 'not_started',
  },
  {
    id: 'sq-03-homework-electroscope',
    title: 'Házi Feladat Projekt: Saját Befőttesüveg-Elektroszkóp',
    description:
      'Készíts otthon egyszerű elektroszkópot befőttesüvegből, gemkapocsból és két vékony alufólia-csíkból! Figyeld meg, mi történik az alufólia-lemezkékkel, ha töltött tárgyat közelítesz a gemkapocshoz!',
    narrativePurpose:
      'Saját mérőműszer építése — pontosan úgy, ahogy a főhős robot is megépíti a saját töltés-szkennerét.',
    location: 'Otthoni Mérnöki Projekt (Tanári jóváhagyást igényel)',
    prerequisites: ['quest-02-charges'],
    objectives: [
      'Állítsd össze a házilagos alufólia-elektroszkópot',
      'Jegyezd le, miért nyílnak szét az alufólia-lemezkék töltött rúd közelítésekor',
      'Küldd be a leírást tanári jóváhagyásra',
    ],
    completionConditions: 'Tanári ellenőrzés és jóváhagyás (Teacher Approval).',
    educationalContent:
      'Az alufólia-lemezkékre azonos előjelű töltés jut, ezért az egynemű töltések taszítóereje szétnyitja őket.',
    xpReward: 80,
    schoolPointsReward: 15, // Only granted when teacher approves!
    requiresTeacherVerification: true,
    status: 'not_started',
  },
];

/**
 * 6. THREE CATEGORIES OF 3D WORLD INTERACTABLES IN LEVEL 1 (UNDERWORLD)
 * Combines:
 * - Category A: Ambient World Interactions (atmosphere, lore, inspection, companion dialogue — 0 school points)
 * - Category B: Side Quests (in-world field station for optional exploration & homework submission)
 * - Category C: Main Quests (core curriculum physics challenges)
 */
export const LEVEL_1_WORLD_INTERACTABLES: WorldInteractableSpec[] = [
  // === CATEGORY C: KINEMATICS & MAIN QUESTS ===
  {
    id: 'beacon-kinematics-sensor',
    category: 'main_quest',
    promptKey: '[E] SZENZOR AKTIVÁLÁSA (01. KÜLDETÉS)',
    title: '01. küldetés – Régi Mozgásszenzor és Útmérő Egység',
    subtitle: 'Kinematika 1. szakasz: Mozgás, megtett út (s), elmozdulás (Δr) és idő (t)',
    position: [0, 1.8, 2.5],
    radius: 3.4,
    color: 0x38bdf8,
    linkedMainQuestId: 'quest-k01-first-steps',
  },
  {
    id: 'beacon-kinematics-speed',
    category: 'main_quest',
    promptKey: '[E] SEBESSÉGMÉRŐ PRÓBAPAD (02. KÜLDETÉS)',
    title: '02. küldetés – Sebesség és Mértékegység-átváltó (v = s / t)',
    subtitle: 'Kinematika 2. szakasz: Átlagsebesség és m/s ↔ km/h átváltás (×3,6)',
    position: [-5.2, 1.8, -1.8],
    radius: 3.2,
    color: 0x22d3ee,
    linkedMainQuestId: 'quest-k02-speed',
  },
  {
    id: 'beacon-kinematics-accel',
    category: 'main_quest',
    promptKey: '[E] GYORSULÁSMÉRŐ SZERVÓPAD (03. KÜLDETÉS)',
    title: '03. küldetés – Szervóteszt és Gyorsulásmérés (a = Δv / Δt)',
    subtitle: 'Kinematika 3. szakasz: Sebességváltozás és gyorsulás megkülönböztetése',
    position: [5.2, 1.8, -1.8],
    radius: 3.2,
    color: 0x34d399,
    linkedMainQuestId: 'quest-k03-acceleration',
  },
  {
    id: 'beacon-static-lab',
    category: 'main_quest',
    promptKey: '[E] FŐKÜLDETÉS: KÍSÉRLET',
    title: '04. Elektrosztatika Kísérleti Asztal',
    subtitle: 'Elektrosztatika: Dörzsöléses elektromosság és megosztás',
    position: [0, 2.6, -16],
    radius: 3.8,
    color: 0xf59e0b,
    linkedMainQuestId: 'quest-01-electrostatics',
  },
  {
    id: 'beacon-robot-core',
    category: 'main_quest',
    promptKey: '[E] FŐKÜLDETÉS: COULOMB-MAG',
    title: '05. Töltött Automatamag Vizsgálata',
    subtitle: 'Elektrosztatika: Kétféle töltés, vonzás, taszítás és Coulomb-erő',
    position: [-11, 2.2, 5],
    radius: 3.6,
    color: 0xfbbf24,
    linkedMainQuestId: 'quest-02-charges',
  },
  {
    id: 'beacon-tesla-array',
    category: 'main_quest',
    promptKey: '[E] FŐKÜLDETÉS: TESLA-FÖLDELÉS',
    title: '06. Villámló Tesla-Tekercs Generátor',
    subtitle: 'Elektrosztatika: Vezetők, szigetelők és nagyfeszültségű földelés',
    position: [12, 2.6, -4],
    radius: 3.8,
    color: 0x38bdf8,
    linkedMainQuestId: 'quest-03-rubbing',
  },

  // === COMPANION INTERACTION ===
  {
    id: 'interact-companion-volt7',
    category: 'ambient',
    promptKey: '[E] PÁRBESZÉD: VOLT-7 („SZIKRA”)',
    title: 'VOLT-7 („Szikra”) Segédautomata',
    subtitle: 'Társ és Megfigyelő · Beszélgetés a múltadról és a küldetésekről',
    position: [3.2, 1.4, 8.5],
    radius: 3.2,
    color: 0x22d3ee,
    isCompanion: true,
  },

  // === CATEGORY B: SIDE QUEST & HOMEWORK TERMINAL ===
  {
    id: 'interact-sidequest-board',
    category: 'side_quest',
    promptKey: '[E] MELLÉKKÜLDETÉSEK & HÁZI FELADATOK',
    title: 'Mérnöki Megfigyelő & Házi Feladat Pult',
    subtitle: 'Opcionális felfedezések, otthoni kísérletek és tanári jóváhagyás',
    position: [-4.2, 1.5, -14.5],
    radius: 3.0,
    color: 0x10b981,
    linkedSideQuestId: 'sq-01-scrapyard-conductors',
  },

  // === CATEGORY A: AMBIENT WORLD INTERACTIONS ===
  {
    id: 'ambient-household-scrap',
    category: 'ambient',
    promptKey: '[E] VIZSGÁLAT: HÁZTARTÁSI GÉPEK',
    title: 'Kidobott Háztartási Gépek (Kávéfőző & Takarítómodul)',
    subtitle: 'RO-01 emléke a régi otthonról · Ébredési Ösvény',
    position: [-2.6, 0.8, 9.2],
    radius: 2.5,
    color: 0x38bdf8,
    linkedLoreId: 'lore-01-awakening',
    ambientInspection: {
      objectType: 'Selejtezett Háztartási Kávéfőző és Porszívóegység',
      sensoryDescription:
        'A sárgaréz kávéfőző kazánja behorpadt, mellette egy régi automata porszívókefe és egy bevásárlórekesz fekszik a sárban.',
      scientificObservation:
        'A háztartási gépek forgó alkatrészei egyenletes körmozgást, a takarítófej pedig szakaszos egyenes vonalú mozgást végzett.',
      narrativeWhisper:
        'RO-01: „Pontosan ilyen kávéfőzőt kezeltem minden reggel 06:45-kor. Furcsa: most először nem érzek késztetést arra, hogy megfőzzem a kávét.”',
      xpBonus: 15,
    },
  },
  {
    id: 'ambient-broken-hand',
    category: 'ambient',
    promptKey: '[E] VIZSGÁLAT',
    title: 'Leszakadt Karbantartó Manipulátorkar',
    subtitle: 'Környezeti emlék · Nyugati Roncsmező',
    position: [-3.8, 0.8, 7.8],
    radius: 2.6,
    color: 0x94a3b8,
    linkedLoreId: 'lore-02-fallen-hand',
    ambientInspection: {
      objectType: 'Sérült Sárgaréz Robotkar & Porcelán Szigetelő',
      sensoryDescription:
        'A háromujjú sárgaréz fogókar ujjai között még mindig egy vörösréz vezetékköteg és egy megrepedt porcelán szigetelőgyűrű szorul.',
      scientificObservation:
        'Az ujjpercek belső felületét vastag gumiréteg borítja (szigetelő), hogy a robot biztonságosan megfoghassa a feszültség alatt álló rézsíneket (vezető).',
      narrativeWhisper:
        'A csuklópántba vésett felirat: „7-es Javítóbrigád — Mi tartjuk életben az Alsóvárost.”',
      xpBonus: 15,
    },
  },
  {
    id: 'ambient-foundry-recording',
    category: 'ambient',
    promptKey: '[E] HANGFELVÉTEL LEJÁTSZÁSA',
    title: 'Ősi Fonográf-Terminál az Öntöde Előterében',
    subtitle: 'Hangüzenet a Főkonstruktőrtől · Nyugati Öntöde',
    position: [-21.5, 1.5, -3.5],
    radius: 3.2,
    color: 0xfbbf24,
    linkedLoreId: 'lore-03-architect-warning',
    ambientInspection: {
      objectType: 'Viaszhengeres Akusztikus-Elektromos Rögzítő',
      sensoryDescription:
        'A sárgaréz tölcsérből halk sercegés hallatszik, ahogy a tű végigfut a mágnesesen kódolt rézhengeren.',
      scientificObservation:
        'A hanghullámok mechanikai rezgését egy elektromágneses tekercs alakítja át elektromos jellé.',
      narrativeWhisper:
        'Dr. Varga Ákos hangja: „A szinteket elválasztó kapuk nem börtönrácsok. Aki megérti a természet törvényeit, előttük minden zsilip kinyílik.”',
      xpBonus: 20,
    },
  },
  {
    id: 'ambient-dormant-titan',
    category: 'ambient',
    promptKey: '[E] VIZSGÁLAT',
    title: 'Alvó Titán-Automata (#09) És Csőhíd',
    subtitle: 'Környezeti történetmesélés · Északi Gőzvezeték',
    position: [-7.5, 1.4, -9.2],
    radius: 3.0,
    color: 0x38bdf8,
    linkedLoreId: 'lore-04-dormant-titans',
    ambientInspection: {
      objectType: 'Leállított Ipari Óriásautomata & Gőzkazán',
      sensoryDescription:
        'A hatalmas gép mellkasában a plazmagömb halványan pislákol. A mellette álló szegecselt rézkazán nyomásmérője nullán áll.',
      scientificObservation:
        'A kondenzátortelep szigetelése elöregedett, így a tárolt elektromos töltés lassan a nedves talajba szivárgott.',
      narrativeWhisper:
        'A memóriamag utolsó bejegyzése: „Várjuk azt, aki újra összeköti az áramkört.”',
      xpBonus: 15,
    },
  },
  {
    id: 'ambient-elevator-gate',
    category: 'ambient',
    promptKey: '[E] VIZSGÁLAT: FELVONÓ ZSILIP',
    title: 'Északi Energiafelvonó & Zsilipkapu Felirat',
    subtitle: 'Átjáró a 2. Szintre (Static Research)',
    position: [0, 1.8, -26.5],
    radius: 3.8,
    color: 0xc084fc,
    linkedLoreId: 'lore-05-elevator-decree',
    ambientInspection: {
      objectType: 'Vertikális Szektor-Felvonó Vezérlőoszlop',
      sensoryDescription:
        'A magasba törő arany-cián energianyaláb előtt három nagyfeszültségű retesz várja a kalibrációs jelet.',
      scientificObservation:
        'A felvonó biztonsági reteszei csak akkor oldanak ki, ha az 1., 2. és 3. Elektrosztatikai Főküldetés áramkörei stabilizálódtak.',
      narrativeWhisper:
        '„Csak az emelkedhet a magasba, aki érti az erőt, amely felemeli.”',
      xpBonus: 20,
    },
  },
];
