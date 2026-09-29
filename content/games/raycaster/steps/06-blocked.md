---
title: Is it a wall?
title_tr: Duvar mı?
skills: [game.collision, prog.functions]
---

# --goal--

To stop at walls we need two questions. `tileAt` tells which tile a point is on. `blocked` tells whether the player,
standing at a point, would be inside a wall. The player is not a point but a small square, 0.2 tiles each way from the
middle, so we check its four corners.

# --goal-tr--

Duvarlarda durmak için iki soru lazım. `tileAt` → bir nokta hangi karenin üstünde? `blocked` → oyuncu bu noktada
dursa bir duvarın içinde olur mu? Oyuncu bir nokta değil, ortasından her yöne 0.2 kare uzanan **küçük bir kare**; o
yüzden dört **köşesine** bakıyoruz. Bu adımda yalnız soruları yazıyoruz; kullanmak sonraki adımda.

# --code--

```js
const RADIUS = 0.2 // how close the player can get to a wall

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
```

# --meaning--

- `Math.floor` turns a position like 2.7 into the tile number 2. The row comes from `y`, the column from `x`.
- The loop visits the four corner offsets; `[cx, cy]` unpacks each pair.
- If any corner is on something other than floor, the spot is blocked.

# --meaning-tr--

- `Math.floor(2.7)` → 2: bir konumdan **kare numarası**. Satır `y`'den, sütun `x`'ten: `MAP[satır][sütun]`.
- `[[-RADIUS, -RADIUS], ...]` → dört köşenin ortadan uzaklıkları: sol üst, sağ üst, sol alt, sağ alt.
- `const [cx, cy] of ...` → her ikiliyi iki değişkene **açar**.
- Köşelerden biri zemin (`'.'`) dışında bir şeyin üstündeyse `true`: bu nokta kapalı. Çıkış `E` de duvar sayılır.

# --task--

1. Above `MINI`, write `RADIUS`.
2. Above `move`, write `tileAt` and `blocked`.

# --task-tr--

1. `MINI` satırının üstüne `RADIUS` yaz.
2. `move` fonksiyonunun üstüne `tileAt` ve yorum satırıyla birlikte `blocked` yaz. **Çalıştır**.

# --tests--

tileAt should tell the tile under a point.
tr: tileAt bir noktanın altındaki kareyi söylemeli.

```js
assert.strictEqual(tileAt(1.5, 1.5), '.')
assert.strictEqual(tileAt(5.2, 1.9), '#')
assert.strictEqual(tileAt(10.5, 10.5), 'E')
assert.strictEqual(tileAt(7.5, 4.5), '2')
```

blocked should check the player's four corners.
tr: blocked oyuncunun dört köşesine bakmalı.

```js
assert.isFalse(blocked(1.5, 1.5))
assert.isTrue(blocked(1.1, 1.5))
assert.isTrue(blocked(4.9, 1.5))
assert.isFalse(blocked(4.7, 1.5))
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

function move(dx, dy) {
  player.x += dx
  player.y += dy
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
