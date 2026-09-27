---
title: Solved! On to the next level
title_tr: Çözüldü! Sıradaki bölüme
skills: [game.state]
---

# --explanation--

A level is solved when **every box sits on a goal**. The level format guarantees there are exactly as many goals as
boxes, so checking the boxes is enough:

```js
boxes.every((box) => goals.has(key(box.x, box.y)))
```

This is also where the choice of `Set` pays off again: "is this tile a goal?" is a single `has` call.

Once solved, the board freezes (no more moves), a message appears, and Space loads the next level with `loadLevel(level
+ 1)`. Because loading a level rebuilds everything from its text, moving on is one call. The game already knew how to
start fresh, and a new level is just a fresh start with a different map.

A level counter at the top tells the player where they are. Boxes that sit on goals are already drawn green, which gives
feedback on progress before the level is fully solved.

# --explanation-tr--

**Her kutu bir hedefin üstündeyse** bölüm çözülmüştür. Bölüm biçimi kutu sayısı kadar hedef olmasını garanti eder; bu
yüzden kutulara bakmak yeter:

```js
boxes.every((box) => goals.has(key(box.x, box.y)))
```

`Set` seçiminin karşılığı burada da görülür: "bu döşeme hedef mi?" tek bir `has` çağrısıdır.

Çözülünce tahta donar (artık hamle yok), bir mesaj belirir ve Boşluk `loadLevel(level + 1)` ile sıradaki bölümü yükler.
Bir bölümü yüklemek her şeyi metninden yeniden kurduğu için ilerlemek tek bir çağrıdır. Oyun zaten sıfırdan başlamayı
biliyordu; yeni bir bölüm yalnızca farklı bir haritayla sıfırdan başlamaktır.

Tepedeki bir bölüm sayacı oyuncuya nerede olduğunu söyler. Hedefteki kutular zaten yeşil çiziliyor; bu da bölüm
tamamen çözülmeden önce ilerleme hakkında geri bildirim verir.

# --task--

1. Write `solved()` returning whether every box is on a goal.
2. `move()` should do nothing once the level is solved.
3. On Space, when the level is solved and it is not the last one, load the next level.
4. Draw `Level 2/3` at the top left (white, `'bold 18px sans-serif'`). At the bottom center, show
   `Solved! Press Space for the next level` in green when solved (`All levels solved!` on the last level), or
   `Arrows: move` in grey otherwise.

# --task-tr--

1. Her kutunun bir hedefte olup olmadığını döndüren `solved()` yaz.
2. Bölüm çözüldükten sonra `move()` hiçbir şey yapmamalı.
3. Boşluk'ta, bölüm çözüldüyse ve son bölüm değilse sıradaki bölümü yükle.
4. Sol üste `Level 2/3` yaz (beyaz, `'bold 18px sans-serif'`). Altta ortada, çözüldüyse yeşil
   `Solved! Press Space for the next level` (son bölümde `All levels solved!`), değilse gri `Arrows: move` göster.

# --tests--

Pushing the only box onto the goal should solve the first level.
tr: Tek kutuyu hedefe itmek ilk bölümü çözmeli.

```js
assert.isFalse(solved())
$.press('ArrowRight')
assert.isTrue(solved())
assert.include($.texts(), 'Solved! Press Space for the next level')
$.press('ArrowLeft')
assert.deepEqual(player, { x: 2, y: 1 }, 'the board is frozen once solved')
```

Space should load the next level.
tr: Boşluk sıradaki bölümü yüklemeli.

```js
$.press('ArrowRight')
$.press(' ')
assert.strictEqual(level, 1)
assert.isFalse(solved())
assert.include($.texts(), 'Level 2/3')
```

The second level should be solvable with the right moves.
tr: İkinci bölüm doğru hamlelerle çözülebilmeli.

```js
loadLevel(1)
const moves = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(moves[m])
assert.isTrue(solved())
```

The last level should say that everything is solved.
tr: Son bölüm her şeyin çözüldüğünü söylemeli.

```js
loadLevel(2)
const moves = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RURRDDDDLDRUUUULLLRDRDRDDLLDLLURLU') $.press(moves[m])
assert.isTrue(solved())
assert.include($.texts(), 'All levels solved!')
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
