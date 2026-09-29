---
title: Solved!
title_tr: Çözüldü!
skills: [game.state]
---

# --goal--

The puzzle is solved when every cell is filled and nothing clashes. After each digit we check; once won, no more digits
can be written.

# --goal-tr--

Bulmaca, **her hücre dolu** ve **hiçbir çakışma yoksa** çözülmüştür. Her rakamdan sonra kontrol edelim; kazanınca artık
rakam yazılamasın.

# --code--

```js
let won
  won = false

function checkWin() {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] === 0 || conflict(r, c)) return
  won = true
}

function enter(d) {
  if (won || given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
  checkWin()
}
```

# --meaning--

- `checkWin` looks at all 81 cells and stops at the first empty or clashing one; if none, the puzzle is won.
- Two `for` loops and an `if` can be written on one line when each body is a single statement.

# --meaning-tr--

- `function checkWin()` → 81 hücreye bakar; **ilk** boş ya da çakışan hücrede `return` ile çıkar (henüz bitmedi).
  Hiçbiri yoksa `won = true`.
- İç içe iki `for` ve bir `if` tek satıra yazılabilir; her birinin gövdesi tek bir komut olduğunda.
- `enter` → kazanıldıysa (`won`) hiçbir şey yazma; yazdıktan sonra `checkWin()`.

# --task--

1. Under `let selected`, write `let won`; in `reset`, set it to `false`.
2. Above `enter`, write `checkWin`; in `enter`, add `won ||` and call `checkWin()`.

# --task-tr--

1. `let selected` satırının altına `let won` yaz; `reset`'in sonuna `won = false` ekle.
2. `enter`'ın üstüne `checkWin` fonksiyonunu yaz.
3. `enter`'ın ilk satırına `won || ` ekle ve sonuna `checkWin()` yaz.
4. **Çalıştır**. (Kazanma ekranı birkaç adım sonra.)

# --tests--

Filling in the last cell correctly should win.
tr: Son hücreyi doğru doldurmak kazandırmalı.

```js
const load = (s) => Array.from({ length: 9 }, (_, r) => [...s.slice(r * 9, r * 9 + 9)].map(Number))
grid = load('534678912672195348198342567859761423426853791713924856961537284287419635345286079')
selected = { r: 8, c: 6 }
$.tap('1')
assert.isTrue(won)
```

A full board with a clash should not win, and nothing can be written after winning.
tr: Çakışmalı dolu tahta kazandırmamalı; kazandıktan sonra bir şey yazılamamalı.

```js
const load = (s) => Array.from({ length: 9 }, (_, r) => [...s.slice(r * 9, r * 9 + 9)].map(Number))
grid = load('534678912672195348198342567859761423426853791713924856961537284287419635345286079')
selected = { r: 8, c: 6 }
$.tap('8')
assert.isFalse(won)
$.tap('1')
assert.isTrue(won)
$.tap('4')
assert.strictEqual(grid[8][6], 1)
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
let won

// Can digit d go at (r, c)? Not if it is already in the row, the column or the 3 by 3 box.
function canPlace(board, r, c, d) {
  const br = r - (r % 3)
  const bc = c - (c % 3)
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === d || board[i][c] === d) return false
    if (board[br + Math.floor(i / 3)][bc + (i % 3)] === d) return false
  }
  return true
}

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
  won = false
}

// Does the digit at (r, c) clash with another cell in its row, column or box?
function conflict(r, c) {
  const d = grid[r][c]
  if (d === 0) return false
  grid[r][c] = 0
  const ok = canPlace(grid, r, c, d)
  grid[r][c] = d
  return !ok
}

function checkWin() {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] === 0 || conflict(r, c)) return
  won = true
}

function enter(d) {
  if (won || given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
  checkWin()
}

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
})

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
      if (conflict(r, c)) fill = '#fecaca'
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
