---
title: "Build it yourself: count the pushes"
title_tr: "Kendin yap: itmeleri say"
skills: [game.state]
---

# --goal--

Classic Sokoban scores two numbers: moves and **pushes** (the moves that moved a box). Add a push counter.

# --goal-tr--

Oyun senin, kurallar da! Klasik Sokoban'da iki sayı tutulur: **hamleler** ve **itmeler** (kutuyu kıpırdatan hamleler).
Az itmeyle çözmek ayrı bir ustalıktır. Oyuna bir itme sayacı ekle.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: sayaç, fotoğraf, geri alma, yazı... Kontroller çalıştığında yeşile döner.

# --task--

- Keep the number of pushes in a variable `pushes`, 0 when a level starts or restarts.
- Only a move that moves a box adds one.
- Undo must bring back the old number too.
- Show it at the top, like `Pushes: 3`.

# --task-tr--

- İtme sayısını `pushes` adlı bir değişkende tut; bölüm başlarken ve yeniden başlarken 0 olsun.
- Sadece kutuyu kıpırdatan hamle 1 eklesin; düz yürümek eklemesin.
- Geri alma (Z) eski sayıyı da geri getirsin.
- Üstte `Pushes: 3` gibi göster (örneğin hamle sayacının yanında).

Değiştireceğin yerler: değişkenler, `loadLevel`, `move`, `snapshot`, `undo` ve `draw`. Takılırsan Maymun'a sor ya da
ipucu kutusuna bak.

# --hint--

Add `pushes` next to `moves` everywhere a move is counted, saved or restored: `loadLevel`, `snapshot`, `undo`. Add one
right where the box moves (`box.x = bx`).

# --hint-tr--

`pushes`'ı `moves`'un sayıldığı, kaydedildiği ve geri yüklendiği her yere ekle: `loadLevel`, `snapshot` ve `undo`
(`{ player, boxes, moves, pushes }`). Artırma yeri, kutunun kıpırdadığı yer: `box.x = bx` satırının yanı.

# --tests--

Only moves that push a box should count as pushes.
tr: Sadece kutu iten hamleler itme sayılmalı.

```js
loadLevel(1)
assert.strictEqual(pushes, 0)
$.press('ArrowUp')
assert.strictEqual(pushes, 0, 'a plain step is not a push')
$.press('ArrowUp')
assert.strictEqual(pushes, 1)
$.press('ArrowUp')
assert.strictEqual(pushes, 1, 'a blocked push does not count')
assert.strictEqual(moves, 2)
```

Undo should bring back the push count; restart should reset it.
tr: Geri alma itme sayısını geri getirmeli; yeniden başlamak sıfırlamalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('z')
assert.strictEqual(pushes, 0)
$.press('ArrowUp')
$.tap('r')
assert.strictEqual(pushes, 0)
```

The push count should be shown.
tr: İtme sayısı gösterilmeli.

```js
$.press('ArrowRight')
assert.isTrue($.texts().some((t) => t.includes('Pushes: 1')))
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
let pushes
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
  pushes = 0
  history = []
}

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function snapshot() {
  return JSON.stringify({ player, boxes, moves, pushes })
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
    pushes += 1
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
  ;({ player, boxes, moves, pushes } = JSON.parse(previous))
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
  ctx.fillText('Moves: ' + moves + '  Pushes: ' + pushes + record, canvas.width - 12, TOP / 2)

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
