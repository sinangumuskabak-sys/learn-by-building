---
title: Wait for the start
title_tr: Başlangıcı bekle
skills: [game.state]
---

# --goal--

The world should not start rushing before the player is ready. The game has a `state`; it starts as `'ready'` and the
first jump switches it to `'running'`.

# --goal-tr--

Dünya, oyuncu hazır olmadan akmaya başlamasın. Oyuna bir **durum** (`state`) veriyoruz: `'ready'` (hazır) ile başlar,
ilk zıplama onu `'running'`'e (koşuyor) çevirir. Koşmuyorken `update` hiçbir şey yapmaz.

# --code--

```js
let state = 'ready' // 'ready', 'running' or 'over'

  state = 'running'

  if (state !== 'running') return

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
```

# --meaning--

- Any jump (key or tap) starts the run.
- `update` returns at once unless running, so nothing moves or spawns before the start.
- While ready, a centered message says what to do.

# --meaning-tr--

- `let state = 'ready'` → başta "hazır". Üç durum olacak: `'ready'`, `'running'`, `'over'` (bitti).
- `jump` içinde `state = 'running'` → ilk zıplama (tuş ya da dokunuş) koşuyu başlatır.
- `if (state !== 'running') return` → `update`'in başında: koşmuyorsa hiçbir şey yapma; kaktüs de gelmez.
- `ctx.textAlign = 'center'` ve `fillText(...)` → hazırken ortada "Press Space to start".

# --task--

1. Under `runner`, write `state`.
2. Make `state = 'running'` the first line of `jump`.
3. Make the state check the first line of `update`, with an empty line after it.
4. At the end of `draw`, write the ready message.

# --task-tr--

1. `let runner = ...` satırının altına `state` satırını yaz.
2. `jump` fonksiyonunun ilk satırı `state = 'running'` olsun.
3. `update`'in ilk satırı `if (state !== 'running') return` olsun, altında bir boş satır.
4. `draw`'ın sonuna, engel döngüsünün altına bir boş satır bırakıp hazır mesajını yaz.
5. **Çalıştır** ve Boşluk'a bas.

# --tests--

Nothing should move before the start.
tr: Başlangıçtan önce hiçbir şey hareket etmemeli.

```js
$.tick(100)
assert.strictEqual(state, 'ready')
assert.lengthOf(obstacles, 0)
assert.include($.texts(), 'Press Space to start')
```

The first jump should start the run.
tr: İlk zıplama koşuyu başlatmalı.

```js
$.press(' ')
assert.strictEqual(state, 'running')
$.tick(70)
assert.lengthOf(obstacles, 1)
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
let state = 'ready' // 'ready', 'running' or 'over'
let obstacles = []
let speed = 6
let nextIn = 60 // frames until the next obstacle

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
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

function update() {
  if (state !== 'running') return

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

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
