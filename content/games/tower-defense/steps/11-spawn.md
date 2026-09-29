---
title: Here they come
title_tr: İşte geliyorlar
skills: [game.state, game.loop]
---

# --goal--

Enemies arrive one at a time: `spawnIn` counts down every frame, and when it runs out a new enemy starts at `d = 0`
with 10 health, and the countdown starts again at 45. `toSpawn` says how many are still to come.

# --goal-tr--

Düşmanlar **teker teker** gelsin. İki sayaç kullanıyoruz:

- `toSpawn` → daha kaç düşman gelecek (şimdilik 30),
- `spawnIn` → bir sonrakine kaç kare (frame) var.

`spawnIn` her karede bir azalır; bitince yolun başına (`d = 0`) 10 canlı yeni bir düşman gelir ve sayaç 45'ten
yeniden başlar: saniyede yaklaşık 1.3 düşman.

# --code--

```js
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one

  toSpawn = 30
  spawnIn = 0

function update() {
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10 })
      toSpawn -= 1
      spawnIn = 45
    }
  }
```

# --meaning--

- While enemies are left to come, `spawnIn` counts down.
- At 0 or below, a new enemy joins the list, one fewer is left to come, and the next one is 45 frames away.
- `spawnIn` starts at 0, so the first enemy comes at once.

# --meaning-tr--

- `if (toSpawn > 0) {` → gelecek düşman varsa:
  - `spawnIn -= 1` → geri sayım.
  - `if (spawnIn <= 0) {` → süre dolduysa:
    - `enemies.push({ d: 0, hp: 10 })` → yolun başına 10 canlı yeni düşman.
    - `toSpawn -= 1` → gelecek sayısı bir azalır.
    - `spawnIn = 45` → sonrakine 45 kare.
- `spawnIn` 0'dan başladığı için ilk düşman hemen gelir.

# --task--

1. Under `let enemies` write `let toSpawn` and `let spawnIn`; in `reset`, under `enemies = []`, write `toSpawn = 30`
   and `spawnIn = 0`.
2. At the top of `update`, write the spawning block and an empty line.

# --task-tr--

1. `let enemies` satırının altına `let toSpawn` ve `let spawnIn` yaz.
2. `reset` içinde `enemies = []` satırının altına `toSpawn = 30` ve `spawnIn = 0` yaz.
3. `update`'in **en üstüne** düşman çıkaran bloğu yaz; altında bir boş satır bırak.
4. **Çalıştır**: düşmanlar soldan birer birer girip yolu izlemeli ve sağdan çıkmalı.

# --predict--

How many enemies are on the road after one second (60 frames)?
- [ ] 1
- [x] 2
  One at frame 1, the next 45 frames later.
- [ ] 60

# --predict-tr--

Bir saniye (60 kare) sonra yolda kaç düşman var?
- [ ] 1
- [x] 2
  Biri 1. karede, sonraki 45 kare sonra.
- [ ] 60

# --tests--

Enemies should arrive 45 frames apart and walk along the road.
tr: Düşmanlar 45 kare arayla gelmeli ve yol boyunca yürümeli.

```js
$.tick()
assert.lengthOf(enemies, 1)
assert.deepEqual(enemies[0], { d: 0.03, hp: 10 })
$.tick(44)
assert.lengthOf(enemies, 1)
$.tick()
assert.lengthOf(enemies, 2)
assert.closeTo(enemies[0].d, 46 * 0.03, 1e-9)
assert.strictEqual(toSpawn, 28)
```

After the last one, no more should come.
tr: Sonuncudan sonra başka gelmemeli.

```js
toSpawn = 1
$.tick(100)
assert.lengthOf(enemies, 1)
assert.strictEqual(toSpawn, 0)
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

let road // keys of the tiles the road covers
let enemies
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
