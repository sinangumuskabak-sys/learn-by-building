---
title: Best time
title_tr: En iyi süre
skills: [game.state]
---

# --goal--

The fastest escape is kept in `localStorage` and shown next to the time. Here the best is the smallest number of frames.

# --goal-tr--

En hızlı kaçış `localStorage`'da saklansın ve sürenin yanında görünsün. Burada en iyisi **en küçük** kare sayısı.

# --code--

```js
let best = Number(localStorage.getItem('ray-best')) || 0

    if (best === 0 || frames < best) {
      best = frames
      localStorage.setItem('ray-best', best)
    }

  ctx.fillText('Time ' + seconds(frames) + (best ? '  Best ' + seconds(best) : ''), canvas.width - 10, 22)
```

# --meaning--

- 0 means "no escape yet", so the first escape always counts.
- `(best ? ... : '')` adds the best time only when there is one.

# --meaning-tr--

- `best === 0` → henüz hiç kaçılmadı: ilk kaçış her zaman rekor.
- `frames < best` → daha **az** kare: daha hızlı.
- `(best ? '  Best ' + seconds(best) : '')` → rekor varsa ekle, yoksa boş yazı. Parantez önemli: önce koşul, sonra
  birleştirme.

# --task--

1. Under `frames`, write `best`.
2. In the winning block, save a new record.
3. Add the best time to the time text.

# --task-tr--

1. `let frames` satırının altına `best` satırını yaz.
2. Kazanma bloğuna, `state = 'won'` satırının altına rekor bloğunu yaz.
3. Süre yazısının satırına en iyi süre kısmını ekle. **Çalıştır**.

# --tests--

A first escape should become the record.
tr: İlk kaçış rekor olmalı.

```js
player = { x: 10.5, y: 9.5, angle: Math.PI / 2 }
$.press('ArrowUp')
$.tick(10)
assert.strictEqual(best, frames)
assert.strictEqual(localStorage.getItem('ray-best'), String(frames))
```

A slower escape should not replace the record, and the record should be shown.
tr: Daha yavaş kaçış rekorun yerine geçmemeli; rekor görünmeli.

```js
best = 4
player = { x: 10.5, y: 9.5, angle: Math.PI / 2 }
$.press('ArrowUp')
$.tick(10)
assert.strictEqual(best, 4)
$.release('ArrowUp')
$.press(' ')
$.tick(1)
assert.include($.texts(), 'Time 0.0 Best 0.1')
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
let state // 'playing' or 'won'
let frames
let best = Number(localStorage.getItem('ray-best')) || 0
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
  state = 'playing'
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

// The player escapes by walking up to the exit.
function nearExit() {
  const row = MAP.findIndex((line) => line.includes('E'))
  const col = MAP[row].indexOf('E')
  return Math.hypot(player.x - (col + 0.5), player.y - (row + 0.5)) < 0.8
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
  if (event.key === ' ' && state === 'won') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (state !== 'playing') return
  frames += 1
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)

  if (nearExit()) {
    state = 'won'
    if (best === 0 || frames < best) {
      best = frames
      localStorage.setItem('ray-best', best)
    }
  }
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
  ctx.fillText('Time ' + seconds(frames) + (best ? '  Best ' + seconds(best) : ''), canvas.width - 10, 22)

  if (state === 'won') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, 0, canvas.width, H)
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Escaped in ' + seconds(frames) + ' s', canvas.width / 2, H / 2)
    ctx.fillStyle = 'white'
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, H / 2 + 30)
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
