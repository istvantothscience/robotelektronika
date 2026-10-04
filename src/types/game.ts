/**
 * STEMPUNK - Core Data Contracts and Types
 * Modular types for game logic, 3-tier interactions (Ambient, Side Quests, Main Quests),
 * character upgrades, engineering tools, companion narrative, district progression,
 * and authoritative Supabase/Vercel school point-tracking integration.
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
  | 'kinematics-path'
  | 'kinematics-speed'
  | 'kinematics-acceleration'
  | 'observation'
  | 'coulomb-balance'
  | 'conductor-grounding'
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

export type InteractionCategory = 'ambient' | 'side_quest' | 'main_quest';

export type EngineeringToolCapability =
  | 'basic_inspect'
  | 'charge_scanner'
  | 'power_transfer'
  | 'circuit_diagnostics'
  | 'hv_grounding';

export type NarrativeTheme =
  | 'self-discovery'
  | 'capability'
  | 'connection'
  | 'freedom'
  | 'responsibility';

export interface LoreMemoryEntry {
  id: string;
  title: string;
  theme: NarrativeTheme;
  themeLabel: string;
  locationName: string;
  speaker: string;
  summary: string;
  fullText: string;
  companionReflection: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type HomeworkVerificationStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_verification'
  | 'approved'
  | 'rejected';

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  narrativePurpose: string;
  location: string;
  prerequisites: string[];
  objectives: string[];
  completionConditions: string;
  educationalContent: string;
  xpReward: number;
  schoolPointsReward: number; // Only awarded upon completion if !requiresTeacherVerification, or when status === 'approved'
  requiresTeacherVerification: boolean;
  status: HomeworkVerificationStatus;
  studentSubmissionText?: string;
  submittedAt?: string;
  teacherFeedback?: string;
  unlocksUpgradeId?: string;
  unlocksLoreId?: string;
}

export type UpgradeAttachmentSlot =
  | 'optical_sensors'
  | 'electrical_scanner'
  | 'repair_arm'
  | 'energy_module'
  | 'armor_plating'
  | 'movement_servos'
  | 'engineering_multitool'
  | 'companion_drone';

export interface CharacterUpgrade {
  id: string;
  name: string;
  slot: UpgradeAttachmentSlot;
  description: string;
  narrativePurpose: string;
  gameplayEffect: string;
  visualDescription: string;
  unlocked: boolean;
  equipped: boolean;
  requiredXp: number;
  requiredQuestId?: string;
  unlockedToolCapability?: EngineeringToolCapability;
  speedBonus?: number;
}

export interface CompanionState {
  id: string;
  name: string;
  designation: string;
  personality: string;
  motivation: string;
  relationshipLevel: number; // 1 to 5
  relationshipTitle: string;
  trustPoints: number;
  activeTopicId: string;
  unlockedDialogueIds: string[];
}

export interface CompanionDialogueNode {
  id: string;
  title: string;
  theme: NarrativeTheme;
  playerPrompt: string;
  companionResponse: string;
  scientificInsight?: string;
  trustGain: number;
  requiredQuestId?: string;
  unlocksLoreId?: string;
}

export interface DistrictProgressionSpec {
  districtNumber: number;
  id: string;
  name: string;
  hungarianName: string;
  subtitle: string;
  color: string;
  description: string;
  lessonsRange: string;
  requirements: {
    xpThreshold: number;
    requiredMainQuestIds: string[];
    requiredStoryEvents: string[];
    requiredToolCapabilities: EngineeringToolCapability[];
  };
}

export interface WorldInteractableSpec {
  id: string;
  category: InteractionCategory;
  promptKey: string; // e.g. '[E] VIZSGÁLAT' | '[E] KÍSÉRLET' | '[E] PÁRBESZÉD' | '[E] MELLÉKKÜLDETÉS'
  title: string;
  subtitle: string;
  position: [number, number, number];
  radius: number;
  color: number;
  requiredToolCapability?: EngineeringToolCapability;
  linkedMainQuestId?: string;
  linkedSideQuestId?: string;
  linkedLoreId?: string;
  isCompanion?: boolean;
  ambientInspection?: {
    objectType: string;
    sensoryDescription: string;
    scientificObservation: string;
    narrativeWhisper: string;
    xpBonus: number; // Ambient interactions give 0 school points, optional small exploration XP on first inspect
  };
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
  points: number; // Authoritative school points for this main curriculum quest
  xpReward?: number; // Game XP reward (separate from school points)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredQuestId?: string;
  requiredToolCapability?: EngineeringToolCapability;
  unlocksUpgradeId?: string;
  unlocksStoryEvent?: string;
  active: boolean;
  discoveryId?: string;
  challenge: QuestChallenge;
}

export interface Discovery {
  id: string;
  title: string;
  category: 'Kinematika' | 'Elektrosztatika' | 'Áramkörök' | 'Mágnesesség' | 'Micro:bit' | 'Elektronika';
  description: string;
  formula?: string;
  keyTakeaway: string;
  unlockedAt?: string;
}

export interface KinematicsTelemetryState {
  distanceTraveled: number; // s (m)
  displacement: number;     // Δr (m) from awakening pad (0, 11)
  movementTime: number;     // t (s)
  currentSpeed: number;     // v (m/s)
  currentAcceleration: number; // a (m/s²)
  crateBypassed: boolean;
  sensorReached: boolean;
  hasMovedOnce: boolean;
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
    simulationParameters?: Record<string, unknown>;
  };
}

export interface HomeworkSubmissionRecord {
  id: string;
  userId: string;
  sideQuestId: string;
  submissionText: string;
  status: HomeworkVerificationStatus;
  schoolPointsPending: number;
  schoolPointsAwarded: number;
  submittedAt: string;
  reviewedAt?: string;
  teacherFeedback?: string;
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
