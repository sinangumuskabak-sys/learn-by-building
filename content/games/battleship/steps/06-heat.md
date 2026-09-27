---
title: A heat map of chances
title_tr: Olasılıkların ısı haritası
skills: [prog.loops, prog.functions]
---

# --explanation--

Hunt and target still hunts **at random**. Can the computer know where a ship is *more likely* to be before it hits anything?

Yes, by counting. For every ship still afloat, try **every possible position** on the sea: every start square, across and down.
Throw away the positions that are impossible (off the sea, over a miss, over a sunk ship). Every position that is left adds 1 to
each of its squares. The result is a **heat map**: the number on a square is how many ways a ship could cover it.

Even on an empty sea it is not flat: more positions pass through the middle than through a corner, so the middle is hotter. After a
miss, the squares around it cool down, because fewer ships fit there. And positions that pass through a hit (on a ship not yet sunk)
are the most likely of all, so they count 50 times more. The computer simply shoots the hottest square.

This is how the strongest Battleship programs play, and it brings the average down to about 44 shots. Press H to see the map the
computer is using against you, drawn over your own sea: the brighter the orange, the more likely.

# --explanation-tr--

Avla ve hedefle hâlâ **rastgele** avlanır. Bilgisayar bir şeye isabet etmeden önce bir geminin nerede olmasının *daha olası* olduğunu
bilebilir mi?

Evet, sayarak. Hâlâ yüzen her gemi için denizdeki **her olası konumu** dene: her başlangıç karesi, yatay ve dikey. İmkânsız konumları
at (denizin dışı, bir ıskanın üstü, batmış bir geminin üstü). Kalan her konum, karelerinin her birine 1 ekler. Sonuç bir
**ısı haritasıdır**: bir karedeki sayı, bir geminin onu kaç şekilde kaplayabileceğidir.

Boş bir denizde bile düz değildir: bir köşeden çok ortadan geçen konum vardır, bu yüzden orta daha sıcaktır. Bir ıskadan sonra
çevresindeki kareler soğur, çünkü oraya daha az gemi sığar. Bir isabetten (henüz batmamış bir gemiye) geçen konumlar ise en olası
olanlardır, bu yüzden 50 kat fazla sayılır. Bilgisayar yalnızca en sıcak kareye ateş eder.

En güçlü Amiral Battı programları böyle oynar ve bu, ortalamayı yaklaşık 44 atışa indirir. Bilgisayarın sana karşı kullandığı
haritayı kendi denizinin üstünde görmek için H'ye bas: turuncu ne kadar parlaksa o kadar olası.

# --task--

1. Write `heatMap()`: start from `grid(0)`; for each ship of `myFleet` not sunk, for every start `(r, c)` and both directions, skip
   positions off the sea or over a miss or a sunk ship's square; otherwise add `1 + hits * 50` to each of its squares, where `hits`
   is how many of them are already hits. Finally set every square already shot to 0.
2. `computerShoots()` now fires at the square with the highest heat (the first one found on a tie). `pickSquare` and `untried` are
   no longer needed.
3. Add `showHeat` (`false` in `reset()`), toggled by H. `drawSea` gets a sixth parameter, a heat map or `null`: a square with heat
   is filled `rgba(249, 115, 22, a)`, with `a = 0.15 + 0.85 × heat / (the highest heat)` (two decimals). Your sea is drawn with
   `heatMap()` when `showHeat`, and `H: their heat map` is shown beside it.

# --task-tr--

1. `heatMap()`'i yaz: `grid(0)`'dan başla; `myFleet`'in batmamış her gemisi için her `(r, c)` başlangıcı ve iki yön için, denizin dışındaki
   ya da bir ıskanın veya batmış bir geminin karesinin üstündeki konumları atla; değilse karelerinin her birine `1 + hits * 50` ekle;
   burada `hits` onlardan kaçının zaten isabet olduğudur. Sonunda zaten ateş edilmiş her kareyi 0 yap.
