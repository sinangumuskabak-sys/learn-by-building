---
title: Faster and faster
title_tr: Giderek hızlan
skills: [game.state]
---

# --goal--

The world speeds up a little every frame, up to twice its starting speed. We also add up the distance run, which will
become the score.

# --goal-tr--

Dünya her karede **biraz** hızlansın; başlangıç hızının iki katına kadar. Bir de **koşulan mesafeyi** toplayalım:
skor ondan çıkacak.

# --code--

```js
let distance
  distance = 0

  distance += speed
  speed = Math.min(12, speed + 0.003)
```

# --meaning--

- `distance` grows by the speed every frame: the pixels the world has moved.
- `speed + 0.003` each frame is +0.18 a second; `Math.min(12, ...)` stops it at 12.

# --meaning-tr--

- `distance += speed` → her karede dünya ne kadar kaydıysa mesafeye ekle.
- `speed + 0.003` → her karede hız biraz artar (saniyede ~0,18). Çok küçük görünüyor ama bir dakikada iki katına yakın.
- `Math.min(12, ...)` → iki sayıdan **küçüğünü** seçer: hız 12'yi geçmez. Bir **üst sınır**.

# --task--

1. Under `let speed`, write `let distance`; in `reset`, under `speed = 6`, write `distance = 0`.
2. In `update`, under the ground block, write the two lines.

# --task-tr--

1. `let speed` satırının altına `let distance`, `reset` içinde `speed = 6` satırının altına `distance = 0` yaz.
2. `update` içinde zemin bloğunun altına bir boş satır bırakıp iki satırı yaz.
3. **Çalıştır** ve uzun süre dayan: dünya hızlanmalı.

# --tests--

While running, the distance should grow by the speed and the speed should rise.
tr: Koşarken mesafe hız kadar büyümeli ve hız artmalı.

```js
state = 'running'
update()
assert.strictEqual(distance, 6)
assert.closeTo(speed, 6.003, 1e-9)
```

The speed should stop at 12.
tr: Hız 12'de durmalı.

```js
state = 'running'
speed = 11.999
update()
assert.strictEqual(speed, 12)
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
const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much
const STAND_H = 44

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let distance
let nextIn // frames until the next obstacle

function reset() {
  runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  distance = 0
  nextIn = 60
}

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'running'
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

function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}

function update() {
  if (state !== 'running') return

  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  distance += speed
  speed = Math.min(12, speed + 0.003)

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) {
    state = 'over'
  }
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

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
