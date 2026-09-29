---
title: One place for the buttons
title_tr: Düğmeler için tek bir yer
skills: [prog.functions, game.state]
---

# --goal--

Soon there will be keys and on-screen buttons doing the same things. So every action goes through one function,
`press(button)`: `'Play'` starts or stops the world, `'Step'` stops it and advances one generation.

# --goal-tr--

Birazdan hem klavye tuşları hem de ekranda düğmeler olacak ve ikisi **aynı işleri** yapacak. "Play ne yapar?"
sorusunun cevabı iki ayrı yerde olursa bir gün biri değişir, öteki unutulur.

Bu yüzden bütün işleri **tek bir fonksiyon** yapacak: `press(button)`. Bir kumandadaki düğmeler gibi: hangi tuşa
basarsan bas, kararı içerideki tek devre verir.

- `'Play'` → dünyayı başlatır ya da durdurur.
- `'Step'` → dünyayı durdurur ve **bir** nesil ilerletir (tek bir nesle bakmak istiyorsan dünyanın durması gerekir).

# --code--

```js
function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  }
}
```

# --meaning--

- `button` is the name of the button pressed.
- `!playing` is the opposite of `playing`, so `'Play'` flips it on and off.
- `else if` checks the next case only when the first one was not true.

# --meaning-tr--

- `function press(button)` → `button` parametresi basılan düğmenin **adı**: `'Play'` ya da `'Step'`.
- `playing = !playing` → `!` "**tersi**" demektir: `!true` → `false`, `!false` → `true`. Açıksa kapatır, kapalıysa
  açar; ışık düğmesi gibi.
- `else if (button === 'Step') {` → `else` "**değilse**": "Play ise şunu yap; değilse ve Step ise bunu yap".
- `playing = false` ve `step()` → önce durdur, sonra bir nesil ilerlet.

# --task--

Write `press` above the `keydown` listener, with an empty line between them.

# --task-tr--

`document.addEventListener('keydown', ...` satırının **üstüne** `press` fonksiyonunu yaz; aralarında bir boş satır
kalsın. **Çalıştır**: henüz hiçbir tuş `press`'i çağırmıyor, onu bir sonraki adımda bağlayacağız.

# --tests--

`press('Play')` should start the world and a second `press('Play')` should stop it.
tr: `press('Play')` dünyayı başlatmalı, ikinci `press('Play')` durdurmalı.

```js
press('Play')
assert.isTrue(playing)
$.tick(60)
assert.strictEqual(generation, 10)
press('Play')
assert.isFalse(playing)
$.tick(60)
assert.strictEqual(generation, 10, 'paused')
```

`press('Step')` should pause the world and advance one generation.
tr: `press('Step')` dünyayı duraklatmalı ve bir nesil ilerletmeli.

```js
press('Play')
$.tick(SPEED * 2)
press('Step')
assert.isFalse(playing, 'stepping pauses')
assert.strictEqual(generation, 3)
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
