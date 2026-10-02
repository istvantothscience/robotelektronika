import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Bot, ChevronRight, Zap, X } from 'lucide-react';

export const StoryDialogBubble: React.FC = () => {
  const { showIntroStory, introDialogStep, advanceIntroDialog, dismissIntroStory } = useGameStore();

  if (!showIntroStory) return null;

  const dialogs = [
    {
      title: 'RENDSZER-ÚJRAINDÍTÁS // ÖNTESZT: OK',
      text: 'Hol vagyok...? Úgy tűnik, az elhagyott Roncstelep (Underworld) alján ébredtem fel. Körülöttem szétbontott gépek, rozsdás robotvázak és ipari hulladék hever.',
      status: 'Azonosító: SP-8B // Töltöttség: 32%',
    },
    {
      title: 'DIAGNOSZTIKA // ENERGIAMEGSZAKADÁS',
      text: 'A város energiaellátása összeomlott. A magasba nyúló szintek (Static Research, Circuit Lab, Sky City) zsilipjei lezártak. Csak akkor juthatok feljebb, ha megértem és helyreállítom a fizikai folyamatokat!',
      status: 'Cél: Töltsd fel a kondenzátorokat és indulj el felfelé!',
    },
    {
      title: 'ELSŐ KÜLDETÉS // AZ ELEKTROSZTATIKA LABOR',
      text: 'Előttem egy működő kutatóállomás áll! Sétálj végig a fém sétányon a lila/cian fényű laborba, és lépj a kísérleti asztalhoz, hogy megértsd a titokzatos vonzóerőt!',
      status: 'Irányítás: WASD mozgás, Egér kamera, E interakció',
    },
  ];

  const current = dialogs[introDialogStep] || dialogs[0];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto animate-fade-in">
      <div className="relative bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-400/80 rounded-2xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.45)] text-slate-100 flex flex-col gap-3">
        {/* Decorative corner accents */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>ROBOT BELSŐ MONOLÓG</span>
              </div>
              <h3 className="text-xs font-bold text-white font-display tracking-wide">
                {current.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === introDialogStep ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
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
        <div className="text-xs text-slate-200 leading-relaxed font-body">
          {current.text}
        </div>

        {/* Footer & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
          <span className="text-amber-400/90">{current.status}</span>

          <button
            onClick={advanceIntroDialog}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold font-display tracking-wider transition-colors shadow-lg shadow-cyan-900/40 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{introDialogStep < 2 ? 'TOVÁBB' : 'KEZDÉS!'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
