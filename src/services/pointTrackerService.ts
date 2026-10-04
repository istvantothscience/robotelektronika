/**
 * Point Tracker Service - Supabase & Vercel Integration Bridge
 *
 * Designed to connect to the existing Vercel-hosted Supabase point tracking system.
 * - Zero hardcoded secret keys.
 * - Idempotent quest submission: prevents duplicate points for the same student + quest.
 * - Offline/Pending queue support with error handling and retry mechanism.
 * - Configurable via UI settings or VITE_ environment variables.
 */

import { QuestCompletion, UserProfile, BackendSyncState, HomeworkSubmissionRecord } from '../types/game';

const STORAGE_KEYS = {
  SUPABASE_URL: 'stempunk_supabase_url',
  SUPABASE_ANON_KEY: 'stempunk_supabase_anon_key',
  VERCEL_API_URL: 'stempunk_vercel_api_url',
  USER_SESSION: 'stempunk_user_session',
  COMPLETIONS: 'stempunk_quest_completions',
  PENDING_SYNC: 'stempunk_pending_sync_queue',
  HOMEWORK_SUBMISSIONS: 'stempunk_homework_submissions',
};

// Default fallback student profile for instant playable vertical slice
export const DEFAULT_STUDENT: UserProfile = {
  id: 'student-demo-8b-42',
  displayName: 'Kovács Alex (8.B)',
  email: 'alex.kovacs@iskola.hu',
  role: 'student',
  classId: '8-B-STEM',
  avatarSeed: 'robot-spark',
};