2. `computerShoots()` artık ısısı en yüksek kareye ateş eder (eşitlikte bulunan ilkine). `pickSquare` ve `untried` artık gerekmez.
3. `showHeat` ekle (`reset()`'te `false`), H ile açılıp kapanır. `drawSea` altıncı bir parametre alır, bir ısı haritası ya da `null`:
   ısısı olan bir kare `rgba(249, 115, 22, a)` ile doldurulur; `a = 0.15 + 0.85 × ısı / (en yüksek ısı)` (iki ondalık). Senin denizin
   `showHeat` iken `heatMap()` ile çizilir ve yanında `H: their heat map` gösterilir.

# --tests--

The middle should be hotter than a corner, and a miss should cool its square and its neighbours.
tr: Orta bir köşeden sıcak olmalı ve bir ıska kendi karesini ve komşularını soğutmalı.

```js
myFleet = [{ cells: [[9, 9], [9, 8]], hits: 0 }]
const heat = heatMap()
assert.isAbove(heat[4][4], heat[0][0], 'more ships fit across the middle than into a corner')
theirShots[4][4] = 'miss'
assert.strictEqual(heatMap()[4][4], 0, 'no ship can be where it missed')
assert.isBelow(heatMap()[4][5], heat[4][5], 'and fewer fit next to a miss')
```

The squares next to a hit should be the hottest, and that is where the computer should shoot.
tr: Bir isabetin yanındaki kareler en sıcak olmalı ve bilgisayar oraya ateş etmeli.

```js
myFleet = [{ cells: [[5, 3], [5, 4], [5, 5]], hits: 1 }, { cells: [[0, 0], [0, 1]], hits: 0 }]
theirShots[5][4] = 'hit'
const heat = heatMap()
const around = [heat[5][3], heat[5][5], heat[4][4], heat[6][4]]
const elsewhere = Math.max(...heat.flat().filter((_, i) => ![5 * N + 3, 5 * N + 5, 4 * N + 4, 6 * N + 4].includes(i)))
assert.isAbove(Math.min(...around), elsewhere, 'the squares next to a hit are the hottest')
turn = 'them'
timer = 1
$.tick(1)
assert.isTrue([theirShots[5][3], theirShots[5][5], theirShots[4][4], theirShots[6][4]].some(Boolean), 'and that is where it shoots')
```

The heat map should beat hunt and target, and H should show it.
tr: Isı haritası avla ve hedefle'yi geçmeli ve H onu göstermeli.

```js
let total = 0
for (let g = 0; g < 20; g++) {
  myFleet = placeFleet()
  theirShots = grid(null)
  let n = 0
  while (!myFleet.every(sunk)) {
    const heat = heatMap()
    let b = { r: 0, c: 0 }
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (heat[r][c] > heat[b.r][b.c]) b = { r, c }
    fire(myFleet, theirShots, b.r, b.c)
    n += 1
  }
  total += n
}
assert.isBelow(total / 20, 52, 'better still than hunt and target (about 56)')
reset()
$.press('h')
assert.isTrue(showHeat)
$.tick(1)
assert.isAbove($.rects().filter((r) => r.color.startsWith('rgba(249, 115, 22')).length, 50, 'the heat map is drawn on your sea')
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
let showHeat

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
  showHeat = false
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
// Every placement that avoids misses and sunk ships adds 1 to each of its squares; placements through a hit that
// is not sunk yet are far more likely, so they count much more. The most counted square is the best shot.
function heatMap() {
  const heat = grid(0)
  const sunkCells = new Set(myFleet.filter(sunk).flatMap((s) => s.cells.map(([r, c]) => r * N + c)))
  const afloat = myFleet.filter((s) => !sunk(s)).map((s) => s.cells.length)
  for (const length of afloat) {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (const down of [false, true]) {
          const cells = shipCells(r, c, length, down)
          if (cells.some(([cr, cc]) => cr >= N || cc >= N)) continue
          if (cells.some(([cr, cc]) => theirShots[cr][cc] === 'miss' || sunkCells.has(cr * N + cc))) continue
          const hits = cells.filter(([cr, cc]) => theirShots[cr][cc] === 'hit').length
          for (const [cr, cc] of cells) heat[cr][cc] += 1 + hits * 50
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
  else if (event.key === 'h' || event.key === 'H') showHeat = !showHeat
  else return
  event.preventDefault()
})

function drawSea(origin, size, shotsGrid, fleet, showShips, heat) {
  const max = heat ? Math.max(1, ...heat.flat()) : 1
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'
      // The heat map: brighter where the computer thinks a ship is more likely.
      if (heat && heat[r][c] > 0) ctx.fillStyle = `rgba(249, 115, 22, ${(0.15 + (0.85 * heat[r][c]) / max).toFixed(2)})`
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
  drawSea(SEA, BIG, myShots, enemyFleet, false, null)
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
  drawSea(HOME, SMALL, theirShots, myFleet, true, showHeat ? heatMap() : null)
  const x = HOME.x + N * SMALL + 20
  ctx.fillStyle = 'white'
  ctx.font = '14px sans-serif'
  ctx.fillText('Shots ' + shots, x, HOME.y + 16)
  ctx.fillText('Left: ' + enemyFleet.filter((s) => !sunk(s)).map((s) => s.cells.length).join(' '), x, HOME.y + 38)
  ctx.fillText('H: their heat map', x, HOME.y + 60)
  if (state !== 'playing') ctx.fillText('Tap or Enter: again', x, HOME.y + 82)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
