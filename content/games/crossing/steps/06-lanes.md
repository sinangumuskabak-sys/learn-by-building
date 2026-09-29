---
title: Lanes of traffic
title_tr: Trafik şeritleri
skills: [prog.arrays]
---

# --goal--

Each road row is a lane: which row, how fast, how long its cars are, how far apart. A lane's pattern repeats every
`period` tiles, a whole number of car spacings that is wider than the screen.

# --goal-tr--

Her yol satırı bir **şerit**: hangi satır, ne kadar hızlı, arabaları ne kadar uzun ve ne sıklıkta. Bir şeritteki
arabalar eşit aralıkla dizilir ve desen **tekrar eder**. Tekrarın boyu (`period`) arabaların aralığının tam katı ve
ekrandan (artı bir araba) geniş olmalı; yoksa arabalar ekranın içinde birden kaybolup belirirdi.

Bu adımda yalnız bilgiyi ve hesabı yazıyoruz; arabaları sonraki adımda çiziyoruz.

# --code--

```js
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

for (const lane of LANES) lane.offset = 0

// A lane repeats every `period` tiles, which is always wider than the screen plus one car or log.
function period(lane) {
  return lane.spacing * Math.ceil((COLS + lane.len) / lane.spacing)
}
```

# --meaning--

- Each lane is an object: its row, speed in tiles per frame (negative = left), car length and spacing in tiles, and color.
- `offset` is how far the lane has slid; it starts at 0.
- `Math.ceil` rounds up: `(12 + 1) / 4 = 3.25` becomes 4, so the first lane repeats every 16 tiles.

# --meaning-tr--

- `LANES` → şeritlerin listesi. Her şerit bir nesne: `row` satır, `speed` karede kaç kare kaydığı (eksi: sola), `len`
  arabanın uzunluğu, `spacing` iki arabanın başları arası (kare), `color` renk.
- `for (const lane of LANES) lane.offset = 0` → her şeride `offset` (kayma miktarı) alanı ekle; başta 0.
- `Math.ceil(...)` → **yukarı** yuvarlar: `(12 + 1) / 4 = 3,25` → 4. Böylece ilk şerit her `4 × 4 = 16` karede tekrar
  eder: 12 karelik ekrandan ve bir arabadan geniş.

# --task--

1. Under the rows comment, write the comment and `LANES`.
2. Under `frog`, write the `offset` line, the comment and `period`.

# --task-tr--

1. `// Rows from the top ...` yorumunun altına yeni yorumu ve `LANES` listesini yaz.
2. `frog` satırının altına `offset` satırını, bir boş satırdan sonra yorumu ve `period` fonksiyonunu yaz.
3. **Çalıştır**.

# --tests--

There should be five road lanes, each starting at offset 0.
tr: Beş yol şeridi olmalı, her biri 0 kaymayla başlamalı.

```js
assert.lengthOf(LANES, 5)
assert.deepEqual(LANES.map((l) => l.row), [7, 8, 9, 10, 11])
assert.isTrue(LANES.every((l) => l.offset === 0))
```

`period` should be a whole number of spacings, wider than the screen plus a car.
tr: `period` aralığın tam katı olmalı ve ekrandan artı bir arabadan geniş olmalı.

```js
assert.strictEqual(period(LANES[0]), 16)
assert.strictEqual(period(LANES[1]), 18)
for (const lane of LANES) {
  assert.strictEqual(period(lane) % lane.spacing, 0)
  assert.isAtLeast(period(lane), 12 + lane.len)
}
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

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
