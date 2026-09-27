---
title: A guide that bounces
title_tr: Seken bir kılavuz
skills: [game.physics, game.state]
---

# --explanation--

Bank shots, bouncing off a wall to reach a gap, are the heart of the game, but hard to judge by eye. So the short aim line becomes
a **guide**: a dotted path that follows the exact rules of a real shot, bouncing off the walls, and stops where the bubble would
first touch something.

It is a small **simulation**: a pretend bubble moves in steps of 4 pixels with the same wall rule and the same `touches` test as the
real one, and a dot is drawn every fifth step. Because it uses the very same rules, the guide can never lie.

One more kindness: the shooter only offers colors **still on the board**. Late in a game only two or three colors remain, and
getting a bubble of a color that is gone would be a wasted shot you could do nothing about. A `Set` of the grid's colors gives the
choices. When the board is empty, any color will do.

Finally, the best score is kept in `localStorage`.

# --explanation-tr--

Bir boşluğa ulaşmak için duvardan sekerek yapılan bant atışları oyunun kalbidir ama gözle kestirmesi zordur. Bu yüzden kısa nişan
çizgisi bir **kılavuz** olur: gerçek bir atışın kurallarını tam olarak izleyen, duvarlardan seken ve balonun ilk bir şeye değeceği
yerde duran noktalı bir yol.

Bu küçük bir **simülasyondur**: hayali bir balon, gerçeğiyle aynı duvar kuralı ve aynı `touches` testiyle 4 piksellik adımlarla
hareket eder ve her beşinci adımda bir nokta çizilir. Aynı kuralları kullandığı için kılavuz asla yalan söyleyemez.

Bir incelik daha: atıcı yalnızca **tahtada hâlâ olan** renkleri sunar. Oyunun sonlarına doğru yalnızca iki ya da üç renk kalır ve
artık olmayan bir renkte balon almak, hiçbir şey yapamayacağın boşa bir atış olurdu. Izgaradaki renklerden bir `Set` seçenekleri
verir. Tahta boşken herhangi bir renk olur.

Son olarak en iyi puan `localStorage`'da tutulur.

# --task--

1. Replace `pickColor` with one that picks among the colors still in the grid (or any color when it is empty).
2. Write `guide()`: from the shooter, step a point 4 pixels along the aim (bouncing `vx` off the side walls) up to 200 times, stop
   when `touches` it, and draw a `'rgba(255, 255, 255, 0.5)'` 3 by 3 dot every fifth step. It replaces the aim line.
3. Keep `best` in `localStorage` under `'bubbles-best'`, saved when a game ends with a higher score, and draw `Best 1100`
   right-aligned at `(canvas.width - 10, 21)`.

# --task-tr--

1. `pickColor`'ı ızgarada hâlâ olan renkler arasından (boşken herhangi bir renkten) seçen biriyle değiştir.
2. `guide()` yaz: atıcıdan bir noktayı nişan boyunca 4 piksel (`vx`'i yan duvarlardan sektirerek) en fazla 200 kez ilerlet, `touches`
   ona değince dur ve her beşinci adımda `'rgba(255, 255, 255, 0.5)'` 3'e 3 bir nokta çiz. Nişan çizgisinin yerini alır.
3. `best`'i `localStorage`'da `'bubbles-best'` adıyla tut; bir oyun daha yüksek bir puanla bittiğinde kaydet ve
   `(canvas.width - 10, 21)`'e sağa hizalı `Best 1100` çiz.

# --tests--

The shooter should only offer colors still on the board.
tr: Atıcı yalnızca tahtada hâlâ olan renkleri sunmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][0] = grid[3][4] = 3
for (let i = 0; i < 20; i++) assert.strictEqual(pickColor(), 3, 'only colors still on the board')
empty()
const all = new Set()
for (let i = 0; i < 100; i++) all.add(pickColor())
assert.strictEqual(all.size, 5, 'any color on an empty board')
```

The guide should stop at the ceiling, and bounce off the walls.
tr: Kılavuz tavanda durmalı ve duvarlardan sekmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
aim = -Math.PI / 2
$.tick(1)
const dots = $.rects('rgba(255, 255, 255, 0.5)')
assert.isAbove(dots.length, 15)
assert.isAbove(Math.min(...dots.map((d) => d.y)), 30, 'the guide stops at the ceiling')
aim = -Math.PI + 0.3
$.tick(1)
const bouncing = $.rects('rgba(255, 255, 255, 0.5)')
assert.isAtLeast(Math.min(...bouncing.map((d) => d.x)), R - 2, 'it bounces off the wall too')
assert.isAbove(Math.max(...bouncing.map((d) => d.x)), 60, 'and comes back')
```

The best score should be saved.
tr: En iyi puan kaydedilmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][3] = grid[0][4] = 2
score = 70
attach(0, 5, 2)
assert.strictEqual(best, 1100)
assert.strictEqual(localStorage.getItem('bubbles-best'), '1100')
$.tick(1)
assert.include($.texts(), 'Best 1100')
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
  if (state !== 'playing') return reset()
  pointAt(event)
})
canvas.addEventListener('pointerup', () => shoot())

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
