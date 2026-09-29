---
title: A line at the bottom
title_tr: Alttaki satır
skills: [game.state]
---

# --goal--

The bottom strip shows a hint while playing, and a green message once the level is solved (a different one on the
last level).

# --goal-tr--

Alttaki şeride bir satır yazacağız. Oynarken gri bir ipucu: `Arrows: move` (oklar: yürü). Bölüm çözülünce yeşil bir
mesaj: `Solved! Press Space for the next level` (çözüldü, sıradaki bölüm için Boşluk). Son bölümde ise
`All levels solved!` (bütün bölümler çözüldü).

# --code--

```js
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
```

# --meaning--

- `if ... else` shows one of two lines: the green message when solved, the grey hint otherwise.
- `last` is `true` on the last level; `last ? a : b` picks the message.
- `canvas.height - 16` is near the bottom, in the middle of the `BOTTOM` strip.

# --meaning-tr--

- `ctx.textAlign = 'center'` → yazının ortası verilen x'e gelir; `canvas.width / 2` tuvalin ortası.
- `if (solved()) { ... } else { ... }` → çözüldüyse ilk blok, **değilse** ikinci blok.
- `const last = level === LEVELS.length - 1` → son bölümde miyiz? `last` `true` ya da `false` olur.
- `last ? 'All levels solved!' : 'Solved! ...'` → kısa `if`: son bölümse ilk mesaj, değilse ikincisi.
- `canvas.height - 16` → alttan 16 piksel yukarı: alt şeridin ortası.

# --task--

In `draw`, under the `Level` line, leave an empty line and write the block. Press **Run** and solve the first level.

# --task-tr--

`draw` içinde `Level` satırının altına bir boş satır bırakıp bloğu yaz (`draw`'u kapatan `}`'den önce). **Çalıştır**:
altta gri ipucu olmalı; ilk bölümü çözünce yeşil mesaj çıkmalı.

# --tests--

While playing, the hint should be shown in grey.
tr: Oynarken ipucu gri gösterilmeli.

```js
draw()
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Arrows: move')
assert.exists(t)
assert.strictEqual(t.fill, '#a8a29e')
assert.deepEqual(t.args.slice(1), [240, 504])
```

A solved level should show the green message.
tr: Çözülmüş bölüm yeşil mesajı göstermeli.

```js
$.press('ArrowRight')
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Solved! Press Space for the next level')
assert.exists(t)
assert.strictEqual(t.fill, '#4ade80')
```

The last level should say that everything is solved.
tr: Son bölüm her şeyin çözüldüğünü söylemeli.

```js
loadLevel(2)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RURRDDDDLDRUUUULLLRDRDRDDLLDLLURLU') $.press(keys[m])
assert.include($.texts(), 'All levels solved!')
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
