---
title: Clear the table
title_tr: Masayı temizle
skills: [game.state]
---

# --goal--

When everything stops and only the cue ball is left, the table is cleared: the state becomes `'won'` and a message shows
the number of shots. Space then starts again.

# --goal-tr--

Her şey durduğunda masada **yalnız isteka topu** kaldıysa masa temizlenmiştir: durum `'won'` olur ve ortada kaç vuruşta
bitirdiğin yazar. Sonra Boşluk yeni bir oyun başlatır.

# --code--

```js
if (balls.length === 1) {
  state = 'won'
} else state = 'aiming'

else if (event.key === ' ') state === 'won' ? reset() : shoot()

if (state === 'won') {
  ctx.textAlign = 'center'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('Table cleared in ' + shots + ' shots!', canvas.width / 2, 170)
}
```

# --meaning--

- One ball left means only the cue ball (it was just put back if needed).
- Space: `state === 'won' ? reset() : shoot()` restarts after a win and shoots otherwise.

# --meaning-tr--

- `if (balls.length === 1)` → tek top kaldı: o da isteka topu (gerekiyorsa az önce geri getirildi). `state = 'won'`.
- `} else state = 'aiming'` → daha top varsa eskisi gibi nişan.
- `state === 'won' ? reset() : shoot()` → koşul işleci burada iki **çağrıdan** birini seçer: kazanıldıysa yeni oyun,
  değilse vuruş.
- Mesaj ortada, büyük yazıyla; yalnız `'won'` iken.

# --task--

1. In `update`, replace `state = 'aiming'` (the last line) with the `if`/`else`.
2. In the key listener, change the Space line.
3. In `draw`, under the `Shots` text, write the `if (state === 'won')` block.

# --task-tr--

1. `update`'in son satırı `state = 'aiming'`'i sil; yerine `if (balls.length === 1) { ... } else state = 'aiming'` yaz.
2. Tuş dinleyicisindeki Boşluk satırını değiştir.
3. `draw` içinde `'Shots ' + ...` yazı satırının altına `if (state === 'won') { ... }` bloğunu yaz.
4. **Çalıştır**. Bütün topları sokmak uzun sürer; testler bunu senin yerine deniyor.

# --tests--

Pocketing the last ball should clear the table.
tr: Son topu cebe sokmak masayı temizlemeli.

```js
balls = [cue, ball(60, 80, '#fff', 5)]
balls[1].vx = -3
balls[1].vy = -3
state = 'rolling'
for (let i = 0; i < 2000 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(state, 'won')
$.tick(1)
assert.include($.texts(), 'Table cleared in 0 shots!')
```

Space after winning should start a new game.
tr: Kazandıktan sonra Boşluk yeni bir oyun başlatmalı.

```js
state = 'won'
balls = [cue]
$.press(' ')
assert.strictEqual(state, 'aiming')
assert.lengthOf(balls, 11)
assert.strictEqual(shots, 0)
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
  if (balls.length === 1) {
    state = 'won'
  } else state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === ' ') state === 'won' ? reset() : shoot()
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
