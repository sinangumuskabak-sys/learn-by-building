---
title: Enemies on the road
title_tr: Yoldaki düşmanlar
skills: [game.canvas]
---

# --goal--

Enemies are kept in a list; each one is an object with its distance `d`. To draw one, `pointAt` gives its point in
tiles, and the middle of that tile in pixels gets a red circle.

# --goal-tr--

Düşmanları bir **listede** tutacağız; her düşman, yürüdüğü mesafeyi (`d`) taşıyan bir nesne. Çizmek için `pointAt`
ona yoldaki yerini söyler (kare olarak); o karenin ortasına kırmızı bir daire çizeriz.

Liste şimdilik boş, o yüzden ekranda düşman görmeyeceksin; kontroller bir düşman koyup deneyecek.

# --code--

```js
let enemies

  enemies = []

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- `p` is the enemy's point in tiles; `(p.x + 0.5) * TILE` is the middle of that tile in pixels.
- A circle is a path: `beginPath`, `arc(x, y, radius, 0, Math.PI * 2)` (a full turn), then `fill`.

# --meaning-tr--

- `let enemies` → düşman listesi; `reset` içinde boş.
- `for (const e of enemies) {` → her düşman için:
  - `const p = pointAt(e.d)` → yoldaki yeri, kare olarak (`p.x` sütun, `p.y` satır; küsuratlı olabilir).
  - `(p.x + 0.5) * TILE` → karenin **ortası**, piksel olarak. `TOP + (p.y + 0.5) * TILE` → aynısı dikeyde.
  - `ctx.beginPath()` → yeni şekil; `ctx.arc(x, y, 11, 0, Math.PI * 2)` → 11 yarıçaplı tam tur çember; `ctx.fill()`
    → içini boya.

# --task--

1. Under `let road` write `let enemies`; in `reset`, under `findRoad()`, write `enemies = []`.
2. At the end of `draw`, after the tile loops and an empty line, write the enemies loop.

# --task-tr--

1. `let road` satırının altına `let enemies` yaz.
2. `reset` içinde `findRoad()` satırının altına `enemies = []` yaz.
3. `draw`'un **sonuna**, kare döngülerinden sonra bir boş satır bırakıp düşman döngüsünü yaz.
4. **Çalıştır**: ekranda fark yok, kontroller yeşil olmalı.

# --try--

In `reset`, write `enemies = [{ d: 10 }, { d: 20 }]` and run: two enemies stand on the road. Put `[]` back.

# --try-tr--

`reset` içinde `enemies = [{ d: 10 }, { d: 20 }]` yaz ve çalıştır: yolda iki düşman durur. Sonra `[]`'e geri al.

# --tests--

An enemy should be drawn as a red circle on its point of the road.
tr: Düşman, yoldaki yerinde kırmızı bir daire olarak çizilmeli.

```js
assert.deepEqual(enemies, [])
enemies = [{ d: 6 }]
$.tick()
const [e] = $.arcs().filter((a) => a.color === '#dc2626')
assert.deepEqual([e.x, e.y, e.r], [140, 40 + 3.5 * 40, 11])
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]

let road // keys of the tiles the road covers
let enemies

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
  enemies = []
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
