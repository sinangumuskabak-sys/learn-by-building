---
title: Aim with the pointer
title_tr: İşaretçiyle nişan al
skills: [game.input]
---

# --goal--

The pointer aims too: the angle from the shooter to the pointer is `Math.atan2(dy, dx)`. Points below the shooter are ignored.
The page may show the canvas at another size, so the position is first turned into canvas pixels.

# --goal-tr--

Fare ya da parmak da nişan alsın: atıcıdan işaretçiye giden okun açısı `Math.atan2(dy, dx)` ile bulunur. Atıcının
**altındaki** noktalar yok sayılır; yere ateş edilmez.

Bir incelik: sayfa canvas'ı ekranda 400×520'den küçük ya da büyük gösterebilir (telefonda küçülür). Olayın verdiği nokta
ekran pikseli; önce canvas pikseline çeviririz.

# --code--

```js
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)
```

# --meaning--

- `getBoundingClientRect()` gives where the canvas is on screen and how big it is shown; the event's position is scaled to
  canvas pixels.
- `Math.atan2(dy, dx)` is the angle of the vector from the shooter to the point, in any direction (note: y first).
- The function itself is passed to `addEventListener`, so it is called with the event, both on moving and on pressing.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri ve gösterilen boyu. `(event.clientX - rect.left) *
  canvas.width / rect.width` → ekran pikselini canvas pikseline çevirir; y aynı hesap.
- `if (y < SHOOTER.y)` → yalnız atıcının **üstündeki** noktalar.
- `Math.atan2(y - SHOOTER.y, x - SHOOTER.x)` → atıcıdan noktaya okun **açısı**; her yönde doğru çalışır. Dikkat: önce y
  farkı, sonra x farkı. Sonuç yine `clampAim`'den geçer.
- `canvas.addEventListener('pointermove', pointAt)` → fonksiyonun **kendisini** veriyoruz (parantezsiz): tarayıcı onu
  olayla birlikte çağırır. İşaretçi kıpırdayınca da basınca da nişan alınır.

# --task--

Above `function drawBubble(...)` write `pointAt` and the two listeners, with an empty line after them.

# --task-tr--

`function drawBubble(...)` satırının **üstüne** `pointAt` fonksiyonunu ve iki dinleyiciyi yaz; altlarında bir boş satır
kalsın. **Çalıştır** ve fareyi canvas üstünde gezdir: çizgi onu izlemeli.

# --tests--

The pointer should aim at itself, ignoring points below the shooter.
tr: İşaretçi kendine nişan aldırmalı, atıcının altındaki noktaları yok sayarak.

```js
$.move(100, 390)
assert.closeTo(aim, -3 * Math.PI / 4, 1e-9, 'aims at the pointer')
$.move(300, 500)
assert.closeTo(aim, -3 * Math.PI / 4, 1e-9, 'below the shooter: ignored')
$.move(399, 489)
assert.closeTo(aim, -0.15, 1e-9, 'clamped')
$.pointerDown(200, 100)
assert.closeTo(aim, -Math.PI / 2, 1e-9, 'pressing aims too')
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

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after

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
  loaded = pickColor()
  next = pickColor()
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
