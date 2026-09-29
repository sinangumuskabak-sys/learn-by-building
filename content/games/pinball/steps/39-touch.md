---
title: Two thumbs
title_tr: İki başparmak
skills: [game.input]
---

# --goal--

On a phone there are no keys. Holding a thumb on the left half of the table works the left flipper, on the right half
the right one; lifting the finger lets both down.

# --goal-tr--

Telefonda klavye yok. Telefonu iki elle tutunca **sol başparmak** masanın sol yarısına, **sağ başparmak** sağ
yarısına dokunur. Parmak ekrandayken palet yukarıda, kalkınca aşağıda.

Güzel olan şu: dokunmak da yalnız `pressed`'i değiştirecek. Paletler `pressed`'e bakıyor; bilginin tuştan mı
parmaktan mı geldiğini umursamıyor.

# --code--

```js
// Touch: the right-hand launch lane holds the launcher, the left and right halves of the table are the flippers.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  if (x < canvas.width / 2) pressed.left = true
  else pressed.right = true
})

document.addEventListener('pointerup', () => {
  pressed = { left: false, right: false, launch: false }
})
```

# --meaning--

- `pointerdown` comes when a finger touches (or a mouse button goes down) on the canvas; `pointerup` when it lifts.
- On a phone the canvas may be shown smaller than 400 pixels. `getBoundingClientRect()` gives where and how big it
  is on screen, and the `x` line turns a screen position into a canvas position.
- `pointerup` listens on the whole page, so the flippers drop even if the finger lifts outside the table.

# --meaning-tr--

- `'pointerdown'` → parmak ekrana değince ya da fare tuşuna basılınca gelen olay. `canvas`'a bağlıyoruz: masaya
  dokunulunca.
- `canvas.getBoundingClientRect()` → canvas'ın **ekrandaki** yeri ve boyu. Telefonda canvas küçültülmüş olabilir:
  ekranda 200 piksel eninde görünse de içi hâlâ 400 piksel.
- `const x = ((event.clientX - rect.left) * canvas.width) / rect.width` → dokunuşun ekrandaki yerini canvas
  pikseline çevirir:
  - `event.clientX - rect.left` → canvas'ın sol kenarından kaç piksel içeride;
  - `* canvas.width / rect.width` → gerçek en ÷ ekrandaki en oranıyla büyüt.
- `if (x < canvas.width / 2) pressed.left = true` / `else pressed.right = true` → sol yarı sol palet, sağ yarı sağ
  palet.
- `'pointerup'` → parmak kalkınca. **Bütün sayfayı** (`document`) dinliyoruz: parmak masanın dışında kalksa da paletler
  insin. Hepsi `false`.
- Yorum satırı fırlatma kanalından da bahsediyor; onu bir sonraki adımda ekleyeceğiz.

# --task--

Write the comment and both listeners above `function draw() {`.

# --task-tr--

1. Yorum satırını ve iki dinleyiciyi `function draw() {` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. **Çalıştır**: fareyle masanın sol yarısına basılı tut: sol palet kalkmalı. Sağ yarı sağ palet.

# --tests--

Each half of the table should work its flipper while a finger is on it.
tr: Masanın her yarısı, üstünde parmak varken kendi paletini çalıştırmalı.

```js
$.pointerDown(100, 400)
assert.isTrue(pressed.left, 'the left half is the left flipper')
$.tick(4)
assert.closeTo(flippers[0].angle, -0.45, 1e-9, 'and it flips up')
$.pointerUp(100, 400)
assert.isFalse(pressed.left)
$.pointerDown(300, 400)
assert.isTrue(pressed.right)
assert.isFalse(pressed.left)
$.pointerUp(300, 400)
assert.isFalse(pressed.right)
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]
const FLIPPER_LENGTH = 62
const FLIP_SPEED = 0.25 // radians per frame
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let pressed // { left, right, launch }
let charge // 0 to 1 while the launcher is held
let state // 'ready' (in the lane), 'playing' or 'over'
let score
let balls
let flash // frames each bumper stays lit
let best = Number(localStorage.getItem('pinball-best')) || 0

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  charge = 0
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false, launch: false }
  score = 0
  balls = 3
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

// Push the ball out of a segment and bounce it. `surface` is how fast the segment itself moves at that point:
// the bounce works on the speed of the ball relative to the surface, which is how a flipper throws the ball.
function hitSegment(x1, y1, x2, y2, bounce, surface) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  const sx = surface ? surface(px, py).x : 0
  const sy = surface ? surface(px, py).y : 0
  const vn = (ball.vx - sx) * nx + (ball.vy - sy) * ny
  if (vn < 0) {
    ball.vx -= (1 + bounce) * vn * nx
    ball.vy -= (1 + bounce) * vn * ny
  }
  return true
}

function hitBumper(b, i) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
  // A bumper kicks the ball away, faster than it came.
  const vn = ball.vx * nx + ball.vy * ny
  ball.vx += (-vn + 6) * nx
  ball.vy += (-vn + 6) * ny
  if (flash[i] === 0) score += 100
  flash[i] = 10
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
  for (const f of flippers) {
    f.angle += f.speed / SUB
    const t = tip(f)
    // A point on a turning flipper moves at speed × distance from the pivot, at right angles to it.
    hitSegment(f.x, f.y, t.x, t.y, 0.3, (px, py) => ({ x: -f.speed * (py - f.y), y: f.speed * (px - f.x) }))
  }
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  for (const f of flippers) {
    // Up while the key is held, back down when it is let go, and stop at either end.
    const target = pressed[f.key] ? f.up : f.rest
    const dir = Math.sign(target - f.angle)
    f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
  }
  if (state === 'ready') {
    for (const f of flippers) f.angle += f.speed
    if (pressed.launch) charge = Math.min(1, charge + 0.02)
    return
  }
  if (state !== 'playing') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) {
    balls -= 1
    if (balls > 0) newBall()
    else {
      state = 'over'
      if (score > best) {
        best = score
        localStorage.setItem('pinball-best', best)
      }
    }
  }
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -(13 + 6 * charge)
  charge = 0
  state = 'playing'
}

function key(event, down) {
  const k = event.key
  if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
  else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
  else if (k === ' ' || k === 'ArrowDown') {
    if (down && state === 'over') reset()
    else if (!down && pressed.launch) launch()
    pressed.launch = down
  } else return
  event.preventDefault()
}

document.addEventListener('keydown', (event) => key(event, true))
document.addEventListener('keyup', (event) => key(event, false))

// Touch: the right-hand launch lane holds the launcher, the left and right halves of the table are the flippers.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  if (x < canvas.width / 2) pressed.left = true
  else pressed.right = true
})

document.addEventListener('pointerup', () => {
  pressed = { left: false, right: false, launch: false }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  BUMPERS.forEach((b, i) => {
    ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
  // The launcher's spring shortens as it is pulled back.
  ctx.fillStyle = '#78716c'
  ctx.fillRect(LANE_X - 8, 580 + charge * 12, 16, 20)
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y + (state === 'ready' ? charge * 12 : 0), R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
  ctx.textAlign = 'right'
  ctx.fillText('Balls ' + balls, 330, 50)
  ctx.textAlign = 'center'
  ctx.font = '13px sans-serif'
  ctx.fillText('Best ' + best, 200, 50)
  if (state === 'ready') ctx.fillText('Hold Space, let go to launch', 200, 580)
  if (state === 'over') {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.85)'
    ctx.fillRect(60, 330, 280, 80)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Game over', 200, 364)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space to play again', 200, 392)
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
