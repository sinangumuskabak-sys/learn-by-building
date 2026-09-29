---
title: A moving wall
title_tr: Hareket eden duvar
skills: [game.physics, prog.functions]
---

# --goal--

Try it: a ball resting on a flipper barely moves when the flipper flips, because the bounce only looks at the ball's
own speed. The fix is to bounce on the ball's speed **relative to the surface**. `hitSegment` gets an optional sixth
parameter, a function that tells how fast the surface moves at a point.

# --goal-tr--

Dene: paletin üstünde duran topa palet kalkınca top **neredeyse kıpırdamıyor**. Neden? Sekme hesabı yalnız
**topun** hızına bakıyor; top ise duruyordu. Palet onu yolundan itiyor ama fırlatmıyor.

Çözüm **göreli hız**: sekmeyi "topun hızı **eksi** duvarın o noktadaki hızı"na göre yapmak. Yürüyen bir otobüste
topa vurmak gibi düşün: önemli olan topun **otobüse göre** hızıdır. Duvar topa doğru hızla geliyorsa, top dursa bile
duvara göre hızla çarpıyor demektir ve hızla seker.

`hitSegment`'e **isteğe bağlı** altıncı bir parametre ekliyoruz: `surface` (yüzey). Bu bir **fonksiyon**: ona bir
nokta verirsin, sana yüzeyin o noktadaki hızını söyler. Duvarlar onu vermez (kıpırdamazlar); paletler bir sonraki
adımda verecek.

# --code--

```js
// Push the ball out of a segment and bounce it. `surface` is how fast the segment itself moves at that point:
// the bounce works on the speed of the ball relative to the surface, which is how a flipper throws the ball.
function hitSegment(x1, y1, x2, y2, bounce, surface) {

  const sx = surface ? surface(px, py).x : 0
  const sy = surface ? surface(px, py).y : 0
  const vn = (ball.vx - sx) * nx + (ball.vy - sy) * ny
```

# --meaning--

- A parameter that is not passed is `undefined`, which counts as false in a condition. So `surface ? ... : 0` means:
  if there is a surface function, ask it for the speed at the closest point `(px, py)`; otherwise the surface is still.
- `vn` now uses `ball.v − surface v`. A surface moving at 10 into a still ball gives `vn = −10`, so the ball leaves at
  the surface's speed.
- The walls pass no sixth value, so for them nothing changes.

# --meaning-tr--

- `surface` → altıncı parametre, bir **fonksiyon**. Fonksiyonlar da sayı ya da yazı gibi bir yerden bir yere
  verilebilir.
- Çağıran bir değer vermezse parametre `undefined` (tanımsız) olur ve bir koşulda **yanlış** sayılır.
- `const sx = surface ? surface(px, py).x : 0` → yüzey fonksiyonu **varsa** onu en yakın nokta `(px, py)` ile çağır
  ve dönen hızın `x`'ini al; **yoksa** 0 (yüzey duruyor).
- `const vn = (ball.vx - sx) * nx + (ball.vy - sy) * ny` → artık topun kendi hızı değil, yüzeye **göre** hızı.
  - Yukarı 10 hızla gelen bir yüzey duran bir topa çarparsa: göreli hız aşağı 10, `vn` eksi, top seker ve yüzeyin
    hızını alıp yukarı gider.
- Duvarlar altıncı değeri vermediği için onlarda hiçbir şey değişmez; `vx`/`vy` satırları da aynı kalır.
- Yorumun iki satırı bu fikri kodun içinde anlatıyor; eski tek satırlık yorumun yerini alıyor.

# --task--

1. Replace the comment above `hitSegment` with the two new lines, and add `, surface` to its parameters.
2. Replace the `const vn = ...` line in `hitSegment` with the three lines shown.

# --task-tr--

1. `hitSegment`'in üstündeki tek satırlık yorumu koddaki iki satırla değiştir; `bounce` parametresinin arkasına
   `, surface` ekle.
2. `hitSegment` içindeki `const vn = ball.vx * nx + ball.vy * ny` satırını sil; yerine koddaki üç satırı yaz.
   (`hitBumper` içindeki aynı görünen satıra dokunma.)
3. **Çalıştır**: oyun aynı görünür; kontroller yeni parametreyi deniyor.

# --hint--

Only the `vn` line in `hitSegment` changes; the two `ball.v... -= ...` lines under `if (vn < 0)` stay as they are.

# --hint-tr--

`hitSegment`'te yalnız `vn` satırı değişiyor; `if (vn < 0)` altındaki iki `ball.v... -= ...` satırı aynen kalıyor.

# --tests--

A surface moving into a still ball should give it the surface's speed.
tr: Duran bir topa doğru hareket eden yüzey ona kendi hızını vermeli.

```js
launch()
ball = { x: 200, y: 400, vx: 0, vy: 0 }
assert.isTrue(hitSegment(190, 405, 210, 405, 0, () => ({ x: 0, y: -10 })), 'a surface moving up into a still ball')
assert.closeTo(ball.vy, -10, 1e-9, 'gives it the surface speed')
```

Without a surface, walls should bounce as before.
tr: Yüzey verilmeyince duvarlar eskisi gibi sektirmeli.

```js
ball = { x: 25, y: 300, vx: -5, vy: 0 }
hitSegment(20, 470, 20, 120, 0.5)
assert.closeTo(ball.vx, 2.5, 1e-9)
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
let pressed // { left, right }
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false }
  score = 0
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
    hitSegment(f.x, f.y, t.x, t.y, 0.3)
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
    return
  }
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) newBall() // drained: the next ball
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

function key(event, down) {
  const k = event.key
  if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
  else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
  else if (k === ' ' || k === 'ArrowDown') {
    if (down) launch()
  } else return
  event.preventDefault()
}

document.addEventListener('keydown', (event) => key(event, true))
document.addEventListener('keyup', (event) => key(event, false))

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
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
