---
title: A world without edges
title_tr: Kenarsız bir dünya
skills: [prog.arrays]
---

# --goal--

At the edges a glider crashes and turns into a block. We make the world wrap around instead: the column after the
last one is the first, the row above the top is the bottom. The `%` (remainder) operator does it.

# --goal-tr--

Şu an kenarlar duvar gibi: kayarak ilerleyen bir desen kenara çarpınca bozulur. Birçok Hayat Oyunu programı dünyayı
**başa saran** (wrap around) yapar: son sütunun sağı ilk sütundur, en üst satırın üstü en alt satırdır. Eski video
oyunlarında ekranın sağından çıkıp solundan giren karakter gibi. Böyle bir dünyanın şekli **simittir** (torus).

Bunun için **kalan** işaretini kullanacağız: `%`.

# --code--

```js
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
```

# --meaning--

- `a % b` is the remainder of `a / b`: `60 % 60` is `0`, so column 60 becomes column 0.
- `-1 % 60` is still `-1` in JavaScript, so we add `COLS` first: `(-1 + 60) % 60` is `59`, the last column. When it
  is not needed it does no harm: `(5 + 60) % 60` is `5`.
- Every neighbour now lands on the board, so the "is it on the board?" check goes away.

# --meaning-tr--

- `a % b` → `a`'yı `b`'ye böldüğünde **kalanı** verir: `7 % 3` = 1, `60 % 60` = 0, `5 % 60` = 5. Sütun 60 olursa
  (tahtanın dışı) `60 % 60` ile **0'a**, yani en sola döner.
- Bir sorun var: sola taşınca sütun `-1` olur ve JavaScript'te `-1 % 60` yine `-1`'dir. Çözüm, önce `COLS` eklemek:
  `(-1 + 60) % 60` = **59**, yani en sağ sütun. Gerek yoksa da zarar vermez: `(5 + 60) % 60` = 5.
- `grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]` → satır için aynısı `ROWS` ile. Her komşu artık tahtada
  bir yere denk gelir; "tahtanın içinde mi?" sorusuna gerek kalmadı.
- Üstteki yorum da yeni davranışı anlatacak şekilde değişti.

# --task--

In `countNeighbors`, replace the lines `const nr`, `const nc` and the long `if` with the single wrapping line, and
update the comment above the function.

# --task-tr--

1. `countNeighbors`'ın üstündeki yorumu kodda görüldüğü gibi değiştir.
2. `const nr = ...`, `const nc = ...` ve uzun `if (nr >= 0 ...` satırlarını **sil**; yerine tek `count += ...`
   satırını yaz.
3. **Çalıştır**, oyuna tıkla ve N'ye bas: kenara gelen desenler karşı taraftan devam eder.

# --predict--

A glider moves one cell diagonally every 4 generations. On this 48 × 60 world, when is it back where it started?
- [ ] Never, it leaves the world
- [ ] After 240 generations
- [x] After 960 generations
  It needs a number of cells both 48 and 60 divide: 240. Four generations per cell makes 960.

# --predict-tr--

Bir planör her 4 nesilde bir hücre çapraz kayar. Bu 48 × 60'lık dünyada başladığı yere ne zaman döner?
- [ ] Hiç dönmez, dünyadan çıkıp gider
- [ ] 240 nesil sonra
- [x] 960 nesil sonra
  Hem 48'in hem 60'ın tam böldüğü bir hücre sayısı gerekir: 240. Hücre başına 4 nesil: 960.

# --hint--

Add `ROWS` (or `COLS`) **before** taking `%`, so `-1` becomes the last row or column instead of staying negative.

# --hint-tr--

`%` almadan **önce** `ROWS` (ya da `COLS`) ekle; böylece `-1` eksi kalmaz, son satır ya da sütun olur.

# --tests--

Cells on opposite edges should be neighbours.
tr: Karşı kenarlardaki hücreler komşu olmalı.

```js
grid = emptyGrid()
grid[47][59] = grid[0][59] = grid[47][0] = 1
assert.strictEqual(countNeighbors(0, 0), 3, 'the corners touch across the edges')
grid = emptyGrid()
grid[20][59] = 1
assert.strictEqual(countNeighbors(20, 0), 1)
assert.strictEqual(countNeighbors(20, 58), 1)
```

A glider should travel around the world and come back to where it started after 960 generations.
tr: Bir planör dünyanın çevresini dolaşmalı ve 960 nesil sonra başladığı yere dönmeli.

```js
grid = emptyGrid()
for (const [r, c] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) grid[r][c] = 1
const start = grid.flat().join('')
for (let i = 0; i < 960; i++) step()
assert.strictEqual(grid.flat().filter((cell) => cell === 1).length, 5, 'the glider is still whole')
assert.strictEqual(grid.flat().join(''), start, 'after 960 generations the glider is back')
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
