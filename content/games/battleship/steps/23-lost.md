---
title: You can lose too
title_tr: Kaybetmek de var
skills: [game.state]
---

# --goal--

When the computer sinks your last ship, you lose: the state becomes `'lost'` and the game stops.

# --goal-tr--

Bilgisayar senin **son** gemini de batırırsa kaybedersin: durum `'lost'` olur ve oyun durur. Kazanma kontrolünün
aynısı, bu sefer senin filon için.

# --code--

```js
if (myFleet.every(sunk)) {
  state = 'lost'
  message = 'They sank your fleet'
  return
}
```

# --meaning--

- `every(sunk)` is true when all your ships are sunk.
- Then the game is lost; `return` keeps the turn from passing back to you.

# --meaning-tr--

- `myFleet.every(sunk)` → filondaki **her** gemi batık mı? `every` hepsi için doğruysa `true` verir.
- `state = 'lost'` → oyun kaybedildi; `playerShoots` ve `update` artık çalışmaz (ikisi de `state === 'playing'`
  istiyor).
- `return` → sırayı sana geri veren satıra hiç gelinmez.

# --task--

In `computerShoots`, write the block right above `turn = 'you'`.

# --task-tr--

`computerShoots` içinde `turn = 'you'` satırının hemen **üstüne** bloğu yaz. **Çalıştır**.

# --tests--

Losing your last ship should end the game as lost.
tr: Son gemini kaybetmek oyunu kayıpla bitirmeli.

```js
myFleet = [{ cells: [[0, 0]], hits: 0 }]
theirShots = Array.from({ length: 10 }, () => Array(10).fill('miss'))
theirShots[0][0] = null
turn = 'them'
timer = 1
update()
assert.strictEqual(state, 'lost')
assert.strictEqual(message, 'They sank your fleet')
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

function computerShoots() {
  let r
  let c
  do {
    r = Math.floor(Math.random() * N)
    c = Math.floor(Math.random() * N)
  } while (theirShots[r][c])
  const result = fire(myFleet, theirShots, r, c)
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
