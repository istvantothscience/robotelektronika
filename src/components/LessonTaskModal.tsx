import React, { useId, useMemo } from 'react';
import { CheckCircle2, ExternalLink, Lock, X } from 'lucide-react';
import { HairStyler } from './HairStyler';
import { useLessonStore, type SyncStatus } from '../lesson1/lessonStore';
import { PHET_URL, npcForComponent } from '../lesson1/npcs';
import { OPTIONAL_COMPONENTS, OPTIONAL_LIMIT, type ComponentId } from '../lesson1/config';
import { M2_CARDS, M2_MIN_REASON } from '../lesson1/logic/m2';
import { M3_MIN_TEXT } from '../lesson1/logic/m3';
import { M4_TIMES, describeStats, parseCount, rowStats } from '../lesson1/logic/m4';
import { M5_MIN_FIELD, M5_STATEMENTS } from '../lesson1/logic/m5';
import { EXIT_QUESTIONS } from '../lesson1/logic/exitTicket';
import { visibleHint } from '../lesson1/logic/feedback';

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 outline-none text-sm text-slate-100';

const SYNC_LABEL: Record<SyncStatus, string> = {
  saved: 'Elmentve a Pontkövetőbe',
  pending: 'Függőben: később elküldjük',
  demo: 'Demó mód: nem kerül a Pontkövetőbe',
  error: 'Hiba a mentésnél',
};

