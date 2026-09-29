---
title: Keep drawing
title_tr: Çizmeye devam
skills: [game.loop]
---

# --goal--

The frog and the traffic will move, so the picture is redrawn every frame.

# --goal-tr--

Kurbağa ve trafik hareket edecek; resim her karede yeniden çizilsin. Bildik **döngü**.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` runs `loop` again before the next screen refresh, about 60 times a second.

# --meaning-tr--

- `loop` → çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste (saniyede ~60).
- En alttaki satır tek seferlik `draw()`'ın yerini alır.

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
frog.x = 0
$.tick()
assert.strictEqual($.rects('#22c55e')[0].x, 6)
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

let frog = { x: 5, y: START_ROW }

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
