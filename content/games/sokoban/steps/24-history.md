---
title: A photo before every move
title_tr: Her hamleden önce fotoğraf
skills: [prog.arrays, game.state]
---

# --goal--

Just before a move really happens, we push a snapshot onto `history`. Blocked moves must not leave a photo, so the
snapshot is taken after all the checks: after the push checks when there is a box, in an `else` when there is not.

# --goal-tr--

Şimdi fotoğrafları çekiyoruz: her hamleden **hemen önce** bir fotoğraf deftere girsin.

Ama sadece **gerçekleşecek** hamleler için! Engellenen bir hamle deftere girerse "geri al" boşa bir adım harcar. Bu
yüzden fotoğrafı bütün kontrollerden sonra çekeriz: kutu varsa itme kontrolünden sonra, kutu yoksa `else` içinde.

# --code--

```js
if (box) {
  const bx = x + dx
  const by = y + dy
  if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
  history.push(snapshot())
  box.x = bx
  box.y = by
} else {
  history.push(snapshot())
}
```

# --meaning--

- `history.push(snapshot())` adds a photo at the end of the list.
- In the `if (box)` branch it comes after the wall-or-box check, so a blocked push leaves no photo.
- `else` runs when there is no box: a plain step, also photographed.

# --meaning-tr--

- `history.push(snapshot())` → o anki fotoğrafı listenin **sonuna** ekler.
- `if (box)` içinde: duvar/kutu kontrolünden **sonra**, kutuyu kıpırdatmadan **önce**. Engellenen itiş daha önce
  `return` ile çıktığı için fotoğraf çekilmez.
- `} else { ... }` → "**değilse**": kutu yoksa düz bir adım; onun da fotoğrafı çekilir.
- Duvara çarpan adım en baştaki `return` ile çıktığı için deftere hiç girmez.

# --task--

In `move`, write `history.push(snapshot())` above `box.x = bx`, and add the `else` part after the `if (box)` block.

# --task-tr--

1. `move` içinde `box.x = bx` satırının **üstüne** `history.push(snapshot())` yaz.
2. `if (box) { ... }` bloğunun kapanan `}`'sini `} else {` yap; altına `history.push(snapshot())` ve kapanan `}` yaz.
3. **Çalıştır**. Ekran değişmez; geri almayı bir sonraki adımda bağlayacağız.

# --tests--

Every move that happens should leave one snapshot; blocked moves none.
tr: Gerçekleşen her hamle bir fotoğraf bırakmalı; engellenenler hiç.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.lengthOf(history, 2, 'the third push was blocked by the wall')
$.press('ArrowDown')
$.press('ArrowDown')
$.press('ArrowDown')
assert.lengthOf(history, 4, 'the last step down hit the wall')
```

Snapshots should be taken before the move, and stay unchanged.
tr: Fotoğraflar hamleden önce çekilmeli ve değişmemeli.

```js
loadLevel(1)
$.press('ArrowUp')
const saved = history[0]
assert.deepEqual(JSON.parse(saved).player, { x: 3, y: 4 })
$.press('ArrowUp')
assert.strictEqual(history[0], saved, 'pushing a box later must not change an earlier snapshot')
assert.deepEqual(JSON.parse(history[1]).boxes, [{ x: 2, y: 2 }, { x: 3, y: 2 }])
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
let moves
let history

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
  moves = 0
  history = []
}

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function snapshot() {
  return JSON.stringify({ player, boxes, moves })
}

function move(dx, dy) {
  if (solved()) return
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  const box = boxAt(x, y)
  if (box) {
    const bx = x + dx
    const by = y + dy
    if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
    history.push(snapshot())
    box.x = bx
    box.y = by
  } else {
    history.push(snapshot())
  }
  player = { x, y }
  moves += 1
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  if (event.key === ' ' && solved() && level < LEVELS.length - 1) loadLevel(level + 1)
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2)

  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  if (solved()) {
    const last = level === LEVELS.length - 1
    ctx.fillStyle = '#4ade80'
    ctx.fillText(last ? 'All levels solved!' : 'Solved! Press Space for the next level', canvas.width / 2, canvas.height - 16)
  } else {
    ctx.fillStyle = '#a8a29e'
    ctx.fillText('Arrows: move', canvas.width / 2, canvas.height - 16)
  }
}

loadLevel(0)
draw()
```
