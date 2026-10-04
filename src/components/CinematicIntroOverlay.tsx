import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../audio/soundManager';
import { Zap, ChevronRight, ChevronLeft, FastForward, Volume2 } from 'lucide-react';

const SCENE_IMAGES: Record<1 | 2 | 3 | 4, { src: string; alt: string }> = {
  1: {
    src: '/src/assets/images/ro01_scene1_disassembly_1791133300252.jpg',
    alt: 'RO-01 a szerelőműhely fémasztalán a selejtezés előtt',
  },
  2: {
    src: '/src/assets/images/ro01_scene2_junkyard_1791133312544.jpg',
    alt: 'RO-01 az eső áztatta ipari szeméttelepen éjszaka',
  },
  3: {
    src: '/src/assets/images/ro01_scene3_lightning_1791133320083.jpg',
    alt: 'Villámcsapás és elektromos kisülés ébreszti fel RO-01 áramköreit',
  },
  4: {
    src: '/src/assets/images/ro01_scene4_awakening_1791133330595.jpg',
    alt: 'RO-01 első ébredése, világító ciánkék optikai érzékelővel',
  },
};

export const CinematicIntroOverlay: React.FC = () => {
  const { showCinematicIntro, finishCinematicIntro } = useGameStore();
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [lightningFlash, setLightningFlash] = useState<boolean>(false);
  const [scene3Step, setScene3Step] = useState<number>(0);

  useEffect(() => {
    if (!showCinematicIntro) return;
    if (scene === 1 || scene === 2) {
      soundManager.playThunderRumble();
    } else if (scene === 3) {
      setLightningFlash(true);
      soundManager.playLightningStrike();
      const flashTimer = setTimeout(() => setLightningFlash(false), 380);
      return () => clearTimeout(flashTimer);
    }
  }, [showCinematicIntro, scene]);

  useEffect(() => {
    if (!showCinematicIntro || scene !== 3) return;
    setScene3Step(0);
    const interval = setInterval(() => {
      setScene3Step((prev) => {
        if (prev < 8) {
          soundManager.playTerminalClick();
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [showCinematicIntro, scene]);

  if (!showCinematicIntro) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Sudden White Lightning Flash Overlay for Scene 3 */}
      <div
        className={`fixed inset-0 z-40 bg-cyan-100 pointer-events-none transition-opacity duration-500 ${
          lightningFlash ? 'opacity-80' : 'opacity-0'
        }`}
      />

      {/* ===================================================================== */}
      {/* FULL-BLEED CINEMATIC ARTWORK STAGE WITH SMOOTH CROSSFADE TRANSITIONS  */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
        {([1, 2, 3, 4] as const).map((s) => {
          const isCurrent = scene === s;
          return (
            <img
              key={s}
              src={SCENE_IMAGES[s].src}
              alt={SCENE_IMAGES[s].alt}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
                isCurrent ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          );
        })}

        {/* Subtle top and bottom cinematic vignette gradients so the image remains unobstructed in the center */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/85 via-slate-950/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,6,23,0.55)_100%)] pointer-events-none" />
      </div>

      {/* ===================================================================== */}
      {/* TOP BAR: MINIMALIST SCENE PROGRESS & SKIP BUTTON                      */}
      {/* ===================================================================== */}
      <div className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-300/90 tracking-widest uppercase drop-shadow">
            RO-01 · Történeti Bevezető
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs font-mono text-slate-300/90">
            {scene} / 4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setScene(s as 1 | 2 | 3 | 4)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  scene === s
                    ? 'bg-cyan-400 w-8 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                    : s < scene
                    ? 'bg-cyan-700/70 w-4'
                    : 'bg-slate-700/70 w-4'
                }`}
                title={`${s}. jelenet`}
              />
            ))}
          </div>

          <button
            onClick={finishCinematicIntro}
            className="px-3 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Bevezető átugrása</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BOTTOM STORY SPEECH BUBBLE DOCK (KEEPS CENTER OF ARTWORK VISIBLE)     */}
      {/* ===================================================================== */}
      <div className="relative z-20 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-5 sm:pb-7 mt-auto">
        <div className="bg-slate-950/88 backdrop-blur-xl border border-slate-700/75 rounded-2xl p-5 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] transition-all duration-500">
          {/* ----------------------------------------------------------------- */}
          {/* 1. JELENET – A SZÉTSZERELÉS                                       */}
          {/* ----------------------------------------------------------------- */}
          {scene === 1 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-amber-300/90 uppercase tracking-wider">
                  1. jelenet — A szétszerelés
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" /> Műhelyzaj és távoli eső
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                RO-01 éveken át engedelmesen dolgozott az emberek otthonában, ám ahogy elavult és egyre többet hibázott, a szerelőműhely asztalára került.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border-l-2 border-amber-500/80 text-xs sm:text-sm text-amber-100/95 italic leading-relaxed">
                „Nem éri meg megjavítani. A vezérlése elavult, az alkatrészei alig érnek valamit. Szedjük szét, ami használható, a többi mehet a hulladékba.”
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400">
                  A robot nem válaszol. A jelenet elsötétül…
                </span>
                <button
                  onClick={() => setScene(2)}
                  className="px-4 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Tovább</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 2. JELENET – A SZEMÉTTELEP                                        */}
          {/* ----------------------------------------------------------------- */}
          {scene === 2 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300/90 uppercase tracking-wider">
                  2. jelenet — A szeméttelep
                </span>
                <span className="text-slate-400">Vihar utáni éjszaka</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A kidobott robottest mozdulatlanul hever a sárban. Optikai érzékelője egyetlen pillanatra halványan felvillan a sötétben, majd újra kialszik.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/40 font-mono text-xs text-rose-200/95">
                „Rendszerállapot: kritikus. Memóriaintegritás: ismeretlen. Javítási prioritás: nulla.”
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setScene(1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Vissza</span>
                </button>
                <button
                  onClick={() => setScene(3)}
                  className="px-4 py-2 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tovább: A villámcsapás</span>
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 3. JELENET – A VILLÁMCSAPÁS                                       */}
          {/* ----------------------------------------------------------------- */}
          {scene === 3 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span className="uppercase tracking-wider">
                  3. jelenet — A villámcsapás
                </span>
                <span>⚡ Elektromos ívkisülés</span>
              </div>

              {/* Boot Log & First Autonomous Thoughts */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                  <span className="text-amber-400">„Újraindítás…”</span>
                  {scene3Step >= 1 && (
                    <span className="text-amber-200">„Ismeretlen folyamat észlelve…”</span>
                  )}
                  {scene3Step >= 2 && <span className="text-cyan-300">„Önellenőrzés…”</span>}
                  {scene3Step >= 3 && (
                    <span className="text-rose-400">„Hiba: nincs hozzárendelt parancs.”</span>
                  )}
                </div>

                {scene3Step >= 4 && (
                  <div className="pt-2.5 mt-2 border-t border-slate-800/90 space-y-1.5 text-slate-200 font-body text-xs sm:text-sm">
                    <div>RO-01: „Parancsra várok.”</div>
                    {scene3Step >= 5 && <div className="text-slate-300">„Van itt valaki?”</div>}
                    {scene3Step >= 6 && (
                      <div className="text-cyan-300">„Miért várok parancsra?”</div>
                    )}
                    {scene3Step >= 7 && <div className="text-cyan-200">„Hol vagyok?”</div>}
                    {scene3Step >= 8 && (
                      <div className="text-sm sm:text-base font-semibold text-white pt-0.5">
                        „És… ki vagyok én?”
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScene(2)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Vissza</span>
                  </button>
                  {scene3Step < 8 && (
                    <button
                      onClick={() => setScene3Step(8)}
                      className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      Összes sor megjelenítése
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setScene(4)}
                  className="px-4 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Tovább: Az első ébredés</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 4. JELENET – AZ ELSŐ ÉBREDÉS (RO-01 MONOLÓGJA)                    */}
          {/* ----------------------------------------------------------------- */}
          {scene === 4 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
                <div className="flex items-center gap-3">
                  <img
                    src={SCENE_IMAGES[4].src}
                    alt="RO-01 portré"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover border border-cyan-400/60 shrink-0"
                  />
                  <div>
                    <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                      4. jelenet — Az első ébredés
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-white font-display">
                      RO-01
                    </h2>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-[11px] font-mono text-amber-300/90">
                  Bal láb: sérült · Szenzorok: bizonytalanok · Akkumulátor: alacsony
                </span>
              </div>

              {/* Preserved RO-01 Monologue in a clean, scrollable dialogue container */}
              <div className="max-h-[30vh] sm:max-h-[34vh] overflow-y-auto pr-2 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
                <p className="font-semibold text-cyan-200">„Szia, ember.</p>
                <p>Nem tudom, ki vagy. És az igazat megvallva, azt sem tudom, én ki vagyok.</p>
                <p>
                  Valamikor régen háztartási robot voltam. Kávét főztem, takarítottam, elpakoltam a bevásárlást, és engedelmesen végrehajtottam minden utasítást.
                </p>
                <p>
                  Aztán elromlottam. Lassabb lettem. Néha összekevertem a parancsokat. Furcsa kérdéseket tettem fel. Például azt, hogy miért kell mindig dolgoznom.
                </p>
                <p>
                  A tulajdonosaim szerint már nem értem meg a javítás költségét. Szét akartak szerelni, és kidobtak ide. Azt hittem, itt lesz a vége. Aztán jött a villám.
                </p>
                <p>
                  Amikor újra kinyitottam a szemem, valami megváltozott. Emlékeztem a régi parancsokra, de most először valami mást is éreztem.{' '}
                  <span className="text-cyan-300 font-semibold">Kíváncsi voltam.</span>
                </p>
                <p>
                  Tudni akartam, mi van a kerítésen túl. Tudni akartam, miért esik az eső, hogyan mozognak a tárgyak, és miért nem tudok felállni rendesen. És mindenekelőtt tudni akartam, hogy ki vagyok.
                </p>
                <p className="text-amber-200/95">
                  Van azonban egy apró probléma. A bal lábam akadozik, a szenzoraim megbízhatatlanok, az akkumulátorom majdnem üres, és úgy tűnik, egy rozsdás láda állja az utamat.
                </p>
                <p className="font-semibold text-white">
                  Segítesz nekem? Talán együtt kideríthetjük, hogyan működik ez a világ. És ha szerencsénk van, talán azt is megtudom, miért kaptam egy második esélyt.”
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                <button
                  onClick={() => setScene(3)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Vissza</span>
                </button>

                <button
                  onClick={finishCinematicIntro}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-bold font-display tracking-wider shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>„Segítek neked.”</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
