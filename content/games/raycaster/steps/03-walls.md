---
title: Solid walls that you slide along
title_tr: Boyunca kaydığın sağlam duvarlar
skills: [game.collision]
---

# --explanation--

The player is a point, but a point can get so close to a wall that the camera would be inside it. So give the player
a small body: a square reaching `RADIUS = 0.2` tiles in every direction. A position is **blocked** if any of the four
corners of that square is inside a wall tile.

The naive way to use this is "if the new position is blocked, do not move". Try walking into a wall at an angle with
that rule and you stop dead, which feels awful. The trick every game uses is to try the two directions **separately**:

```js
if (!blocked(player.x + dx, player.y)) player.x += dx   // across, if that is free
if (!blocked(player.x, player.y + dy)) player.y += dy   // then down, if that is free
```

Walking diagonally into a wall now blocks only the part going into the wall, and the other part keeps you moving: you
**slide** along it. The same idea works in almost every game with walls, 2D or 3D.

# --explanation-tr--

Oyuncu bir nokta ama bir nokta bir duvara o kadar yaklaşabilir ki kamera duvarın içinde kalır. Bu yüzden oyuncuya küçük
bir gövde ver: her yönde `RADIUS = 0.2` döşeme uzanan bir kare. O karenin dört köşesinden biri bir duvar döşemesinin içindeyse
bir konum **engellidir**.

Bunu kullanmanın saf yolu "yeni konum engelliyse hareket etme"dir. Bu kuralla bir duvara açılı yürümeyi dene: olduğun yerde
çakılı kalırsın ve bu berbat hissettirir. Her oyunun kullandığı hile iki yönü **ayrı ayrı** denemektir:

```js
if (!blocked(player.x + dx, player.y)) player.x += dx   // boşsa yana
if (!blocked(player.x, player.y + dy)) player.y += dy   // sonra boşsa aşağı
```

Bir duvara çapraz yürümek artık yalnızca duvara giden parçayı engeller; öbür parça seni hareket ettirmeye devam eder: duvar
boyunca **kayarsın**. Aynı fikir duvarları olan neredeyse her oyunda, 2B ya da 3B, çalışır.

# --task--

1. Add `RADIUS = 0.2`, `tileAt(x, y)` (the map character at that point) and `blocked(x, y)`: true if any corner
   `(x ± RADIUS, y ± RADIUS)` is not floor.
2. Change `move(dx, dy)` to move across and down separately, each only if that position is not blocked.

# --task-tr--

1. `RADIUS = 0.2`, `tileAt(x, y)` (o noktadaki harita karakteri) ve `blocked(x, y)` ekle: `(x ± RADIUS, y ± RADIUS)`
   köşelerinden biri zemin değilse true.
2. `move(dx, dy)`'yi yana ve aşağı ayrı ayrı, her biri yalnızca o konum engelli değilse hareket edecek biçimde değiştir.

# --tests--

A wall should stop the player just before it.
tr: Bir duvar oyuncuyu hemen önünde durdurmalı.

```js
assert.strictEqual(tileAt(5.2, 1.5), '#')
assert.strictEqual(tileAt(4.9, 1.5), '.')
assert.isTrue(blocked(4.85, 1.5))
assert.isFalse(blocked(4.75, 1.5))
$.press('ArrowUp')
$.tick(100)
assert.isAbove(player.x, 4.7)
assert.isBelow(player.x, 4.8 + 1e-9)
```

Walking into a wall at an angle should slide along it, and never end up inside a wall.
tr: Bir duvara açılı yürümek duvar boyunca kaydırmalı ve asla bir duvarın içine sokmamalı.

```js
player.angle = 0.3 // right and a little down, into the wall below
$.press('ArrowUp')
for (let i = 0; i < 200; i++) {
  $.tick(1)
  assert.isFalse(blocked(player.x, player.y), 'inside a wall at ' + player.x + ', ' + player.y)
}
assert.isAbove(player.x, 4, 'slid along the wall instead of stopping')
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