export const LessonTaskModal: React.FC = () => {
  const s = useLessonStore();
  const task = s.activeTask;
  const uid = useId();
  const npc = useMemo(() => (task ? npcForComponent(task) : undefined), [task]);
  if (!task || !npc) return null;

  const isOptional = OPTIONAL_COMPONENTS.includes(task);
  const picked = s.chosen.includes(task);
  const locked = isOptional && !picked;
  const limitReached = isOptional && !picked && s.chosen.length >= OPTIONAL_LIMIT;
  const earned = s.points[task] ?? 0;
  const fb = s.feedback[task] ?? null;
  const attempts = s.attempts[task] ?? 0;
  const status = s.sync[task];

  const submitBtn = (label = 'Beküldés') => (
    <button
      onClick={() => s.submit(task)}
      disabled={locked}
      className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-bold font-display tracking-wide cursor-pointer"
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/75">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-11 h-11 shrink-0 rounded-xl border-2 flex items-center justify-center font-display font-black text-lg"
              style={{ borderColor: npc.color, color: npc.color, background: `${npc.color}22` }}
              aria-hidden="true"
            >
              {npc.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {npc.name} · {npc.role}
              </div>
              <h2 id={`${uid}-title`} className="text-base font-bold text-white font-display tracking-wide">
                {npc.title}
              </h2>
            </div>
          </div>
          <button onClick={s.closeTask} aria-label="Bezárás" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border-l-4 text-sm leading-relaxed text-slate-200 space-y-1.5" style={{ borderColor: npc.color }}>
            {npc.intro.map((line) => (
              <p key={line}>„{line}”</p>
            ))}
          </div>

          {isOptional && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span>
                Választható küldetés: a háromból legfeljebb {OPTIONAL_LIMIT}-t jelölhetsz ki ({s.chosen.length}/{OPTIONAL_LIMIT} kijelölve).
              </span>
              <button
                onClick={() => s.togglePickOptional(task)}
                disabled={limitReached}
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${picked ? 'bg-emerald-600/80 border-emerald-300 text-white' : 'bg-slate-800 border-slate-600 text-slate-100'}`}
              >
                {picked ? '✓ Kijelölve (visszavonás)' : limitReached ? 'A két hely betelt' : 'Ezt választom'}
              </button>
            </div>
          )}
          {locked && (
            <p className="flex items-center gap-2 text-xs text-amber-300">
              <Lock className="w-4 h-4" /> Jelöld ki a küldetést, hogy a pontot megkapd.
            </p>
          )}

          {/* ---------- M1 ---------- */}
          {task === 'M1_szimulacio' && (
            <div className="space-y-3 text-sm text-slate-200">
              <a href={PHET_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                Szimuláció megnyitása (PhET) <ExternalLink className="w-4 h-4" />
              </a>
              <p>A feladatot a szimulációban végezd el. A pontot a tanár írja be.</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={s.m1Done} onChange={(e) => s.setM1Done(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
                Kész: lerajzoltam a töltéseket és kitöltöttem a táblázatot.
              </label>
            </div>
          )}

          {/* ---------- M2 ---------- */}
          {task === 'M2_adatkartya' && (
            <div className="space-y-3">
              {M2_CARDS.map((c) => {
                const a = s.m2[c.id];
                const short = a.reason.trim().length < M2_MIN_REASON;
                return (
                  <fieldset key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <legend className="px-1 text-xs font-mono font-bold text-amber-300">{c.id} kártya</legend>
                    <p className="text-sm text-slate-200">{c.text}</p>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`${c.id} kártya besorolása`}>
                      {([['vezeto', 'A töltés elfolyik'], ['szigetelo', 'A töltés a helyén marad']] as const).map(([val, label]) => (
                        <label key={val} className={`px-3 py-2 rounded-lg border text-xs font-mono cursor-pointer ${a.choice === val ? 'bg-cyan-600/80 border-cyan-200 text-white' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                          <input type="radio" name={`${uid}-${c.id}`} className="sr-only" checked={a.choice === val} onChange={() => s.setM2(c.id, { choice: val })} />
                          {a.choice === val ? '● ' : '○ '}{label}
                        </label>
                      ))}
                    </div>
                    <label className="block text-[11px] font-mono text-slate-400">
                      Indoklás (legalább {M2_MIN_REASON} karakter){a.choice && short ? ` · még ${M2_MIN_REASON - a.reason.trim().length} hiányzik` : ''}
                      <input className={`${inputCls} mt-1`} value={a.reason} onChange={(e) => s.setM2(c.id, { reason: e.target.value })} />
                    </label>
                  </fieldset>
                );
              })}
              <div>{submitBtn('Besorolás beküldése')}</div>
            </div>
          )}

          {/* ---------- M3 ---------- */}
          {task === 'M3_hajrajz' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="checkbox" checked={s.m3.drew} onChange={(e) => s.setM3({ drew: e.target.checked })} className="w-5 h-5 accent-cyan-500" />
                Rajzoltam: igen
              </label>
              <label className="block text-[11px] font-mono text-slate-400">
                Két mondat: miért áll fel a haj a lufi után, és miért nem áll fel a lufi nélkül? (legalább {M3_MIN_TEXT} karakter, most {s.m3.text.trim().length})
                <textarea rows={4} className={`${inputCls} mt-1`} value={s.m3.text} onChange={(e) => s.setM3({ text: e.target.value })} />
              </label>
              <HairStyler photo={s.m3.photo} onAttach={(p) => s.setM3({ photo: p })} />
              <div>{submitBtn()}</div>
            </div>
          )}

          {/* ---------- M4 ---------- */}
          {task === 'M4_meres' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-200 border-separate border-spacing-y-2">
                  <caption className="sr-only">Töltésszétválasztási mérés: dörzsölési idő és a felemelt papírreszelék-darabok száma</caption>
                  <thead>
                    <tr className="text-[11px] font-mono text-slate-400 text-left">
                      <th scope="col" className="pr-2">Dörzsölési idő</th>
                      <th scope="col" className="pr-2">1. mérés</th>
                      <th scope="col" className="pr-2">2. mérés</th>
                      <th scope="col" className="pr-2">3. mérés</th>
                      <th scope="col" className="pr-2">Saját átlagod</th>
                      <th scope="col">Átlag · szórás</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.m4.map((row, i) => {
                      const nums = row.measurements.map(parseCount);
                      const stats = nums.every((n) => n !== null) ? rowStats(nums as number[]) : null;
                      return (
                        <tr key={i}>
                          <th scope="row" className="pr-2 whitespace-nowrap font-mono font-normal">
                            <span className="inline-flex items-center gap-1">
                              {M4_TIMES[i]}
                              <select aria-label={`${i + 1}. sor mértékegysége`} value={row.unit} onChange={(e) => s.setM4Row(i, { unit: e.target.value as 's' | 'perc' })} className="bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs">
                                <option value="s">s</option>
                                <option value="perc">perc</option>
                              </select>
                            </span>
                          </th>
                          {([0, 1, 2] as const).map((j) => (
                            <td key={j} className="pr-2">
                              <input inputMode="numeric" aria-label={`${M4_TIMES[i]} s, ${j + 1}. mérés`} className={`${inputCls} w-20`} value={row.measurements[j]} onChange={(e) => s.setM4Measurement(i, j, e.target.value)} />
                            </td>
                          ))}
                          <td className="pr-2">
                            <input inputMode="decimal" aria-label={`${M4_TIMES[i]} s, saját átlag`} className={`${inputCls} w-24`} value={row.ownAverage} onChange={(e) => s.setM4Row(i, { ownAverage: e.target.value })} />
                          </td>
                          <td className="font-mono text-xs text-cyan-300 whitespace-nowrap">{describeStats(stats)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">Mérés: az 5 másodpercig felemelt papírreszelék-darabok száma (0–50 közötti egész szám). Üres mező nem menthető.</p>
              <div>{submitBtn('Táblázat beküldése')}</div>
            </div>
          )}

          {/* ---------- M5 ---------- */}
          {task === 'M5_hibas_erveles' && (
            <div className="space-y-3">
              <fieldset className="space-y-2">
                <legend className="text-xs font-mono text-slate-400 mb-1">Melyik állítás mond ellent a kísérleteknek? (egyet jelölj)</legend>
                {M5_STATEMENTS.map((st) => (
                  <label key={st.id} className={`flex items-start gap-2 p-3 rounded-xl border text-sm cursor-pointer ${s.m5.chosen === st.id ? 'bg-cyan-950/60 border-cyan-400 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-200'}`}>
                    <input type="radio" name={`${uid}-m5`} className="mt-1 accent-cyan-500" checked={s.m5.chosen === st.id} onChange={() => s.setM5({ chosen: st.id })} />
                    <span><b className="font-mono">{st.id})</b> {st.text}</span>
                  </label>
                ))}
              </fieldset>
              {([['claim', 'Állítás (Claim): a javított állításod'], ['evidence', 'Bizonyíték (Evidence): mit figyeltél meg?'], ['reasoning', 'Indoklás (Reasoning): miért következik ez a bizonyítékból?']] as const).map(([key, label]) => (
                <label key={key} className="block text-[11px] font-mono text-slate-400">
                  {label} (legalább {M5_MIN_FIELD} karakter, most {s.m5[key].trim().length})
                  <textarea rows={2} className={`${inputCls} mt-1`} value={s.m5[key]} onChange={(e) => s.setM5({ [key]: e.target.value })} />
                </label>
              ))}
              <div>{submitBtn()}</div>
            </div>
          )}

          {/* ---------- Kilépőjegy ---------- */}
          {task === 'KILEPOJEGY' && (
            <div className="space-y-3">
              {(['q1', 'q2'] as const).map((k, i) => (
                <label key={k} className="block text-sm text-slate-200">
                  <span className="font-mono text-xs text-amber-300">{i + 1}. kérdés</span>
                  <span className="block mb-1">{EXIT_QUESTIONS[k]}</span>
                  <textarea rows={3} className={inputCls} value={s.exit[k]} onChange={(e) => s.setExit({ [k]: e.target.value })} />
                </label>
              ))}
              <div>{submitBtn('Kilépőjegy beküldése')}</div>
            </div>
          )}

          {/* ---------- visszajelzés ---------- */}
          <div role="status" aria-live="polite">
            {fb && (
              <div className={`p-3.5 rounded-xl border text-sm leading-relaxed ${fb.ok ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100' : 'bg-amber-950/40 border-amber-500/60 text-amber-100'}`}>
                <div className="flex items-center gap-2 font-bold font-display mb-1">
                  {fb.ok ? <CheckCircle2 className="w-4 h-4" /> : <span aria-hidden="true">!</span>}
                  {fb.ok ? 'Teljesítve' : `${npc.name} visszajelzése`}
                </div>
                {visibleHint(fb, attempts)}
              </div>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300">
            <span>{task === 'M1_szimulacio' ? 'Pont: a tanár írja be' : `Pont: ${earned}/1`}</span>
            {status && earned > 0 && <span>{SYNC_LABEL[status]}</span>}
            {earned > 0 && <span className="text-emerald-300">{npc.done}</span>}
          </footer>
        </div>
      </div>
    </div>
  );
};

