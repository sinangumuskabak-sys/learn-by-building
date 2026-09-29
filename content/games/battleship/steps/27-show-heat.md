---
title: See the heat map
title_tr: Isı haritasını gör
skills: [game.canvas]
---

# --goal--

It is fun to see what the computer is thinking. When `showHeat` is on, your small sea is painted orange: the hotter a
square, the brighter.

# --goal-tr--

Bilgisayarın ne düşündüğünü **görmek** eğlenceli. `showHeat` açıkken küçük denizin turuncuya boyansın: kare ne kadar
sıcaksa o kadar parlak. `drawSea`'ya isteğe bağlı yeni bir parametre ekliyoruz: `heat`.

# --code--

```js
let showHeat
  showHeat = false

function drawSea(origin, size, shotsGrid, fleet, showShips, heat) {
  const max = heat ? Math.max(1, ...heat.flat()) : 1

      // The heat map: brighter where the computer thinks a ship is more likely.
      if (heat && heat[r][c] > 0) ctx.fillStyle = `rgba(249, 115, 22, ${(0.15 + (0.85 * heat[r][c]) / max).toFixed(2)})`

  drawSea(SEA, BIG, myShots, enemyFleet, false, null)
  drawSea(HOME, SMALL, theirShots, myFleet, true, showHeat ? heatMap() : null)
```

# --meaning--

- `heat` is a heat map or `null` (no colors). `max` is the hottest value, at least 1.
- The see-through orange goes from 0.15 (cool) to 1.0 (the hottest square): `heat / max` is between 0 and 1.
- Backticks make a template string: `${...}` puts a value inside the text.

# --meaning-tr--

- `heat` → ya bir ısı haritası ya da `null` (renk yok). Düşman denizini çizerken `null` veriyoruz.
- `Math.max(1, ...heat.flat())` → `flat` ızgarayı tek listeye açar, `...` listeyi tek tek sayılara dağıtır, `max`
  en büyüğünü bulur. En az 1, ki sıfıra bölmeyelim.
- `` `rgba(249, 115, 22, ${...})` `` → ters tırnaklı **şablon metin**: `${ }` içindeki değer metnin içine yazılır.
- `0.15 + (0.85 * heat[r][c]) / max` → saydamlık: en soğuk 0,15, en sıcak 1. `heat / max` her zaman 0 ile 1 arası.
- `.toFixed(2)` → sayıyı 2 ondalıkla yazar (0.4712... → "0.47").
- `showHeat ? heatMap() : null` → açıksa haritayı hesapla, kapalıysa hiç hesaplama.

# --task--

1. Under `let shots`, write `let showHeat`; in `reset`, under `shots = 0`, write `showHeat = false`.
2. In `drawSea`, add the `heat` parameter, the `max` line and the two heat lines.
3. Pass `null` for the enemy's sea and `showHeat ? heatMap() : null` for yours.

# --task-tr--

1. `let shots ...` satırının altına `let showHeat`, `reset` içinde `shots = 0` satırının altına `showHeat = false`
   yaz.
2. `drawSea`'nın parametrelerinin sonuna `, heat` ekle; ilk satırına `max` satırını yaz; `showShips` satırının altına
   yorumu ve ısı satırını yaz.
3. `draw` içindeki iki `drawSea` çağrısının sonuna yeni parametreyi ekle: düşman denizine `null`, seninkine
   `showHeat ? heatMap() : null`.
4. **Çalıştır**. (Haritayı açan tuşu sonraki adımda bağlıyoruz.)

# --tests--

With `showHeat` on, your sea should be painted with the heat map.
tr: `showHeat` açıkken denizin ısı haritasıyla boyanmalı.

```js
showHeat = true
$.tick()
assert.isTrue($.rects().some((r) => r.color.startsWith('rgba(249, 115, 22,')))
```

With `showHeat` off, there should be no heat colors.
tr: `showHeat` kapalıyken ısı renkleri olmamalı.

```js
$.tick()
assert.isFalse($.rects().some((r) => r.color.startsWith('rgba(249, 115, 22,')))
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
let showHeat

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
  showHeat = false
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

function drawSea(origin, size, shotsGrid, fleet, showShips, heat) {
  const max = heat ? Math.max(1, ...heat.flat()) : 1
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'
      // The heat map: brighter where the computer thinks a ship is more likely.
      if (heat && heat[r][c] > 0) ctx.fillStyle = `rgba(249, 115, 22, ${(0.15 + (0.85 * heat[r][c]) / max).toFixed(2)})`
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
  drawSea(SEA, BIG, myShots, enemyFleet, false, null)
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
  drawSea(HOME, SMALL, theirShots, myFleet, true, showHeat ? heatMap() : null)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
