---
title: A keyboard cursor
title_tr: Klavye imleci
skills: [game.canvas]
---

# --goal--

To play without a mouse, a yellow frame marks the square the keyboard is on.

# --goal-tr--

Fare olmadan da oynanabilsin: **sarı bir çerçeve** klavyenin üstünde durduğu kareyi göstersin. Bu adımda çerçeveyi
çiziyoruz; ok tuşlarıyla hareketi sonraki adımda.

# --code--

```js
let cursor // { r, c } for the keyboard
  cursor = { r: 0, c: 0 }

  if (state === 'playing') {
    ctx.strokeStyle = '#fde047'
    ctx.strokeRect(SEA.x + cursor.c * BIG + 1, SEA.y + cursor.r * BIG + 1, BIG - 2, BIG - 2)
  }
```

# --meaning--

- `cursor` holds a row and a column; a new game starts it in the top-left corner.
- While playing, a yellow frame (`strokeRect` draws only the outline) is drawn around that square.

# --meaning-tr--

- `let cursor` → imlecin satırı (`r`) ve sütunu (`c`). `reset` onu sol üst köşeye koyar.
- `ctx.strokeRect(...)` → `fillRect`'in kardeşi: içini doldurmaz, yalnız **kenar çizgisini** çizer.
- `SEA.x + cursor.c * BIG + 1` → karenin sol kenarı (1 piksel içeriden).
- Yalnız oyun sürerken çizilir.

# --task--

1. Under `let showHeat`, write `let cursor`; in `reset`, under `showHeat = false`, write the cursor line.
2. In `draw`, right after the loop that outlines sunk ships, write the `if (state === 'playing')` block.

# --task-tr--

1. `let showHeat` satırının altına `let cursor ...`, `reset` içinde `showHeat = false` satırının altına
   `cursor = { r: 0, c: 0 }` yaz.
2. `draw` içinde batık gemileri çerçeveleyen `for` döngüsünün kapanan `}` işaretinin hemen **altına** bloğu yaz.
3. **Çalıştır**: sol üst karede sarı bir çerçeve görmelisin.

# --tests--

A yellow frame should mark the cursor's square.
tr: Sarı bir çerçeve imlecin karesini göstermeli.

```js
cursor = { r: 2, c: 3 }
$.tick()
const frames = $.screen().filter((c) => c.op === 'strokeRect' && c.stroke === '#fde047')
assert.lengthOf(frames, 1)
assert.deepEqual(frames[0].args, [30 + 3 * 36 + 1, 50 + 2 * 36 + 1, 34, 34])
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
let cursor // { r, c } for the keyboard

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
  cursor = { r: 0, c: 0 }
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') showHeat = !showHeat
  else return
  event.preventDefault()
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
  drawSea(SEA, BIG, myShots, enemyFleet, state !== 'playing', null)
  // Sunk enemy ships are outlined so you can see what is left.
  ctx.strokeStyle = '#fca5a5'
  ctx.lineWidth = 2
  for (const ship of enemyFleet.filter(sunk)) {
    const rs = ship.cells.map(([r]) => r)
    const cs = ship.cells.map(([, c]) => c)
    ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
  }
  if (state === 'playing') {
    ctx.strokeStyle = '#fde047'
    ctx.strokeRect(SEA.x + cursor.c * BIG + 1, SEA.y + cursor.r * BIG + 1, BIG - 2, BIG - 2)
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
