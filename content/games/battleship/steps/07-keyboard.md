---
title: A cursor and a record
title_tr: Bir imleç ve bir rekor
skills: [game.input, game.state]
---

# --explanation--

Some players prefer the keyboard, and some cannot use a pointer at all. A yellow **cursor** on the enemy's sea moves with the
arrow keys (wrapping round at the edges), and Enter or Space fires at it. Both the tap and the key end up in the same
`playerShoots`, so the rules are the same whichever you use.

Two finishing touches:

- when the game ends, the enemy fleet is **revealed**, so you can see where the ships you did not find were hiding;
- your best result, the fewest shots you ever needed to win, is kept in `localStorage`.

# --explanation-tr--

Bazı oyuncular klavyeyi tercih eder, bazıları ise hiç işaretçi kullanamaz. Düşman denizinde sarı bir **imleç** ok tuşlarıyla hareket
eder (kenarlarda başa sararak) ve Enter ya da Boşluk ona ateş eder. Hem dokunuş hem tuş aynı `playerShoots`'ta biter; böylece hangisini
kullanırsan kullan kurallar aynıdır.

İki son dokunuş:

- oyun bittiğinde düşman filosu **açığa çıkar**; böylece bulamadığın gemilerin nerede saklandığını görebilirsin;
- en iyi sonucun, kazanmak için gereken en az atış, `localStorage`'da tutulur.

# --task--

1. Add `cursor` (`{ r: 0, c: 0 }` in `reset()`). The arrow keys move it with wrap-around; Enter or Space fires at it (or starts a
   new game after the end). Draw it as a `'#fde047'` outline while playing.
2. Keep `best` in `localStorage` under `'battleship-best'`, saved on a win with fewer shots, and draw `Best 23` (or `Best -`) under
   the shots.
3. When the game is over, draw the enemy sea with its ships shown.

# --task-tr--

1. `cursor` ekle (`reset()`'te `{ r: 0, c: 0 }`). Ok tuşları onu başa sararak hareket ettirir; Enter ya da Boşluk ona ateş eder (ya da
   sondan sonra yeni bir oyun başlatır). Oynarken onu `'#fde047'` bir çerçeve olarak çiz.
2. `best`'i `localStorage`'da `'battleship-best'` adıyla tut, daha az atışlı bir kazançta kaydet ve atışların altına `Best 23` (ya da
   `Best -`) çiz.
3. Oyun bittiğinde düşman denizini gemileri görünür olarak çiz.

# --tests--

The arrow keys should move the cursor, wrapping round, and Enter should fire at it.
tr: Ok tuşları imleci başa sararak hareket ettirmeli ve Enter ona ateş etmeli.

```js
enemyFleet = [{ cells: [[1, 1], [1, 2]], hits: 0 }]
$.press('ArrowDown')
$.press('ArrowRight')
assert.deepEqual(cursor, { r: 1, c: 1 })
$.press('Enter')
assert.strictEqual(myShots[1][1], 'hit', 'Enter shoots at the cursor')
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(cursor, { r: 9, c: 1 }, 'the cursor wraps round')
$.tick(1)
assert.lengthOf($.screen().filter((c) => c.op === 'strokeRect' && c.stroke === '#fde047'), 1)
```

A win should save the fewest shots as the best.
tr: Bir kazanç en az atışı en iyi olarak kaydetmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }]
$.click(48, 68)
$.tick(THINK)
$.click(84, 68)
assert.strictEqual(state, 'won')
assert.strictEqual(best, 2)
assert.strictEqual(localStorage.getItem('battleship-best'), '2')
$.tick(1)
assert.include($.texts(), 'Best 2')
```

At the end the enemy fleet should be revealed.
tr: Sonda düşman filosu açığa çıkmalı.

```js
enemyFleet = [{ cells: [[3, 3], [3, 4]], hits: 0 }]
state = 'lost'
$.tick(1)
assert.lengthOf($.rects('#64748b').filter((r) => r.w === BIG - 2), 2, 'at the end the enemy fleet is shown')
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
let best = Number(localStorage.getItem('battleship-best')) || 0

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
    if (best === 0 || shots < best) {
      best = shots
      localStorage.setItem('battleship-best', best)
    }
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
  if (state !== 'playing') return reset()
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    const [dr, dc] = moves[event.key]
    cursor = { r: (cursor.r + dr + N) % N, c: (cursor.c + dc + N) % N }
  } else if (event.key === 'Enter' || event.key === ' ') {
    if (state !== 'playing') reset()
    else playerShoots(cursor.r, cursor.c)
  } else if (event.key === 'h' || event.key === 'H') showHeat = !showHeat
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
  const x = HOME.x + N * SMALL + 20
  ctx.fillStyle = 'white'
  ctx.font = '14px sans-serif'
  ctx.fillText('Shots ' + shots, x, HOME.y + 16)
  ctx.fillText('Best ' + (best || '-'), x, HOME.y + 38)
  ctx.fillText('Left: ' + enemyFleet.filter((s) => !sunk(s)).map((s) => s.cells.length).join(' '), x, HOME.y + 60)
  ctx.fillText('H: their heat map', x, HOME.y + 82)
  if (state !== 'playing') ctx.fillText('Tap or Enter: again', x, HOME.y + 104)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
