---
title: Show before you click
title_tr: Tıklamadan önce göster
skills: [game.input]
---

# --goal--

The tile under the mouse lights up: white if you can build there, red if not. `canBuild` gives the answer we already
use for clicks. Showing players what will happen before they click is a big part of a game feeling fair.

# --goal-tr--

Farenin altındaki kare aydınlansın: **kurabiliyorsan beyaz**, kuramıyorsan **kırmızı**. Cevabı zaten tıklamalar için
kullandığımız `canBuild` veriyor; aynı kural iki yerde.

Oyuncuya tıklamadan önce ne olacağını göstermek, bir oyunun **adil** hissettirmesinin büyük bir parçası.

# --code--

```js
let hover = null // the tile under the mouse

canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
})

  if (hover) {
    ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
    ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
  }
```

# --meaning--

- `pointermove` remembers the tile under the pointer, but only on the map's rows; `pointerleave` forgets it when the
  pointer leaves the canvas.
- `rgba(...)` colors are see-through: the last number is how opaque (0 to 1), so the tile still shows underneath.

# --meaning-tr--

- `let hover = null` → farenin altındaki kare; başta yok.
- `pointermove` → fare canvas'ın üstünde **hareket ettikçe**: `tileAt` ile kareyi bul. `p.row >= 0 && p.row < ROWS ?
  p : null` → haritanın satırlarındaysa onu tut, değilse (üst ya da alt şerit) `null`.
- `pointerleave` → fare canvas'tan **çıkınca** unut.
- `if (hover) {` → bir kare varsa çiz. Karelerden sonra, kulelerden önce çizilir.
- `'rgba(255, 255, 255, 0.25)'` → `rgba` kırmızı, yeşil, mavi (0–255) ve **saydamlık** (0–1): %25 beyaz. Alttaki
  çimen görünmeye devam eder. `'rgba(239, 68, 68, 0.35)'` → %35 kırmızı.

# --task--

1. Under `let selected` write `let hover = null`.
2. Right under the `pointerdown` listener's `})`, write the `pointermove` and `pointerleave` listeners.
3. In `draw`, after the tile loops and an empty line, write the `if (hover)` block.

# --task-tr--

1. `let selected` satırının altına `let hover = null ...` yaz.
2. `pointerdown` dinleyicisinin kapanan `})` satırının hemen **altına** `pointermove` ve `pointerleave` dinleyicilerini
   yaz.
3. `draw` içinde kare döngülerinden sonra bir boş satır bırakıp `if (hover) { ... }` bloğunu yaz.
4. **Çalıştır** ve fareyi haritada gezdir: çimende beyaz, yolda kırmızı.

# --tests--

The tile under the mouse should show whether you can build there.
tr: Farenin altındaki kare, oraya kurulup kurulamayacağını göstermeli.

```js
$.move(60, 180)
$.tick()
assert.deepInclude($.rects('rgba(255, 255, 255, 0.25)'), { x: 40, y: 160, w: 40, h: 40, color: 'rgba(255, 255, 255, 0.25)' })
$.move(140, 180)
$.tick()
assert.lengthOf($.rects('rgba(239, 68, 68, 0.35)'), 1, 'red on the road')
assert.lengthOf($.rects('rgba(255, 255, 255, 0.25)'), 0)
```

Outside the map's rows, nothing should be lit.
tr: Haritanın satırları dışında hiçbir kare aydınlanmamalı.

```js
$.move(60, 180)
$.move(60, 20)
assert.isNull(hover)
$.tick()
assert.lengthOf($.rects('rgba(255, 255, 255, 0.25)'), 0)
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
let hover = null // the tile under the mouse

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
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
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

  if (hover) {
    ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
    ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Gold ' + gold, 10, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
