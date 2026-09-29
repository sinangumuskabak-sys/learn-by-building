---
title: Where can you build?
title_tr: Nereye kurabilirsin?
skills: [game.state, game.collision]
---

# --goal--

A tower can only go on grass, inside the map, on a free tile, and only if you can pay for it. `canBuild` answers all
of that in one place, and `build` refuses when the answer is no.

# --goal-tr--

Kuralları koyalım. Bir kule ancak şu dört şart birden doğruysa kurulur:

1. kare **haritanın içinde** (üst ya da alt şeritte değil),
2. kare **yol değil**,
3. karede **başka kule yok**,
4. **paran yetiyor**.

Hepsini tek bir fonksiyonda topluyoruz: `canBuild`. Cevabı iki yerde kullanacağız: tıklamayı reddetmek için ve biraz
sonra farenin altındaki kareyi beyaz ya da kırmızı boyamak için.

# --code--

```js
function canBuild(col, row) {
  const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
  const taken = towers.some((t) => t.col === col && t.row === row)
  return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
}

function build(col, row) {
  if (!canBuild(col, row)) return
```

# --meaning--

- `inside`: the column and the row are both within the map.
- `taken`: some tower already stands there (`some` asks "is there at least one?").
- The answer is `true` only if all four are right: `&&` means "and", `!` means "not".

# --meaning-tr--

- `const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS` → sütun 0–11, satır 0–8 arasında mı? `&&` "ve".
- `const taken = towers.some((t) => t.col === col && t.row === row)` → bu karede duran **en az bir** kule var mı?
- `return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost` → dördü birden: içeride **ve**
  yol **değil** (`!`) **ve** dolu **değil** **ve** altın fiyata yetiyor. Biri bile yanlışsa `false`.
- `if (!canBuild(col, row)) return` → kurulamıyorsa `build` hiçbir şey yapmadan çıkar.

# --task--

1. Above `function build(col, row) {` write `canBuild`.
2. Write the `if` as the first line of `build`.

# --task-tr--

1. `function build(col, row) {` satırının **üstüne** `canBuild` fonksiyonunu yaz.
2. `build`'in **ilk satırı** olarak `if (!canBuild(col, row)) return` yaz.
3. **Çalıştır**: yola, üst şeride ya da aynı kareye tıklamak artık kule kurmamalı; iki kuleden sonra altın biter.

# --hint--

All four checks are joined with `&&`; the road and the taken check need a `!` in front.

# --hint-tr--

Dört koşul `&&` ile birleşir; yol ve dolu kare kontrollerinin önünde `!` olmalı.

# --tests--

Towers should not go on the road, on another tower or outside the map.
tr: Kuleler yola, başka kulenin üstüne ya da harita dışına kurulmamalı.

```js
$.click(140, 180) // (3, 3) is road
$.click(60, 20) // the top bar
$.click(60, 420) // the bottom bar
assert.lengthOf(towers, 0)
$.click(60, 180)
$.click(60, 180)
assert.lengthOf(towers, 1)
```

Towers should not cost more than you have.
tr: Kuleler elindeki altından pahalıya kurulmamalı.

```js
$.click(60, 180)
$.click(60, 220)
assert.strictEqual(gold, 20)
$.click(60, 260)
assert.lengthOf(towers, 2, 'only 20 gold left')
assert.isFalse(canBuild(1, 7))
gold = 50
assert.isTrue(canBuild(1, 7))
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
let gold
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one
let selected // the kind of tower to build

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
  gold = 120
  toSpawn = 30
  spawnIn = 0
  selected = 'arrow'
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

// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
}

function canBuild(col, row) {
  const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
  const taken = towers.some((t) => t.col === col && t.row === row)
  return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
}

function build(col, row) {
  if (!canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})

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
