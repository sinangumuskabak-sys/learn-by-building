---
title: Ready or playing
title_tr: Hazır mı, oyunda mı
skills: [game.state]
---

# --goal--

A ball waiting in the lane should stay put, and Space should launch only a waiting ball. A `state` variable says which
of the two it is.

# --goal-tr--

İki küçük sorun var: kanalda bekleyen top yerçekimiyle tabana düşüp zıplıyor, ve Boşluk'a **oyun sırasında** basınca
top havadayken yeniden fırlıyor.

İkisini tek bir değişkenle çözüyoruz: `state` (durum). Top ya `'ready'` (kanalda, fırlatılmayı bekliyor) ya da
`'playing'` (oyunda):

- `'ready'` iken fizik çalışmaz, top yerinde bekler;
- fırlatma yalnız `'ready'` iken olur ve durumu `'playing'` yapar.

# --code--

```js
let state // 'ready' (in the lane) or 'playing'

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function update() {
  if (state === 'ready') return

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}
```

# --meaning--

- `newBall()` makes every new ball `'ready'`.
- `update` returns at once while ready: no gravity, no move.
- `launch` does nothing unless ready (`!==` means "is not"), and after launching the state is `'playing'`.

# --meaning-tr--

- `let state` → topun durumu. Değerleri **yazı** (metin): `'ready'` ya da `'playing'`.
- `state = 'ready'` (`newBall` içinde) → her yeni top beklemeye başlar.
- `if (state === 'ready') return` → `update`'in ilk satırı. `return` fonksiyonu **orada bitirir**: bekleyen topa
  yerçekimi de hareket de uygulanmaz.
- `if (state !== 'ready') return` → `!==` "eşit değil mi?". Top beklemiyorsa `launch` hiçbir şey yapmadan biter.
- `state = 'playing'` → fırlatılan top artık oyunda.

# --task--

1. Under `let ball` write `let state`.
2. In `newBall`, under the `ball = ...` line, write `state = 'ready'`.
3. Make `if (state === 'ready') return` the first line of `update`.
4. In `launch`, add the first line and `state = 'playing'` at the end.

# --task-tr--

1. `let ball ...` satırının altına `let state ...` satırını yaz.
2. `newBall` içinde `ball = { ... }` satırının altına `state = 'ready'` yaz.
3. `update` içinde **en üste** `if (state === 'ready') return` yaz.
4. `launch` içinde en üste `if (state !== 'ready') return`, `ball.vy = -16` satırının altına `state = 'playing'` yaz.
5. **Çalıştır**: top kanalda kıpırdamadan beklemeli; Boşluk'a bas, oyun sırasında bir daha bas: bir şey olmamalı.

# --hint--

Strings need quotes: `state === 'ready'`, not `state === ready`.

# --hint-tr--

Yazılar tırnak ister: `state === ready` değil, `state === 'ready'`.

# --tests--

A new ball should wait in the lane without moving.
tr: Yeni top kanalda kıpırdamadan beklemeli.

```js
assert.strictEqual(state, 'ready')
$.tick(30)
assert.deepEqual(ball, { x: 375, y: 570, vx: 0, vy: 0 })
```

Launching should make it `'playing'`, and only a waiting ball can be launched.
tr: Fırlatma `'playing'` yapmalı; yalnız bekleyen top fırlatılabilmeli.

```js
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(ball.vy, -16)
ball.vy = 2
$.press(' ')
assert.strictEqual(ball.vy, 2, 'Space during play does nothing')
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

let ball // { x, y, vx, vy }
let state // 'ready' (in the lane) or 'playing'

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

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

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
}

function update() {
  if (state === 'ready') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
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
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
