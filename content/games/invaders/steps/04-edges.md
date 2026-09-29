---
title: Stay on screen
title_tr: Ekranda kal
skills: [game.state]
---

# --goal--

The ship must not leave the screen. After moving, its `x` is kept between 0 and the canvas width minus the ship's width.

# --goal-tr--

Gemi ekrandan **çıkmasın**. Hareketten sonra `x`'i 0 ile (tuval genişliği − gemi genişliği) arasında tutuyoruz.

# --code--

```js
ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))
```

# --meaning--

- `Math.min(canvas.width - SHIP_W, x)` stops it at the right edge, `Math.max(0, ...)` at the left edge.

# --meaning-tr--

- `Math.min(canvas.width - SHIP_W, ship.x)` → sağ sınırı geçmesin (gemi en sağda 444'te durur, sağ kenarı 480'de).
- `Math.max(0, ...)` → sol sınırın altına inmesin. İkisi birlikte sayıyı bir aralıkta tutar (**kıskaçlama**).

# --task--

At the end of `update`, write the line.

# --task-tr--

`update` fonksiyonunun sonuna satırı yaz. **Çalıştır** ve kenara git.

# --tests--

The ship should stop at both edges.
tr: Gemi iki kenarda da durmalı.

```js
$.press('ArrowLeft')
$.run(2)
assert.strictEqual(ship.x, 0)
$.release('ArrowLeft')
$.press('ArrowRight')
$.run(3)
assert.strictEqual(ship.x, 444)
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
