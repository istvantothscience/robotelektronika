import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { pointTrackerService } from '../services/pointTrackerService';
import { LEVEL_SPECIFICATIONS } from '../game/three/generators/LevelEnvironmentSpec';
import {
  X,
  Scroll,
  BookOpen,
  Briefcase,
  Database,
  CheckCircle2,
  Lock,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Sliders,
  Sparkles,
  Cpu,
  Layers,
} from 'lucide-react';

export const MenuModal: React.FC = () => {
  const {
    activeModal,
    activeMenuTab,
    closeModal,
    quests,
    completedQuestIds,
    discoveries,
    inventory,
    user,
    totalPoints,
    syncState,
    quality,
    setQuality,
    isMuted,
    toggleMute,
    activeTowerLevel,
    setActiveTowerLevel,
    openModal,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'quests' | 'discoveries' | 'inventory' | 'sync' | 'settings' | 'generator'>(
    activeMenuTab || 'quests'
  );
  const [selectedGeneratorLevel, setSelectedGeneratorLevel] = useState<number>(activeTowerLevel || 1);

  // Form states for Supabase / Vercel Bridge
  const [supabaseUrl, setSupabaseUrl] = useState(syncState.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (activeModal !== 'menu') return null;

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestResult(null);

    pointTrackerService.updateConfig(supabaseUrl, supabaseKey, vercelUrl);
    const ok = await pointTrackerService.testConnection();

    setTestingConnection(false);
    setTestResult({
      success: ok,
      message: ok
        ? 'Sikeres kapcsolat a Supabase / Vercel pontkövető rendszerrel!'
        : 'Nem sikerült csatlakozni. Ellenőrizd a megadott URL-t és publikus anon kulcsot!',
    });
  };

  const handleManualSync = async () => {
    setTestingConnection(true);
    await pointTrackerService.processPendingQueue();
    setTestingConnection(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-6">
            <h2 className="text-base font-bold text-white tracking-wide font-display">
              STEMPUNK TERMINÁL
            </h2>

            {/* Segmented Tab Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('quests')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'quests'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Küldetésnapló</span>
              </button>

              <button
                onClick={() => setActiveTab('discoveries')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'discoveries'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Felfedezések</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Felszerelés</span>
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sync'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Vercel / Supabase Híd</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Beállítások</span>
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Világ Generátor</span>
              </button>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: QUEST LOG */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    I. Kampány: Elektromosság és Fizika (16 Tanóra)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Összes megszerezhető tanulói pont: 240 XP (2 x 120 pontos értékelési szakasz)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Összes pontod</div>
                  <div className="text-sm font-bold text-amber-400 font-mono tabular-nums">
                    {totalPoints} / 240 XP
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quests.map((q) => {
                  const isDone = completedQuestIds.includes(q.id);
                  const isPlayableNow = q.id === 'quest-01-electrostatics';

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : q.active
                          ? 'bg-slate-800/60 border-cyan-500/50'
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : q.active ? (
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="text-[11px] font-mono text-slate-400">
                            {q.lessonTitle.split(':')[0]}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                          +{q.points} XP
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mt-1.5 leading-snug">
                        {q.title}
                      </h4>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {q.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">{q.buildingName}</span>
                        {isDone ? (
                          <span className="text-emerald-400 font-medium">Jóváírva ✓</span>
                        ) : isPlayableNow ? (
                          <button
                            onClick={() => {
                              closeModal();
                              openModal('experiment');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer"
                          >
                            Kísérlet Megnyitása ➔
                          </button>
                        ) : (
                          <span className="text-slate-500">Zárolva</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DISCOVERIES */}
          {activeTab === 'discoveries' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Felfedezett Fizikai Fogalmak Naplója
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A játékban a megfigyelt és megértett természeti törvények itt kerülnek archiválásra.
                </p>
              </div>

              {discoveries.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Még nem oldottál fel felfedezést. Teljesítsd az első küldetést a laborban!
                </div>
              ) : (
                <div className="space-y-3">
                  {discoveries.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-cyan-300 font-display">
                          {d.title}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {d.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {d.description}
                      </p>

                      {d.formula && (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs text-amber-300">
                          Képlet: {d.formula}
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fő tanulság: {d.keyTakeaway}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Robot Eszköztár és Alkatrészek
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A roncsvilágban gyűjtött elektronikai és mechanikai tárgyak.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      <div className="text-[10px] text-cyan-400 font-mono mt-1 uppercase">
                        Kategória: {item.category}
                      </div>
                    </div>
                    <div className="text-sm font-bold font-mono text-amber-400 tabular-nums px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE & VERCEL BRIDGE */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Meglévő Pontkövető Rendszer Integráció (Vercel & Supabase)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  A STEMPUNK játék közvetlenül a meglévő Vercelen futó Supabase pontkövető alkalmazásod klienseként működik. A kliens nem tárol titkos backend kulcsokat, a pontjóváírás idempotens és szerveroldalon kerül érvényesítésre.
                </p>
              </div>

              {/* Current Connection Status Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {syncState.isConnected ? (
                    <CloudCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <CloudOff className="w-6 h-6 text-amber-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {syncState.isConnected
                        ? 'Kapcsolat aktív: Vercel / Supabase elérhető'
                        : 'Offline puffer mód (Helyi mentés aktív)'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {syncState.lastSyncTime
                        ? `Utolsó szinkronizálás: ${syncState.lastSyncTime}`
                        : 'Még nincs távoli szinkronizálás végrehajtva'}
                      {syncState.pendingCompletionsCount > 0 && (
                        <span className="text-amber-400 ml-2">
                          · {syncState.pendingCompletionsCount} elküldésre váró küldetés a pufferben
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {syncState.isConnected && syncState.pendingCompletionsCount > 0 && (
                  <button
                    onClick={handleManualSync}
                    disabled={testingConnection}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    <span>Puffer Küldése</span>
                  </button>
                )}
              </div>

              {/* Endpoint Configuration Form */}
              <form onSubmit={handleSaveConnection} className="space-y-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-display">
                  Szerver Elérhetőség Beállítása
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Projekt URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    A Supabase projekt Dashboard &gt; Project Settings &gt; API &gt; URL szekciójából.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Anon Nyilvános Kulcs (Public Anon Key)
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Biztonsági megjegyzés: CSAK a nyilvános 'anon' kulcsot használd, a 'service_role' kulcsot SOHA!
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vercel Pontkövető API URL (Opcionális)
                  </label>
                  <input
                    type="url"
                    value={vercelUrl}
                    onChange={(e) => setVercelUrl(e.target.value)}
                    placeholder="https://my-stempunk-tracker.vercel.app"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      testResult.success
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    A beállítások a böngésző helyi memóriájában tárolódnak.
                  </div>
                  <button
                    type="submit"
                    disabled={testingConnection}
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-display tracking-wider transition-colors shadow-lg cursor-pointer"
                  >
                    {testingConnection ? 'TESZTELÉS...' : 'KAPCSOLAT TESZTELÉSE ÉS MENTÉS'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Játékbeállítások & Teljesítmény
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grafikai finomhangolás gyengébb vagy erősebb hardverekhez.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Grafikai Részletesség</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Árnyékok, részecskék és felbontási skálázás minősége.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-700">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`px-3 py-1 text-xs font-medium rounded capitalize cursor-pointer ${
                          quality === q
                            ? 'bg-cyan-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {q === 'low' ? 'Alacsony' : q === 'medium' ? 'Közepes' : 'Magas (PBR)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Hanghatások & Szintetizátor</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Procedurális Web Audio API lépések, szikrák és jutalom fanfárok.
                    </p>
                  </div>
                  <button
                    onClick={toggleMute}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isMuted
                        ? 'bg-rose-900/60 border border-rose-700 text-rose-200'
                        : 'bg-emerald-900/60 border border-emerald-700 text-emerald-200'
                    }`}
                  >
                    {isMuted ? 'Némítva' : 'Bekapcsolva'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="text-xs font-semibold text-white mb-2">Bejelentkezett Tanulói Fiók</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <div>Név: <span className="text-white font-bold">{user.displayName}</span></div>
                    <div>Azonosító: <span className="text-cyan-300">{user.id}</span></div>
                    <div>Osztály: <span className="text-slate-400">{user.classId}</span></div>
                    <div>Szerepkör: <span className="text-amber-400">{user.role}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
