---
title: Remember the best run
title_tr: En iyi koşuyu hatırla
skills: [game.state]
---

# --goal--

The score is the distance divided by 10. When a run ends with a new record, it is saved in the browser's `localStorage`.

# --goal-tr--

Skor, mesafenin **onda biri** olsun (piksel sayısı çok büyük). Bir koşu **rekorla** biterse, tarayıcının küçük not
defterine (`localStorage`) kaydedilsin; sayfa kapansa da kalsın.

# --code--

```js
let best = Number(localStorage.getItem('runner-best')) || 0

    const score = Math.floor(distance / 10)
    if (score > best) {
      best = score
      localStorage.setItem('runner-best', best)
    }
```

# --meaning--

- `Math.floor` drops the decimals of `distance / 10`.
- `getItem` reads the saved record (`null` at first, so `|| 0`), `setItem` saves a new one.

# --meaning-tr--

- `localStorage.getItem('runner-best')` → kayıtlı rekoru oku; ilk seferde `null` gelir. `Number(...) || 0` → sayıya
  çevir, yoksa 0.
- `Math.floor(distance / 10)` → mesafeyi 10'a böl, ondalığı at: skor.
- `if (score > best)` → rekor kırıldıysa `best`'i güncelle ve `setItem` ile kaydet.

# --task--

1. Under `let nextIn`, write the `best` line.
2. In the crash block of `update`, work out the score and save a record.

# --task-tr--

1. `let nextIn ...` satırının altına `best` satırını yaz.
2. `update`'teki çarpışma bloğunda `state = 'over'` satırının altına skor ve rekor satırlarını yaz.
3. **Çalıştır**. (Skoru sonraki adımda ekranda göreceğiz.)

# --tests--

A crash after a long run should save the record.
tr: Uzun bir koşudan sonra çarpmak rekoru kaydetmeli.

```js
state = 'running'
distance = 1234
obstacles = [{ x: 70, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(best, 124)
assert.strictEqual(localStorage.getItem('runner-best'), '124')
```

A worse run should not replace the record.
tr: Daha kötü bir koşu rekoru değiştirmemeli.

```js
best = 500
state = 'running'
distance = 1234
obstacles = [{ x: 70, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(best, 500)
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
