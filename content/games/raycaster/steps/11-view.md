---
title: The 3D view
title_tr: 3B görünüm
skills: [game.canvas, game.physics]
---

# --goal--

Now the magic: the view is 60 degrees wide, split into 240 rays, one for every 2 pixels across. Each ray's wall is drawn
as a column centered on the horizon, as tall as `PROJECTION / dist`: twice as far away, half as tall.

# --goal-tr--

Şimdi sihir: görüş alanı **60 derece** genişliğinde, 240 ışına bölünüyor; her 2 piksellik şerit için bir ışın. Her
ışının duvarı ufka ortalanmış bir **sütun** olarak çiziliyor; boyu `PROJECTION / dist`: iki kat uzak, yarı boy.
**Çalıştır** ve dön: labirentin içindesin!

# --code--

```js
const FOV = Math.PI / 3 // 60 degrees
const RAYS = 240 // one ray for every 2 pixels across
const COLUMN = canvas.width / RAYS
// How far the screen is from the eye, in pixels, so that the view is exactly FOV wide.
const PROJECTION = canvas.width / 2 / Math.tan(FOV / 2)

  for (let i = 0; i < RAYS; i++) {
    const angle = player.angle - FOV / 2 + (FOV * (i + 0.5)) / RAYS
    const hit = castRay(angle)
    const dist = hit.dist
    const h = Math.min(H * 3, PROJECTION / dist)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(i * COLUMN, (H - h) / 2, COLUMN, h)
  }
```

# --meaning--

- Ray `i` looks from the left edge of the view (`angle - FOV / 2`) towards the right, through the middle of its column.
- `PROJECTION` is how far the screen would be from the eye; a wall 1 tile tall at distance `dist` looks
  `PROJECTION / dist` pixels tall. That is perspective.
- `Math.min(H * 3, ...)` keeps a wall right in front of your nose from becoming huge.
- `(H - h) / 2` centers the column on the horizon.

# --meaning-tr--

- `FOV` (görüş alanı) → 60°; `RAYS` → 240 ışın; `COLUMN` → her sütun 480 / 240 = 2 piksel.
- `PROJECTION` → ekranın gözden ne kadar uzakta olduğu (piksel). Görüşün tam 60° olması için gereken değer:
  ekranın yarısı / tan(30°).
- `angle` → `i`. ışın görüşün sol kenarından (`player.angle - FOV / 2`) başlayıp sağa doğru, kendi sütununun ortasından
  (`i + 0.5`) bakar.
- `PROJECTION / dist` → 1 kare yüksekliğindeki duvar `dist` uzakta bu kadar piksel görünür: **perspektif**.
- `Math.min(H * 3, ...)` → burnunun dibindeki duvar dev olmasın.
- `(H - h) / 2` → sütunu ufka (ortaya) ortalar.

# --task--

1. Under `MAP`, write the four view constants and the comment.
2. In `draw`, between the floor and the minimap, write the column loop.

# --task-tr--

1. `MAP` listesinin altına dört görüş sabitini ve yorumu yaz.
2. `draw`'da zeminle mini harita arasına sütun döngüsünü ve bir boş satır yaz. **Çalıştır**.

# --tests--

The view should be drawn as 240 columns.
tr: Görünüm 240 sütun olarak çizilmeli.

```js
$.tick(1)
const columns = $.rects().filter((r) => r.w === 2)
assert.lengthOf(columns, 240)
assert.strictEqual(columns[5].x, 10)
```

Closer walls should be taller, centered on the horizon.
tr: Daha yakın duvarlar daha uzun olmalı ve ufukta ortalanmalı.

```js
$.tick(1)
const center = $.rects().filter((r) => r.w === 2)[120]
const expected = 240 / Math.tan(Math.PI / 6) / 3.5
assert.closeTo(center.h, expected, 0.01)
assert.closeTo(center.y + center.h / 2, 160, 1e-6)
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const FOV = Math.PI / 3 // 60 degrees
const RAYS = 240 // one ray for every 2 pixels across
const COLUMN = canvas.width / RAYS
// How far the screen is from the eye, in pixels, so that the view is exactly FOV wide.
const PROJECTION = canvas.width / 2 / Math.tan(FOV / 2)
const MOVE = 0.05 // tiles per frame
const TURN = 0.04 // radians per frame
const RADIUS = 0.2 // how close the player can get to a wall
const MINI = 8 // minimap pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function tileAt(x, y) {
  return MAP[Math.floor(y)][Math.floor(x)]
}

// Is any corner of the player's little square inside a wall?
function blocked(x, y) {
  for (const [cx, cy] of [[-RADIUS, -RADIUS], [RADIUS, -RADIUS], [-RADIUS, RADIUS], [RADIUS, RADIUS]]) {
    if (tileAt(x + cx, y + cy) !== '.') return true
  }
  return false
}

// Moving each axis on its own lets the player slide along a wall instead of sticking to it.
function move(dx, dy) {
  if (!blocked(player.x + dx, player.y)) player.x += dx
  if (!blocked(player.x, player.y + dy)) player.y += dy
}

// Walk the grid line by line (DDA) until the ray enters a wall tile.
function castRay(angle) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  let col = Math.floor(player.x)
  let row = Math.floor(player.y)
  const stepX = dx > 0 ? 1 : -1
  const stepY = dy > 0 ? 1 : -1
  // How far along the ray one whole tile across (or down) is.
  const deltaX = Math.abs(1 / dx)
  const deltaY = Math.abs(1 / dy)
  // How far along the ray the next vertical (or horizontal) grid line is.
  let nextX = (dx > 0 ? col + 1 - player.x : player.x - col) * deltaX
  let nextY = (dy > 0 ? row + 1 - player.y : player.y - row) * deltaY
  while (true) {
    let dist
    let side
    if (nextX < nextY) {
      dist = nextX
      nextX += deltaX
      col += stepX
      side = 'x'
    } else {
      dist = nextY
      nextY += deltaY
      row += stepY
      side = 'y'
    }
    const tile = MAP[row][col]
    if (tile !== '.') return { dist, side, tile, x: player.x + dx * dist, y: player.y + dy * dist }
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

function draw() {
  const H = canvas.height
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, H / 2)
  ctx.fillStyle = '#475569'
  ctx.fillRect(0, H / 2, canvas.width, H / 2)

  for (let i = 0; i < RAYS; i++) {
    const angle = player.angle - FOV / 2 + (FOV * (i + 0.5)) / RAYS
    const hit = castRay(angle)
    const dist = hit.dist
    const h = Math.min(H * 3, PROJECTION / dist)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(i * COLUMN, (H - h) / 2, COLUMN, h)
  }

  // The minimap, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
