---
title: Push a box
title_tr: Kutu it
skills: [game.state, game.collision]
---

# --goal--

The whole game is one rule: you can push a box, but only one, and never into a wall. If the target tile has a box, we
look one tile further: if it is free, the box moves there and the player follows.

# --goal-tr--

Oyunun bütün kuralı tek cümle: bir kutuyu **itebilirsin**, ama **yalnızca bir tane** ve **asla duvara doğru** değil.
Gideceğin karede kutu varsa, aynı yönde **bir kare daha** ötesine bakarsın:

```
@ $ .   →   . @ $    kutunun arkası boş: kutu ilerler, sen de
@ $ #   →   olmaz    kutunun arkasında duvar var
@ $ $   →   olmaz    arkasında başka kutu var: iki kutu itilemez
```

Ve kutuyu asla **çekemezsin**. Sokoban'ı bulmaca yapan bu: bir kutuyu köşeye itersen orada kalır.

# --code--

```js
const box = boxAt(x, y)
if (box) {
  const bx = x + dx
  const by = y + dy
  if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
  box.x = bx
  box.y = by
}
```

# --meaning--

- `box` is the box on the target tile, or `undefined`; `if (box)` enters only when there is one.
- `bx, by` is the tile beyond it, one more step in the same direction.
- A wall **or** another box there stops everything.
- Otherwise the box moves. `box` is the object inside `boxes`, so the array changes too. Then the player steps in.

# --meaning-tr--

- `const box = boxAt(x, y)` → gidilecek karedeki kutu (yoksa `undefined`).
- `if (box) { ... }` → sadece kutu **varsa** içeri girer.
- `const bx = x + dx`, `const by = y + dy` → kutunun gideceği kare: oyuncunun gideceği karenin **bir ötesi**.
- `walls.has(key(bx, by)) || boxAt(bx, by)` → orada duvar **veya** başka kutu var mı? Varsa `return`: kutu da oyuncu
  da yerinde kalır.
- `box.x = bx`, `box.y = by` → kutuyu ilerlet. `box` listedeki kutunun **kendisi** olduğu için `boxes` de değişir.
- `if` bloğundan sonra `player = { x, y }` çalışır: ya kutu yoktu, ya da kutu az önce yol açtı.

# --task--

In `move`, replace the line `if (boxAt(x, y)) return // pushing comes in the next step` with the push block.

# --task-tr--

`move` içindeki `if (boxAt(x, y)) return // pushing comes in the next step` satırını **sil**, yerine itme bloğunu yaz
(`player = { x, y }` satırının üstüne). Uzun `if (walls.has(...` satırını sonundaki yorumla birlikte yaz. **Çalıştır**,
oyuna tıkla ve sağ oka bas: kutu hedefe gitmeli.

# --predict--

In the second level, can you push the two boxes in the middle row together, to the left?
- [ ] Yes, both move one tile
- [x] No, nothing moves
  The tile beyond the first box has another box, so `move` returns.
- [ ] Only the first box moves

# --predict-tr--

İkinci bölümde ortadaki iki kutuyu birlikte sola itebilir misin?
- [ ] Evet, ikisi de bir kare gider
- [x] Hayır, hiçbir şey kıpırdamaz
  İlk kutunun ötesindeki karede başka kutu var; `move` hemen çıkar.
- [ ] Sadece ilk kutu gider

# --hint--

Do not forget `|| boxAt(bx, by)`: without it, a box can be pushed into another box.

# --hint-tr--

`|| boxAt(bx, by)` kısmını unutma: o olmazsa kutu başka bir kutunun içine itilebilir.

# --tests--

Walking into a box should push it one tile.
tr: Bir kutuya yürümek onu bir kare itmeli.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 2 })
assert.deepEqual(boxAt(3, 1), { x: 3, y: 1 })
assert.isUndefined(boxAt(3, 2))
```

A box should not move into a wall, and the player should stay put.
tr: Kutu duvara doğru gitmemeli, oyuncu da yerinde kalmalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 2 })
assert.deepEqual(boxAt(3, 1), { x: 3, y: 1 })
```

Two boxes in a row should not move.
tr: Arka arkaya iki kutu hareket etmemeli.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowRight')
$.press('ArrowUp')
$.press('ArrowLeft')
$.press('ArrowLeft')
assert.deepEqual(player, { x: 4, y: 2 }, 'two boxes side by side cannot be pushed together')
assert.deepEqual(boxes.map((b) => [b.x, b.y]).sort(), [[2, 2], [3, 2]])
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
  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
