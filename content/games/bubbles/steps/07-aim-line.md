---
title: Aim upwards
title_tr: Yukarı nişan al
skills: [game.canvas]
---

# --goal--

The aim is an angle in radians. On the canvas y grows downwards, so **straight up is `-π/2`**. A short line from the
shooter shows it: `Math.cos(aim)` is how far right and `Math.sin(aim)` how far down for each unit along it.

# --goal-tr--

Nişan bir **açı**: `aim`. Açılar radyan ile ölçülür: tam tur `Math.PI * 2`, yarım tur `Math.PI`. 0 sağı gösterir. Canvas'ta
y aşağı doğru büyüdüğü için **dümdüz yukarı `-Math.PI / 2`**'dir.

Açıyı ekrana çevirmek için iki fonksiyon yeter: bir birim ilerlerken `Math.cos(aim)` ne kadar **sağa**, `Math.sin(aim)`
ne kadar **aşağı** gidildiğini söyler. Atıcıdan bu yönde 80 piksellik bir çizgi çizeceğiz.

# --code--

```js
let aim // angle of the shot, in radians

  aim = -Math.PI / 2

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
```

# --meaning--

- At `-π/2`, `cos` is 0 and `sin` is -1: the line goes 80 pixels straight up.
- `moveTo` puts the pen down, `lineTo` draws to the end point, `stroke` paints the line. It is drawn before the loaded bubble,
  which covers its start.

# --meaning-tr--

- `let aim` → nişan açısı; `reset` içinde `aim = -Math.PI / 2` → dümdüz yukarı.
- `-Math.PI / 2` iken `Math.cos` 0, `Math.sin` −1: çizginin ucu 0 sağda, 80 **yukarıda**.
- `ctx.strokeStyle`, `ctx.lineWidth` → yarı saydam beyaz, 2 piksel.
- `ctx.moveTo(SHOOTER.x, SHOOTER.y)` → kalemi atıcıya koy; `ctx.lineTo(...)` → 80 piksel ötedeki noktaya çizgi;
  `ctx.stroke()` → çizgiyi boya.
- Çizgi yüklü balondan **önce** çizilir; balon çizginin başını örter.

# --task--

1. Under `let grid ...` write `let aim ...`; in `reset`, above `loaded = pickColor()`, write `aim = -Math.PI / 2`.
2. In `draw`, above the loaded bubble, write the six line-drawing lines.

# --task-tr--

1. `let grid ...` satırının altına yorumuyla `let aim ...` yaz.
2. `reset` içinde `loaded = pickColor()` satırının **üstüne** `aim = -Math.PI / 2` yaz.
3. `draw` içinde yüklü balonu çizen satırın **üstüne** çizgiyi çizen altı satırı yaz.
4. **Çalıştır**: atıcıdan yukarı kısa bir çizgi görmelisin.

# --tests--

The aim should start straight up, and the aim line should go 80 pixels along it.
tr: Nişan dümdüz yukarı başlamalı; çizgi o yönde 80 piksel gitmeli.

```js
assert.closeTo(aim, -Math.PI / 2, 1e-9, 'straight up')
$.tick(1)
const ends = () => $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends(), '200,410', 'the aim line')
aim = -Math.PI / 4
$.tick(1)
assert.include(ends(), '257,433', 'up and to the right')
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
