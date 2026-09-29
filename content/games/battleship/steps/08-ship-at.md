---
title: Which ship is here?
title_tr: Burada hangi gemi var?
skills: [prog.arrays]
---

# --goal--

Before we can shoot we need one question answered: which ship of a fleet covers square `(r, c)`, if any?

# --goal-tr--

Ateş etmeden önce bir soruyu cevaplayabilmeliyiz: bir filonun hangi gemisi `(r, c)` karesinde? Belki hiçbiri. Bu soruyu
soran kısa bir fonksiyon yazıyoruz: `shipAt` (şurada hangi gemi var).

# --code--

```js
const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))
```

# --meaning--

- `find` returns the first ship for which the test is true, or `undefined`.
- The test: `some` of the ship's squares has the same row and column.

# --meaning-tr--

- `fleet.find((s) => ...)` → filodaki gemileri sırayla sorar; cevabı **ilk** doğru olan gemiyi verir. Hiçbiri değilse
  `undefined` (hiçbir şey) verir.
- `s.cells.some(([sr, sc]) => sr === r && sc === c)` → geminin karelerinden **en az biri** aradığımız satır **ve**
  sütunda mı? `===` "eşit mi?", `&&` "ve".

# --task--

Write the line above `function drawSea(`, followed by an empty line.

# --task-tr--

Satırı `function drawSea(` satırının **üstüne** yaz; altında bir boş satır kalsın. **Çalıştır**: kontroller yeşil
olmalı.

# --tests--

`shipAt` should find the ship on a square, or nothing.
tr: `shipAt` bir karedeki gemiyi bulmalı, yoksa hiçbir şey vermemeli.

```js
const fleet = [{ cells: [[0, 0], [0, 1]] }, { cells: [[5, 5]] }]
assert.strictEqual(shipAt(fleet, 0, 1), fleet[0])
assert.strictEqual(shipAt(fleet, 5, 5), fleet[1])
assert.isUndefined(shipAt(fleet, 3, 3))
assert.isUndefined(shipAt(fleet, 1, 0))
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
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
