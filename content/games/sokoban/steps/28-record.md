---
title: Show the record
title_tr: Rekoru göster
skills: [game.canvas]
---

# --goal--

Show the record next to the move counter, so the player always knows the number to beat: `Moves: 12  (best 9)`.

# --goal-tr--

Rekor ekranda görünmezse işe yaramaz. Hamle sayacının yanına ekleyeceğiz: `Moves: 12  (best 9)`. Böylece oyuncu hep
**geçmesi gereken sayıyı** görür. Rekor yoksa hiçbir şey eklenmez.

# --code--

```js
ctx.textAlign = 'right'
const record = best[level] === undefined ? '' : '  (best ' + best[level] + ')'
ctx.fillText('Moves: ' + moves + record, canvas.width - 12, TOP / 2)
```

# --meaning--

- `record` is empty text (`''`) with no record, or `'  (best 9)'` with one.
- It is added at the end of the moves text.

# --meaning-tr--

- `best[level] === undefined ? '' : '  (best ' + best[level] + ')'` → kısa `if`: rekor yoksa `''` (**boş yazı**), varsa
  `'  (best 9)'`. `=== undefined` diye açıkça sorarız; `!best[level]` yazsaydık `0` gibi bir sayı da "yok" sayılırdı.
- `'  (best '` → başında **iki** boşluk; sayaçla arasında nefes payı.
- `'Moves: ' + moves + record` → sayaç yazısının sonuna rekoru ekler. Rekor yoksa boş yazı eklemek hiçbir şeyi
  değiştirmez.

# --task--

In `draw`, above the `Moves` line, write the `record` line and add `+ record` to the text. Press **Run** and solve a
level.

# --task-tr--

1. `draw` içinde `ctx.fillText('Moves: ' ...)` satırının **üstüne** `record` satırını yaz.
2. `Moves` satırında `moves`'tan sonra `+ record` ekle.
3. **Çalıştır**, ilk bölümü çöz: sağ üstte `Moves: 1  (best 1)` görmelisin. Oyun bitti!

# --hint--

If the text check fails, look at the two spaces in `'  (best '` and the closing `')'`.

# --hint-tr--

Yazı kontrolü kırmızıysa `'  (best '` içindeki iki boşluğa ve sondaki `')'`'e bak.

# --tests--

The record should be shown after the move counter.
tr: Rekor hamle sayacının yanında gösterilmeli.

```js
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.include($.texts(), 'Moves: 9 (best 9)')
$.tap('r')
assert.include($.texts(), 'Moves: 0 (best 9)')
```

With no record, only the moves should be shown.
tr: Rekor yokken sadece hamleler gösterilmeli.

```js
draw()
assert.include($.texts(), 'Moves: 0')
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
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}') // fewest moves, per level

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
  if (solved() && (best[level] === undefined || moves < best[level])) {
    best[level] = moves
    localStorage.setItem('sokoban-best', JSON.stringify(best))
  }
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
  const record = best[level] === undefined ? '' : '  (best ' + best[level] + ')'
  ctx.fillText('Moves: ' + moves + record, canvas.width - 12, TOP / 2)

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
