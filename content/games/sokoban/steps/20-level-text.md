---
title: Which level?
title_tr: Hangi bölüm?
skills: [game.canvas]
---

# --goal--

A counter at the top left tells the player where they are: `Level 1/3`.

# --goal-tr--

Oyuncu nerede olduğunu bilmeli. Sol üstteki şeride `Level 1/3` (bölüm 1/3) yazacağız.

Yazı yazmak da çizim gibi: önce renk, yazı tipi ve hiza, sonra `fillText`.

# --code--

```js
tile(player.x, player.y, '#38bdf8', 10)

ctx.fillStyle = 'white'
ctx.font = 'bold 18px sans-serif'
ctx.textAlign = 'left'
ctx.textBaseline = 'middle'
ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)
```

# --meaning--

- `textAlign = 'left'` puts the start of the text at x; `textBaseline = 'middle'` puts its middle at y.
- `level` counts from 0 but people count from 1, so we show `level + 1`. The parentheses add first; without them the
  text would get `0` and `1` glued on: `'Level 01/3'`.
- `TOP / 2` is the middle of the top strip.

# --meaning-tr--

- `ctx.fillStyle = 'white'` → beyaz yazı. `ctx.font = 'bold 18px sans-serif'` → kalın, 18 piksel, düz bir yazı tipi.
- `ctx.textAlign = 'left'` → yazının **sol ucu** verilen x'e gelir.
- `ctx.textBaseline = 'middle'` → yazının **dikey ortası** verilen y'ye gelir.
- `'Level ' + (level + 1) + '/' + LEVELS.length` → `'Level 1/3'`. `level` 0'dan başlar ama insanlar 1'den sayar.
  **Parantez önemli**: önce `level + 1` toplanır. Parantez olmasa yazıya önce `0`, sonra `1` eklenirdi: `'Level 01/3'`.
- `12, TOP / 2` → soldan 12 piksel, üst şeridin ortası (24).

# --task--

In `draw`, under the player line, leave an empty line and write the five lines. Press **Run**.

# --task-tr--

`draw` içinde oyuncu satırının (`tile(player.x, ...)`) altına bir boş satır bırakıp beş satırı yaz. **Çalıştır**: sol
üstte `Level 1/3` görmelisin.

# --predict--

What would `'Level ' + level + 1 + '/' + LEVELS.length` show on the first level?
- [ ] `Level 1/3`
- [x] `Level 01/3`
  Left to right: `'Level '` + `0` is `'Level 0'`, then `+ 1` glues a `1` on.
- [ ] `Level 0/3`

# --predict-tr--

Parantezsiz `'Level ' + level + 1 + '/' + LEVELS.length` ilk bölümde ne yazardı?
- [ ] `Level 1/3`
- [x] `Level 01/3`
  Soldan sağa: `'Level '` + `0` → `'Level 0'`; sonra `+ 1` yazıya bir `1` ekler.
- [ ] `Level 0/3`

# --tests--

`Level 1/3` should be drawn at the top left.
tr: Sol üste `Level 1/3` yazılmalı.

```js
draw()
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Level 1/3')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [12, 24])
```

After Space the counter should show the next level.
tr: Boşluktan sonra sayaç sıradaki bölümü göstermeli.

```js
$.press('ArrowRight')
$.press(' ')
assert.include($.texts(), 'Level 2/3')
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
}

loadLevel(0)
draw()
```
