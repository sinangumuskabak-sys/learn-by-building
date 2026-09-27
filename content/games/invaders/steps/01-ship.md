---
title: The cannon
title_tr: Top
skills: [game.input, game.loop]
---

# --explanation--

The player controls a cannon at the bottom of the screen that slides left and right. You have built this before
(Pong's paddles, Breakout's keyboard controls): keep a record of **held** keys, and let the loop move the ship a few
pixels every frame while a key is down.

```js
if (keys.ArrowLeft) ship.x -= SHIP_SPEED
if (keys.ArrowRight) ship.x += SHIP_SPEED
ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))   // stay on screen
```

The ship is two rectangles: a wide base and a small barrel on top, centered. Simple shapes, but together they read as
"cannon" at a glance. Games have been drawn this way since the 1970s.

# --explanation-tr--

Oyuncu, ekranın altında sağa sola kayan bir topu yönetir. Bunu daha önce yaptın (Pong'un raketleri, Tuğla Kırma'nın
klavye kontrolleri): **basılı** tuşların kaydını tut ve bir tuş basılıyken döngü gemiyi her karede birkaç piksel
taşısın.

```js
if (keys.ArrowLeft) ship.x -= SHIP_SPEED
if (keys.ArrowRight) ship.x += SHIP_SPEED
ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))   // ekranda kal
```

Gemi iki dikdörtgenden oluşur: geniş bir taban ve üstünde ortalanmış küçük bir namlu. Basit şekiller, ama birlikte bir
bakışta "top" olarak okunurlar. Oyunlar 1970'lerden beri böyle çizilir.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `SHIP_Y = 480`, `SHIP_W = 36`, `SHIP_H = 16`,
   `SHIP_SPEED = 4` and `let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }`.
2. Keep held keys in `const keys = {}`. In `update()`, move the ship `SHIP_SPEED` pixels per frame with
   `ArrowLeft`/`ArrowRight` and clamp it to the screen.
3. `draw()`: fill the canvas with `'#020617'`, draw the ship in `'#22d3ee'` plus a 6×6 barrel centered on top of it
   (`ship.x + SHIP_W / 2 - 3`, `ship.y - 6`). Run `update()` and `draw()` in a `requestAnimationFrame` loop.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut. `SHIP_Y = 480`, `SHIP_W = 36`, `SHIP_H = 16`, `SHIP_SPEED = 4` ve
   `let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }` ekle.
2. Basılı tuşları `const keys = {}`'de tut. `update()` içinde gemiyi `ArrowLeft`/`ArrowRight` ile karede `SHIP_SPEED`
   piksel taşı ve ekrana sınırla.
3. `draw()`: canvas'ı `'#020617'` ile doldur, gemiyi `'#22d3ee'` ile, üstünde ortalanmış 6×6 bir namluyla birlikte çiz
   (`ship.x + SHIP_W / 2 - 3`, `ship.y - 6`). `update()` ve `draw()`'u bir `requestAnimationFrame` döngüsünde çalıştır.

# --tests--

The ship should start centered at the bottom.
tr: Gemi altta ortada başlamalı.

```js
assert.deepEqual(ship, { x: 222, y: 480, w: 36, h: 16 })
$.tick()
assert.sameDeepMembers($.rects('#22d3ee'), [
  { x: 222, y: 480, w: 36, h: 16, color: '#22d3ee' },
  { x: 237, y: 474, w: 6, h: 6, color: '#22d3ee' },
])
```

Holding an arrow should slide the ship, and it should stop at the edge.
tr: Bir oku basılı tutmak gemiyi kaydırmalı ve gemi kenarda durmalı.

```js
$.press('ArrowLeft')
$.tick(10)
assert.strictEqual(ship.x, 182)
$.tick(100)
assert.strictEqual(ship.x, 0)
$.release('ArrowLeft')
$.press('ArrowRight')
$.tick(200)
assert.strictEqual(ship.x, 480 - 36)
```

# --seed--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
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
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))
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
