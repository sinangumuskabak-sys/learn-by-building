---
title: A dotted guide
title_tr: Noktalı kılavuz
skills: [game.physics]
---

# --goal--

The short aiming line becomes a dotted path that follows the shot, bouncing off the walls, up to the bubble it would
hit. Bank shots get much easier.

# --goal-tr--

Kısa nişan çizgisi yerine atışın **izleyeceği yolu** noktalarla gösterelim: duvarlardan sekerek çarpacağı balona kadar.
Duvardan sektirmeli atışlar çok kolaylaşır. İşin güzeli, yolu hesaplamak için atılan balonu hareket ettiren kodun
aynısını küçük adımlarla "prova" ediyoruz.

# --code--

```js
// The path the shot will take, bouncing off the walls, until it would touch a bubble.
function guide() {
  let x = SHOOTER.x
  let y = SHOOTER.y
  let vx = Math.cos(aim) * 4
  const vy = Math.sin(aim) * 4
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  for (let i = 1; i < 200; i++) {
    x += vx
    y += vy
    if (x < R || x > canvas.width - R) vx = -vx
    if (touches(x, y)) break
    if (i % 5 === 0) ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
  }
}

  if (state === 'playing') guide()
```

# --meaning--

- A pretend bubble starts at the shooter and moves in small steps of 4 pixels in the aim's direction.
- At a side wall its `vx` flips, like the real shot; when it would touch a bubble or the ceiling, the loop stops.
- Every fifth step a small dot is drawn.

# --meaning-tr--

- `let x`, `let y` → hayali bir balon nişancıdan başlar.
- `Math.cos(aim) * 4`, `Math.sin(aim) * 4` → nişan yönünde 4 piksellik küçük adımlar (açıyı x ve y adımına çeviren
  trigonometri, atışta da kullandığımız).
- `for (let i = 1; i < 200; i++)` → en fazla 200 adım prova et.
- `if (x < R || x > canvas.width - R) vx = -vx` → yan duvara gelince gerçek atış gibi sek.
- `if (touches(x, y)) break` → bir balona ya da tavana değecekse **dur** (`break` döngüden çıkar).
- `if (i % 5 === 0)` → her 5 adımda bir, 3×3'lük küçük bir nokta çiz.
- `draw` içindeki eski çizgi kodunun yerine `guide()`, yalnız oyun sürerken.

# --task--

1. Above `function draw() {`, write the comment and `guide`.
2. In `draw`, replace the six lines that draw the aiming line with `if (state === 'playing') guide()`.

# --task-tr--

1. `function draw() {` satırının üstüne yorumu ve `guide` fonksiyonunu yaz (arada bir boş satır kalsın).
2. `draw` içindeki nişan çizgisini çizen altı satırı (`ctx.strokeStyle = ...`'dan `ctx.stroke()`'a kadar) sil; yerine
   `if (state === 'playing') guide()` yaz.
3. **Çalıştır**, nişanı yana çevir: noktalar duvardan sekmeli. Oyun bitti!

# --tests--

A dotted guide should be drawn while playing.
tr: Oyun sürerken noktalı bir kılavuz çizilmeli.

```js
$.tick()
const dots = $.rects('rgba(255, 255, 255, 0.5)')
assert.isAbove(dots.length, 5)
assert.isTrue(dots.every((d) => d.w === 3 && d.h === 3))
```

The guide should bounce off a side wall.
tr: Kılavuz yan duvardan sekmeli.

```js
aim = -Math.PI + 0.3
$.tick()
const xs = $.rects('rgba(255, 255, 255, 0.5)').map((d) => d.x)
const lowest = Math.min(...xs)
assert.isBelow(lowest, 40, 'the dots reach the left wall')
assert.isAbove(xs[xs.length - 1], lowest, 'and come back from it')
```

There should be no guide after the game.
tr: Oyun bitince kılavuz olmamalı.

