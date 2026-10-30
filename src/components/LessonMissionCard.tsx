import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Zap } from 'lucide-react';
import { appPointsTotal, useLessonStore } from '../lesson1/lessonStore';
import { LESSON_NPCS } from '../lesson1/npcs';
import { OPTIONAL_COMPONENTS, OPTIONAL_LIMIT } from '../lesson1/config';

interface Props {
  open: boolean;
  onToggle: () => void;
}

/** A HUD küldetéskártya az 1. szinten: az óra feladatai, karakterenként egy. */
export const LessonMissionCard: React.FC<Props> = ({ open, onToggle }) => {
  const { points, chosen, m1Done } = useLessonStore();
  const total = appPointsTotal(points);

  const rows = LESSON_NPCS.map((n) => {
    const optional = OPTIONAL_COMPONENTS.includes(n.component);
    const done = n.component === 'M1_szimulacio' ? m1Done : (points[n.component] ?? 0) > 0;
    const skipped = optional && !chosen.includes(n.component) && chosen.length >= OPTIONAL_LIMIT;
    return { npc: n, optional, done, skipped };
  });
  const next = rows.find((r) => !r.done && !r.skipped);

  return (
    <div className={`pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl ${open ? 'w-80' : 'w-64'} transition-all`}>
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 p-3 text-left cursor-pointer" aria-expanded={open}>
        <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-400">
          <Zap className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">1. óra · {total}/4 pont</div>
          <h3 className="text-xs font-bold text-white font-display tracking-wide truncate">Elektromos állapot</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {!open && next && (
        <p className="px-3 pb-3 -mt-1 text-[11px] text-slate-300 leading-snug">
          Következő: <span className="font-bold" style={{ color: next.npc.color }}>{next.npc.name}</span> – {next.npc.title}
        </p>
      )}

      {open && (
        <ul className="px-3 pb-3 space-y-1.5 text-[11px] animate-fade-in">
          {rows.map(({ npc, optional, done, skipped }) => (
            <li key={npc.id} className={`flex items-start gap-2 ${skipped ? 'text-slate-500' : 'text-slate-200'}`}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> : <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}
              <span className="leading-snug">
                <b style={{ color: npc.color }}>{npc.name}</b>: {npc.title}
                {optional && <span className="text-slate-400"> (választható{skipped ? ', már nem választható' : ''})</span>}
                {npc.component === 'M1_szimulacio' && <span className="text-slate-400"> (tanári pont)</span>}
              </span>
            </li>
          ))}
          <li className="pt-2 mt-1 border-t border-slate-800 text-slate-400 font-mono">
            Három választható közül legfeljebb kettőt jelölhetsz ki. Keresd a világítónyalábokat.
          </li>
        </ul>
      )}
    </div>
  );
};
