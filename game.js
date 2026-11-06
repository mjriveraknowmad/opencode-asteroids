'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

const SPEED_BOOST_DURATION   = 5;    // segundos
const SPEED_BOOST_MULTIPLIER = 2;
const SHIELD_DURATION        = 8;    // segundos
const POWERUP_DROP_CHANCE    = 0.15;
const POWERUP_KINDS          = ['speed', 'shield', 'triple'];

const TRIPLE_SHOT_DURATION = 5;    // segundos
const TRIPLE_SHOT_COUNT    = 3;    // balas por disparo
const TRIPLE_SHOT_SPACING  = 10;   // px entre balas paralelas

const SHOOTING_STAR_CHANCE = 0.25;
const SHOOTING_STAR_SPEED  = 170;    // px/s, muy por encima de los 32-85 base
const SHOOTING_STAR_TTL    = [6, 10]; // segundos

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Skins ─────────────────────────────────────────────────────────────────────
const SKIN_STORAGE_KEY = 'asteroids.skin';

const SKINS = [
  {
    name: 'Clásica',
    color: '#fff',
    accent: 'rgba(255, 255, 255, 0.45)',
    flame: 'rgba(255, 130, 0, 0.85)',
    flameX: -8,
    flameY: 4,
    path(ctx, s) {
      ctx.beginPath();
      ctx.moveTo( 20 * s,  0);
      ctx.lineTo(-12 * s, -9 * s);
      ctx.lineTo( -7 * s,  0);
      ctx.lineTo(-12 * s,  9 * s);
      ctx.closePath();
    },
  },
  {
    name: 'Flecha',
    color: '#4cc9f0',
    accent: 'rgba(76, 201, 240, 0.5)',
    flame: 'rgba(76, 201, 240, 0.85)',
    flameX: -9,
    flameY: 5,
    path(ctx, s) {
      ctx.beginPath();
      ctx.moveTo( 24 * s,   0);
      ctx.lineTo(-14 * s, -11 * s);
      ctx.lineTo( -8 * s,   0);
      ctx.lineTo(-14 * s,  11 * s);
      ctx.closePath();
    },
    detail(ctx, s) {
      ctx.beginPath();
      ctx.moveTo( 12 * s, 0);
      ctx.lineTo( -8 * s, 0);
    },
  },
  {
    name: 'Halcón',
    color: '#ff4d9d',
    accent: 'rgba(255, 77, 157, 0.55)',
    flame: 'rgba(255, 77, 157, 0.85)',
    flameX: -7,
    flameY: 5,
    path(ctx, s) {
      ctx.beginPath();
      ctx.moveTo( 20 * s,   0);
      ctx.lineTo(  2 * s, -13 * s);
      ctx.lineTo(-14 * s,  -7 * s);
      ctx.lineTo( -8 * s,   0);
      ctx.lineTo(-14 * s,   7 * s);
      ctx.lineTo(  2 * s,  13 * s);
      ctx.closePath();
    },
    detail(ctx, s) {
      ctx.beginPath();
      ctx.arc(2 * s, 0, 3.2 * s, 0, Math.PI * 2);
    },
  },
  {
    name: 'Ovni',
    color: '#7bf1a8',
    accent: 'rgba(123, 241, 168, 0.5)',
    flame: 'rgba(123, 241, 168, 0.85)',
    flameX: -13,
    flameY: 3,
    path(ctx, s) {
      ctx.beginPath();
      ctx.moveTo( 16 * s,   0);
      ctx.lineTo(  8 * s,  -7 * s);
      ctx.lineTo(-10 * s,  -7 * s);
      ctx.lineTo(-15 * s,   0);
      ctx.lineTo(-10 * s,   7 * s);
      ctx.lineTo(  8 * s,   7 * s);
      ctx.closePath();
    },
    detail(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(-11 * s, 0);
      ctx.lineTo(  9 * s, 0);
    },
  },
];

let skinIndex = loadSkinIndex();