```js
state = 'lost'
$.tick()
assert.lengthOf($.rects('rgba(255, 255, 255, 0.5)'), 0)
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
const DANGER = 440 // a bubble below this line ends the game
const DROP_EVERY = 8 // shots between the ceiling coming down

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
let score
let shots
let drop // how many rows the ceiling has come down
let state // 'playing', 'won' or 'lost'
let best = Number(localStorage.getItem('bubbles-best')) || 0

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + drop * ROW_H + R + r * ROW_H })

// The six cells around (r, c). Odd rows are shifted right, so their neighbours above and below are at c and c + 1;
// even rows' are at c - 1 and c.
function neighbors(r, c) {
  const shift = r % 2 === 0 ? -1 : 0
  return [
    [r, c - 1], [r, c + 1],
    [r - 1, c + shift], [r - 1, c + shift + 1],
    [r + 1, c + shift], [r + 1, c + shift + 1],
  ].filter(([nr, nc]) => inGrid(nr, nc))
}

// The colors still on the board, so the shooter never offers a useless one.
function pickColor() {
  const present = [...new Set(grid.flat().filter((color) => color >= 0))]
  const choices = present.length ? present : COLORS.map((_, i) => i)
  return choices[Math.floor(Math.random() * choices.length)]
}

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  falling = []
  score = 0
  shots = 0
  drop = 0
  state = 'playing'
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (state !== 'playing' || shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP + drop * ROW_H) return true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
    }
  }
  return false
}

// The empty cell closest to where the bubble stopped.
function snap(x, y) {
  let nearest = null
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] >= 0) continue
      const p = cellPos(r, c)
      const d = Math.hypot(p.x - x, p.y - y)
      if (!nearest || d < nearest.d) nearest = { r, c, d }
    }
  }
  return nearest
}

// Flood fill: every cell connected to (r, c) through neighbours that pass the test.
function connected(starts, test) {
  const seen = new Set(starts.map(([r, c]) => r * COLS + c))
  const queue = [...starts]
  while (queue.length) {
    const [r, c] = queue.shift()
    for (const [nr, nc] of neighbors(r, c)) {
      if (seen.has(nr * COLS + nc) || !test(nr, nc)) continue
      seen.add(nr * COLS + nc)
      queue.push([nr, nc])
    }
  }
  return [...seen].map((k) => [Math.floor(k / COLS), k % COLS])
}

function remove(cells, points) {
  for (const [r, c] of cells) {
    const p = cellPos(r, c)
    falling.push({ x: p.x, y: p.y, vy: -2, r: R, color: grid[r][c] })
    grid[r][c] = -1
    score += points
  }
}

function attach(r, c, color) {
  grid[r][c] = color
  shots += 1
  // Three or more of one color, touching: they pop.
  const group = connected([[r, c]], (nr, nc) => grid[nr][nc] === color)
  if (group.length >= 3) {
    remove(group, 10)
    // Whatever no longer hangs from the ceiling drops, worth double.
    const top = []
    for (let c2 = 0; c2 < cols(0); c2++) if (grid[0][c2] >= 0) top.push([0, c2])
    const held = new Set(connected(top, (nr, nc) => grid[nr][nc] >= 0).map(([hr, hc]) => hr * COLS + hc))
    const loose = []
    for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < cols(r2); c2++) {
      if (grid[r2][c2] >= 0 && !held.has(r2 * COLS + c2)) loose.push([r2, c2])
    }
    remove(loose, 20)
  }
  if (shots % DROP_EVERY === 0) drop += 1
  const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
  if (cells.every((cell) => cell.color < 0)) {
    state = 'won'
    score += 1000
  } else if (cells.some((cell) => cell.color >= 0 && cellPos(cell.r, cell.c).y + R > DANGER)) state = 'lost'
  if (state !== 'playing' && score > best) {
    best = score
    localStorage.setItem('bubbles-best', best)
  }
}

function update() {
  for (const f of falling) {
    f.vy += 0.4
    f.y += f.vy
  }
  falling = falling.filter((f) => f.y - f.r < canvas.height)
  if (!shot) return
  // A few small steps per frame, so the bubble cannot jump past a gap.
  for (let i = 0; i < 3 && shot; i++) {
    shot.x += shot.vx / 3
    shot.y += shot.vy / 3
    if (shot.x < R || shot.x > canvas.width - R) {
      shot.vx = -shot.vx // bounce off the side walls
      shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
    }
    if (touches(shot.x, shot.y)) {
      const cell = snap(shot.x, shot.y)
      attach(cell.r, cell.c, shot.color)
      shot = null
    }
  }
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else if (event.key === ' ') state === 'playing' ? shoot() : reset()
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
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'playing') pointAt(event)
})
// Lifting the finger shoots, or plays again after the end (so the tap that restarts does not also shoot).
canvas.addEventListener('pointerup', () => (state === 'playing' ? shoot() : reset()))

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

// The path the shot will take, bouncing off the walls, until it would touch a bubble.
function guide() {
  let x = SHOOTER.x
  let y = SHOOTER.y
  let vx = Math.cos(aim) * 4
  const vy = Math.sin(aim) * 4
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  for (let i = 1; i < 200; i++) {
    x += vx
    y += vy
    if (x < R || x > canvas.width - R) vx = -vx
    if (touches(x, y)) break
    if (i % 5 === 0) ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
  }
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // The ceiling comes down as a solid block.
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP + drop * ROW_H)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
  ctx.fillRect(0, DANGER, canvas.width, 2)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }
  for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)

  if (state === 'playing') guide()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 21)
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + best, canvas.width - 10, 21)
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(40, 200, canvas.width - 80, 90)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(state === 'won' ? 'Board cleared!' : 'The bubbles reached you', canvas.width / 2, 238)
    ctx.font = '16px sans-serif'
    ctx.fillText('Space or tap to play again', canvas.width / 2, 268)
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
