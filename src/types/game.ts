/**
 * STEMPUNK - Core Data Contracts and Types
 * Modular types for game logic, quests, player progression, and backend integration.
 */

export type Role = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  role: Role;
  classId?: string;
  avatarSeed?: string;
}

export type ChallengeType =
  | 'observation'
  | 'multiple-choice'
  | 'drag-drop'
  | 'circuit-build'
  | 'microbit';

export interface QuestChallenge {
  id: string;
  type: ChallengeType;
  prompt: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint?: string;
}

export interface Quest {
  id: string;
  lessonId: number;
  lessonTitle: string;
  title: string;
  description: string;
  objective: string;
  location: 'scrapyard' | 'static-lab' | 'workshop' | 'circuit-lab' | 'automation-lab';
  buildingName: string;
  points: number; // Max points for this lesson
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredQuestId?: string;
  active: boolean;
  discoveryId?: string;
  challenge: QuestChallenge;
}

export interface Discovery {
  id: string;
  title: string;
  category: 'Elektrosztatika' | 'Áramkörök' | 'Mágnesesség' | 'Micro:bit' | 'Elektronika';
  description: string;
  formula?: string;
  keyTakeaway: string;
  unlockedAt?: string;
}

export interface QuestCompletion {
  id: string;
  userId: string;
  questId: string;
  pointsAwarded: number;
  completedAt: string;
  attemptData: {
    selectedOptionId?: string;
    stepsCompleted?: string[];
    observationsCount?: number;
    durationSeconds?: number;
  };
}

export interface PlayerInventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'tool' | 'component' | 'material' | 'keycard';
  icon: string;
  quantity: number;
}

export interface BackendSyncState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingCompletionsCount: number;
  lastError: string | null;
}
