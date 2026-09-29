---
title: Take turns
title_tr: Sırayla
skills: [game.state]
---

# --goal--

Battleship is played in turns. After your shot it is the computer's turn, and a `timer` makes it wait half a second
before it shoots, so you can see what happens.

# --goal-tr--

Amiral Battı **sırayla** oynanır. Senin atışından sonra sıra bilgisayara geçsin. Bilgisayar hemen ateş etmesin; yarım
saniye (30 kare) **düşünüyormuş gibi** beklesin ki ne olduğunu görebilesin. Bunun için bir **sayaç** (`timer`)
kullanacağız.

# --code--

```js
const THINK = 30 // frames the computer waits before it shoots
let turn // 'you' or 'them'
let timer

  turn = 'you'

  if (state !== 'playing' || turn !== 'you' || myShots[r][c]) return

  turn = 'them'
  timer = THINK
```

# --meaning--

- `turn` says whose turn it is; the game starts with yours.
- `playerShoots` refuses to shoot when it is not your turn.
- After a shot that did not win, the turn passes and the timer starts at 30 frames.

# --meaning-tr--

- `const THINK = 30` → bilgisayarın bekleyeceği kare sayısı (60 kare = 1 saniye).
- `let turn` → sıra kimde: `'you'` (sen) ya da `'them'` (onlar). `reset` onu `'you'` yapar.
- `turn !== 'you'` → `playerShoots`'un ilk satırındaki koşullara eklendi: sıra sende değilse ateş etme.
- `turn = 'them'` → kazanmayan bir atıştan sonra sıra bilgisayara geçer.
- `timer = THINK` → geri sayım 30'dan başlar. Bilgisayarı sonraki adımda yazacağız.

# --task--

1. Under `HOME`, write `THINK`; under `let theirShots`, write `turn` and `timer`.
2. In `reset`, under `theirShots = grid(null)`, write `turn = 'you'`.
3. In `playerShoots`, add `turn !== 'you' || ` to the first line, and write the two lines at the end.

# --task-tr--

1. `const HOME = ...` satırının altına `THINK` satırını; `let theirShots ...` satırının altına `turn` ve `timer`
   satırlarını yaz.
2. `reset` içinde `theirShots = grid(null)` satırının altına `turn = 'you'` yaz.
3. `playerShoots`'un ilk satırında `state !== 'playing' || ` sonrasına `turn !== 'you' || ` ekle.
4. `playerShoots`'un en sonuna, `if (enemyFleet.every(sunk)) { ... }` bloğunun altına iki satırı yaz.
5. **Çalıştır** ve bir kareye ateş et.

# --predict--

You shoot once. Then you try to shoot again. What happens?
- [ ] The second shot works too
- [x] Nothing: it is the computer's turn, and it never shoots yet
  So the game is stuck for now. The next step makes the computer play.
- [ ] The game ends

# --predict-tr--

Bir kez ateş ettin. Sonra yine ateş etmeye çalışıyorsun. Ne olur?
- [ ] İkinci atış da olur
- [x] Hiçbir şey: sıra bilgisayarda, o da henüz hiç ateş etmiyor
  Yani oyun şimdilik takılı kalır. Sıradaki adım bilgisayarı oynatıyor.
- [ ] Oyun biter

# --tests--

After your shot it should be the computer's turn, with the timer set.
tr: Atışından sonra sıra bilgisayara geçmeli ve sayaç kurulmalı.

```js
enemyFleet = [{ cells: [[9, 9]], hits: 0 }]
playerShoots(0, 0)
assert.strictEqual(turn, 'them')
assert.strictEqual(timer, 30)
```

You should not be able to shoot while it is not your turn.
tr: Sıra sende değilken ateş edememelisin.

```js
enemyFleet = [{ cells: [[9, 9]], hits: 0 }]
playerShoots(0, 0)
playerShoots(0, 1)
assert.isNull(myShots[0][1])
assert.strictEqual(shots, 1)
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
