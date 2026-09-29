---
title: Running or not
title_tr: Çalışıyor mu?
skills: [game.state]
---

# --goal--

We want to look at a pattern before it runs. A variable `playing` says whether the world is running; it starts as
`false`, and `update` only steps while it is `true`.

# --goal-tr--

Bir deseni çalışmadan önce incelemek, istediğimiz an durdurmak isteriz. Bunun için dünyanın **çalışıp
çalışmadığını** bir değişkende tutacağız: `playing`.

İçinde ya `true` (doğru) ya `false` (yanlış) olur; bir ışık düğmesi gibi: açık ya da kapalı. Başta kapalı olacak;
açmayı bir sonraki adımlarda bir tuşa bağlayacağız.

# --code--

```js
let playing

  playing = false

  if (playing && frames % SPEED === 0) step()
```

# --meaning--

- `playing` is `true` or `false`; `reset` sets it to `false`, so a new world waits.
- `playing && ...` in `update`: step only when playing **and** it is time.

# --meaning-tr--

- `let playing` → dünya çalışıyor mu? `true` ya da `false`.
- `reset` içinde `playing = false` → yeni bir dünya **durarak** başlar.
- `update` içinde `if (playing && frames % SPEED === 0)` → `&&` "**ve**": dünya çalışıyorsa **ve** sırası
  geldiyse ilerle. `playing` `false` ise ikinci kısma bakmaya bile gerek yok.

# --task--

1. Under `let generation` write `let playing`.
2. In `reset`, under `randomize()`, write `playing = false`.
3. In `update`, add `playing && ` at the start of the condition.

# --task-tr--

1. `let generation` satırının altına `let playing` yaz.
2. `reset` içinde `randomize()` satırının altına `playing = false` yaz.
3. `update` içindeki `if`'in parantezinin başına `playing && ` ekle.
4. **Çalıştır**: dünya yine duruyor olmalı. N ile yine tek tek ilerletebilirsin.

# --predict--

What will you see after Run?
- [x] The world stands still again
  `playing` is `false`, so `update` never steps.
- [ ] It runs as before
- [ ] The cells disappear

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [x] Dünya yine duruyor
  `playing` `false`, bu yüzden `update` hiç ilerlemiyor.
- [ ] Eskisi gibi çalışıyor
- [ ] Hücreler kayboluyor

# --tests--

A new world should wait: `playing` starts `false` and nothing moves.
tr: Yeni bir dünya beklemeli: `playing` `false` başlamalı ve hiçbir şey kıpırdamamalı.

```js
assert.isFalse(playing)
$.tick(60)
assert.strictEqual(generation, 0)
```

When `playing` is `true`, the world should run at one generation every `SPEED` frames.
tr: `playing` `true` olunca dünya her `SPEED` karede bir nesil ilerlemeli.

```js
playing = true
$.tick(60)
assert.strictEqual(generation, 10)
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

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') step()
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
