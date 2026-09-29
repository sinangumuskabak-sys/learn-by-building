---
title: Fly
title_tr: Uç
skills: [game.physics, game.loop]
---

# --goal--

Every frame the flying bubble moves by its velocity. `update` does it, and the loop calls it before `draw`.

# --goal-tr--

Her karede uçan balon **hızı kadar** ilerlesin. Bu işi `update` (güncelle) yapacak; döngü de çizmeden önce onu çağıracak.

# --code--

```js
function update() {
  if (!shot) return
  shot.x += shot.vx
  shot.y += shot.vy
}

  update()
```

# --meaning--

- Nothing flying: nothing to do. Otherwise add the velocity to the position.

# --meaning-tr--

- `if (!shot) return` → havada balon yoksa yapacak bir şey yok.
- `shot.x += shot.vx`, `shot.y += shot.vy` → hızı kadar ilerle.
- `loop` içinde `update()` → her karede önce güncelle, sonra çiz.

# --task--

1. Above `const clampAim ...` write `update`, with an empty line after it.
2. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `const clampAim = ...` satırının **üstüne** `update` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `loop` içinde `draw()`'un **üstüne** `update()` yaz.
3. **Çalıştır** ve Boşluk'a bas.

# --predict--

What will the bubble do?
- [ ] Stop at the colored bubbles
- [x] Fly straight through them and off the top of the screen
  Nothing checks for touching yet, and it never comes back, so you cannot shoot again.
- [ ] Fall down

# --predict-tr--

Balon ne yapacak?
- [ ] Renkli balonlara değince duracak
- [x] İçlerinden geçip ekranın üstünden çıkacak
  Henüz değmeye bakan yok; balon hiç geri dönmediği için bir daha da ateş edemezsin.
- [ ] Aşağı düşecek

# --tests--

The shot should move by its velocity each frame.
tr: Atış her karede hızı kadar ilerlemeli.

```js
shoot()
$.tick(1)
assert.closeTo(shot.y, 478, 1e-9)
$.tick(1)
assert.closeTo(shot.y, 466, 1e-9)
assert.closeTo(shot.x, 200, 1e-9)
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
