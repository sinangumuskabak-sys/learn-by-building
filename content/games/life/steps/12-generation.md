---
title: Count the generations
title_tr: Nesilleri say
skills: [game.state]
---

# --goal--

How old is the world? A counter `generation` starts at 0 with every new soup and grows by 1 with every step.

# --goal-tr--

Dünya kaç nesil yaşadı? Bunu bir **sayaçta** tutacağız: `generation`. Her yeni rastgele çorbada 0'dan başlar,
her `step`'te 1 artar. Bu adımda sadece sayıyoruz; ekrana bir sonraki adımda yazacağız.

# --code--

```js
let generation

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

  grid = next
  generation += 1
}
```

# --meaning--

- `let generation` declares the counter.
- `randomize` sets it to 0: a new world starts at generation 0.
- `generation += 1` at the end of `step` adds one for each new generation.

# --meaning-tr--

- `let generation` → sayacın kutusu. Değeri değişeceği için `let`.
- `randomize` içindeki `generation = 0` → yeni bir çorba **0. nesilden** başlar.
- `step`'in sonundaki `generation += 1` → "sayaca 1 ekle". `+=` "üstüne ekle" demektir: 4 → 5.

# --task--

1. Under `let grid ...` write `let generation`.
2. At the end of `randomize`, write `generation = 0`.
3. At the end of `step`, under `grid = next`, write `generation += 1`.

# --task-tr--

1. `let grid // ...` satırının hemen altına `let generation` yaz.
2. `randomize` içinde, `grid = grid.map(...)` satırının altına `generation = 0` yaz.
3. `step`'in en sonunda, `grid = next` satırının altına `generation += 1` yaz.
4. **Çalıştır**: ekran değişmez; kontroller yeşil olmalı.

# --tests--

`generation` should start at 0 and grow by 1 with each N.
tr: `generation` 0'dan başlamalı ve her N ile 1 artmalı.

```js
assert.strictEqual(generation, 0)
$.press('n')
$.press('n')
$.press('n')
assert.strictEqual(generation, 3)
```

A new random soup should start again at generation 0.
tr: Yeni bir rastgele çorba yeniden 0. nesilden başlamalı.

```js
step()
step()
randomize()
assert.strictEqual(generation, 0)
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

let grid // grid[row][col]: 1 alive, 0 dead
let generation

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function reset() {
  grid = emptyGrid()
  randomize()
}

// Live neighbours among the 8 around (r, c), skipping those off the board.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) count += grid[nr][nc]
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

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
})

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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
