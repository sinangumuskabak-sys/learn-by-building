---
title: Clear and shuffle
title_tr: Temizle ve karıştır
skills: [game.input, game.state]
---

# --goal--

Two more buttons: `'Clear'` empties and stops the world (C), `'Random'` throws in a new soup (R).

# --goal-tr--

İki düğme daha: **Clear** (C) dünyayı boşaltıp durdurur; birazdan kendi desenlerini çizmek için temiz bir sayfa
gerekecek. **Random** (R) yeni bir rastgele çorba döker.

`press` sayesinde her yeni düğme aynı kalıpla eklenir: bir fonksiyon, `press`'te bir satır, tabloda bir tuş.

# --code--

```js
function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
}

  } else if (button === 'Random') randomize()
  else if (button === 'Clear') clear()
}

  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' }
```

# --meaning--

- `clear` puts an empty grid in place, sets the generation to 0 and stops the world.
- `press` gets two more cases, and the key table two more keys.

# --meaning-tr--

- `function clear() { ... }` → boş ızgara, `generation = 0` ve `playing = false`: temiz ve duran bir dünya.
- `press` içindeki `else if (button === 'Random') randomize()` → Random, zaten yazdığımız `randomize`'ı çağırır
  (o da nesli sıfırlıyor).
- `else if (button === 'Clear') clear()` → Clear, yeni `clear`'ı çağırır.
- Tabloya `r: 'Random'` ve `c: 'Clear'` eklendi.

# --task--

1. Under `randomize`, after an empty line, write `clear`.
2. In `press`, change `}` after `step()` to `} else if (button === 'Random') randomize()` and add the `'Clear'` line.
3. Add `r` and `c` to the key table.

# --task-tr--

1. `randomize` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve `clear` fonksiyonunu yaz.
2. `press` içinde `step()`'in altındaki `}` satırını `} else if (button === 'Random') randomize()` yap; altına
   `'Clear'` satırını yaz. Fonksiyonun son `}`'si yerinde kalır.
3. `keydown` içindeki tabloya `r: 'Random', c: 'Clear'` ekle.
4. **Çalıştır**, oyuna tıkla: **C** ızgarayı boşaltmalı, **R** yeniden doldurmalı.

# --tests--

C should clear and stop the world.
tr: C dünyayı temizleyip durdurmalı.

```js
$.press(' ')
$.tick(SPEED * 3)
$.press('c')
assert.strictEqual(population(), 0)
assert.strictEqual(generation, 0)
assert.isFalse(playing, 'clearing stops the game')
```

R should throw in a new random soup.
tr: R yeni bir rastgele çorba dökmeli.

```js
$.press('c')
$.press('r')
assert.isAbove(population(), 300)
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
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let playing
let frames

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
}

function reset() {
  grid = emptyGrid()
  randomize()
  playing = false
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

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  } else if (button === 'Random') randomize()
  else if (button === 'Clear') clear()
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function update() {
  frames += 1
  if (playing && frames % SPEED === 0) step()
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
