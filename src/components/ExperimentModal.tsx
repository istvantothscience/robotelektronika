import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../audio/soundManager';
import { X, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Zap } from 'lucide-react';

export const ExperimentModal: React.FC = () => {
  const { closeModal, completeQuest, completedQuestIds, quests } = useGameStore();

  const quest = quests.find((q) => q.id === 'quest-01-electrostatics')!;
  const isAlreadyCompleted = completedQuestIds.includes(quest.id);

  // Experiment Stages:
  // 0: Neutral initial state
  // 1: Rubbing action (electron transfer)
  // 2: Approaching paper scraps (polarization & attraction jump)
  // 3: Quiz question
  // 4: Completed with pedagogical feedback & points awarded
  const [stage, setStage] = useState<number>(isAlreadyCompleted ? 4 : 0);
  const [isRubbing, setIsRubbing] = useState<boolean>(false);
  const [rubProgress, setRubProgress] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Perform rubbing action
  const handlePerformRubbing = () => {
    setIsRubbing(true);
    soundManager.playElectricSpark();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setRubProgress(prog);
      soundManager.playElectricSpark();
      if (prog >= 100) {
        clearInterval(interval);
        setIsRubbing(false);
        setStage(2);
      }
    }, 280);
  };

  // Approach paper pieces
  const handleApproachPaper = () => {
    soundManager.playTerminalClick();
    setStage(3);
  };

  // Submit student hypothesis
  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return;
    setAnswerSubmitted(true);

    const chosen = quest.challenge.options.find((o) => o.id === selectedOptionId);
    if (chosen && chosen.isCorrect) {
      setIsSubmitting(true);
      await completeQuest(quest.id, {
        selectedOptionId,
        observationsCount: 2,
        durationSeconds: 45,
      });
      setIsSubmitting(false);
      setStage(4);
    }
  };

  const handleReset = () => {
    setStage(0);
    setRubProgress(0);
    setSelectedOptionId(null);
    setAnswerSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-display">
                01. ELEKTROSZTATIKA KÍSÉRLETI PAD
              </h2>
              <div className="text-xs text-slate-400">
                1. Tanóra: A furcsa erő — Elektrosztatikus alapjelenségek
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scientific Context Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/40 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300">Kísérleti cél: </span>
            A laborban az energiaellátás megakadt egy elektrosztatikus érzékelőnél. Vizsgáld meg, hogyan hozható létre vonzóerő dörzsöléssel két közönséges szigetelő anyag között!
          </div>

          {/* 2D Interactive Physics Bench Viewport */}
          <div className="relative w-full h-64 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Visual background grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Bench Header / Live Telemetry */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Anyag: Műanyag (Ebonit) rúd + Gyapjú</span>
                <span>·</span>
                <span>Állapot: {stage === 0 ? 'Semleges (q = 0)' : stage === 1 ? 'Elektronátadás folyamatban' : 'Negatív töltéstöbblet (q < 0)'}</span>
              </div>
              <div className="text-cyan-400 font-bold">
                LABORASZTAL #01
              </div>
            </div>

            {/* Central Animated Physics Simulation Area */}
            <div className="relative z-10 flex items-center justify-around h-36">
              {/* Left: Gyapjúkendő (Wool Cloth) */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-16 rounded-lg bg-amber-100/90 border-2 border-amber-300/80 shadow-md flex items-center justify-center text-xs font-bold text-amber-900 transition-transform ${
                    isRubbing ? 'translate-x-12 rotate-6 scale-105' : ''
                  }`}
                >
                  Gyapjúkendő
                </div>
                <span className="text-[11px] text-slate-400 mt-2">
                  {stage >= 2 ? 'Elektront adott le (+)' : 'Semleges'}
                </span>
              </div>

              {/* Center: Contact / Rubbing Electron Spark Zone */}
              <div className="relative flex flex-col items-center justify-center">
                {isRubbing && (
                  <div className="absolute -top-4 flex items-center gap-1 text-cyan-300 text-xs font-mono animate-bounce">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>e⁻ elektronvándorlás</span>
                  </div>
                )}

                {/* Electric Sparks */}
                {isRubbing && (
                  <div className="w-12 h-12 rounded-full bg-cyan-400/30 animate-ping" />
                )}
              </div>

              {/* Right: Plastic Rod (Ebonit rúd) */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-40 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-semibold ${
                    stage >= 2
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 border-slate-600 text-slate-300'
                  }`}
                >
                  <span className="font-mono">Műanyag rúd</span>
                  {stage >= 2 && (
                    <span className="ml-2 font-mono text-[10px] text-cyan-300 tracking-wider">
                      [- - - - -]
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-2">
                  {stage >= 2 ? 'Feltöltve: Negatív (-) többlet' : 'Semleges rúd'}
                </span>
              </div>
            </div>

            {/* Bottom Table Surface with Paper Scraps */}
            <div className="relative z-10 w-full pt-2 border-t border-slate-800 flex items-end justify-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono mr-4">Papírdarabok az asztalon:</span>
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                const isAttracted = stage >= 2;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 bg-white shadow-sm transition-all duration-700 ${
                      isAttracted
                        ? '-translate-y-20 rotate-45 scale-110 bg-cyan-100 shadow-[0_0_8px_white]'
                        : 'translate-y-0'
                    }`}
                    style={{
                      transitionDelay: `${idx * 80}ms`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Interactive Stepper Controls */}
          {stage === 0 && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  1. Lépés: Dörzsölés végrehajtása
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Dörzsöld össze a műanyag rudat a gyapjúkendővel az elektronok átadásához!
                </p>
              </div>
              <button
                onClick={handlePerformRubbing}
                disabled={isRubbing}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg shadow-cyan-900/40 flex items-center gap-2 cursor-pointer"
              >
                <span>{isRubbing ? `Dörzsölés... ${rubProgress}%` : 'RÚD DÖRZSÖLÉSE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {stage === 2 && (
            <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-cyan-200">
                  2. Lépés: Megfigyelés
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  A feltöltött műanyag rúd hatására a papírdarabok felugrottak és rátapadtak a rúdra! Mi magyarázza ezt?
                </p>
              </div>
              <button
                onClick={handleApproachPaper}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg shadow-cyan-900/40 flex items-center gap-2 cursor-pointer"
              >
                <span>VÁLASZADÁS ÉS HIPOTÉZIS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stage 3: Scientific Question & Student Answer */}
          {stage === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <h4 className="text-sm font-semibold text-white">
                  {quest.challenge.question}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Válaszd ki a fizikailag helyes magyarázatot a megfigyelt jelenségre!
                </p>
              </div>

              <div className="space-y-2.5">
                {quest.challenge.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedOptionId(option.id);
                        setAnswerSubmitted(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                              : 'border-slate-600 text-slate-400'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </div>
                        <span className="leading-relaxed">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {answerSubmitted && selectedOptionId && !quest.challenge.options.find(o => o.id === selectedOptionId)?.isCorrect && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-300">Nem egészen helyes magyarázat:</div>
                    <div className="mt-0.5">{quest.challenge.options.find(o => o.id === selectedOptionId)?.explanation}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kísérlet újraindítása</span>
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId || isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'PONTJÓVÁÍRÁS...' : 'VÁLASZ BEKÜLDÉSE'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Quest Completed & Pedagogy Summary */}
          {stage === 4 && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  KÜLDETÉS ÉS ELEKTROSZTATIKAI KÍSÉRLET TELJESÍTVE!
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                  Gratulálunk! Megfigyelted az elektrosztatikus vonzás alapjelenségét. A dörzsöléssel negatív töltéstöbblet alakult ki a rúdon, amely megosztás révén vonzotta a könnyű semleges papírcsíkokat.
                </p>
              </div>

              {/* Reward Highlights */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">MEGSZERZETT PONT</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">+15 XP</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">FELFEDEZÉS</div>
                  <div className="text-xs font-semibold text-cyan-300 mt-0.5 truncate">Elektrosztatikus vonzás</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg shadow-cyan-900/40 cursor-pointer"
                >
                  VISSZA A JÁTÉKBA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
