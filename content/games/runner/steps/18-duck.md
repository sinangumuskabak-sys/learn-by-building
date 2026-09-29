---
title: Duck
title_tr: Eğil
skills: [game.input, game.collision]
---

# --goal--

Holding the down arrow on the ground makes the runner shorter, low enough to pass under a bird. While ducking it cannot
jump.

# --goal-tr--

Yerdeyken **aşağı oku** basılı tutmak koşucuyu **kısaltsın** (44'ten 26'ya): kuşun altından geçecek kadar. Eğilmişken
zıplanamasın.

Dikkat edilecek nokta: boy değişince kutunun **üstü** değil **ayakları** yerinde kalmalı; yoksa koşucu havada
kısalırdı.

# --code--

```js
const DUCK_H = 26

  // Duck only on the ground; keep the feet in place when the height changes.
  const h = keys.ArrowDown && onGround() ? DUCK_H : STAND_H
  runner.y += runner.h - h
  runner.h = h

  if (onGround() && runner.h === STAND_H) runner.vy = JUMP
```

# --meaning--

- `h` is the height the runner should have this frame: short while the down arrow is held on the ground.
- `runner.y += runner.h - h` moves the top down by as much as the box shrinks (or up as it grows), so the feet stay put.
- A ducking runner is not `STAND_H` tall, so `jump` does nothing.

# --meaning-tr--

- `keys.ArrowDown && onGround() ? DUCK_H : STAND_H` → aşağı ok basılı **ve** yerdeyse eğilme boyu, değilse ayakta boyu.
- `runner.y += runner.h - h` → boy ne kadar küçüldüyse **üst kenarı** o kadar aşağı indir (büyüyünce yukarı çıkar).
  Böylece `y + h`, yani ayaklar, aynı yerde kalır.
- `runner.h = h` → yeni boy.
- `jump` içinde `&& runner.h === STAND_H` → eğilmişken zıplama yok.
- Kuşun altı zeminden 30 piksel yukarıda; eğilen koşucu 26 boyunda. Çarpışma kutusu da 6 piksel içeride olduğu için
  rahatça geçer.

# --task--

1. Under `STAND_H`, write `DUCK_H`.
2. In `update`, under the ground block, write the comment and the three duck lines.
3. In `jump`, add `&& runner.h === STAND_H`.

# --task-tr--

1. `const STAND_H = 44` satırının altına `DUCK_H` satırını yaz.
2. `update` içinde zemin bloğunun hemen altına yorumu ve üç eğilme satırını yaz (boş satırdan önce).
3. `jump` içindeki koşula `&& runner.h === STAND_H` ekle.
4. **Çalıştır**: kuş gelince aşağı oku basılı tut. Oyun bitti!

# --tests--

Holding down on the ground should make the runner 26 tall, feet on the ground.
tr: Yerde aşağıyı basılı tutmak koşucuyu 26 boyuna indirmeli, ayaklar yerde kalmalı.

```js
state = 'running'
$.press('ArrowDown')
update()
assert.strictEqual(runner.h, 26)
assert.strictEqual(runner.y + runner.h, 180)
$.release('ArrowDown')
update()
assert.strictEqual(runner.h, 44)
assert.strictEqual(runner.y + runner.h, 180)
```

A ducking runner should pass under a bird and should not jump.
tr: Eğilen koşucu kuşun altından geçmeli ve zıplamamalı.

```js
state = 'running'
$.press('ArrowDown')
update()
assert.isFalse(hits({ x: 60, y: 130, w: 34, h: 20, bird: true }))
jump()
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
  }
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
