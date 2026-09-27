---
title: Walls, pillars and crates
title_tr: Duvarlar, sütunlar ve sandıklar
skills: [prog.arrays, game.canvas]
---

# --explanation--

A Bomberman-style arena is a grid with three kinds of tiles: **walls** (`'#'`) that nothing can break, **crates** (`'+'`)
that bombs destroy, and **floor** (`' '`).

The walls follow a simple pattern. The border is wall all round, and inside, every tile whose row **and** column are both even
is a pillar. That checkerboard of pillars is what makes the classic corridors: flames and players can only travel in straight
lines between them.

The crates are random, about 45% of the free tiles, with one important exception. If the player started boxed in by crates,
their first bomb would have no escape. So the tiles **next to** the start corners (the player's at `(1, 1)` and three for the
enemies) are always floor. "Next to" is a Manhattan distance of at most 1:

```js
Math.abs(sr - r) + Math.abs(sc - c) <= 1
```

Each tile is `TILE` pixels, drawn from `TOP` down so the top strip stays free for the lives and the time.

# --explanation-tr--

Bomberman tarzı bir arena üç tür karesi olan bir ızgaradır: hiçbir şeyin kıramadığı **duvarlar** (`'#'`), bombaların yok
ettiği **sandıklar** (`'+'`) ve **zemin** (`' '`).

Duvarlar basit bir desene uyar. Kenar baştan sona duvardır; içeride de satırı **ve** sütunu çift olan her kare bir sütundur.
Klasik koridorları yapan bu dama tahtası gibi sütunlardır: alevler ve oyuncular aralarında yalnızca düz çizgilerde ilerleyebilir.

Sandıklar rastgeledir, boş karelerin yaklaşık %45'i; önemli bir istisnayla. Oyuncu sandıklarla çevrili başlasaydı, ilk bombasının
kaçış yolu olmazdı. Bu yüzden başlangıç köşelerinin **yanındaki** kareler (oyuncununki `(1, 1)`'de, düşmanlar için üç tane)
her zaman zemindir. "Yanında", en fazla 1 Manhattan uzaklığıdır:

```js
Math.abs(sr - r) + Math.abs(sc - c) <= 1
```

Her kare `TILE` pikseldir ve üst şerit canlar ve süre için boş kalsın diye `TOP`'tan aşağı çizilir.

# --task--

1. Add `COLS = 13`, `ROWS = 11`, `TILE = 32`, `TOP = 32` and `ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]`.
2. Write `near(r, c, spots)`: true if `(r, c)` is at Manhattan distance 1 or less from any `[row, col]` in `spots`.
3. Write `makeGrid()`: `'#'` on the border and where row and column are both even; `' '` next to `(1, 1)` and the enemy
   starts, or when `Math.random() > 0.55`; otherwise `'+'`. `reset()` calls it.
4. Draw every tile as a `TILE` square at `(c * TILE, TOP + r * TILE)`: walls `'#475569'`, crates `'#b45309'` with a
   `'#92400e'` stripe (`x + 4`, `y + 14`, `TILE - 8` by 4), floor `'#3f6212'`.

# --task-tr--

1. `COLS = 13`, `ROWS = 11`, `TILE = 32`, `TOP = 32` ve `ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]`
   ekle.
2. `near(r, c, spots)` yaz: `(r, c)`, `spots`'taki herhangi bir `[row, col]`'a en fazla 1 Manhattan uzaklığındaysa true.
3. `makeGrid()` yaz: kenarda ve satır ile sütunun ikisi de çiftken `'#'`; `(1, 1)`'in ve düşman başlangıçlarının yanında ya da
   `Math.random() > 0.55` olduğunda `' '`; değilse `'+'`. `reset()` onu çağırır.
4. Her kareyi `(c * TILE, TOP + r * TILE)`'de `TILE` bir kare olarak çiz: duvarlar `'#475569'`, sandıklar `'#92400e'` bir
   şeritli (`x + 4`, `y + 14`, 4'e `TILE - 8`) `'#b45309'`, zemin `'#3f6212'`.

# --tests--

The border should be wall, with pillars on every even row and column.
tr: Kenar duvar olmalı; her çift satır ve sütunda sütunlar olmalı.

```js
assert.lengthOf(grid, ROWS)
for (const row of grid) assert.lengthOf(row, COLS)
for (let c = 0; c < COLS; c++) assert.deepEqual([grid[0][c], grid[ROWS - 1][c]], ['#', '#'])
for (let r = 0; r < ROWS; r++) assert.deepEqual([grid[r][0], grid[r][COLS - 1]], ['#', '#'])
assert.strictEqual(grid[2][2], '#', 'pillars on even rows and columns')
assert.strictEqual(grid[4][6], '#')
assert.notStrictEqual(grid[3][5], '#', 'no pillar on odd tiles')
```

The start corners should always be clear, and there should be plenty of crates.
tr: Başlangıç köşeleri her zaman açık olmalı ve bol sandık olmalı.

```js
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const [r, c] of [[1, 1], [1, 2], [2, 1], [ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]) {
    assert.strictEqual(grid[r][c], ' ', 'the start corners are clear')
  }
}
let crates = 0
let free = 0
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const row of grid) for (const t of row) {
    if (t === '+') crates++
    if (t !== '#') free++
  }
}
assert.isAbove(crates / free, 0.3, 'plenty of crates')
assert.isBelow(crates / free, 0.6)
```

Walls, floor and crates should be drawn in place.
tr: Duvarlar, zemin ve sandıklar yerlerinde çizilmeli.

```js
grid[1][3] = '+'
$.tick(1)
assert.deepInclude($.rects('#475569'), { x: 0, y: 32, w: 32, h: 32, color: '#475569' }, 'a wall')
assert.deepInclude($.rects('#3f6212'), { x: 32, y: 64, w: 32, h: 32, color: '#3f6212' }, 'the floor')
assert.deepInclude($.rects('#b45309'), { x: 96, y: 64, w: 32, h: 32, color: '#b45309' }, 'a crate')
```

# --seed--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

function reset() {
  makeGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
