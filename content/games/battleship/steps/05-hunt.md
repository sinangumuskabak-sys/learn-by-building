---
title: Hunt and target
title_tr: Avla ve hedefle
skills: [prog.loops, game.state]
---

# --explanation--

A person plays very differently from our random computer. After a hit, you do not wander off: you try the squares **next to it**,
because the rest of the ship must be there. That is the classic **hunt and target** strategy:

- **target**: if there is a hit on a ship that is not sunk yet, shoot an untried square right next to it (above, below, left or
  right);
- **hunt**: otherwise, shoot at random as before.

Once the ship sinks there is no reason to keep shooting around it, which is why the computer checks `sunk(ship)`: the game tells
both players when a ship goes down, so it is fair for the computer to know too.

This one idea cuts the average from about 95 shots to about 56. The code is a loop over the grid looking for a hit worth following
up, then the four neighbours of it. The first untried one is the next shot.

# --explanation-tr--

Bir insan rastgele bilgisayarımızdan çok farklı oynar. Bir isabetten sonra başka yere gitmezsin: **yanındaki** kareleri denersin,
çünkü geminin geri kalanı orada olmalıdır. Klasik **avla ve hedefle** stratejisi budur:

- **hedefle**: henüz batmamış bir gemide bir isabet varsa hemen yanındaki denenmemiş bir kareye (üst, alt, sol ya da sağ) ateş et;
- **avla**: değilse önceki gibi rastgele ateş et.

Gemi batınca çevresine ateş etmeye devam etmek için bir sebep kalmaz; bilgisayarın `sunk(ship)`'e bakmasının sebebi budur: oyun bir gemi
battığında iki oyuncuya da söyler, bu yüzden bilgisayarın da bilmesi adildir.

Bu tek fikir ortalamayı yaklaşık 95 atıştan yaklaşık 56'ya düşürür. Kod, ızgarada peşine düşmeye değer bir isabet arayan, sonra onun dört
komşusuna bakan bir döngüdür. Denenmemiş ilk komşu sonraki atıştır.

# --task--

1. In `pickSquare()`, first look for a square of `theirShots` that is a hit on a ship of `myFleet` that is not sunk; for the first
   one found, return the first of its four neighbours that is on the sea and untried. Only if there is none, pick a random untried
   square.

# --task-tr--

1. `pickSquare()`'de önce `theirShots`'ta `myFleet`'in batmamış bir gemisine isabet olan bir kare ara; bulunan ilki için dört komşusundan
   denizde olan ve denenmemiş ilkini döndür. Yalnızca hiç yoksa rastgele denenmemiş bir kare seç.

# --tests--

After a hit on a ship still afloat, the computer should shoot right next to it.
tr: Hâlâ yüzen bir gemiye isabetten sonra bilgisayar hemen yanına ateş etmeli.

```js
myFleet = [{ cells: [[5, 3], [5, 4], [5, 5], [5, 6]], hits: 1 }]
theirShots[5][4] = 'hit'
for (let i = 0; i < 10; i++) {
  const s = pickSquare()
  assert.strictEqual(Math.abs(s.r - 5) + Math.abs(s.c - 4), 1, 'right next to the hit')
}
```

Once a ship is sunk, the computer should stop shooting around it.
tr: Bir gemi batınca bilgisayar onun çevresine ateş etmeyi bırakmalı.

```js
myFleet = [{ cells: [[5, 3], [5, 4]], hits: 2 }, { cells: [[0, 0], [0, 1], [0, 2]], hits: 0 }]
theirShots[5][3] = theirShots[5][4] = 'hit'
const s = pickSquare()
assert.isNull(theirShots[s.r][s.c], 'a sunk ship is not hunted any more')
```

Hunt and target should need far fewer shots than random shooting.
tr: Avla ve hedefle, rastgele atıştan çok daha az atışa ihtiyaç duymalı.

```js
let total = 0
for (let g = 0; g < 20; g++) {
  myFleet = placeFleet()
  theirShots = grid(null)
  let n = 0
  while (!myFleet.every(sunk)) {
    const s = pickSquare()
    fire(myFleet, theirShots, s.r, s.c)
    n += 1
  }
  total += n
}
assert.isBelow(total / 20, 75, 'far better than shooting at random (about 95)')
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

const untried = () => {
  const out = []
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!theirShots[r][c]) out.push({ r, c })
  return out
}

// Target: a square next to a hit on a ship that is not sunk yet. Hunt: otherwise, any square left.
function pickSquare() {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const ship = theirShots[r][c] === 'hit' && shipAt(myFleet, r, c)
      if (!ship || sunk(ship)) continue
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && !theirShots[nr][nc]) return { r: nr, c: nc }
      }
    }
  }
  const left = untried()
  return left[Math.floor(Math.random() * left.length)]
}

function computerShoots() {
  const bestCell = pickSquare()
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
  if (state !== 'playing') return reset()
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && state !== 'playing') reset()
  else return
  event.preventDefault()
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
  const x = HOME.x + N * SMALL + 20
  ctx.fillStyle = 'white'
  ctx.font = '14px sans-serif'
  ctx.fillText('Shots ' + shots, x, HOME.y + 16)
  ctx.fillText('Left: ' + enemyFleet.filter((s) => !sunk(s)).map((s) => s.cells.length).join(' '), x, HOME.y + 38)
  if (state !== 'playing') ctx.fillText('Tap or Enter: again', x, HOME.y + 60)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
