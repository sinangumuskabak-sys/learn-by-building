---
title: Towers
title_tr: Kuleler
skills: [game.state, game.canvas]
---

# --goal--

Tower kinds live in a small table, `TOWERS`: what they cost, how far they reach, how hard they hit, how long they
reload, and their color. For now there is one kind, `arrow`. Built towers go in a list and are drawn as squares.

# --goal-tr--

Kule **türlerini** küçük bir tabloda tutacağız: `TOWERS`. Her türün fiyatı (`cost`), menzili (`range`, kare), hasarı
(`damage`), yeniden dolma süresi (`reload`, kare) ve rengi var. Şimdilik tek tür: `arrow` (ok kulesi).

Kurulan kuleler bir **listede** duracak ve karelerinin içine küçük kareler olarak çizilecek. Liste boş; kuleyi fareyle
kurmayı yakında yazacağız.

# --code--

```js
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}

let towers

  towers = []

  for (const t of towers) {
    ctx.fillStyle = TOWERS[t.kind].color
    ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
  }
```

# --meaning--

- `TOWERS.arrow` holds everything about arrow towers; a built tower only says which kind it is (`kind: 'arrow'`) and
  where it stands.
- `TOWERS[t.kind]` looks the kind up by a name held in a variable.
- The square is 6 pixels smaller than the tile on each side.

# --meaning-tr--

- `const TOWERS = { arrow: { ... } }` → **nesnenin içinde nesne**: `TOWERS.arrow.cost` 50 altın, `range` 2.5 kare,
  `damage` 4, `reload` 24 kare, `color` açık mavi.
- `let towers` → kurulan kuleler: her biri `{ col, row, kind }` gibi bir nesne olacak. Kule yalnız **türünün adını**
  taşır; bilgilerin kendisi tabloda. Böylece yeni bir tür eklemek bir satır veri olur.
- `TOWERS[t.kind]` → köşeli parantez, adı bir değişkende duran alanı okur: `t.kind` `'arrow'` ise `TOWERS.arrow`.
- `ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)` → karenin içinde, her yandan 6
  piksel boşluklu 28 × 28'lik kare.

# --task--

1. Under `SPEED` write `TOWERS`.
2. Under `let enemies` write `let towers`; in `reset`, under `enemies = []`, write `towers = []`.
3. In `draw`, above the enemies loop, write the towers loop and an empty line.

# --task-tr--

1. `const SPEED = ...` satırının altına `TOWERS` tablosunu yaz.
2. `let enemies` satırının altına `let towers` yaz; `reset` içinde `enemies = []` satırının altına `towers = []` yaz.
3. `draw` içinde düşman döngüsünün **üstüne** kule döngüsünü ve bir boş satır yaz.
4. **Çalıştır**: ekranda fark yok, kontroller yeşil olmalı.

# --try--

In `reset`, write `towers = [{ col: 1, row: 3, kind: 'arrow' }]` and run: a blue tower stands beside the road. Put `[]` back.

# --try-tr--

`reset` içinde `towers = [{ col: 1, row: 3, kind: 'arrow' }]` yaz ve çalıştır: yolun yanında mavi bir kule durur. Sonra `[]`'e geri al.

# --tests--

`TOWERS` should describe the arrow tower.
tr: `TOWERS` ok kulesini tanımlamalı.

```js
assert.deepEqual(TOWERS.arrow, { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' })
```

A tower should be drawn as a square in its kind's color.
tr: Bir kule, türünün renginde bir kare olarak çizilmeli.

```js
assert.deepEqual(towers, [])
towers.push({ col: 1, row: 3, kind: 'arrow' })
$.tick()
assert.deepEqual($.rects('#38bdf8').map((r) => [r.x, r.y, r.w, r.h]), [[46, 166, 28, 28]])
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
const SPEED = 0.03 // tiles per frame
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}

let road // keys of the tiles the road covers
let enemies
let towers
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one

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
  towers = []
  toSpawn = 30
  spawnIn = 0
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

function update() {
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  for (const e of enemies) {
    if (pointAt(e.d) === null) {
      e.hp = 0
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
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

  for (const t of towers) {
    ctx.fillStyle = TOWERS[t.kind].color
    ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
