---
title: A timer
title_tr: Süre
skills: [game.state, game.loop]
---

# --goal--

The goal will be to escape as fast as you can, so we count frames and show them as seconds in the top right.

# --goal-tr--

Amaç labirentten **olabildiğince hızlı** kaçmak olacak; o yüzden kareleri sayıp sağ üstte **saniye** olarak
gösteriyoruz.

# --code--

```js
let frames

  frames = 0

  frames += 1

const seconds = (f) => (f / 60).toFixed(1)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Time ' + seconds(frames), canvas.width - 10, 22)
```

# --meaning--

- The game runs at about 60 frames a second, so frames / 60 is seconds.
- `toFixed(1)` writes a number with one digit after the dot: `1.0`, `12.3`.
- `seconds` is a short arrow function: `(f) => ...` returns what is after the arrow.

# --meaning-tr--

- `frames` → geçen kare sayısı; `reset` sıfırlar, `update` her karede bir artırır.
- Oyun saniyede ~60 kare döner: `f / 60` saniye eder.
- `toFixed(1)` → sayıyı noktadan sonra **tek basamakla** yazar: `1.0`, `12.3`.
- `const seconds = (f) => ...` → kısa bir ok fonksiyonu: okun sağındakini döndürür.
- `textAlign = 'right'` → yazı sağ kenardan 10 piksel içeride **biter**.

# --task--

1. Under `player`, write `frames`; in `reset`, set it to 0; at the top of `update`, add one.
2. Above `shade`, write `seconds`.
3. At the end of `draw`, write the time.

# --task-tr--

1. `let player` satırının altına `let frames` yaz; `reset`'in sonuna `frames = 0`, `update`'in en üstüne `frames += 1`
   yaz.
2. `shade` fonksiyonunun üstüne `seconds` satırını ve bir boş satır yaz.
3. `draw`'ın sonuna, bir boş satırdan sonra süre yazısının dört satırını yaz. **Çalıştır**.

# --tests--

The timer should count seconds.
tr: Süre saniyeleri saymalı.

```js
$.tick(60)
assert.strictEqual(frames, 60)
assert.include($.texts(), 'Time 1.0')
assert.strictEqual(seconds(90), '1.5')
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
let frames
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
  frames = 0
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
  frames += 1
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

const seconds = (f) => (f / 60).toFixed(1)

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Time ' + seconds(frames), canvas.width - 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
