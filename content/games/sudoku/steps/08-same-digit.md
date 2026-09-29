---
title: The same digit everywhere
title_tr: Her yerde aynı rakam
skills: [game.state]
---

# --goal--

When the selected cell holds a digit, every cell with the same digit lights up in blue: you see at once where that
digit already is.

# --goal-tr--

Seçili hücrede bir rakam varsa, **aynı rakamı** taşıyan her hücre de açık maviyle aydınlansın. O rakamın tahtada nerelerde
olduğunu bir bakışta görürsün; sudoku oynarken en çok işe yarayan yardım budur.

# --code--

```js
const d = selected && grid[selected.r][selected.c]

    if (d && grid[r][c] === d) fill = '#bfdbfe'
```

# --meaning--

- `d` is the digit in the selected cell (0 if it is empty), worked out once before the loops.
- `d && ...` skips the rule when the cell is empty (0 counts as false).

# --meaning-tr--

- `const d = selected && grid[selected.r][selected.c]` → seçili hücredeki rakam; döngülerden **önce** bir kez
  hesaplanır. Hücre boşsa 0.
- `if (d && grid[r][c] === d)` → `d` 0 değilse (0 yanlış sayılır) **ve** bu hücrede aynı rakam varsa açık mavi.

# --task--

1. In `draw`, write the `d` line above the cell loops.
2. Under the grey rule, write the same-digit rule.

# --task-tr--

1. `draw` içinde iç içe döngülerin **üstüne** `d` satırını yaz.
2. Gri kuralın altına aynı rakam kuralını yaz.
3. **Çalıştır**. (Seçimi değiştirmeyi sonraki adımda ekleyeceğiz.)

# --tests--

Selecting a 5 should light up every 5 on the board.
tr: Bir 5 seçmek tahtadaki her 5'i aydınlatmalı.

```js
selected = { r: 0, c: 0 }
$.tick()
const fives = grid.flat().filter((d) => d === 5).length
assert.lengthOf($.rects('#bfdbfe'), fives - 1)
```

Selecting an empty cell should light up nothing blue.
tr: Boş bir hücre seçmek hiçbir şeyi mavi aydınlatmamalı.

```js
selected = { r: 0, c: 2 }
$.tick()
assert.lengthOf($.rects('#bfdbfe'), 0)
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

  const d = selected && grid[selected.r][selected.c]
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      // Light up the selected cell's row, column and box, and every cell with the same digit.
      const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
      let fill = '#ffffff'
      if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
      if (d && grid[r][c] === d) fill = '#bfdbfe'
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
