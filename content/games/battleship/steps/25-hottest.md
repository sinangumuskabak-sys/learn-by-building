---
title: Shoot the hottest square
title_tr: En sıcak kareye ateş
skills: [prog.loops]
---

# --goal--

The computer stops guessing at random: it shoots the square with the highest heat.

# --goal-tr--

Bilgisayar artık rastgele atmasın: ısı haritasındaki **en sıcak** kareye ateş etsin. En büyüğü bulmak için bütün
karelere bakıp şimdiye kadarki en iyiyi aklımızda tutacağız.

# --code--

```js
function computerShoots() {
  const heat = heatMap()
  let bestCell = null
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!bestCell || heat[r][c] > heat[bestCell.r][bestCell.c]) bestCell = { r, c }
    }
  }
  const result = fire(myFleet, theirShots, bestCell.r, bestCell.c)
```

# --meaning--

- `bestCell` remembers the hottest square seen so far; it starts empty (`null`).
- A square replaces it when there is none yet or it is hotter.
- On a tie the first one found stays.

# --meaning-tr--

- `let bestCell = null` → şimdiye kadar görülen en sıcak kare; başta hiç yok.
- `if (!bestCell || heat[r][c] > ...)` → henüz bir aday yoksa **ya da** bu kare daha sıcaksa, yeni aday bu. Bir
  listedeki en büyüğü bulmanın klasik yolu.
- Eşitlikte ilk bulunan kalır (`>` kullandık, `>=` değil).
- `fire(..., bestCell.r, bestCell.c)` → seçilen kareye ateş.

# --task--

In `computerShoots`, replace everything from `let r` to the `fire(...)` line with the new lines.

# --task-tr--

`computerShoots` içinde `let r` satırından `const result = fire(...)` satırına kadar olan kısmı sil; yerine yeni satırları yaz. **Çalıştır**: bilgisayar artık ortalara ateş etmeyi seviyor.

# --predict--

On an empty sea, where will the computer's first shot land?
- [ ] In a corner
- [x] Near the middle
  A ship can lie over a middle square in many more ways than over a corner.
- [ ] Anywhere, at random

# --predict-tr--

Boş bir denizde bilgisayarın ilk atışı nereye düşer?
- [ ] Bir köşeye
- [x] Ortaya yakın bir yere
  Bir gemi ortadaki bir karenin üstüne köşedekinden çok daha fazla şekilde oturabilir.
- [ ] Rastgele bir yere

# --tests--

The computer should shoot the square with the highest heat.
tr: Bilgisayar ısısı en yüksek kareye ateş etmeli.

```js
myFleet = [{ cells: [[9, 5], [9, 6], [9, 7], [9, 8], [9, 9]], hits: 0 }]
theirShots = Array.from({ length: 10 }, () => Array(10).fill(null))
turn = 'them'
timer = 1
update()
assert.strictEqual(theirShots[4][4], 'miss')
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
const THINK = 30 // frames the computer waits before it shoots

let enemyFleet // ships: { cells: [[r, c], ...], hits }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
let theirShots // the same, on your sea
let turn // 'you' or 'them'
let timer
let message
let state // 'playing', 'won' or 'lost'
let shots // how many shots you took

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
      return { cells, hits: 0 }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
  theirShots = grid(null)
  turn = 'you'
  message = 'Your turn: pick a square'
  state = 'playing'
  shots = 0
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))
const sunk = (ship) => ship.hits === ship.cells.length

// Fire at a square of a fleet and record the result on that shots grid.
function fire(fleet, record, r, c) {
  const ship = shipAt(fleet, r, c)
  if (!ship) {
    record[r][c] = 'miss'
    return 'miss'
  }
  record[r][c] = 'hit'
  ship.hits += 1
  return sunk(ship) ? 'sunk' : 'hit'
}

function playerShoots(r, c) {
  if (state !== 'playing' || turn !== 'you' || myShots[r][c]) return
  shots += 1
  const result = fire(enemyFleet, myShots, r, c)
  message = result === 'miss' ? 'Miss' : result === 'hit' ? 'Hit!' : 'You sank a ship!'
  if (enemyFleet.every(sunk)) {
    state = 'won'
    message = 'You won in ' + shots + ' shots!'
    return
  }
  turn = 'them'
  timer = THINK
}

// How many ways could the ships still afloat lie on the sea, given what the computer knows?
function heatMap() {
  const heat = grid(0)
  const afloat = myFleet.filter((s) => !sunk(s)).map((s) => s.cells.length)
  for (const length of afloat) {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (const down of [false, true]) {
          const cells = shipCells(r, c, length, down)
          if (cells.some(([cr, cc]) => cr >= N || cc >= N)) continue
          if (cells.some(([cr, cc]) => theirShots[cr][cc] === 'miss')) continue
          for (const [cr, cc] of cells) heat[cr][cc] += 1
        }
      }
    }
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (theirShots[r][c]) heat[r][c] = 0
  return heat
}

function computerShoots() {
  const heat = heatMap()
  let bestCell = null
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!bestCell || heat[r][c] > heat[bestCell.r][bestCell.c]) bestCell = { r, c }
    }
  }
  const result = fire(myFleet, theirShots, bestCell.r, bestCell.c)
  message = result === 'sunk' ? 'They sank your ship!' : 'Your turn: pick a square'
  if (myFleet.every(sunk)) {
    state = 'lost'
    message = 'They sank your fleet'
    return
  }
  turn = 'you'
}

function update() {
  if (state === 'playing' && turn === 'them' && --timer === 0) computerShoots()
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
      const ship = shot === 'hit' && shipAt(fleet, r, c)
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : ship && sunk(ship) ? '#7f1d1d' : '#ef4444'
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
  // Sunk enemy ships are outlined so you can see what is left.
  ctx.strokeStyle = '#fca5a5'
  ctx.lineWidth = 2
  for (const ship of enemyFleet.filter(sunk)) {
    const rs = ship.cells.map(([r]) => r)
    const cs = ship.cells.map(([, c]) => c)
    ctx.strokeRect(SEA.x + Math.min(...cs) * BIG + 2, SEA.y + Math.min(...rs) * BIG + 2, (Math.max(...cs) - Math.min(...cs) + 1) * BIG - 4, (Math.max(...rs) - Math.min(...rs) + 1) * BIG - 4)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, theirShots, myFleet, true)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
