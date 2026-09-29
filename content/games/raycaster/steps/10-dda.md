---
title: "A ray: walk to the wall"
title_tr: "Işın: duvara kadar yürü"
skills: [game.physics, prog.loops]
---

# --goal--

Now the ray walks: each time it crosses whichever grid line is nearer, it enters a new tile. As soon as that tile is not
floor, we found the wall. This method is called DDA. `castRay` returns how far the wall is, which kind of line it
crossed, the wall's kind and the exact hit point.

# --goal-tr--

Şimdi ışın **yürüsün**: her seferinde hangi ızgara çizgisi daha yakınsa onu geçip **yeni bir kareye** girsin. O kare
zemin değilse duvarı bulduk. Bu yönteme **DDA** denir. `castRay` artık asıl cevabı döndürüyor: duvar ne kadar uzakta,
hangi tür çizgiyi geçerek çarptı, duvarın türü ve tam çarpma noktası.

# --code--

```js
// Walk the grid line by line (DDA) until the ray enters a wall tile.

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
```

# --meaning--

- If the next vertical line is nearer, cross it: that line's distance is `dist`, the next one is `deltaX` further, the
  ray is now one column over.
- Otherwise cross the horizontal line the same way.
- `side` remembers which: `'x'` means the wall is hit on its left or right face, `'y'` on its top or bottom face.
- The maze is closed by walls, so `while (true)` always finds one and returns.

# --meaning-tr--

- `if (nextX < nextY)` → sonraki dikey çizgi daha yakın: onu geç. Uzaklık `dist = nextX`; ondan sonraki dikey çizgi
  `deltaX` ötede; ışın artık bir sütun ötede (`col += stepX`).
- Değilse yatay çizgiyi aynı şekilde geç.
- `side` → duvarın hangi yüzüne çarptık: `'x'` sol/sağ yüz, `'y'` üst/alt yüz. Gölgelendirmede lazım olacak.
- `MAP[row][col]` zemin değilse **duvar**: bilgileri döndür. `x`, `y` → başlangıç + yön × uzaklık: tam çarpma noktası.
- `while (true)` → sonsuz döngü gibi görünür ama labirent duvarlarla kapalı, ışın mutlaka bir duvara çarpar ve
  `return` döngüyü bitirir.

# --task--

1. Above `castRay`, write the comment.
2. Replace the `return` line with the `while` loop.

# --task-tr--

1. `castRay`'in üstüne yorum satırını yaz.
2. `return { deltaX, ... }` satırını sil; yerine `while` döngüsünü yaz. **Çalıştır**.

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
