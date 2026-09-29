---
title: Birds
title_tr: Kuşlar
skills: [game.state]
---

# --goal--

After a while, some obstacles are birds flying low: 30% of the time once the distance passes 1500. They are drawn in
orange.

# --goal-tr--

Bir süre sonra bazı engeller **alçaktan uçan kuşlar** olsun: mesafe 1500'ü geçince, engellerin **%30'u**. Kuşlar
turuncu çizilir. Önce oyuncu zıplamaya alışsın, sonra yeni bir tehlike gelsin.

# --code--

```js
function spawn() {
  // Birds only show up once the player has got used to jumping.
  if (distance > 1500 && Math.random() < 0.3) {
    obstacles.push({ x: canvas.width, y: GROUND - 50, w: 34, h: 20, bird: true })
  } else {
    obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40, bird: false })
  }

    ctx.fillStyle = o.bird ? '#b45309' : '#15803d'
```

# --meaning--

- `Math.random() < 0.3` is true about 30% of the time.
- A bird is 34×20, flying with its bottom 30 pixels above the ground; every obstacle now says whether it is a bird.
- The color is chosen with `condition ? a : b`.

# --meaning-tr--

- `distance > 1500 && Math.random() < 0.3` → mesafe 1500'ü geçtiyse **ve** zar %30'a düştüyse kuş.
- Kuş: 34×20'lik bir kutu; `y: GROUND - 50` → üstü zeminden 50 piksel yukarıda, altı 30 piksel yukarıda.
- `bird: true` / `bird: false` → her engel kuş olup olmadığını söylüyor.
- `o.bird ? '#b45309' : '#15803d'` → kuşsa turuncu, değilse yeşil.

# --task--

1. In `spawn`, replace the `push` line with the comment and the `if ... else` block.
2. In `draw`, choose the color with `o.bird ? '#b45309' : '#15803d'`.

# --task-tr--

1. `spawn` içindeki `obstacles.push(...)` satırını yorumla ve `if ... else` bloğuyla değiştir (kaktüs `else`'e girer, ona
   `bird: false` eklenir).
2. `draw` içinde engelin rengini `o.bird ? '#b45309' : '#15803d'` yap.
3. **Çalıştır** ve uzun süre dayan.

# --predict--

A bird's bottom is 30 pixels above the ground. The runner is 44 tall. What happens if the runner just keeps running?
- [x] It hits the bird
  The runner reaches from the ground up to 44 pixels; the bird starts at 30.
- [ ] It passes under it
- [ ] It passes over it

# --predict-tr--

Kuşun altı zeminden 30 piksel yukarıda. Koşucunun boyu 44. Koşucu hiçbir şey yapmadan koşarsa ne olur?
- [x] Kuşa çarpar
  Koşucu zeminden 44 piksel yukarıya kadar uzanıyor; kuş 30'dan başlıyor.
- [ ] Altından geçer
- [ ] Üstünden geçer

# --tests--

After 1500, about 30% of the obstacles should be birds.
tr: 1500'den sonra engellerin yaklaşık %30'u kuş olmalı.

```js
distance = 2000
obstacles = []
for (let i = 0; i < 300; i++) spawn()
const birds = obstacles.filter((o) => o.bird)
assert.isAbove(birds.length, 50)
assert.isBelow(birds.length, 130)
assert.deepEqual(birds[0], { x: 600, y: 130, w: 34, h: 20, bird: true })
```

Early on there should be only cacti, and birds should be drawn orange.
tr: Başlarda yalnız kaktüs olmalı; kuşlar turuncu çizilmeli.

```js
distance = 100
obstacles = []
for (let i = 0; i < 50; i++) spawn()
assert.isTrue(obstacles.every((o) => !o.bird))
obstacles = [{ x: 300, y: 130, w: 34, h: 20, bird: true }]
$.tick()
assert.lengthOf($.rects('#b45309'), 1)
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
