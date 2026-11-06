# AGENTS.md

## What this is

Plain HTML5 Canvas Asteroids clone: no dependencies, bundler, package manager, tests, lint, or CI. Do not run `npm install`/`npm test`; there is nothing to build.

- `index.html` — page shell, loads `game.js` as a classic script
- `game.js` — entire game in one file (input, entities, game loop, rendering)
- `README.md` — user-facing docs in Spanish; keep it in sync with behavior changes

## Run / verify

Open `index.html` directly in a browser, or:

```bash
npx serve .
```

There are no automated checks. Verify manually: play, shoot asteroids, lose all 3 lives, restart with Space, and clear a level.

## Architecture notes

- `game.js` runs in global scope with `'use strict'`; no imports/modules. Calls `initGame()` then starts a `requestAnimationFrame` loop at the bottom.
- Loop: `update(dt)` then `draw()`. `dt` is in **seconds** and capped at `0.05`; all speeds, cooldowns, and TTLs use seconds. Never assume a fixed frame rate.
- State machine: `state` is `'playing' | 'dead' | 'gameover'`, handled in `update()`.
- Entities (`Ship`, `Asteroid`, `Bullet`, `Particle`, `PowerUp`) expose `update(dt)` / `draw()` and a `dead` flag; arrays are filtered each frame. Asteroid sizes are `1..3`, indexed into `RADII`/`SPEEDS`/`POINTS`.
- `ship.speedBoost` is seconds remaining. The `2X` boost multiplies only ship displacement (`vx * dt`), not thrust, rotation, or bullets — do not also multiply thrust or the effect compounds.
- `ship.tripleShot` is seconds remaining. While active, `tryShoot()` returns three parallel bullets along the ship's facing direction (no spread); it does not change cooldown or bullet damage. Preserve it across `nextLevel()` like `speedBoost`.
- `PowerUp` has a `kind` (`'speed'` | `'triple'`) that picks its color and HUD-style label (`2X` / `3X`); the pickup applies the matching timer on `ship`.
- `ShootingStar` extends `Asteroid`: faster, has a TTL, blinks before expiring, and overrides `split()` to return `[]`. Letting it expire is a valid way for a level to finish.
- Input uses two sets: `keys` for held keys and `justPressed` for one-shot actions. `pressed(code)` **consumes** the flag, so call it once per frame per key.
- World is toroidal via `wrap()`, but collision checks use plain Euclidean `dist()`. Objects across opposite edges do not collide; use a wrapped shortest-axis delta if changing collision logic.
- All rendering is procedural canvas; no image/audio assets. UI strings are Spanish — keep new user-facing text Spanish.

## Gotchas

- Canvas size `800x600` is hardcoded in both `index.html` (`<canvas width height>`) and `game.js` (`W`, `H`). Change both together.
- `spawnAsteroids()` keeps a 130px safe radius around screen center; preserve this when changing spawn logic or the ship can die immediately.
- After ship death, `deadTimer` runs while asteroids keep moving; `initGame()` resets every global, while `nextLevel()` preserves score/lives.
