import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ExperimentModal } from './components/ExperimentModal';
import { MenuModal } from './components/MenuModal';
import { NotificationToast } from './components/NotificationToast';
import { StoryDialogBubble } from './components/StoryDialogBubble';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const { activeModal } = useGameStore();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-body text-slate-100">
      {/* 3D World Canvas Viewport */}
      <GameCanvas />

      {/* Primary In-Game HUD */}
      <HUD />

      {/* Opening Story Monologue Speech Bubble */}
      <StoryDialogBubble />

      {/* Interactive Electrostatics Laboratory Experiment Modal */}
      {activeModal === 'experiment' && <ExperimentModal />}

      {/* In-Game Terminal & Pause Menu (Quest Log, Discoveries, Vercel/Supabase Bridge) */}
      {activeModal === 'menu' && <MenuModal />}

      {/* Notification Toast Stack */}
      <NotificationToast />
    </main>
  );
}
