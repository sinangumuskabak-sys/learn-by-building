---
title: Four homes and faster levels
title_tr: Dört ev ve hızlanan bölümler
skills: [game.state]
---

# --explanation--

Reaching the far bank is not enough: the frog has to land **in a home**. The bank has four home slots; the rest is
bushes, and landing in a bush (or in a home that already has a frog) costs a life. That turns the river into a real
puzzle: you have to pick the log that carries you to the right place.

The homes are just four column numbers, plus a matching array of true/false:

```js
const HOMES = [1, 4, 7, 10]
filled = HOMES.map(() => false)   // [false, false, false, false]
const i = HOMES.indexOf(frog.x)   // -1 when the frog is not in front of a home
```

Row 0 has no lane, so the rounding from the last step already lines the frog up with a column before this check. When
all four homes are full, the level goes up, the homes empty and everything moves a quarter faster. Multiplying every
speed by one `pace` number is a simple, very common way to make a game harder: the level design stays the same, only the
tempo changes. A cap (`Math.min(2, ...)`) keeps late levels possible.

# --explanation-tr--

Karşı kıyıya varmak yetmez: kurbağa **bir eve** konmalıdır. Kıyıda dört ev yuvası var; gerisi çalı ve bir çalıya (ya da
zaten kurbağası olan bir eve) konmak bir cana mal olur. Bu, nehri gerçek bir bulmacaya çevirir: seni doğru yere taşıyan
kütüğü seçmen gerekir.

Evler yalnızca dört sütun numarası, artı eşleşen bir true/false dizisidir:

```js
const HOMES = [1, 4, 7, 10]
filled = HOMES.map(() => false)   // [false, false, false, false]
const i = HOMES.indexOf(frog.x)   // kurbağa bir evin önünde değilse -1
```

Satır 0'da şerit yok; bu yüzden geçen adımdaki yuvarlama bu kontrolden önce kurbağayı zaten bir sütuna hizalar. Dört ev
de dolunca bölüm artar, evler boşalır ve her şey dörtte bir hızlanır. Her hızı tek bir `pace` sayısıyla çarpmak bir oyunu
zorlaştırmanın basit ve çok yaygın bir yoludur: bölüm tasarımı aynı kalır, yalnızca tempo değişir. Bir tavan
(`Math.min(2, ...)`) geç bölümleri oynanabilir tutar.

# --task--

1. Add `HOMES = [1, 4, 7, 10]`, `let level` and `let filled`; `reset()` sets `level = 1` and four `false`s.
2. At the end of `hop()`, call `reachHome()` when the frog is in row 0. `reachHome()`: if `frog.x` is not a home or that
   home is filled, `die()`. Otherwise fill it and start a new frog; if every home is filled, add 1 to `level` and empty
   the homes.
3. In `update()`, use `pace = Math.min(2, 1 + (level - 1) * 0.25)` for both the lanes and the ride on a log.
4. Draw each home as a `'#1e3a8a'` tile in row 0, with a `'#86efac'` frog (8-pixel inset) in it when filled. Show the
   level before the lives: `Level 2   Lives: 3`.

# --task-tr--

1. `HOMES = [1, 4, 7, 10]`, `let level` ve `let filled` ekle; `reset()` `level = 1` ve dört `false` ayarlar.
2. `hop()`'un sonunda kurbağa satır 0'daysa `reachHome()` çağır. `reachHome()`: `frog.x` bir ev değilse ya da o ev
   doluysa `die()`. Değilse onu doldur ve yeni bir kurbağa başlat; her ev doluysa `level`'a 1 ekle ve evleri boşalt.
3. `update()` içinde hem şeritler hem de kütükte taşınma için `pace = Math.min(2, 1 + (level - 1) * 0.25)` kullan.
4. Her evi satır 0'da bir `'#1e3a8a'` döşeme olarak, doluysa içinde bir `'#86efac'` kurbağayla (8 piksel içeriden)
   çiz. Bölümü canlardan önce göster: `Level 2   Lives: 3`.

# --tests--

Hopping into an empty home should fill it and bring the next frog.
tr: Boş bir eve zıplamak onu doldurmalı ve sıradaki kurbağayı getirmeli.

```js
frog = { x: 4, y: 1 }
$.press('ArrowUp')
assert.deepEqual(filled, [false, true, false, false])
assert.deepEqual(frog, { x: 5, y: 12 })
assert.strictEqual(lives, 3)
$.tick(1)
assert.lengthOf($.rects('#86efac'), 1)
```

A frog slightly off a home column should be rounded into it.
tr: Bir ev sütunundan biraz kaymış kurbağa içine yuvarlanmalı.

```js
frog = { x: 6.7, y: 1 }
$.press('ArrowUp')
assert.deepEqual(filled, [false, false, true, false])
```

Landing in a bush or a filled home should cost a life.
tr: Bir çalıya ya da dolu bir eve konmak bir cana mal olmalı.

```js
frog = { x: 5, y: 1 }
$.press('ArrowUp')
assert.strictEqual(lives, 2)
assert.deepEqual(filled, [false, false, false, false])
filled = [true, false, false, false]
frog = { x: 1, y: 1 }
$.press('ArrowUp')
assert.strictEqual(lives, 1)
```

Filling all four homes should start a faster level.
tr: Dört evi de doldurmak daha hızlı bir bölüm başlatmalı.

```js
filled = [true, true, false, true]
frog = { x: 7, y: 1 }
$.press('ArrowUp')
assert.strictEqual(level, 2)
assert.deepEqual(filled, [false, false, false, false])
$.tick(1)
assert.closeTo(laneAt(7).offset, -0.0625, 1e-9, 'a quarter faster')
assert.include($.texts(), 'Level 2   Lives: 3')
level = 20
$.tick(1)
assert.closeTo(laneAt(7).offset, -0.0625 - 0.1, 1e-9, 'never more than twice as fast')
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

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function reset() {
  lives = 3
  state = 'playing'
  level = 1
  filled = HOMES.map(() => false)
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
  if (frog.y === 0) reachHome()
}

function reachHome() {
  const i = HOMES.indexOf(frog.x)
  if (i === -1 || filled[i]) {
    die()
    return
  }
  filled[i] = true
  if (filled.every(Boolean)) {
    level += 1
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
