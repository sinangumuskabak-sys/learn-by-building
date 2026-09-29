---
title: Two fleets
title_tr: İki filo
skills: [game.state]
---

# --goal--

The game has two fleets: the enemy's and yours. `reset()` places both at random, and it runs once at the start.

# --goal-tr--

Oyunda iki filo var: düşmanınki ve seninki. `reset` (sıfırla) ikisini de rastgele dizecek; oyunun başında bir kez
çalışacak. Gemiler henüz görünmüyor: düşmanınkiler zaten gizli olmalı, seninkileri birkaç adım sonra göstereceğiz.

# --code--

```js
let enemyFleet // ships: { cells: [[r, c], ...] }
let myFleet

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
}

reset()
```

# --meaning--

- `enemyFleet` and `myFleet` are two separate random fleets.
- `reset()` is called once, just before the loop starts.

# --meaning-tr--

- `let enemyFleet`, `let myFleet` → iki filo. Yorum bir geminin neye benzediğini hatırlatıyor.
- `function reset()` → iki filoyu da `placeFleet()` ile ayrı ayrı rastgele dizer.
- En alttaki `reset()` → oyun başlarken bir kez; döngüden **önce**.

# --task--

1. Above `const grid`, write the two `let` lines, followed by an empty line.
2. Above `function drawSea(`, write `reset`, followed by an empty line.
3. Write `reset()` just above the last `requestAnimationFrame(loop)`.

# --task-tr--

1. `const grid = ...` satırının **üstüne** iki `let` satırını yaz; altlarında bir boş satır kalsın.
2. `function drawSea(` satırının **üstüne** `reset` fonksiyonunu yaz; altında bir boş satır kalsın.
3. En alttaki `requestAnimationFrame(loop)` satırının **hemen üstüne** `reset()` yaz.
4. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

There should be two fleets of five ships.
tr: Beşer gemilik iki filo olmalı.

```js
assert.lengthOf(enemyFleet, 5)
assert.lengthOf(myFleet, 5)
assert.notStrictEqual(enemyFleet, myFleet)
```

`reset()` should place new fleets.
tr: `reset()` yeni filolar dizmeli.

```js
const old = enemyFleet
reset()
assert.notStrictEqual(enemyFleet, old)
assert.lengthOf(enemyFleet, 5)
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
}

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
