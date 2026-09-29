---
title: Solved!
title_tr: Çözüldü!
skills: [game.state]
---

# --goal--

A level is solved when every box sits on a goal. `solved()` asks exactly that with `every`, and a solved board
freezes.

# --goal-tr--

Bölüm ne zaman çözülür? **Her kutu bir hedefin üstündeyse.** Bölüm biçiminde hedef sayısı kutu sayısına eşittir;
bu yüzden kutulara bakmak yeter.

"Hepsi mi?" sorusunu soran bir liste komutu var: `every` (her biri). Çözülünce de tahta **donsun**: artık hamle yok.

# --code--

```js
function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function move(dx, dy) {
  if (solved()) return
```

# --meaning--

- `every` runs the test for each box and is `true` only if it is true for all.
- `move` returns at once when the level is solved.

# --meaning-tr--

- `boxes.every((box) => ...)` → her kutu için soruyu sorar; **hepsi** "evet" derse `true`, biri bile "hayır" derse
  `false`.
- Soru yine: "bu kutunun karesi bir hedef mi?"
- `return` → sonucu geri verir: `solved()` `true` ya da `false` olur.
- `if (solved()) return` → `move`'un **ilk satırı**: bölüm çözüldüyse hiçbir şey yapma.

# --task--

1. Above `function move`, write `solved` and leave an empty line.
2. In `move`, write `if (solved()) return` as the first line. Press **Run**.

# --task-tr--

1. `function move(dx, dy) {` satırının **üstüne** `solved` fonksiyonunu yaz; arada bir boş satır kalsın.
2. `move` içinde **en üste** `if (solved()) return` yaz.
3. **Çalıştır**, kutuyu hedefe it, sonra geri yürümeye çalış: oyuncu kıpırdamamalı.

# --tests--

Pushing the only box onto the goal should solve the first level.
tr: Tek kutuyu hedefe itmek ilk bölümü çözmeli.

```js
assert.isFalse(solved())
$.press('ArrowRight')
assert.isTrue(solved())
```

The board should be frozen once solved.
tr: Çözülünce tahta donmalı.

```js
$.press('ArrowRight')
$.press('ArrowLeft')
assert.deepEqual(player, { x: 2, y: 1 })
```

The second level should be solvable with the right moves.
tr: İkinci bölüm doğru hamlelerle çözülebilmeli.

```js
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.isTrue(solved())
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
