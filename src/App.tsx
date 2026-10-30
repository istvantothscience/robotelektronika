import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ExperimentModal } from './components/ExperimentModal';
import { MenuModal } from './components/MenuModal';
import { WorldInteractionModal } from './components/WorldInteractionModal';
import { NotificationToast } from './components/NotificationToast';
import { StoryDialogBubble } from './components/StoryDialogBubble';
import { CinematicIntroOverlay } from './components/CinematicIntroOverlay';
import { useGameStore } from './store/useGameStore';
import { LessonTaskModal } from './components/LessonTaskModal';
import { useLessonStore } from './lesson1/lessonStore';
import { TouchControls } from './components/TouchControls';
import { useIsTouch } from './input/virtualInput';
import { LoginGate, DEMO_FLAG_KEY } from './components/LoginGate';
import { authService } from './services/authService';
import { pointTrackerService, DEFAULT_STUDENT, DEMO_USER_ID } from './services/pointTrackerService';

type AuthStatus = 'checking' | 'login' | 'ready';

/** Belépés-kapu: bejelentkezett diák (Pontkövető fiók) vagy demó mód nélkül nem indul a játék. */
function useAuthGate(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const demo = localStorage.getItem(DEMO_FLAG_KEY) === '1';
      if (demo) {
        if (!cancelled) setStatus('ready');
        return;
      }
      const profile = await authService.restore();
      if (cancelled) return;
      if (profile) {
        if (pointTrackerService.getCurrentUser().id !== profile.id) {
          // A store még másik felhasználóval inicializálódott → újratöltés a helyes állapothoz
          pointTrackerService.setCurrentUser(profile);
          window.location.reload();
          return;
        }
        pointTrackerService.setCurrentUser(profile);
        pointTrackerService.processPendingQueue();
        setStatus('ready');
      } else {
        if (pointTrackerService.getCurrentUser().id !== DEMO_USER_ID) {
          pointTrackerService.setCurrentUser(DEFAULT_STUDENT);
        }
        setStatus('login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}


export default function App() {
  const { activeModal } = useGameStore();
  const authStatus = useAuthGate();
  const isTouch = useIsTouch();
  const lessonTask = useLessonStore((st) => st.activeTask);

  if (authStatus === 'checking') {
    return <main className="w-screen h-screen bg-slate-950" />;
  }
  if (authStatus === 'login') {
    return <LoginGate onDone={() => window.location.reload()} />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-body text-slate-100">
      {/* 3D World Canvas Viewport */}
      <GameCanvas />

      {/* Primary In-Game HUD */}
      <HUD />

      {isTouch && activeModal === null && !lessonTask && <TouchControls />}

      {lessonTask && <LessonTaskModal />}

      {/* RO-01 Opening Story & Contextual Speech Bubbles */}
      <StoryDialogBubble />

      {/* RO-01 4-Scene Cinematic Intro Overlay */}
      <CinematicIntroOverlay />

      {/* Interactive Physics, Kinematics & Electrostatics Laboratory Experiment Modal (Main Quests) */}
      {activeModal === 'experiment' && <ExperimentModal />}

      {/* 3-Category World Interaction Modal (Ambient Inspections, Companion VOLT-7, Side Quests & Homework) */}
      {activeModal === 'world_interaction' && <WorldInteractionModal />}

      {/* In-Game Terminal & Pause Menu (Quests, Side Quests, 3D Upgrades, Memories, Vercel/Supabase Bridge) */}
      {activeModal === 'menu' && <MenuModal />}

      {/* Notification Toast Stack */}
      <NotificationToast />
    </main>
  );
}
