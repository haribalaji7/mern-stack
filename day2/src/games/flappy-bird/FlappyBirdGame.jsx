import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BIRD_SKINS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SETTINGS,
  DIFFICULTIES,
  GAME_STATES,
  PLAYABLE_HEIGHT,
  formatKeyCode,
} from './constants';
import { soundEngine } from './engine/audio';
import {
  createInitialGameState,
  spawnFlapParticles,
  stepPhysics,
  updateParticles,
} from './engine/physics';
import { renderGame } from './engine/renderer';
import GameOverModal from './components/GameOverModal';
import MainMenu from './components/MainMenu';
import PauseOverlay from './components/PauseOverlay';
import SettingsModal from './components/SettingsModal';

const SETTINGS_KEY = 'flappy_bird_settings_v1';
const SCORES_KEY = 'flappy_bird_best_v1';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keybinds: {
        ...DEFAULT_SETTINGS.keybinds,
        ...(parsed.keybinds || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadBestScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function FlappyBirdGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createInitialGameState());

  const [settings, setSettings] = useState(loadSettings);
  const [bestScores, setBestScores] = useState(loadBestScores);
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const difficulty = DIFFICULTIES[settings.difficulty] || DIFFICULTIES.normal;
  const skin = BIRD_SKINS[settings.skin] || BIRD_SKINS.classic;
  const currentBest = bestScores[settings.difficulty] || 0;

  // Sync audio settings & persist settings
  useEffect(() => {
    soundEngine.configure(settings.volume, settings.muted);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const startReadyState = useCallback(() => {
    gameRef.current = createInitialGameState();
    setScore(0);
    setIsNewBest(false);
    setGameState(GAME_STATES.READY);
  }, []);

  const triggerFlap = useCallback(() => {
    if (showSettings) return;

    if (gameState === GAME_STATES.READY) {
      setGameState(GAME_STATES.PLAYING);
      gameRef.current.birdVelocity = difficulty.flapVelocity;
      spawnFlapParticles(gameRef.current, skin.trail);
      soundEngine.flap();
    } else if (gameState === GAME_STATES.PLAYING) {
      gameRef.current.birdVelocity = difficulty.flapVelocity;
      spawnFlapParticles(gameRef.current, skin.trail);
      soundEngine.flap();
    }
  }, [gameState, showSettings, difficulty.flapVelocity, skin.trail]);

  const togglePause = useCallback(() => {
    if (showSettings) return;
    if (gameState === GAME_STATES.PLAYING) {
      soundEngine.click();
      setGameState(GAME_STATES.PAUSED);
    } else if (gameState === GAME_STATES.PAUSED) {
      soundEngine.click();
      setGameState(GAME_STATES.PLAYING);
    }
  }, [gameState, showSettings]);

  const handleGameOver = useCallback(() => {
    soundEngine.hit();
    setGameState(GAME_STATES.GAME_OVER);
    const finalScore = gameRef.current.score;
    setBestScores((prev) => {
      const prevBest = prev[settings.difficulty] || 0;
      if (finalScore > prevBest) {
        setIsNewBest(true);
        const updated = { ...prev, [settings.difficulty]: finalScore };
        try {
          localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });
  }, [settings.difficulty]);

  // Keyboard bindings
  useEffect(() => {
    const onKeyDown = (e) => {
      if (showSettings) return;

      const { flap, pause, restart, mute } = settings.keybinds;

      if (flap.includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) {
          triggerFlap();
        }
        return;
      }

      if (pause.includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) {
          togglePause();
        }
        return;
      }

      if (restart.includes(e.code)) {
        if (!e.repeat && (gameState === GAME_STATES.PAUSED || gameState === GAME_STATES.GAME_OVER)) {
          e.preventDefault();
          soundEngine.click();
          startReadyState();
        }
        return;
      }

      if (mute.includes(e.code)) {
        if (!e.repeat) {
          e.preventDefault();
          setSettings((prev) => ({ ...prev, muted: !prev.muted }));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settings.keybinds, showSettings, gameState, triggerFlap, togglePause, startReadyState]);

  // Auto-pause on tab switch
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && settings.autoPause && gameState === GAME_STATES.PLAYING) {
        setGameState(GAME_STATES.PAUSED);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [settings.autoPause, gameState]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const state = gameRef.current;

      if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.READY) {
        state.elapsed += dt;
        state.groundOffset = (state.groundOffset + difficulty.pipeSpeed * 0.65 * dt) % 48;
        state.cloudOffset = (state.cloudOffset + difficulty.pipeSpeed * 0.14 * dt) % CANVAS_WIDTH;
        state.cityOffset = (state.cityOffset + difficulty.pipeSpeed * 0.25 * dt) % CANVAS_WIDTH;
        state.birdY = PLAYABLE_HEIGHT * 0.45 + Math.sin(state.elapsed * 4) * 8;
        state.birdRotation = 0;
        state.wingPhase += dt * 10;
      } else if (gameState === GAME_STATES.PLAYING) {
        stepPhysics(state, dt, difficulty, {
          onScore: (newScore) => {
            setScore(newScore);
            soundEngine.score();
          },
          onHit: handleGameOver,
        });
      } else if (gameState === GAME_STATES.GAME_OVER) {
        updateParticles(state, dt);
      }

      renderGame(ctx, state, skin);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, difficulty, skin, handleGameOver]);

  const handleCanvasPointerDown = (e) => {
    if (e.pointerType === 'touch' && !settings.touchFlap) return;
    if (e.pointerType === 'mouse' && !settings.mouseFlap) return;
    triggerFlap();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.75)] border-4 border-slate-800 bg-slate-900"
        style={{ width: CANVAS_WIDTH, maxWidth: '100%', aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handleCanvasPointerDown}
          className="w-full h-full block touch-none cursor-pointer"
        />

        {/* In-Game HUD */}
        {(gameState === GAME_STATES.READY || gameState === GAME_STATES.PLAYING) && (
          <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between pointer-events-none">
            <button
              onClick={() => {
                soundEngine.click();
                setSettings((p) => ({ ...p, muted: !p.muted }));
              }}
              className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-slate-950/55 hover:bg-slate-950/80 border border-white/20 text-xs font-bold text-white backdrop-blur-sm"
            >
              {settings.muted ? 'Muted' : 'SFX On'}
            </button>

            <div className="text-5xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.65)] tracking-tight">
              {score}
            </div>

            {gameState === GAME_STATES.PLAYING ? (
              <button
                onClick={togglePause}
                className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-950/55 hover:bg-slate-950/80 border border-white/20 text-xs font-bold text-white backdrop-blur-sm"
              >
                Pause
              </button>
            ) : (
              <div className="w-14" />
            )}
          </div>
        )}

        {/* Ready Prompt */}
        {gameState === GAME_STATES.READY && (
          <div className="absolute inset-x-0 bottom-36 flex flex-col items-center pointer-events-none">
            <div className="px-4 py-2 rounded-2xl bg-slate-950/65 border border-white/20 backdrop-blur-sm text-center">
              <p className="text-lg font-black text-amber-300 tracking-wide">GET READY!</p>
              <p className="text-xs text-slate-200 mt-0.5">
                Press <span className="font-mono font-bold text-white">{formatKeyCode(settings.keybinds.flap[0])}</span>
                {settings.mouseFlap ? ' or Tap/Click' : ''} to Flap
              </p>
            </div>
          </div>
        )}

        {/* Main Menu */}
        {gameState === GAME_STATES.MENU && (
          <MainMenu
            settings={settings}
            bestScore={currentBest}
            onStart={() => {
              soundEngine.click();
              startReadyState();
            }}
            onOpenSettings={() => {
              soundEngine.click();
              setShowSettings(true);
            }}
            onSelectDifficulty={(diff) => {
              soundEngine.click();
              setSettings((p) => ({ ...p, difficulty: diff }));
            }}
            onSelectSkin={(skinId) => {
              soundEngine.click();
              setSettings((p) => ({ ...p, skin: skinId }));
            }}
          />
        )}

        {/* Pause Overlay */}
        {gameState === GAME_STATES.PAUSED && !showSettings && (
          <PauseOverlay
            onResume={togglePause}
            onRestart={() => {
              soundEngine.click();
              startReadyState();
            }}
            onOpenSettings={() => {
              soundEngine.click();
              setShowSettings(true);
            }}
            onMainMenu={() => {
              soundEngine.click();
              gameRef.current = createInitialGameState();
              setGameState(GAME_STATES.MENU);
            }}
          />
        )}

        {/* Game Over Modal */}
        {gameState === GAME_STATES.GAME_OVER && (
          <GameOverModal
            score={score}
            bestScore={currentBest}
            isNewBest={isNewBest}
            difficulty={settings.difficulty}
            restartKey={settings.keybinds.restart[0]}
            onRestart={() => {
              soundEngine.click();
              startReadyState();
            }}
            onMainMenu={() => {
              soundEngine.click();
              gameRef.current = createInitialGameState();
              setGameState(GAME_STATES.MENU);
            }}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={setSettings}
            onClose={() => {
              soundEngine.click();
              setShowSettings(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
