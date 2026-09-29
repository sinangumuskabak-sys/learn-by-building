---
title: Hit or miss?
title_tr: İsabet mi, ıska mı?
skills: [game.state]
---

# --goal--

After your shot, the message says what happened: `Hit!` or `Miss`.

# --goal-tr--

Atıştan sonra mesaj ne olduğunu söylesin: `Hit!` (isabet!) ya da `Miss` (ıska). `fire`'ın sonucu geri verdiğini
hatırla; onu bir değişkende yakalayıp kullanacağız.

# --code--

```js
const result = fire(enemyFleet, myShots, r, c)
message = result === 'miss' ? 'Miss' : 'Hit!'
```

# --meaning--

- `result` keeps what `fire` returned.
- The message becomes `'Miss'` or `'Hit!'`.

# --meaning-tr--

- `const result = fire(...)` → `fire`'ın geri verdiği cevabı (`'miss'` ya da `'hit'`) `result` adıyla sakla.
- `message = result === 'miss' ? 'Miss' : 'Hit!'` → ıskaysa `'Miss'`, değilse `'Hit!'`.

# --task--

In `playerShoots`, change the `fire` line and write the message line under it.

# --task-tr--

`playerShoots` içinde `fire(...)` satırının başına `const result = ` ekle; altına mesaj satırını yaz. **Çalıştır** ve
ateş et: mesaj her atışta değişmeli.

# --tests--

The message should say whether the shot hit.
tr: Mesaj atışın isabet edip etmediğini söylemeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
assert.strictEqual(message, 'Hit!')
$.click(228, 248)
assert.strictEqual(message, 'Miss')
$.tick(1)
assert.include($.texts(), 'Miss')
```

A square already tried should not change the message.
tr: Denenmiş bir kare mesajı değiştirmemeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
message = ''
$.click(48, 68)
assert.strictEqual(message, '')
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
