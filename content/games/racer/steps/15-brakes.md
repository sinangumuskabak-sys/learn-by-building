---
title: Brake, coast and a top speed
title_tr: Fren, boşta gitme ve azami hız
skills: [game.physics, game.input]
---

# --goal--

Driving feels right with three different rates: up accelerates, down brakes much harder, and letting go coasts, slowly
losing speed. And there is a top speed.

# --goal-tr--

Sürüşü gerçekçi yapan şey **üç farklı oran**:

- yukarı ok: her karede +1.2 (gaz),
- aşağı ok: her karede -3 (fren gazdan çok daha sert),
- hiçbirine basmazsan: her karede -0.4 (araba kendi kendine yavaşlar).

Bir de sınır koyacağız: hız ne 0'ın altına düşsün ne de en yüksek hızı (`MAX_SPEED`) aşsın.

# --code--

```js
const MAX_SPEED = 120 // world units per frame

  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  speed = Math.max(0, Math.min(MAX_SPEED, speed))
```

# --meaning--

- `if ... else if ... else`: only the first true branch runs; `else` runs when no key is held.
- `Math.min(MAX_SPEED, speed)` takes the smaller number, so the speed never goes over the top; `Math.max(0, ...)` the
  bigger, so it never goes below 0.

# --meaning-tr--

- `else if (keys.ArrowDown) speed -= 3` → yukarı basılı **değilse** ama aşağı basılıysa: fren.
- `else speed -= 0.4` → ikisi de basılı değilse: yavaşça yavaşla. `if / else if / else` zincirinde sadece **ilk doğru**
  koşulun işi yapılır.
- `Math.min(MAX_SPEED, speed)` → iki sayının **küçüğünü** verir: hız 120'yi geçemez.
- `Math.max(0, ...)` → iki sayının **büyüğünü** verir: hız eksiye düşemez (araba geri gitmez).
- İkisi iç içe: hızı 0 ile `MAX_SPEED` arasında **sıkıştırır**.

# --task--

1. Under the `DRAW` line write `MAX_SPEED`.
2. In `update`, under the `ArrowUp` line, write the three new lines.

# --task-tr--

1. `const DRAW = ...` satırının altına `MAX_SPEED` satırını yaz.
2. `update` içinde `if (keys.ArrowUp) ...` satırının hemen **altına** üç yeni satırı yaz.
3. **Çalıştır**: gazı bırakınca yavaşlamalı, aşağı okla sert fren yapmalısın.

# --tests--

Holding up should accelerate, braking should slow down hard and letting go gently.
tr: Yukarı basılı tutmak hızlandırmalı, fren sert, bırakmak yumuşak yavaşlatmalı.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(speed, 12, 1e-9)
$.release('ArrowUp')
$.tick(5)
assert.closeTo(speed, 10, 1e-9)
$.press('ArrowDown')
$.tick(2)
assert.closeTo(speed, 4, 1e-9)
$.tick(5)
assert.strictEqual(speed, 0)
```

Speed should stop at the top speed.
tr: Hız en yüksek hızda durmalı.

```js
$.press('ArrowUp')
$.tick(150)
assert.strictEqual(speed, MAX_SPEED)
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const SEG = 200 // length of one road segment, in world units
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
const DRAW = 100 // segments drawn
const MAX_SPEED = 120 // world units per frame

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is
let speed
const keys = {}

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
  speed = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  position += speed
  if (position >= trackLength) position -= trackLength
}

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}

function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) shown.push({ index, near, far })
  }

  // Paint from far to near, so nearer road covers what is behind it.
  for (let i = shown.length - 1; i >= 0; i--) {
    const { index, near, far } = shown[i]
    const light = Math.floor(index / 3) % 2 === 0
    ctx.fillStyle = light ? '#16a34a' : '#15803d'
    ctx.fillRect(0, far.y, W, near.y - far.y + 1)
    quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
    if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
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
