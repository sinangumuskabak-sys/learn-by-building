---
title: Flood fill
title_tr: Taşan boya (flood fill)
skills: [prog.loops, prog.arrays]
---

# --goal--

`connected` finds every cell reachable from a start through neighbours that pass a test, like paint spreading: a
queue of cells to visit and a set of cells already seen.

# --goal-tr--

Değen aynı renkli balonların **hepsini** bulmak için boya kovası gibi çalışan bir fonksiyon yazıyoruz: bir hücreden
başla, komşularına yayıl, onların komşularına yayıl... Bir **kuyruk** (sırada bekleyen hücreler) ve bir **küme**
(zaten gördüklerimiz) tutacağız. Bu yönteme **flood fill** (taşan boya) denir; resim programlarındaki boya kovası
tam olarak budur.

Hangi hücrelere yayılacağını bir **test fonksiyonu** söyleyecek; böylece aynı fonksiyonu ileride başka işler için de
kullanabileceğiz.

# --code--

```js
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
```

# --meaning--

- `seen` holds cells as single numbers (`r * COLS + c`); the starts count as seen.
- While the queue is not empty, take the first cell and look at its neighbours.
- A neighbour that is new and passes `test` is marked seen and joins the queue.
- At the end every seen number is turned back into `[r, c]`.

# --meaning-tr--

- `starts` → başlangıç hücreleri listesi; `test` → "bu hücreye yayılabilir miyim?" diye soran bir fonksiyon.
- `r * COLS + c` → bir hücreyi tek sayıya çevirir: (2, 3) → 23. Kümede aramak kolaylaşır.
- `const seen = new Set(...)` → gördüğümüz hücreler; başlangıçlar zaten görülmüş sayılır.
- `const queue = [...starts]` → sırada bekleyenler (başlangıçların kopyası).
- `while (queue.length)` → kuyrukta hücre olduğu sürece dön.
- `queue.shift()` → kuyruğun **başındakini** al (ve kuyruktan çıkar).
- `if (seen.has(...) || !test(nr, nc)) continue` → daha önce gördüysek **ya da** test geçmiyorsa atla.
- `seen.add(...)`, `queue.push(...)` → yeni hücreyi kaydet ve kuyruğun **sonuna** ekle; sırası gelince onun komşularına
  da bakılacak.
- Son satır sayıları geri `[r, c]` çiftlerine çevirir: `Math.floor(k / COLS)` satır, `k % COLS` sütun.

# --task--

Under `snap`, write the comment and `connected`.

# --task-tr--

`snap` fonksiyonunun altına bir boş satır bırakıp yorumu ve `connected` fonksiyonunu yaz. **Çalıştır**.

# --predict--

In a row `2 2 3 2`, starting at the first cell and spreading through color 2, how many cells are found?
- [ ] 3: every 2
  The last 2 is not touching the others: the 3 is in the way.
- [x] 2
- [ ] 4

# --predict-tr--

`2 2 3 2` dizilişli bir satırda, ilk hücreden başlayıp 2 rengine yayılınca kaç hücre bulunur?
- [ ] 3: bütün 2'ler
  Sondaki 2 ötekilere değmiyor: araya 3 giriyor.
- [x] 2
- [ ] 4

# --tests--

`connected` should find a touching group of one color, and nothing past it.
tr: `connected` tek renkli değen bir grubu bulmalı, ötesini değil.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 2
grid[0][1] = 2
grid[1][0] = 2
grid[0][2] = 3
grid[0][4] = 2
const group = connected([[0, 0]], (r, c) => grid[r][c] === 2)
assert.deepEqual(group.map(String).sort(), ['0,0', '0,1', '1,0'])
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
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

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

function attach(r, c, color) {
  grid[r][c] = color
}

function update() {
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
