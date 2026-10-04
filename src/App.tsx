import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ExperimentModal } from './components/ExperimentModal';
import { MenuModal } from './components/MenuModal';
import { WorldInteractionModal } from './components/WorldInteractionModal';
import { NotificationToast } from './components/NotificationToast';
import { StoryDialogBubble } from './components/StoryDialogBubble';
import { CinematicIntroOverlay } from './components/CinematicIntroOverlay';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const { activeModal } = useGameStore();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-body text-slate-100">
      {/* 3D World Canvas Viewport */}
      <GameCanvas />

      {/* Primary In-Game HUD */}
      <HUD />

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
