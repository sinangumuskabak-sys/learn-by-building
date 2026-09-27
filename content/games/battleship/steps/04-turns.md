---
title: The computer fires back
title_tr: Bilgisayar karşılık veriyor
skills: [game.state, prog.functions]
---

# --explanation--

Now it is a real game: after each of your shots, the computer fires at **your** sea. Thanks to `fire(fleet, record, r, c)` this is
the same function with the other fleet and another grid, `theirShots`.

Turns are a tiny state machine: `turn` is `'you'` or `'them'`. After you shoot it becomes `'them'` and a `timer` starts, so the
computer's shot comes a moment later instead of instantly, which is easier to follow. While it is the computer's turn, your taps
are ignored.

The first computer player is as simple as possible: it picks **any square it has not tried**, at random. We collect the untried
squares in a list and pick one. It never wastes a shot on the same square, but it has no idea where your ships might be; it needs
about 95 shots to sink a fleet, almost the whole sea. The next two steps make it much smarter, and you can measure the
difference.

# --explanation-tr--

Artık gerçek bir oyun: her atışından sonra bilgisayar **senin** denizine ateş eder. `fire(fleet, record, r, c)` sayesinde bu, diğer
filo ve başka bir ızgarayla, `theirShots`'la aynı fonksiyondur.

Sıralar küçük bir durum makinesidir: `turn`, `'you'` ya da `'them'`'dir. Sen ateş edince `'them'` olur ve bir `timer` başlar; böylece
bilgisayarın atışı hemen değil bir an sonra gelir, bu da izlemeyi kolaylaştırır. Sıra bilgisayardayken dokunuşların yok sayılır.

İlk bilgisayar oyuncusu olabildiğince basittir: **denemediği herhangi bir kareyi** rastgele seçer. Denenmemiş kareleri bir listede
toplar ve birini seçeriz. Aynı kareye asla atış harcamaz ama gemilerinin nerede olabileceği hakkında hiçbir fikri yoktur; bir filoyu
batırmak için yaklaşık 95 atışa, neredeyse bütün denize ihtiyacı vardır. Sonraki iki adım onu çok daha akıllı yapar ve farkı
ölçebilirsin.

# --task--

1. Add `THINK = 30`, and `theirShots`, `turn` and `timer` (`grid(null)` and `'you'` in `reset()`). `state` can also be `'lost'`.
2. `playerShoots` only works on your turn; after a shot that did not win, set `turn = 'them'` and `timer = THINK`.
3. Write `untried()`, the list of `{ r, c }` not in `theirShots` yet, and `pickSquare()`, a random one of them.
4. Write `computerShoots()`: fire at `myFleet` on `pickSquare()`, say `'They sank your ship!'` when it sinks one (otherwise
   `'Your turn: pick a square'`); if your whole fleet is sunk set `'lost'` and `'They sank your fleet'`, otherwise give the turn back.
5. `update()`, called before `draw()`, counts the timer down on the computer's turn and shoots at 0. Draw `theirShots` on your sea.

# --task-tr--

1. `THINK = 30` ve `theirShots`, `turn` ve `timer` ekle (`reset()`'te `grid(null)` ve `'you'`). `state` artık `'lost'` da olabilir.
2. `playerShoots` yalnızca senin sıranda çalışır; kazandırmayan bir atıştan sonra `turn = 'them'` ve `timer = THINK` yap.
3. Henüz `theirShots`'ta olmayan `{ r, c }`'lerin listesi `untried()`'ı ve onlardan rastgele biri `pickSquare()`'i yaz.
4. `computerShoots()` yaz: `pickSquare()`'de `myFleet`'e ateş et, bir gemi batırınca `'They sank your ship!'` de (değilse
   `'Your turn: pick a square'`); bütün filon battıysa `'lost'` ve `'They sank your fleet'` yap, değilse sırayı geri ver.
5. `draw()`'dan önce çağrılan `update()`, bilgisayarın sırasında sayacı azaltır ve 0'da ateş eder. `theirShots`'ı senin denizine çiz.

# --tests--

After your shot the computer should wait, fire once, and give the turn back.
tr: Senin atışından sonra bilgisayar beklemeli, bir kez ateş etmeli ve sırayı geri vermeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]], hits: 0 }]
$.click(228, 248)
assert.strictEqual(turn, 'them')
$.click(264, 284)
assert.isNull(myShots[6][6], 'not your turn')
$.tick(THINK)
assert.strictEqual(turn, 'you')
assert.lengthOf(theirShots.flat().filter(Boolean), 1, 'the computer took one shot')
```

Sooner or later the computer should sink your fleet.
tr: Er ya da geç bilgisayar filonu batırmalı.

```js
myFleet = [{ cells: [[0, 0]], hits: 0 }]
enemyFleet = [{ cells: [[9, 9], [9, 8]], hits: 0 }]
let r = 0
let c = 0
for (let i = 0; i < 99 && state === 'playing'; i++) {
  playerShoots(r, c)
  c += 1
  if (c === N) {
    c = 0
    r += 1
  }
  $.tick(THINK)
}
assert.strictEqual(state, 'lost', 'sooner or later it finds your ship')
$.tick(1)
assert.include($.texts(), 'They sank your fleet')
```

The computer should never fire at the same square twice.
tr: Bilgisayar asla aynı kareye iki kez ateş etmemeli.

```js
myFleet = [{ cells: [[9, 9], [9, 8]], hits: 0 }]
for (let i = 0; i < 99; i++) {
  const s = pickSquare()
  assert.isNull(theirShots[s.r][s.c], 'never the same square twice')
  fire(myFleet, theirShots, s.r, s.c)
}
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

// Any square it has not tried yet, at random.
function pickSquare() {
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
