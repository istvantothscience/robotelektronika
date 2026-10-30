import { create } from 'zustand';
import { LESSON_KEY, clampPoints, OPTIONAL_COMPONENTS, type ComponentId } from './config';
import { emptyM2, gradeM2, type M2Answers } from './logic/m2';
import { gradeM3, type M3Answer } from './logic/m3';
import { emptyM4, gradeM4, type M4Answer } from './logic/m4';
import { emptyM5, gradeM5, type M5Answer } from './logic/m5';
import { gradeExit, type ExitAnswer } from './logic/exitTicket';
import { togglePick } from './logic/optionalPick';
import type { Feedback } from './logic/feedback';
import { pointTrackerService } from '../services/pointTrackerService';
import { useGameStore } from '../store/useGameStore';

export type SyncStatus = 'saved' | 'pending' | 'demo' | 'error';

interface Persisted {
  chosen: ComponentId[];
  m1Done: boolean;
  m2: M2Answers;
  m3: M3Answer & { photo: string | null };
  m4: M4Answer;
  m5: M5Answer;
  exit: ExitAnswer;
  attempts: Partial<Record<ComponentId, number>>;
  points: Partial<Record<ComponentId, number>>;
  sync: Partial<Record<ComponentId, SyncStatus>>;
  /** A hibatípus-címkék darabszáma (a tanári nézethez később). */
  errorTypes: Record<string, number>;
}

interface LessonState extends Persisted {
  activeTask: ComponentId | null;
  feedback: Partial<Record<ComponentId, Feedback | null>>;
  openTask: (c: ComponentId) => void;
  closeTask: () => void;
  togglePickOptional: (c: ComponentId) => void;
  setM1Done: (v: boolean) => void;
  setM2: (id: string, patch: Partial<M2Answers[string]>) => void;
  setM3: (patch: Partial<LessonState['m3']>) => void;
  setM4Row: (i: number, patch: Partial<M4Answer[number]>) => void;
  setM4Measurement: (i: number, j: 0 | 1 | 2, value: string) => void;
  setM5: (patch: Partial<M5Answer>) => void;
  setExit: (patch: Partial<ExitAnswer>) => void;
  submit: (c: ComponentId) => Promise<void>;
}

const storageKey = () => `stempunk_lesson1_v1:${pointTrackerService.getCurrentUser().id}`;

function fresh(): Persisted {
  return {
    chosen: [],
    m1Done: false,
    m2: emptyM2(),
    m3: { drew: false, text: '', photo: null },
    m4: emptyM4(),
    m5: emptyM5(),
    exit: { q1: '', q2: '' },
    attempts: {},
    points: {},
    sync: {},
    errorTypes: {},
  };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    /* az app működik tárhely nélkül is */
  }
  return fresh();
}

function persist(s: Persisted) {
  try {
    const { chosen, m1Done, m2, m3, m4, m5, exit, attempts, points, sync, errorTypes } = s;
    localStorage.setItem(storageKey(), JSON.stringify({ chosen, m1Done, m2, m3, m4, m5, exit, attempts, points, sync, errorTypes }));
  } catch {
    /* kvóta vagy tiltott tárhely: nem baj */
  }
}

export const useLessonStore = create<LessonState>((set, get) => {
  const save = () => persist(get());
  const patch = (p: Partial<Persisted>) => {
    set(p as Partial<LessonState>);
    save();
  };

  return {
    ...load(),
    activeTask: null,
    feedback: {},

    openTask: (c) => set({ activeTask: c }),
    closeTask: () => set({ activeTask: null }),

    togglePickOptional: (c) => patch({ chosen: togglePick(get().chosen, c) }),
    setM1Done: (v) => patch({ m1Done: v }),
    setM2: (id, p) => patch({ m2: { ...get().m2, [id]: { ...get().m2[id], ...p } } }),
    setM3: (p) => patch({ m3: { ...get().m3, ...p } }),
    setM4Row: (i, p) => patch({ m4: get().m4.map((r, k) => (k === i ? { ...r, ...p } : r)) }),
    setM4Measurement: (i, j, value) =>
      patch({
        m4: get().m4.map((r, k) => {
          if (k !== i) return r;
          const m = [...r.measurements] as typeof r.measurements;
          m[j] = value;
          return { ...r, measurements: m };
        }),
      }),
    setM5: (p) => patch({ m5: { ...get().m5, ...p } }),
    setExit: (p) => patch({ exit: { ...get().exit, ...p } }),

    submit: async (c) => {
      const s = get();
      let points = 0;
      let fb: Feedback;
      switch (c) {
        case 'M2_adatkartya': { const r = gradeM2(s.m2); points = r.points; fb = r.feedback; break; }
        case 'M3_hajrajz': { const r = gradeM3(s.m3); points = r.points; fb = r.feedback; break; }
        case 'M4_meres': { const r = gradeM4(s.m4); points = r.points; fb = r.feedback; break; }
        case 'M5_hibas_erveles': { const r = gradeM5(s.m5); points = r.points; fb = r.feedback; break; }
        case 'KILEPOJEGY': { const r = gradeExit(s.exit); points = r.points; fb = r.feedback; break; }
        default: return;
      }
      // választható küldetésnél csak a kijelölt kettő ad pontot
      if (OPTIONAL_COMPONENTS.includes(c) && !s.chosen.includes(c)) points = 0;
      points = clampPoints(c, points);

      const attempts = { ...s.attempts, [c]: (s.attempts[c] ?? 0) + 1 };
      const errorTypes = { ...s.errorTypes };
      if (!fb.ok) errorTypes[fb.type] = (errorTypes[fb.type] ?? 0) + 1;
      set({ feedback: { ...s.feedback, [c]: fb } });
      patch({ attempts, errorTypes });

      const already = s.points[c] ?? 0;
      if (points > already) {
        patch({ points: { ...get().points, [c]: points } });
        const res = await pointTrackerService.submitQuestCompletion(`l1:${c}`, points, {
          stepsCompleted: [c],
          simulationParameters: { lesson: LESSON_KEY, component: c },
        });
        const status: SyncStatus = pointTrackerService.isDemoUser()
          ? 'demo'
          : res.syncStatus === 'synced' || res.syncStatus === 'already_completed'
          ? 'saved'
          : 'pending';
        patch({ sync: { ...get().sync, [c]: status } });
        if (!res.isDuplicate) {
          useGameStore.setState((g) => ({ totalPoints: g.totalPoints + res.pointsAwarded }));
          useGameStore.getState().addToast({
            type: 'points',
            title: `+${res.pointsAwarded} pont`,
            message: pointTrackerService.isDemoUser()
              ? 'Demó módban a pont nem kerül a Pontkövetőbe.'
              : status === 'saved'
              ? 'Elmentve a Pontkövetőbe.'
              : 'Függőben: amint van kapcsolat, elküldjük.',
          });
        }
      }
    },
  };
});

/** Az app-forrású pont összesen (legfeljebb 4). */
export function appPointsTotal(points: Partial<Record<ComponentId, number>>): number {
  return (['M2_adatkartya', 'M3_hajrajz', 'M4_meres', 'M5_hibas_erveles', 'KILEPOJEGY'] as ComponentId[]).reduce(
    (sum, c) => sum + (points[c] ?? 0),
    0
  );
}
