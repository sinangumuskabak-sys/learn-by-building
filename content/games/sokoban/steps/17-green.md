---
title: A box on a goal turns green
title_tr: Hedefteki kutu yeşile döner
skills: [game.state]
---

# --goal--

The player should see progress: a box sitting on a goal is drawn green instead of brown.

# --goal-tr--

Oyuncu ilerlediğini **görmeli**: hedefin üstündeki kutu kahverengi değil **yeşil** çizilsin. Bölüm bitmeden de hangi
kutuların yerinde olduğu hemen anlaşılır.

# --code--

```js
for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
```

# --meaning--

- `goals.has(key(box.x, box.y))` asks whether the box's tile is a goal.
- `condition ? a : b` picks green when it is, brown when it is not.

# --meaning-tr--

- `goals.has(key(box.x, box.y))` → "bu kutunun karesi bir **hedef** mi?" Kümeye tek bir soru.
- `koşul ? a : b` → kısa bir **if**: koşul doğruysa `a`, değilse `b`. Hedefteyse yeşil (`'#22c55e'`), değilse
  kahverengi (`'#b45309'`).

# --task--

In `draw`, in the box line, replace `'#b45309'` with the `? :` choice.

# --task-tr--

`draw` içindeki kutu satırında `'#b45309'` yerine `goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309'` yaz.
**Çalıştır**, kutuyu hedefe it: yeşile dönmeli.

# --tests--

A box pushed onto a goal should be drawn green.
tr: Hedefe itilen kutu yeşil çizilmeli.

```js
$.press('ArrowRight')
assert.deepEqual($.rects('#22c55e'), [{ x: 120 + 3 * 48 + 6, y: 192 + 48 + 6, w: 36, h: 36, color: '#22c55e' }])
assert.lengthOf($.rects('#b45309'), 0)
```

A box that is not on a goal should stay brown.
tr: Hedefte olmayan kutu kahverengi kalmalı.

```js
draw()
assert.lengthOf($.rects('#b45309'), 1)
assert.lengthOf($.rects('#22c55e'), 0)
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
  const box = boxAt(x, y)
  if (box) {
    const bx = x + dx
    const by = y + dy
    if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
    box.x = bx
    box.y = by
  }
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
