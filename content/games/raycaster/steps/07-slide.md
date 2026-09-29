---
title: Stop at walls, slide along them
title_tr: Duvarda dur, boyunca kay
skills: [game.collision]
---

# --goal--

Now `move` asks before moving. Across and down are asked separately: walking diagonally into a wall stops only the
part that would enter it, so the player slides along the wall instead of sticking to it.

# --goal-tr--

Artık `move` gitmeden önce **sorsun**. Yana ve aşağı hareket **ayrı ayrı** soruluyor: bir duvara çapraz yürüyünce
yalnız duvara giren pay durur, öbür pay sürer. Böylece oyuncu duvara yapışmak yerine duvar boyunca **kayar**.

# --code--

```js
// Moving each axis on its own lets the player slide along a wall instead of sticking to it.
function move(dx, dy) {
  if (!blocked(player.x + dx, player.y)) player.x += dx
  if (!blocked(player.x, player.y + dy)) player.y += dy
}
```

# --meaning--

- The first line moves across only if the new spot is free; the second moves down only if that spot is free.
- `!` means "not": move when it is *not* blocked.

# --meaning-tr--

- İlk satır: yalnız yana gidilen yer boşsa `x`'i değiştir.
- İkinci satır: (belki yeni) `x`'le, aşağı gidilen yer boşsa `y`'yi değiştir.
- `!blocked(...)` → "kapalı **değilse**".
- İkisi tek bir soruda sorulsaydı, duvara çapraz her dokunuşta oyuncu olduğu yerde donardı.

# --task--

Replace the body of `move` with the two checks, and write the comment above it.

# --task-tr--

`move` fonksiyonunun iki satırlık gövdesini iki kontrolle değiştir, üstüne yorum satırını yaz. **Çalıştır** ve bir duvara yürü.

# --tests--

Walking into a wall should stop the player just before it.
tr: Duvara yürümek oyuncuyu duvarın hemen önünde durdurmalı.

```js
$.press('ArrowUp')
$.tick(120)
assert.isAbove(player.x, 4.7)
assert.isBelow(player.x, 4.81)
```

Walking diagonally into a wall should slide along it.
tr: Duvara çapraz yürümek duvar boyunca kaydırmalı.

```js
player = { x: 2.5, y: 1.3, angle: 0 }
move(0.1, -0.2)
assert.closeTo(player.x, 2.6, 1e-9)
assert.closeTo(player.y, 1.3, 1e-9)
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
