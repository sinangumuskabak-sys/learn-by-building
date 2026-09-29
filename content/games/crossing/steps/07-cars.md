---
title: Cars
title_tr: Arabalar
skills: [prog.arrays, game.canvas]
---

# --goal--

`items` works out where each car of a lane is right now: one every `spacing` tiles, slid by the lane's offset, wrapped
around the period. Then every car is drawn as a colored box.

# --goal-tr--

`items` bir şeritteki her arabanın **şu an** nerede olduğunu hesaplıyor: her `spacing` karede bir araba, şeridin
kayması (`offset`) kadar ötede, tekrar boyu (`period`) içinde başa sararak. Sonra her arabayı renkli bir kutu olarak
çiziyoruz.

# --code--

```js
// Left edges (in tiles) of the cars or logs in a lane right now.
function items(lane) {
  const p = period(lane)
  const xs = []
  for (let start = 0; start < p; start += lane.spacing) {
    xs.push((((start + lane.offset) % p) + p) % p - lane.len)
  }
  return xs
}

  for (const lane of LANES) {
    ctx.fillStyle = lane.color
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + 6, lane.len * TILE - 4, TILE - 12)
    }
  }
```

# --meaning--

- Cars start at 0, `spacing`, `2 × spacing`... up to the period.
- `((a % p) + p) % p` wraps any number into 0 to p, even a negative one (JavaScript's `%` keeps the sign).
- `- lane.len` shifts everything left by one car, so a car can be partly off the left edge.

# --meaning-tr--

- `for (let start = 0; start < p; start += lane.spacing)` → arabaların başlangıç yerleri: 0, `spacing`, 2 × `spacing`...
- `start + lane.offset` → şerit kaydıkça araba da kayar.
- `((... % p) + p) % p` → sayıyı 0 ile `p` arasına **sardırır**; eksi sayılarda da (JavaScript'in `%`'si eksi işareti
  korur, `+ p` ve yeniden `% p` bunu düzeltir).
- `- lane.len` → hepsini bir araba boyu sola kaydır: bir araba sol kenardan yarı dışarıda da görünebilsin.
- Çizim: `x * TILE + 2` ve `lane.len * TILE - 4` → arabalar arasında küçük boşluk; `+ 6`, `TILE - 12` → satırın ortasında.

# --task--

1. Under `period`, write the comment and `items`.
2. In `draw`, between the rows and the frog, draw the lanes.

# --task-tr--

1. `period` fonksiyonunun altına yorumu ve `items` fonksiyonunu yaz.
2. `draw` içinde satır döngüsü ile kurbağa arasına şerit döngüsünü yaz.
3. **Çalıştır**: yolda duran arabalar görmelisin.

# --tests--

`items` should give the left edge of every car in a lane.
tr: `items` bir şeritteki her arabanın sol kenarını vermeli.

```js
assert.deepEqual(items(LANES[0]), [-1, 3, 7, 11])
LANES[0].offset = -2
assert.deepEqual(items(LANES[0]), [13, 1, 5, 9])
```

The cars should be drawn in their lanes.
tr: Arabalar şeritlerinde çizilmeli.

```js
$.tick()
const red = $.rects('#ef4444')
assert.lengthOf(red, 4)
assert.deepEqual(red[1], { x: 3 * 40 + 2, y: 40 + 7 * 40 + 6, w: 36, h: 28, color: '#ef4444' })
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
for (const lane of LANES) lane.offset = 0

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
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
