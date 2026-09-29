---
title: Move the ship
title_tr: Gemiyi oynat
skills: [game.input]
---

# --goal--

While an arrow key is held, the ship slides 4 pixels a frame that way. A `keys` object remembers which keys are down.

# --goal-tr--

Bir ok tuşu **basılı** tutuldukça gemi o yöne her karede 4 piksel kaysın. Hangi tuşların basılı olduğunu bir `keys`
nesnesi hatırlıyor: basılınca `true`, bırakılınca `false`.

# --code--

```js
const SHIP_SPEED = 4

const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
}

  update()
```

# --meaning--

- `keys[event.key]` stores a field named after the key, like `keys.ArrowLeft`.
- `update` moves the ship while a key is held; the loop calls it before drawing.

# --meaning-tr--

- `keys[event.key] = true` → basılan tuşun **adıyla** bir alan: `keys.ArrowLeft = true`. Bırakınca `false`.
- `update()` → her karede: sol ok basılıysa sola, sağ ok basılıysa sağa 4 piksel.
- Döngüde `update()` çizimden önce.

# --task--

1. Under `SHIP_H`, write `SHIP_SPEED`.
2. Under `ship`, write `keys`, the two key listeners and `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `SHIP_H` satırının altına `SHIP_SPEED` yaz.
2. `ship` satırının altına `keys` nesnesini, iki tuş dinleyicisini ve `update` fonksiyonunu yaz.
3. `loop` içinde `draw()`'ın üstüne `update()` yaz.
4. **Çalıştır**, oyuna tıkla ve oklarla gemiyi oynat.

# --tests--

Holding an arrow should move the ship 4 pixels each frame.
tr: Bir oku basılı tutmak gemiyi her karede 4 piksel oynatmalı.

```js
$.press('ArrowLeft')
$.tick(5)
assert.strictEqual(ship.x, 202)
$.release('ArrowLeft')
$.tick(5)
assert.strictEqual(ship.x, 202)
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
