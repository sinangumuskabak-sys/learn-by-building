---
title: Light and shade
title_tr: Işık ve gölge
skills: [game.canvas]
---

# --goal--

Every wall is the same gray, so corners vanish. Each kind of wall gets its own color; walls hit on their top or bottom
face are darker, and everything fades with distance. That's enough to make the maze look solid.

# --goal-tr--

Bütün duvarlar aynı gri; köşeler kayboluyor. Her duvar türü **kendi rengini** alsın; üst/alt yüzünden vurulan duvarlar
biraz **koyu** olsun ve her şey **uzaklıkla** sönükleşsin. Labirentin katı görünmesi için bu kadarı yeter.

# --code--

```js
const COLORS = { '#': [148, 163, 184], 2: [185, 90, 60], E: [34, 197, 94] }

function shade(hit, dist) {
  // Walls facing north or south are a little darker, and everything fades with distance.
  const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
  const [r, g, b] = COLORS[hit.tile]
  return 'rgb(' + Math.round(r * light) + ', ' + Math.round(g * light) + ', ' + Math.round(b * light) + ')'
}

    ctx.fillStyle = shade(hit, dist)
```

# --meaning--

- `COLORS` gives each wall kind its red, green and blue.
- `light` is 1 for a near wall hit on its side face; 0.7 times that on its top or bottom face; it drops with distance
  but never below 0.25.
- The color is built as a text like `'rgb(105, 115, 130)'`.

# --meaning-tr--

- `COLORS` → her duvar türünün kırmızı, yeşil, mavi değerleri: taş gri, tuğla kızıl, çıkış yeşil.
- `light` → ışık oranı. `side === 'y'` (üst/alt yüz) ise 0.7 ile çarpılır: iki yüz birbirinden ayrılır, köşeler
  görünür.
- `Math.max(0.25, 1 - dist / 12)` → uzaklık büyüdükçe azalır; 12 karede sıfıra inerdi ama 0.25'in altına **inmez**.
- `const [r, g, b] = COLORS[hit.tile]` → üç sayıyı üç değişkene açar.
- Her biri ışıkla çarpılıp yuvarlanır ve `'rgb(105, 115, 130)'` gibi bir renk yazısı kurulur.

# --task--

1. Above `FOV`, write `COLORS`.
2. Above `draw`, write `shade`.
3. In the column loop, use `shade(hit, dist)` as the color.

# --task-tr--

1. `FOV` satırının üstüne `COLORS` yaz.
2. `draw` fonksiyonunun üstüne `shade` fonksiyonunu yaz.
3. Sütun döngüsünde `'#94a3b8'` yerine `shade(hit, dist)` yaz. **Çalıştır**.

# --tests--

shade should darken top and bottom faces and fade with distance.
tr: shade üst/alt yüzleri koyulaştırmalı ve uzaklıkla sönükleştirmeli.

```js
assert.strictEqual(shade({ side: 'x', tile: '#' }, 0), 'rgb(148, 163, 184)')
assert.strictEqual(shade({ side: 'y', tile: 'E' }, 0), 'rgb(24, 138, 66)')
assert.strictEqual(shade({ side: 'x', tile: '#' }, 20), 'rgb(37, 41, 46)')
```

The columns should use the shaded colors.
tr: Sütunlar gölgeli renkleri kullanmalı.

```js
$.tick(1)
assert.strictEqual($.rects().filter((r) => r.w === 2)[120].color, 'rgb(105, 115, 130)')
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
const COLORS = { '#': [148, 163, 184], 2: [185, 90, 60], E: [34, 197, 94] }
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

function shade(hit, dist) {
  // Walls facing north or south are a little darker, and everything fades with distance.
  const light = (hit.side === 'y' ? 0.7 : 1) * Math.max(0.25, 1 - dist / 12)
  const [r, g, b] = COLORS[hit.tile]
  return 'rgb(' + Math.round(r * light) + ', ' + Math.round(g * light) + ', ' + Math.round(b * light) + ')'
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
    // The distance straight ahead, not along the ray: otherwise flat walls bulge (the fish-eye effect).
    const dist = hit.dist * Math.cos(angle - player.angle)
    const h = Math.min(H * 3, PROJECTION / dist)
    ctx.fillStyle = shade(hit, dist)
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
