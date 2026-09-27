---
title: A record for every level
title_tr: Her bölüm için bir rekor
skills: [game.state]
---

# --explanation--

Solving a level is one goal; solving it in **fewer moves** is the next. Keep a best (fewest) move count for **each**
level.

`localStorage` only stores strings, but a whole object can be stored as JSON text:

```js
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')   // { 0: 1, 1: 9 } or {} the first time
...
localStorage.setItem('sokoban-best', JSON.stringify(best))
```

The `|| '{}'` gives a sensible default when nothing was saved yet. An object keyed by level number is a small
**dictionary**: `best[level]` is `undefined` until that level has been solved once, which is exactly the "no record
yet" case to check (with `=== undefined`, since `0` would never be a real Sokoban record but it is good practice not to
treat falsy values as missing).

Show the record next to the move counter, so the player always knows the number to beat.

# --explanation-tr--

Bir bölümü çözmek bir hedef; onu **daha az hamlede** çözmek bir sonraki. **Her** bölüm için en iyi (en az) hamle sayısını
tut.

`localStorage` yalnızca metin saklar, ama bütün bir nesne JSON metni olarak saklanabilir:

```js
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')   // { 0: 1, 1: 9 } ya da ilk seferde {}
...
localStorage.setItem('sokoban-best', JSON.stringify(best))
```

`|| '{}'`, henüz hiçbir şey kaydedilmediğinde mantıklı bir varsayılan verir. Bölüm numarasına göre anahtarlanan bir nesne
küçük bir **sözlüktür**: `best[level]`, o bölüm bir kez çözülene kadar `undefined`'dır; kontrol edilecek "henüz rekor yok"
durumu tam da budur (`=== undefined` ile; çünkü `0` gerçek bir Sokoban rekoru olamaz ama yanlışsı değerleri eksik gibi
saymamak iyi bir alışkanlıktır).

Rekoru hamle sayacının yanında göster; böylece oyuncu hep geçmesi gereken sayıyı bilir.

# --task--

1. Add `let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')`.
2. At the end of a move, if the level is now solved and `best[level]` is `undefined` or bigger than `moves`, set it and
   save the whole object with `JSON.stringify` under `'sokoban-best'`.
3. When a level has a record, show it after the move counter: `Moves: 12  (best 9)`.

# --task-tr--

1. `let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')` ekle.
2. Bir hamlenin sonunda bölüm artık çözüldüyse ve `best[level]` `undefined` ya da `moves`'tan büyükse onu ayarla ve bütün
   nesneyi `JSON.stringify` ile `'sokoban-best'` altında kaydet.
3. Bir bölümün rekoru varsa onu hamle sayacından sonra göster: `Moves: 12  (best 9)`.

# --tests--

Solving a level should record its move count.
tr: Bir bölümü çözmek hamle sayısını kaydetmeli.

```js
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.strictEqual(best[1], 9)
assert.deepEqual(JSON.parse(localStorage.getItem('sokoban-best')), { 1: 9 })
assert.include($.texts(), 'Moves: 9  (best 9)')
```

A longer solution should not replace a better record.
tr: Daha uzun bir çözüm daha iyi bir rekorun yerini almamalı.

```js
best[1] = 9
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'LRRUUULDULD') $.press(keys[m])
assert.isTrue(solved())
assert.strictEqual(best[1], 9)
```

Records should be kept separately for each level.
tr: Rekorlar her bölüm için ayrı tutulmalı.

```js
$.press('ArrowRight')
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.deepEqual(best, { 0: 1, 1: 9 })
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
  if (event.key === 'z') undo()
  if (event.key === 'r') loadLevel(level)
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
