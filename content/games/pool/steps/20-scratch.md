---
title: Scratch
title_tr: Faul
skills: [game.state]
---

# --goal--

Pocketing the cue ball is a **scratch**: it costs an extra shot, and when everything has stopped the cue ball comes back on
its spot. If another ball sits there, it moves left until it has room.

# --goal-tr--

İsteka topunu cebe sokmak bir **faul**dür: sana fazladan bir vuruşa mal olur. Her şey durunca isteka topu **başlangıç
noktasına** geri gelir. O noktada başka bir top duruyorsa, yer bulana kadar biraz sola kayar.

# --code--

```js
  balls = balls.filter((b) => {
    if (!pocketed(b)) return true
    if (b.cue) shots += 1 // a scratch costs a shot
    return false
  })

// The cue ball comes back on its spot, or as close to it as there is room.
function respot() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  while (balls.some((b) => Math.hypot(b.x - cue.x, b.y - cue.y) < R * 2)) cue.x -= R
  balls.unshift(cue)
}

  if (!balls.includes(cue)) respot()
```

# --meaning--

- The `filter` function now has a body: a ball that is not pocketed stays; a pocketed cue ball adds a shot; every pocketed
  ball is dropped.
- `while` repeats as long as its condition is true: while the new cue ball overlaps any ball, move it left by `R`.
- `unshift` puts the cue ball back at the front of `balls`.
- When all balls stop, `respot` runs if the cue ball is no longer in `balls`.

# --meaning-tr--

- `filter` içindeki fonksiyonun artık bir **gövdesi** var:
  - `if (!pocketed(b)) return true` → cebe girmediyse kalsın.
  - `if (b.cue) shots += 1` → cebe giren isteka topuysa: faul, bir vuruş ekle.
  - `return false` → cebe giren her top dizi dışında kalır.
- `respot` (yeniden yerleştir):
  - `cue = ball(...)` → yeni bir isteka topu, başlangıç noktasında.
  - `while (koşul) cue.x -= R` → `while` ("olduğu sürece") koşul doğru olduğu sürece tekrar eder: herhangi bir topla
    iç içe olduğu sürece `R` kadar sola kay.
  - `balls.unshift(cue)` → `unshift` dizinin **başına** ekler: isteka topu yine ilk top.
- `update` içinde `if (!balls.includes(cue)) respot()` → her şey durunca, `balls` isteka topunu **içermiyorsa**
  (`includes`) onu geri getir.

# --task--

1. In `step`, turn the `filter` line into the version with a body.
2. Above `function update() {` write `respot` with its comment.
3. In `update`, write the `respot` line between `if (moving) return` and `state = 'aiming'`.

# --task-tr--

1. `step` içindeki `filter` satırını gövdeli hâliyle değiştir.
2. `function update() {` satırının **üstüne** yorumuyla birlikte `respot` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `update` içinde `if (moving) return` ile `state = 'aiming'` satırlarının **arasına** `respot` satırını yaz.
4. **Çalıştır** ve isteka topunu bir cebe sok: geri gelmeli.

# --tests--

A scratch should cost a shot and bring the cue ball back.
tr: Faul bir vuruşa mal olmalı ve isteka topunu geri getirmeli.

```js
cue.x = 440
cue.y = 60
cue.vx = 3
cue.vy = -3
state = 'rolling'
for (let i = 0; i < 2000 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(shots, 1, 'a scratch costs a shot')
assert.include(balls, cue, 'the cue ball comes back')
assert.strictEqual(balls[0], cue)
assert.deepEqual([cue.x, cue.y, cue.vx, cue.vy], [130, 160, 0, 0])
```

When its spot is taken, the cue ball should find room to the left.
tr: Noktası doluysa isteka topu solda yer bulmalı.

```js
balls.push(ball(131, 161, '#fff', 11))
balls = balls.filter((b) => b !== cue)
respot()
assert.isBelow(cue.x, 130 - R, 'the spot is taken, so it moves left')
assert.strictEqual(cue.y, 160)
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
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
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
    b.x += b.vx
    b.y += b.vy
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
  step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  if (!balls.includes(cue)) respot()
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots, LEFT, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
