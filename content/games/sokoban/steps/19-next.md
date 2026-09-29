---
title: On to the next level
title_tr: Sıradaki bölüme
skills: [game.state, game.input]
---

# --goal--

When a level is solved, Space loads the next one, unless it was the last. Loading rebuilds everything from the text,
so moving on is one call.

# --goal-tr--

Bölüm çözülünce **Boşluk** tuşu sıradaki bölümü açsın. `loadLevel` her şeyi yazıdan baştan kurduğu için sıradaki
bölüme geçmek tek bir çağrı: `loadLevel(level + 1)`.

Ama son bölümdeysek sıradaki yok; o zaman Boşluk hiçbir şey yapmamalı.

# --code--

```js
if (event.key === ' ' && solved() && level < LEVELS.length - 1) loadLevel(level + 1)
draw()
```

# --meaning--

- Three conditions joined with `&&` ("and"): the key is Space, the level is solved, and it is not the last one.
- `LEVELS.length - 1` is the index of the last level (2), because counting starts at 0.

# --meaning-tr--

- `event.key === ' '` → basılan tuş **Boşluk** mu? (Boşluk tuşunun adı tırnak içinde bir boşluk.)
- `&&` → "**ve**": üç koşul da doğru olmalı.
- `solved()` → bölüm çözüldü mü?
- `level < LEVELS.length - 1` → `LEVELS.length` 3; son bölümün numarası 2 (sayma 0'dan başlar). "Son bölümde değil
  miyiz?" `<` "küçük".
- `loadLevel(level + 1)` → bir sonraki bölümü yükle.

# --task--

In the listener, above `draw()`, write the Space line. Press **Run**, solve the first level and press Space.

# --task-tr--

`keydown` dinleyicisinde `draw()` satırının hemen **üstüne** Boşluk satırını yaz. **Çalıştır**, oyuna tıkla, ilk bölümü
çöz ve **Boşluk**'a bas: ikinci bölüm açılmalı.

# --tests--

Space should load the next level once solved.
tr: Çözülünce Boşluk sıradaki bölümü yüklemeli.

```js
$.press(' ')
assert.strictEqual(level, 0, 'not before the level is solved')
$.press('ArrowRight')
$.press(' ')
assert.strictEqual(level, 1)
assert.isFalse(solved())
```

Space should do nothing on the last level.
tr: Son bölümde Boşluk hiçbir şey yapmamalı.

```js
loadLevel(2)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RURRDDDDLDRUUUULLLRDRDRDDLLDLLURLU') $.press(keys[m])
assert.isTrue(solved())
$.press(' ')
assert.strictEqual(level, 2)
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
}

loadLevel(0)
draw()
```
