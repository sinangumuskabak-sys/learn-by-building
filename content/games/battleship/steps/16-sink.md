---
title: Sinking ships
title_tr: Gemi batırmak
skills: [game.state]
---

# --goal--

A ship sinks when every one of its squares has been hit. Each ship counts its hits; `fire` says `'sunk'` when a hit sinks
it, and the message tells you.

# --goal-tr--

Bir gemi, **bütün** kareleri vurulunca batar. Her gemi aldığı isabetleri sayacak: `hits`. İsabet sayısı gemi boyuna
ulaşınca gemi batmıştır.

"Gemi batırdın" demek oyuncu için önemlidir: o geminin çevresinde aramayı bırakabileceği anlamına gelir. Bu yüzden
batırmanın kendi mesajı olacak.

# --code--

```js
let enemyFleet // ships: { cells: [[r, c], ...], hits }

      return { cells, hits: 0 }

const sunk = (ship) => ship.hits === ship.cells.length

  ship.hits += 1
  return sunk(ship) ? 'sunk' : 'hit'

  message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
```

# --meaning--

- Every ship starts with `hits: 0`; each hit adds 1.
- `sunk(ship)` is true when the hits equal the ship's length.
- `fire` now returns `'miss'`, `'hit'` or `'sunk'`, and the message has three cases.

# --meaning-tr--

- `hits: 0` → her gemi sıfır isabetle başlar. Yorum da yeni alanı listeliyor.
- `const sunk = (ship) => ship.hits === ship.cells.length` → isabet sayısı kare sayısına eşitse gemi **batmış**.
- `ship.hits += 1` → `fire`'da isabet olunca geminin sayacı artar.
- `return sunk(ship) ? 'sunk' : 'hit'` → bu isabet gemiyi batırdıysa `'sunk'`, değilse `'hit'`.
- Mesaj satırında iki `? :` art arda: `'miss'` → `'Miss'`, `'hit'` → `'Hit!'`, geri kalan (`'sunk'`) →
  `'You sank a ship!'` (bir gemi batırdın!).

# --task--

1. Add `, hits` to the `let enemyFleet` comment and `, hits: 0` to the ship `placeFleet` returns.
2. Under `shipAt`, write `sunk`.
3. In `fire`, change the end as shown.
4. In `playerShoots`, change the message line.

# --task-tr--

1. `let enemyFleet` yorumuna `, hits`; `placeFleet`'in döndürdüğü gemiye `, hits: 0` ekle.
2. `shipAt` satırının altına `sunk` satırını yaz.
3. `fire`'ın sonunu kodda görüldüğü gibi değiştir: `ship.hits += 1` ve `sunk` soran `return`.
4. `playerShoots` içindeki mesaj satırını üç durumlu hâline getir.
5. **Çalıştır** ve bir gemiyi batırmaya çalış.

# --tests--

Hitting every square of a ship should sink it.
tr: Bir geminin her karesini vurmak onu batırmalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }, { cells: [[5, 5], [6, 5], [7, 5]], hits: 0 }]
$.click(48, 68)
assert.strictEqual(message, 'Hit!')
assert.isFalse(sunk(enemyFleet[0]))
$.click(84, 68)
assert.strictEqual(message, 'You sank a ship!')
assert.isTrue(sunk(enemyFleet[0]))
assert.isFalse(sunk(enemyFleet[1]))
```

Every new ship should start with no hits.
tr: Her yeni gemi sıfır isabetle başlamalı.

```js
assert.isTrue(placeFleet().every((s) => s.hits === 0))
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
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : '#ef4444'
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
