---
title: The barrel
title_tr: Namlu
skills: [game.canvas, game.physics]
---

# --goal--

Each tank gets a barrel, a thick 14-pixel line from the top of the tank in the direction of its angle.

# --goal-tr--

Her tankın bir **namlusu** olsun: tankın üstünden, açısı yönünde 14 piksel uzunluğunda kalın bir çizgi.

# --code--

```js
ctx.strokeStyle = t.color
ctx.lineWidth = 3
ctx.beginPath()
ctx.moveTo(t.x, t.y - 8)
ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
ctx.stroke()
```

# --meaning--

- `Math.cos(angle)` and `Math.sin(angle)` give a step one pixel long in that direction; times 14, the barrel's end.
- A path is started with `beginPath`, drawn with `moveTo` and `lineTo`, and shown with `stroke`.

# --meaning-tr--

- `Math.cos(t.angle)`, `Math.sin(t.angle)` → o yönde 1 piksellik adımın yana ve aşağı payları; × 14 → namlunun ucu.
- `beginPath` → yeni bir çizim yolu; `moveTo` → kalemi tankın üstüne koy; `lineTo` → namlunun ucuna çiz;
  `stroke` → çizgiyi `strokeStyle` renginde, `lineWidth` kalınlığında göster.

# --task--

In the tank loop, after the body, draw the barrel.

# --task-tr--

Tank döngüsünde gövdeyi çizen satırın altına namlu satırlarını yaz. **Çalıştır**.

# --tests--

Each barrel should point along its tank's angle.
tr: Her namlu tankının açısı yönünde olmalı.

```js
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args)
assert.lengthOf(ends, 2)
const t = tanks[0]
assert.closeTo(ends[0][0], t.x + Math.cos(-Math.PI / 4) * 14, 1e-9)
assert.closeTo(ends[0][1], t.y - 8 - Math.sin(Math.PI / 4) * 14, 1e-9)
assert.isBelow(ends[1][0], tanks[1].x, 'the computer aims left')
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

reset()
draw()
```
