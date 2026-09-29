---
title: Escape!
title_tr: Kaçış!
skills: [game.state]
---

# --goal--

The exit `E` is a green wall. Walking up to it wins: everything stops and the time is shown. Space plays again.

# --goal-tr--

Çıkış `E` yeşil bir duvar. Yanına kadar yürümek **kazandırsın**: her şey dursun ve süre gösterilsin. Boşluk yeniden
oynatsın. Oyunun hâlini `state` tutuyor: `'playing'` (oynanıyor) ya da `'won'` (kazanıldı).

# --code--

```js
let state // 'playing' or 'won'

  state = 'playing'

// The player escapes by walking up to the exit.
function nearExit() {
  const row = MAP.findIndex((line) => line.includes('E'))
  const col = MAP[row].indexOf('E')
  return Math.hypot(player.x - (col + 0.5), player.y - (row + 0.5)) < 0.8
}

  if (event.key === ' ' && state === 'won') reset()

  if (state !== 'playing') return

  if (nearExit()) {
    state = 'won'
  }

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
```

# --meaning--

- `findIndex` finds the row that contains `E`, `indexOf` its column.
- `Math.hypot(a, b)` is the straight-line distance √(a² + b²) from the player to the middle of the exit tile.
- The player can't enter the exit tile, but can get within 0.8 of its middle.
- Once won, `update` does nothing, so the time freezes.

# --meaning-tr--

- `MAP.findIndex((line) => line.includes('E'))` → içinde `E` olan **satırın** numarası; `indexOf('E')` o satırdaki
  **sütun**.
- `Math.hypot(a, b)` → √(a² + b²): oyuncudan çıkış karesinin ortasına **düz çizgi uzaklığı**.
- Oyuncu duvar olan çıkış karesine giremez ama ortasına 0.8'den yakına gelebilir: yeter.
- `update`'in başındaki `return` → kazanınca her şey ve süre donar.
- Boşluk yalnız kazandıktan sonra `reset()` çağırır; `reset` artık `state`'i de geri koyuyor.

# --task--

1. Under `player`, write `state`; in `reset`, set it to `'playing'`.
2. Above the key listeners, write `nearExit`; in `keydown`, play again on Space.
3. At the top of `update`, stop when not playing; at the end, win near the exit.
4. At the end of `draw`, draw the winning screen.

# --task-tr--

1. `let player` satırının altına `state` yaz; `reset`'te `player` satırının altına `state = 'playing'` yaz.
2. Tuş dinleyicilerinin üstüne `nearExit` yaz; `keydown`'a Boşluk satırını ekle.
3. `update`'in en üstüne durdurma satırını, sonuna kazanma bloğunu yaz.
4. `draw`'ın sonuna, bir boş satırdan sonra kazanma ekranını yaz. **Çalıştır** ve çıkışı bul (mini haritada yeşil).

# --tests--

Walking up to the exit should win and freeze the time.
tr: Çıkışın yanına yürümek kazandırmalı ve süreyi dondurmalı.

```js
player = { x: 10.5, y: 9.5, angle: Math.PI / 2 }
assert.isFalse(nearExit())
$.press('ArrowUp')
$.tick(10)
assert.strictEqual(state, 'won')
assert.include($.texts(), 'Escaped in 0.1 s')
const y = player.y
const f = frames
$.tick(10)
assert.strictEqual(player.y, y)
assert.strictEqual(frames, f)
```

Space should start again after winning.
tr: Kazandıktan sonra Boşluk yeniden başlatmalı.

```js
player = { x: 10.5, y: 9.5, angle: Math.PI / 2 }
$.press('ArrowUp')
$.tick(10)
$.release('ArrowUp')
$.press(' ')
assert.deepEqual([state, frames, player.x, player.y], ['playing', 0, 1.5, 1.5])
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
  ctx.fillText('Time ' + seconds(frames), canvas.width - 10, 22)

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
