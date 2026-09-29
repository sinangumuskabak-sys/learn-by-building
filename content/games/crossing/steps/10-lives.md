---
title: Three lives
title_tr: Üç can
skills: [game.state]
---

# --goal--

The frog has three lives. Each hit costs one; after the last, the game is over, nothing moves and a message covers the
board.

# --goal-tr--

Kurbağanın **üç canı** var. Her çarpma bir can götürür; son can da gidince oyun **biter**: hiçbir şey hareket etmez,
tahtanın üstüne bir mesaj gelir.

# --code--

```js
let lives = 3
let state = 'playing' // 'playing' or 'over'

function die() {
  lives -= 1
  if (lives > 0) {
    newFrog()
    return
  }
  state = 'over'
}

  if (state !== 'playing') return

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Lives: ' + lives, canvas.width - 10, 27)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
```

# --meaning--

- `die` takes a life; with lives left a new frog starts, otherwise the state becomes `'over'`.
- Both `hop` and `update` do nothing unless playing.
- The lives are shown top right; at game over a see-through dark layer and a message cover everything.

# --meaning-tr--

- `let lives = 3`, `let state = 'playing'` → can sayısı ve oyunun durumu.
- `die()` → `lives -= 1`; can kaldıysa yeni kurbağa ve `return`. Kalmadıysa `state = 'over'`.
- `hop` ve `update` başında `if (state !== 'playing') return` → oyun bitince zıplama da trafik de durur.
- Sağ üstte `Lives: 2` gibi yazı.
- `if (state === 'over')` → bütün tuvali kaplayan %75 koyu, yarı saydam bir perde; üstüne ortalanmış "Game Over" ve Boşluk ile yeniden oynama yazısı.

# --task--

1. Under `frog`, write `lives` and `state`.
2. Replace the body of `die`.
3. Make the state check the first line of `hop` and of `update`.
4. At the end of `draw`, write the lives text and the game over block.

# --task-tr--

1. `frog` satırının altına `lives` ve `state` satırlarını yaz.
2. `die` fonksiyonunun içini yeni satırlarla değiştir.
3. `hop` ve `update` fonksiyonlarının ilk satırı `if (state !== 'playing') return` olsun.
4. `draw`'ın sonuna, kurbağayı çizen satırın altına can yazısını ve bitiş bloğunu yaz.
5. **Çalıştır** ve üç kez ezil.

# --tests--

Each hit should cost a life; after the third the game is over.
tr: Her çarpma bir can götürmeli; üçüncüden sonra oyun bitmeli.

```js
die()
assert.strictEqual(lives, 2)
assert.deepEqual(frog, { x: 5, y: 12 })
die()
die()
assert.strictEqual(state, 'over')
$.tick()
assert.include($.texts(), 'Game Over')
```

After game over the frog should not hop.
tr: Oyun bitince kurbağa zıplamamalı.

```js
state = 'over'
$.tap('ArrowUp')
assert.strictEqual(frog.y, 12)
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog = { x: 5, y: START_ROW }
let lives = 3
let state = 'playing' // 'playing' or 'over'
for (const lane of LANES) lane.offset = 0

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function laneAt(row) {
  return LANES.find((lane) => lane.row === row)
}

// A lane repeats every `period` tiles, which is always wider than the screen plus one car or log.
function period(lane) {
  return lane.spacing * Math.ceil((COLS + lane.len) / lane.spacing)
}

// Left edges (in tiles) of the cars or logs in a lane right now.
function items(lane) {
  const p = period(lane)
  const xs = []
  for (let start = 0; start < p; start += lane.spacing) {
    xs.push((((start + lane.offset) % p) + p) % p - lane.len)
  }
  return xs
}

function hop(dx, dy) {
  if (state !== 'playing') return
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

function die() {
  lives -= 1
  if (lives > 0) {
    newFrog()
    return
  }
  state = 'over'
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
})

// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function hitByCar(lane) {
  return items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
}

function update() {
  if (state !== 'playing') return
  for (const lane of LANES) lane.offset += lane.speed

  const lane = laneAt(frog.y)
  if (!lane) return
  if (hitByCar(lane)) die()
}

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  for (const lane of LANES) {
    ctx.fillStyle = lane.color
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + 6, lane.len * TILE - 4, TILE - 12)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Lives: ' + lives, canvas.width - 10, 27)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
