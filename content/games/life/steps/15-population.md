---
title: Count the living
title_tr: Canlıları say
skills: [prog.arrays]
---

# --goal--

How many cells are alive? `population()` adds up the whole grid with `reduce`, and we show it at the top right.

# --goal-tr--

Dünyada **kaç hücre canlı**? Hücreler `1` ya da `0` olduğu için bu soru "bütün ızgarayı topla" demek. Sonucu sağ üste
yazacağız: `Alive 123`. Nüfus sayımı gibi.

# --code--

```js
const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}
```

# --meaning--

- `reduce` turns a list into one value: `[1, 0, 1].reduce((a, b) => a + b, 0)` starts at 0 and adds each item: `2`.
- The inner `reduce` adds up one row; the outer one adds up the rows' sums.
- `textAlign = 'right'` puts the text's right end at `x`, 8 pixels from the right edge, so it never runs off.

# --meaning-tr--

- `reduce` bir listeyi **tek bir değere** indirir. `[1, 0, 1].reduce((a, b) => a + b, 0)` şöyle okunur: "`0`'dan
  başla; her elemanı (`b`) o ana kadarki toplama (`a`) ekle" → 0 + 1 + 0 + 1 = **2**.
- `row.reduce((a, b) => a + b, 0)` → **bir satırdaki** canlıları toplar.
- `grid.reduce((sum, row) => sum + ..., 0)` → dıştaki `reduce` her satırın toplamını `sum`'a ekler: bütün ızgara.
- `ctx.textAlign = 'right'` → yazının **sağ ucu** verdiğin `x`'e gelir. `canvas.width - 8` → sağ kenardan 8 piksel
  içeri. Yazı ne kadar uzarsa uzasın kenardan taşmaz.
- `population()` → fonksiyonu çağırır; dönen sayı `'Alive '`'ın yanına eklenir.

# --task--

1. Under `step`, after an empty line, write `population`.
2. In `draw`, under the `Generation` line, write the two new lines.

# --task-tr--

1. `step` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve `population` satırını yaz.
2. `draw` içinde `ctx.fillText('Generation ' ...` satırının hemen altına iki yeni satırı yaz.
3. **Çalıştır**: sağ üstte `Alive` ve bir sayı görmelisin; N'ye bastıkça değişir.

# --try--

Press N many times and watch `Alive`: the soup shrinks fast, then settles into still blocks and blinkers.

# --try-tr--

N'ye çok kez bas ve `Alive`'ı izle: çorba hızla azalır, sonra duran bloklar ve yanıp sönenlerle dengelenir.

# --tests--

`population()` should count the live cells.
tr: `population()` canlı hücreleri saymalı.

```js
grid = emptyGrid()
assert.strictEqual(population(), 0)
grid[0][0] = grid[1][1] = grid[47][59] = 1
assert.strictEqual(population(), 3)
```

The number of live cells should be drawn, right-aligned at the top right.
tr: Canlı hücre sayısı sağ üste, sağa hizalı yazılmalı.

```js
grid = emptyGrid()
grid[0][0] = grid[1][1] = 1
$.tick(1)
assert.include($.texts(), 'Alive 2')
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Alive 2')
assert.deepEqual(call.args.slice(1, 3), [472, 24])
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

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

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
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
