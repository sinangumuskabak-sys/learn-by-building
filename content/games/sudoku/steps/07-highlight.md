---
title: Light up row, column and box
title_tr: Satırı, sütunu ve kutuyu aydınlat
skills: [game.state]
---

# --goal--

Sudoku's three rules are about the row, the column and the box. We light up all three around the selected cell in grey,
which makes the puzzle much easier to read.

# --goal-tr--

Sudoku'nun üç kuralı **satır**, **sütun** ve **kutu** ile ilgili: bir rakam hiçbirinde tekrar edemez. Seçili hücrenin
satırını, sütununu ve kutusunu açık griyle aydınlatalım; bulmacayı okumak çok kolaylaşır.

# --code--

```js
// Light up the selected cell's row, column and box, and every cell with the same digit.
const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
let fill = '#ffffff'
if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
```

# --meaning--

- `Math.floor(r / 3)` is which band of boxes a row is in (0, 1 or 2); two cells are in the same box when both their row
  band and column band match.
- The order of the rules matters: later ones overwrite `fill`, so the selected cell stays blue.

# --meaning-tr--

- `Math.floor(r / 3)` → satırın hangi kutu bandında olduğu: 0–2. satırlar 0, 3–5 → 1, 6–8 → 2.
- `sameBox` → iki hücrenin satır bandı **ve** sütun bandı aynıysa aynı kutudalar.
- `r === selected.r || c === selected.c || sameBox` → aynı satır **veya** sütun **veya** kutu: gri.
- Kuralların **sırası** önemli: sonra gelen `fill`'i değiştirir. Seçili hücre kuralı en sonda olduğu için o mavi kalır.

# --task--

In `draw`, write the comment and `sameBox` above `let fill`, and the grey rule under it.

# --task-tr--

`draw` içinde `let fill` satırının üstüne yorumu ve `sameBox` satırını, altına gri kuralı yaz. **Çalıştır**.

# --tests--

The selected cell's row, column and box should be grey; 20 cells in all.
tr: Seçili hücrenin satırı, sütunu ve kutusu gri olmalı; toplam 20 hücre.

```js
$.tick()
const grey = $.rects('#e2e8f0')
assert.lengthOf(grey, 20)
assert.isTrue(grey.some((r) => r.x === 14 + 3 * 48 && r.y === 56 + 3 * 48), 'the corner of the middle box')
assert.lengthOf($.rects('#93c5fd'), 1)
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

// The puzzle, row by row; 0 is an empty cell.
const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
let selected

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      // Light up the selected cell's row, column and box, and every cell with the same digit.
      const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
      let fill = '#ffffff'
      if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
      if (r === selected.r && c === selected.c) fill = '#93c5fd'
      ctx.fillStyle = fill
      ctx.fillRect(x, y, SIZE, SIZE)
      if (grid[r][c] === 0) continue
      ctx.fillStyle = given[r][c] ? '#0f172a' : '#2563eb'
      ctx.font = (given[r][c] ? 'bold ' : '') + '26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
    }
  }
  // Thin lines between cells, thick ones around each box.
  for (let i = 0; i <= 9; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
    const w = i % 3 === 0 ? 3 : 1
    ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
    ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
