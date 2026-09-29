---
title: Darker hits on a sunk ship
title_tr: Batık gemide koyu isabetler
skills: [game.canvas]
---

# --goal--

Hits on a sunk ship are drawn dark red, so you can tell at a glance which hits still need following up.

# --goal-tr--

Batmış bir gemideki isabetler **koyu kırmızı** çizilsin. Böylece bir bakışta hangi isabetlerin hâlâ takip edilmesi
gerektiğini (parlak kırmızılar) görürsün.

# --code--

```js
const ship = shot === 'hit' && shipAt(fleet, r, c)
ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444'
```

# --meaning--

- For a hit, `ship` is the ship on that square; for a miss it is `false`.
- Miss: white. Hit on a sunk ship: dark red. Other hits: red.

# --meaning-tr--

- `shot === 'hit' && shipAt(fleet, r, c)` → `&&` ilk yanlışta durur: ıskada sonuç `false`; isabette `shipAt`'in
  bulduğu gemi.
- `shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444'` → ıska beyaz; batmış gemideki isabet
  koyu kırmızı; diğer isabetler kırmızı.

# --task--

In `drawSea`, replace the dot's `fillStyle` line with the two new lines.

# --task-tr--

`drawSea` içinde noktanın rengini seçen `ctx.fillStyle = shot === 'miss' ? ...` satırını sil; yerine iki yeni satırı yaz.
**Çalıştır**: batırdığın geminin noktaları koyulaşmalı.

# --tests--

Hits on a sunk ship should be dark red, other hits red.
tr: Batık gemideki isabetler koyu kırmızı, diğerleri kırmızı olmalı.

```js
enemyFleet = [{ cells: [[0, 0]], hits: 0 }, { cells: [[5, 5], [6, 5]], hits: 0 }]
$.click(48, 68)
$.click(228, 248)
$.tick(1)
assert.deepInclude($.arcs(), { x: 48, y: 68, r: 12, color: '#7f1d1d' }, 'the sunk ship')
assert.deepInclude($.arcs(), { x: 228, y: 248, r: 12, color: '#ef4444' }, 'a ship still afloat')
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

let enemyFleet // ships: { cells: [[r, c], ...], hits }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
let message

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
  message = 'Your turn: pick a square'
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
  if (myShots[r][c]) return
  const result = fire(enemyFleet, myShots, r, c)
  message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, grid(null), myFleet, true)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
