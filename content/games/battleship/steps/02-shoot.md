---
title: Firing
title_tr: Ateş
skills: [game.input, prog.arrays]
---

# --explanation--

Tap a square of the enemy's sea to fire at it. What happened is stored in a second grid, `myShots`: `null` for a square not
tried yet, `'miss'` or `'hit'`. The enemy's ships stay hidden; only your shots are drawn on their sea: a small white dot for a
miss, a big red one for a hit.

Firing twice at the same square would waste a shot, so the game ignores it. That check is just `if (myShots[r][c]) return`, since
`null` counts as false and both `'miss'` and `'hit'` count as true.

`fire(fleet, record, r, c)` does the work: is there a ship of `fleet` on that square? It writes the answer into `record` and
returns it. It takes the fleet and the grid as parameters so that, a few steps later, the computer can fire at **your** fleet with
the very same function.

# --explanation-tr--

Ateş etmek için düşman denizinin bir karesine dokun. Olan şey ikinci bir ızgarada, `myShots`'ta saklanır: henüz denenmemiş bir kare
için `null`, `'miss'` ya da `'hit'`. Düşmanın gemileri gizli kalır; onların denizinde yalnızca senin atışların çizilir: ıska için
küçük beyaz bir nokta, isabet için büyük kırmızı bir nokta.

Aynı kareye iki kez ateş etmek bir atışı boşa harcardı, bu yüzden oyun bunu yok sayar. Bu kontrol yalnızca
`if (myShots[r][c]) return`'dür, çünkü `null` yanlış, `'miss'` ve `'hit'` ikisi de doğru sayılır.

İşi `fire(fleet, record, r, c)` yapar: o karede `fleet`'in bir gemisi var mı? Cevabı `record`'a yazar ve döndürür. Filoyu ve ızgarayı
parametre olarak alır; böylece birkaç adım sonra bilgisayar tam olarak aynı fonksiyonla **senin** filona ateş edebilir.

# --task--

1. Add `myShots` (`grid(null)` in `reset()`) and `message` (`'Pick a square'`).
2. Write `shipAt(fleet, r, c)`, the ship covering that square or `undefined`, and `fire(fleet, record, r, c)`, which records and
   returns `'miss'` or `'hit'`.
3. Write `playerShoots(r, c)`: ignore a square already tried; otherwise fire and set `message` to `'Hit!'` or `'Miss'`.
4. On `pointerdown`, turn the pointer into a square of the enemy's sea and shoot it if it is on the sea.
5. `drawSea` gets the shots grid as its third parameter: a miss is a `'#e2e8f0'` dot of radius `size / 8`, a hit a `'#ef4444'` dot of
   radius `size / 3`, centered in the square. Draw `message` above the sea.

# --task-tr--

1. `myShots` (`reset()`'te `grid(null)`) ve `message` (`'Pick a square'`) ekle.
2. O kareyi kaplayan gemiyi ya da `undefined`'ı veren `shipAt(fleet, r, c)`'yi ve `'miss'` ya da `'hit'`'i kaydeden ve döndüren
   `fire(fleet, record, r, c)`'yi yaz.
3. `playerShoots(r, c)` yaz: zaten denenmiş bir kareyi yok say; değilse ateş et ve `message`'ı `'Hit!'` ya da `'Miss'` yap.
4. `pointerdown`'da işaretçiyi düşman denizinin bir karesine çevir ve denizdeyse ona ateş et.
5. `drawSea` üçüncü parametre olarak atış ızgarasını alır: ıska `size / 8` yarıçaplı `'#e2e8f0'` bir nokta, isabet `size / 3`
   yarıçaplı `'#ef4444'` bir noktadır, karenin ortasında. `message`'ı denizin üstüne çiz.

# --tests--

A shot on a ship should hit and a shot on open sea should miss.
tr: Bir gemiye atış isabet etmeli, açık denize atış ıskalamalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
assert.strictEqual(myShots[0][0], 'hit')
assert.strictEqual(message, 'Hit!')
$.click(228, 248)
assert.strictEqual(myShots[5][5], 'miss')
assert.strictEqual(message, 'Miss')
```

The same square twice, or a tap off the sea, should do nothing.
tr: Aynı kareye iki kez ya da denizin dışına dokunmak hiçbir şey yapmamalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
message = ''
$.click(48, 68)
assert.strictEqual(message, '', 'the same square twice does nothing')
$.click(10, 10)
assert.strictEqual(message, '', 'outside the sea: nothing')
```

Hits and misses should be drawn on the enemy's sea.
tr: İsabetler ve ıskalar düşman denizine çizilmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
$.click(156, 140)
$.tick(1)
assert.deepInclude($.arcs(), { x: 48, y: 68, r: 12, color: '#ef4444' }, 'a hit')
assert.deepInclude($.arcs(), { x: 48 + 36 * 3, y: 68 + 72, r: 4.5, color: '#e2e8f0' }, 'a miss')
assert.include($.texts(), 'Miss')
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
      return { cells }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
  message = 'Pick a square'
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
  message = fire(enemyFleet, myShots, r, c) === 'hit' ? 'Hit!' : 'Miss'
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
