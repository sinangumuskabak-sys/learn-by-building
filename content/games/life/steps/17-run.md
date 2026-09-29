---
title: Let it live
title_tr: Yaşasın
skills: [game.loop]
---

# --goal--

Every turn of the loop first updates the world, then draws it. One line, and the world comes alive.

# --goal-tr--

Her oyun döngüsünün iki işi vardır: önce **güncelle** (dünyayı değiştir), sonra **çiz** (göster). Tek bir satırla
`update`'i döngüye bağlıyoruz ve dünya canlanıyor.

# --code--

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `update()` runs every frame before `draw()`: the world changes first, then the new picture is painted.

# --meaning-tr--

- `update()` → her karede, **çizimden önce** çalışır: önce dünya güncellenir, sonra yeni hâli çizilir. Sıra ters
  olsaydı ekran hep bir nesil geriden gelirdi.

# --task--

In `loop`, write `update()` on the line above `draw()`.

# --task-tr--

`loop` içinde `draw()` satırının **üstüne** `update()` yaz. **Çalıştır** ve izle.

# --predict--

How fast will the world live?
- [ ] 60 generations a second
- [x] 10 generations a second
  It steps only on every 6th frame: 60 ÷ 6 = 10.
- [ ] 1 generation a second

# --predict-tr--

Dünya ne hızla yaşayacak?
- [ ] Saniyede 60 nesil
- [x] Saniyede 10 nesil
  Yalnız her 6. karede ilerliyor: 60 ÷ 6 = 10.
- [ ] Saniyede 1 nesil

# --try--

Set `SPEED` to `30` and run: 2 generations a second, easy to follow. Then try `1`. Put `6` back.

# --try-tr--

`SPEED`'i `30` yap ve çalıştır: saniyede 2 nesil, rahatça izlenir. Sonra `1`'i dene. En son `6`'ya geri al.

# --tests--

The world should advance one generation every `SPEED` frames.
tr: Dünya her `SPEED` karede bir nesil ilerlemeli.

```js
$.tick(60)
assert.strictEqual(generation, 60 / SPEED)
$.tick(1)
assert.include($.texts(), 'Generation 10')
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let frames

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function reset() {
  grid = emptyGrid()
  randomize()
  frames = 0
}

// Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
    }
  }
  return count
}

// Every cell changes at the same moment, so the next generation is built in a new grid.
function step() {
  const next = emptyGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
    }
  }
  grid = next
  generation += 1
}

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
})

function update() {
  frames += 1
  if (frames % SPEED === 0) step()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
