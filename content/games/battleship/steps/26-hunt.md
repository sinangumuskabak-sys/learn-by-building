---
title: Hunt around a hit
title_tr: İsabetin çevresini ara
skills: [prog.arrays]
---

# --goal--

Once the computer hits a ship, the rest of it must be next to that hit. Placements through a hit (of a ship not sunk
yet) count 50 times more, and sunk ships are taken off the map like misses.

# --goal-tr--

Bilgisayar bir gemiyi vurduğunda, geminin geri kalanı o isabetin **yanında** olmalı. İnsan oyuncu da öyle yapar:
isabet alınca çevresini tarar. Bunu ısı haritasına öğretiyoruz: bir **isabetin** (henüz batmamış gemi) üstünden geçen
yerleşimler **50 kat** fazla puan versin. **Batmış** gemilerin kareleri de ıska gibi yasak olsun: orada başka gemi
yok.

# --code--

```js
// Every placement that avoids misses and sunk ships adds 1 to each of its squares; placements through a hit that
// is not sunk yet are far more likely, so they count much more. The most counted square is the best shot.
const sunkCells = new Set(myFleet.filter(sunk).flatMap((s) => s.cells.map(([r, c]) => r * N + c)))

if (cells.some(([cr, cc]) => theirShots[cr][cc] === 'miss' || sunkCells.has(cr * N + cc))) continue
const hits = cells.filter(([cr, cc]) => theirShots[cr][cc] === 'hit').length
for (const [cr, cc] of cells) heat[cr][cc] += 1 + hits * 50
```

# --meaning--

- `sunkCells` is a `Set` of the squares of sunk ships; `r * N + c` turns a square into one number (0–99) so the set can
  look it up quickly.
- A placement crossing a sunk ship is skipped like one crossing a miss.
- `hits` counts how many of the placement's squares are hits; each one adds 50 to the placement's weight.

# --meaning-tr--

- `myFleet.filter(sunk)` → batmış gemiler. `flatMap` hepsinin karelerini **tek bir listede** toplar.
- `r * N + c` → bir kareyi tek sayıya çevirir: (3, 7) → 37. İki sayıyı bir arada aramaktan kolay.
- `new Set(...)` → **küme**: bir şeyin içinde olup olmadığını (`has`) çok hızlı söyler.
- `|| sunkCells.has(cr * N + cc)` → yerleşim batmış bir gemiye denk geliyorsa da atla.
- `const hits = cells.filter(...).length` → bu yerleşimin karelerinden kaçı **isabet**.
- `1 + hits * 50` → isabetten geçmeyen yerleşim 1, bir isabetten geçen 51, ikisinden geçen 101 puan ekler. Böylece
  isabetin yanındaki kareler çok ısınır.

# --task--

1. Add the two comment lines under the first comment line of `heatMap`, and the `sunkCells` line under `const heat = grid(0)`.
2. Extend the miss check with `|| sunkCells.has(cr * N + cc)`.
3. Replace the `heat[cr][cc] += 1` line with the `hits` line and the new sum.

# --task-tr--

1. `heatMap`'in üstündeki yorumun altına iki yorum satırını daha yaz; `const heat = grid(0)` satırının altına
   `sunkCells` satırını yaz.
2. Iska kontrolündeki `theirShots[cr][cc] === 'miss'` koşulunun sonuna `|| sunkCells.has(cr * N + cc)` ekle.
3. `for (const [cr, cc] of cells) heat[cr][cc] += 1` satırının üstüne `hits` satırını yaz ve `+= 1` yerine
   `+= 1 + hits * 50` yaz.
4. **Çalıştır**: bilgisayar bir gemini vurunca peşini bırakmayacak.

# --tests--

Squares next to a hit should be much hotter than far away ones.
tr: Bir isabetin yanındaki kareler uzaktakilerden çok daha sıcak olmalı.

```js
myFleet = [{ cells: [[5, 4], [5, 5], [5, 6]], hits: 1 }]
theirShots = Array.from({ length: 10 }, () => Array(10).fill(null))
theirShots[5][5] = 'hit'
const heat = heatMap()
assert.isAbove(heat[5][4], 50)
assert.isBelow(heat[0][0], 10)
```

Placements through a sunk ship should not count.
tr: Batmış bir gemiden geçen yerleşimler sayılmamalı.

