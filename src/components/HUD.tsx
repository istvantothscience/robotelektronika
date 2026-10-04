import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { DISTRICT_PROGRESSION_SPECS } from '../data/worldContent';
import { Minimap } from './Minimap';
import {
  Zap,
  Settings,
  CheckCircle2,
  Circle,
  ChevronRight,
  Wrench,
  BookOpen,
  MessageSquare,
  Lock,
  Sparkles,
} from 'lucide-react';

export const HUD: React.FC = () => {
  const {
    user,
    level,
    totalPoints,
    gameXp,
    quests,
    currentQuestId,
    completedQuestIds,
    interactionTarget,
    playerCoordinates,
    activeTowerLevel,
    setActiveTowerLevel,
    isDistrictUnlocked,
    companion,
    upgrades,
    loreMemories,
    kinematicsTelemetry,
    replayCinematicIntro,
    openExperimentForQuest,
    openModal,
    openWorldInteraction,
  } = useGameStore();

  const [selectedLevelInfo, setSelectedLevelInfo] = useState<number | null>(null);

  const currentQuest = quests.find((q) => q.id === currentQuestId) || quests[0];
  const isCompleted = completedQuestIds.includes(currentQuest.id);
  const unlockedUpgradesCount = upgrades.filter((u) => u.unlocked && u.equipped).length;
  const unlockedLoreCount = loreMemories.filter((l) => l.unlocked).length;

  const towerLevels = [...DISTRICT_PROGRESSION_SPECS].sort(
    (a, b) => b.districtNumber - a.districtNumber
  );

  const selectedDistrictSpec =
    selectedLevelInfo !== null
      ? DISTRICT_PROGRESSION_SPECS.find((d) => d.districtNumber === selectedLevelInfo)
      : null;
  const selectedDistrictCheck =
    selectedLevelInfo !== null ? isDistrictUnlocked(selectedLevelInfo) : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 overflow-hidden">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top-Left: STEMPUNK Logo + Quick Engineering & Narrative Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-slate-100 font-display drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] flex items-center">
                STEM<span className="text-amber-400">PUNK</span>
              </span>
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-dashed animate-spin-slow flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              </div>
            </div>
            <span className="text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase font-mono mt-0.5">
              RO-01 · KINEMATIKA & FIZIKA KALAND
            </span>
          </div>

          {/* Quick Action Buttons for Upgrades, Companion, Side Quests & Lore */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-xl p-1.5 shadow-xl">
            <button
              onClick={replayCinematicIntro}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs text-cyan-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="RO-01 4-jelenetes bevezető történetének újrajátszása"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>RO-01 Bevezető</span>
            </button>

            <button
              onClick={() => openModal('menu', 'upgrades')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-amber-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="3D Robotfejlesztések és Mérnöki Eszközök"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Modulok ({unlockedUpgradesCount}/4)</span>
            </button>

            <button
              onClick={() => openModal('menu', 'side_quests')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-emerald-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Mellékküldetések és Tanárilag Ellenőrzött Házi Feladatok"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mellékküldetés & Házi</span>
            </button>

            <button
              onClick={() => openModal('menu', 'lore')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-cyan-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Helyreállított Memóriatöredékek"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Memóriák ({unlockedLoreCount}/5)</span>
            </button>

            <button
              onClick={() => openWorldInteraction('companion-volt7')}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-xs text-cyan-200 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Párbeszéd VOLT-7 (Szikra) társ-automatával"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>VOLT-7 („Szikra”)</span>
            </button>
          </div>
        </div>

        {/* Top-Right: Player Card with Separate School Points & Game XP */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-2.5 pr-4 shadow-2xl">
          <div className="relative w-11 h-11 rounded-full bg-slate-800 border-2 border-amber-500/70 shadow-lg flex items-center justify-center overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-500 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-white tracking-wide">
                {user.displayName || 'Tanuló_01'}
              </span>
              <button
                onClick={() => openModal('menu', 'quests')}
                title="STEMPUNK Terminál & Beállítások"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
              <span className="text-cyan-300 font-semibold">Szint {level}</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold" title="Hivatalos Iskolai Pontszám">
                {totalPoints} Iskolai Pont
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold" title="Játékbeli Tapasztalati Pont (XP)">
                {gameXp} XP
              </span>
            </div>

            {/* Game XP progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(12, (gameXp / 180) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-300 tabular-nums">
                {completedQuestIds.length}/3 Főküldetés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE AREA: CURRENT MISSION (Left) & VERTICAL LEVELS RAIL (Right) */}
      <div className="flex items-start justify-between w-full my-auto pointer-events-none">
        {/* Left Side: CURRENT MISSION Card */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl max-w-xs transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  AKTÍV FŐKÜLDETÉS ({completedQuestIds.length}/3)
                </div>
                <h3 className="text-xs font-bold text-white font-display tracking-wide">
                  {currentQuest.title}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            {currentQuest.description}
          </p>

          {/* Mission Objectives Checklist */}
          <div className="space-y-1.5 pt-2.5 border-t border-slate-800 text-[11px]">
            {[
              currentQuest.objective,
              'Végezd el az interaktív fizikai mérést a munkapadon',
              'Magyarázd meg a megfigyelt jelenséget a jóváíráshoz',
            ].map((obj: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                {isCompleted || idx === 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{obj}</span>
              </div>
            ))}
          </div>

          {/* Live RO-01 Kinematics Telemetry Strip */}
          <div className="mt-2.5 p-2 rounded-xl bg-slate-900/95 border border-slate-800 grid grid-cols-4 gap-1.5 text-center font-mono">
            <div>
              <div className="text-[9px] text-slate-400">Út (s)</div>
              <div className="text-[11px] font-bold text-cyan-300 tabular-nums">
                {kinematicsTelemetry.distanceTraveled} m
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400">|Δr|</div>
              <div className="text-[11px] font-bold text-amber-300 tabular-nums">
                {kinematicsTelemetry.displacement} m
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400">Idő (t)</div>
              <div className="text-[11px] font-bold text-emerald-300 tabular-nums">
                {kinematicsTelemetry.movementTime} s
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400">Seb. (v)</div>
              <div className="text-[11px] font-bold text-white tabular-nums">
                {kinematicsTelemetry.currentSpeed} m/s
              </div>
            </div>
          </div>

          {/* Reward & Direct Lab Action Footer */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            <button
              onClick={() => openExperimentForQuest(currentQuest.id)}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2 cursor-pointer"
            >
              Kísérlet megnyitása ➔
            </button>
            <span className="text-amber-400 font-bold tabular-nums">
              +{currentQuest.points} PONT · +{currentQuest.xpReward || 60} XP
            </span>
          </div>
        </div>

        {/* Right Side: Colossal Vertical LEVELS Rail (1 to 6) with Explicit Unlock Checks */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest text-right px-1">
              DISTRICTS
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="absolute right-[15px] top-3 bottom-3 w-[2px] bg-slate-700" />

              {towerLevels.map((lvl) => {
                const isCurrent = lvl.districtNumber === activeTowerLevel;
                const unlockStatus = isDistrictUnlocked(lvl.districtNumber);
                const isUnlocked = unlockStatus.unlocked;

                return (
                  <div
                    key={lvl.districtNumber}
                    onClick={() =>
                      setSelectedLevelInfo(
                        selectedLevelInfo === lvl.districtNumber ? null : lvl.districtNumber
                      )
                    }
                    className={`flex items-center justify-end gap-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800/90 border border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-right">
                      <div
                        className="text-[11px] font-bold font-display tracking-wide"
                        style={{ color: isUnlocked ? lvl.color : '#64748b' }}
                      >
                        {lvl.name}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono -mt-0.5">
                        {lvl.subtitle}
                      </div>
                    </div>

                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-transform ${
                        isCurrent
                          ? 'border-2 scale-110 shadow-lg text-white'
                          : isUnlocked
                          ? 'border text-slate-200'
                          : 'border border-slate-700 bg-slate-900 text-slate-600'
                      }`}
                      style={{
                        borderColor: isUnlocked ? lvl.color : '#334155',
                        backgroundColor: isCurrent ? lvl.color : '#0f172a',
                        boxShadow: isCurrent ? `0 0 10px ${lvl.color}` : 'none',
                      }}
                    >
                      {lvl.districtNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Info & Explicit Gate Requirements Popup */}
          {selectedDistrictSpec && selectedDistrictCheck && (
            <div className="bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3.5 shadow-2xl max-w-xs text-xs text-slate-200 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-400 font-display">
                  {selectedDistrictSpec.name} (Szint {selectedDistrictSpec.districtNumber})
                </span>
                <button
                  onClick={() => setSelectedLevelInfo(null)}
                  className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedDistrictSpec.description}
              </p>

              {!selectedDistrictCheck.unlocked && (
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">
                    Feloldási feltételek:
                  </div>
                  {selectedDistrictCheck.missingReasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedDistrictCheck.unlocked ? '✓ Feloldva' : '🔒 Lezárt szektor'}
                </span>
                <button
                  onClick={() => {
                    setActiveTowerLevel(selectedDistrictSpec.districtNumber);
                    setSelectedLevelInfo(null);
                  }}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold cursor-pointer ${
                    selectedDistrictCheck.unlocked
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                  }`}
                >
                  {selectedDistrictCheck.unlocked
                    ? 'SZINT MEGLÁTOGATÁSA ➔'
                    : 'FELTÉTELEK ELLENŐRZÉSE'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM ROW: MINIMAP (Left), 3-CATEGORY INTERACTION PROMPT (Center), CONTROLS (Right) */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Radar Minimap */}
        <div className="pointer-events-auto">
          <Minimap
            playerX={playerCoordinates.x}
            playerZ={playerCoordinates.z}
            playerAngle={playerCoordinates.angle}
          />
        </div>

        {/* Bottom-Center: Context-Aware 3-Category Interaction Banner */}
        <div className="flex items-center justify-center flex-1 mx-4 mb-2">
          {interactionTarget ? (
            <div
              className={`pointer-events-auto animate-bounce-subtle backdrop-blur-md border-2 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3.5 cursor-pointer transition-all ${
                interactionTarget.category === 'main_quest'
                  ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-900/95'
                  : interactionTarget.category === 'side_quest'
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-900/95'
                  : 'bg-amber-950/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:bg-amber-900/95'
              }`}
              onClick={interactionTarget.action}
            >
              <div
                className={`px-2.5 h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${
                  interactionTarget.category === 'main_quest'
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                    : interactionTarget.category === 'side_quest'
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                    : 'bg-amber-500/30 border-amber-400 text-amber-200'
                }`}
              >
                {interactionTarget.promptKey || '[E] INTERAKCIÓ'}
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide font-display">
                  {interactionTarget.title}
                </div>
                <div className="text-[11px] text-slate-200">
                  {interactionTarget.subtitle || interactionTarget.hint}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white ml-1" />
            </div>
          ) : null}
        </div>

        {/* Bottom-Right: Keyboard Controls Helper */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between gap-3 text-slate-300">
            <span className="flex gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">S</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">D</kbd>
            </span>
            <span className="text-slate-400">Mozgás</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">Space</kbd>
            <span className="text-slate-400">Ugrás</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">E</kbd>
            <span className="text-slate-400">Vizsgálat / Kísérlet</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">Q</kbd>
            <span className="text-slate-400">Terminál & Modulok</span>
          </div>
        </div>
      </div>
    </div>
  );
};
