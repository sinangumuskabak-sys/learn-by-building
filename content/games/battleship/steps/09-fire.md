---
title: Fire at a square
title_tr: Bir kareye ateş et
skills: [prog.functions, prog.arrays]
---

# --goal--

Your shots are kept in a grid, `myShots`: `null` for a square not tried yet, `'miss'` or `'hit'`. `fire` shoots at a
square of a fleet, writes the result into a grid and returns it.

# --goal-tr--

Atışlarını bir tabloda tutacağız: `myShots`. Her kare `null` (henüz denenmedi), `'miss'` (ıska) ya da `'hit'` (isabet).

`fire` (ateş et) bir filonun bir karesine ateş eder, sonucu bir tabloya yazar ve sonucu geri verir. Filoyu ve tabloyu
**parametre** olarak alıyor, çünkü birkaç adım sonra bilgisayar da **senin** filona aynı fonksiyonla ateş edecek.

# --code--

```js
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)

  myShots = grid(null)

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
```

# --meaning--

- `reset` starts `myShots` as a grid of `null`.
- `fire` looks for a ship on the square. None: record and return `'miss'`. Otherwise record and return `'hit'`.
- `!ship` is true when `shipAt` gave `undefined`.

# --meaning-tr--

- `myShots = grid(null)` → `reset` içinde: her yeni oyunda boş bir atış tablosu.
- `fire(fleet, record, r, c)` → `fleet` hangi filoya, `record` sonucun hangi tabloya yazılacağı, `r, c` kare.
- `const ship = shipAt(fleet, r, c)` → o karede gemi var mı?
- `if (!ship)` → `!` "değil": gemi **yoksa**. Tabloya `'miss'` yaz ve `return 'miss'` ile cevabı ver.
- Varsa tabloya `'hit'` yaz ve `'hit'` ver.
- `record[r][c] = ...` → tablonun `r`. satırının `c`. karesini değiştirir.

# --task--

1. Under `let myFleet` write `let myShots` with its comment.
2. In `reset`, under `myFleet = placeFleet()`, write `myShots = grid(null)`.
3. Above `function drawSea(`, write `fire` with its comment, followed by an empty line.

# --task-tr--

1. `let myFleet` satırının altına yorumuyla `let myShots` yaz.
2. `reset` içinde `myFleet = placeFleet()` satırının altına `myShots = grid(null)` yaz.
3. `function drawSea(` satırının **üstüne** yorumuyla birlikte `fire` fonksiyonunu yaz; altında bir boş satır kalsın.
4. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

A new game should start with no shots.
tr: Yeni oyun hiç atışsız başlamalı.

```js
assert.lengthOf(myShots, N)
assert.isTrue(myShots.flat().every((s) => s === null))
```

`fire` should record and return a hit or a miss.
tr: `fire` isabeti ya da ıskayı kaydetmeli ve vermeli.

```js
const fleet = [{ cells: [[0, 0], [0, 1]] }]
const record = grid(null)
assert.strictEqual(fire(fleet, record, 0, 1), 'hit')
assert.strictEqual(record[0][1], 'hit')
assert.strictEqual(fire(fleet, record, 4, 4), 'miss')
assert.strictEqual(record[4][4], 'miss')
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
