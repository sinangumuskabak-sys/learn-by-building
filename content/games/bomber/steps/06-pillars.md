---
title: Pillars
title_tr: Sütunlar
skills: [prog.arrays]
---

# --goal--

Inside the arena, every tile whose row **and** column are both even is a pillar. That checkerboard of pillars makes
the classic corridors: flames and players travel only in straight lines between them.

# --goal-tr--

Bomberman'in ünlü deseni: içeride satırı **ve** sütunu **çift** olan her kare bir **sütundur** (pillar). Bu dama
tahtası gibi desen klasik koridorları yapar: alevler ve oyuncular aralarında yalnız **düz çizgilerde** ilerleyebilir.

# --code--

```js
if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
```

# --meaning--

- `%` is the remainder of a division: `r % 2 === 0` asks "is `r` even?".
- `&&` means "and": both the row and the column must be even.

# --meaning-tr--

- `%` → bölümden kalan: `7 % 2` → 1, `6 % 2` → 0. `r % 2 === 0` "r çift mi?" demek.
- `&&` → "ve": satır **ve** sütun çiftse.
- Parantez, `&&`'li kısmı bir bütün yapar: "kenarsa **ya da** (ikisi de çiftse) duvar".

# --task--

In `makeGrid`, add `|| (r % 2 === 0 && c % 2 === 0)` at the end of the wall condition.

# --task-tr--

1. `makeGrid` içindeki duvar koşulunun sonuna, kapanan `)`'den önce ` || (r % 2 === 0 && c % 2 === 0)` ekle.
2. **Çalıştır**: arenanın içinde düzenli aralıklarla gri sütunlar görmelisin.

# --predict--

Is the tile at row 1, column 2 a pillar?
- [ ] Yes, 2 is even
- [x] No, both the row and the column must be even
  Row 1 is odd, so `r % 2 === 0 && ...` is false.

# --predict-tr--

1. satır, 2. sütundaki kare bir sütun mu?
- [ ] Evet, 2 çift
- [x] Hayır, satır **ve** sütun ikisi de çift olmalı
  1. satır tek; `r % 2 === 0 && ...` yanlış olur.

# --tests--

There should be a pillar on every even row and column, and none elsewhere.
tr: Her çift satır ve sütunda bir sütun olmalı, başka yerde olmamalı.

```js
assert.strictEqual(grid[2][2], '#', 'pillars on even rows and columns')
assert.strictEqual(grid[4][6], '#')
assert.strictEqual(grid[8][10], '#')
assert.strictEqual(grid[3][5], ' ', 'no pillar on odd tiles')
assert.strictEqual(grid[2][3], ' ')
assert.strictEqual(grid[1][1], ' ')
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

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else grid[r].push(' ')
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
      ctx.fillStyle = tile === '#' ? '#475569' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
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
