---
title: Click to select
title_tr: Tıklayarak seç
skills: [game.input]
---

# --goal--

A click on a cell selects it. The click's position is turned into canvas pixels, then into a row and a column.

# --goal-tr--

Bir hücreye **tıklamak** onu seçsin. Tıklamanın yerini önce canvas piksellerine, sonra **satıra ve sütuna** çeviriyoruz.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
})
```

# --meaning--

- The canvas may be shown at a different size than its own pixels; multiplying by `canvas.width / rect.width` corrects it.
- `x` is measured from the board's left edge, so `Math.floor(x / SIZE)` is the column; the row comes from `y - TOP`.
- Clicks outside the board change nothing.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki yeri ve ekrandaki boyu.
- `((event.clientX - rect.left) * canvas.width) / rect.width` → tıklamayı canvas'ın kendi piksellerine çevirir (canvas
  ekranda küçültülmüş olabilir). Sondaki `- LEFT` → tahtanın sol kenarından ölç.
- `Math.floor(x / SIZE)` → kaçıncı sütun; `Math.floor((y - TOP) / SIZE)` → kaçıncı satır.
- `if (r >= 0 && r < 9 && c >= 0 && c < 9)` → tahtanın içindeyse seç; dışarıya tıklamak bir şey yapmaz.
- `selected = { r, c }` → `{ r: r, c: c }`'nin kısası.

# --task--

Under `reset`, write the `pointerdown` listener.

# --task-tr--

`reset` fonksiyonunun altına bir boş satır bırakıp `pointerdown` dinleyicisini yaz. **Çalıştır** ve hücrelere tıkla.

# --tests--

Clicking a cell should select it.
tr: Bir hücreye tıklamak onu seçmeli.

```js
$.click(14 + 2 * 48 + 10, 56 + 7 * 48 + 10)
assert.deepEqual(selected, { r: 7, c: 2 })
```

Clicking outside the board should change nothing.
tr: Tahtanın dışına tıklamak bir şey değiştirmemeli.

```js
$.click(5, 20)
assert.deepEqual(selected, { r: 4, c: 4 })
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
})

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
