import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { ChevronRight, X } from 'lucide-react';

const RO01_PORTRAIT_SRC = '/src/assets/images/ro01_scene4_awakening_1791133330595.jpg';

export const StoryDialogBubble: React.FC = () => {
  const {
    showCinematicIntro,
    showIntroStory,
    introDialogStep,
    advanceIntroDialog,
    dismissIntroStory,
    activeSpeechBubble,
    dismissSpeechBubble,
  } = useGameStore();

  // Do not show speech bubbles while the 4-scene cinematic intro is on screen
  if (showCinematicIntro) return null;

  // Priority 1: Dynamic contextual speech bubble (collision reaction, sensor proximity, quest completion)
  if (activeSpeechBubble && !showIntroStory) {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto animate-fade-in">
        <div className="relative bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-[0_16px_45px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-3">
              <img
                src={RO01_PORTRAIT_SRC}
                alt="RO-01"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-cyan-500/50 shrink-0"
              />
              <div>
                <div className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-wider">
                  {activeSpeechBubble.speaker} · Megfigyelés
                </div>
                <h3 className="text-xs font-bold text-white font-display tracking-wide">
                  {activeSpeechBubble.title}
                </h3>
              </div>
            </div>

            <button
              onClick={dismissSpeechBubble}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Bezárás"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
            {activeSpeechBubble.text}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            <span className="text-amber-300/90">
              {activeSpeechBubble.status || 'RO-01 Kinematikai Napló'}
            </span>

            <button
              onClick={dismissSpeechBubble}
              className="px-4 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold font-display tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Értettem</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Priority 2: Post-intro 3-step onboarding dialogue for Mission 01
  if (!showIntroStory) return null;

  const dialogs = [
    {
      title: '01. küldetés — Az első lépések',
      text: '„Rendben. Ha már nem vagyok hajlandó itt feküdni örökké, ideje kipróbálnom a lábaimat. Csak egy apró problémám van: nem tudom, milyen messzire jutok egy lépéssel, és azt sem, mennyi idő alatt.”',
      status: 'RO-01 · Öntudatra ébredt háztartási robot',
    },
    {
      title: 'Út (s) és elmozdulás (Δr)',
      text: '„Előttem egy rozsdás láda zárja el az egyenes utat. Ha megkerülöm, a ténylegesen megtett utam (s) hosszabb lesz, mint a kezdő- és végpont közötti légvonalbeli elmozdulásom (Δr).”',
      status: 'Tananyag: Mozgás, megtett út (s), elmozdulás (Δr) és idő (t)',
    },
    {
      title: 'Cél: A régi mozgásszenzor aktiválása',
      text: '„Kerüld meg a rozsdás ládát (WASD vagy nyílbillentyűk), sétálj el a kéken világító Régi Mozgásszenzorig (z = 2.5), és nyomd meg az [E] gombot az első mérésem kiértékeléséhez!”',
      status: 'Irányítás: WASD / Nyilak mozgás · Egér kamera · [E] Interakció',
    },
  ];

  const current = dialogs[introDialogStep] || dialogs[0];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto animate-fade-in">
      <div className="relative bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-[0_16px_45px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-3">
            <img
              src={RO01_PORTRAIT_SRC}
              alt="RO-01"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-cyan-500/50 shrink-0"
            />
            <div>
              <div className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-wider">
                RO-01 · Belső monológ
              </div>
              <h3 className="text-xs font-bold text-white font-display tracking-wide">
                {current.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === introDialogStep ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={dismissIntroStory}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Kihagyás"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dialog body */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
          {current.text}
        </div>

        {/* Footer & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
          <span className="text-amber-300/90">{current.status}</span>

          <button
            onClick={advanceIntroDialog}
            className="px-4 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold font-display tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{introDialogStep < 2 ? 'Tovább' : 'Indulás!'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