```js
myFleet = [{ cells: [[0, 0], [0, 1]], hits: 2 }, { cells: [[9, 8], [9, 9]], hits: 0 }]
theirShots = Array.from({ length: 10 }, () => Array(10).fill(null))
theirShots[0][0] = 'hit'
theirShots[0][1] = 'hit'
assert.strictEqual(heatMap()[1][0], 2)
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const SHIPS = [5, 4, 3, 3, 2]
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }
const THINK = 30 // frames the computer waits before it shoots

let enemyFleet // ships: { cells: [[r, c], ...], hits }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
let theirShots // the same, on your sea
let turn // 'you' or 'them'
let timer
let message
let state // 'playing', 'won' or 'lost'
let shots // how many shots you took

const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))

// A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
function placeFleet() {
  const taken = grid(false)
  return SHIPS.map((length) => {
    for (;;) {
      const down = Math.random() < 0.5
      const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
      const c = Math.floor(Math.random() * (down ? N : N - length + 1))
      const cells = shipCells(r, c, length, down)
      if (cells.some(([cr, cc]) => taken[cr][cc])) continue
      for (const [cr, cc] of cells) taken[cr][cc] = true
      return { cells, hits: 0 }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
  theirShots = grid(null)
  turn = 'you'
  message = 'Your turn: pick a square'
  state = 'playing'
  shots = 0
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))
const sunk = (ship) => ship.hits === ship.cells.length

// Fire at a square of a fleet and record the result on that shots grid.
function fire(fleet, record, r, c) {
  const ship = shipAt(fleet, r, c)
  if (!ship) {
    record[r][c] = 'miss'
    return 'miss'
  }
  record[r][c] = 'hit'
  ship.hits += 1
  return sunk(ship) ? 'sunk' : 'hit'
}

function playerShoots(r, c) {
  if (state !== 'playing' || turn !== 'you' || myShots[r][c]) return
  shots += 1
  const result = fire(enemyFleet, myShots, r, c)
  message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
  if (enemyFleet.every(sunk)) {
    state = 'won'
    message = 'You won in ' + shots + ' shots!'
    return
  }
  turn = 'them'
  timer = THINK
}

// How many ways could the ships still afloat lie on the sea, given what the computer knows?
// Every placement that avoids misses and sunk ships adds 1 to each of its squares; placements through a hit that
// is not sunk yet are far more likely, so they count much more. The most counted square is the best shot.
function heatMap() {
  const heat = grid(0)
  const sunkCells = new Set(myFleet.filter(sunk).flatMap((s) => s.cells.map(([r, c]) => r * N + c)))
  const afloat = myFleet.filter((s) => !sunk(s)).map((s) => s.cells.length)
  for (const length of afloat) {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (const down of [false, true]) {
          const cells = shipCells(r, c, length, down)
          if (cells.some(([cr, cc]) => cr >= N || cc >= N)) continue
          if (cells.some(([cr, cc]) => theirShots[cr][cc] === 'miss' || sunkCells.has(cr * N + cc))) continue
          const hits = cells.filter(([cr, cc]) => theirShots[cr][cc] === 'hit').length
          for (const [cr, cc] of cells) heat[cr][cc] += 1 + hits * 50
        }
      }
    }
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (theirShots[r][c]) heat[r][c] = 0
  return heat
}

function computerShoots() {
  const heat = heatMap()
  let bestCell = null
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!bestCell || heat[r][c] > heat[bestCell.r][bestCell.c]) bestCell = { r, c }
    }
  }
  const result = fire(myFleet, theirShots, bestCell.r, bestCell.c)
  message = result === 'sunk' ? 'They sank your ship!' : 'Your turn: pick a square'
  if (myFleet.every(sunk)) {
    state = 'lost'
    message = 'They sank your fleet'
    return
  }
  turn = 'you'
}

function update() {
  if (state === 'playing' && turn === 'them' && --timer === 0) computerShoots()
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

function drawSea(origin, size, shotsGrid, fleet, showShips) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
      const shot = shotsGrid[r][c]
      if (!shot) continue
      const ship = shot === 'hit' && shipAt(fleet, r, c)
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, shot === 'miss' ? size / 8 : size / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(message, SEA.x, 34)
  drawSea(SEA, BIG, myShots, enemyFleet, false)
  // Sunk enemy ships are outlined so you can see what is left.
  ctx.strokeStyle = '#fca5a5'
  ctx.lineWidth = 2
  for (const ship of enemyFleet.filter(sunk)) {
    const rs = ship.cells.map(([r]) => r)
    const cs = ship.cells.map(([, c]) => c)
    ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, theirShots, myFleet, true)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
