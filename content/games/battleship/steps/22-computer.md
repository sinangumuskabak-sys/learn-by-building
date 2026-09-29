---
title: The computer shoots back
title_tr: Bilgisayar karşılık veriyor
skills: [game.loop, prog.loops]
---

# --goal--

Now the computer plays: when its timer runs out, it picks a random square on your sea it has not shot yet, fires,
and gives the turn back.

# --goal-tr--

Bilgisayar oynuyor: sayacı bitince senin denizinde **daha önce ateş etmediği** rastgele bir kare seçer, ateş eder ve
sırayı sana geri verir. Şimdilik akılsız, rastgele atıyor; birkaç adım sonra onu **akıllı** yapacağız.

Sayacı her karede azaltacak bir `update` fonksiyonu da gerekiyor; döngü onu çağıracak.

# --code--

```js
function computerShoots() {
  let r
  let c
  do {
    r = Math.floor(Math.random() * N)
    c = Math.floor(Math.random() * N)
  } while (theirShots[r][c])
  const result = fire(myFleet, theirShots, r, c)
  message = result === 'sunk' ? 'They sank your ship!' : 'Your turn: pick a square'
  turn = 'you'
}

function update() {
  if (state === 'playing' && turn === 'them' && --timer === 0) computerShoots()
}

  update()
```

# --meaning--

- The `do ... while` keeps picking a random square until it finds one not shot yet.
- It fires with the same `fire` function you use, on your fleet and its own record.
- `--timer` subtracts 1 first and then compares: after 30 frames it reaches 0 and the computer shoots.

# --meaning-tr--

- `do { ... } while (theirShots[r][c])` → önce rastgele bir kare seç, sonra: o kareye zaten ateş edildiyse
  **tekrar seç**. Boş bir kare bulunca döngü biter.
- `fire(myFleet, theirShots, r, c)` → senin kullandığın `fire` fonksiyonunun aynısı; bu sefer **senin** filona ve
  **onların** kaydına.
- `message = result === 'sunk' ? ... : ...` → gemin battıysa haber ver, değilse sıranın sende olduğunu söyle.
- `--timer === 0` → `--` önce 1 **azaltır**, sonra karşılaştırır. 30 karede sıfıra iner ve bilgisayar ateş eder.
- `update()` döngüde `draw()`'dan önce: her karede önce durum güncellenir, sonra çizilir.

# --task--

1. Under `playerShoots`, write `computerShoots` and `update`.
2. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `playerShoots` fonksiyonunun altına bir boş satır bırakıp `computerShoots` ve `update` fonksiyonlarını yaz.
2. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır**, ateş et ve küçük haritanı izle: yarım saniye sonra bir atış gelmeli.

# --tests--

Half a second after your shot, the computer should shoot once and give the turn back.
tr: Atışından yarım saniye sonra bilgisayar bir kez ateş etmeli ve sırayı geri vermeli.

```js
const count = (g) => g.flat().filter(Boolean).length
enemyFleet = [{ cells: [[9, 9]], hits: 0 }]
playerShoots(0, 0)
$.tick(20)
assert.strictEqual(count(theirShots), 0, 'not yet')
$.tick(15)
assert.strictEqual(count(theirShots), 1)
assert.strictEqual(turn, 'you')
```

The computer should never shoot the same square twice.
tr: Bilgisayar aynı kareye iki kez ateş etmemeli.

```js
const count = (g) => g.flat().filter(Boolean).length
for (let i = 0; i < 99; i++) {
  turn = 'them'
  timer = 1
  update()
}
assert.strictEqual(count(theirShots), 99)
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

function computerShoots() {
  let r
  let c
  do {
    r = Math.floor(Math.random() * N)
    c = Math.floor(Math.random() * N)
  } while (theirShots[r][c])
  const result = fire(myFleet, theirShots, r, c)
  message = result === 'sunk' ? 'They sank your ship!' : 'Your turn: pick a square'
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
