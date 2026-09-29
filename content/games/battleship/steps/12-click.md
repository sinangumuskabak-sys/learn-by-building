---
title: Tap to fire
title_tr: Dokun ve ateş et
skills: [game.input]
---

# --goal--

A tap on the enemy's sea fires at that square. The pointer's page position is turned into canvas pixels, then into a
row and a column.

# --goal-tr--

Şimdi düşman denizinde bir kareye **dokunmak** (tıklamak) o kareye ateş etsin. Tıklamanın **sayfadaki** yerini önce
canvas piksellerine, sonra **satır ve sütuna** çeviriyoruz. Denizin dışına yapılan tıklamalar bir şey yapmayacak.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})
```

# --meaning--

- `rect` is where and how big the canvas is shown; the first part of `x` and `y` turns page pixels into canvas pixels.
- Subtracting `SEA.x` and `SEA.y` measures from the sea's corner; dividing by `BIG` and rounding down gives the square.
- Only squares on the sea (0 to 9 both ways) are shot.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → canvas'a basıldığında (tıklama ya da dokunma).
- `rect` → canvas'ın ekranda durduğu kutu. `(event.clientX - rect.left) * canvas.width / rect.width` → tıklamanın
  canvas içindeki `x`'i; canvas ekranda büyütülüp küçültülse de doğru.
- `- SEA.x`, `- SEA.y` → denizin **köşesinden** ölçülen uzaklık.
- `Math.floor(y / BIG)` → 36'ya bölüp aşağı yuvarlayınca **satır** numarası çıkar (örneğin 80 / 36 = 2.2 → 2).
  Sütun da aynı yolla.
- `if (r >= 0 && r < N && c >= 0 && c < N)` → kare denizin **içindeyse** ateş et. Dışarıdaysa satır ya da sütun eksi
  veya 10'dan büyük olur.

# --task--

Write the listener above `function drawSea(`, followed by an empty line.

# --task-tr--

Dinleyiciyi `function drawSea(` satırının **üstüne** yaz; altında bir boş satır kalsın. **Çalıştır** ve düşman denizine
tıkla: beyaz ve kırmızı noktalar belirmeli.

# --hint--

Check the parentheses in the `x` and `y` lines, and that `r` comes from `y`, `c` from `x`.

# --hint-tr--

`x` ve `y` satırlarındaki parantezleri kontrol et; `r` `y`'den, `c` `x`'ten hesaplanır.

# --tests--

A tap on the sea should fire at that square.
tr: Denize dokunmak o kareye ateş etmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
assert.strictEqual(myShots[0][0], 'hit')
$.click(228, 248)
assert.strictEqual(myShots[5][5], 'miss')
```

A tap off the sea should do nothing.
tr: Denizin dışına dokunmak hiçbir şey yapmamalı.

```js
$.click(10, 10)
$.click(400, 300)
assert.isTrue(myShots.flat().every((s) => s === null))
```

Taps should be scaled when the canvas is shown at another size.
tr: Canvas başka boyda gösterildiğinde dokunuşlar ölçeklenmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.canvas.getBoundingClientRect = () => ({ left: 0, top: 0, x: 0, y: 0, width: 210, height: 310, right: 210, bottom: 310 })
$.click(24, 34)
assert.strictEqual(myShots[0][0], 'hit')
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

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
