---
title: The score counter
title_tr: Skor sayacı
skills: [game.canvas]
---

# --goal--

Top right, like the classic runner: the high score and the current score, each with 5 digits.

# --goal-tr--

Sağ üstte, klasik koşucu oyunundaki gibi: **en yüksek skor** ve **şimdiki skor**, her biri 5 haneli (`00042` gibi).

# --code--

```js
const score = Math.floor(distance / 10)
ctx.fillStyle = '#334155'
ctx.font = '16px monospace'
ctx.textAlign = 'right'
ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24)
```

# --meaning--

- `padStart(5, '0')` adds zeros in front until the text is 5 characters long: `42` becomes `00042`.
- `monospace` makes every digit the same width, so the numbers do not jiggle as they change.

# --meaning-tr--

- `String(best)` → sayıyı metne çevir; `.padStart(5, '0')` → metin 5 karakter olana kadar **başına sıfır** ekle:
  `42` → `00042`.
- `'HI ' + ... + '  ' + ...` → `HI 00124  00042` gibi tek bir metin.
- `ctx.font = '16px monospace'` → eşit genişlikli yazı tipi: rakamlar değişirken yazı titremez.
- `ctx.textAlign = 'right'` → yazı sağ kenardan 10 piksel içeride **biter**.

# --task--

In `draw`, between the obstacles loop and `ctx.textAlign = 'center'`, write the score lines.

# --task-tr--

`draw` içinde engel döngüsü ile `ctx.textAlign = 'center'` satırının arasına skor satırlarını yaz (bir boş satırla). **Çalıştır**.

# --tests--

The high score and the score should be shown with 5 digits.
tr: En yüksek skor ve skor 5 haneli gösterilmeli.

```js
best = 124
distance = 425
$.tick()
assert.include($.texts(), 'HI 00124 00042')
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
let best = Number(localStorage.getItem('runner-best')) || 0

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
    const score = Math.floor(distance / 10)
    if (score > best) {
      best = score
      localStorage.setItem('runner-best', best)
    }
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

  const score = Math.floor(distance / 10)
  ctx.fillStyle = '#334155'
  ctx.font = '16px monospace'
  ctx.textAlign = 'right'
  ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24)

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
