---
title: The player
title_tr: Oyuncu
skills: [game.state, game.canvas]
---

# --goal--

The player is an object with a position in **tiles** (`x` column, `y` row) and a `target` for later. It starts in the
top-left corner and is drawn as a white circle in the middle of its tile.

# --goal-tr--

Sıra oyuncuda. Oyuncu bir **nesne**: konumu (`x` sütun, `y` satır) ve ileride kullanacağımız bir hedefi (`target`)
var. Konum **kare** birimiyle tutulur, piksel değil: `x = 2.5` 2. ve 3. sütunun tam ortası demek. Böylece kurallar
satır ve sütunla konuşur; yalnız çizim `TILE` ile çarpar.

Oyuncu sol üst köşede başlar ve karesinin ortasında beyaz bir daire olarak çizilir. Daireyi çizen küçük bir yardımcı da
yazıyoruz; ileride bombalar ve düşmanlar da onu kullanacak.

# --code--

```js
let player // { x, y, target: null or { r, c } }

  player = { x: 1, y: 1, target: null }

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
}

  drawCircle(player, '#f8fafc', 12)
```

# --meaning--

- `{ x: 1, y: 1, target: null }` is an object; `null` means "nothing": no target yet.
- `drawCircle(m, color, radius)` paints a circle in the middle of whatever `m` is on: `m.x * TILE + TILE / 2` is the
  center in pixels.
- A circle is a path: `beginPath`, `arc(x, y, radius, 0, Math.PI * 2)` (a full turn), then `fill`.

# --meaning-tr--

- `let player` → oyuncu. Yorum içinde ne olacağını söylüyor.
- `player = { x: 1, y: 1, target: null }` → bir **nesne**: `ad: değer` çiftleri. `player.x` ile okunur. `null`
  "hiçbir şey": henüz hedef yok.
- `function drawCircle(m, color, radius) {` → `m` neredeyse (oyuncu, ileride bomba ya da düşman) oraya daire çizer:
  - `m.x * TILE + TILE / 2` → karenin sol kenarı + yarım kare = karenin **ortası** (piksel).
  - `TOP + m.y * TILE + TILE / 2` → aynısı dikeyde, üst şerit kadar aşağıdan.
  - `ctx.beginPath()` → yeni şekil; `ctx.arc(x, y, yarıçap, 0, Math.PI * 2)` → tam tur çember; `ctx.fill()` → içini
    boya.
- `drawCircle(player, '#f8fafc', 12)` → oyuncuyu 12 yarıçaplı, neredeyse beyaz bir daire olarak çiz. Karelerden
  **sonra** çizilir ki üstlerinde görünsün.

# --task--

1. Under `let grid` write `let player`; in `reset`, under `makeGrid()`, write the `player` line.
2. Above `function draw() {` write `drawCircle`.
3. At the end of `draw`, after the loops, write the `drawCircle(player, ...)` line.

# --task-tr--

1. `let grid` satırının altına `let player` yaz.
2. `reset` içinde `makeGrid()` satırının altına `player = { x: 1, y: 1, target: null }` yaz.
3. `function draw() {` satırının **üstüne** `drawCircle` fonksiyonunu yaz.
4. `draw`'un **en sonuna**, iki döngünün kapanan `}`'lerinden sonra `drawCircle(player, '#f8fafc', 12)` yaz.
5. **Çalıştır**: sol üst köşede beyaz bir oyuncu görmelisin.

# --hint--

Draw the player after the tile loops, or the tiles will cover it.

# --hint-tr--

Oyuncuyu kare döngülerinden **sonra** çiz; yoksa kareler onu örter.

# --tests--

The player should start at column 1, row 1, with no target.
tr: Oyuncu 1. sütun, 1. satırda, hedefsiz başlamalı.

```js
assert.deepEqual(player, { x: 1, y: 1, target: null })
```

The player should be drawn in the middle of its tile, even between tiles.
tr: Oyuncu karesinin ortasında çizilmeli; kareler arasındayken bile.

```js
$.tick()
assert.deepInclude($.arcs(), { x: 48, y: 80, r: 12, color: '#f8fafc' })
player.x = 2.5
$.tick()
assert.deepInclude($.arcs(), { x: 96, y: 80, r: 12, color: '#f8fafc' })
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
let player // { x, y, target: null or { r, c } }

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
  player = { x: 1, y: 1, target: null }
}

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
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
  drawCircle(player, '#f8fafc', 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
