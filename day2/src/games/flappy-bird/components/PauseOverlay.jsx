export default function PauseOverlay({ onResume, onRestart, onOpenSettings, onMainMenu }) {
  return (
    <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight text-amber-400 mb-4">PAUSED</h2>

        <button
          onClick={onResume}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition active:scale-95"
        >
          Resume
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-sm transition active:scale-95"
        >
          Key Mapping & Settings
        </button>

        <button
          onClick={onRestart}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-sm transition active:scale-95"
        >
          Restart
        </button>

        <button
          onClick={onMainMenu}
          className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
