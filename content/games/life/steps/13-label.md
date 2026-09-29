---
title: Show the generation
title_tr: Nesli göster
skills: [game.canvas]
---

# --goal--

We write the counter in the strip above the grid: `Generation 4`.

# --goal-tr--

Izgaranın üstünde boş bıraktığımız şeride sayacı yazıyoruz: `Generation 4` gibi. Canvas'a yazı da tıpkı kare gibi
çizilir: önce kalemi ayarla (renk, yazı tipi, hiza), sonra yaz.

# --code--

```js
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
}
```

# --meaning--

- `ctx.font` picks the size and style, `textAlign = 'left'` puts the text's left end at `x`.
- `fillText(text, x, y)` paints the text; `y` is the line the letters sit on.
- `'Generation ' + generation` joins a text and a number: `'Generation 4'`.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → yazı beyaz olsun.
- `ctx.font = 'bold 16px sans-serif'` → **kalın**, 16 piksel boyunda, düz (tırnaksız) bir yazı tipi.
- `ctx.textAlign = 'left'` → yazının **sol ucu** verdiğimiz `x`'e gelsin.
- `ctx.fillText('Generation ' + generation, 8, 24)` → yazıyı soldan 8, üstten 24. piksele yazar. `y`, harflerin
  üstüne oturduğu çizgidir.
- `'Generation ' + generation` → `+` bir **yazıyla** bir sayıyı yan yana ekler: `'Generation ' + 4` → `'Generation 4'`.
  Tırnağın içindeki boşluğa dikkat: o olmasa `Generation4` olurdu.

# --task--

At the end of `draw`, after the loops and before its last `}`, leave an empty line and write the four lines.

# --task-tr--

`draw`'un en sonunda, iki döngünün kapanışından (`  }`) sonra ve fonksiyonun son `}`'sinden önce bir boş satır bırak
ve dört satırı yaz. **Çalıştır**, oyuna tıkla ve **N**'ye bas: sol üstteki sayı artmalı.

# --hint--

The four lines must be inside `draw`, before its closing `}`; otherwise they run only once and are painted over.

# --hint-tr--

Dört satır `draw`'un **içinde**, son `}`'den önce olmalı; dışarıda kalırsa yalnız bir kez çalışır ve üstü boyanır.

# --tests--

`Generation 0` should be drawn at the top left, and grow with N.
tr: Sol üste `Generation 0` yazılmalı ve N ile artmalı.

```js
$.tick(1)
assert.include($.texts(), 'Generation 0')
$.press('n')
$.press('n')
$.tick(1)
assert.include($.texts(), 'Generation 2')
```

The text should be white, bold 16px, left-aligned at (8, 24).
tr: Yazı beyaz, kalın 16px ve (8, 24)'te sola hizalı olmalı.

```js
$.tick(1)
const call = $.screen().find((c) => c.op === 'fillText')
assert.deepEqual(call.args.slice(0, 3), ['Generation 0', 8, 24])
assert.strictEqual(call.fill, 'white')
assert.strictEqual(call.font, 'bold 16px sans-serif')
assert.strictEqual($.ctx.textAlign, 'left')
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
