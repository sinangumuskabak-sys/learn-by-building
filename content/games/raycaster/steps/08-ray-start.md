---
title: "A ray: where it starts"
title_tr: "Işın: nereden başlıyor"
skills: [game.physics, prog.functions]
---

# --goal--

Here is the big idea of raycasting: for every column of the screen we send a ray from the player's eye and find the
first wall it hits. The nearer the wall, the taller we draw that column. This step starts the ray: its direction,
the tile it starts on, and which way it moves through the grid. For now `castRay` returns these so we can check them.

# --goal-tr--

Işın izlemenin (raycasting) büyük fikri: ekranın her sütunu için oyuncunun gözünden bir **ışın** gönderiyor ve
çarptığı **ilk duvarı** buluyoruz. Duvar ne kadar yakınsa o sütunu o kadar **uzun** çiziyoruz.

Bu adım ışını başlatıyor: yönü, başladığı kare ve ızgarada hangi yöne ilerleyeceği. `castRay` şimdilik bunları
döndürüyor ki kontrol edebilelim; iki adım sonra gerçek cevabını verecek.

# --code--

```js
function castRay(angle) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  let col = Math.floor(player.x)
  let row = Math.floor(player.y)
  const stepX = dx > 0 ? 1 : -1
  const stepY = dy > 0 ? 1 : -1
  return { col, row, stepX, stepY }
}
```

# --meaning--

- `dx`, `dy` are the ray's direction, one tile long.
- `col`, `row` is the tile the ray starts on, the player's tile.
- `stepX` says whether the ray goes to the next column on the right (1) or on the left (-1); `stepY` the same for rows.

# --meaning-tr--

- `dx`, `dy` → ışının yönü: bir kare uzunluğunda, yana ve aşağı payları.
- `col`, `row` → ışının başladığı kare, yani oyuncunun karesi. `let`: ışın ilerledikçe değişecek.
- `stepX` → ışın sağa gidiyorsa sonraki sütun +1, sola gidiyorsa -1. `stepY` → aynısı satırlar için (aşağı +1,
  yukarı -1).

# --task--

Above the key listeners, write `castRay`.

# --task-tr--

Tuş dinleyicilerinin üstüne `castRay` fonksiyonunu yaz. **Çalıştır**.

# --tests--

The ray should start on the player's tile and know its directions.
tr: Işın oyuncunun karesinden başlamalı ve yönlerini bilmeli.

```js
assert.deepEqual(castRay(3 * Math.PI / 4), { col: 1, row: 1, stepX: -1, stepY: 1 })
assert.deepEqual(castRay(-Math.PI / 4), { col: 1, row: 1, stepX: 1, stepY: -1 })
player = { x: 7.2, y: 3.9, angle: 0 }
assert.deepEqual(castRay(Math.PI / 4), { col: 7, row: 3, stepX: 1, stepY: 1 })
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
  return { col, row, stepX, stepY }
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
