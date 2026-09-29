---
title: The selected cell
title_tr: Seçili hücre
skills: [game.state]
---

# --goal--

One cell is selected: the one your next digit goes into. It starts in the middle and is painted blue.

# --goal-tr--

Bir hücre **seçili** olsun: yazacağın rakam oraya gidecek. Başta tahtanın ortasında; mavi boyanır. Her hücrenin rengi
bir `fill` değişkeninde karar verilerek seçilecek; sonraki adımlarda oraya yeni kurallar ekleyeceğiz.

# --code--

```js
let selected
  selected = { r: 4, c: 4 }

      let fill = '#ffffff'
      if (r === selected.r && c === selected.c) fill = '#93c5fd'
      ctx.fillStyle = fill
```

# --meaning--

- `selected` is a row and a column; `reset` puts it at the center, (4, 4).
- The cell's color starts white and becomes blue for the selected cell.

# --meaning-tr--

- `let selected` → seçili hücrenin satırı (`r`) ve sütunu (`c`). `reset` onu ortaya, (4, 4)'e koyar.
- `let fill = '#ffffff'` → hücrenin rengi önce beyaz.
- `if (r === selected.r && c === selected.c)` → bu hücre seçili olan mı? Öyleyse mavi.
- `ctx.fillStyle = fill` → karar verilen rengi kullan. Rengi bir değişkende toplamak, sonra birkaç kural eklemeyi
  kolaylaştıracak.

# --task--

1. Under `let given`, write `let selected`; in `reset`, set it to the middle.
2. In `draw`, choose the cell's color with `fill`.

# --task-tr--

1. `let given ...` satırının altına `let selected` yaz; `reset`'in sonuna `selected = { r: 4, c: 4 }` ekle.
2. `draw` içinde `ctx.fillStyle = '#ffffff'` satırını üç satırla değiştir: `let fill`, seçili hücre kuralı ve
   `ctx.fillStyle = fill`.
3. **Çalıştır**: ortadaki hücre mavi olmalı.

# --tests--

The selected cell should be painted blue.
tr: Seçili hücre mavi boyanmalı.

```js
$.tick()
assert.deepEqual($.rects('#93c5fd'), [{ x: 14 + 4 * 48, y: 56 + 4 * 48, w: 48, h: 48, color: '#93c5fd' }])
selected = { r: 0, c: 8 }
$.tick()
assert.deepEqual($.rects('#93c5fd'), [{ x: 14 + 8 * 48, y: 56, w: 48, h: 48, color: '#93c5fd' }])
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
      let fill = '#ffffff'
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
