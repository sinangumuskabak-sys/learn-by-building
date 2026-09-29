---
title: Gravity
title_tr: Yer çekimi
skills: [game.physics]
---

# --goal--

The runner gets a vertical speed `vy`. Every frame gravity adds to it and the speed moves the runner; when the feet
reach the ground, it stops there.

# --goal-tr--

Koşucuya bir **dikey hız** veriyoruz: `vy`. Her karede **yer çekimi** bu hıza biraz ekler (aşağı doğru), hız da
koşucuyu hareket ettirir. Ayakları zemine değince orada durur. Gerçek düşüş de böyledir: düştükçe hızlanırsın.

Koşucu zaten yerde durduğu için bu adımda bir şey değişmeyecek; ama bir sonraki adımda zıplayınca yer çekimi onu geri
indirecek.

# --code--

```js
const GRAVITY = 0.6

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
}

  update()
```

# --meaning--

- `vy` is how many pixels the runner moves down each frame (negative = up).
- Gravity adds 0.6 each frame, so a fall speeds up.
- `onGround` checks whether the feet (`y + h`) are at or below the ground; then the runner is put back on it and stops.

# --meaning-tr--

- `vy: 0` → dikey hız: her karede kaç piksel **aşağı** gideceği (eksi değer yukarı demek). Başta 0.
- `runner.vy += GRAVITY` → her kare hıza 0,6 ekle: düşüş **hızlanır**.
- `runner.y += runner.vy` → hıza göre hareket et.
- `onGround()` → ayakların yeri `runner.y + runner.h`; zemine ulaştı ya da geçtiyse `true`.
- `runner.y = GROUND - runner.h` ve `runner.vy = 0` → zeminin içine gömülmesin: tam üstüne koy ve dur.
- `update()` döngüde `draw()`'dan önce: önce hareket, sonra çizim.

# --task--

1. Under `GROUND`, write `GRAVITY`; add `, vy: 0` to `runner`.
2. Under `runner`, write `onGround` and `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `const GROUND = ...` satırının altına `GRAVITY` satırını yaz; `runner` nesnesinin sonuna `, vy: 0` ekle.
2. `runner` satırının altına `onGround` ve `update` fonksiyonlarını yaz.
3. `loop` içinde `draw()` satırının üstüne `update()` yaz.
4. **Çalıştır**.

# --try--

Start the runner at `y: 0` and watch it drop. Then set it back to `GROUND - STAND_H`.

# --try-tr--

Koşucuyu `y: 0` ile başlat ve düşüşünü izle. Sonra `GROUND - STAND_H`'ye geri al.

# --tests--

A runner in the air should fall faster and faster.
tr: Havadaki koşucu giderek hızlanarak düşmeli.

```js
runner.y = 20
runner.vy = 0
update()
assert.closeTo(runner.vy, 0.6, 1e-9)
update()
assert.closeTo(runner.vy, 1.2, 1e-9)
assert.closeTo(runner.y, 21.8, 1e-9)
```

It should land and stop on the ground.
tr: Zemine inip orada durmalı.

```js
runner.y = 20
runner.vy = 0
$.run(2)
assert.strictEqual(runner.y, 136)
assert.strictEqual(runner.vy, 0)
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
