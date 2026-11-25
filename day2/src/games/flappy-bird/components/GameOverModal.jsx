import { DIFFICULTIES, formatKeyCode, getMedal } from '../constants';

export default function GameOverModal({
  score,
  bestScore,
  isNewBest,
  difficulty,
  restartKey,
  onRestart,
  onMainMenu,
}) {
  const medal = getMedal(score);

  return (
    <div className="absolute inset-0 z-20 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-xs bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight text-rose-400 mb-1">GAME OVER</h2>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">
          {DIFFICULTIES[difficulty].label} Mode
        </p>

        {/* Score Card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div className="flex flex-col items-center justify-center w-24">
            <span className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Medal</span>
            {medal ? (
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${medal.color} border-2 ${medal.border} flex items-center justify-center shadow-lg`}
              >
                <span className={`text-[10px] font-black uppercase ${medal.text}`}>
                  {medal.name.slice(0, 4)}
                </span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                None
              </div>
            )}
          </div>

          <div className="text-right space-y-2">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Score</div>
              <div className="text-3xl font-black leading-none">{score}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-end gap-1">
                {isNewBest && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-[9px] text-white font-black">
                    NEW
                  </span>
                )}
                Best
              </div>
              <div className="text-xl font-extrabold text-amber-300 leading-none">{bestScore}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base shadow-lg transition active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sm font-bold transition active:scale-95"
          >
            Main Menu
          </button>
          {restartKey && (
            <p className="text-[11px] text-slate-400 pt-1">
              Press <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-amber-300">{formatKeyCode(restartKey)}</span> for quick restart
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
