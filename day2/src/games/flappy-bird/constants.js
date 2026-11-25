export const CANVAS_WIDTH = 440;
export const CANVAS_HEIGHT = 680;
export const GROUND_HEIGHT = 96;
export const PLAYABLE_HEIGHT = CANVAS_HEIGHT - GROUND_HEIGHT;

export const BIRD_X = 110;
export const BIRD_RADIUS = 16;
export const PIPE_WIDTH = 66;
export const PIPE_CAP_HEIGHT = 26;
export const PIPE_CAP_OVERHANG = 6;

export const GAME_STATES = {
  MENU: 'MENU',
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    gravity: 1300,
    flapVelocity: -420,
    pipeSpeed: 155,
    pipeGap: 170,
    pipeSpawnInterval: 1.65,
    oscillateAfter: Infinity,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    gravity: 1550,
    flapVelocity: -460,
    pipeSpeed: 190,
    pipeGap: 145,
    pipeSpawnInterval: 1.4,
    oscillateAfter: Infinity,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    gravity: 1750,
    flapVelocity: -490,
    pipeSpeed: 225,
    pipeGap: 126,
    pipeSpawnInterval: 1.2,
    oscillateAfter: Infinity,
  },
  insane: {
    id: 'insane',
    label: 'Insane',
    gravity: 1900,
    flapVelocity: -510,
    pipeSpeed: 245,
    pipeGap: 122,
    pipeSpawnInterval: 1.12,
    oscillateAfter: 8,
  },
};

export const BIRD_SKINS = {
  classic: {
    id: 'classic',
    name: 'Classic Gold',
    body: '#facc15',
    belly: '#fef08a',
    wing: '#ffffff',
    beak: '#f97316',
    outline: '#713f12',
    trail: '#fde047',
  },
  neon: {
    id: 'neon',
    name: 'Cyber Neon',
    body: '#22d3ee',
    belly: '#a5f3fc',
    wing: '#f472b6',
    beak: '#facc15',
    outline: '#083344',
    trail: '#38bdf8',
  },
  phoenix: {
    id: 'phoenix',
    name: 'Crimson Phoenix',
    body: '#ef4444',
    belly: '#fca5a5',
    wing: '#fb923c',
    beak: '#fde047',
    outline: '#450a0a',
    trail: '#f97316',
  },
  frost: {
    id: 'frost',
    name: 'Frost Blue',
    body: '#60a5fa',
    belly: '#dbeafe',
    wing: '#e0f2fe',
    beak: '#f59e0b',
    outline: '#1e3a8a',
    trail: '#93c5fd',
  },
};

export const DEFAULT_SETTINGS = {
  keybinds: {
    flap: ['Space', 'ArrowUp'],
    pause: ['Escape', 'KeyP'],
    restart: ['KeyR', null],
    mute: ['KeyM', null],
  },
  mouseFlap: true,
  touchFlap: true,
  autoPause: true,
  volume: 0.6,
  muted: false,
  skin: 'classic',
  difficulty: 'normal',
};

export const ACTION_LABELS = {
  flap: 'Flap / Jump',
  pause: 'Pause / Resume',
  restart: 'Quick Restart',
  mute: 'Mute / Unmute',
};

export function formatKeyCode(code) {
  if (!code) return 'Unbound';
  if (code === 'Space') return 'Space';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ArrowUp') return '↑ Up';
  if (code === 'ArrowDown') return '↓ Down';
  if (code === 'ArrowLeft') return '← Left';
  if (code === 'ArrowRight') return '→ Right';
  if (code === 'Escape') return 'Esc';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  return code;
}

export function getMedal(score) {
  if (score >= 100) return { name: 'Platinum', color: 'from-cyan-300 to-indigo-400', text: 'text-cyan-200', border: 'border-cyan-300' };
  if (score >= 50) return { name: 'Gold', color: 'from-yellow-300 to-amber-500', text: 'text-yellow-200', border: 'border-yellow-400' };
  if (score >= 25) return { name: 'Silver', color: 'from-slate-200 to-slate-400', text: 'text-slate-100', border: 'border-slate-300' };
  if (score >= 10) return { name: 'Bronze', color: 'from-amber-600 to-orange-800', text: 'text-amber-200', border: 'border-amber-600' };
  return null;
}
