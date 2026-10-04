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
  Compass,
  Gauge,
  Activity,
} from 'lucide-react';

export const ExperimentModal: React.FC = () => {
  const {
    closeModal,
    completeQuest,
    completedQuestIds,
    quests,
    activeExperimentQuestId,
    kinematicsTelemetry,
  } = useGameStore();

  const quest =
    quests.find((q) => q.id === activeExperimentQuestId) ||
    quests.find((q) => q.id === 'quest-k01-first-steps') ||
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

  // Kinematics Quest K01 state: Path (s) vs Displacement (Δr) & Sensor Calibration
  const [k01Scanning, setK01Scanning] = useState<boolean>(false);
  const [k01ScanProgress, setK01ScanProgress] = useState<number>(0);
  const [k01HighlightMode, setK01HighlightMode] = useState<'both' | 'path' | 'displacement'>('both');

  // Kinematics Quest K02 state: Speed (v = s / t) & Unit Conversion (m/s <-> km/h)
  const [k02DistanceM, setK02DistanceM] = useState<number>(20);
  const [k02TimeS, setK02TimeS] = useState<number>(4);
  const [k02TestedRun, setK02TestedRun] = useState<boolean>(false);

  // Kinematics Quest K03 state: Acceleration (a = Δv / Δt) vs Constant Speed
  const [k03FinalSpeed, setK03FinalSpeed] = useState<number>(6);
  const [k03AccelTime, setK03AccelTime] = useState<number>(3);
  const [k03PhaseTested, setK03PhaseTested] = useState<boolean>(false);

  // Electrostatics Quest 1 state: Triboelectric rubbing
  const [isRubbing, setIsRubbing] = useState<boolean>(false);
  const [rubProgress, setRubProgress] = useState<number>(0);

  // Electrostatics Quest 2 state: Coulomb balance simulator (q1 sign, q2 sign, distance r)
  const [q1Sign, setQ1Sign] = useState<'+' | '-'>('-');
  const [q2Sign, setQ2Sign] = useState<'+' | '-'>('-');
  const [distanceCm, setDistanceCm] = useState<number>(10);
  const [testedRepulsion, setTestedRepulsion] = useState<boolean>(false);
  const [testedAttraction, setTestedAttraction] = useState<boolean>(false);

  // Electrostatics Quest 3 state: Conductor & Insulator Tesla Grounding
  const [groundingMat, setGroundingMat] = useState<'copper' | 'glass' | 'rubber'>('glass');
  const [insulatorMat, setInsulatorMat] = useState<'porcelain' | 'copper' | 'iron'>('copper');
  const [teslaTestResult, setTeslaTestResult] = useState<'idle' | 'safe' | 'hazard'>('idle');

  // Handler for K01: Motion Sensor Path & Displacement Calibration
  const handleRunK01SensorScan = () => {
    setK01Scanning(true);
    soundManager.playTerminalClick();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setK01ScanProgress(prog);
      soundManager.playTerminalClick();
      if (prog >= 100) {
        clearInterval(interval);
        setK01Scanning(false);
        setStage(2);
      }
    }, 220);
  };

  // Handler for K02: Speed & Unit Converter Test
  const handleRunK02SpeedTest = () => {
    soundManager.playTerminalClick();
    setK02TestedRun(true);
    setStage(2);
  };

  // Handler for K03: Servo Acceleration Bench Test
  const handleRunK03AccelTest = () => {
    soundManager.playElectricSpark();
    setK03PhaseTested(true);
    setStage(2);
  };

  // Electrostatics Quest 1 handler
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

  // Electrostatics Quest 2 handler
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

  // Electrostatics Quest 3 handler
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
    setK01ScanProgress(0);
    setK02TestedRun(false);
    setK03PhaseTested(false);
    setRubProgress(0);
    setSelectedOptionId(null);
    setAnswerSubmitted(false);
    setTestedRepulsion(false);
    setTestedAttraction(false);
    setTeslaTestResult('idle');
  };

  const isRepelling = q1Sign === q2Sign;
  const relativeForce = Math.round((100 / (distanceCm * distanceCm)) * 100);
  const k02SpeedMs = Number((k02DistanceM / k02TimeS).toFixed(2));
  const k02SpeedKmh = Number((k02SpeedMs * 3.6).toFixed(2));
  const k03AccelVal = Number((k03FinalSpeed / k03AccelTime).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              {quest.id.startsWith('quest-k') ? (
                <Compass className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
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
          {/* KINEMATICS 01: PATH (s) vs DISPLACEMENT (Δr) & TIME (t)           */}
          {/* ================================================================= */}
          {quest.id === 'quest-k01-first-steps' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>MOZGÁSSZENZOR TELEMETRIA: ÚT (s), ELMOZDULÁS (Δr) ÉS IDŐ (t)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {(['both', 'path', 'displacement'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setK01HighlightMode(mode)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer border ${
                        k01HighlightMode === mode
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {mode === 'both'
                        ? 'Mindkettő'
                        : mode === 'path'
                        ? 'Megtett út (s)'
                        : 'Elmozdulás (Δr)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Top-Down Trajectory Map */}
              <div className="w-full h-52 rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 620 180" className="w-full h-full max-w-2xl">
                  {/* Grid lines */}
                  <line x1="60" y1="115" x2="560" y2="115" stroke="#1e293b" strokeWidth="1" />
                  <line x1="310" y1="15" x2="310" y2="165" stroke="#1e293b" strokeWidth="1" />

                  {/* Straight-line Displacement Vector Δr = 8.5 m */}
                  {(k01HighlightMode === 'both' || k01HighlightMode === 'displacement') && (
                    <g>
                      <line
                        x1="90"
                        y1="115"
                        x2="520"
                        y2="115"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="8 5"
                      />
                      <polygon points="525,115 513,109 513,121" fill="#f59e0b" />
                      <text
                        x="310"
                        y="152"
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Elmozdulás nagysága: |Δr| = 8,5 m (Légvonalban a ládán át)
                      </text>
                    </g>
                  )}

                  {/* Curved Bypass Path s = 11.5 m */}
                  {(k01HighlightMode === 'both' || k01HighlightMode === 'path') && (
                    <g>
                      <path
                        d="M 90 115 Q 310 -15 520 115"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3.5"
                      />
                      <text
                        x="310"
                        y="26"
                        textAnchor="middle"
                        fill="#67e8f9"
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Ténylegesen megtett út: s = 11,5 m (Kerülőút a láda mellett · t = 4,6 s)
                      </text>
                    </g>
                  )}

                  {/* Rusted Crate Obstacle in the middle */}
                  <g transform="translate(265, 86)">
                    <rect
                      x="0"
                      y="0"
                      width="90"
                      height="54"
                      rx="4"
                      fill="#78350f"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <text
                      x="45"
                      y="31"
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ROZSDÁS LÁDA
                    </text>
                  </g>

                  {/* Start Point: Awakening Platform (0 m) */}
                  <circle cx="90" cy="115" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="90" y="119" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                    RO-01
                  </text>
                  <text x="90" y="146" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    Kezdőpont (0 m)
                  </text>

                  {/* End Point: Motion Sensor (z = 2.5) */}
                  <circle cx="525" cy="115" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                  <text x="525" y="119" textAnchor="middle" fill="#10b981" fontSize="9" fontFamily="monospace">
                    SZENZOR
                  </text>
                  <text x="525" y="146" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    Végpont (z=2.5)
                  </text>
                </svg>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40">
                  <div className="text-slate-400">Szenzor által mért út (s):</div>
                  <div className="text-lg font-bold text-cyan-300 mt-0.5">s = 11,5 m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Saját 3D mozgásod: {Math.max(11.5, kinematicsTelemetry.distanceTraveled)} m
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40">
                  <div className="text-slate-400">Elmozdulás nagysága (|Δr|):</div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5">|Δr| = 8,5 m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Kezdő- és végpont egyenes távolsága
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/40">
                  <div className="text-slate-400">Eltelt mozgási idő (t):</div>
                  <div className="text-lg font-bold text-emerald-300 mt-0.5">t = 4,6 s</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Mértékegység: másodperc (s)
                  </div>
                </div>
              </div>

              {stage === 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      1. Lépés: Mozgásszenzor Kalibrálása és Leolvasása
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Rögzítsd a megtett út (s = 11,5 m) és az elmozdulás (|Δr| = 8,5 m) különbségét!
                    </p>
                  </div>
                  <button
                    onClick={handleRunK01SensorScan}
                    disabled={k01Scanning}
                    className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {k01Scanning ? `Kalibrálás... ${k01ScanProgress}%` : 'SZENZOR LEOLVASÁSA'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* KINEMATICS 02: SPEED (v = s / t) & UNIT CONVERSION (×3.6)         */}
          {/* ================================================================= */}
          {quest.id === 'quest-k02-speed' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  <span>SEBESSÉGMÉRŐ PRÓBAPAD: v = s / t ÉS 1 m/s = 3,6 km/h</span>
                </span>
                <span className="text-amber-400 font-bold">
                  Aktuális: v = {k02SpeedMs} m/s = {k02SpeedKmh} km/h
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Megtett út (s):</span>
                    <span className="font-mono font-bold text-cyan-300">{k02DistanceM} m</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    step={5}
                    value={k02DistanceM}
                    onChange={(e) => setK02DistanceM(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Eltelt idő (t):</span>
                    <span className="font-mono font-bold text-amber-300">{k02TimeS} s</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={k02TimeS}
                    onChange={(e) => setK02TimeS(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Speed Comparison Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Rozsdás szállítószalag:</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">1,5 m/s = 5,4 km/h</div>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/50">
                  <div className="text-cyan-300">RO-01 beállított mozgása:</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {k02DistanceM} m / {k02TimeS} s = {k02SpeedMs} m/s ({k02SpeedKmh} km/h)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Teherszállító drón:</div>
                  <div className="text-sm font-bold text-amber-300 mt-1">10 m/s = 36,0 km/h</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {k02TestedRun
                    ? '✓ Sebességmérés és km/h átváltás rögzítve!'
                    : 'Állítsd s = 20 m és t = 4 s értékre, majd rögzítsd a mérést!'}
                </span>
                <button
                  onClick={handleRunK02SpeedTest}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Sebességmérés Rögzítése
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* KINEMATICS 03: ACCELERATION (a = Δv / Δt) vs CONSTANT SPEED       */}
          {/* ================================================================= */}
          {quest.id === 'quest-k03-acceleration' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>SZERVÓ-GYORSULÁS PRÓBAPAD: a = Δv / Δt = (v - v₀) / Δt</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  1. szakasz: a = {k03AccelVal} m/s² · 2. szakasz (állandó v): a = 0 m/s²
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Elért utazósebesség (v, v₀ = 0-ról):</span>
                    <span className="font-mono font-bold text-cyan-300">{k03FinalSpeed} m/s</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={2}
                    value={k03FinalSpeed}
                    onChange={(e) => setK03FinalSpeed(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Felgyorsulási idő (Δt):</span>
                    <span className="font-mono font-bold text-emerald-300">{k03AccelTime} s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={1}
                    value={k03AccelTime}
                    onChange={(e) => setK03AccelTime(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                  <div className="text-emerald-300 font-bold">
                    1. szakasz (Indulás: 0 s → {k03AccelTime} s)
                  </div>
                  <div className="text-slate-200 mt-1">
                    Sebességváltozás: Δv = {k03FinalSpeed} - 0 = {k03FinalSpeed} m/s
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    Gyorsulás: a = {k03FinalSpeed} / {k03AccelTime} = {k03AccelVal} m/s²
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40">
                  <div className="text-cyan-300 font-bold">
                    2. szakasz (Egyenletes haladás {k03FinalSpeed} m/s-mal)
                  </div>
                  <div className="text-slate-200 mt-1">
                    Sebességváltozás: Δv = {k03FinalSpeed} - {k03FinalSpeed} = 0 m/s
                  </div>
                  <div className="text-sm font-bold text-amber-300 mt-1">
                    Gyorsulás: a = 0 / Δt = 0 m/s² (Nem gyorsul!)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {k03PhaseTested
                    ? '✓ Szervó-gyorsulási görbe rögzítve!'
                    : 'Vizsgáld meg a két szakasz különbségét, majd rögzítsd a mérést!'}
                </span>
                <button
                  onClick={handleRunK03AccelTest}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Szervóteszt Lefuttatása
                </button>
              </div>
            </div>
          )}

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
          {!quest.id.startsWith('quest-k') &&
            quest.id !== 'quest-01-electrostatics' &&
            quest.id !== 'quest-02-charges' && (
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
