---
title: From a click to a tile
title_tr: Tıklamadan kareye
skills: [game.input]
---

# --goal--

A click gives a position in **screen pixels**, but the game thinks in **canvas pixels**, and they are not the same:
the page scales the canvas to fit the screen. `tileAt` converts, then finds the tile.

# --goal-tr--

Kuleleri fareyle kuracağız. Ama bir tıklama bize **ekran pikseli** verir; oyun ise **canvas pikseliyle** düşünür. İkisi
aynı değildir: sayfa canvas'ı ekrana sığdırmak için büyütür ya da küçültür (telefonda küçük, büyük ekranda büyük).

`tileAt` önce çevirir, sonra hangi kareye tıklandığını bulur. Bu adımı unutmak tarayıcı oyunlarının en sık
hatalarından biridir: canvas boyu değişince tıklamalar yanlış yere düşer.

# --code--

```js
// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
}
```

# --meaning--

- `getBoundingClientRect()` says where the canvas is on the screen and how big it is shown.
- Subtracting `rect.left` makes the position relative to the canvas; multiplying by `canvas.width / rect.width` undoes
  the scaling.
- `Math.floor(x / TILE)` is the column; the row counts from `TOP`, so a click in the top strip gives row `-1`.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri (`left`, `top`) ve **göründüğü** boy (`width`, `height`).
- `event.clientX - rect.left` → tıklamanın canvas'ın sol kenarından uzaklığı, ekran pikseliyle.
- `* canvas.width / rect.width` → ölçeği geri alır: canvas yarı boyda gösteriliyorsa 2 ile çarpar.
- `Math.floor(x / TILE)` → `Math.floor` aşağı yuvarlar: 60 / 40 = 1.5 → 1. sütun.
- `Math.floor((y - TOP) / TILE)` → satır, üst şeridin altından saymaya başlar. Üst şeride tıklamak −1. satır verir.
- `return { x, y, col, row }` → dördünü birden geri verir; `{ x }` yazmak `{ x: x }` demek.

# --task--

Under `pointAt`, after an empty line, write the comment and `tileAt`.

# --task-tr--

1. `pointAt` fonksiyonunun altında bir boş satır bırakıp yorumu ve `tileAt`'i yaz.
2. **Çalıştır**: ekranda fark yok; tıklamayı bir sonraki adımda bağlayacağız.

# --tests--

A point should turn into canvas pixels and a tile.
tr: Bir nokta canvas pikseline ve bir kareye dönmeli.

```js
assert.deepEqual(tileAt({ clientX: 60, clientY: 180 }), { x: 60, y: 180, col: 1, row: 3 })
assert.strictEqual(tileAt({ clientX: 60, clientY: 20 }).row, -1, 'the top strip is above row 0')
```

Screen pixels should be converted when the canvas is shown smaller.
tr: Canvas küçük gösterildiğinde ekran pikselleri çevrilmeli.

```js
canvas.getBoundingClientRect = () => ({ left: 10, top: 20, width: 240, height: 220 }) // drawn at half size
assert.deepEqual(tileAt({ clientX: 10 + 30, clientY: 20 + 90 }), { x: 60, y: 180, col: 1, row: 3 })
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

// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
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
