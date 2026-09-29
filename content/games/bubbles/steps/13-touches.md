---
title: Touching something?
title_tr: Bir şeye değiyor mu?
skills: [game.collision]
---

# --goal--

A shot stops as soon as it **touches** something: the ceiling, or a bubble in the grid, when the centres are less than `2R`
apart. We use `2R - 4`, a little forgiving, so a shot can slip through a gap that looks just wide enough.

# --goal-tr--

Uçan balon bir şeye **değdiği anda** durmalı: tavana ya da ızgaradaki bir balona. İki balon, merkezleri arasındaki
uzaklık bir çaptan (`2R`) az olunca değer.

Biz `2R - 4` kullanacağız: biraz **hoşgörülü**. Böylece tam sığacak gibi görünen bir aralıktan balon gerçekten geçebilir.
Bu adımda yalnız soruyu cevaplayan fonksiyonu yazıyoruz: `touches` (değiyor mu).

# --code--

```js
// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP) return true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
    }
  }
  return false
}
```

# --meaning--

- The bubble's top is `y - R`; at the strip's bottom (`TOP`) it touches the ceiling.
- For every filled cell, `Math.hypot` is the distance between the centres; closer than `2R - 4` counts as touching.

# --meaning-tr--

- `if (y - R <= TOP) return true` → balonun tepesi (`y - R`) şeride ulaştıysa tavana değdi.
- İç içe iki döngü her hücreyi gezer; boşları atlar.
- `Math.hypot(p.x - x, p.y - y)` → iki merkez arasındaki uzaklık (Pisagor).
- `< 2 * R - 4` → bir çaptan 4 piksel az: hoşgörülü değme.
- Hiçbirine değmediyse `return false`.

# --task--

Above `function update() {` write `touches` with its comment, and an empty line after it.

# --task-tr--

`function update() {` satırının **üstüne** yorumuyla birlikte `touches` fonksiyonunu yaz; altında bir boş satır kalsın.
**Çalıştır**: oyun aynı; kontroller yeşil.

# --predict--

After this step, what does a shot do when it reaches the bubbles?
- [ ] It stops and sticks
- [x] It still flies through
  `touches` only answers a question; `update` does not ask it yet.
- [ ] It bounces back

# --predict-tr--

Bu adımdan sonra atış balonlara ulaşınca ne yapar?
- [ ] Durup yapışır
- [x] Yine içlerinden geçer
  `touches` yalnız bir soruyu cevaplıyor; `update` henüz onu sormuyor.
- [ ] Geri seker

# --tests--

`touches` should find the ceiling and the bubbles in the grid.
tr: `touches` tavanı ve ızgaradaki balonları bulmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
assert.isTrue(touches(200, 49), 'the ceiling')
assert.isFalse(touches(200, 100), 'nothing there')
grid[0][0] = 1
assert.isTrue(touches(40, 70), 'close to a bubble')
assert.isFalse(touches(56, 60), 'just over 2R - 4 away is not touching yet')
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }
const SPEED = 12

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function pickColor() {
  return Math.floor(Math.random() * COLORS.length)
}

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP) return true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
    }
  }
  return false
}

function update() {
  if (!shot) return
  shot.x += shot.vx
  shot.y += shot.vy
  if (shot.x < R || shot.x > canvas.width - R) {
    shot.vx = -shot.vx // bounce off the side walls
    shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
  }
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)
canvas.addEventListener('pointerup', shoot)

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
