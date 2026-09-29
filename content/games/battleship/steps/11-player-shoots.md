---
title: Your shot
title_tr: Senin atışın
skills: [game.state]
---

# --goal--

`playerShoots(r, c)` fires at the enemy's fleet, unless you already tried that square: shooting twice at the same square
would waste a shot.

# --goal-tr--

Oyuncunun atışı: `playerShoots(r, c)` düşman filosuna ateş eder. Ama aynı kareye iki kez ateş etmek bir atışı boşa
harcamak olur; o yüzden denenmiş bir kareyi **görmezden gelir**.

# --code--

```js
function playerShoots(r, c) {
  if (myShots[r][c]) return
  fire(enemyFleet, myShots, r, c)
}
```

# --meaning--

- `null` counts as false, `'miss'` and `'hit'` as true: a square already tried makes `return` leave at once.
- Otherwise it fires at `enemyFleet` and records the result in `myShots`.

# --meaning-tr--

- `if (myShots[r][c]) return` → `null` "yanlış", `'miss'` ve `'hit'` "doğru" sayılır. Kare denendiyse `return` ile
  hemen çık.
- `fire(enemyFleet, myShots, r, c)` → düşman filosuna ateş et, sonucu senin atış tablona yaz.

# --task--

Write `playerShoots` above `function drawSea(`, followed by an empty line.

# --task-tr--

`playerShoots` fonksiyonunu `function drawSea(` satırının **üstüne** yaz; altında bir boş satır kalsın. **Çalıştır**:
kontroller yeşil olmalı (tıklamayı bir sonraki adımda bağlayacağız).

# --tests--

A shot on a ship should hit and a shot on open sea should miss.
tr: Bir gemiye atış isabet etmeli, açık denize atış ıskalamalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
playerShoots(0, 0)
assert.strictEqual(myShots[0][0], 'hit')
playerShoots(5, 5)
assert.strictEqual(myShots[5][5], 'miss')
```

A square already tried should be ignored.
tr: Denenmiş bir kare görmezden gelinmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
myShots[3][3] = 'hit'
playerShoots(3, 3)
assert.strictEqual(myShots[3][3], 'hit', 'no second shot at the same square')
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

let enemyFleet // ships: { cells: [[r, c], ...] }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)

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
      return { cells }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))

// Fire at a square of a fleet and record the result on that shots grid.
function fire(fleet, record, r, c) {
  const ship = shipAt(fleet, r, c)
  if (!ship) {
    record[r][c] = 'miss'
    return 'miss'
  }
  record[r][c] = 'hit'
  return 'hit'
}

function playerShoots(r, c) {
  if (myShots[r][c]) return
  fire(enemyFleet, myShots, r, c)
}

function drawSea(origin, size, shotsGrid) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
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

  drawSea(SEA, BIG, myShots)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, grid(null))
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
