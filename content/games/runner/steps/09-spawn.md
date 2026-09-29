---
title: Cacti keep coming
title_tr: Kaktüsler gelmeye devam ediyor
skills: [game.state]
---

# --goal--

A countdown decides when the next cactus appears at the right edge. After each one, the next wait is random, but never
shorter than 50 frames, so there is always room to land.

# --goal-tr--

Bir **geri sayım** sıradaki kaktüsün sağ kenarda ne zaman belireceğine karar versin. Her kaktüsten sonra bekleme
**rastgele** olsun ki oyun tahmin edilemesin; ama hiç **50 kareden kısa** olmasın, yoksa iki kaktüs arasına inip yeniden
zıplamak imkânsızlaşır.

# --code--

```js
let nextIn = 60 // frames until the next obstacle

function spawn() {
  obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

  nextIn -= 1
  if (nextIn <= 0) spawn()
```

# --meaning--

- `spawn` adds a 20×40 cactus standing on the ground, just past the right edge.
- The next wait is 50 plus a random whole number from 0 to 69.
- In `update`, the countdown goes down by one each frame and spawns at zero.

# --meaning-tr--

- `obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })` → sağ kenarda, zeminde duran 20×40'lık bir kaktüs.
- `Math.floor(Math.random() * 70)` → 0 ile 69 arası rastgele tam sayı. `50 + ...` → bekleme 50–119 kare.
- `nextIn -= 1` → her kare geri sayım bir azalır; `if (nextIn <= 0) spawn()` → sıfıra inince yeni kaktüs (ve yeni
  bekleme).

# --task--

1. Under `speed`, write `nextIn`.
2. Under the pointer lines, write `spawn`.
3. In `update`, write the countdown right above the line that moves the obstacles.

# --task-tr--

1. `let speed = 6` satırının altına `nextIn` satırını yaz.
2. `pointerup` satırının altına bir boş satır bırakıp `spawn` fonksiyonunu yaz.
3. `update` içinde engelleri kaydıran satırın hemen **üstüne** geri sayım satırlarını yaz.
4. **Çalıştır**: kaktüsler sağdan akmalı. (Çarpmak henüz bir şey yapmıyor.)

# --tests--

The first cactus should appear after 60 frames at the right edge.
tr: İlk kaktüs 60 kare sonra sağ kenarda belirmeli.

```js
$.tick(59)
assert.lengthOf(obstacles, 0)
$.tick(1)
assert.lengthOf(obstacles, 1)
assert.deepEqual(obstacles[0], { x: 594, y: 140, w: 20, h: 40 })
```

The wait before the next one should be between 50 and 119 frames.
tr: Sıradakinden önceki bekleme 50 ile 119 kare arasında olmalı.

```js
for (let i = 0; i < 100; i++) {
  spawn()
  assert.isAtLeast(nextIn, 50)
  assert.isAtMost(nextIn, 119)
}
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
let nextIn = 60 // frames until the next obstacle

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

function spawn() {
  obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  nextIn -= 1
  if (nextIn <= 0) spawn()
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
