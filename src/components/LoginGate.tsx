import React, { useState } from 'react';
import { LogIn, ExternalLink, Play, Loader2 } from 'lucide-react';
import { authService, SUPPORTED_CLASSES } from '../services/authService';
import { pointTrackerService, DEFAULT_STUDENT } from '../services/pointTrackerService';

const PONTKOVETO_URL = 'https://fizika-pontkoveto.vercel.app';
export const DEMO_FLAG_KEY = 'stempunk_demo_mode';

interface Props {
  /** Hívódik, ha a belépés (vagy a demó mód) után újra kell tölteni a játék állapotát. */
  onDone: () => void;
}

export const LoginGate: React.FC<Props> = ({ onDone }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const profile = await authService.signIn(email, password);
      localStorage.removeItem(DEMO_FLAG_KEY);
      pointTrackerService.setCurrentUser(profile);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) {
      setError('Add meg az e-mail címedet, majd kattints újra.');
      return;
    }
    setError(null);
    try {
      await authService.sendReset(email);
      setInfo('Elküldtük a jelszó-visszaállító levelet (nézd meg a spamet is).');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startDemo = () => {
    try {
      localStorage.setItem(DEMO_FLAG_KEY, '1');
    } catch {
      /* ignore */
    }
    pointTrackerService.setCurrentUser(DEFAULT_STUDENT);
    onDone();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4 font-body text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.10),transparent_60%)]" />
      <div className="relative w-full max-w-sm bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-3xl font-black tracking-wider font-display">
            STEM<span className="text-amber-400">PUNK</span>
          </div>
          <div className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase font-mono mt-1">
            RO-01 · Elektronika kaland
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-[11px] font-mono text-slate-400">
            E-mail (a Pontkövetős fiókod)
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-sm text-slate-100"
            />
          </label>
          <label className="block text-[11px] font-mono text-slate-400">
            Jelszó
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-sm text-slate-100"
            />
          </label>

          {error && (
            <div role="alert" className="text-[11px] text-rose-300 bg-rose-950/50 border border-rose-700/50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-700/50 rounded-lg px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm font-bold font-display tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Belépés
          </button>
        </form>

        <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
          <button onClick={reset} className="text-slate-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer">
            Elfelejtett jelszó
          </button>
          <a
            href={PONTKOVETO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Első belépés / regisztráció <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-slate-500 font-mono">
          Ugyanazzal a fiókkal lépsz be, mint a Fizika Pontkövetőbe. A játékban szerzett pontok automatikusan
          a saját osztályod ({SUPPORTED_CLASSES.join(', ')}) pontjai közé kerülnek.
        </p>

        <button
          onClick={startDemo}
          className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Play className="w-3.5 h-3.5 text-amber-400" />
          Demó mód (kipróbálás, pontok nélkül)
        </button>
      </div>
    </main>
  );
};
