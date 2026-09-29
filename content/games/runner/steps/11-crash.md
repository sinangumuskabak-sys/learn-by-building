---
title: Crash
title_tr: Çarpışma
skills: [game.collision, game.state]
---

# --goal--

Touching a cactus ends the run. Two boxes overlap when each one starts before the other one ends, on both axes. The
boxes are shrunk by 6 pixels so a brush against a corner does not count: it feels fair.

# --goal-tr--

Kaktüse **değmek** koşuyu bitirsin. İki kutu, hem yatayda hem dikeyde her biri diğerinin bittiği yerden **önce**
başlıyorsa üst üste biner. Bu klasik bir çarpışma testidir.

Bir incelik: kutuları kenarlarından 6'şar piksel **küçültüyoruz**. Köşeden sıyırmak çarpma sayılmasın; oyuncu "bu
değmedi ki!" diye kızmasın. Buna **affedici çarpışma kutusu** denir.

# --code--

```js
const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much

function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}

  if (obstacles.some(hits)) {
    state = 'over'
  }

  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28)
  }
```

# --meaning--

- The four comparisons check left < other's right, right > other's left, top < other's bottom, bottom > other's top.
  All four true means overlap.
- `MARGIN` makes the runner's box 6 pixels smaller on each side before comparing.
- `some(hits)` is true if any obstacle hits; then the run is over (and `update` stops, because the state is no longer
  `'running'`).

# --meaning-tr--

- Dört karşılaştırma, `&&` ile hepsi doğru olmalı:
  - koşucunun **sol** kenarı engelin **sağından** önce,
  - koşucunun **sağ** kenarı engelin **solundan** sonra,
  - koşucunun **üstü** engelin **altından** önce,
  - koşucunun **altı** engelin **üstünden** sonra.
- `+ MARGIN`, `- MARGIN` → koşucunun kutusu her kenardan 6 piksel **içeride** sayılır.
- `obstacles.some(hits)` → **herhangi bir** engel çarpıyor mu? `some`, fonksiyonu her engel için dener.
- `state = 'over'` → koşu biter; `update` artık `'running'` olmadığı için durur, her şey donar.

# --task--

1. Under `CUT`, write `MARGIN`.
2. Under `spawn`, write `hits`.
3. At the end of `update`, write the crash check.
4. At the end of `draw`, write the Game Over block.

# --task-tr--

1. `CUT` satırının altına `MARGIN` satırını yaz.
2. `spawn` fonksiyonunun altına bir boş satır bırakıp `hits` fonksiyonunu yaz.
3. `update`'in sonuna, bir boş satırdan sonra çarpışma kontrolünü yaz.
4. `draw`'ın sonuna, hazır mesajının altına Game Over bloğunu yaz.
5. **Çalıştır** ve bir kaktüse çarp.

# --tests--

Running into a cactus should end the run.
tr: Bir kaktüse çarpmak koşuyu bitirmeli.

```js
$.press(' ')
$.release(' ')
$.run(2)
obstacles = [{ x: 70, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(state, 'over')
$.tick()
assert.include($.texts(), 'Game Over')
```

Only just touching a corner should not count.
tr: Köşeden hafifçe değmek sayılmamalı.

```js
assert.isFalse(hits({ x: 87, y: 140, w: 20, h: 40 }))
assert.isTrue(hits({ x: 80, y: 140, w: 20, h: 40 }))
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

requestAnimationFrame(loop)
```
