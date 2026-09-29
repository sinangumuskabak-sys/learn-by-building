---
title: Boxes are in the way
title_tr: Kutular yolu kapatır
skills: [prog.arrays, game.collision]
---

# --goal--

`boxAt(x, y)` finds the box on a tile, if there is one. For now a box blocks the player like a wall; pushing comes
next.

# --goal-tr--

Oyuncu kutunun üstüne çıkmamalı. Önce bir soru fonksiyonu yazacağız: `boxAt(x, y)`, "bu karede kutu var mı, varsa
hangisi?" Duvarlar için kümeye soruyorduk; kutular bir listede, orada **aramamız** gerekiyor.

Şimdilik kutu da duvar gibi yolu kapatacak. İtmeyi bir sonraki adımda yazacağız.

# --code--

```js
function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  if (boxAt(x, y)) return // pushing comes in the next step
  player = { x, y }
}
```

# --meaning--

- `boxes.find(...)` gives the first box for which the test is true, or `undefined` if there is none.
- The test: the box's `x` equals `x` **and** (`&&`) its `y` equals `y`.
- `return` gives the found box back to the caller.
- In `move`, a box on the target tile stops the step for now.

# --meaning-tr--

- `boxes.find((box) => ...)` → listede koşula uyan **ilk** elemanı bulur; hiçbiri uymazsa `undefined` (yok) verir.
- `box.x === x && box.y === y` → kutunun x'i verilen x'e **ve** (`&&`) y'si verilen y'ye eşit mi?
- `return` → bulunan kutuyu fonksiyondan **geri verir**. Çağıran yer onu kullanabilir.
- `if (boxAt(x, y)) return` → kutu varsa (`undefined` değilse) `if` girer: adım yok. `undefined` `if` için "yanlış"
  sayılır.

# --task--

1. Above `function move`, write `boxAt` and leave an empty line.
2. In `move`, under the wall line, write the box line. Press **Run**.

# --task-tr--

1. `function move(dx, dy) {` satırının **üstüne** `boxAt` fonksiyonunu yaz; arada bir boş satır kalsın.
2. `move` içinde duvar satırının (`if (walls.has(...)) return`) altına kutu satırını yaz.
3. **Çalıştır**, oyuna tıkla: oyuncu artık kutunun içinden geçemez.

# --tests--

`boxAt` should find the box on a tile, or nothing.
tr: `boxAt` bir karedeki kutuyu bulmalı ya da hiçbir şey vermemeli.

```js
loadLevel(1)
assert.deepEqual(boxAt(2, 2), { x: 2, y: 2 })
assert.strictEqual(boxAt(3, 2), boxes[1], 'the box itself, from the list')
assert.isUndefined(boxAt(1, 1))
```

For now, boxes should block the player.
tr: Şimdilik kutular oyuncuyu engellemeli.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 }, 'the box at (3, 2) is in the way')
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

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  if (boxAt(x, y)) return // pushing comes in the next step
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
  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
