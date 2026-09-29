---
title: Steering
title_tr: Direksiyon
skills: [game.input]
---

# --goal--

Now the left and right arrows change `playerX` a little every frame. You may drive onto the grass, but not away from
the road: `playerX` stays between -2.5 and 2.5.

# --goal-tr--

Şimdi sağ ve sol oklar her karede `playerX`'i biraz değiştirsin. Çimene biraz girebilirsin ama yoldan kilometrelerce
uzaklaşamazsın: `playerX` -2.5 ile 2.5 arasında kalacak.

# --code--

```js
const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
playerX += steer * 0.04
playerX = Math.max(-2.5, Math.min(2.5, playerX))
```

# --meaning--

- `steer` is 1 when right is held, -1 when left is held, and 0 when both or neither are.
- Each frame `playerX` moves by `0.04` in that direction.
- The last line keeps `playerX` between -2.5 and 2.5, the same way we kept the speed in range.

# --meaning-tr--

- `(keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)` → sağ basılıysa `1 - 0 = 1`, sol basılıysa `0 - 1 = -1`,
  ikisi de ya da hiçbiri basılı değilse `0`. Bu sayıya `steer` (yön) diyoruz.
- `playerX += steer * 0.04` → her karede o yöne 0.04 kay. Yolun ortasından kenarına (0 → 1) 25 karede, yaklaşık
  yarım saniyede varırsın.
- `Math.max(-2.5, Math.min(2.5, playerX))` → hızda yaptığımız gibi **sıkıştırma**: -2.5'ten küçük, 2.5'ten büyük olamaz.

# --task--

In `update`, above `position += speed`, write the three lines followed by an empty line.

# --task-tr--

`update` içinde `position += speed` satırının **üstüne** üç satırı yaz; altlarında bir boş satır kalsın. **Çalıştır**,
oyuna tıkla ve sağ-sol oklara bas: yol yana kaymalı.

# --predict--

Stand still (speed 0) and hold the right arrow. What happens?
- [x] The car slides sideways anyway
  Nothing here looks at the speed. Real cars do not turn on the spot; we fix that next.
- [ ] Nothing, a standing car cannot turn
- [ ] The car drives forwards

# --predict-tr--

Dur (hız 0) ve sağ oku basılı tut. Ne olur?
- [x] Araba yine de yana kayar
  Bu satırlar hıza hiç bakmıyor. Gerçek araba yerinde dönmez; bunu bir sonraki adımda düzelteceğiz.
- [ ] Hiçbir şey, duran araba dönemez
- [ ] Araba ileri gider

# --tests--

The arrows should move the car across the road.
tr: Oklar arabayı yolda yana kaydırmalı.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(playerX, 0.4, 1e-9)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(5)
assert.closeTo(playerX, 0.2, 1e-9)
```

The car should not get further than 2.5 from the middle.
tr: Araba ortadan 2.5'ten fazla uzaklaşmamalı.

```js
playerX = 2.49
$.press('ArrowRight')
$.tick(5)
assert.strictEqual(playerX, 2.5)
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
let playerX // -1 is the left edge of the road, 1 the right edge
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
  playerX = 0
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

  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04
  playerX = Math.max(-2.5, Math.min(2.5, playerX))

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
    const near = project(-playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(-playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
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
