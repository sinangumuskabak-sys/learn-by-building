---
title: Bounce off the walls
title_tr: Duvarlardan sek
skills: [game.physics, game.collision]
---

# --goal--

Past the left or right wall, the bubble bounces: `vx` flips and the bubble is put back inside. Bank shots off the walls are a
big part of the game.

# --goal-tr--

Balon sol ya da sağ duvara ulaşınca **seksin**: yatay hızının işaretini çevir ve balonu duvarın içine geri koy. Duvardan
sektirerek atmak bu oyunun en keyifli kısımlarından.

Balonun **merkezi** duvara `R` kadar yaklaşınca balon duvara değmiş olur: sınır 0 değil, `R`.

# --code--

```js
if (shot.x < R || shot.x > canvas.width - R) {
  shot.vx = -shot.vx // bounce off the side walls
  shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
}
```

# --meaning--

- The bubble touches a wall when its centre is closer than `R` to it.
- `-shot.vx` reverses the sideways speed; the position is clamped back between `R` and `canvas.width - R`.

# --meaning-tr--

- `if (shot.x < R || shot.x > canvas.width - R)` → merkez sol duvara ya da sağ duvara `R`'den fazla yaklaştıysa...
- `shot.vx = -shot.vx` → ...yatay hızı **ters çevir**: sola giden sağa döner. Dikey hız aynı kalır; balon yukarı gitmeye
  devam eder.
- `shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))` → balonu `R` ile `canvas.width - R` arasına geri koy; duvarın
  içinde kalmasın.

# --task--

In `update`, under `shot.y += shot.vy`, write the `if` block.

# --task-tr--

`update` içinde `shot.y += shot.vy` satırının altına `if` bloğunu yaz. **Çalıştır**, nişanı yana çevir ve ateş et.

# --tests--

A shot should bounce off the side walls.
tr: Bir atış yan duvarlardan sekmeli.

```js
aim = -Math.PI + 0.3
shoot()
let bounced = false
for (let i = 0; i < 40; i++) {
  $.tick(1)
  if (shot.vx > 0) bounced = true
  assert.isAtLeast(shot.x, R, 'never through the wall')
}
assert.isTrue(bounced, 'it bounces off the left wall')
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
