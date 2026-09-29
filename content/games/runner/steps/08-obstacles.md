---
title: Things that come at you
title_tr: Üstüne gelen engeller
skills: [prog.arrays]
---

# --goal--

The runner never really moves forward: the world moves toward it. Obstacles live in a list; every frame each one slides
left by `speed` pixels, and the ones gone off the left edge are dropped.

# --goal-tr--

Sonsuz koşucunun sırrı: koşucu aslında **hiç ilerlemez**, **dünya ona doğru kayar**. Engeller bir **listede** duruyor;
her karede her biri `speed` piksel **sola** kayar, sol kenardan çıkanlar listeden atılır. Engelleri yeşil kutular (kaktüs)
olarak çiziyoruz.

# --code--

```js
let obstacles = []
let speed = 6

  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  for (const o of obstacles) {
    ctx.fillStyle = '#15803d'
    ctx.fillRect(o.x, o.y, o.w, o.h)
  }
```

# --meaning--

- Each obstacle is a box: `{ x, y, w, h }`.
- `o.x -= speed` moves it 6 pixels left each frame.
- `filter` keeps only the obstacles whose right edge (`x + w`) is still on screen.

# --meaning-tr--

- `let obstacles = []` → engellerin listesi, başta boş. Her engel bir kutu: `{ x, y, w, h }`.
- `let speed = 6` → dünyanın her karede kaç piksel kaydığı.
- `for (const o of obstacles) o.x -= speed` → her engeli 6 piksel sola kaydır.
- `obstacles.filter((o) => o.x + o.w > 0)` → **sağ kenarı** hâlâ ekranda olanları tut; tamamen çıkanları unut.
- `draw` içinde her engel yeşil bir kutu.

# --task--

1. Under `runner`, write `obstacles` and `speed`.
2. At the end of `update`, move and filter the obstacles.
3. At the end of `draw`, draw them.

# --task-tr--

1. `let runner = ...` satırının altına `obstacles` ve `speed` satırlarını yaz.
2. `update`'in sonuna, zemin bloğunun altına bir boş satır bırakıp iki satırı yaz.
3. `draw`'ın sonuna, koşucuyu çizen satırın altına engel döngüsünü yaz.
4. **Çalıştır**. (Henüz engel yok; bir sonraki adımda gelecekler.)

# --tests--

Obstacles should slide left by `speed` each frame.
tr: Engeller her karede `speed` kadar sola kaymalı.

```js
obstacles = [{ x: 600, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(obstacles[0].x, 594)
$.tick()
assert.deepEqual($.rects('#15803d'), [{ x: 588, y: 140, w: 20, h: 40, color: '#15803d' }])
```

Obstacles gone off the left edge should be dropped.
tr: Sol kenardan çıkan engeller atılmalı.

```js
obstacles = [{ x: -15, y: 140, w: 20, h: 40 }, { x: 300, y: 140, w: 20, h: 40 }]
update()
assert.lengthOf(obstacles, 1)
assert.strictEqual(obstacles[0].x, 294)
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
const JUMP = -11 // speed at the start of a jump (negative = up)
const CUT = -4 // letting go early caps the upward speed at this
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
let obstacles = []
let speed = 6

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (onGround()) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  for (const o of obstacles) {
    ctx.fillStyle = '#15803d'
    ctx.fillRect(o.x, o.y, o.w, o.h)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
