---
title: The gas pedal
title_tr: Gaz pedalı
skills: [game.input, game.loop]
---

# --goal--

The big moment: while up is held, the speed grows a little every frame, and the loop calls `update` every frame. The
road starts to move.

# --goal-tr--

Büyük an geldi: yukarı ok basılıyken hız her karede biraz **artsın**, döngü de her karede `update`'i çağırsın. Yol ilk
kez akacak!

# --code--

```js
function update() {
  if (keys.ArrowUp) speed += 1.2

  position += speed
  if (position >= trackLength) position -= trackLength
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `if (keys.ArrowUp) speed += 1.2`: while up is held, 1.2 more speed every frame.
- `loop` now calls `update()` before `draw()`: first move, then draw.

# --meaning-tr--

- `if (keys.ArrowUp) speed += 1.2` → yukarı ok basılıysa hızı 1.2 artır. Saniyede 60 kare olduğu için bir saniyede hız
  72 artar.
- `loop` içinde `update()` → her karede önce **hareket et**, sonra `draw()` ile **çiz**. Sıra önemli: yeni durumu çizmek
  istiyoruz.

# --task--

1. In `update`, at the top, write the `ArrowUp` line and an empty line.
2. In `loop`, above `draw()`, write `update()`.

# --task-tr--

1. `update` içinde en üste, `position += speed` satırının üstüne `if (keys.ArrowUp) ...` satırını yaz; altında bir boş
   satır kalsın.
2. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır**. Önce oyuna tıkla, sonra yukarı oku basılı tut: şeritler sana doğru akmalı.

# --predict--

You speed up, then let go of the key. What happens?
- [ ] The car slows down and stops
- [x] It keeps going at the same speed forever
  Nothing makes `speed` smaller yet. That is the next step.
- [ ] It stops at once

# --predict-tr--

Hızlandın, sonra tuşu bıraktın. Ne olur?
- [ ] Araba yavaşlayıp durur
- [x] Aynı hızla sonsuza kadar gider
  `speed`'i küçülten hiçbir şey yok. Onu bir sonraki adımda yapacağız.
- [ ] Hemen durur

# --hint--

Click the game first so it gets the keys, then hold the up arrow.

# --hint-tr--

Önce oyunun üstüne tıkla ki tuşlar ona gitsin, sonra yukarı oku basılı tut.

# --tests--

Holding up should speed up and move the road.
tr: Yukarı oku basılı tutmak hızlandırmalı ve yolu hareket ettirmeli.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(speed, 12, 1e-9)
assert.closeTo(position, 1.2 * 55, 1e-9)
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
