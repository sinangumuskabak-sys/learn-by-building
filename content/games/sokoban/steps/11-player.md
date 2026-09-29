---
title: The player
title_tr: Oyuncu
skills: [game.state]
---

# --goal--

The last character: `@` (or `+` on a goal) is the player, one `{ x, y }` object, drawn as a blue square on top.

# --goal-tr--

Son harf: **oyuncu**. `@` oyuncu, `+` bir hedefin üstünde duran oyuncu. Oyuncu tek kişi olduğu için liste değil, tek
bir `{ x, y }` nesnesi. Onu mavi bir kare olarak, en son (yani her şeyin **üstüne**) çizeceğiz.

# --code--

```js
let player

      if (ch === '@' || ch === '+') player = { x, y }

  tile(player.x, player.y, '#38bdf8', 10)
```

# --meaning--

- `player` holds the player's tile.
- It is drawn last, so it is painted on top of a goal it stands on.

# --meaning-tr--

- `let player` → oyuncunun karesi.
- `if (ch === '@' || ch === '+') player = { x, y }` → oyuncu harfiyse konumunu kaydet.
- `tile(player.x, player.y, '#38bdf8', 10)` → açık mavi, 10 piksel içeri çekilmiş kare. En son çizildiği için
  altındaki hedefin üstüne gelir (canvas'ta sonra çizilen öncekini örter).

# --task--

1. Under `let boxes` write `let player`.
2. In `loadLevel`, under the box `if`, write the player `if`.
3. In `draw`, under the box line, write the player line. Press **Run**.

# --task-tr--

1. `let boxes` satırının altına `let player` yaz.
2. `loadLevel` içinde kutu `if`'inin altına oyuncu `if`'ini yaz.
3. `draw` içinde kutu satırının altına oyuncu satırını yaz.
4. **Çalıştır**: solda mavi oyuncu, yanında kutu, sağda hedef. Bölüm tamam!

# --tests--

The player should be read.
tr: Oyuncu okunmalı.

```js
assert.deepEqual(player, { x: 1, y: 1 })
```

`+` should be the player and a goal.
tr: `+` hem oyuncu hem hedef olmalı.

```js
LEVELS.push(['#####', '#+$ #', '#####'])
loadLevel(LEVELS.length - 1)
assert.deepEqual(player, { x: 1, y: 1 })
assert.isTrue(goals.has('1,1'))
```

The player should be drawn in blue, on top.
tr: Oyuncu mavi ve en üstte çizilmeli.

```js
draw()
assert.deepEqual($.rects('#38bdf8'), [{ x: 178, y: 250, w: 28, h: 28, color: '#38bdf8' }])
assert.strictEqual($.rects().at(-1).color, '#38bdf8', 'the player is drawn last')
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
