import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../game/three/SceneManager';
import { useGameStore } from '../store/useGameStore';
import { Compass, Move, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const { currentLocationName, isMuted, toggleMute, openModal } = useGameStore();
  const [showControlsHint, setShowControlsHint] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current);
    sceneManagerRef.current = manager;

    // Hide controls hint automatically after 7 seconds
    const timer = setTimeout(() => {
      setShowControlsHint(false);
    }, 7000);

    return () => {
      clearTimeout(timer);
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Crosshair / Viewport Center Indicator (Subtle sci-fi reticle) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-4 h-4 border border-cyan-500/20 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-400/40 rounded-full" />
        </div>
      </div>

      {/* Floating Location Pill in Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg shadow-black/40">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200 tracking-wide font-display">
            {currentLocationName}
          </span>
        </div>
      </div>

      {/* Controls Helper Widget (Bottom Left) */}
      {showControlsHint && (
        <div className="absolute bottom-6 left-6 z-10 p-3 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl max-w-xs transition-opacity duration-300">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 font-display">
              <Move className="w-3.5 h-3.5" />
              <span>IRÁNYÍTÁS</span>
            </div>
            <button
              onClick={() => setShowControlsHint(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-300">
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">W A S D</kbd> Mozgás</div>
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">Space</kbd> Ugrás</div>
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">Shift</kbd> Futás</div>
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">Egér húzás</kbd> Kamera</div>
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">E</kbd> Interakció</div>
            <div><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">M</kbd> Küldetésnapló</div>
          </div>
        </div>
      )}

      {/* Bottom Floating Quick Actions */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Hang bekapcsolása' : 'Némítás'}
          className="p-2.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-cyan-400 transition-colors shadow-lg cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowControlsHint((prev) => !prev)}
          title="Irányítási segítség"
          className="p-2.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-cyan-400 transition-colors shadow-lg cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => openModal('menu', 'quests')}
          className="px-3.5 py-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 backdrop-blur-md text-white text-xs font-semibold tracking-wider font-display transition-colors shadow-lg shadow-cyan-900/40 flex items-center gap-1.5 cursor-pointer"
        >
          <span>MENÜ & KÜLDETÉSEK</span>
          <kbd className="px-1 py-0.2 bg-cyan-800/80 rounded text-[10px] text-cyan-200 font-mono">M</kbd>
        </button>
      </div>
    </div>
  );
};
