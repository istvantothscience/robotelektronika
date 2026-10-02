import { create } from 'zustand';
import { CAMPAIGN_QUESTS, INITIAL_DISCOVERIES } from '../data/quests';
import { pointTrackerService, DEFAULT_STUDENT } from '../services/pointTrackerService';
import { Discovery, Quest, UserProfile, PlayerInventoryItem, BackendSyncState } from '../types/game';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

interface ToastNotification {
  id: string;
  type: 'quest' | 'discovery' | 'points' | 'sync' | 'info';
  title: string;
  message: string;
}

interface GameStoreState {
  // Player & Progression
  user: UserProfile;
  totalPoints: number;
  level: number;
  quests: Quest[];
  currentQuestId: string;
  completedQuestIds: string[];
  discoveries: Discovery[];
  inventory: PlayerInventoryItem[];
  currentLocationName: string;
  playerCoordinates: { x: number; z: number; angle: number };
  activeTowerLevel: number; // 1 to 6
  selectedTowerLevelPreview: number | null;
  showIntroStory: boolean;
  introDialogStep: number;

  // Interactivity & UI states
  interactionTarget: {
    type: 'terminal' | 'door' | 'bench' | 'npc';
    title: string;
    hint: string;
    action: () => void;
  } | null;

  activeModal: 'experiment' | 'menu' | 'settings' | null;
  activeMenuTab: 'quests' | 'discoveries' | 'inventory' | 'sync' | 'settings' | 'generator';

  // Backend Sync State
  syncState: BackendSyncState;

  // Visual & Audio Settings
  quality: 'low' | 'medium' | 'high';
  isMuted: boolean;
  toasts: ToastNotification[];

  // Actions
  advanceIntroDialog: () => void;
  dismissIntroStory: () => void;
  setPlayerCoordinates: (x: number, z: number, angle: number) => void;
  setActiveTowerLevel: (level: number) => void;
  setSelectedTowerLevelPreview: (level: number | null) => void;
  setInteractionTarget: (target: GameStoreState['interactionTarget']) => void;
  openModal: (modal: GameStoreState['activeModal'], tab?: GameStoreState['activeMenuTab']) => void;
  closeModal: () => void;
  setCurrentLocation: (locName: string) => void;
  toggleMute: () => void;
  setQuality: (q: 'low' | 'medium' | 'high') => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;

  // Quest & Discovery actions
  completeQuest: (questId: string, attemptData: Record<string, unknown>) => Promise<boolean>;
  unlockDiscovery: (discoveryId: string) => void;
  updateUser: (user: UserProfile) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialUser = pointTrackerService.getCurrentUser();
  const storedCompletions = pointTrackerService.getCompletions();
  const completedIds = storedCompletions.map((c) => c.questId);
  const totalPts = storedCompletions.reduce((sum, c) => sum + c.pointsAwarded, 0);

  // Initialize with initial discoveries or unlocked ones
  const initialUnlockedDiscoveries = INITIAL_DISCOVERIES.filter((d) =>
    completedIds.includes('quest-01-electrostatics') ? true : d.id === 'static-charge'
  );

  return {
    user: initialUser || DEFAULT_STUDENT,
    totalPoints: totalPts,
    level: Math.floor(totalPts / 30) + 1,
    quests: CAMPAIGN_QUESTS,
    currentQuestId: 'quest-01-electrostatics',
    completedQuestIds: completedIds,
    discoveries: initialUnlockedDiscoveries,
    inventory: [
      {
        id: 'multimeter',
        name: 'Retro Kézi Multiméter',
        description: 'Feszültség- és folytonosságmérő műszer.',
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
    ],
    currentLocationName: 'Level 1: Underworld (Scrapyard)',
    playerCoordinates: { x: 0, z: 11, angle: 0 },
    activeTowerLevel: 2, // Currently unlocked up to Static Research (Level 2)
    selectedTowerLevelPreview: null,
    showIntroStory: true,
    introDialogStep: 0,
    interactionTarget: null,
    activeModal: null,
    activeMenuTab: 'quests',
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
      const { quests, completedQuestIds } = get();
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
          message: 'Ezt a küldetést korábban már sikeresen jóváírtad.',
        });
        return true;
      }

      // Play victory fanfare and fireworks
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
      const newLevel = Math.floor(newTotalPoints / 30) + 1;

      // Unlock next quest in list
      const updatedQuests = quests.map((q) => {
        if (q.id === questId) return { ...q, active: true };
        if (q.requiredQuestId === questId) return { ...q, active: true };
        return q;
      });

      // Find next quest
      const nextQuest = updatedQuests.find((q) => !newCompleted.includes(q.id) && q.active);

      set({
        completedQuestIds: newCompleted,
        totalPoints: newTotalPoints,
        level: newLevel,
        quests: updatedQuests,
        currentQuestId: nextQuest ? nextQuest.id : questId,
      });

      // Add feedback toast
      get().addToast({
        type: 'quest',
        title: 'Küldetés Teljesítve!',
        message: `+${result.pointsAwarded} Pont jóváírva! (${result.syncStatus === 'synced' ? 'Szerverrel szinkronizálva' : 'Offline sorba mentve'})`,
      });

      // Unlock associated discovery
      if (quest.discoveryId) {
        get().unlockDiscovery(quest.discoveryId);
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
