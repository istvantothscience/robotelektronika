import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Minimap } from './Minimap';
import {
  Zap,
  Settings,
  CheckCircle2,
  Circle,
  HelpCircle,
  Info,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const HUD: React.FC = () => {
  const {
    user,
    level,
    totalPoints,
    quests,
    currentQuestId,
    completedQuestIds,
    interactionTarget,
    playerCoordinates,
    activeTowerLevel,
    setActiveTowerLevel,
    openModal,
  } = useGameStore();

  const [selectedLevelInfo, setSelectedLevelInfo] = useState<number | null>(null);

  const currentQuest = quests.find((q) => q.id === currentQuestId) || quests[0];
  const isCompleted = completedQuestIds.includes(currentQuest.id);

  // Tower levels definitions matching the concept art
  const towerLevels = [
    {
      num: 6,
      name: 'SKY CITY',
      subtitle: 'Innovation & Future',
      color: '#38bdf8',
      desc: 'Lebegő kutatóplatformok és tiszta futurisztikus technológia. A végső fizikai megértés helyszíne.',
    },
    {
      num: 5,
      name: 'RESEARCH',
      subtitle: 'Micro:bit & Electronics',
      color: '#2dd4bf',
      desc: 'Automatizációs laboratórium: mikrokontrollerek, fényszenzorok és önműködő áramkörök programozása.',
    },
    {
      num: 4,
      name: 'POWER',
      subtitle: 'Circuits & Energy',
      color: '#ffb52e',
      desc: 'Ipari generátorok, transzformátorok és a város energiahálózatának felügyelete.',
    },
    {
      num: 3,
      name: 'CIRCUIT',
      subtitle: 'Electric Current',
      color: '#22d3ee',
      desc: 'Áramkörépítő labor: Ohm-törvény, soros és párhuzamos kapcsolások holografikus asztala.',
    },
    {
      num: 2,
      name: 'STATIC',
      subtitle: 'Electrostatics',
      color: '#8b5cf6',
      desc: 'Elektrosztatikus kutatólabor: töltések szétválasztása, dörzsölés, Coulomb-erő és megosztás.',
    },
    {
      num: 1,
      name: 'UNDERWORLD',
      subtitle: 'The Beginning',
      color: '#f97316',
      desc: 'A sötét ipari roncstelep mélye. Innen indul a robot felemelkedése a tudás révén.',
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 overflow-hidden">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: STEMPUNK Logo with Gear */}
        <div className="pointer-events-auto flex items-center gap-3">
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
              PHYSICS ADVENTURE
            </span>
          </div>
        </div>

        {/* Top-Right: Player Card Matching Artwork */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-2.5 pr-4 shadow-2xl">
          {/* Circular Robot Avatar with metallic rim */}
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
                onClick={() => openModal('menu', 'settings')}
                title="Beállítások"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[10px] text-cyan-300 font-medium font-mono">
              Level {level} – Static Researcher
            </span>

            {/* XP progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, (totalPoints / 120) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-300 tabular-nums">
                {totalPoints} / 120 XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE AREA: CURRENT MISSION (Left) & VERTICAL LEVELS RAIL (Right) */}
      <div className="flex items-start justify-between w-full my-auto pointer-events-none">
        {/* Left Side: CURRENT MISSION Card */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl max-w-xs transition-all">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                CURRENT MISSION
              </div>
              <h3 className="text-xs font-bold text-white font-display tracking-wide">
                {currentQuest.title}
              </h3>
            </div>
          </div>

          {/* Mission Objectives Checklist matching the image */}
          <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Keresd meg a töltött anyagokat</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>Kísérletezz a műanyag rúddal & papírral</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>Magyarázd meg a vonzás okát</span>
            </div>
          </div>

          {/* Reward Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            <span className="text-slate-400">Jutalom:</span>
            <span className="text-amber-400 font-bold tabular-nums">
              +{currentQuest.points} PONT · +50 XP
            </span>
          </div>
        </div>

        {/* Right Side: Colossal Vertical LEVELS Rail (1 to 6) */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest text-right px-1">
              LEVELS
            </div>

            <div className="flex flex-col gap-2 relative">
              {/* Vertical connecting line */}
              <div className="absolute right-[15px] top-3 bottom-3 w-[2px] bg-slate-700" />

              {towerLevels.map((lvl) => {
                const isCurrent = lvl.num === activeTowerLevel;
                const isUnlocked = lvl.num <= activeTowerLevel;

                return (
                  <div
                    key={lvl.num}
                    onClick={() => setSelectedLevelInfo(selectedLevelInfo === lvl.num ? null : lvl.num)}
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

                    {/* Circular Level Node */}
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
                      {lvl.num}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Info Tooltip Popup */}
          {selectedLevelInfo !== null && (
            <div className="bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-3 shadow-2xl max-w-xs text-xs text-slate-200 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-400 font-display">
                  {towerLevels.find((l) => l.num === selectedLevelInfo)?.name} (Szint {selectedLevelInfo})
                </span>
                <button
                  onClick={() => setSelectedLevelInfo(null)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {towerLevels.find((l) => l.num === selectedLevelInfo)?.desc}
              </p>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedLevelInfo <= activeTowerLevel ? '✓ Elérhető terület' : '🔒 Felemelkedési szint'}
                </span>
                <button
                  onClick={() => {
                    setActiveTowerLevel(selectedLevelInfo);
                    setSelectedLevelInfo(null);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold cursor-pointer"
                >
                  SZINT MEGLÁTOGATÁSA ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM ROW: MINIMAP (Left), INTERACTION PROMPT (Center), CONTROLS (Right) */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Radar Minimap */}
        <div className="pointer-events-auto">
          <Minimap
            playerX={playerCoordinates.x}
            playerZ={playerCoordinates.z}
            playerAngle={playerCoordinates.angle}
          />
        </div>

        {/* Bottom-Center: Context-Aware Interaction Banner */}
        <div className="flex items-center justify-center flex-1 mx-4 mb-2">
          {interactionTarget ? (
            <div
              className="pointer-events-auto animate-bounce-subtle bg-cyan-950/90 backdrop-blur-md border-2 border-cyan-400 rounded-xl px-5 py-3 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-3.5 cursor-pointer hover:bg-cyan-900/95 transition-all"
              onClick={interactionTarget.action}
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/30 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-200 text-sm">
                E
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide font-display">
                  {interactionTarget.title}
                </div>
                <div className="text-[11px] text-cyan-200">
                  {interactionTarget.hint}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-300 ml-1" />
            </div>
          ) : null}
        </div>

        {/* Bottom-Right: Keyboard Controls Helper Matching Artwork */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between gap-3 text-slate-300">
            <span className="flex gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">S</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">D</kbd>
            </span>
            <span className="text-slate-400">Move</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">Space</kbd>
            <span className="text-slate-400">Jump</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">E</kbd>
            <span className="text-slate-400">Interact</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-300">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">Shift</kbd>
            <span className="text-slate-400">Sprint</span>
          </div>
        </div>
      </div>
    </div>
  );
};
