---
title: Touch controls
title_tr: Dokunmatik kontrol
skills: [game.input]
---

# --goal--

On a phone there are no arrow keys. Touching the left, middle or right third of the screen holds the matching key in
`keys`; lifting the finger releases it.

# --goal-tr--

Telefonda ok tuşu yok. Ekranı üçe bölelim: **sol üçte bire** dokunmak sola eğer, **sağ üçte bire** dokunmak sağa
eğer, **ortaya** dokunmak motoru yakar. Parmak kalkınca durur.

İşin güzel yanı: `keys` not defterine aynı adları yazıyoruz. `update` notun klavyeden mi dokunuştan mı geldiğini bilmez
ve bilmesi de gerekmez.

# --code--

```js
// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)
```

# --meaning--

- `third` is 0 to 3 across the canvas: below 1 is the left third, below 2 the middle, the rest the right.
- Two `? :` in a row pick one of three key names; that key is set to `true` in `keys`.
- `stopTouch` releases all three. It runs when the finger lifts (`pointerup`) or the touch is cancelled.

# --meaning-tr--

- `(event.clientX - rect.left) / rect.width` → dokunuşun canvas'ın solundan ne kadar içeride olduğu, 0 ile 1 arası
  (ekrandaki boyuna oranla; canvas büyütülse de doğru).
- `* 3` → 0 ile 3 arası: 1'den küçükse sol, 2'den küçükse orta, değilse sağ üçte bir.
- `third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'` → iki `? :` art arda: üç addan birini seçer. O
  ad `keys` içinde `true` olur, sanki o tuş basılıymış gibi.
- `function stopTouch()` → üç "tuşu" da bırakır.
- `pointerup` (parmak kalktı) ve `pointercancel` (dokunuş iptal oldu, örneğin bir bildirim geldi) → ikisinde de
  `stopTouch` çalışır.

# --task--

Write the touch code above `function burning() {`, followed by an empty line.

# --task-tr--

Dokunmatik kodunu yorum satırıyla birlikte `function burning() {` satırının **üstüne** yaz; altında bir boş satır
kalsın. **Çalıştır**: farenin tuşunu canvas'ın sol, orta ya da sağ kısmında basılı tutarak dene.

# --hint--

`stopTouch` is passed to `addEventListener` without `()`: it runs when the event happens.

# --hint-tr--

`stopTouch`'ı `addEventListener`'a parantezsiz ver: olay olunca çalışsın.

# --tests--

Touching the thirds of the screen should steer and burn.
tr: Ekranın üçte birlerine dokunmak yönlendirmeli ve yakmalı.

```js
$.pointerDown(20, 100)
$.tick(4)
assert.closeTo(lander.angle, -0.2, 1e-9)
$.pointerUp(20, 100)
$.pointerDown(240, 100)
$.tick(2)
assert.strictEqual(lander.fuel, 398)
$.pointerUp(240, 100)
$.tick(2)
assert.strictEqual(lander.fuel, 398)
$.pointerDown(460, 100)
$.tick(2)
assert.closeTo(lander.angle, -0.1, 1e-9)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const THRUST = 0.1 // speed gained per frame of engine, along the direction the lander points
const SPIN = 0.05 // radians per frame
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
let state // 'flying', 'landed' or 'crashed'
const keys = {}

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function reset() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  gravity = 0.025
  state = 'flying'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function burning() {
  return state === 'flying' && keys.ArrowUp && lander.fuel > 0
}

function touchdown() {
  state = 'crashed'
}

function update() {
  if (state !== 'flying') return

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
  if (burning()) {
    // The engine pushes along the direction the lander points: angle 0 is straight up.
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
    lander.fuel -= 1
  }
  lander.vy += gravity
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()
}

function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  if (burning()) {
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(-5, 8)
    ctx.lineTo(5, 8)
    ctx.lineTo(0, 16 + Math.random() * 8)
    ctx.fill()
  }
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
  ctx.restore()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)

  drawLander()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
