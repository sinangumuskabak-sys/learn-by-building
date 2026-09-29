---
title: One step
title_tr: Bir adım
skills: [game.state, game.collision]
---

# --goal--

`move(dx, dy)` moves the player one tile: `dx` and `dy` say how far in each direction. A wall on the target tile
blocks the step.

# --goal-tr--

Oyuncu yürüyecek. Sokoban'da her adım tam **bir kare**. `move` (hareket et) fonksiyonu iki sayı alacak: `dx` (x'e ne
eklenecek) ve `dy` (y'ye ne eklenecek). Sağa bir adım `move(1, 0)`, yukarı bir adım `move(0, -1)` (y aşağı doğru
büyüdüğü için yukarı eksi).

Önce gidilecek kareye bakarız: **duvarsa** adım olmaz.

# --code--

```js
function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  player = { x, y }
}
```

# --meaning--

- `x` and `y` are the target tile.
- `walls.has(key(x, y))` asks the Set whether there is a wall there; if so, `return` leaves at once.
- Otherwise the player moves there.

# --meaning-tr--

- `const x = player.x + dx` ve `const y = player.y + dy` → **gidilecek kare**.
- `walls.has(key(x, y))` → kümeye sorar: "bu karede duvar var mı?" `true` ya da `false`.
- `return` → fonksiyondan **hemen çık**; altındaki satır çalışmaz, oyuncu yerinde kalır.
- `player = { x, y }` → duvar yoksa oyuncu yeni kareye geçer.
- Kutuları şimdilik düşünmüyoruz; oyuncu şu an kutunun üstünden geçebilir. İki adım sonra düzelecek.

# --task--

Above `function draw() {`, write `move` and leave an empty line. Press **Run**.

# --task-tr--

`move` fonksiyonunu `function draw() {` satırının **üstüne** yaz; arada bir boş satır kalsın. **Çalıştır**. Klavyeyi
bir sonraki adımda bağlayacağız; kontroller fonksiyonu kendileri çağırıyor.

# --tests--

`move` should move the player one tile.
tr: `move` oyuncuyu bir kare taşımalı.

```js
loadLevel(1)
move(0, -1)
assert.deepEqual(player, { x: 3, y: 3 })
move(1, 0)
assert.deepEqual(player, { x: 4, y: 3 })
```

Walls should block the player.
tr: Duvarlar oyuncuyu engellemeli.

```js
loadLevel(1)
move(1, 0)
move(1, 0)
assert.deepEqual(player, { x: 4, y: 4 }, 'the second step would be into the wall')
move(0, 1)
assert.deepEqual(player, { x: 4, y: 4 })
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 48
const TOP = 48 // room for the level number and the move counter
const BOTTOM = 40 // room for the hint line
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
  [
    '######',
    '#    #',
    '# $$ #',
    '# .. #',
    '#  @ #',
    '######',
  ],
  [
    '  #####',
    '###   #',
    '#.@$  #',
    '### $.#',
    '#.##$ #',
    '# # . ##',
    '#$ *$$.#',
    '#   .  #',
    '########',
  ],
]

let level = 0
let walls
let goals
let boxes
let player

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  goals = new Set()
  boxes = []
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
      if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))
      if (ch === '$' || ch === '*') boxes.push({ x, y })
      if (ch === '@' || ch === '+') player = { x, y }
    })
  })
}

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  player = { x, y }
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Center the level on the canvas.
  const rows = LEVELS[level].length
  const cols = Math.max(...LEVELS[level].map((line) => line.length))
  const ox = (canvas.width - cols * TILE) / 2
  const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
  for (const k of goals) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#f59e0b', 18)
  }
  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
