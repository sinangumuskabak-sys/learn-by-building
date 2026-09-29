---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

Barrels will turn and shells will fly, so the picture is redrawn about 60 times a second by a loop.

# --goal-tr--

Namlular dönecek, mermiler uçacak; resim bir **döngüyle** saniyede ~60 kez yeniden çizilsin.

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

- `loop` → çiz, sonra bir sonraki kareyi iste. En alttaki `draw()` yerine `requestAnimationFrame(loop)` başlatır.

# --task--

Replace `draw()` at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

En alttaki `draw()` satırını sil; `reset()`'in üstüne `loop` fonksiyonunu, altına `requestAnimationFrame(loop)` yaz. **Çalıştır**.

# --tests--

The picture should be redrawn every frame.
tr: Resim her karede yeniden çizilmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
tanks[0].x = 100
$.tick()
assert.strictEqual($.rects('#2563eb')[0].x, 90)
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x
let tanks // [you, the computer]: { x, y, hp, angle, power, color }

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
