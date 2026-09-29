---
title: Show the shots
title_tr: Atışları göster
skills: [game.canvas]
---

# --goal--

`drawSea` gets a third parameter, a shots grid. A miss is a small white dot, a hit a big red one, in the middle of the
square.

# --goal-tr--

Atışlar görünsün. `drawSea`'ye üçüncü bir parametre veriyoruz: bir **atış tablosu**. Iska kareye küçük **beyaz** bir
nokta, isabet büyük **kırmızı** bir nokta koyacağız. Düşman denizine senin atışların (`myShots`) çizilecek. Senin
denizine henüz kimse ateş etmiyor; ona şimdilik boş bir tablo veriyoruz.

# --code--

```js
function drawSea(origin, size, shotsGrid) {

      const shot = shotsGrid[r][c]
      if (!shot) continue
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, shot === 'miss' ? size / 8 : size / 3, 0, Math.PI * 2)
      ctx.fill()

  drawSea(SEA, BIG, myShots)

  drawSea(HOME, SMALL, grid(null))
```

# --meaning--

- An untried square (`null`) is skipped with `continue`.
- The dot is a circle in the middle of the square: radius `size / 8` for a miss, `size / 3` for a hit.
- The enemy's sea shows `myShots`; your sea gets an empty grid for now.

# --meaning-tr--

- `const shot = shotsGrid[r][c]` → bu karenin atış sonucu.
- `if (!shot) continue` → `null` "yanlış" sayılır: denenmemiş kareyi atla, sıradakine geç.
- `shot === 'miss' ? '#e2e8f0' : '#ef4444'` → ıskaysa beyaz, değilse kırmızı.
- `ctx.arc(x + size / 2, y + size / 2, yarıçap, 0, Math.PI * 2)` → karenin **ortasında** bir daire. Yarıçap ıskada
  `size / 8` (küçük), isabette `size / 3` (büyük). `0`'dan `Math.PI * 2`'ye tam bir tur.
- Çağrılar: düşman denizine `myShots`; senin denizine şimdilik `grid(null)`, yani boş bir tablo.

# --task--

1. Add `shotsGrid` to `drawSea`'s parameters.
2. In `drawSea`, under the square's `fillRect`, write the six dot lines.
3. In `draw`, pass `myShots` to the enemy's sea and `grid(null)` to yours.

# --task-tr--

1. `drawSea`'nin parametrelerine `, shotsGrid` ekle.
2. `drawSea` içinde kareyi boyayan `ctx.fillRect(...)` satırının altına altı nokta satırını yaz.
3. `draw` içinde düşman denizine `myShots`, senin denizine `grid(null)` ver: `drawSea(SEA, BIG, myShots)` ve
   `drawSea(HOME, SMALL, grid(null))`.
4. **Çalıştır**: henüz atış yok, ekran aynı. Kontroller yeşil olmalı.

# --try--

In `reset`, temporarily write `myShots[4][4] = 'hit'` under `myShots = grid(null)`: a red dot appears. Delete it again.

# --try-tr--

`reset` içinde `myShots = grid(null)` satırının altına geçici olarak `myShots[4][4] = 'hit'` yaz: kırmızı bir nokta belirir. Sonra o satırı sil.

# --tests--

Hits and misses should be drawn on the enemy's sea.
tr: İsabetler ve ıskalar düşman denizine çizilmeli.

```js
myShots[0][0] = 'hit'
myShots[2][3] = 'miss'
$.tick(1)
assert.deepInclude($.arcs(), { x: 48, y: 68, r: 12, color: '#ef4444' }, 'a hit')
assert.deepInclude($.arcs(), { x: 48 + 36 * 3, y: 68 + 72, r: 4.5, color: '#e2e8f0' }, 'a miss')
assert.lengthOf($.arcs(), 2)
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