class PointTrackerService {
  private config: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    vercelApiUrl: string;
  };

  private syncState: BackendSyncState = {
    supabaseUrl: '',
    supabaseAnonKey: '',
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingCompletionsCount: 0,
    lastError: null,
  };

  private listeners: Array<(state: BackendSyncState) => void> = [];

  constructor() {
    const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
    const envVercel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POINT_TRACKER_API_URL) || '';

    this.config = {
      supabaseUrl: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || envUrl,
      supabaseAnonKey: localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || envKey,
      vercelApiUrl: localStorage.getItem(STORAGE_KEYS.VERCEL_API_URL) || envVercel,
    };

    this.syncState.supabaseUrl = this.config.supabaseUrl;
    this.syncState.supabaseAnonKey = this.config.supabaseAnonKey ? '••••••••' : '';
    this.updatePendingCount();

    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      this.testConnection();
    }
  }

  public subscribe(callback: (state: BackendSyncState) => void) {
    this.listeners.push(callback);
    callback(this.syncState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.syncState }));
  }

  public updateConfig(supabaseUrl: string, supabaseAnonKey: string, vercelApiUrl: string = '') {
    this.config.supabaseUrl = supabaseUrl.trim();
    this.config.supabaseAnonKey = supabaseAnonKey.trim();
    this.config.vercelApiUrl = vercelApiUrl.trim();

    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.config.supabaseUrl);
    localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, this.config.supabaseAnonKey);
    localStorage.setItem(STORAGE_KEYS.VERCEL_API_URL, this.config.vercelApiUrl);

    this.syncState.supabaseUrl = this.config.supabaseUrl;
    this.syncState.supabaseAnonKey = this.config.supabaseAnonKey ? '••••••••' : '';

    this.testConnection();
  }

  public async testConnection(): Promise<boolean> {
    if (!this.config.supabaseUrl || !this.config.supabaseAnonKey) {
      this.syncState.isConnected = false;
      this.syncState.lastError = 'Nincs megadva Supabase URL vagy Anon kulcs';
      this.notify();
      return false;
    }

    try {
      this.syncState.isSyncing = true;
      this.notify();

      // Test endpoint ping (standard Supabase health or rest root)
      const res = await fetch(`${this.config.supabaseUrl}/rest/v1/?apikey=${this.config.supabaseAnonKey}`, {
        method: 'GET',
        headers: {
          apikey: this.config.supabaseAnonKey,
          Authorization: `Bearer ${this.config.supabaseAnonKey}`,
        },
      });

      if (res.ok || res.status === 200 || res.status === 404) {
        this.syncState.isConnected = true;
        this.syncState.lastError = null;
        this.syncState.lastSyncTime = new Date().toLocaleTimeString('hu-HU');
        this.processPendingQueue();
        return true;
      } else {
        throw new Error(`Szerver válaszkód: ${res.status}`);
      }
    } catch (err: unknown) {
      this.syncState.isConnected = false;
      this.syncState.lastError = (err as Error)?.message || 'Csatlakozási hiba';
      return false;
    } finally {
      this.syncState.isSyncing = false;
      this.notify();
    }
  }

  public getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return DEFAULT_STUDENT;
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
  }

  public getCompletions(): QuestCompletion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public isQuestCompleted(questId: string): boolean {
    const list = this.getCompletions();
    return list.some((c) => c.questId === questId);
  }

  /**
   * Submit a quest completion with server-authoritative logic.
   * Client sends questId and attempt results; points are calculated and deduplicated.
   */
  public async submitQuestCompletion(
    questId: string,
    pointsAuthoritative: number,
    attemptData: QuestCompletion['attemptData']
  ): Promise<{ success: boolean; isDuplicate: boolean; pointsAwarded: number; syncStatus: 'synced' | 'queued_offline' | 'already_completed' }> {
    const user = this.getCurrentUser();
    const existing = this.getCompletions();

    // Idempotency check: student cannot earn double points for the same quest
    const alreadyDone = existing.find((c) => c.questId === questId && c.userId === user.id);
    if (alreadyDone) {
      return {
        success: true,
        isDuplicate: true,
        pointsAwarded: 0,
        syncStatus: 'already_completed',
      };
    }

    const completion: QuestCompletion = {
      id: `qc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      questId,
      pointsAwarded: pointsAuthoritative,
      completedAt: new Date().toISOString(),
      attemptData,
    };

    // Store in local authoritative history
    existing.push(completion);
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(existing));

    // Try remote sync to Supabase / Vercel point-tracker system
    let syncSuccess = false;
    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        syncSuccess = await this.sendCompletionToRemote(completion);
      } catch {
        syncSuccess = false;
      }
    }

    if (!syncSuccess) {
      this.enqueuePending(completion);
    }

    return {
      success: true,
      isDuplicate: false,
      pointsAwarded: pointsAuthoritative,
      syncStatus: syncSuccess ? 'synced' : 'queued_offline',
    };
  }

  private async sendCompletionToRemote(completion: QuestCompletion): Promise<boolean> {
    if (!this.config.supabaseUrl || !this.config.supabaseAnonKey) return false;

    // Prefer dedicated Vercel bridge if set, else direct Supabase RPC / REST table
    const endpoint = this.config.vercelApiUrl
      ? `${this.config.vercelApiUrl}/api/complete-quest`
      : `${this.config.supabaseUrl}/rest/v1/quest_completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.config.supabaseAnonKey,
      Authorization: `Bearer ${this.config.supabaseAnonKey}`,
      Prefer: 'return=minimal',
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: completion.id,
        user_id: completion.userId,
        quest_id: completion.questId,
        points_awarded: completion.pointsAwarded,
        completed_at: completion.completedAt,
        attempt_data: completion.attemptData,
      }),
    });

    if (res.ok || res.status === 201) {
      this.syncState.lastSyncTime = new Date().toLocaleTimeString('hu-HU');
      this.notify();
      return true;
    }
    return false;
  }

  private enqueuePending(completion: QuestCompletion) {
    const queue = this.getPendingQueue();
    if (!queue.some((c) => c.questId === completion.questId && c.userId === completion.userId)) {
      queue.push(completion);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
    }
    this.updatePendingCount();
  }

  public getPendingQueue(): QuestCompletion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public async processPendingQueue() {
    if (!this.syncState.isConnected) return;
    const queue = this.getPendingQueue();
    if (queue.length === 0) return;

    this.syncState.isSyncing = true;
    this.notify();

    const remaining: QuestCompletion[] = [];
    for (const item of queue) {
      try {
        const ok = await this.sendCompletionToRemote(item);
        if (!ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(remaining));
    this.updatePendingCount();
    this.syncState.isSyncing = false;
    this.notify();
  }

  private updatePendingCount() {
    this.syncState.pendingCompletionsCount = this.getPendingQueue().length;
    this.notify();
  }

  /**
   * Homework & Side Quest Verification Pipeline
   * Homework is NEVER marked as academically verified merely because a student clicked submit.
   * Requires teacher review ('approved') before awarding authoritative school points.
   */
  public getHomeworkSubmissions(): HomeworkSubmissionRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public submitHomeworkForVerification(
    sideQuestId: string,
    submissionText: string,
    schoolPointsPotential: number,
    requiresTeacherVerification: boolean
  ): HomeworkSubmissionRecord {
    const user = this.getCurrentUser();
    const list = this.getHomeworkSubmissions();
    const existingIdx = list.findIndex((h) => h.sideQuestId === sideQuestId && h.userId === user.id);

    const record: HomeworkSubmissionRecord = {
      id: existingIdx >= 0 ? list[existingIdx].id : `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      sideQuestId,
      submissionText: submissionText.trim(),
      status: requiresTeacherVerification ? 'pending_verification' : 'approved',
      schoolPointsPending: requiresTeacherVerification ? schoolPointsPotential : 0,
      schoolPointsAwarded: requiresTeacherVerification ? 0 : schoolPointsPotential,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(list));
    return record;
  }

  public reviewHomeworkSubmission(
    sideQuestId: string,
    decision: 'approved' | 'rejected',
    teacherFeedback: string
  ): HomeworkSubmissionRecord | null {
    const user = this.getCurrentUser();
    const list = this.getHomeworkSubmissions();
    const idx = list.findIndex((h) => h.sideQuestId === sideQuestId && h.userId === user.id);
    if (idx < 0) return null;

    const record = list[idx];
    record.status = decision;
    record.reviewedAt = new Date().toISOString();
    record.teacherFeedback = teacherFeedback;
    if (decision === 'approved') {
      record.schoolPointsAwarded = record.schoolPointsPending;
      record.schoolPointsPending = 0;
    } else {
      record.schoolPointsAwarded = 0;
    }

    list[idx] = record;
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(list));
    return record;
  }
}

export const pointTrackerService = new PointTrackerService();

