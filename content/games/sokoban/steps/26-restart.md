---
title: Restart
title_tr: Baştan başla
skills: [game.input]
---

# --goal--

**R** restarts the level: `loadLevel(level)` rebuilds the current level from its text. The hint line now lists the keys.

# --goal-tr--

Bazen en iyisi baştan başlamak. **R** tuşu bölümü yeniden başlatsın. Bunun için yeni bir şey yazmaya gerek yok:
`loadLevel(level)` şu anki bölümü yazıdan yeniden kurar; hamle sayacı ve defter de orada sıfırlanıyor.

Alttaki ipucu da artık bütün tuşları söylesin.

# --code--

```js
document.addEventListener('keydown', (event) => {
  // ...
  if (event.key.toLowerCase() === 'r') loadLevel(level)

    ctx.fillText('Arrows: move   Z: undo   R: restart', canvas.width / 2, canvas.height - 16)
```

# --meaning--

- `loadLevel(level)` loads the level we are on, from scratch.
- The hint gets the two new keys, with three spaces between the parts.

# --meaning-tr--

- `loadLevel(level)` → **aynı** bölümü baştan yükle: kutular yerine, oyuncu başa, `moves` 0, `history` boş.
- İpucu yazısı → `'Arrows: move   Z: undo   R: restart'`. Parçalar arasında **üç boşluk** var; okunaklı dursun diye.

# --task--

1. In the listener, under the `z` line, write the `r` line.
2. In `draw`, change the hint text. Press **Run**.

# --task-tr--

1. `keydown` dinleyicisinde `z` satırının altına `r` satırını yaz.
2. `draw` içindeki ipucu yazısını `'Arrows: move   Z: undo   R: restart'` yap.
3. **Çalıştır**, biraz oyna ve **R**'ye bas: bölüm baştan başlamalı.

# --tests--

`r` should restart the level.
tr: `r` bölümü yeniden başlatmalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('r')
assert.deepEqual(player, { x: 3, y: 4 })
assert.deepEqual(boxAt(3, 2), { x: 3, y: 2 })
assert.strictEqual(moves, 0)
assert.lengthOf(history, 0)
$.press('ArrowUp')
$.tap('R')
assert.deepEqual(player, { x: 3, y: 4 }, 'with Caps Lock too')
```

The hint should list the keys.
tr: İpucu tuşları listelemeli.

```js
draw()
assert.include($.texts(), 'Arrows: move Z: undo R: restart')
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

function undo() {
  const previous = history.pop()
  if (!previous) return
  ;({ player, boxes, moves } = JSON.parse(previous))
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  if (event.key.toLowerCase() === 'z') undo()
  if (event.key.toLowerCase() === 'r') loadLevel(level)
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
    ctx.fillText('Arrows: move   Z: undo   R: restart', canvas.width / 2, canvas.height - 16)
  }
}

loadLevel(0)
draw()
```
