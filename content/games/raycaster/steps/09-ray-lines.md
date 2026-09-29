---
title: "A ray: the grid lines"
title_tr: "Işın: ızgara çizgileri"
skills: [game.physics]
---

# --goal--

A ray crosses the grid lines one after another. We need two kinds of distance along the ray: how far until the next
vertical line (the next column) and the next horizontal line (the next row), and how far between two such lines.

# --goal-tr--

Işın ızgara çizgilerini **birer birer** geçer. Işın boyunca iki tür uzaklık lazım: bir sonraki **dikey** çizgiye (sonraki
sütuna) ve bir sonraki **yatay** çizgiye (sonraki satıra) ne kadar var, ve iki dikey (ya da iki yatay) çizgi arası ne
kadar.

# --code--

```js
// How far along the ray one whole tile across (or down) is.
const deltaX = Math.abs(1 / dx)
const deltaY = Math.abs(1 / dy)
// How far along the ray the next vertical (or horizontal) grid line is.
let nextX = (dx > 0 ? col + 1 - player.x : player.x - col) * deltaX
let nextY = (dy > 0 ? row + 1 - player.y : player.y - row) * deltaY
return { deltaX, deltaY, nextX, nextY }
```

# --meaning--

- Going one whole tile across takes `1 / dx` of ray length (a slanted ray needs more). `Math.abs` keeps it positive.
- `nextX`: the part of a tile left until the next vertical line, times `deltaX`.
- A ray going straight across never meets a horizontal line: `1 / 0` is `Infinity`, which works out fine.

# --meaning-tr--

- `deltaX = Math.abs(1 / dx)` → yana **bir tam kare** gitmek için ışın boyunca ne kadar yol gerekir. Dümdüz sağa
  giden ışında 1; eğik ışında daha fazla. `Math.abs` → eksi çıkmasın.
- `nextX` → oyuncunun karesinde sonraki dikey çizgiye kalan pay (`col + 1 - player.x` sağa, `player.x - col` sola),
  çarpı `deltaX`: ışın boyunca o çizgiye uzaklık.
- Tam yana giden ışın hiç yatay çizgiye rastlamaz: `dy` 0'dır, `1 / 0` → `Infinity` (sonsuz). Bu işimize yarar:
  "sonsuz uzakta" demek.
- `return` şimdilik bu dördünü veriyor; sonraki adımda asıl cevaba dönecek.

# --task--

Replace the `return` line of `castRay` with these lines.

# --task-tr--

`castRay`'deki `return` satırını sil; yerine bu satırları yaz. **Çalıştır**.

# --tests--

A straight ray to the right should meet the next vertical line half a tile away.
tr: Dümdüz sağa giden ışın sonraki dikey çizgiye yarım kare uzakta rastlamalı.

```js
const r = castRay(0)
assert.closeTo(r.deltaX, 1, 1e-9)
assert.closeTo(r.nextX, 0.5, 1e-9)
assert.isAbove(r.nextY, 1e9)
```

A diagonal ray should need √2 per tile.
tr: Çapraz ışın kare başına √2 yol istemeli.

```js
player = { x: 1.25, y: 1.5, angle: 0 }
const r = castRay(Math.PI / 4)
assert.closeTo(r.deltaX, Math.SQRT2, 1e-9)
assert.closeTo(r.nextX, 0.75 * Math.SQRT2, 1e-9)
assert.closeTo(castRay(Math.PI).nextX, 0.25, 1e-9)
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
  return { deltaX, deltaY, nextX, nextY }
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
