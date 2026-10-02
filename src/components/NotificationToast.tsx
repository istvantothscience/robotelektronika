import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { CheckCircle2, Sparkles, BookOpen, AlertCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useGameStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl text-slate-100 animate-slide-in-right"
          >
            {toast.type === 'quest' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            {toast.type === 'discovery' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            )}

            {toast.type === 'points' && (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {toast.type === 'info' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white font-display">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 -mr-1 -mt-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
