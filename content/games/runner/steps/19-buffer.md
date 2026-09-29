---
title: "Build it yourself: jump buffering"
title_tr: "Kendin yap: zıplama tamponu"
skills: [game.input, game.physics]
---

# --goal--

Pressing jump a moment before landing does nothing now, and it feels like the game ignored you. Remember a jump pressed
in the air for 6 frames, and do it the moment the runner lands.

# --goal-tr--

Şu an yere inmeden **hemen önce** zıplamaya basarsan hiçbir şey olmuyor; oyuncu "bastım ama zıplamadı!" diye hisseder.
Havadayken basılan zıplamayı **6 kare** boyunca hatırla ve koşucu yere değdiği an uygula. Profesyonel oyunlar bunu
yapar; adı **zıplama tamponu** (jump buffering).

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir sayaç, `jump`, yere inişin olduğu yer (`onGround` bloğu).

# --task--

- A jump pressed in the air up to 6 frames before landing happens as soon as the runner lands.
- A jump pressed much earlier in the air is forgotten.

# --task-tr--

- Havadayken, yere inmeden **en fazla 6 kare önce** basılan zıplama, koşucu yere değer değmez gerçekleşsin.
- Çok daha önce (ör. zıplamanın tepesinde) basılan zıplama unutulsun.

Bir fikir: `jump` yerde değilken bir sayacı 6 yapsın; `update` her karede sayacı azaltsın; yere inişte sayaç hâlâ 0'dan
büyükse zıpla.

# --hint--

In `jump`, when the runner cannot jump, set a counter to 6. In `update`, subtract 1 each frame; in the landing block,
if the counter is still above 0, set `vy` to `JUMP` and clear the counter.

# --hint-tr--

`jump` içinde koşucu zıplayamıyorsa bir sayacı 6 yap. `update`'te her karede 1 azalt; iniş bloğunda sayaç hâlâ 0'dan
büyükse `vy`'yi `JUMP` yap ve sayacı sıfırla.

# --tests--

A jump pressed just before landing should happen on landing.
tr: İnmeden hemen önce basılan zıplama inişte gerçekleşmeli.

```js
state = 'running'
runner.y = GROUND - runner.h - 6
runner.vy = 3
jump()
$.tick(3)
assert.isBelow(runner.vy, -8, 'jumped again right after landing')
```

A jump pressed long before landing should be forgotten.
tr: İnişten çok önce basılan zıplama unutulmalı.

```js
state = 'running'
runner.y = GROUND - runner.h - 90
runner.vy = 0
jump()
$.tick(40)
assert.strictEqual(runner.vy, 0)
assert.strictEqual(runner.y, 136)
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
const DUCK_H = 26

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let distance
let nextIn // frames until the next obstacle
let best = Number(localStorage.getItem('runner-best')) || 0
const keys = {}
let buffered = 0 // frames a jump pressed in the air is still remembered

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
  if (onGround() && runner.h === STAND_H) runner.vy = JUMP
  else buffered = 6
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function spawn() {
  // Birds only show up once the player has got used to jumping.
  if (distance > 1500 && Math.random() < 0.3) {
    obstacles.push({ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true })
  } else {
    obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40, bird: false })
  }
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
    if (buffered > 0 && runner.h === STAND_H) {
      runner.vy = JUMP
      buffered = 0
    }
  }
  if (buffered > 0) buffered -= 1
  // Duck only on the ground; keep the feet in place when the height changes.
  const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
  runner.y += runner.h - h
  runner.h = h

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
    ctx.fillStyle = o.bird ? '#b45309' : '#15803d'
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
