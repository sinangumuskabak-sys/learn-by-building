---
title: Logs on the river
title_tr: Nehirdeki kütükler
skills: [prog.arrays]
---

# --goal--

The river gets five lanes of floating logs. A log lane is just like a road lane, marked with `log: true`; logs are brown
and a little taller than cars.

# --goal-tr--

Nehre beş şerit **yüzen kütük** ekliyoruz. Kütük şeridi, yol şeridinin tıpkısı; yalnız `log: true` (kütük) işareti var.
Hareket eden, dizilen, tekrar eden her şey aynı koddan geliyor. Kütükler kahverengi ve arabalardan biraz kalın
çiziliyor.

# --code--

```js
{ row: 1, speed: 0.025, len: 3, spacing: 5, log: true },
{ row: 2, speed: -0.035, len: 4, spacing: 6, log: true },
{ row: 3, speed: 0.02, len: 2, spacing: 4, log: true },
{ row: 4, speed: -0.03, len: 3, spacing: 5, log: true },
{ row: 5, speed: 0.04, len: 4, spacing: 6, log: true },

  ctx.fillStyle = lane.log ? '#92400e' : lane.color
  const inset = lane.log ? 4 : 6
  for (const x of items(lane)) {
    ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + inset, lane.len * TILE - 4, TILE - inset * 2)
  }
```

# --meaning--

- The new lanes use the same `items` and move in the same `update`: no new code is needed for that.
- `inset` is the space above and below: 4 pixels for logs, 6 for cars.

# --meaning-tr--

- Beş yeni şerit `LANES`'in başına eklendi: satır 1–5, `log: true`. Renkleri yok, çünkü hepsi kahverengi.
- `lane.log ? '#92400e' : lane.color` → kütükse kahverengi, değilse şeridin rengi.
- `const inset = lane.log ? 4 : 6` → üstte ve altta bırakılan boşluk: kütükte 4, arabada 6 piksel. Yükseklik
  `TILE - inset * 2`.
- Kütükler de `items` ile yerleşiyor ve `update` ile kayıyor; bunun için yeni kod gerekmedi.

# --task--

1. Add the five log lanes at the top of `LANES`.
2. In `draw`, pick the color and the inset for logs.

# --task-tr--

1. `LANES` listesinin **başına** beş kütük şeridini yaz.
2. `draw`'daki şerit döngüsünde rengi ve `inset`'i koddaki gibi seç; `fillRect`'te `6` yerine `inset`, `TILE - 12` yerine
   `TILE - inset * 2` yaz.
3. **Çalıştır**. (Şimdilik kurbağa suyun üstünde yürüyebiliyor; sonraki adımda düzelecek.)

# --tests--

There should be five log lanes, drawn brown.
tr: Kahverengi çizilen beş kütük şeridi olmalı.

```js
assert.lengthOf(LANES.filter((l) => l.log), 5)
$.tick()
const logs = $.rects('#92400e')
assert.lengthOf(logs, 16)
assert.isTrue(logs.every((r) => r.h === 32))
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

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function reset() {
  lives = 3
  state = 'playing'
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

reset()
requestAnimationFrame(loop)
```
