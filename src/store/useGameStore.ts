import { create } from 'zustand';
import { CAMPAIGN_QUESTS, INITIAL_DISCOVERIES } from '../data/quests';
import {
  COMPANION_DIALOGUE_NODES,
  COMPANION_INITIAL_STATE,
  DISTRICT_PROGRESSION_SPECS,
  INITIAL_CHARACTER_UPGRADES,
  INITIAL_LORE_MEMORIES,
  INITIAL_SIDE_QUESTS,
  LEVEL_1_WORLD_INTERACTABLES,
} from '../data/worldContent';
import { pointTrackerService, DEFAULT_STUDENT } from '../services/pointTrackerService';
import {
  Discovery,
  Quest,
  UserProfile,
  PlayerInventoryItem,
  BackendSyncState,
  CharacterUpgrade,
  LoreMemoryEntry,
  SideQuest,
  CompanionState,
  EngineeringToolCapability,
  InteractionCategory,
  KinematicsTelemetryState,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

const PROGRESSION_STORAGE_KEY = 'stempunk_progression_state_v2';

interface PersistedProgressionState {
  gameXp: number;
  unlockedUpgradeIds: string[];
  equippedUpgradeIds: string[];
  unlockedLoreIds: string[];
  storyEvents: string[];
  inspectedAmbientIds: string[];
  companionTrust: number;
  sideQuestStates: Record<
    string,
    {
      status: SideQuest['status'];
      studentSubmissionText?: string;
      submittedAt?: string;
      teacherFeedback?: string;
    }
  >;
}

function loadPersistedProgression(): PersistedProgressionState {
  try {
    const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    gameXp: 25,
    unlockedUpgradeIds: ['upg-optical-sensors'],
    equippedUpgradeIds: ['upg-optical-sensors'],
    unlockedLoreIds: ['lore-01-awakening'],
    storyEvents: [],
    inspectedAmbientIds: [],
    companionTrust: 10,
    sideQuestStates: {},
  };
}

function savePersistedProgression(state: Partial<PersistedProgressionState>) {
  try {
    const current = loadPersistedProgression();
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify({ ...current, ...state }));
  } catch {
    // ignore
  }
}

interface ToastNotification {
  id: string;
  type: 'quest' | 'discovery' | 'points' | 'sync' | 'info';
  title: string;
  message: string;
}

export interface GameStoreState {
  // Player & Authoritative School Points vs Game XP
  user: UserProfile;
  totalPoints: number; // Authoritative School Points (Iskolai Pontok)
  gameXp: number;      // Game XP (Tapasztalati Pontok - separate from school points!)
  level: number;
  quests: Quest[];
  currentQuestId: string;
  activeExperimentQuestId: string;
  completedQuestIds: string[];
  discoveries: Discovery[];
  inventory: PlayerInventoryItem[];

  // Narrative, Upgrades, Companion & Side Quests
  upgrades: CharacterUpgrade[];
  toolCapabilities: EngineeringToolCapability[];
  loreMemories: LoreMemoryEntry[];
  sideQuests: SideQuest[];
  companion: CompanionState;
  storyEvents: string[];
  inspectedAmbientIds: string[];

  // World, Cinematic Intro, RO-01 Speech Bubbles & Kinematics Telemetry
  currentLocationName: string;
  playerCoordinates: { x: number; z: number; angle: number };
  activeTowerLevel: number; // 1 to 6
  selectedTowerLevelPreview: number | null;
  showCinematicIntro: boolean;
  showIntroStory: boolean;
  introDialogStep: number;
  activeSpeechBubble: {
    id: string;
    speaker: string;
    title: string;
    text: string;
    status?: string;
  } | null;
  spokenBubbleIds: string[];
  lastCollisionBubbleTime: number;
  kinematicsTelemetry: KinematicsTelemetryState;

  // Interactivity & UI states
  interactionTarget: {
    id?: string;
    category?: InteractionCategory;
    promptKey?: string;
    type: 'terminal' | 'door' | 'bench' | 'npc';
    title: string;
    subtitle?: string;
    hint: string;
    action: () => void;
  } | null;

  activeModal: 'experiment' | 'menu' | 'settings' | 'world_interaction' | null;
  activeMenuTab:
    | 'quests'
    | 'side_quests'
    | 'upgrades'
    | 'lore'
    | 'discoveries'
    | 'inventory'
    | 'sync'
    | 'settings'
    | 'generator';
  activeInteractableId: string | null;

