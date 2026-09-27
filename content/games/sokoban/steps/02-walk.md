---
title: Walking on a grid
title_tr: Izgarada yürümek
skills: [game.input]
---

# --explanation--

Sokoban has no physics and no time: one key press is exactly one step, one tile. That makes it a pure **turn-based**
game, so, like Tic-tac-toe and 2048, it needs no loop. Handle the key, change the state, redraw.

Arrow keys map to a direction as `[dx, dy]` pairs in a lookup object:

```js
const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
move(...directions[event.key])   // spread the pair into move(dx, dy)
```

`move` looks at the target tile first: a wall blocks the step, and for now, so does a box (pushing comes next). Only if
the tile is free does the player move.

`event.preventDefault()` on the arrow keys stops them from scrolling the page while you play.

# --explanation-tr--

Sokoban'da fizik de zaman da yok: bir tuş basışı tam olarak bir adım, bir döşemedir. Bu onu saf bir **sıra tabanlı**
oyun yapar; XOX ve 2048 gibi döngüye ihtiyaç duymaz. Tuşu işle, durumu değiştir, yeniden çiz.

Ok tuşları bir arama nesnesinde `[dx, dy]` çiftleri olarak bir yöne eşlenir:

```js
const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
move(...directions[event.key])   // çifti move(dx, dy)'ye yay
```

`move` önce hedef döşemeye bakar: bir duvar adımı engeller, şimdilik bir kutu da engeller (itme sırada). Döşeme boşsa
oyuncu hareket eder.

Ok tuşlarında `event.preventDefault()`, oynarken sayfanın kaymasını engeller.

# --task--

1. Write `boxAt(x, y)` that returns the box at a tile, or `undefined`.
2. Write `move(dx, dy)`: the target tile is `player.x + dx`, `player.y + dy`; if it is a wall or has a box, do nothing;
   otherwise move the player there.
3. On `keydown`, map the arrow keys to directions with a lookup object, call `event.preventDefault()` and `move`, then
   `draw()`.

# --task-tr--

1. Bir döşemedeki kutuyu ya da `undefined`'ı döndüren `boxAt(x, y)` yaz.
2. `move(dx, dy)` yaz: hedef döşeme `player.x + dx`, `player.y + dy`; duvarsa ya da kutu varsa hiçbir şey yapma; değilse
   oyuncuyu oraya taşı.
3. `keydown`'da ok tuşlarını bir arama nesnesiyle yönlere eşle, `event.preventDefault()` ve `move` çağır, sonra
   `draw()`.

# --tests--

The player should walk one tile per key press.
tr: Oyuncu her tuş basışında bir döşeme yürümeli.

```js
loadLevel(1)
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 })
$.press('ArrowRight')
assert.deepEqual(player, { x: 4, y: 3 })
```

Walls should block the player.
tr: Duvarlar oyuncuyu engellemeli.

```js
loadLevel(1)
$.press('ArrowRight')
$.press('ArrowRight')
$.press('ArrowRight')
assert.deepEqual(player, { x: 4, y: 4 })
$.press('ArrowDown')
assert.deepEqual(player, { x: 4, y: 4 })
```

For now, boxes should block the player too.
tr: Şimdilik kutular da oyuncuyu engellemeli.

```js
loadLevel(1)
assert.deepEqual(boxAt(2, 2), { x: 2, y: 2 })
assert.isUndefined(boxAt(1, 1))
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 }, 'the box at (3, 2) is in the way')
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

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  if (boxAt(x, y)) return // pushing comes in the next step
  player = { x, y }
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  draw()
})

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
  for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
