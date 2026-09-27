---
title: From rays to a 3D view
title_tr: Işınlardan 3B görünüme
skills: [game.loop]
---

# --explanation--

Now the magic. Split the screen into narrow **columns** and cast one ray for each, fanning out across the field of view
(60°). Each ray finds the distance to a wall, and **far things look small**: the wall in that column is drawn with a
height inversely proportional to the distance, centered on the horizon.

```js
height = PROJECTION / distance
```

`PROJECTION` is how far the screen is from the eye in pixels, chosen so the view is exactly 60° wide:
`(width / 2) / tan(30°)`. Draw 240 columns like that, a dark ceiling above and a floor below, and the flat map becomes a
3D corridor.

One correction is needed. The rays at the edges of the view are longer than the one in the middle even when they hit the
same flat wall, so flat walls would **bulge**, like through a fish-eye lens. The fix is to use the distance **straight
ahead** instead of along the ray, which is the ray's distance times the cosine of its angle from the center:

```js
const dist = hit.dist * Math.cos(angle - player.angle)
```

The map shrinks to a minimap in the corner so you can still see where you are.

# --explanation-tr--

Şimdi sihir. Ekranı dar **sütunlara** böl ve her biri için bir ışın gönder; görüş alanı (60°) boyunca yelpaze gibi açılsınlar.
Her ışın bir duvara olan mesafeyi bulur ve **uzaktaki şeyler küçük görünür**: o sütundaki duvar, mesafeyle ters orantılı bir
yükseklikte, ufuk çizgisinde ortalanarak çizilir.

```js
height = PROJECTION / distance
```

`PROJECTION`, ekranın gözden piksel olarak ne kadar uzakta olduğudur; görünüm tam 60° genişliğinde olsun diye seçilir:
`(width / 2) / tan(30°)`. Böyle 240 sütun çiz, üstte koyu bir tavan, altta bir zemin; düz harita 3B bir koridora dönüşür.

Bir düzeltme gerekiyor. Görünümün kenarlarındaki ışınlar, aynı düz duvara çarpsalar bile ortadakinden uzundur; bu yüzden düz
duvarlar balık gözü mercekten bakar gibi **şişerdi**. Çaresi ışın boyunca değil **dümdüz öndeki** mesafeyi kullanmaktır; bu,
ışının mesafesi çarpı merkezden açısının kosinüsüdür:

```js
const dist = hit.dist * Math.cos(angle - player.angle)
```

Harita köşede bir mini haritaya küçülür; böylece nerede olduğunu hâlâ görebilirsin.

# --task--

1. Add `FOV = Math.PI / 3`, `RAYS = 240`, `COLUMN = canvas.width / RAYS`, `PROJECTION` as above, and
   `COLORS = { '#': [148, 163, 184], 2: [185, 90, 60], E: [34, 197, 94] }`. Change `MINI` to `8`.
2. In `draw()`, first fill the top half `'#1e293b'` and the bottom half `'#475569'`. Then for each column `i`, cast a ray at
   `player.angle - FOV / 2 + FOV * (i + 0.5) / RAYS`, correct the distance, and draw a column `COLUMN` wide and
   `PROJECTION / dist` high (at most three times the canvas height), centered vertically, in the wall's color as
   `'rgb(r, g, b)'`.
3. Draw the map on top as the minimap, and no longer draw the single ray.

# --task-tr--

1. `FOV = Math.PI / 3`, `RAYS = 240`, `COLUMN = canvas.width / RAYS`, yukarıdaki gibi `PROJECTION` ve
   `COLORS = { '#': [148, 163, 184], 2: [185, 90, 60], E: [34, 197, 94] }` ekle. `MINI`'yi `8` yap.
2. `draw()` içinde önce üst yarıyı `'#1e293b'`, alt yarıyı `'#475569'` ile doldur. Sonra her `i` sütunu için
   `player.angle - FOV / 2 + FOV * (i + 0.5) / RAYS` açısında bir ışın gönder, mesafeyi düzelt ve `COLUMN` genişliğinde,
   `PROJECTION / dist` yüksekliğinde (en fazla canvas yüksekliğinin üç katı), dikeyde ortalı, duvarın renginde
   `'rgb(r, g, b)'` olarak bir sütun çiz.
3. Haritayı üstüne mini harita olarak çiz ve tek ışını artık çizme.

# --tests--

The view should be drawn as 240 columns over a ceiling and a floor.
tr: Görünüm bir tavan ve zeminin üstünde 240 sütun olarak çizilmeli.

```js
$.tick(1)
const columns = $.rects().filter((r) => r.w === 2)
assert.lengthOf(columns, 240)
assert.deepEqual($.rects('#1e293b').map((r) => [r.y, r.h]), [[0, 160]])
assert.deepEqual($.rects('#475569').map((r) => [r.y, r.h]), [[160, 160]])
```

Closer walls should be taller, centered on the horizon.
tr: Daha yakın duvarlar daha uzun olmalı ve ufukta ortalanmalı.

```js
$.tick(1)
const center = $.rects().filter((r) => r.w === 2)[120]
const expected = 240 / Math.tan(Math.PI / 6) / 3.5
assert.closeTo(center.h, expected, 0.01)
assert.closeTo(center.y + center.h / 2, 160, 1e-6)
assert.strictEqual(center.color, 'rgb(148, 163, 184)')
```

A flat wall should look flat: no fish-eye bulge.
tr: Düz bir duvar düz görünmeli: balık gözü şişmesi olmamalı.

```js
$.tick(1)
const columns = $.rects().filter((r) => r.w === 2)
for (let i = 100; i <= 140; i++) assert.closeTo(columns[i].h, columns[120].h, 0.01, 'column ' + i)
```

The map should shrink to a minimap in the corner.
tr: Harita köşede bir mini haritaya küçülmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#22c55e').filter((r) => r.w === 8), [{ x: 80, y: 80, w: 8, h: 8, color: '#22c55e' }])
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
    const [r, g, b] = COLORS[hit.tile]
    ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')'
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
