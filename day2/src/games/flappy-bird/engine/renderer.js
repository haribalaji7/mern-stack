import {
  BIRD_RADIUS,
  BIRD_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_HEIGHT,
  PIPE_CAP_HEIGHT,
  PIPE_CAP_OVERHANG,
  PIPE_WIDTH,
  PLAYABLE_HEIGHT,
} from '../constants';

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 73 + 19) % CANVAS_WIDTH,
  y: (i * 41 + 13) % (PLAYABLE_HEIGHT * 0.6),
  r: (i % 3) * 0.6 + 0.8,
  phase: i * 0.9,
}));

const CITY_BUILDINGS = [
  { w: 42, h: 110 },
  { w: 34, h: 75 },
  { w: 50, h: 140 },
  { w: 30, h: 90 },
  { w: 46, h: 125 },
  { w: 38, h: 80 },
  { w: 54, h: 155 },
  { w: 36, h: 95 },
  { w: 44, h: 115 },
  { w: 36, h: 70 },
  { w: 30, h: 105 },
];

function getSkyPalette(score) {
  // 0-14: Day, 15-29: Sunset, 30+: Night
  const phase = Math.floor(score / 15) % 3;
  if (phase === 1) {
    return {
      top: '#43145b',
      mid: '#c2410c',
      bottom: '#fdba74',
      city: '#311042',
      cityWindow: 'rgba(253, 224, 71, 0.45)',
      isNight: false,
      sunColor: '#fb923c',
    };
  }
  if (phase === 2) {
    return {
      top: '#020617',
      mid: '#0f172a',
      bottom: '#1e293b',
      city: '#090d16',
      cityWindow: 'rgba(250, 204, 21, 0.7)',
      isNight: true,
      sunColor: '#e2e8f0',
    };
  }
  return {
    top: '#0284c7',
    mid: '#38bdf8',
    bottom: '#bae6fd',
    city: '#0369a1',
    cityWindow: 'rgba(224, 242, 254, 0.3)',
    isNight: false,
    sunColor: '#fef08a',
  };
}

