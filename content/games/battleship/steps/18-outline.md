---
title: Outline sunk ships
title_tr: Batık gemilerin çerçevesi
skills: [game.canvas, prog.arrays]
---

# --goal--

Each sunk enemy ship gets a pink outline around all its squares, so the shape of what you sank is clear.

# --goal-tr--

Batırdığın her düşman gemisinin etrafına **pembe bir çerçeve** çizelim: batırdığın şeyin şekli ve boyu açıkça görünsün.
Çerçeve, geminin en üst-sol karesinden en alt-sağ karesine kadar uzanan bir dikdörtgen.

# --code--

```js
// Sunk enemy ships are outlined so you can see what is left.
ctx.strokeStyle = '#fca5a5'
ctx.lineWidth = 2
for (const ship of enemyFleet.filter(sunk)) {
  const rs = ship.cells.map(([r]) => r)
  const cs = ship.cells.map(([, c]) => c)
  ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
}
```

# --meaning--

- `filter(sunk)` passes the `sunk` function itself: only sunk ships are outlined.
- `rs` and `cs` are the ship's rows and columns; `Math.min(...cs)` is the leftmost column (`...` spreads the list).
- `strokeRect` draws only the outline of a rectangle, 2 pixels in from the ship's squares.

# --meaning-tr--

- `enemyFleet.filter(sunk)` → `sunk` fonksiyonunun **kendisini** veriyoruz: yalnız batmış gemiler. Neredeyse cümle gibi
  okunuyor.
- `ship.cells.map(([r]) => r)` → geminin satırları; `([, c]) => c` → sütunları (virgül ilk elemanı atlar).
- `Math.min(...cs)` → en küçük sütun. `...` (yayma) listeyi tek tek sayılar olarak verir: `Math.min(3, 4, 5)` gibi.
- `Math.max(...cs) - Math.min(...cs) + 1` → gemi kaç sütun kaplıyor; `* BIG` ile piksel.
- `ctx.strokeRect(x, y, en, boy)` → yalnız **çerçeve** çizer (içi boş). `+ 2` ve `- 4` onu kareların biraz içine alır.
- `strokeStyle` çizgi rengi, `lineWidth` kalınlığı.

# --task--

In `draw`, under the enemy sea's `drawSea(...)` line, write the outline lines. The `strokeRect` line is long; keep it on
one line.

# --task-tr--

`draw` içinde düşman denizini çizen `drawSea(SEA, ...)` satırının altına çerçeve satırlarını yaz. `strokeRect` satırı
uzun; tek satırda yaz. **Çalıştır** ve bir gemi batır: etrafında pembe bir çerçeve belirmeli.

# --tests--

A sunk ship should be outlined around all its squares.
tr: Batık bir gemi bütün karelerinin etrafından çerçevelenmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }, { cells: [[5, 5], [6, 5], [7, 5]], hits: 0 }]
$.click(48, 68)
$.tick(1)
assert.lengthOf($.screen().filter((c) => c.op === 'strokeRect'), 0, 'not sunk yet')
$.click(84, 68)
$.tick(1)
const outlines = $.screen().filter((c) => c.op === 'strokeRect' && c.stroke === '#fca5a5')
assert.lengthOf(outlines, 1)
assert.deepEqual(outlines[0].args, [32, 52, 68, 32])
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
  drawSea(HOME, SMALL, grid(null), myFleet, true)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
