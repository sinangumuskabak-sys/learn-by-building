---
title: Smaller steps
title_tr: Daha küçük adımlar
skills: [game.physics, game.collision]
---

# --goal--

Hit a ball hard and at an angle, and it can go off in the **wrong direction**: at power 16 a ball moves 16 pixels a frame,
so by the time we notice two balls touch they may overlap a lot, and the line between their centres is no longer the one at
first contact. The fix: split each frame into `SUB` smaller steps.

# --goal-tr--

Bir topa sert ve açılı vurursan **yanlış yöne** gidebilir. Neden? Güç 16'da top karede 16 piksel ilerler. İki topun
değdiğini fark ettiğimizde çoktan birkaç piksel **iç içe** geçmiş olabilirler; `collide`'da her şeyi belirleyen
merkezler arası çizgi artık **ilk değme anındaki** çizgi değildir.

Çözüm: her kareyi `SUB` tane **küçük adıma** böl. Her adım hızın yalnız `1/SUB`'i kadar ilerletir ve çarpışmaları
kontrol eder. Hızlı ve sıyırarak bir vuruşta çarpılan topun yön hatası:

| karede adım | hata (radyan) |
|---|---|
| 1 | 0.62 |
| 4 | 0.12 |
| 8 | 0.04 |

Sekiz adım gerçeğe yeterince yakın ve hâlâ ucuz. Sürtünme karede bir kez kalır; toplar yine aynı mesafeyi gider.

# --code--

```js
const SUB = 8 // physics steps per frame, so fast balls cannot jump through each other

    b.x += b.vx / SUB
    b.y += b.vy / SUB

  for (let i = 0; i < SUB; i++) step()
```

# --meaning--

- Each step moves a ball by an eighth of its velocity; `update` runs eight steps per frame, so a frame still moves the full
  velocity.
- Collisions and pockets are checked in every small step.

# --meaning-tr--

- `const SUB = 8` → karede kaç fizik adımı; yorum nedenini söylüyor.
- `b.x += b.vx / SUB` → her adım hızın sekizde biri kadar ilerletir.
- `for (let i = 0; i < SUB; i++) step()` → karede sekiz adım: toplam yine hızın tamamı kadar yol. Ama çarpışmalar ve
  cepler sekiz kez, çok daha küçük örtüşmelerle kontrol edilir.

# --task--

1. Under `MAX_POWER` write `SUB`.
2. In `step`, divide the velocities by `SUB`.
3. In `update`, replace `step()` with the `for` line.

# --task-tr--

1. `MAX_POWER` satırının altına `SUB` yaz.
2. `step` içinde `b.x += b.vx` ve `b.y += b.vy` satırlarını `/ SUB` ile böl.
3. `update` içindeki `step()` satırını `for (let i = 0; i < SUB; i++) step()` yap.
4. **Çalıştır**: oyun aynı hissettirir, ama sert vuruşlar artık doğru yöne gider.

# --tests--

A fast glancing hit should send the other ball in the right direction.
tr: Hızlı, sıyırarak bir vuruş diğer topu doğru yöne göndermeli.

```js
// A fast, glancing hit: the other ball must leave along the line between the centres at the moment they touch.
balls = [cue, ball(200, 172, '#fff', 1)]
cue.x = 150
cue.y = 160
cue.vx = 16
cue.vy = 0
state = 'rolling'
$.tick(3)
const expected = Math.atan2(12, Math.sqrt(18 * 18 - 12 * 12))
assert.closeTo(Math.atan2(balls[1].vy, balls[1].vx), expected, 0.05)
```

A frame should still move a ball by its whole velocity.
tr: Bir kare topu yine hızının tamamı kadar ilerletmeli.

```js
shoot()
$.tick(1)
assert.closeTo(cue.x, 138, 1e-9)
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
const POCKETS = [
  [LEFT, TOP], [240, TOP], [RIGHT, TOP],
  [LEFT, BOTTOM], [240, BOTTOM], [RIGHT, BOTTOM],
]
const POCKET_R = 15
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const MAX_POWER = 16
const SUB = 8 // physics steps per frame, so fast balls cannot jump through each other
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let dragging
let shots
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
  dragging = false
  shots = 0
  state = 'aiming'
}

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  shots += 1
  state = 'rolling'
}

// Two balls of the same mass that touch swap the parts of their velocities that point along the line between them.
function collide(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  if (dist >= R * 2 || dist === 0) return
  const nx = dx / dist
  const ny = dy / dist
  // Push them apart so they only just touch.
  const overlap = (R * 2 - dist) / 2
  a.x -= nx * overlap
  a.y -= ny * overlap
  b.x += nx * overlap
  b.y += ny * overlap
  const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (along <= 0) return // already moving apart
  a.vx -= along * nx
  a.vy -= along * ny
  b.vx += along * nx
  b.vy += along * ny
}

function pocketed(b) {
  return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
}

function step() {
  for (const b of balls) {
    b.x += b.vx / SUB
    b.y += b.vy / SUB
    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
  balls = balls.filter((b) => {
    if (!pocketed(b)) return true
    if (b.cue) shots += 1 // a scratch costs a shot
    return false
  })
}

// The cue ball comes back on its spot, or as close to it as there is room.
function respot() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  while (balls.some((b) => Math.hypot(b.x - cue.x, b.y - cue.y) < R * 2)) cue.x -= R
  balls.unshift(cue)
}

function update() {
  if (state !== 'rolling') return
  for (let i = 0; i < SUB; i++) step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  if (!balls.includes(cue)) respot()
  if (balls.length === 1) {
    state = 'won'
  } else state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === 'ArrowUp') power = Math.min(MAX_POWER, power + 1)
  else if (event.key === 'ArrowDown') power = Math.max(2, power - 1)
  else if (event.key === ' ') state === 'won' ? reset() : shoot()
  else return
  event.preventDefault()
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

// Pull back from the cue ball like a slingshot: the shot goes the other way, harder the further you pull.
function pull(point) {
  aim = Math.atan2(cue.y - point.y, cue.x - point.x)
  power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won') return reset()
  if (state !== 'aiming') return
  dragging = true
  pull(toCanvas(event))
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (power >= 1) shoot()
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
  for (const [px, py] of POCKETS) {
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
    ctx.fill()
  }

  if (state === 'aiming') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
    ctx.stroke()
  }

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

  // Power bar
  ctx.fillStyle = '#334155'
  ctx.fillRect(LEFT, 304, RIGHT - LEFT, 14)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(LEFT, 304, ((RIGHT - LEFT) * power) / MAX_POWER, 14)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots + '  Left ' + (balls.filter((b) => !b.cue).length), LEFT, 22)
  if (state === 'won') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Table cleared in ' + shots + ' shots!', canvas.width / 2, 170)
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
