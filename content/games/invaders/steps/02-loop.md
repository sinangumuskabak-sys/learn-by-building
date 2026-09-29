---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

Everything will move, so the picture is redrawn about 60 times a second by a loop.

# --goal-tr--

Her şey hareket edecek; resim bir **döngüyle** saniyede ~60 kez yeniden çizilsin.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` runs `loop` again before the next screen refresh.

# --meaning-tr--

- `loop` → çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste. En alttaki satır başlatır.

# --task--

Replace `draw()` at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

En alttaki `draw()` satırını sil; yerine `loop` fonksiyonunu ve `requestAnimationFrame(loop)` satırını yaz. **Çalıştır**.

# --tests--

The picture should be redrawn every frame.
tr: Resim her karede yeniden çizilmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
ship.x = 10
$.tick()
assert.strictEqual($.rects('#22d3ee')[0].x, 10)
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

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
