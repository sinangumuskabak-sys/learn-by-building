---
title: Best score
title_tr: En iyi skor
skills: [game.state]
---

# --goal--

The best score is saved in `localStorage` when a game ends and shown next to the score.

# --goal-tr--

Oyun bitince en iyi skor `localStorage`'a kaydedilsin ve skorun yanında görünsün.

# --code--

```js
let best = Number(localStorage.getItem('frogger-best')) || 0

  if (score > best) {
    best = score
    localStorage.setItem('frogger-best', best)
  }

  ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 27)
```

# --meaning--

- The record is read once when the page opens and saved when a game ends with a higher score.

# --meaning-tr--

- `localStorage.getItem('frogger-best')` → kayıtlı rekor; yoksa 0.
- `die` içinde, oyun bittiği anda: skor rekordan büyükse güncelle ve `setItem` ile kaydet.
- Skor yazısına `'  Best: ' + best` eklenir.

# --task--

1. Under `let furthest`, write `best`.
2. In `die`, save the record after `state = 'over'`.
3. In `draw`, add the best score to the score text.

# --task-tr--

1. `let furthest ...` satırının altına `best` satırını yaz.
2. `die` içinde `state = 'over'` satırının altına rekor bloğunu yaz.
3. `draw`'daki skor yazısına `+ '  Best: ' + best` ekle.
4. **Çalıştır**. Oyun bitti!

# --tests--

A game over with a new record should save it.
tr: Yeni rekorlu bir oyun sonu onu kaydetmeli.

```js
score = 120
lives = 1
die()
assert.strictEqual(best, 120)
assert.strictEqual(localStorage.getItem('frogger-best'), '120')
```

The best score should be shown.
tr: En iyi skor gösterilmeli.

```js
$.tick()
assert.include($.texts(), 'Score: 0 Best: 0')
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
const HOMES = [1, 4, 7, 10] // columns of the home slots in row 0
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 1, speed: 0.025, len: 3, spacing: 5, log: true },
  { row: 2, speed: -0.035, len: 4, spacing: 6, log: true },
  { row: 3, speed: 0.02, len: 2, spacing: 4, log: true },
  { row: 4, speed: -0.03, len: 3, spacing: 5, log: true },
  { row: 5, speed: 0.04, len: 4, spacing: 6, log: true },
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog
let lives
let state // 'playing' or 'over'
let level
let filled // one true/false per home
let score
let furthest // the highest row (smallest number) this frog has reached
let best = Number(localStorage.getItem('frogger-best')) || 0

function newFrog() {
  frog = { x: 5, y: START_ROW }
  furthest = START_ROW
}

function reset() {
  lives = 3
  state = 'playing'
  level = 1
  filled = HOMES.map(() => false)
  score = 0
  for (const lane of LANES) lane.offset = 0
  newFrog()
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
  const lane = laneAt(frog.y)
  // Back on solid ground: line up with the grid again.
  if (!lane || !lane.log) frog.x = Math.round(frog.x)
  if (frog.y < furthest) {
    furthest = frog.y
    score += 10
  }
  if (frog.y === 0) reachHome()
}

function reachHome() {
  const i = HOMES.indexOf(frog.x)
  if (i === -1 || filled[i]) {
    die()
    return
  }
  filled[i] = true
  score += 50
  if (filled.every(Boolean)) {
    level += 1
    score += 100
    filled = HOMES.map(() => false)
  }
  newFrog()
}

function die() {
  lives -= 1
  if (lives > 0) {
    newFrog()
    return
  }
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('frogger-best', best)
  }
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
  if (event.key === ' ' && state === 'over') reset()
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
  if (state === 'over') {
    reset()
  } else if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
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

function onLog(lane) {
  const middle = frog.x + 0.5
  return items(lane).some((x) => middle > x && middle < x + lane.len)
}

function update() {
  if (state !== 'playing') return
  // Each level is a quarter faster, up to twice the starting speed.
  const pace = Math.min(2, 1 + (level - 1) * 0.25)
  for (const lane of LANES) lane.offset += lane.speed * pace

  const lane = laneAt(frog.y)
  if (!lane) return
  if (!lane.log) {
    if (hitByCar(lane)) die()
    return
  }
  if (!onLog(lane)) {
    die()
    return
  }
  // The log carries the frog; being carried off the screen is a splash too.
  frog.x += lane.speed * pace
  if (frog.x < -0.5 || frog.x > COLS - 0.5) die()
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
  HOMES.forEach((col, i) => {
    ctx.fillStyle = '#1e3a8a'
    ctx.fillRect(col * TILE, TOP, TILE, TILE)
    if (filled[i]) {
      ctx.fillStyle = '#86efac'
      ctx.fillRect(col * TILE + 8, TOP + 8, TILE - 16, TILE - 16)
    }
  })

  for (const lane of LANES) {
    ctx.fillStyle = lane.log ? '#92400e' : lane.color
    const inset = lane.log ? 4 : 6
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + inset, lane.len * TILE - 4, TILE - inset * 2)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 27)
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '   Lives: ' + lives, canvas.width - 10, 27)

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

reset()
requestAnimationFrame(loop)
```
