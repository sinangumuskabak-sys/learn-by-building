---
title: Hit by a car
title_tr: Araba çarptı
skills: [game.collision]
---

# --goal--

If a car covers the frog's square, the frog is hit and a new one starts from the bottom. The frog's box is shrunk a
little, so only a real overlap counts.

# --goal-tr--

Bir araba kurbağanın karesine gelirse kurbağa **ezilir** ve yenisi en alttan başlar. Kurbağanın kutusunu her yandan
biraz **küçültüyoruz**: yalnız gerçekten üst üste binmek sayılsın, sıyırmak değil.

# --code--

```js
function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function laneAt(row) {
  return LANES.find((lane) => lane.row === row)
}

function die() {
  newFrog()
}

function hitByCar(lane) {
  return items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
}

  const lane = laneAt(frog.y)
  if (!lane) return
  if (hitByCar(lane)) die()
```

# --meaning--

- `laneAt` finds the lane in the frog's row, or `undefined` on the safe rows.
- A car from `x` to `x + len` overlaps the frog when the car starts before the frog ends and ends after it starts.
  The frog counts as 0.15 to 0.85 of its square.
- `die` just starts a new frog for now.

# --meaning-tr--

- `newFrog()` → kurbağayı başlangıca koyar.
- `LANES.find((lane) => lane.row === row)` → o satırdaki şeridi bul; güvenli satırlarda `undefined`.
- `if (!lane) return` → kurbağa güvenli bir satırdaysa kontrol edecek bir şey yok.
- `hitByCar` → şeritteki arabalardan **biri** (`some`) kurbağaya biniyor mu? Araba `x`'ten `x + len`'e; kurbağa
  karesinin 0,15'i ile 0,85'i arası sayılır:
  - `frog.x + 0.15 < x + lane.len` → kurbağanın solu arabanın sağından önce,
  - `frog.x + 0.85 > x` → kurbağanın sağı arabanın solundan sonra.
- `die()` → şimdilik yalnız yeni kurbağa. Canları sonraki adımda ekliyoruz.

# --task--

1. Under the `offset` line, write `newFrog` and `laneAt`.
2. Above `DIRECTIONS`, write `die`; above `update`, write `hitByCar`.
3. At the end of `update`, write the three check lines.

# --task-tr--

1. `for (const lane of LANES) lane.offset = 0` satırının altına `newFrog` ve `laneAt` fonksiyonlarını yaz.
2. `const DIRECTIONS` satırının üstüne `die`, `update`'in üstüne `hitByCar` fonksiyonunu yaz.
3. `update`'in sonuna, bir boş satırdan sonra üç kontrol satırını yaz.
4. **Çalıştır** ve bir arabaya çarp.

# --tests--

A car on the frog's square should send the frog back to the start.
tr: Kurbağanın karesindeki araba onu başlangıca göndermeli.

```js
frog.x = 3
frog.y = 7
assert.isTrue(hitByCar(LANES[0]))
update()
assert.deepEqual(frog, { x: 5, y: 12 })
```

A car in the next square should not count.
tr: Yandaki karedeki araba sayılmamalı.

```js
frog.x = 2
frog.y = 7
assert.isFalse(hitByCar(LANES[0]))
frog.x = 4
assert.isFalse(hitByCar(LANES[0]))
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
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

function die() {
  newFrog()
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
