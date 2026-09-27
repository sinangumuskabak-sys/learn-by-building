---
title: Four rules
title_tr: Dört kural
skills: [prog.loops, game.state]
---

# --explanation--

Each generation, every cell looks at its **8 neighbours** (sides and corners) and counts how many are alive. Then:

- a live cell with **fewer than 2** live neighbours dies, of loneliness;
- a live cell with **2 or 3** survives;
- a live cell with **more than 3** dies, of overcrowding;
- a dead cell with **exactly 3** comes alive.

That fits in one line: the cell is alive next time if it has 3 neighbours, or if it has 2 and is alive now.

```js
next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
```

The important detail is `next`. All cells change **at the same moment**. If we wrote the new values straight into `grid`,
the cells we visit later would count neighbours that have *already* changed, and the patterns would fall apart. So we read
only from `grid`, write only into a new grid, and swap them at the end. This is called **double buffering**, and games use
it for the screen too.

To count the neighbours, two small loops run `dr` and `dc` from `-1` to `1`, skipping `(0, 0)` (the cell itself) and any
neighbour off the board.

# --explanation-tr--

Her nesilde her hücre **8 komşusuna** (yanlar ve köşeler) bakar ve kaçının canlı olduğunu sayar. Sonra:

- **2'den az** canlı komşusu olan canlı bir hücre yalnızlıktan ölür;
- **2 ya da 3** komşusu olan canlı bir hücre hayatta kalır;
- **3'ten fazla** komşusu olan canlı bir hücre kalabalıktan ölür;
- **tam 3** komşusu olan ölü bir hücre canlanır.

Bu tek satıra sığar: 3 komşusu varsa ya da 2 komşusu varsa ve şimdi canlıysa, hücre bir sonraki sefer canlıdır.

```js
next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
```

Önemli ayrıntı `next`. Bütün hücreler **aynı anda** değişir. Yeni değerleri doğrudan `grid`'e yazsaydık, sonra ziyaret
ettiğimiz hücreler *zaten* değişmiş komşuları sayardı ve desenler dağılırdı. Bu yüzden yalnızca `grid`'den okur, yalnızca yeni
bir ızgaraya yazar ve sonunda yer değiştiririz. Buna **çift tamponlama** denir; oyunlar onu ekran için de kullanır.

Komşuları saymak için iki küçük döngü `dr` ve `dc`'yi `-1`'den `1`'e götürür; `(0, 0)`'ı (hücrenin kendisini) ve tahtanın
dışındaki komşuları atlar.

# --task--

1. Write `countNeighbors(r, c)`: the number of live cells among the 8 around `(r, c)`, skipping those off the board.
2. Add `generation` (`0` in `randomize()`). Write `step()`: build `next` with the rule above from an `emptyGrid()`, then set
   `grid = next` and add 1 to `generation`.
3. The N key calls `step()` (either case).
4. Draw `Generation 4` at `(8, 24)`: white, `'bold 16px sans-serif'`, left-aligned.

# --task-tr--

1. `countNeighbors(r, c)` yaz: `(r, c)`'nin çevresindeki 8 hücre arasındaki canlı hücre sayısı; tahtanın dışındakileri atla.
2. `generation` ekle (`randomize()`'da `0`). `step()` yaz: yukarıdaki kuralla bir `emptyGrid()`'den `next`'i kur, sonra
   `grid = next` yap ve `generation`'a 1 ekle.
3. N tuşu `step()`'i çağırır (büyük ya da küçük harf).
4. `(8, 24)`'e `Generation 4` çiz: beyaz, `'bold 16px sans-serif'`, sola hizalı.

# --tests--

`countNeighbors` should count the live cells around a cell, but not the cell itself.
tr: `countNeighbors` bir hücrenin çevresindeki canlı hücreleri saymalı, ama hücrenin kendisini değil.

```js
grid = emptyGrid()
grid[10][10] = grid[10][11] = grid[11][10] = 1
assert.strictEqual(countNeighbors(10, 10), 2, 'a cell does not count itself')
assert.strictEqual(countNeighbors(11, 11), 3)
assert.strictEqual(countNeighbors(12, 12), 0)
assert.strictEqual(countNeighbors(9, 9), 1)
```

A blinker should flip back and forth, a block should stay, and a lonely cell should die.
tr: Bir yanıp sönen ileri geri dönmeli, bir blok kalmalı ve yalnız bir hücre ölmeli.

```js
grid = emptyGrid()
grid[5][4] = grid[5][5] = grid[5][6] = 1 // a blinker
grid[20][20] = grid[20][21] = grid[21][20] = grid[21][21] = 1 // a block
grid[30][30] = 1 // alone
$.press('n')
assert.strictEqual(generation, 1)
assert.deepEqual([grid[4][5], grid[5][5], grid[6][5], grid[5][4], grid[5][6]], [1, 1, 1, 0, 0], 'the blinker turns upright')
assert.deepEqual([grid[20][20], grid[20][21], grid[21][20], grid[21][21]], [1, 1, 1, 1], 'the block stays')
assert.strictEqual(grid[30][30], 0, 'a lonely cell dies')
$.press('N')
assert.deepEqual([grid[5][4], grid[5][5], grid[5][6], grid[4][5]], [1, 1, 1, 0], 'and back')
assert.strictEqual(grid.flat().filter((cell) => cell).length, 7)
```

A glider should move one cell diagonally every four generations, which only works if all cells change together.
tr: Bir planör her dört nesilde bir hücre çapraz ilerlemeli; bu yalnızca bütün hücreler birlikte değişirse işler.

```js
grid = emptyGrid()
for (const [r, c] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) grid[r][c] = 1 // a glider
for (let i = 0; i < 4; i++) step()
const cells = []
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) cells.push(r + ',' + c)
assert.sameMembers(cells, ['2,3', '3,4', '4,2', '4,3', '4,4'], 'the glider moved one cell down and right: every cell must change at the same time')
$.tick(1)
assert.include($.texts(), 'Generation 4')
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
