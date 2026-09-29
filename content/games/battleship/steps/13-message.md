---
title: A message line
title_tr: Bir mesaj satırı
skills: [game.canvas, game.state]
---

# --goal--

A message above the sea tells the player what is going on. It lives in a variable, so any part of the game can change
it.

# --goal-tr--

Denizin üstünde bir **mesaj** satırı olsun: oyuncuya ne olduğunu söylesin. Mesajı bir değişkende tutuyoruz ki oyunun
her yeri onu değiştirebilsin. Başlangıç mesajı: `Your turn: pick a square` (sıra sende: bir kare seç).

# --code--

```js
let message

  message = 'Your turn: pick a square'

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(message, SEA.x, 34)
```

# --meaning--

- `message` is set in `reset` and drawn every frame above the enemy's sea.
- `textAlign = 'left'` makes the point the left end of the text.

# --meaning-tr--

- `let message` → mesaj; değerini `reset` veriyor.
- `ctx.textAlign = 'left'` → verilen nokta yazının **sol ucu**.
- `ctx.fillText(message, SEA.x, 34)` → değişkendeki yazıyı denizin hemen üstüne boyar. Değişken değişince, bir sonraki
  karede ekrandaki yazı da değişir.

# --task--

1. Under `let myShots ...` write `let message`.
2. In `reset`, under `myShots = grid(null)`, write the message line.
3. In `draw`, above `drawSea(SEA, BIG, myShots)`, write the four text lines.

# --task-tr--

1. `let myShots ...` satırının altına `let message` yaz.
2. `reset` içinde `myShots = grid(null)` satırının altına mesaj satırını yaz.
3. `draw` içinde `drawSea(SEA, BIG, myShots)` satırının **üstüne** dört yazı satırını yaz.
4. **Çalıştır**: denizin üstünde `Your turn: pick a square` görmelisin.

# --tests--

The message should be shown above the sea.
tr: Mesaj denizin üstünde görünmeli.

```js
assert.strictEqual(message, 'Your turn: pick a square')
$.tick(1)
assert.include($.texts(), 'Your turn: pick a square')
message = 'Hello'
$.tick(1)
assert.include($.texts(), 'Hello')
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(message, SEA.x, 34)
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
