---
title: Play and pause
title_tr: Oynat ve duraklat
skills: [game.loop, game.input]
---

# --explanation--

Pressing N for every generation gets tiring. Now the world should run by itself, and **Space** starts and stops it.

At 60 frames per second one generation per frame is too fast to follow, so we count frames and step only on every
`SPEED`th one:

```js
frames += 1
if (playing && frames % SPEED === 0) step()
```

`frames % SPEED === 0` is true on frames 6, 12, 18 and so on: with `SPEED = 6`, that is 10 generations per second. A bigger
`SPEED` means a slower world.

Keys now go through one function, `press(button)`, with a small table from keys to actions. That will pay off in the last
step, when on-screen buttons call the same `press`. N still steps once, and it also pauses: if you want to look at a single
generation, the world should stop.

# --explanation-tr--

Her nesil için N'ye basmak yorucu. Artık dünya kendi kendine işlemeli ve **Boşluk** onu başlatıp durdurmalı.

Saniyede 60 karede her karede bir nesil izlenemeyecek kadar hızlıdır, bu yüzden kareleri sayar ve yalnızca her `SPEED`'inci
karede ilerleriz:

```js
frames += 1
if (playing && frames % SPEED === 0) step()
```

`frames % SPEED === 0`; 6, 12, 18 gibi karelerde doğrudur: `SPEED = 6` ile bu saniyede 10 nesil eder. Daha büyük bir `SPEED`
daha yavaş bir dünya demektir.

Tuşlar artık tuşlardan eylemlere küçük bir tabloyla tek bir fonksiyondan geçer: `press(button)`. Bunun karşılığını ekrandaki
düğmelerin aynı `press`'i çağıracağı son adımda alacağız. N hâlâ bir kez ilerletir ve duraklatır da: tek bir nesle bakmak
istiyorsan dünya durmalıdır.

# --task--

1. Add `SPEED = 6`, and `playing` and `frames` (`false` and `0` in `reset()`).
2. Write `update()`, called before `draw()`: count `frames` up, and `step()` when `playing` and `frames % SPEED === 0`.
3. Write `press(button)`: `'Play'` flips `playing`; `'Step'` sets `playing = false` and calls `step()`.
4. On `keydown`, map `' '` to `'Play'` and `n` to `'Step'` (use `event.key.toLowerCase()`); for those keys call
   `preventDefault()` and `press`.

# --task-tr--

1. `SPEED = 6` ekle; ayrıca `playing` ve `frames` (`reset()`'te `false` ve `0`).
2. `draw()`'dan önce çağrılan `update()`'i yaz: `frames`'i artır ve `playing` iken `frames % SPEED === 0` olduğunda `step()` et.
3. `press(button)` yaz: `'Play'` `playing`'i tersine çevirir; `'Step'` `playing = false` yapar ve `step()`'i çağırır.
4. `keydown`'da `' '`'yu `'Play'`'e, `n`'yi `'Step'`'e eşle (`event.key.toLowerCase()` kullan); bu tuşlarda `preventDefault()`
   ve `press` çağır.

# --tests--

Space should start the world at one generation every `SPEED` frames, and stop it again.
tr: Boşluk dünyayı her `SPEED` karede bir nesille başlatmalı ve yeniden durdurmalı.

```js
assert.isFalse(playing)
$.press(' ')
assert.isTrue(playing)
$.tick(60)
assert.strictEqual(generation, 60 / SPEED)
$.press(' ')
$.tick(60)
assert.strictEqual(generation, 60 / SPEED, 'paused')
```

N should pause the world and step once.
tr: N dünyayı duraklatmalı ve bir kez ilerletmeli.

```js
$.press(' ')
$.tick(SPEED * 2)
$.press('n')
assert.isFalse(playing, 'stepping pauses')
assert.strictEqual(generation, 3)
$.tick(1)
assert.include($.texts(), 'Generation 3')
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

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  }
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step' }
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
