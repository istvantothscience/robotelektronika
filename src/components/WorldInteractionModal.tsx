import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  COMPANION_DIALOGUE_NODES,
  LEVEL_1_WORLD_INTERACTABLES,
} from '../data/worldContent';
import {
  X,
  Sparkles,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  Eye,
  Send,
  ArrowUpRight,
  Lock,
} from 'lucide-react';

export const WorldInteractionModal: React.FC = () => {
  const {
    activeModal,
    activeInteractableId,
    closeModal,
    companion,
    selectCompanionDialogue,
    loreMemories,
    sideQuests,
    submitSideQuest,
    reviewHomework,
    completedQuestIds,
    isDistrictUnlocked,
    setActiveTowerLevel,
    openModal,
  } = useGameStore();

  const [selectedSideQuestId, setSelectedSideQuestId] = useState<string>('sq-01-scrapyard-conductors');
  const [submissionDraft, setSubmissionDraft] = useState<string>('');
  const [teacherMode, setTeacherMode] = useState<boolean>(false);
  const [teacherFeedbackDraft, setTeacherFeedbackDraft] = useState<string>(
    'Szép megfigyelés! A megosztás és a töltések szerepét pontosan leírtad.'
  );

  if (activeModal !== 'world_interaction' || !activeInteractableId) return null;

  const spec =
    LEVEL_1_WORLD_INTERACTABLES.find((item) => item.id === activeInteractableId) ||
    LEVEL_1_WORLD_INTERACTABLES[3];

  const linkedLore = spec.linkedLoreId
    ? loreMemories.find((l) => l.id === spec.linkedLoreId)
    : undefined;

  const activeDialogueNode =
    COMPANION_DIALOGUE_NODES.find((d) => d.id === companion.activeTopicId) ||
    COMPANION_DIALOGUE_NODES[0];

  const activeSideQuest =
    sideQuests.find((sq) => sq.id === selectedSideQuestId) || sideQuests[0];

  const district2Check = isDistrictUnlocked(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                spec.isCompanion
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : spec.category === 'side_quest'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300'
              }`}
            >
              {spec.isCompanion ? (
                <MessageSquare className="w-4 h-4" />
              ) : spec.category === 'side_quest' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {spec.isCompanion
                  ? 'TÁRS AUTOMATA INTERAKCIÓ'
                  : spec.category === 'side_quest'
                  ? 'MELLÉKKÜLDETÉS & HÁZI FELADAT TERMINÁL'
                  : 'KÖRNYEZETI VIZSGÁLAT (AMBIENT INTERACTION · 0 ISKOLAI PONT)'}
              </div>
              <h2 className="text-base font-bold text-white font-display tracking-wide">
                {spec.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ================================================================= */}
          {/* CASE 1: COMPANION VOLT-7 ("SZIKRA") DIALOGUE                      */}
          {/* ================================================================= */}
          {spec.isCompanion && (
            <div className="space-y-5">
              {/* Companion Relationship Status Banner */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <div className="w-4 h-4 rounded-full bg-cyan-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-display">
                        {companion.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded">
                        Kapcsolati szint {companion.relationshipLevel}/5: {companion.relationshipTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{companion.personality}</p>
                  </div>
                </div>

                <div className="w-full sm:w-36">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Bizalom</span>
                    <span className="text-cyan-300">{companion.trustPoints} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, companion.trustPoints)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Topic Selector Buttons */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">
                  Válassz kérdést VOLT-7 számára:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMPANION_DIALOGUE_NODES.map((node) => {
                    const isSelected = node.id === activeDialogueNode.id;
                    const isDone = companion.unlockedDialogueIds.includes(`${node.id}-done`);
                    return (
                      <button
                        key={node.id}
                        onClick={() => selectCompanionDialogue(node.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-semibold leading-snug">{node.title}</span>
                        {isDone && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Dialogue Exchange */}
              <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="text-xs text-amber-300 font-medium italic">
                  Te (#734): „{activeDialogueNode.playerPrompt}”
                </div>
                <div className="text-sm text-slate-100 leading-relaxed pl-3 border-l-2 border-cyan-400">
                  {activeDialogueNode.companionResponse}
                </div>
                {activeDialogueNode.scientificInsight && (
                  <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{activeDialogueNode.scientificInsight}</span>
                  </div>
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => openModal('menu', 'upgrades')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Robotfejlesztések & 3D Modulok megnyitása</span>
                </button>
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Folytatás a völgyben
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CASE 2: SIDE QUESTS & HOMEWORK VERIFICATION BOARD                 */}
          {/* ================================================================= */}
          {spec.category === 'side_quest' && (
            <div className="space-y-5">
              {/* Side Quest Selector Tabs */}
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

              {/* Active Side Quest Details */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeSideQuest.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeSideQuest.location}</p>
                  </div>

                  {/* Verification Status Badge */}
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

                {/* Reward Rule Notice */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-amber-400">
                    Játék XP jutalom: +{activeSideQuest.xpReward} XP
                  </span>
                  <span className="text-cyan-300">
                    {activeSideQuest.requiresTeacherVerification
                      ? `Iskolai Pont: +${activeSideQuest.schoolPointsReward} Pont (Kizárólag tanári jóváhagyás után!)`
                      : 'Iskolai Pont: 0 Pont (Szabad felfedező mellékküldetés)'}
                  </span>
                </div>

                {/* Student Observation / Homework Submission Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Megfigyelési jegyzőkönyv / Házi feladat válaszod:
                  </label>
                  <textarea
                    rows={3}
                    value={submissionDraft}
                    onChange={(e) => setSubmissionDraft(e.target.value)}
                    placeholder="Írd le röviden, mit figyeltél meg a kísérlet vagy a vizsgálat során, és mi a fizikai magyarázata..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {activeSideQuest.requiresTeacherVerification
                        ? 'Beküldés után a feladat „Tanári ellenőrzésre vár” állapotba kerül.'
                        : 'Beküldés után azonnal feloldja a Leyden-Kondenzátor Hátizsák modult!'}
                    </span>
                    <button
                      onClick={() => submitSideQuest(activeSideQuest.id, submissionDraft)}
                      disabled={submissionDraft.trim().length < 8}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Jegyzőkönyv Beküldése</span>
                    </button>
                  </div>
                </div>

                {/* Teacher Feedback if reviewed */}
                {activeSideQuest.teacherFeedback && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-700/50 text-xs text-cyan-200">
                    <span className="font-bold">Tanári visszajelzés: </span>
                    {activeSideQuest.teacherFeedback}
                  </div>
                )}

                {/* Teacher Verification Simulator Toggle (For testing approval/rejection workflow) */}
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
                            : 'Tanári Ellenőrző Panel megnyitása (Jóváhagyás / Elutasítás tesztelése)'}
                        </span>
                      </button>

                      {teacherMode && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-700/50 space-y-2.5">
                          <div className="text-xs font-bold text-amber-300">
                            Tanári Bírálat ({activeSideQuest.title})
                          </div>
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
          {/* CASE 3: AMBIENT WORLD INTERACTION & LORE MEMORY RECOVERY          */}
          {/* ================================================================= */}
          {spec.category === 'ambient' && !spec.isCompanion && (
            <div className="space-y-4">
              {spec.ambientInspection && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-amber-400 uppercase">
                    Tárgy típusa: {spec.ambientInspection.objectType}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {spec.ambientInspection.sensoryDescription}
                  </p>
                  <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200">
                    <span className="font-bold text-cyan-300">Mérnöki-fizikai megfigyelés: </span>
                    {spec.ambientInspection.scientificObservation}
                  </div>
                  <div className="text-xs text-amber-200/90 italic pl-3 border-l-2 border-amber-500">
                    {spec.ambientInspection.narrativeWhisper}
                  </div>
                </div>
              )}

              {linkedLore && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      HELYREÁLLÍTOTT MEMÓRIATÖREDÉK · {linkedLore.themeLabel}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">✓ Feloldva</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{linkedLore.title}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{linkedLore.fullText}</p>
                  <div className="text-xs text-cyan-300 pt-2 border-t border-slate-800/80">
                    {linkedLore.companionReflection}
                  </div>
                </div>
              )}

              {/* Special Case: Elevator Gate to District 2 (Static Research) */}
              {spec.id === 'ambient-elevator-gate' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 font-display">
                      2. SZEKTOR (STATIC RESEARCH) FELVONÓ ÁLLAPOTA
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        district2Check.unlocked ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {district2Check.unlocked ? '✓ NYITVA' : '🔒 LEZÁRVA'}
                    </span>
                  </div>

                  {!district2Check.unlocked ? (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="text-slate-400">
                        A felemelkedéshez az alábbi feltételek teljesítése szükséges (pusztán XP-vel nem oldható fel):
                      </div>
                      {district2Check.missingReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-amber-300">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                      <div className="text-[11px] text-slate-400 pt-1">
                        Teljesített alsóvárosi főküldetések: {completedQuestIds.length} / 3
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-300">
                        Minden elektrosztatikai próbatételt teljesítettél! A felvonó készen áll.
                      </span>
                      <button
                        onClick={() => {
                          setActiveTowerLevel(2);
                          closeModal();
                        }}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Felemelkedés a 2. Szintre</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Bezárás
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
