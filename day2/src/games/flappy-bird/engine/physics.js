import {
  BIRD_RADIUS,
  BIRD_X,
  CANVAS_WIDTH,
  PIPE_WIDTH,
  PLAYABLE_HEIGHT,
} from '../constants';

export function createInitialGameState() {
  return {
    birdY: PLAYABLE_HEIGHT * 0.45,
    birdVelocity: 0,
    birdRotation: 0,
    wingPhase: 0,
    pipes: [],
    particles: [],
    groundOffset: 0,
    cloudOffset: 0,
    cityOffset: 0,
    spawnTimer: 0.4,
    score: 0,
    shakeTime: 0,
    flashAlpha: 0,
    elapsed: 0,
  };
}

export function spawnPipe(state, difficulty, score) {
  const minTop = 64;
  const maxTop = PLAYABLE_HEIGHT - difficulty.pipeGap - 64;
  const gapTop = minTop + Math.random() * (maxTop - minTop);
  const oscillate = score >= difficulty.oscillateAfter;

  state.pipes.push({
    x: CANVAS_WIDTH + 20,
    baseGapTop: gapTop,
    gapTop,
    gapHeight: difficulty.pipeGap,
    passed: false,
    oscillate,
    phase: Math.random() * Math.PI * 2,
    amp: oscillate ? 28 : 0,
  });
}

export function spawnFlapParticles(state, skinColor) {
  for (let i = 0; i < 6; i++) {
    state.particles.push({
      x: BIRD_X - 10 + (Math.random() - 0.5) * 6,
      y: state.birdY + 4 + (Math.random() - 0.5) * 6,
      vx: -60 - Math.random() * 80,
      vy: 30 + (Math.random() - 0.5) * 80,
      radius: 2.5 + Math.random() * 3,
      life: 0.35 + Math.random() * 0.2,
      maxLife: 0.55,
      color: i % 2 === 0 ? '#ffffff' : skinColor,
    });
  }
}

export function spawnScoreParticles(state) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 70 + Math.random() * 70;
    state.particles.push({
      x: BIRD_X,
      y: state.birdY - 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 20,
      radius: 2 + Math.random() * 2.5,
      life: 0.45 + Math.random() * 0.2,
      maxLife: 0.65,
      color: i % 2 === 0 ? '#fde047' : '#fbbf24',
    });
  }
}

export function spawnHitParticles(state) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 180;
    state.particles.push({
      x: BIRD_X,
      y: state.birdY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 3.5,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.7,
      color: i % 2 === 0 ? '#f87171' : '#fbbf24',
    });
  }
}

function circleRectCollide(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

export function stepPhysics(state, dt, difficulty, { onScore, onHit }) {
  state.elapsed += dt;

  // Bird physics
  state.birdVelocity += difficulty.gravity * dt;
  state.birdY += state.birdVelocity * dt;
  state.wingPhase += dt * (state.birdVelocity < 0 ? 18 : 8);

  // Smooth pitch rotation
  const targetRot =
    state.birdVelocity < 0
      ? -0.45
      : Math.min(Math.PI / 2.2, (state.birdVelocity / 600) * (Math.PI / 2));
  state.birdRotation += (targetRot - state.birdRotation) * Math.min(1, dt * 10);

  // Scroll parallax layers
  state.groundOffset = (state.groundOffset + difficulty.pipeSpeed * dt) % 48;
  state.cloudOffset = (state.cloudOffset + difficulty.pipeSpeed * 0.16 * dt) % CANVAS_WIDTH;
  state.cityOffset = (state.cityOffset + difficulty.pipeSpeed * 0.35 * dt) % CANVAS_WIDTH;

  // Spawn & move pipes
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnPipe(state, difficulty, state.score);
    state.spawnTimer = difficulty.pipeSpawnInterval;
  }

  for (let i = state.pipes.length - 1; i >= 0; i--) {
    const pipe = state.pipes[i];
    pipe.x -= difficulty.pipeSpeed * dt;

    if (pipe.oscillate) {
      pipe.phase += dt * 2.2;
      pipe.gapTop = Math.max(
        50,
        Math.min(
          PLAYABLE_HEIGHT - pipe.gapHeight - 50,
          pipe.baseGapTop + Math.sin(pipe.phase) * pipe.amp
        )
      );
    }

    // Score check
    if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
      pipe.passed = true;
      state.score += 1;
      spawnScoreParticles(state);
      onScore(state.score);
    }

    // Remove off-screen pipes
    if (pipe.x + PIPE_WIDTH < -20) {
      state.pipes.splice(i, 1);
    }
  }

  // Update particles
  updateParticles(state, dt);

  // Collision check (slightly forgiving radius: BIRD_RADIUS - 2)
  const hitRadius = BIRD_RADIUS - 2;

  // Ground or ceiling collision
  if (state.birdY + hitRadius >= PLAYABLE_HEIGHT) {
    state.birdY = PLAYABLE_HEIGHT - hitRadius;
    state.shakeTime = 0.28;
    state.flashAlpha = 0.75;
    spawnHitParticles(state);
    onHit();
    return;
  }
  if (state.birdY - hitRadius < 0) {
    state.birdY = hitRadius;
    state.birdVelocity = 0;
  }

  // Pipe collision
  for (const pipe of state.pipes) {
    const topPipeHit = circleRectCollide(
      BIRD_X,
      state.birdY,
      hitRadius,
      pipe.x,
      0,
      PIPE_WIDTH,
      pipe.gapTop
    );
    const bottomPipeY = pipe.gapTop + pipe.gapHeight;
    const bottomPipeHit = circleRectCollide(
      BIRD_X,
      state.birdY,
      hitRadius,
      pipe.x,
      bottomPipeY,
      PIPE_WIDTH,
      PLAYABLE_HEIGHT - bottomPipeY
    );
    if (topPipeHit || bottomPipeHit) {
      state.shakeTime = 0.28;
      state.flashAlpha = 0.75;
      spawnHitParticles(state);
      onHit();
      return;
    }
  }
}

export function updateParticles(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
  if (state.shakeTime > 0) state.shakeTime = Math.max(0, state.shakeTime - dt);
  if (state.flashAlpha > 0) state.flashAlpha = Math.max(0, state.flashAlpha - dt * 2.8);
}
