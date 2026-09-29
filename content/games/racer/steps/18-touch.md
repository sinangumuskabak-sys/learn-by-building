---
title: A pedal for phones
title_tr: Telefon için pedal
skills: [game.input]
---

# --goal--

A phone has no arrow keys. A finger held anywhere on the game will be the gas pedal: touching presses `ArrowUp` in
`keys`, lifting the finger lets go.

# --goal-tr--

Telefonda ok tuşu yok. Oyunun herhangi bir yerine basılı tutulan **parmak** gaz pedalı olsun: dokununca `keys` içinde
`ArrowUp` basılmış gibi olur, parmak kalkınca bırakılır. `update` farkı anlamaz; o yine `keys.ArrowUp`'a bakıyor.

# --code--

```js
// Touch: hold anywhere to accelerate.
canvas.addEventListener('pointerdown', () => {
  keys.ArrowUp = true
})
function stopTouch() {
  keys.ArrowUp = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)
```

# --meaning--

- `pointerdown` happens when a finger (or the mouse) touches the canvas, `pointerup` when it lifts, and `pointercancel`
  when the touch is interrupted.
- The same function, `stopTouch`, handles both endings.

# --meaning-tr--

- `'pointerdown'` → parmak (ya da fare) canvas'a **değdiğinde** olur. O an `keys.ArrowUp = true`.
- `'pointerup'` → parmak **kalkınca**; `'pointercancel'` → dokunuş yarıda kesilince (ör. bir bildirim gelince).
- `function stopTouch()` → ikisinde de yapılacak iş aynı olduğu için bir kez yazıp iki yere **adıyla** veriyoruz
  (parantezsiz: `stopTouch`, "çağır" değil "bu fonksiyonu ver" demek).

# --task--

Under the `keyup` listener (above the empty line before `update`), write the touch code.

# --task-tr--

`keyup` dinleyicisinin kapanış `})` satırının **altına** (update'ten önceki boş satırın üstüne) dokunma kodunu yaz.
**Çalıştır**: fareyle oyuna basılı tutunca da araba hızlanmalı.

# --tests--

A finger on the game should work as the gas pedal.
tr: Oyundaki bir parmak gaz pedalı gibi çalışmalı.

```js
$.pointerDown(240, 160)
$.tick(5)
assert.closeTo(speed, 6, 1e-9)
$.pointerUp(240, 160)
$.tick(1)
assert.closeTo(speed, 5.6, 1e-9)
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
// Touch: hold anywhere to accelerate.
canvas.addEventListener('pointerdown', () => {
  keys.ArrowUp = true
})
function stopTouch() {
  keys.ArrowUp = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

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

  // Your car.
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(W / 2 - 34, H - 44, 68, 30)
  ctx.fillStyle = '#111827'
  ctx.fillRect(W / 2 - 38, H - 22, 14, 12)
  ctx.fillRect(W / 2 + 24, H - 22, 14, 12)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(Math.round((speed / MAX_SPEED) * 300) + ' km/h', 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
