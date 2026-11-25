import { useEffect, useState } from 'react';
import { ACTION_LABELS, DEFAULT_SETTINGS, formatKeyCode } from '../constants';

export default function SettingsModal({ settings, onUpdateSettings, onClose }) {
  // listening = { action: 'flap', slot: 0 } or null
  const [listening, setListening] = useState(null);
  const [conflictMsg, setConflictMsg] = useState('');

  useEffect(() => {
    if (!listening) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        setListening(null);
        return;
      }

      const newCode = e.code;
      const { action, slot } = listening;
      const nextKeybinds = structuredClone(settings.keybinds);

      // Remove conflict if newCode is already bound elsewhere
      let swappedInfo = '';
      for (const [act, slots] of Object.entries(nextKeybinds)) {
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] === newCode && !(act === action && i === slot)) {
            slots[i] = null;
            swappedInfo = `Unbound ${formatKeyCode(newCode)} from "${ACTION_LABELS[act]}"`;
          }
        }
      }

      nextKeybinds[action][slot] = newCode;
      onUpdateSettings({ ...settings, keybinds: nextKeybinds });
      setConflictMsg(swappedInfo);
      setListening(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [listening, settings, onUpdateSettings]);

  function clearSlot(action, slot) {
    const nextKeybinds = structuredClone(settings.keybinds);
    nextKeybinds[action][slot] = null;
    onUpdateSettings({ ...settings, keybinds: nextKeybinds });
    setConflictMsg('');
  }

  function resetDefaults() {
    onUpdateSettings({
      ...settings,
      keybinds: structuredClone(DEFAULT_SETTINGS.keybinds),
      mouseFlap: DEFAULT_SETTINGS.mouseFlap,
      touchFlap: DEFAULT_SETTINGS.touchFlap,
      autoPause: DEFAULT_SETTINGS.autoPause,
    });
    setConflictMsg('Restored default key mappings.');
    setListening(null);
  }

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col p-5 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold tracking-tight">Controls & Key Mapping</h2>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700"
        >
          Done
        </button>
      </div>

      {conflictMsg && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs">
          {conflictMsg}
        </div>
      )}

      {/* Keybinds Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 mb-4">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[11px] font-bold uppercase text-slate-400 px-1">
          <span>Action</span>
          <span className="w-20 text-center">Primary</span>
          <span className="w-20 text-center">Secondary</span>
        </div>

        {Object.entries(ACTION_LABELS).map(([action, label]) => {
          const slots = settings.keybinds[action];
          return (
            <div
              key={action}
              className="grid grid-cols-[1fr_auto_auto] gap-2 items-center bg-slate-800/50 rounded-lg px-2.5 py-2"
            >
              <span className="text-xs font-semibold text-slate-200">{label}</span>

              {[0, 1].map((slot) => {
                const isListening = listening?.action === action && listening?.slot === slot;
                const keyCode = slots[slot];
                return (
                  <div key={slot} className="relative w-20 flex items-center">
                    <button
                      onClick={() => {
                        setConflictMsg('');
                        setListening({ action, slot });
                      }}
                      title="Click to rebind"
                      className={`w-full py-1.5 px-1.5 rounded-md text-xs font-mono font-bold border transition truncate ${
                        isListening
                          ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                          : keyCode
                          ? 'bg-slate-800 text-cyan-300 border-slate-600 hover:border-cyan-400'
                          : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {isListening ? 'Press Key' : formatKeyCode(keyCode)}
                    </button>
                    {keyCode && !isListening && (
                      <button
                        onClick={() => clearSlot(action, slot)}
                        title="Clear binding"
                        className="ml-0.5 text-[10px] text-slate-500 hover:text-rose-400 px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Input & Audio Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Mouse Click to Flap</span>
          <button
            onClick={() => onUpdateSettings({ ...settings, mouseFlap: !settings.mouseFlap })}
            className={`w-11 h-6 rounded-full transition p-0.5 ${
              settings.mouseFlap ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.mouseFlap ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Touch Tap to Flap</span>
          <button
            onClick={() => onUpdateSettings({ ...settings, touchFlap: !settings.touchFlap })}
            className={`w-11 h-6 rounded-full transition p-0.5 ${
              settings.touchFlap ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.touchFlap ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Auto-Pause on Tab Switch</span>
          <button
            onClick={() => onUpdateSettings({ ...settings, autoPause: !settings.autoPause })}
            className={`w-11 h-6 rounded-full transition p-0.5 ${
              settings.autoPause ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoPause ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-200">Sound Volume</span>
            <span className="font-mono text-slate-400">
              {settings.muted ? 'Muted' : `${Math.round(settings.volume * 100)}%`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.muted ? 0 : settings.volume}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  volume: parseFloat(e.target.value),
                  muted: parseFloat(e.target.value) === 0,
                })
              }
              className="flex-1 accent-cyan-400"
            />
            <button
              onClick={() => onUpdateSettings({ ...settings, muted: !settings.muted })}
              className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold"
            >
              {settings.muted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={resetDefaults}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300"
        >
          Reset to Defaults
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
