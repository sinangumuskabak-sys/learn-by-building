---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

`draw` runs only once, so a new generation would never reach the screen. A loop redraws the picture about 60 times a
second with `requestAnimationFrame`.

# --goal-tr--

Şu an `draw` yalnız **bir kez**, en başta çalışıyor. Dünya değişse bile ekran eski resmi göstermeye devam ederdi.

Oyunlar bir **döngü** ile çalışır: çiz → tekrar çiz → tekrar çiz... Bir çizgi filmin kareleri gibi. Tarayıcı ekranı
saniyede yaklaşık **60 kez** yeniler; `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu fonksiyonu çalıştır"
der.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws once and books the next run with `requestAnimationFrame(loop)`, so it never stops.
- The last line starts the loop. It replaces the single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `draw()` → dünyanın şu anki hâlini çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon kendi
  devamını istiyor; böylece döngü hiç bitmez.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

At the bottom, write `loop` above `reset()` and replace `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `reset()` satırının **üstüne** `loop` fonksiyonunu yaz ve altında bir boş satır bırak.
2. En alttaki `draw()` satırını sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**: ekran aynı görünür, ama artık saniyede 60 kez yeniden çiziliyor.

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

A change in `grid` should reach the screen on the next frame.
tr: `grid`'deki bir değişiklik bir sonraki karede ekrana yansımalı.

```js
grid = emptyGrid()
grid[0][0] = 1
$.tick(1)
assert.deepEqual($.rects('#4ade80'), [{ x: 0, y: 36, w: 7, h: 7, color: '#4ade80' }])
step()
$.tick(1)
assert.lengthOf($.rects('#4ade80'), 0, 'after a step the lonely cell is gone from the screen')
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

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
