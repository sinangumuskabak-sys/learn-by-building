---
title: Which keys are held?
title_tr: Hangi tuşlar basılı?
skills: [game.input]
---

# --goal--

A flipper stays up while its key is held. So we need to know not only when a key goes down but also when it comes
back up. `pressed` remembers the two flipper keys; one function `key` handles both events.

# --goal-tr--

Palet, tuşu **basılı tuttuğun sürece** yukarıda kalmalı, bırakınca inmeli. Bu yüzden yalnız tuşa basılmasını değil,
**bırakılmasını** da duymamız lazım.

Hangi palet tuşunun şu an basılı olduğunu bir nesnede tutacağız: `pressed` (basılı). Tuşlar:

- sol palet: **Sol ok** ya da **Z**,
- sağ palet: **Sağ ok**, **M** ya da **/**.

Basma ve bırakma için iki ayrı kod yazmak yerine tek bir `key` fonksiyonu yazıyoruz; basınca `down` `true`,
bırakınca `false` oluyor. Bu adımda paletler henüz kalkmayacak; yalnız `pressed` doğru tutulacak.

# --code--

```js
let pressed // { left, right }

  pressed = { left: false, right: false }

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
```

# --meaning--

- `pressed` holds `true` / `false` for each flipper key.
- `keydown` calls `key(event, true)`, `keyup` calls `key(event, false)`: holding a key sets its flag, letting go clears it.
- The launch keys still launch, but only on the way down.
- Any other key returns early, so `preventDefault()` only blocks the game's own keys.

# --meaning-tr--

- `let pressed` → basılı tuş bilgisi. `reset` onu `{ left: false, right: false }` yapar: `true`/`false` evet/hayır
  değerleridir, başta ikisi de basılı değil.
- `function key(event, down) {` → her tuş olayında çağrılır. `down` basma için `true`, bırakma için `false`.
- `pressed.left = down` → tuş basılınca `true`, bırakılınca `false` olur. Tek satır ikisini de yapar.
- `else if` → "değilse, şu doğru mu?". Tuş sırayla denenir: sol palet tuşu mu, sağ palet tuşu mu, fırlatma tuşu mu?
- `if (down) launch()` → fırlatma yalnız **basınca**, bırakınca değil.
- `} else return` → bunların hiçbiri değilse fonksiyondan çık; böylece alttaki `event.preventDefault()` yalnız oyunun
  tuşlarında çalışır, başka tuşlar tarayıcıda normal çalışır.
- `'keyup'` → tuş **bırakılınca** gelen olay. İki dinleyici de aynı `key` fonksiyonunu çağırır; biri `true`, biri
  `false` vererek.

# --task--

1. Under `let flippers` write `let pressed`.
2. In `reset`, under the `flippers = ...` line, write the `pressed` line.
3. Replace the whole `keydown` listener with `key` and the two new listeners.

# --task-tr--

1. `let flippers ...` satırının altına `let pressed ...` yaz.
2. `reset` içinde `flippers = ...` satırının altına `pressed = { left: false, right: false }` yaz.
3. Eski `document.addEventListener('keydown', ...)` bloğunun **tamamını** sil; yerine `key` fonksiyonunu ve iki yeni
   dinleyiciyi yaz.
4. **Çalıştır**: Boşluk yine fırlatmalı. Paletler henüz kalkmaz; kontroller `pressed`'i deniyor.

# --hint--

`keyup` is a separate event: both listeners call `key`, one with `true`, the other with `false`.

# --hint-tr--

`keyup` ayrı bir olay: iki dinleyici de `key`'i çağırır, biri `true`, öbürü `false` ile.

# --tests--

Holding a flipper key should set its flag, letting go should clear it.
tr: Palet tuşunu basılı tutmak bayrağını açmalı, bırakmak kapatmalı.

```js
assert.deepEqual(pressed, { left: false, right: false })
$.press('ArrowLeft')
assert.isTrue(pressed.left)
assert.isFalse(pressed.right)
$.release('ArrowLeft')
assert.isFalse(pressed.left)
$.press('z')
assert.isTrue(pressed.left, 'z works too')
$.release('z')
for (const k of ['ArrowRight', 'm', 'M', '/']) {
  $.press(k)
  assert.isTrue(pressed.right, k)
  $.release(k)
  assert.isFalse(pressed.right, k)
}
```

Space should still launch the ball.
tr: Boşluk topu yine fırlatmalı.

```js
$.press(' ')
assert.strictEqual(state, 'playing')
$.release(' ')
assert.strictEqual(state, 'playing')
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

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
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
  const vn = ball.vx * nx + ball.vy * ny
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
    const t = tip(f)
    hitSegment(f.x, f.y, t.x, t.y, 0.3)
  }
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  if (state === 'ready') return
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
