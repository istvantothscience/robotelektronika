import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { pointTrackerService } from '../services/pointTrackerService';
import { LEVEL_SPECIFICATIONS } from '../game/three/generators/LevelEnvironmentSpec';
import {
  X,
  Scroll,
  BookOpen,
  Briefcase,
  Database,
  CheckCircle2,
  Lock,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Sliders,
  Sparkles,
  Cpu,
  Wrench,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Send,
  MessageSquare,
} from 'lucide-react';

type TabKey =
  | 'quests'
  | 'side_quests'
  | 'upgrades'
  | 'lore'
  | 'discoveries'
  | 'inventory'
  | 'sync'
  | 'settings'
  | 'generator';

export const MenuModal: React.FC = () => {
  const {
    activeModal,
    activeMenuTab,
    closeModal,
    quests,
    completedQuestIds,
    discoveries,
    inventory,
    user,
    totalPoints,
    gameXp,
    syncState,
    quality,
    setQuality,
    isMuted,
    toggleMute,
    activeTowerLevel,
    setActiveTowerLevel,
    openExperimentForQuest,
    upgrades,
    toggleUpgradeEquipped,
    toolCapabilities,
    loreMemories,
    companion,
    sideQuests,
    submitSideQuest,
    reviewHomework,
    openWorldInteraction,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<TabKey>((activeMenuTab as TabKey) || 'quests');
  const [selectedGeneratorLevel, setSelectedGeneratorLevel] = useState<number>(activeTowerLevel || 1);

  // Side Quest / Homework state inside menu
  const [selectedSideQuestId, setSelectedSideQuestId] = useState<string>('sq-01-scrapyard-conductors');
  const [submissionDraft, setSubmissionDraft] = useState<string>('');
  const [teacherMode, setTeacherMode] = useState<boolean>(false);
  const [teacherFeedbackDraft, setTeacherFeedbackDraft] = useState<string>(
    'Kiváló megfigyelés! A megosztás és a szabad elektronok szerepét pontosan leírtad.'
  );

  // Form states for Supabase / Vercel Bridge
  const [supabaseUrl, setSupabaseUrl] = useState(syncState.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (activeModal !== 'menu') return null;

  const activeSideQuest =
    sideQuests.find((sq) => sq.id === selectedSideQuestId) || sideQuests[0];

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestResult(null);

    pointTrackerService.updateConfig(supabaseUrl, supabaseKey, vercelUrl);
    const ok = await pointTrackerService.testConnection();

    setTestingConnection(false);
    setTestResult({
      success: ok,
      message: ok
        ? 'Sikeres kapcsolat a Supabase / Vercel pontkövető rendszerrel!'
        : 'Nem sikerült csatlakozni. Ellenőrizd a megadott URL-t és publikus anon kulcsot!',
    });
  };

  const handleManualSync = async () => {
    setTestingConnection(true);
    await pointTrackerService.processPendingQueue();
    setTestingConnection(false);
  };

  const selectedLevelSpec =
    LEVEL_SPECIFICATIONS[selectedGeneratorLevel] || LEVEL_SPECIFICATIONS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">
        {/* Header with Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/75">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold text-white tracking-wide font-display mr-2">
              STEMPUNK TERMINÁL
            </h2>

            {/* Segmented Tab Controls */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('quests')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'quests'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Főküldetések</span>
              </button>

              <button
                onClick={() => setActiveTab('side_quests')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'side_quests'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Házi & Mellékküldetés</span>
              </button>

              <button
                onClick={() => setActiveTab('upgrades')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'upgrades'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>3D Robotmodulok</span>
              </button>

              <button
                onClick={() => setActiveTab('lore')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'lore'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Memóriák & VOLT-7</span>
              </button>

              <button
                onClick={() => setActiveTab('discoveries')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'discoveries'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Fizikai Tudástár</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Alkatrészek</span>
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sync'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Híd</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Beállítások</span>
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Világ Generátor</span>
              </button>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ================================================================= */}
          {/* TAB 1: MAIN QUESTS (CURRICULUM)                                   */}
          {/* ================================================================= */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    I. Kampány: Elektromosság és Fizika (16 Tanóra · 6 Vertikális Szektor)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    A főküldetések adják a tananyag gerincét. Teljesítsd az 1. Szektor 3 főküldetését a 2. Szintre való felemelkedéshez!
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">Hivatalos Iskolai Pont</div>
                    <div className="text-sm font-bold text-amber-400 tabular-nums">
                      {totalPoints} / 240 Pont
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Játék XP</div>
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">
                      {gameXp} XP
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quests.map((q) => {
                  const isDone = completedQuestIds.includes(q.id);
                  const isPlayableNow = q.active;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : isPlayableNow
                          ? 'bg-slate-800/60 border-cyan-500/50'
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isPlayableNow ? (
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="text-[11px] font-mono text-slate-400">
                            {q.lessonTitle.split(':')[0]}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                          +{q.points} Pont · +{q.xpReward || 60} XP
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mt-1.5 leading-snug">
                        {q.title}
                      </h4>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {q.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">{q.buildingName}</span>
                        {isDone ? (
                          <button
                            onClick={() => openExperimentForQuest(q.id)}
                            className="text-emerald-400 hover:underline font-medium cursor-pointer"
                          >
                            Jóváírva ✓ (Újrajátszás)
                          </button>
                        ) : isPlayableNow ? (
                          <button
                            onClick={() => openExperimentForQuest(q.id)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer"
                          >
                            Kísérlet Indítása ➔
                          </button>
                        ) : (
                          <span className="text-slate-500">Felsőbb szektorban nyílik</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SIDE QUESTS & HOMEWORK VERIFICATION                        */}
          {/* ================================================================= */}
          {activeTab === 'side_quests' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Mellékküldetések és Tanárilag Ellenőrzött Házi Feladatok
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A házi feladatok beküldéskor Játék XP-t adnak és „Tanári ellenőrzésre vár” (Pending) állapotba kerülnek. Hivatalos iskolai pont kizárólag tanári jóváhagyás után kerül jóváírásra!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sideQuests.map((sq) => {
                  const isSelected = sq.id === activeSideQuest.id;
                  return (
                    <button
                      key={sq.id}
                      onClick={() => {
                        setSelectedSideQuestId(sq.id);
                        setSubmissionDraft(sq.studentSubmissionText || '');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-400 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-emerald-400">
                          {sq.requiresTeacherVerification ? 'HÁZI FELADAT' : 'FELFEDEZÉS'}
                        </span>
                        <span className="text-amber-300">+{sq.xpReward} XP</span>
                      </div>
                      <div className="text-xs font-bold line-clamp-2">{sq.title}</div>
                    </button>
                  );
                })}
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeSideQuest.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{activeSideQuest.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeSideQuest.status === 'approved' && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tanárilag Jóváhagyva
                      </span>
                    )}
                    {activeSideQuest.status === 'pending_verification' && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-950 border border-amber-600 text-amber-300 text-xs font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Tanári ellenőrzésre vár (Pending)
                      </span>
                    )}
                    {activeSideQuest.status === 'rejected' && (
                      <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-600 text-rose-300 text-xs font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Javításra visszaküldve
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeSideQuest.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                    Feladat lépései & Fizikai háttér:
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {activeSideQuest.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-cyan-300 pt-1.5 border-t border-slate-800/80">
                    {activeSideQuest.educationalContent}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Megfigyelési jegyzőkönyv / Házi feladat válaszod:
                  </label>
                  <textarea
                    rows={3}
                    value={submissionDraft}
                    onChange={(e) => setSubmissionDraft(e.target.value)}
                    placeholder="Írd le a megfigyelésedet és a fizikai magyarázatot..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {activeSideQuest.requiresTeacherVerification
                        ? `Jutalom: +${activeSideQuest.xpReward} XP azonnal · +${activeSideQuest.schoolPointsReward} Iskolai Pont tanári jóváhagyás után`
                        : `Jutalom: +${activeSideQuest.xpReward} XP + Leyden-Kondenzátor 3D Modul`}
                    </span>
                    <button
                      onClick={() => submitSideQuest(activeSideQuest.id, submissionDraft)}
                      disabled={submissionDraft.trim().length < 8}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Beküldés</span>
                    </button>
                  </div>
                </div>

                {activeSideQuest.requiresTeacherVerification &&
                  activeSideQuest.status === 'pending_verification' && (
                    <div className="pt-3 border-t border-slate-800">
                      <button
                        onClick={() => setTeacherMode(!teacherMode)}
                        className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {teacherMode
                            ? 'Tanári Ellenőrző Panel elrejtése'
                            : 'Tanári Ellenőrző Panel megnyitása (Jóváhagyás / Elutasítás)'}
                        </span>
                      </button>

                      {teacherMode && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-700/50 space-y-2.5">
                          <input
                            type="text"
                            value={teacherFeedbackDraft}
                            onChange={(e) => setTeacherFeedbackDraft(e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                reviewHomework(activeSideQuest.id, 'approved', teacherFeedbackDraft)
                              }
                              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              ✓ Tanári Jóváhagyás (+{activeSideQuest.schoolPointsReward} Iskolai Pont)
                            </button>
                            <button
                              onClick={() =>
                                reviewHomework(
                                  activeSideQuest.id,
                                  'rejected',
                                  'Kérlek egészítsd ki a megosztás szerepével!'
                                )
                              }
                              className="px-3 py-1.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                            >
                              ✕ Visszaküldés javításra (0 Pont)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: MODULAR 3D CHARACTER UPGRADES & ENGINEERING TOOLS          */}
          {/* ================================================================= */}
          {activeTab === 'upgrades' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Látható Karakterfejlődés: Moduláris 3D Robotfejlesztések & Mérnöki Eszközök
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    A feloldott modulok közvetlenül megjelennek a 3D-s robotod testén (optikai korona, alkar-multitool, Leyden-hátizsák, kísérő szonda), miközben megőrzik a főhős sziluettjét.
                  </p>
                </div>
              </div>

              {/* Active Engineering Tool Capabilities Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className={toolCapabilities.includes('charge_scanner') ? 'text-emerald-400' : 'text-slate-500'}>
                  {toolCapabilities.includes('charge_scanner') ? '✓' : '○'} Töltés-Szkenner
                </div>
                <div className={toolCapabilities.includes('hv_grounding') ? 'text-emerald-400' : 'text-slate-500'}>
                  {toolCapabilities.includes('hv_grounding') ? '✓' : '○'} Nagyfeszültségű Földelő
                </div>
                <div className={toolCapabilities.includes('circuit_diagnostics') ? 'text-emerald-400' : 'text-slate-500'}>
                  {toolCapabilities.includes('circuit_diagnostics') ? '✓' : '○'} Vezető-Diagnosztika
                </div>
                <div className={toolCapabilities.includes('power_transfer') ? 'text-emerald-400' : 'text-slate-500'}>
                  {toolCapabilities.includes('power_transfer') ? '✓' : '○'} Energiaátvitel (+Sprint)
                </div>
              </div>

              {/* 4 Modular 3D Upgrade Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgrades.map((u) => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      u.unlocked
                        ? u.equipped
                          ? 'bg-amber-950/20 border-amber-500/70 shadow-lg'
                          : 'bg-slate-800/60 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-cyan-400 uppercase">
                          3D Csatlakozási Pont: {u.slot}
                        </span>
                        <span className={u.unlocked ? 'text-emerald-400' : 'text-amber-400'}>
                          {u.unlocked ? '✓ FELOLDVA' : '🔒 ZÁROLVA'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{u.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{u.description}</p>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
                        <div className="text-amber-300">
                          <span className="font-bold">3D Vizuális megjelenés: </span>
                          {u.visualDescription}
                        </div>
                        <div className="text-cyan-300">
                          <span className="font-bold">Játékmechanikai hatás: </span>
                          {u.gameplayEffect}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">
                        Szükséges XP: {u.requiredXp} XP {u.requiredQuestId ? `· Küldetés: ${u.requiredQuestId}` : ''}
                      </span>
                      {u.unlocked && (
                        <button
                          onClick={() => toggleUpgradeEquipped(u.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            u.equipped
                              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {u.equipped ? 'Felszerelve a 3D Robotra ✓' : 'Felszerelés'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: RECOVERABLE LORE MEMORIES & COMPANION VOLT-7               */}
          {/* ================================================================= */}
          {activeTab === 'lore' && (
            <div className="space-y-5">
              {/* Companion Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-cyan-300 font-display">
                    TÁRS AUTOMATA: {companion.name} · Kapcsolati szint {companion.relationshipLevel}/5 ({companion.relationshipTitle})
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{companion.motivation}</p>
                </div>
                <button
                  onClick={() => {
                    closeModal();
                    openWorldInteraction('companion-volt7');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Párbeszéd VOLT-7-tel</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Helyreállított Memóriatöredékek (Az 5 Narratív Pillér)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vizsgáld meg a völgyben található elhagyott roncsokat, táblákat és feljegyzéseket ([E] VIZSGÁLAT) a történet kibontásához!
                </p>
              </div>

              <div className="space-y-3">
                {loreMemories.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border ${
                      m.unlocked
                        ? 'bg-slate-800/70 border-amber-500/50'
                        : 'bg-slate-950/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-amber-400 uppercase">{m.themeLabel}</span>
                      <span>{m.unlocked ? `✓ ${m.locationName}` : '🔒 Még felfedezetlen a völgyben'}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    {m.unlocked ? (
                      <>
                        <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">{m.fullText}</p>
                        <div className="mt-2 pt-2 border-t border-slate-700/70 text-xs text-cyan-300">
                          {m.companionReflection}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1 italic">{m.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: DISCOVERIES                                                */}
          {/* ================================================================= */}
          {activeTab === 'discoveries' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Felfedezett Fizikai Fogalmak Naplója
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A játékban a megfigyelt és megértett természeti törvények itt kerülnek archiválásra.
                </p>
              </div>

              {discoveries.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Még nem oldottál fel felfedezést. Teljesítsd az első küldetést a laborban!
                </div>
              ) : (
                <div className="space-y-3">
                  {discoveries.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-cyan-300 font-display">
                          {d.title}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {d.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {d.description}
                      </p>

                      {d.formula && (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs text-amber-300">
                          Képlet: {d.formula}
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fő tanulság: {d.keyTakeaway}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: INVENTORY                                                  */}
          {/* ================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Robot Eszköztár és Alkatrészek
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A roncsvilágban gyűjtött elektronikai és mechanikai tárgyak.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      <div className="text-[10px] text-cyan-400 font-mono mt-1 uppercase">
                        Kategória: {item.category}
                      </div>
                    </div>
                    <div className="text-sm font-bold font-mono text-amber-400 tabular-nums px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: SUPABASE & VERCEL BRIDGE                                   */}
          {/* ================================================================= */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Meglévő Pontkövető Rendszer Integráció (Vercel & Supabase)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  A STEMPUNK játék közvetlenül a meglévő Vercelen futó Supabase pontkövető alkalmazásod klienseként működik. A kliens nem tárol titkos backend kulcsokat, a pontjóváírás idempotens és szerveroldalon kerül érvényesítésre.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {syncState.isConnected ? (
                    <CloudCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <CloudOff className="w-6 h-6 text-amber-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {syncState.isConnected
                        ? 'Kapcsolat aktív: Vercel / Supabase elérhető'
                        : 'Offline puffer mód (Helyi mentés aktív)'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {syncState.lastSyncTime
                        ? `Utolsó szinkronizálás: ${syncState.lastSyncTime}`
                        : 'Még nincs távoli szinkronizálás végrehajtva'}
                      {syncState.pendingCompletionsCount > 0 && (
                        <span className="text-amber-400 ml-2">
                          · {syncState.pendingCompletionsCount} elküldésre váró küldetés a pufferben
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {syncState.isConnected && syncState.pendingCompletionsCount > 0 && (
                  <button
                    onClick={handleManualSync}
                    disabled={testingConnection}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    <span>Puffer Küldése</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveConnection} className="space-y-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-display">
                  Szerver Elérhetőség Beállítása
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Projekt URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Anon Nyilvános Kulcs (Public Anon Key)
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vercel Pontkövető API URL (Opcionális)
                  </label>
                  <input
                    type="url"
                    value={vercelUrl}
                    onChange={(e) => setVercelUrl(e.target.value)}
                    placeholder="https://my-stempunk-tracker.vercel.app"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      testResult.success
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    A beállítások a böngésző helyi memóriájában tárolódnak.
                  </div>
                  <button
                    type="submit"
                    disabled={testingConnection}
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg cursor-pointer"
                  >
                    {testingConnection ? 'TESZTELÉS...' : 'KAPCSOLAT TESZTELÉSE ÉS MENTÉS'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: SETTINGS                                                   */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Játékbeállítások & Teljesítmény
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grafikai finomhangolás gyengébb vagy erősebb hardverekhez.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Grafikai Részletesség</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Árnyékok, részecskék és felbontási skálázás minősége.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-700">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`px-3 py-1 text-xs font-medium rounded capitalize cursor-pointer ${
                          quality === q
                            ? 'bg-cyan-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {q === 'low' ? 'Alacsony' : q === 'medium' ? 'Közepes' : 'Magas (PBR)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Hanghatások & Szintetizátor</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Procedurális Web Audio API lépések, szikrák és jutalom fanfárok.
                    </p>
                  </div>
                  <button
                    onClick={toggleMute}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isMuted
                        ? 'bg-rose-900/60 border border-rose-700 text-rose-200'
                        : 'bg-emerald-900/60 border border-emerald-700 text-emerald-200'
                    }`}
                  >
                    {isMuted ? 'Némítva' : 'Bekapcsolva'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="text-xs font-semibold text-white mb-2">Bejelentkezett Tanulói Fiók</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <div>Név: <span className="text-white font-bold">{user.displayName}</span></div>
                    <div>Azonosító: <span className="text-cyan-300">{user.id}</span></div>
                    <div>Osztály: <span className="text-slate-400">{user.classId}</span></div>
                    <div>Szerepkör: <span className="text-amber-400">{user.role}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 9: PROCEDURAL WORLD GENERATOR SPEC VIEWER                     */}
          {/* ================================================================= */}
          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Parametrikus 3D Világgenerátor Specifikáció (Szint 1–6)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    3-szintű környezeti kompozíció: Nagy ipari épületek és roncshegyek, közepes gőzgépek és csőhidak, apró szétszórt alkatrészek.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedGeneratorLevel(lvl)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                        selectedGeneratorLevel === lvl
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Szint {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-cyan-400">
                      SZEKTOR #{selectedLevelSpec.levelNumber} · {selectedLevelSpec.subtitle}
                    </div>
                    <h4 className="text-base font-bold text-white font-display">
                      {selectedLevelSpec.name} — {selectedLevelSpec.facility.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTowerLevel(selectedGeneratorLevel);
                      closeModal();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Szint Betöltése / Ellenőrzése
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 overflow-x-auto max-h-72">
                  {JSON.stringify(selectedLevelSpec, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
