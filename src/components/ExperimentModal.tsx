import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../audio/soundManager';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export const ExperimentModal: React.FC = () => {
  const {
    closeModal,
    completeQuest,
    completedQuestIds,
    quests,
    activeExperimentQuestId,
  } = useGameStore();

  const quest =
    quests.find((q) => q.id === activeExperimentQuestId) ||
    quests.find((q) => q.id === 'quest-01-electrostatics') ||
    quests[0];

  const isAlreadyCompleted = completedQuestIds.includes(quest.id);

  // Shared stage state:
  // 0: Interactive Physics Manipulation & Experimentation
  // 2: Observation Verified -> Ready for Hypothesis
  // 3: Scientific Hypothesis / Explanation Question
  // 4: Completed with Pedagogical Feedback & Rewards
  const [stage, setStage] = useState<number>(isAlreadyCompleted ? 4 : 0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quest 1 state: Triboelectric rubbing
  const [isRubbing, setIsRubbing] = useState<boolean>(false);
  const [rubProgress, setRubProgress] = useState<number>(0);

  // Quest 2 state: Coulomb balance simulator (q1 sign, q2 sign, distance r)
  const [q1Sign, setQ1Sign] = useState<'+' | '-'>('-');
  const [q2Sign, setQ2Sign] = useState<'+' | '-'>('-');
  const [distanceCm, setDistanceCm] = useState<number>(10);
  const [testedRepulsion, setTestedRepulsion] = useState<boolean>(false);
  const [testedAttraction, setTestedAttraction] = useState<boolean>(false);

  // Quest 3 state: Conductor & Insulator Tesla Grounding
  const [groundingMat, setGroundingMat] = useState<'copper' | 'glass' | 'rubber'>('glass');
  const [insulatorMat, setInsulatorMat] = useState<'porcelain' | 'copper' | 'iron'>('copper');
  const [teslaTestResult, setTeslaTestResult] = useState<'idle' | 'safe' | 'hazard'>('idle');

  // Quest 1 handler
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
    }, 240);
  };

  // Quest 2 handler
  const handleTestCoulombConfig = () => {
    soundManager.playElectricSpark();
    const isSame = q1Sign === q2Sign;
    const nextRep = testedRepulsion || isSame;
    const nextAtt = testedAttraction || !isSame;
    setTestedRepulsion(nextRep);
    setTestedAttraction(nextAtt);
    if (nextRep && nextAtt) {
      setStage(2);
    }
  };

  // Quest 3 handler
  const handleTestTeslaGrounding = () => {
    soundManager.playElectricSpark();
    if (groundingMat === 'copper' && insulatorMat === 'porcelain') {
      setTeslaTestResult('safe');
      setStage(2);
    } else {
      setTeslaTestResult('hazard');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return;
    setAnswerSubmitted(true);

    const chosen = quest.challenge.options.find((o) => o.id === selectedOptionId);
    if (chosen && chosen.isCorrect) {
      setIsSubmitting(true);
      await completeQuest(quest.id, {
        selectedOptionId,
        observationsCount: 3,
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
    setTestedRepulsion(false);
    setTestedAttraction(false);
    setTeslaTestResult('idle');
  };

  const isRepelling = q1Sign === q2Sign;
  const relativeForce = Math.round((100 / (distanceCm * distanceCm)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-display">
                {quest.title.toUpperCase()}
              </h2>
              <div className="text-xs text-slate-400">{quest.lessonTitle}</div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scientific Prompt Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/40 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300">Kísérleti feladat: </span>
            {quest.challenge.prompt}
          </div>

          {/* ================================================================= */}
          {/* EXPERIMENT 1: TRIBOELECTRIC RUBBING & POLARIZATION                */}
          {/* ================================================================= */}
          {quest.id === 'quest-01-electrostatics' && (
            <>
              <div className="relative w-full h-64 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Anyag: Műanyag (Ebonit) rúd + Gyapjú</span>
                    <span>·</span>
                    <span>
                      Állapot:{' '}
                      {stage === 0
                        ? 'Semleges (q = 0)'
                        : 'Negatív töltéstöbblet (q < 0)'}
                    </span>
                  </div>
                  <div className="text-amber-400 font-bold">LABORASZTAL #01</div>
                </div>

                <div className="relative z-10 flex items-center justify-around h-36">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-24 h-16 rounded-lg bg-amber-100/90 border-2 border-amber-300/80 shadow-md flex items-center justify-center text-xs font-bold text-amber-950 transition-transform ${
                        isRubbing ? 'translate-x-12 rotate-6 scale-105' : ''
                      }`}
                    >
                      Gyapjúkendő
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">
                      {stage >= 2 ? 'Elektront adott le (+)' : 'Semleges'}
                    </span>
                  </div>

                  <div className="relative flex flex-col items-center justify-center">
                    {isRubbing && (
                      <div className="flex items-center gap-1 text-cyan-300 text-xs font-mono animate-bounce">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>e⁻ elektronátadás ({rubProgress}%)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-44 h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-semibold ${
                        stage >= 2
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-800 border-slate-600 text-slate-300'
                      }`}
                    >
                      <span className="font-mono">Ebonit rúd</span>
                      {stage >= 2 && (
                        <span className="ml-2 font-mono text-[10px] text-cyan-300">
                          [- - - -]
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">
                      {stage >= 2 ? 'Feltöltve: Negatív (-) többlet' : 'Semleges rúd'}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 w-full pt-2 border-t border-slate-800 flex items-end justify-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono mr-4">
                    Papírszeletek az asztalon:
                  </span>
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
                        style={{ transitionDelay: `${idx * 70}ms` }}
                      />
                    );
                  })}
                </div>
              </div>

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
                    className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isRubbing ? `Dörzsölés... ${rubProgress}%` : 'RÚD DÖRZSÖLÉSE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================================================================= */}
          {/* EXPERIMENT 2: COULOMB FORCE & BIPOLAR CAPACITOR SIMULATOR         */}
          {/* ================================================================= */}
          {quest.id === 'quest-02-charges' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-amber-400 font-bold">
                  COULOMB-TÖRVÉNY SZIMULÁTOR: F = k · |q₁ · q₂| / r²
                </span>
                <span className="text-cyan-300">
                  Kölcsönhatás: {isRepelling ? 'TASZÍTÁS (Egynemű töltések)' : 'VONZÁS (Különnemű töltések)'} · Relatív erő: {relativeForce} N
                </span>
              </div>

              {/* Visual Suspended Spheres */}
              <div className="h-40 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-12 relative overflow-hidden">
                <div
                  className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-mono font-bold transition-transform duration-500 ${
                    q1Sign === '+'
                      ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                      : 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  } ${isRepelling ? '-translate-x-6' : 'translate-x-4'}`}
                >
                  <span className="text-lg">{q1Sign}</span>
                  <span className="text-[9px]">Gömb A</span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex flex-col items-center">
                  <span>r = {distanceCm} cm</span>
                  <span className="text-amber-400 font-bold mt-1">
                    {isRepelling ? '⟵ TASZÍTÁS ⟶' : '⟶ VONZÁS ⟵'}
                  </span>
                </div>

                <div
                  className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-mono font-bold transition-transform duration-500 ${
                    q2Sign === '+'
                      ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                      : 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  } ${isRepelling ? 'translate-x-6' : '-translate-x-4'}`}
                >
                  <span className="text-lg">{q2Sign}</span>
                  <span className="text-[9px]">Gömb B</span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Gömb A töltése:</span>
                  <div className="flex gap-1.5">
                    {(['+', '-'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ1Sign(s)}
                        className={`w-8 h-8 rounded font-mono font-bold text-xs cursor-pointer ${
                          q1Sign === s
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Gömb B töltése:</span>
                  <div className="flex gap-1.5">
                    {(['+', '-'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ2Sign(s)}
                        className={`w-8 h-8 rounded font-mono font-bold text-xs cursor-pointer ${
                          q2Sign === s
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Távolság (r):</span>
                    <span className="font-mono text-amber-400">{distanceCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={5}
                    value={distanceCm}
                    onChange={(e) => setDistanceCm(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className={testedRepulsion ? 'text-emerald-400' : 'text-slate-500'}>
                    {testedRepulsion ? '✓ Taszítás megfigyelve' : '○ Tesztelj azonos töltéseket'}
                  </span>
                  <span className={testedAttraction ? 'text-emerald-400' : 'text-slate-500'}>
                    {testedAttraction ? '✓ Vonzás megfigyelve' : '○ Tesztelj ellentétes töltéseket'}
                  </span>
                </div>
                <button
                  onClick={handleTestCoulombConfig}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Mérés Rögzítése
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* EXPERIMENT 3: TESLA HIGH-VOLTAGE GROUNDING & INSULATION           */}
          {/* ================================================================= */}
          {quest.id !== 'quest-01-electrostatics' && quest.id !== 'quest-02-charges' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">
                  100 kV TESLA-GENERÁTOR FÖLDELÉSI & SZIGETELÉSI PRÓBAPAD
                </span>
                <span className="text-amber-400">
                  {teslaTestResult === 'safe'
                    ? '✓ BIZTONSÁGOS FÖLDELÉS AKTÍV'
                    : teslaTestResult === 'hazard'
                    ? '⚠ ZÁRLAT / SZIGETELÉSI HIBA!'
                    : 'Állítsd be az anyagokat!'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-white">
                    1. Földelővezeték anyaga (Villám elvezetése a földbe):
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'copper', label: 'Vörösréz sín' },
                      { id: 'glass', label: 'Üvegrúd' },
                      { id: 'rubber', label: 'Gumi' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setGroundingMat(m.id as 'copper' | 'glass' | 'rubber')}
                        className={`p-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                          groundingMat === m.id
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-white">
                    2. Kezelőpult tartóburkolata (Kezelő védelme az áramtól):
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'porcelain', label: 'Porcelán' },
                      { id: 'copper', label: 'Vörösréz' },
                      { id: 'iron', label: 'Öntöttvas' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setInsulatorMat(m.id as 'porcelain' | 'copper' | 'iron')}
                        className={`p-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                          insulatorMat === m.id
                            ? 'bg-amber-950 border-amber-400 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {teslaTestResult === 'hazard'
                    ? 'Hiba: A földeléshez jó vezető (szabad elektronok), a burkolathoz szigetelő szükséges!'
                    : 'Válaszd ki a megfelelő vezetőt és szigetelőt, majd teszteld a kisülést!'}
                </span>
                <button
                  onClick={handleTestTeslaGrounding}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>100 kV Kisülés Tesztelése</span>
                </button>
              </div>
            </div>
          )}

          {/* Transition from Stage 2 (Observation complete) to Stage 3 (Scientific Explanation) */}
          {stage === 2 && (
            <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-cyan-200">
                  Sikeres Kísérleti Megfigyelés!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Most már megfigyelted a fizikai jelenséget. Válaszolj a tudományos kérdésre a küldetés jóváírásához!
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playTerminalClick();
                  setStage(3);
                }}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>MAGYARÁZAT MEGADÁSA</span>
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
                  Válaszd ki a kísérleti megfigyelésednek megfelelő fizikai magyarázatot:
                </p>
              </div>

              <div className="space-y-2.5">
                {quest.challenge.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const showFeedback = answerSubmitted && isSelected;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        setAnswerSubmitted(false);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <div className="text-xs text-slate-200 leading-relaxed flex-1">
                          {opt.text}
                        </div>
                      </div>

                      {showFeedback && !opt.isCorrect && (
                        <div className="mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{opt.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId || isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold font-display tracking-wider transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'JÓVÁÍRÁS...' : 'VÁLASZ ELLENŐRZÉSE ÉS RÖGZÍTÉSE'}
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Completed State */}
          {stage === 4 && (
            <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-700/60 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-display">
                      Kísérlet Sikeresen Teljesítve!
                    </h4>
                    <p className="text-xs text-emerald-300">
                      +{quest.points} Iskolai Pont · +{quest.xpReward || 60} Játék XP jóváírva
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Újra kipróbálás</span>
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {quest.challenge.options.find((o) => o.isCorrect)?.explanation}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Visszatérés a 3D Világba
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