  // Backend Sync State
  syncState: BackendSyncState;

  // Visual & Audio Settings
  quality: 'low' | 'medium' | 'high';
  isMuted: boolean;
  toasts: ToastNotification[];

  // Actions
  finishCinematicIntro: () => void;
  replayCinematicIntro: () => void;
  triggerSpeechBubble: (
    bubble: { id: string; speaker: string; title: string; text: string; status?: string },
    allowRepeatAfterMs?: number
  ) => void;
  dismissSpeechBubble: () => void;
  updateKinematicsTelemetry: (partial: Partial<KinematicsTelemetryState>) => void;
  advanceIntroDialog: () => void;
  dismissIntroStory: () => void;
  setPlayerCoordinates: (x: number, z: number, angle: number) => void;
  setActiveTowerLevel: (level: number) => void;
  setSelectedTowerLevelPreview: (level: number | null) => void;
  setInteractionTarget: (target: GameStoreState['interactionTarget']) => void;
  openModal: (modal: GameStoreState['activeModal'], tab?: GameStoreState['activeMenuTab']) => void;
  openExperimentForQuest: (questId: string) => void;
  openWorldInteraction: (interactableId: string) => void;
  closeModal: () => void;
  setCurrentLocation: (locName: string) => void;
  toggleMute: () => void;
  setQuality: (q: 'low' | 'medium' | 'high') => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;

  // Quest, Upgrade, Lore, Companion & Homework actions
  completeQuest: (questId: string, attemptData: Record<string, unknown>) => Promise<boolean>;
  unlockDiscovery: (discoveryId: string) => void;
  unlockLoreMemory: (loreId: string) => void;
  inspectAmbientObject: (interactableId: string) => void;
  unlockUpgrade: (upgradeId: string) => void;
  toggleUpgradeEquipped: (upgradeId: string) => void;
  selectCompanionDialogue: (dialogueId: string) => void;
  submitSideQuest: (sideQuestId: string, submissionText: string) => void;
  reviewHomework: (sideQuestId: string, decision: 'approved' | 'rejected', feedback: string) => void;
  isDistrictUnlocked: (districtNumber: number) => {
    unlocked: boolean;
    missingReasons: string[];
  };
  updateUser: (user: UserProfile) => void;
}

