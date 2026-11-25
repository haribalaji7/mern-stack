import { BIRD_SKINS, DIFFICULTIES, formatKeyCode } from '../constants';

export default function MainMenu({
  settings,
  bestScore,
  onStart,
  onOpenSettings,
  onSelectDifficulty,
  onSelectSkin,
}) {
  const flapKey = formatKeyCode(settings.keybinds.flap[0]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 bg-slate-950/60 backdrop-blur-[3px] text-white">
      {/* Header */}
      <div className="text-center mt-4">
        <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2">
          Arcade Edition
        </div>
        <h1 className="text-5xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
          FLAPPY BIRD
        </h1>
        <p className="text-slate-200 text-sm mt-1">
          Best ({DIFFICULTIES[settings.difficulty].label}):{' '}
          <span className="font-bold text-amber-300">{bestScore}</span>
        </p>
      </div>

      {/* Customization Card */}
      <div className="w-full bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 space-y-4 shadow-2xl">
        {/* Difficulty Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.values(DIFFICULTIES).map((diff) => {
              const active = settings.difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => onSelectDifficulty(diff.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bird Skin Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Bird Skin
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(BIRD_SKINS).map((skin) => {
              const active = settings.skin === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => onSelectSkin(skin.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${
                    active
                      ? 'bg-slate-800 border-amber-400 text-white shadow'
                      : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border-2 shrink-0"
                    style={{ backgroundColor: skin.body, borderColor: skin.outline }}
                  />
                  <span className="text-xs font-semibold truncate">{skin.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-2.5 mb-2">
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg tracking-wide shadow-lg shadow-emerald-600/30 transition active:scale-95"
        >
          PLAY NOW
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-sm transition active:scale-95"
        >
          Controls & Key Mapping Settings
        </button>

        <p className="text-center text-xs text-slate-300 pt-1">
          Press <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-amber-300">{flapKey}</span>
          {settings.mouseFlap ? ' or Click' : ''} to Flap
        </p>
      </div>
    </div>
  );
}