function drawCloud(ctx, x, y, scale, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.arc(20, -6, 24, 0, Math.PI * 2);
  ctx.arc(44, 0, 18, 0, Math.PI * 2);
  ctx.arc(22, 8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPipe(ctx, pipe) {
  const drawColumn = (x, y, w, h, capY) => {
    if (h <= 0) return;

    // 3D cylindrical gradient
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, '#15803d');
    grad.addColorStop(0.25, '#4ade80');
    grad.addColorStop(0.55, '#22c55e');
    grad.addColorStop(1, '#14532d');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.5;

    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Pipe cap
    const capX = x - PIPE_CAP_OVERHANG;
    const capW = w + PIPE_CAP_OVERHANG * 2;
    const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    capGrad.addColorStop(0, '#166534');
    capGrad.addColorStop(0.25, '#86efac');
    capGrad.addColorStop(0.6, '#22c55e');
    capGrad.addColorStop(1, '#052e16');

    ctx.fillStyle = capGrad;
    ctx.fillRect(capX, capY, capW, PIPE_CAP_HEIGHT);
    ctx.strokeRect(capX, capY, capW, PIPE_CAP_HEIGHT);
  };

  // Top pipe
  drawColumn(
    pipe.x,
    -2,
    PIPE_WIDTH,
    pipe.gapTop + 2,
    pipe.gapTop - PIPE_CAP_HEIGHT
  );

  // Bottom pipe
  const bottomY = pipe.gapTop + pipe.gapHeight;
  drawColumn(
    pipe.x,
    bottomY,
    PIPE_WIDTH,
    PLAYABLE_HEIGHT - bottomY,
    bottomY
  );
}

function drawBird(ctx, state, skin) {
  ctx.save();
  ctx.translate(BIRD_X, state.birdY);
  ctx.rotate(state.birdRotation);

  // Body
  ctx.fillStyle = skin.body;
  ctx.strokeStyle = skin.outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_RADIUS + 2, BIRD_RADIUS - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = skin.belly;
  ctx.beginPath();
  ctx.ellipse(1, 5, BIRD_RADIUS - 4, BIRD_RADIUS - 9, 0, 0, Math.PI);
  ctx.fill();

  // Animated wing
  const wingY = Math.sin(state.wingPhase) * 5;
  ctx.fillStyle = skin.wing;
  ctx.beginPath();
  ctx.ellipse(-4, 2 + wingY * 0.4, 9, 6, -0.2 + wingY * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(8, -5, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(9.5, -5, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(10.3, -6.2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = skin.beak;
  ctx.beginPath();
  ctx.moveTo(13, -1);
  ctx.lineTo(24, 3);
  ctx.lineTo(13, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function renderGame(ctx, state, skin) {
  ctx.save();

  // Screen shake
  if (state.shakeTime > 0) {
    const mag = (state.shakeTime / 0.28) * 7;
    ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
  }

  const palette = getSkyPalette(state.score);

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, PLAYABLE_HEIGHT);
  skyGrad.addColorStop(0, palette.top);
  skyGrad.addColorStop(0.65, palette.mid);
  skyGrad.addColorStop(1, palette.bottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, PLAYABLE_HEIGHT);

  // Stars at night
  if (palette.isNight) {
    for (const s of STARS) {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(state.elapsed * 2 + s.phase));
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sun / Moon
  ctx.save();
  ctx.fillStyle = palette.sunColor;
  ctx.shadowColor = palette.sunColor;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 75, 90, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Parallax Clouds
  const cloudAlpha = palette.isNight ? 0.15 : 0.78;
  drawCloud(ctx, ((60 - state.cloudOffset + CANVAS_WIDTH) % CANVAS_WIDTH) - 40, 110, 0.9, cloudAlpha);
  drawCloud(ctx, ((220 - state.cloudOffset + CANVAS_WIDTH) % CANVAS_WIDTH) - 40, 175, 0.75, cloudAlpha);
  drawCloud(ctx, ((360 - state.cloudOffset + CANVAS_WIDTH) % CANVAS_WIDTH) - 40, 85, 1.05, cloudAlpha);

  // Parallax City Skyline
  const drawCityPass = (offsetX) => {
    let bx = offsetX;
    for (let i = 0; i < CITY_BUILDINGS.length; i++) {
      const b = CITY_BUILDINGS[i];
      ctx.fillStyle = palette.city;
      ctx.fillRect(bx, PLAYABLE_HEIGHT - b.h, b.w - 2, b.h);

      // Subtle windows
      ctx.fillStyle = palette.cityWindow;
      for (let wy = PLAYABLE_HEIGHT - b.h + 10; wy < PLAYABLE_HEIGHT - 16; wy += 16) {
        for (let wx = bx + 6; wx < bx + b.w - 10; wx += 10) {
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
      bx += b.w;
    }
  };
  drawCityPass(-state.cityOffset);
  drawCityPass(CANVAS_WIDTH - state.cityOffset);

  // Pipes
  for (const pipe of state.pipes) {
    drawPipe(ctx, pipe);
  }

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Bird
  drawBird(ctx, state, skin);

  // Ground
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, PLAYABLE_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

  // Grass top strip
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, PLAYABLE_HEIGHT, CANVAS_WIDTH, 18);

  // Scrolling diagonal stripes on grass
  ctx.fillStyle = '#16a34a';
  for (let gx = -state.groundOffset; gx < CANVAS_WIDTH + 48; gx += 24) {
    ctx.beginPath();
    ctx.moveTo(gx, PLAYABLE_HEIGHT);
    ctx.lineTo(gx + 12, PLAYABLE_HEIGHT);
    ctx.lineTo(gx + 4, PLAYABLE_HEIGHT + 18);
    ctx.lineTo(gx - 8, PLAYABLE_HEIGHT + 18);
    ctx.closePath();
    ctx.fill();
  }

  // Ground border line
  ctx.fillStyle = '#052e16';
  ctx.fillRect(0, PLAYABLE_HEIGHT, CANVAS_WIDTH, 3);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(0, PLAYABLE_HEIGHT + 18, CANVAS_WIDTH, 3);

  // Collision Flash
  if (state.flashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.restore();
}