function currentSkin() {
  return SKINS[skinIndex];
}

function loadSkinIndex() {
  try {
    const saved = Number(localStorage.getItem(SKIN_STORAGE_KEY));
    return Number.isInteger(saved) && saved >= 0 && saved < SKINS.length ? saved : 0;
  } catch {
    return 0;
  }
}

function saveSkinIndex() {
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, String(skinIndex));
  } catch {
    // localStorage puede no estar disponible al abrir el archivo directamente
  }
}

function cycleSkin() {
  skinIndex = (skinIndex + 1) % SKINS.length;
  saveSkinIndex();
}

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius    = RADII[size];
    this.color     = '#fff';
    this.fillColor = null;
    this.dead      = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 2);
    this.color     = '#ffd166';
    this.fillColor = 'rgba(255, 209, 102, 0.5)';
    this.ttl       = rand(SHOOTING_STAR_TTL[0], SHOOTING_STAR_TTL[1]);

    const angle = rand(0, Math.PI * 2);
    const speed = SHOOTING_STAR_SPEED + rand(-10, 20);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() {
    return [];  // se desvanece sin fragmentarse
  }

  draw() {
    // Parpadeo antes de desvanecerse
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    // Estela opuesta a la dirección de movimiento
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.45)';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.14, this.y - this.vy * 0.14);
    ctx.stroke();
    ctx.restore();

    super.draw();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedBoost    = 0;
    this.shield        = 0;
    this.tripleShot    = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedBoost    > 0) this.speedBoost    -= dt;
    if (this.shield        > 0) this.shield        -= dt;
    if (this.tripleShot    > 0) this.tripleShot    -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    const SPEED  = this.speedBoost > 0 ? SPEED_BOOST_MULTIPLIER : 1;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * SPEED * dt, W);
    this.y = wrap(this.y + this.vy * SPEED * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;

    if (this.tripleShot <= 0) return [new Bullet(ox, oy, this.angle)];

    // Tres balas paralelas: cada una viaja en línea recta en la dirección de la nave
    const bullets = [];
    const perp = this.angle + Math.PI / 2;
    for (let i = 0; i < TRIPLE_SHOT_COUNT; i++) {
      const offset = (i - (TRIPLE_SHOT_COUNT - 1) / 2) * TRIPLE_SHOT_SPACING;
      bullets.push(new Bullet(
        ox + Math.cos(perp) * offset,
        oy + Math.sin(perp) * offset,
        this.angle,
      ));
    }
    return bullets;
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    const skin = currentSkin();
    const shipColor = this.speedBoost > 0 ? '#ffd166'
                    : this.tripleShot > 0 ? '#7ee0ff'
                    : skin.color;
    const shipAccent = this.speedBoost > 0 ? 'rgba(255, 209, 102, 0.5)'
                     : this.tripleShot > 0 ? 'rgba(126, 224, 255, 0.55)'
                     : skin.accent;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = shipColor;

    // Silueta según la skin elegida
    skin.path(ctx, 1);
    ctx.stroke();

    // Detalles interiores de la skin
    if (skin.detail) {
      ctx.strokeStyle = shipAccent;
      skin.detail(ctx, 1);
      ctx.stroke();
    }

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(skin.flameX, -skin.flameY);
      ctx.lineTo(skin.flameX - rand(6, 14), 0);
      ctx.lineTo(skin.flameX,  skin.flameY);
      ctx.strokeStyle = skin.flame;
      ctx.stroke();
    }

    // Escudo activo: anillo cian pulsante alrededor de la nave
    if (this.shield > 0) {
      const pulse = 0.55 + Math.sin(this.shield * 8) * 0.2;
      ctx.strokeStyle = `rgba(76, 201, 240, ${pulse.toFixed(2)})`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups ─────────────────────────────────────────────────────────────────
class PowerUp {
  constructor(x, y, kind = 'speed') {
    this.x      = x;
    this.y      = y;
    this.kind   = kind;   // 'speed' | 'shield' | 'triple'
    this.radius = 14;
    this.ttl    = 12;
    this.rot    = 0;
    this.dead   = false;
    this.color  = kind === 'shield' ? '#4cc9f0'
                : kind === 'triple' ? '#7ee0ff'
                : '#ffd166';
    this.label  = kind === 'shield' ? 'ESC'
                : kind === 'triple' ? '3X'
                : '2X';
  }

  update(dt) {
    this.rot += dt * 2.5;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo antes de desaparecer
    if (this.ttl < 3 && Math.floor(this.ttl * 8) % 2 === 0) return;

    const isShield = this.kind === 'shield';

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';

    if (isShield) {
      // Anillo con hexágono interior
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a  = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * this.radius * 0.55;
        const py = Math.sin(a) * this.radius * 0.55;
        if (i === 0) ctx.moveTo(px, py);
        else         ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    } else {
      // Rombo giratorio
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a  = (i / 4) * Math.PI * 2;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else         ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Etiqueta ("2X", "ESC" o "3X") siempre horizontal
    ctx.rotate(-this.rot);
    ctx.fillStyle    = this.color;
    ctx.font         = isShield ? 'bold 9px monospace' : 'bold 13px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 1);
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function safeSpawnPoint() {
  const SAFE_DIST = 130;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
  return { x, y };
}

function spawnAsteroids(count) {
  for (let i = 0; i < count; i++) {
    const { x, y } = safeSpawnPoint();
    asteroids.push(new Asteroid(x, y, 3));
  }

  if (Math.random() < SHOOTING_STAR_CHANCE) {
    const { x, y } = safeSpawnPoint();
    asteroids.push(new ShootingStar(x, y));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  const activeBoost  = ship.speedBoost;
  const activeShield = ship.shield;
  const activeTriple = ship.tripleShot;
  ship.reset();
  ship.speedBoost = activeBoost;   // los power-ups no se pierden al cambiar de nivel
  ship.shield     = activeShield;
  ship.tripleShot = activeTriple;
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (pressed('KeyS')) cycleSkin();

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        if (Math.random() < POWERUP_DROP_CHANCE) {
          const kind = POWERUP_KINDS[randInt(0, POWERUP_KINDS.length - 1)];
          powerups.push(new PowerUp(a.x, a.y, kind));
        }
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs power-up
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.kind === 'shield')      ship.shield     = SHIELD_DURATION;
      else if (p.kind === 'triple') ship.tripleShot = TRIPLE_SHOT_DURATION;
      else                          ship.speedBoost = SPEED_BOOST_DURATION;
      explode(p.x, p.y, 6);
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shield > 0) {
          // El escudo destruye el asteroide sin dañar la nave
          a.dead = true;
          explode(a.x, a.y, a.size * 5);
        } else {
          killShip();
        }
        break;
      }
    }
    asteroids = asteroids.filter(a => !a.dead);
  }

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const skin = currentSkin();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = skin.color;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  skin.path(ctx, 0.45);
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  let hudY = 48;
  if (ship.speedBoost > 0 && state !== 'gameover') {
    ctx.fillStyle = '#ffd166';
    ctx.fillText(`VELOCIDAD x2  ${ship.speedBoost.toFixed(1)}s`, 14, hudY);
    hudY += 22;
  }
  if (ship.shield > 0 && state !== 'gameover') {
    ctx.fillStyle = '#4cc9f0';
    ctx.fillText(`ESCUDO  ${ship.shield.toFixed(1)}s`, 14, hudY);
    hudY += 22;
  }
  if (ship.tripleShot > 0 && state !== 'gameover') {
    ctx.fillStyle = '#7ee0ff';
    ctx.fillText(`TRIPLE SHOT  ${ship.tripleShot.toFixed(1)}s`, 14, hudY);
    hudY += 22;
  }

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  ctx.textAlign = 'left';
  ctx.font      = '13px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(`SKIN: ${currentSkin().name}   [S] CAMBIAR`, 14, H - 14);
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
