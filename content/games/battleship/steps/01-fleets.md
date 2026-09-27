---
title: Two seas, two fleets
title_tr: İki deniz, iki filo
skills: [prog.arrays, prog.loops]
---

# --explanation--

Battleship is played on two 10 by 10 seas: the enemy's, where you shoot, with its ships hidden, and yours, small at the bottom,
where you can see your own fleet. Each fleet has ships of length 5, 4, 3, 3 and 2.

A ship is a list of the squares it covers. `shipCells(r, c, length, down)` builds that list for a ship starting at `(r, c)`, going
right or down.

**Placing a fleet at random** is a classic small algorithm: for each ship, pick a random direction and a random start where it
fits on the sea, and check it does not overlap a ship already placed. If it does, just try again. A grid of `taken` squares makes
the check quick. `for (;;)` is a loop with no condition, left with `return` as soon as a spot works. With a 10 by 10 sea and only
17 squares of ships, a free spot is always found within a few tries.

# --explanation-tr--

Amiral Battı iki 10'a 10 denizde oynanır: ateş ettiğin, gemileri gizli düşman denizi ve altta küçük, kendi filonu görebildiğin
senin denizin. Her filonun 5, 4, 3, 3 ve 2 uzunluğunda gemileri vardır.

Bir gemi, kapladığı karelerin bir listesidir. `shipCells(r, c, length, down)`, `(r, c)`'den başlayıp sağa ya da aşağı giden bir gemi
için bu listeyi kurar.

**Bir filoyu rastgele yerleştirmek** klasik küçük bir algoritmadır: her gemi için rastgele bir yön ve denize sığdığı rastgele bir
başlangıç seç ve daha önce yerleştirilmiş bir gemiyle örtüşmediğini kontrol et. Örtüşüyorsa yeniden dene. `taken` karelerinden bir
ızgara kontrolü hızlandırır. `for (;;)` koşulsuz bir döngüdür ve bir yer işe yarar yaramaz `return` ile çıkılır. 10'a 10 bir denizde ve
yalnızca 17 gemi karesiyle birkaç denemede her zaman boş bir yer bulunur.

# --task--

1. Add `N = 10`, `SHIPS = [5, 4, 3, 3, 2]`, `BIG = 36`, `SMALL = 20`, `SEA = { x: 30, y: 50 }` and `HOME = { x: 30, y: 440 }`.
2. Write `grid(value)` (an `N` by `N` array filled with `value`) and `shipCells(r, c, length, down)`.
3. Write `placeFleet()`: for each length in `SHIPS`, retry random placements until one fits without overlapping, and return the
   ships as `{ cells }`. `reset()` places `enemyFleet` and `myFleet`.
4. Write `drawSea(origin, size, fleet, showShips)`: every square `'#1e3a8a'` (1 pixel in from its sides), or `'#64748b'` for a ship
   square when `showShips`. Draw the enemy sea with `BIG` squares and ships hidden, and yours with `SMALL` squares and ships shown,
   with the titles in the solution.

# --task-tr--

1. `N = 10`, `SHIPS = [5, 4, 3, 3, 2]`, `BIG = 36`, `SMALL = 20`, `SEA = { x: 30, y: 50 }` ve `HOME = { x: 30, y: 440 }` ekle.
2. `grid(value)` (`value` ile dolu `N`'ye `N` bir dizi) ve `shipCells(r, c, length, down)` yaz.
3. `placeFleet()` yaz: `SHIPS`'teki her uzunluk için örtüşmeden sığan birini bulana kadar rastgele yerleşimleri yeniden dene ve
   gemileri `{ cells }` olarak döndür. `reset()`, `enemyFleet` ve `myFleet`'i yerleştirir.
4. `drawSea(origin, size, fleet, showShips)` yaz: her kare `'#1e3a8a'` (kenarlarından 1 piksel içeride), ya da `showShips` iken bir
   gemi karesi için `'#64748b'`. Düşman denizini `BIG` karelerle ve gemiler gizli, seninkini `SMALL` karelerle ve gemiler görünür
   olarak, çözümdeki başlıklarla çiz.

# --tests--

Every fleet should have straight ships of the right lengths, on the sea, never overlapping.
tr: Her filonun doğru uzunlukta, denizde, asla örtüşmeyen düz gemileri olmalı.

```js
for (let i = 0; i < 50; i++) {
  const fleet = placeFleet()
  assert.deepEqual(fleet.map((s) => s.cells.length), [5, 4, 3, 3, 2])
  const seen = new Set()
  for (const ship of fleet) {
    const rows = new Set(ship.cells.map(([r]) => r))
    const cols = new Set(ship.cells.map(([, c]) => c))
    assert.isTrue(rows.size === 1 || cols.size === 1, 'a ship is a straight line')
    for (const [r, c] of ship.cells) {
      assert.isTrue(r >= 0 && r < N && c >= 0 && c < N, 'on the sea')
      assert.isFalse(seen.has(r * N + c), 'ships do not overlap')
      seen.add(r * N + c)
    }
  }
}
```

`shipCells` and `grid` should build the right lists.
tr: `shipCells` ve `grid` doğru listeleri kurmalı.

```js
assert.deepEqual(shipCells(2, 3, 3, false), [[2, 3], [2, 4], [2, 5]])
assert.deepEqual(shipCells(2, 3, 2, true), [[2, 3], [3, 3]])
assert.lengthOf(grid(0), N)
assert.deepEqual(grid(7)[4], Array(N).fill(7))
```

Your ships should be shown on your small sea, and the enemy's hidden.
tr: Gemilerin küçük denizinde gösterilmeli, düşmanınkiler gizlenmeli.

```js
$.tick(1)
const gray = $.rects('#64748b')
assert.lengthOf(gray, 17, 'your 17 ship squares, on the small sea')
for (const g of gray) assert.strictEqual(g.w, SMALL - 2)
assert.lengthOf($.rects('#1e3a8a').filter((r) => r.w === BIG - 2), 100, 'the enemy sea shows nothing')
```

# --seed--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
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

function drawSea(origin, size, fleet, showShips) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && fleet.some((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))) ctx.fillStyle = '#64748b'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('The enemy fleet is hidden here', SEA.x, 34)
  drawSea(SEA, BIG, enemyFleet, false)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, myFleet, true)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
