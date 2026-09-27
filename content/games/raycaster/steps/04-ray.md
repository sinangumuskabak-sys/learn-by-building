---
title: Casting a ray
title_tr: Işın göndermek
skills: [game.collision, prog.loops]
---

# --explanation--

A **ray** answers one question: "if I look in this direction, how far away is the first wall?" The 3D view will ask it
hundreds of times per frame, so it has to be fast and exact.

Stepping along the ray in tiny steps would be slow and could miss thin corners. Instead, notice that a ray can only
enter a new tile by crossing a **grid line**: a vertical one (`x` is a whole number) or a horizontal one (`y` is). So
walk from grid line to grid line, always taking whichever of the two comes first. This is the **DDA** algorithm
(digital differential analyzer):

```
deltaX = how far along the ray one whole tile across is   = |1 / cos(angle)|
nextX  = how far along the ray the next vertical line is
repeat: step to the closer of nextX / nextY, move into that tile, stop at a wall
```

Each step lands exactly on the next tile the ray enters, so a ray across the whole map takes only a few dozen steps
and can never skip a wall. Which kind of line was crossed last also tells you which **side** of the wall was hit (`'x'`
for a vertical face, `'y'` for a horizontal one); the view will use that for shading.

A `cos` or `sin` of `0` gives a `delta` of `Infinity`, which is exactly right: a ray going straight across never crosses
a horizontal line.

# --explanation-tr--

Bir **ışın** tek bir soruyu cevaplar: "bu yöne bakarsam ilk duvar ne kadar uzakta?" 3B görünüm bunu her karede yüzlerce kez
soracak; bu yüzden hızlı ve kesin olmalı.

Işın boyunca minik adımlarla ilerlemek yavaş olurdu ve ince köşeleri kaçırabilirdi. Bunun yerine şuna dikkat et: bir ışın
yeni bir döşemeye ancak bir **ızgara çizgisini** geçerek girebilir: dikey bir çizgi (`x` tam sayı) ya da yatay bir çizgi (`y`
tam sayı). Öyleyse ızgara çizgisinden ızgara çizgisine yürü; ikisinden hangisi önce geliyorsa onu al. Bu **DDA**
algoritmasıdır (digital differential analyzer):

```
deltaX = ışın boyunca bir tam döşeme yana ne kadar uzaktır   = |1 / cos(angle)|
nextX  = ışın boyunca sonraki dikey çizgi ne kadar uzakta
tekrarla: nextX / nextY'den yakın olana adım at, o döşemeye gir, bir duvarda dur
```

Her adım tam olarak ışının girdiği sonraki döşemeye düşer; böylece bütün haritayı geçen bir ışın yalnızca birkaç düzine adım
sürer ve bir duvarı asla atlayamaz. En son hangi tür çizginin geçildiği, duvarın hangi **yüzüne** çarpıldığını da söyler
(dikey yüz için `'x'`, yatay yüz için `'y'`); görünüm bunu gölgelendirme için kullanacak.

`0` olan bir `cos` ya da `sin` `Infinity` bir `delta` verir ve bu tam doğrudur: dümdüz yana giden bir ışın hiçbir yatay
çizgiyi geçmez.

# --task--

1. Write `castRay(angle)` with DDA as described, starting from the player's tile. Return
   `{ dist, side, tile, x, y }`: the distance along the ray, `'x'` or `'y'`, the wall's map character, and the point
   where the ray hit (`player.x + cos * dist`, `player.y + sin * dist`).
2. Draw the ray straight ahead on the map: a `'#f87171'` line from the player to the point it hits.

# --task-tr--

1. Anlatıldığı gibi, oyuncunun döşemesinden başlayan DDA ile `castRay(angle)` yaz. `{ dist, side, tile, x, y }` döndür: ışın
   boyunca mesafe, `'x'` ya da `'y'`, duvarın harita karakteri ve ışının çarptığı nokta (`player.x + cos * dist`,
   `player.y + sin * dist`).
2. Haritada tam öndeki ışını çiz: oyuncudan çarptığı noktaya `'#f87171'` bir çizgi.

# --tests--

Rays straight across and straight down should stop at the first wall.
tr: Dümdüz yana ve dümdüz aşağı giden ışınlar ilk duvarda durmalı.

```js
const right = castRay(0)
assert.closeTo(right.dist, 3.5, 1e-9)
assert.deepEqual([right.side, right.tile], ['x', '#'])
assert.closeTo(right.x, 5, 1e-9)
const down = castRay(Math.PI / 2)
assert.closeTo(down.dist, 6.5, 1e-9)
assert.strictEqual(down.side, 'y')
const left = castRay(Math.PI)
assert.closeTo(left.dist, 0.5, 1e-9)
assert.strictEqual(left.side, 'x')
```

A diagonal ray should find the corner wall exactly.
tr: Çapraz bir ışın köşedeki duvarı tam olarak bulmalı.

```js
const hit = castRay(Math.PI / 4)
assert.closeTo(hit.dist, Math.SQRT2 / 2, 1e-9)
assert.closeTo(hit.x, 2, 1e-9)
assert.closeTo(hit.y, 2, 1e-9)
assert.strictEqual(hit.tile, '#')
```

A ray should report the kind of wall it hits.
tr: Bir ışın çarptığı duvarın türünü bildirmeli.

```js
player = { x: 7.5, y: 3.5, angle: 0 }
assert.strictEqual(castRay(Math.PI / 2).tile, '2')
player = { x: 10.5, y: 8.5, angle: 0 }
assert.strictEqual(castRay(Math.PI / 2).tile, 'E')
```

The ray ahead should be drawn to the wall.
tr: Öndeki ışın duvara kadar çizilmeli.

```js
$.tick(1)
const lines = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args)
assert.isTrue(lines.some(([x, y]) => Math.abs(x - 120) < 1e-9 && Math.abs(y - 36) < 1e-9), 'a line to (5, 1.5) on the map')
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
const MINI = 24 // map pixels per tile

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

// Touch: hold the left third to turn left, the right third to turn right, the middle to walk.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The map, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  // The ray straight ahead, up to the wall it hits.
  const hit = castRay(player.angle)
  ctx.strokeStyle = '#f87171'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo(hit.x * MINI, hit.y * MINI)
  ctx.stroke()

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
