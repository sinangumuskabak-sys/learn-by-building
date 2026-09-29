---
title: Turn with the arrows
title_tr: Oklarla çevir
skills: [game.input]
---

# --goal--

The arrow keys turn the aim a little each press. The angle is **clamped**: never flatter than 0.15 radians from the
horizontal, because a shot almost along the floor would bounce between the walls for ages.

# --goal-tr--

Sol ve sağ oklar nişanı her basışta **biraz** çevirsin (0.04 radyan, ~2 derece).

Ama açıyı **sınırlayacağız**: yataya 0.15 radyandan (~9 derece) fazla yaklaşamaz. Neredeyse yere paralel bir atış
duvarlar arasında sonsuza kadar seker ve balonlara hiç ulaşmaz. Aşağıya ateş etmek de olmaz.

# --code--

```js
const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else return
  event.preventDefault()
})
```

# --meaning--

- Pointing right along the floor is 0, left is `-π`. `clampAim` keeps the angle between `-π + 0.15` and `-0.15`:
  `Math.min` caps it on one side, `Math.max` on the other.
- Left makes the angle smaller (turning left), right bigger. Other keys leave at once; only the game's keys reach
  `preventDefault()`, which stops the page from scrolling.

# --meaning-tr--

- Yere paralel sağ 0, yere paralel sol `-Math.PI`; yukarısı bu ikisinin arası.
- `Math.min(-0.15, angle)` → açı −0.15'i **geçemez** (sağda yataya fazla yaklaşmasın); `Math.max(-Math.PI + 0.15, ...)`
  → solda da aynısı. Sonuç iki sınır arasında kalır.
- `aim = clampAim(aim - 0.04)` → sol ok açıyı küçültür: nişan sola döner. Sağ ok büyütür: sağa.
- `else return` → başka tuşsa hemen çık. `event.preventDefault()` → okların sayfayı kaydırmasını engelle.

# --task--

Above `function drawBubble(...)` write `clampAim` and the key listener, each followed by an empty line.

# --task-tr--

`function drawBubble(...)` satırının **üstüne** `clampAim` satırını ve tuş dinleyicisini yaz; her birinin altında bir boş
satır kalsın. **Çalıştır**, oyuna tıkla ve oklarla nişanı çevir.

# --tests--

The arrow keys should turn the aim, never flatter than 0.15 radians.
tr: Ok tuşları nişanı döndürmeli, asla 0,15 radyandan daha yatık değil.

```js
$.press('ArrowLeft')
assert.closeTo(aim, -Math.PI / 2 - 0.04, 1e-9)
for (let i = 0; i < 100; i++) $.press('ArrowLeft')
assert.closeTo(aim, -Math.PI + 0.15, 1e-9, 'never flat along the floor')
for (let i = 0; i < 200; i++) $.press('ArrowRight')
assert.closeTo(aim, -0.15, 1e-9)
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
