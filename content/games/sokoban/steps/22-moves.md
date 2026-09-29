---
title: Count the moves
title_tr: Hamleleri say
skills: [game.state]
---

# --goal--

A move counter shows how good a solution is. Every step that really happens adds one; blocked steps do not count.

# --goal-tr--

Bir bölümü çözmek güzel; **az hamlede** çözmek daha güzel. Hamleleri sayıp sağ üste yazacağız: `Moves: 12`.

Sadece **gerçekleşen** adımlar sayılmalı: duvara ya da sıkışmış kutuya çarpan adım sayılmaz.

# --code--

```js
let moves

function loadLevel(index) {
  // ...
  moves = 0
}

function move(dx, dy) {
  // ...
  player = { x, y }
  moves += 1
}

  ctx.textAlign = 'right'
  ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2)
```

# --meaning--

- `moves` starts at 0 on every load.
- `moves += 1` comes after `player = { x, y }`: blocked steps have already returned, so they are not counted.
- `textAlign = 'right'` puts the end of the text at x, 12 pixels from the right edge.

# --meaning-tr--

- `let moves` → hamle sayacı. `loadLevel`'ın **sonunda** `moves = 0`: her bölüm sıfırdan başlar. (`// ...` satırları
  "buradaki kod aynı kalıyor" demek; onları yazma.)
- `moves += 1` → `move`'un **en sonunda**, `player = { x, y }`'nin altında. Engellenen adımlar daha önce `return` ile
  çıktığı için buraya hiç ulaşmaz; sayılmazlar.
- `ctx.textAlign = 'right'` → yazının **sağ ucu** verilen x'e gelir. `canvas.width - 12` → sağ kenardan 12 piksel içeri.
  Sayı büyüdükçe yazı sola doğru uzar.

# --task--

1. Under `let player` write `let moves`.
2. At the end of `loadLevel` write `moves = 0`; at the end of `move`, under `player = { x, y }`, write `moves += 1`.
3. In `draw`, under the `Level` line, write the two lines. Press **Run**.

# --task-tr--

1. `let player` satırının altına `let moves` yaz.
2. `loadLevel`'ın sonuna, kapanan `}`'den hemen önce `moves = 0` yaz.
3. `move`'un sonuna, `player = { x, y }` satırının altına `moves += 1` yaz.
4. `draw` içinde `Level` satırının altına iki satırı yaz.
5. **Çalıştır**, biraz yürü: sağ üstteki sayı artmalı, duvara çarpınca artmamalı.

# --tests--

Each move should be counted, and blocked moves should not.
tr: Her hamle sayılmalı, engellenen hamleler sayılmamalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.strictEqual(moves, 2, 'the third push was blocked by the wall')
assert.include($.texts(), 'Moves: 2')
```

Loading a level should reset the counter.
tr: Bölüm yüklemek sayacı sıfırlamalı.

```js
$.press('ArrowRight')
$.press(' ')
assert.strictEqual(moves, 0)
```

The counter should be right-aligned at the top.
tr: Sayaç üstte sağa hizalı olmalı.

```js
draw()
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Moves: 0')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [468, 24])
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
}

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
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
    box.x = bx
    box.y = by
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