function computeToolCapabilities(upgrades: CharacterUpgrade[]): EngineeringToolCapability[] {
  const caps = new Set<EngineeringToolCapability>(['basic_inspect']);
  upgrades.forEach((u) => {
    if (u.unlocked && u.equipped && u.unlockedToolCapability) {
      caps.add(u.unlockedToolCapability);
      if (u.id === 'upg-engineering-multitool') {
        caps.add('hv_grounding');
      }
    }
  });
  return Array.from(caps);
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialUser = pointTrackerService.getCurrentUser();
  const storedCompletions = pointTrackerService.getCompletions();
  const storedHomework = pointTrackerService.getHomeworkSubmissions();
  const persisted = loadPersistedProgression();

  const completedIds = storedCompletions.map((c) => c.questId);
  const questPoints = storedCompletions.reduce((sum, c) => sum + c.pointsAwarded, 0);
  const approvedHomeworkPoints = storedHomework
    .filter((h) => h.status === 'approved')
    .reduce((sum, h) => sum + h.schoolPointsAwarded, 0);
  const totalPts = questPoints + approvedHomeworkPoints;

  // Restore upgrades based on completed quests + persisted state
  const autoUnlockedUpgrades = new Set<string>(persisted.unlockedUpgradeIds);
  const autoEquippedUpgrades = new Set<string>(persisted.equippedUpgradeIds);
  const autoStoryEvents = new Set<string>(persisted.storyEvents);

  CAMPAIGN_QUESTS.forEach((q) => {
    if (completedIds.includes(q.id)) {
      if (q.unlocksUpgradeId) {
        autoUnlockedUpgrades.add(q.unlocksUpgradeId);
        autoEquippedUpgrades.add(q.unlocksUpgradeId);
      }
      if (q.unlocksStoryEvent) {
        autoStoryEvents.add(q.unlocksStoryEvent);
      }
    }
  });

  const initialUpgrades = INITIAL_CHARACTER_UPGRADES.map((u) => ({
    ...u,
    unlocked: u.unlocked || autoUnlockedUpgrades.has(u.id),
    equipped: u.equipped || autoEquippedUpgrades.has(u.id),
  }));

  const initialLore = INITIAL_LORE_MEMORIES.map((l) => ({
    ...l,
    unlocked: l.unlocked || persisted.unlockedLoreIds.includes(l.id),
  }));

  const initialSideQuests = INITIAL_SIDE_QUESTS.map((sq) => {
    const hwRecord = storedHomework.find((h) => h.sideQuestId === sq.id);
    const saved = persisted.sideQuestStates[sq.id];
    if (hwRecord) {
      return {
        ...sq,
        status: hwRecord.status,
        studentSubmissionText: hwRecord.submissionText,
        submittedAt: hwRecord.submittedAt,
        teacherFeedback: hwRecord.teacherFeedback,
      };
    }
    if (saved) {
      return {
        ...sq,
        ...saved,
      };
    }
    return sq;
  });

  const initialQuests = CAMPAIGN_QUESTS.map((q) => {
    if (completedIds.includes(q.id)) return { ...q, active: true };
    if (q.requiredQuestId && completedIds.includes(q.requiredQuestId)) return { ...q, active: true };
    return q;
  });

  const nextActiveQuest =
    initialQuests.find((q) => !completedIds.includes(q.id) && q.active) || initialQuests[0];

  const initialUnlockedDiscoveries = INITIAL_DISCOVERIES.filter((d) => {
    if (d.id === 'static-charge') return true;
    if (d.id === 'charge-types' && completedIds.includes('quest-02-charges')) return true;
    if (d.id === 'conductors-insulators' && completedIds.includes('quest-03-rubbing')) return true;
    return false;
  });

  const initialCompanion: CompanionState = {
    ...COMPANION_INITIAL_STATE,
    trustPoints: persisted.companionTrust,
    relationshipLevel: Math.min(5, Math.floor(persisted.companionTrust / 25) + 1),
    relationshipTitle:
      persisted.companionTrust >= 75
        ? 'Elválaszthatatlan Mérnöktárs'
        : persisted.companionTrust >= 45
        ? 'Megbízható Szövetséges'
        : persisted.companionTrust >= 25
        ? 'Barátságos Segítőtárs'
        : 'Óvatos Megfigyelő',
  };

  return {
    user: initialUser || DEFAULT_STUDENT,
    totalPoints: totalPts,
    gameXp: Math.max(persisted.gameXp, completedIds.length * 65 + 25),
    level: Math.floor(Math.max(persisted.gameXp, completedIds.length * 65 + 25) / 80) + 1,
    quests: initialQuests,
    currentQuestId: nextActiveQuest.id,
    activeExperimentQuestId: nextActiveQuest.id,
    completedQuestIds: completedIds,
    discoveries: initialUnlockedDiscoveries,
    upgrades: initialUpgrades,
    toolCapabilities: computeToolCapabilities(initialUpgrades),
    loreMemories: initialLore,
    sideQuests: initialSideQuests,
    companion: initialCompanion,
    storyEvents: Array.from(autoStoryEvents),
    inspectedAmbientIds: persisted.inspectedAmbientIds,
    inventory: [
      {
        id: 'multimeter',
        name: 'Többfunkciós Elektromos Szonda',
        description: 'Feszültség-, töltés- és folytonosságmérő mérnöki műszer.',
        category: 'tool',
        icon: 'Gauge',
        quantity: 1,
      },
      {
        id: 'copper-wire',
        name: 'Vörösréz huzal tekercs',
        description: 'Nagy tisztaságú szigetelt elektromos vezető.',
        category: 'material',
        icon: 'Cable',
        quantity: 3,
      },
      {
        id: 'porcelain-insulator',
        name: 'Porcelán Szigetelőgyűrű',
        description: 'Magasfeszültségű ívkisülések elszigetelésére szolgáló kerámia.',
        category: 'component',
        icon: 'Shield',
        quantity: 2,
      },
    ],
    currentLocationName: 'Level 1: Alsóvárosi Roncstelep',
    playerCoordinates: { x: 0, z: 11, angle: 0 },
    activeTowerLevel: 1,
    selectedTowerLevelPreview: null,
    showCinematicIntro: true,
    showIntroStory: false,
    introDialogStep: 0,
    activeSpeechBubble: null,
    spokenBubbleIds: [],
    lastCollisionBubbleTime: 0,
    kinematicsTelemetry: {
      distanceTraveled: 0,
      displacement: 0,
      movementTime: 0,
      currentSpeed: 0,
      currentAcceleration: 0,
      crateBypassed: false,
      sensorReached: false,
      hasMovedOnce: false,
    },
    interactionTarget: null,
    activeModal: null,
    activeMenuTab: 'quests',
    activeInteractableId: null,
    syncState: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      isConnected: false,
      isSyncing: false,
      lastSyncTime: null,
      pendingCompletionsCount: 0,
      lastError: null,
    },
    quality: 'high',
    isMuted: false,
    toasts: [],

    finishCinematicIntro: () => {
      soundManager.playTerminalClick();
      set({
        showCinematicIntro: false,
        showIntroStory: true,
        introDialogStep: 0,
      });
    },

    replayCinematicIntro: () => {
      soundManager.playTerminalClick();
      set({
        showCinematicIntro: true,
        activeModal: null,
      });
    },

    triggerSpeechBubble: (bubble, allowRepeatAfterMs) => {
      const state = get();
      const now = Date.now();
      if (allowRepeatAfterMs) {
        if (now - state.lastCollisionBubbleTime < allowRepeatAfterMs) return;
        set({
          activeSpeechBubble: bubble,
          lastCollisionBubbleTime: now,
        });
        return;
      }
      if (state.spokenBubbleIds.includes(bubble.id)) return;
      set({
        activeSpeechBubble: bubble,
        spokenBubbleIds: [...state.spokenBubbleIds, bubble.id],
      });
    },

    dismissSpeechBubble: () => {
      soundManager.playTerminalClick();
      set({ activeSpeechBubble: null });
    },

    updateKinematicsTelemetry: (partial) => {
      set((state) => ({
        kinematicsTelemetry: {
          ...state.kinematicsTelemetry,
          ...partial,
        },
      }));
    },

    advanceIntroDialog: () => {
      soundManager.playTerminalClick();
      const current = get().introDialogStep;
      if (current < 2) {
        set({ introDialogStep: current + 1 });
      } else {
        set({ showIntroStory: false });
      }
    },

    dismissIntroStory: () => {
      soundManager.playTerminalClick();
      set({ showIntroStory: false });
    },

    setPlayerCoordinates: (x, z, angle) => set({ playerCoordinates: { x, z, angle } }),
    setActiveTowerLevel: (activeTowerLevel) => set({ activeTowerLevel }),
    setSelectedTowerLevelPreview: (selectedTowerLevelPreview) => set({ selectedTowerLevelPreview }),
    setInteractionTarget: (target) => set({ interactionTarget: target }),

    openModal: (modal, tab) => {
      soundManager.playTerminalClick();
      set({
        activeModal: modal,
        ...(tab ? { activeMenuTab: tab } : {}),
      });
    },

    openExperimentForQuest: (questId) => {
      soundManager.playTerminalClick();
      set({
        activeExperimentQuestId: questId,
        activeModal: 'experiment',
      });
    },

    openWorldInteraction: (interactableId) => {
      soundManager.playTerminalClick();
      set({
        activeInteractableId: interactableId,
        activeModal: 'world_interaction',
      });
    },

    closeModal: () => set({ activeModal: null }),

    setCurrentLocation: (locName) => set({ currentLocationName: locName }),

    toggleMute: () => {
      const nextMuted = !get().isMuted;
      soundManager.setMuted(nextMuted);
      set({ isMuted: nextMuted });
    },

    setQuality: (quality) => set({ quality }),

    addToast: (toast) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }));
      setTimeout(() => {
        get().removeToast(id);
      }, 5000);
    },

    removeToast: (id) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    completeQuest: async (questId, attemptData) => {
      const { quests, completedQuestIds, gameXp, storyEvents } = get();
      const quest = quests.find((q) => q.id === questId);
      if (!quest) return false;

      // Authoritative submission through pointTrackerService
      const result = await pointTrackerService.submitQuestCompletion(
        questId,
        quest.points,
        attemptData
      );

      if (result.isDuplicate) {
        get().addToast({
          type: 'info',
          title: 'Már teljesítve!',
          message: 'Ezt a főküldetést korábban már sikeresen jóváírtad.',
        });
        return true;
      }

      soundManager.playSuccessChime();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#f59e0b', '#10b981'],
        });
      } catch {
        // Confetti fallback
      }

      const newCompleted = [...completedQuestIds, questId];
      const newTotalPoints = get().totalPoints + result.pointsAwarded;
      const xpEarned = quest.xpReward || 60;
      const newGameXp = gameXp + xpEarned;
      const newLevel = Math.floor(newGameXp / 80) + 1;

      const updatedQuests = quests.map((q) => {
        if (q.id === questId) return { ...q, active: true };
        if (q.requiredQuestId === questId) return { ...q, active: true };
        return q;
      });

      const nextQuest = updatedQuests.find((q) => !newCompleted.includes(q.id) && q.active);

      const nextStoryEvents = quest.unlocksStoryEvent
        ? Array.from(new Set([...storyEvents, quest.unlocksStoryEvent]))
        : storyEvents;

      set({
        completedQuestIds: newCompleted,
        totalPoints: newTotalPoints,
        gameXp: newGameXp,
        level: newLevel,
        quests: updatedQuests,
        currentQuestId: nextQuest ? nextQuest.id : questId,
        storyEvents: nextStoryEvents,
      });

      savePersistedProgression({
        gameXp: newGameXp,
        storyEvents: nextStoryEvents,
      });

      get().addToast({
        type: 'quest',
        title: 'Főküldetés Teljesítve!',
        message: `+${result.pointsAwarded} Iskolai Pont · +${xpEarned} XP (${result.syncStatus === 'synced' ? 'Szinkronizálva' : 'Mentve'})`,
      });

      if (quest.discoveryId) {
        get().unlockDiscovery(quest.discoveryId);
      }

      if (quest.unlocksUpgradeId) {
        get().unlockUpgrade(quest.unlocksUpgradeId);
      }

      if (questId === 'quest-k01-first-steps') {
        get().triggerSpeechBubble({
          id: 'bubble-k01-completed',
          speaker: 'RO-01',
          title: '01. KÜLDETÉS TELJESÍTVE — AZ ELSŐ MÉRÉSEK',
          text: '„Érdekes. Eddig csak mozogtam. Most viszont elkezdtem mérni is, amit csinálok. Talán ez a különbség aközött, hogy valami megtörténik velem, és aközött, hogy megértem, mi történt.”',
          status: 'Következő cél: 02. küldetés – Sebesség (v = s / t)',
        });
      }

      return true;
    },

    unlockDiscovery: (discoveryId) => {
      const { discoveries } = get();
      if (discoveries.some((d) => d.id === discoveryId)) return;

      const toUnlock = INITIAL_DISCOVERIES.find((d) => d.id === discoveryId);
      if (toUnlock) {
        set({ discoveries: [...discoveries, toUnlock] });
        get().addToast({
          type: 'discovery',
          title: 'Új Fizikai Felfedezés!',
          message: toUnlock.title,
        });
      }
    },

    unlockLoreMemory: (loreId) => {
      const { loreMemories, gameXp } = get();
      const target = loreMemories.find((l) => l.id === loreId);
      if (!target || target.unlocked) return;

      const updated = loreMemories.map((l) =>
        l.id === loreId ? { ...l, unlocked: true, unlockedAt: new Date().toLocaleTimeString('hu-HU') } : l
      );
      const newXp = gameXp + 20;

      set({
        loreMemories: updated,
        gameXp: newXp,
        level: Math.floor(newXp / 80) + 1,
      });

      savePersistedProgression({
        gameXp: newXp,
        unlockedLoreIds: updated.filter((l) => l.unlocked).map((l) => l.id),
      });

      get().addToast({
        type: 'discovery',
        title: 'Memóriatöredék Helyreállítva!',
        message: `${target.title} (+20 XP)`,
      });
    },

    inspectAmbientObject: (interactableId) => {
      const { inspectedAmbientIds, gameXp } = get();
      const spec = LEVEL_1_WORLD_INTERACTABLES.find((w) => w.id === interactableId);
      if (!spec) return;

      if (spec.linkedLoreId) {
        get().unlockLoreMemory(spec.linkedLoreId);
      }

      if (!inspectedAmbientIds.includes(interactableId)) {
        const bonusXp = spec.ambientInspection?.xpBonus || 15;
        const nextInspected = [...inspectedAmbientIds, interactableId];
        const nextXp = gameXp + bonusXp;
        set({
          inspectedAmbientIds: nextInspected,
          gameXp: nextXp,
          level: Math.floor(nextXp / 80) + 1,
        });
        savePersistedProgression({
          inspectedAmbientIds: nextInspected,
          gameXp: nextXp,
        });
      }
    },

    unlockUpgrade: (upgradeId) => {
      const { upgrades } = get();
      const target = upgrades.find((u) => u.id === upgradeId);
      if (!target || target.unlocked) return;

      const updated = upgrades.map((u) =>
        u.id === upgradeId ? { ...u, unlocked: true, equipped: true } : u
      );
      const nextCaps = computeToolCapabilities(updated);

      set({
        upgrades: updated,
        toolCapabilities: nextCaps,
      });

      savePersistedProgression({
        unlockedUpgradeIds: updated.filter((u) => u.unlocked).map((u) => u.id),
        equippedUpgradeIds: updated.filter((u) => u.equipped).map((u) => u.id),
      });

      get().addToast({
        type: 'info',
        title: 'Új Robotfejlesztés Aktiválva!',
        message: `${target.name} felszerelve a 3D karakteredre!`,
      });
    },

    toggleUpgradeEquipped: (upgradeId) => {
      const { upgrades } = get();
      const updated = upgrades.map((u) =>
        u.id === upgradeId && u.unlocked ? { ...u, equipped: !u.equipped } : u
      );
      const nextCaps = computeToolCapabilities(updated);
      soundManager.playTerminalClick();
      set({
        upgrades: updated,
        toolCapabilities: nextCaps,
      });
      savePersistedProgression({
        equippedUpgradeIds: updated.filter((u) => u.equipped).map((u) => u.id),
      });
    },

    selectCompanionDialogue: (dialogueId) => {
      const { companion } = get();
      const node = COMPANION_DIALOGUE_NODES.find((n) => n.id === dialogueId);
      if (!node) return;

      soundManager.playTerminalClick();
      const alreadyTalked = companion.unlockedDialogueIds.includes(`${dialogueId}-done`);
      const nextTrust = alreadyTalked ? companion.trustPoints : companion.trustPoints + node.trustGain;
      const nextRelLevel = Math.min(5, Math.floor(nextTrust / 25) + 1);
      const nextTitle =
        nextTrust >= 75
          ? 'Elválaszthatatlan Mérnöktárs'
          : nextTrust >= 45
          ? 'Megbízható Szövetséges'
          : nextTrust >= 25
          ? 'Barátságos Segítőtárs'
          : 'Óvatos Megfigyelő';

      set({
        companion: {
          ...companion,
          activeTopicId: dialogueId,
          trustPoints: nextTrust,
          relationshipLevel: nextRelLevel,
          relationshipTitle: nextTitle,
          unlockedDialogueIds: alreadyTalked
            ? companion.unlockedDialogueIds
            : [...companion.unlockedDialogueIds, `${dialogueId}-done`],
        },
      });

      savePersistedProgression({ companionTrust: nextTrust });

      if (node.unlocksLoreId) {
        get().unlockLoreMemory(node.unlocksLoreId);
      }
    },

    submitSideQuest: (sideQuestId, submissionText) => {
      const { sideQuests, gameXp } = get();
      const sq = sideQuests.find((s) => s.id === sideQuestId);
      if (!sq || !submissionText.trim()) return;

      soundManager.playSuccessChime();
      const record = pointTrackerService.submitHomeworkForVerification(
        sideQuestId,
        submissionText,
        sq.schoolPointsReward,
        sq.requiresTeacherVerification
      );

      const wasFirstSubmission = sq.status === 'not_started' || sq.status === 'in_progress';
      const nextXp = wasFirstSubmission ? gameXp + sq.xpReward : gameXp;

      const updatedSideQuests = sideQuests.map((item) =>
        item.id === sideQuestId
          ? {
              ...item,
              status: record.status,
              studentSubmissionText: record.submissionText,
              submittedAt: record.submittedAt,
            }
          : item
      );

      const sideQuestStates: PersistedProgressionState['sideQuestStates'] = {};
      updatedSideQuests.forEach((item) => {
        sideQuestStates[item.id] = {
          status: item.status,
          studentSubmissionText: item.studentSubmissionText,
          submittedAt: item.submittedAt,
          teacherFeedback: item.teacherFeedback,
        };
      });

      set({
        sideQuests: updatedSideQuests,
        gameXp: nextXp,
        level: Math.floor(nextXp / 80) + 1,
      });

      savePersistedProgression({
        gameXp: nextXp,
        sideQuestStates,
      });

      if (sq.unlocksUpgradeId) {
        get().unlockUpgrade(sq.unlocksUpgradeId);
      }
      if (sq.unlocksLoreId) {
        get().unlockLoreMemory(sq.unlocksLoreId);
      }

      if (sq.requiresTeacherVerification) {
        get().addToast({
          type: 'info',
          title: 'Házi Feladat Beküldve (Ellenőrzésre vár)',
          message: `+${sq.xpReward} Játék XP jóváírva! A +${sq.schoolPointsReward} Iskolai Pont a tanári jóváhagyás után kerül jóváírásra.`,
        });
      } else {
        get().addToast({
          type: 'quest',
          title: 'Mellékküldetés Teljesítve!',
          message: `+${sq.xpReward} Játék XP jóváírva!`,
        });
      }
    },

    reviewHomework: (sideQuestId, decision, feedback) => {
      const { sideQuests, totalPoints } = get();
      const sq = sideQuests.find((s) => s.id === sideQuestId);
      if (!sq) return;

      const prevStatus = sq.status;
      const record = pointTrackerService.reviewHomeworkSubmission(sideQuestId, decision, feedback);
      if (!record) return;

      let nextTotalPoints = totalPoints;
      if (decision === 'approved' && prevStatus !== 'approved') {
        nextTotalPoints += record.schoolPointsAwarded;
        soundManager.playSuccessChime();
      }

      const updatedSideQuests = sideQuests.map((item) =>
        item.id === sideQuestId
          ? {
              ...item,
              status: decision,
              teacherFeedback: feedback,
            }
          : item
      );

      set({
        sideQuests: updatedSideQuests,
        totalPoints: nextTotalPoints,
      });

      get().addToast({
        type: decision === 'approved' ? 'points' : 'info',
        title: decision === 'approved' ? 'Tanári Jóváhagyás Megtörtént!' : 'Házi Feladat Javításra Visszaküldve',
        message:
          decision === 'approved'
            ? `+${record.schoolPointsAwarded} Iskolai Pont hivatalosan jóváírva!`
            : feedback || 'Kérlek egészítsd ki a megfigyelést!',
      });
    },

    isDistrictUnlocked: (districtNumber) => {
      const spec = DISTRICT_PROGRESSION_SPECS.find((d) => d.districtNumber === districtNumber);
      if (!spec) return { unlocked: false, missingReasons: ['Ismeretlen szektor'] };
      if (districtNumber === 1) return { unlocked: true, missingReasons: [] };

      const { gameXp, completedQuestIds, storyEvents, toolCapabilities } = get();
      const missing: string[] = [];

      if (gameXp < spec.requirements.xpThreshold) {
        missing.push(`Szükséges tapasztalat: ${spec.requirements.xpThreshold} XP (Jelenlegi: ${gameXp} XP)`);
      }

      spec.requirements.requiredMainQuestIds.forEach((qId) => {
        if (!completedQuestIds.includes(qId)) {
          const qObj = CAMPAIGN_QUESTS.find((q) => q.id === qId);
          missing.push(`Kötelező főküldetés: ${qObj ? qObj.title : qId}`);
        }
      });

      spec.requirements.requiredStoryEvents.forEach((ev) => {
        if (!storyEvents.includes(ev)) {
          missing.push('Történeti mérföldkő: Alsóvárosi Energiafelvonó feloldása');
        }
      });

      spec.requirements.requiredToolCapabilities.forEach((cap) => {
        if (!toolCapabilities.includes(cap)) {
          const label =
            cap === 'charge_scanner'
              ? 'Töltés-Szkenner modul'
              : cap === 'power_transfer'
              ? 'Többfunkciós Mérnökszerszám'
              : cap === 'circuit_diagnostics'
              ? 'Áramköri Diagnosztikai modul'
              : 'Nagyfeszültségű Földelő modul';
          missing.push(`Szükséges felszerelt eszköz: ${label}`);
        }
      });

      return {
        unlocked: missing.length === 0,
        missingReasons: missing,
      };
    },

    updateUser: (user) => {
      pointTrackerService.setCurrentUser(user);
      set({ user });
    },
  };
});

// Setup subscriber for backend state
if (typeof window !== 'undefined') {
  pointTrackerService.subscribe((syncState) => {
    useGameStore.setState({ syncState });
  });
}
