---
title: Aiming and rolling
title_tr: Nişan ve yuvarlanma
skills: [game.state]
---

# --goal--

The game has two moods: `'aiming'`, waiting for a shot, and `'rolling'`, while anything moves. A shot is only allowed while
aiming. When every ball is still again, it is back to aiming.

# --goal-tr--

Oyunun iki hâli var: `'aiming'` (nişan alınıyor, vuruş bekleniyor) ve `'rolling'` (toplar yuvarlanıyor). Şu an toplar
dururken de hareket ederken de Boşluk'a basınca vuruluyor; top daha dönerken ikinci kez vurmak olmaz.

Durumu tek bir değişkende tutacağız: `state`. Vuruş yalnız nişan alırken olur ve durumu `'rolling'` yapar. Her karede
bir top hâlâ hareket ediyor mu diye bakacağız; **hiçbiri** hareket etmiyorsa yeniden `'aiming'`.

# --code--

```js
let state // 'aiming', 'rolling' or 'won'

  state = 'aiming'

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  state = 'rolling'
}

function update() {
  if (state !== 'rolling') return
  step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  state = 'aiming'
}
```

# --meaning--

- `shoot` does nothing unless aiming, and starts the rolling.
- `update` only moves balls while rolling.
- `moving` starts false; any ball that is not stopped sets it to true. If nothing moved, the game goes back to aiming.

# --meaning-tr--

- `let state` → oyunun durumu; yorum alabileceği değerleri söylüyor (`'won'` ileride gelecek). `reset` içinde
  `state = 'aiming'`.
- `shoot` içinde `if (state !== 'aiming') return` → nişan almıyorsak vurma; sonunda `state = 'rolling'`.
- `update` içinde `if (state !== 'rolling') return` → toplar durmuşken hesap yapma.
- `let moving = false` → "hareket eden top var mı?" bayrağı; önce yok say.
- `else moving = true` → bir topun hızı sıfırlanmadıysa hâlâ hareket ediyor demektir.
- `if (moving) return` → biri bile hareket ediyorsa bekle; `state = 'aiming'` → hepsi durdu, yeniden nişan.

# --task--

1. Under `let power` write `let state ...`; in `reset`, under `power = 8`, write `state = 'aiming'`.
2. In `shoot`, add the first line and the last line.
3. In `update`, add the first line, `let moving = false` above the loop, `else moving = true` under the stop line, and the
   last two lines after the loop.

# --task-tr--

1. `let power` satırının altına yorumuyla birlikte `let state ...` yaz.
2. `reset` içinde `power = 8` satırının altına `state = 'aiming'` yaz.
3. `shoot` içinde en üste `if (state !== 'aiming') return`, en alta `state = 'rolling'` yaz.
4. `update` içinde:
   - en üste `if (state !== 'rolling') return`,
   - `step()`'in altına `let moving = false`,
   - `if (Math.hypot(...)) ...` satırının altına `else moving = true`,
   - döngünün kapanan `}`'sinden sonra `if (moving) return` ve `state = 'aiming'`.
5. **Çalıştır**, vur ve top dönerken yine Boşluk'a bas: bir şey olmamalı.

# --hint--

`else moving = true` belongs to the `if` just above it: a ball that did not stop is still moving.

# --hint-tr--

`else moving = true`, hemen üstündeki `if`'e bağlıdır: durdurulmayan top hâlâ hareket ediyordur.

# --tests--

A shot should start the rolling, and there is no second shot while rolling.
tr: Vuruş yuvarlanmayı başlatmalı; yuvarlanırken ikinci vuruş olmamalı.

```js
assert.strictEqual(state, 'aiming')
aim = 0
$.press(' ')
assert.strictEqual(state, 'rolling')
aim = Math.PI / 2
$.press(' ')
assert.deepEqual([cue.vx, cue.vy], [8, 0], 'no second shot while rolling')
```

When every ball stops, the game should be aiming again.
tr: Bütün toplar durunca oyun yeniden nişan almalı.

```js
aim = Math.PI / 2
shoot()
for (let i = 0; i < 1000 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(state, 'aiming')
assert.deepEqual([cue.vx, cue.vy], [0, 0])
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let state // 'aiming', 'rolling' or 'won'

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
  aim = 0
  power = 8
  state = 'aiming'
}

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  state = 'rolling'
}

function step() {
  for (const b of balls) {
    b.x += b.vx
    b.y += b.vy
    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
  }
}

function update() {
  if (state !== 'rolling') return
  step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cue.x, cue.y)
  ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
  ctx.stroke()

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
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
