---
title: See your own fleet
title_tr: Kendi filonu gör
skills: [game.canvas]
---

# --goal--

You can see your own ships, grey on your sea; the enemy's stay hidden. `drawSea` gets the fleet and whether to show it.

# --goal-tr--

Kendi gemilerini görebilmelisin: senin denizinde **gri** kareler. Düşmanın gemileri ise gizli kalmalı; yoksa oyunun
tadı kaçar. `drawSea`'ye iki parametre daha ekliyoruz: hangi **filo** ve gemileri **göstereyim mi**.

# --code--

```js
function drawSea(origin, size, shotsGrid, fleet, showShips) {

      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'

  drawSea(SEA, BIG, myShots, enemyFleet, false)

  drawSea(HOME, SMALL, grid(null), myFleet, true)
```

# --meaning--

- A square is grey only if ships are shown and a ship of that fleet is on it.
- The enemy's sea is drawn with `false` (hidden), yours with `true`.

# --meaning-tr--

- `if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'` → gemiler gösteriliyorsa **ve** bu karede bir
  gemi varsa rengi griye çevir. Değilse lacivert kalır.
- `drawSea(SEA, BIG, myShots, enemyFleet, false)` → düşman denizi: gemiler **gizli**.
- `drawSea(HOME, SMALL, grid(null), myFleet, true)` → senin denizin: gemiler **görünür**.

# --task--

1. Add `fleet, showShips` to `drawSea`'s parameters.
2. Under `ctx.fillStyle = '#1e3a8a'` in `drawSea`, write the grey line.
3. In `draw`, add `enemyFleet, false` to the first call and `myFleet, true` to the second.

# --task-tr--

1. `drawSea`'nin parametrelerine `, fleet, showShips` ekle.
2. `drawSea` içinde `ctx.fillStyle = '#1e3a8a'` satırının altına gri satırını yaz.
3. `draw` içinde ilk çağrıya `, enemyFleet, false`, ikinci çağrıya `, myFleet, true` ekle.
4. **Çalıştır**: altta kendi gemilerini görmelisin. Birkaç kez çalıştır: her seferinde başka yerde.

# --tests--

Your ships should be shown on your small sea, and the enemy's hidden.
tr: Gemilerin küçük denizinde gösterilmeli, düşmanınkiler gizlenmeli.

```js
$.tick(1)
const gray = $.rects('#64748b')
assert.lengthOf(gray, 17, 'your 17 ship squares, on the small sea')
for (const g of gray) assert.strictEqual(g.w, SMALL - 2)
assert.lengthOf($.rects('#1e3a8a').filter((r) => r.w === BIG - 2), 100, 'the enemy sea shows nothing')
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
  message = 'Your turn: pick a square'
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
  const result = fire(enemyFleet, myShots, r, c)
  message = result === 'miss' ? 'Miss' : 'Hit!'
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
