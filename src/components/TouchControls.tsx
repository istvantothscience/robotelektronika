import React, { useRef, useState } from 'react';
import { ArrowUp, Hand, Zap } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { setVirtualInput } from '../input/virtualInput';

const RADIUS = 56; // joystick travel in px
const DEAD = 0.28; // fraction of travel before a direction registers

/** On-screen joystick (move) + action buttons for tablets. */
export const TouchControls: React.FC = () => {
  const { interactionTarget } = useGameStore();
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);
  const stick = useRef<{ id: number; cx: number; cy: number } | null>(null);

  const apply = (dx: number, dy: number) => {
    const nx = dx / RADIUS;
    const ny = dy / RADIUS;
    setVirtualInput({
      forward: ny < -DEAD,
      backward: ny > DEAD,
      left: nx < -DEAD,
      right: nx > DEAD,
    });
  };

  const onStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    stick.current = { id: e.pointerId, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
    e.currentTarget.setPointerCapture(e.pointerId);
    onStickMove(e);
  };

  const onStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stick.current;
    if (!s || s.id !== e.pointerId) return;
    let dx = e.clientX - s.cx;
    let dy = e.clientY - s.cy;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    apply(dx, dy);
  };

  const onStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stick.current?.id !== e.pointerId) return;
    stick.current = null;
    setKnob({ x: 0, y: 0 });
    apply(0, 0);
  };

  const toggleRun = () => {
    setRunning((r) => {
      setVirtualInput({ sprint: !r });
      return !r;
    });
  };

  const btn =
    'pointer-events-auto select-none touch-none rounded-full border-2 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-transform';

  const canInteract = !!interactionTarget;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none touch-none">
      {/* Left: movement joystick */}
      <div
        className="pointer-events-auto touch-none absolute left-6 bottom-6 w-36 h-36 rounded-full bg-slate-950/55 backdrop-blur-md border-2 border-cyan-400/40 shadow-2xl"
        onPointerDown={onStickDown}
        onPointerMove={onStickMove}
        onPointerUp={onStickUp}
        onPointerCancel={onStickUp}
        aria-label="Mozgás joystick"
      >
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400/25">
          <ArrowUp className="absolute top-2 w-5 h-5" />
          <ArrowUp className="absolute bottom-2 w-5 h-5 rotate-180" />
          <ArrowUp className="absolute left-2 w-5 h-5 -rotate-90" />
          <ArrowUp className="absolute right-2 w-5 h-5 rotate-90" />
        </div>
        <div
          className="absolute left-1/2 top-1/2 w-14 h-14 -ml-7 -mt-7 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-600 border-2 border-white/60 shadow-[0_0_14px_rgba(34,211,238,0.6)]"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      {/* Right: action buttons */}
      <div className="absolute right-6 bottom-6 flex items-end gap-4">
        <div className="flex flex-col gap-3 items-center">
          <button
            onPointerDown={() => setVirtualInput({ jump: true })}
            onPointerUp={() => setVirtualInput({ jump: false })}
            onPointerCancel={() => setVirtualInput({ jump: false })}
            className={`${btn} w-16 h-16 bg-slate-950/65 border-slate-400/60 text-slate-100 text-[11px] font-mono font-bold`}
          >
            UGRÁS
          </button>
          <button
            onClick={toggleRun}
            className={`${btn} w-16 h-16 text-[11px] font-mono font-bold ${
              running ? 'bg-amber-500/80 border-amber-200 text-slate-950' : 'bg-slate-950/65 border-amber-400/60 text-amber-300'
            }`}
          >
            <Zap className="w-4 h-4 mr-0.5" />
            FUTÁS
          </button>
        </div>
        <button
          onClick={() => interactionTarget?.action()}
          disabled={!canInteract}
          className={`${btn} w-24 h-24 text-xs font-mono font-bold flex-col gap-1 mb-2 ${
            canInteract
              ? 'bg-cyan-500/85 border-cyan-100 text-slate-950 animate-bounce-subtle shadow-[0_0_24px_rgba(34,211,238,0.6)]'
              : 'bg-slate-950/55 border-slate-600/60 text-slate-500'
          }`}
        >
          <Hand className="w-6 h-6" />
          VIZSGÁL
        </button>
      </div>

    </div>
  );
};
