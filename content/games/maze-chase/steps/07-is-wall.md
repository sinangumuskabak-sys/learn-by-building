---
title: Where can you walk?
title_tr: Nereden yürünür?
skills: [game.collision]
---

# --goal--

Before anything moves, it must know where the walls are. `isWall` reads the map (the ghost house counts as a wall),
and `canGo` asks whether the tile one step in a direction is free. A direction is a pair `[dx, dy]`. Columns are
**wrapped**, so stepping off the left end of the tunnel lands on the right end.

# --goal-tr--

Bir şey hareket etmeden önce **nereye gidebileceğini** bilmeli. İki soru:

- `isWall(col, row)` → "bu döşeme duvar mı?" Haritaya bakar. Hayalet evi (`-`) de oyuncu için duvar sayılır.
- `canGo(e, dir)` → "`e` (oyuncu ya da hayalet) bu yöne bir adım atabilir mi?" Yön bir çift: `[dx, dy]`. `[-1, 0]`
  sola, `[0, 1]` aşağı.

Bir de tünel var: 0. sütunun solu yok, ama oradan çıkan **18. sütuna** girmeli. Sütunu **sarmalayacağız**: -1 → 18,
19 → 0. Saatin 12'den sonra 1'e dönmesi gibi.

# --code--

```js
const wrap = (col) => (col + COLS) % COLS

function isWall(col, row) {
  const ch = MAZE[row][wrap(col)]
  return ch === '#' || ch === '-'
}

function canGo(e, dir) {
  return !isWall(e.col + dir[0], e.row + dir[1])
}
```

# --meaning--

- `%` is the remainder: `(-1 + 19) % 19` is 18 and `(19 + 19) % 19` is 0, so any column one step outside comes back
  in on the other side.
- `isWall` reads the character of the tile; `||` means "or".
- `canGo` adds the direction to the position and asks `isWall`; `!` turns the answer around.

# --meaning-tr--

- `const wrap = (col) => (col + COLS) % COLS` → `%` **bölümden kalan**. `(-1 + 19) % 19` → 18, `(19 + 19) % 19` →
  0, `(5 + 19) % 19` → 5. Tahtanın bir ucundan taşan sütun öbür uçtan geri gelir. Önce `COLS` eklemek -1'i artıya
  çevirir.
- `const ch = MAZE[row][wrap(col)]` → o döşemenin harfi.
- `return ch === '#' || ch === '-'` → `||` "**veya**": duvar ya da evse `true`.
- `canGo(e, dir)` → `e.col + dir[0]`, `e.row + dir[1]`: bir adım ötedeki döşeme. `!` "**değil**": duvar
  **değilse** gidilebilir.

# --task--

Under `key`, write `wrap`, `isWall` and `canGo`.

# --task-tr--

1. `const key = ...` satırının hemen **altına** `wrap` satırını, sonra bir boş satır bırakıp `isWall` ve `canGo`
   fonksiyonlarını yaz (aralarında ve `fillPellets`'ten önce birer boş satır).
2. **Çalıştır**. Görünen bir değişiklik yok; kontroller soruları deneyecek.

# --tests--

Walls and the ghost house should block, corridors and the tunnel should not.
tr: Duvarlar ve hayalet evi kapamalı; koridorlar ve tünel kapamamalı.

```js
assert.isTrue(isWall(0, 0))
assert.isFalse(isWall(1, 1))
assert.isTrue(isWall(9, 8), 'the ghost house is a wall for the player')
assert.strictEqual(wrap(-1), 18)
assert.strictEqual(wrap(19), 0)
assert.isFalse(isWall(-1, 9), 'the tunnel wraps around')
```

`canGo` should look one step in a direction.
tr: `canGo` bir yönde bir adım ötesine bakmalı.

```js
assert.isTrue(canGo(player, [-1, 0]))
assert.isTrue(canGo(player, [1, 0]))
assert.isFalse(canGo(player, [0, -1]))
assert.isFalse(canGo(player, [0, 1]))
```

# --solution--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 24
const TOP = 40 // room for the score and the lives
// # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# #---# #.####',
  '    .  #---#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const ROWS = MAZE.length
const COLS = MAZE[0].length

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

const key = (col, row) => col + ',' + row
const wrap = (col) => (col + COLS) % COLS

function isWall(col, row) {
  const ch = MAZE[row][wrap(col)]
  return ch === '#' || ch === '-'
}

function canGo(e, dir) {
  return !isWall(e.col + dir[0], e.row + dir[1])
}

function fillPellets() {
  pellets = new Set()
  powers = new Set()
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '.') pellets.add(key(col, row))
      if (ch === 'o') powers.add(key(col, row))
    })
  })
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row }
}

function reset() {
  fillPellets()
  placeActors()
}

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })

  ctx.fillStyle = '#fde68a'
  for (const k of pellets) {
    const [col, row] = k.split(',').map(Number)
    ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
  }
  for (const k of powers) {
    const [col, row] = k.split(',').map(Number)
    ctx.beginPath()
    ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
