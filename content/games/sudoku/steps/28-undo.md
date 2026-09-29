---
title: "Build it yourself: undo"
title_tr: "Kendin yap: geri al"
skills: [prog.arrays, game.input]
---

# --goal--

Everyone makes mistakes. Keep a list of the changes you make, and let U (or Ctrl+Z) undo the last one, putting back the
digit that was there before.

# --goal-tr--

Herkes hata yapar. Yaptığın değişikliklerin bir **listesini** tut; **U** tuşu (ya da Ctrl+Z) sonuncuyu **geri alsın**:
hücreye önceki rakamı geri koysun. Art arda basınca daha eskilere gitsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir dizi, `push` ile ekleme, `pop` ile sondakini alma.

# --task--

- Each digit you write or erase is remembered, with the digit that was in the cell before.
- U (or Ctrl+Z) takes back the last change, selects that cell, and can be pressed again for older changes.
- A new game starts with nothing to undo.

# --task-tr--

- Yazdığın ya da sildiğin her rakam, hücrede **önceden** olan rakamla birlikte hatırlansın.
- **U** (ya da Ctrl+Z) son değişikliği geri alsın, o hücreyi seçsin; tekrar basınca daha eskisini geri alsın.
- Yeni oyunda geri alınacak bir şey olmasın.

Değişiklikler `enter` fonksiyonunda oluyor; yeni bir tuş dalı da `keydown` zincirine.

# --hint--

In `enter`, before writing, `push` an object with the row, the column and the old digit. The undo key `pop`s the last one
and writes its old digit back. Empty the list in `reset`.

# --hint-tr--

`enter` içinde yazmadan **önce** satırı, sütunu ve eski rakamı içeren bir nesneyi listeye `push` et. Geri alma tuşu
sondakini `pop` ile alıp eski rakamı hücreye geri yazsın. Listeyi `reset` içinde boşalt.

# --tests--

U should take back the last digits you wrote, one by one.
tr: U yazdığın son rakamları tek tek geri almalı.

```js
const empties = grid.flat().map((d, i) => (d === 0 ? i : -1)).filter((i) => i >= 0)
const a = { r: Math.floor(empties[0] / 9), c: empties[0] % 9 }
const b = { r: Math.floor(empties[1] / 9), c: empties[1] % 9 }
selected = a
$.tap('3')
$.tap('4')
selected = b
$.tap('7')
$.tap('u')
assert.strictEqual(grid[b.r][b.c], 0)
assert.deepEqual(selected, b)
$.tap('u')
assert.strictEqual(grid[a.r][a.c], 3)
$.tap('U')
assert.strictEqual(grid[a.r][a.c], 0)
```

A new game should have nothing to undo.
tr: Yeni oyunda geri alınacak bir şey olmamalı.

```js
const empty = grid.flat().indexOf(0)
selected = { r: Math.floor(empty / 9), c: empty % 9 }
$.tap('5')
$.tap('n')
const before = JSON.stringify(grid)
$.tap('u')
assert.strictEqual(JSON.stringify(grid), before)
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
const PAD_Y = TOP + 9 * SIZE + 16 // the row of number buttons for touch screens
const PAD_W = (9 * SIZE) / 10
const PAD_H = 44
const HOLES = 50 // how many cells are emptied

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
let solution
let selected
let frames
let won
let hints
let best = Number(localStorage.getItem('sudoku-best')) || 0
let history = [] // the changes you made: { r, c, d } with the digit that was there before

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

// The empty cell with the fewest digits that fit, and those digits.
function bestCell(board) {
  let found = null
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue
      const options = []
      for (let d = 1; d <= 9; d++) if (canPlace(board, r, c, d)) options.push(d)
      if (!found || options.length < found.options.length) found = { r, c, options }
    }
  }
  return found
}

// Backtracking: fill a cell with each digit that fits and try to solve the rest; undo when stuck.
// Counts solutions up to `limit`; `order` shuffles the digits to make random grids.
function countSolutions(board, limit = 2, order = false) {
  const cell = bestCell(board)
  if (!cell) return 1 // no empty cell left: solved
  const { r, c, options } = cell
  if (order) shuffle(options)
  let count = 0
  for (const d of options) {
    board[r][c] = d
    count += countSolutions(board, limit - count, order)
    if (count >= limit) return count // keep the board as it is: that is the solution
    board[r][c] = 0
  }
  return count
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

const copy = (board) => board.map((row) => row.slice())

// A random full grid, then empty cells one by one, keeping only removals that leave exactly one solution.
function makePuzzle() {
  const full = Array.from({ length: 9 }, () => Array(9).fill(0))
  countSolutions(full, 1, true)
  const puzzle = copy(full)
  let removed = 0
  for (const cell of shuffle([...Array(81).keys()])) {
    if (removed === HOLES) break
    const r = Math.floor(cell / 9)
    const c = cell % 9
    const digit = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(copy(puzzle), 2) === 1) removed++
    else puzzle[r][c] = digit // two solutions: put it back
  }
  return { puzzle, full }
}

function reset() {
  const { puzzle, full } = makePuzzle()
  grid = puzzle
  solution = full
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
  frames = 0
  won = false
  hints = 0
  history = []
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
  const seconds = Math.floor(frames / 60)
  if (hints === 0 && (best === 0 || seconds < best)) {
    best = seconds
    localStorage.setItem('sudoku-best', best)
  }
}

function enter(d) {
  if (won || given[selected.r][selected.c]) return
  history.push({ r: selected.r, c: selected.c, d: grid[selected.r][selected.c] })
  grid[selected.r][selected.c] = d
  checkWin()
}

// A hint fills the selected cell (or the first empty one) from the solution.
function hint() {
  if (won) return
  let cell = grid[selected.r][selected.c] === solution[selected.r][selected.c] ? null : selected
  for (let i = 0; i < 81 && !cell; i++) {
    const r = Math.floor(i / 9)
    const c = i % 9
    if (grid[r][c] !== solution[r][c]) cell = { r, c }
  }
  if (!cell) return
  selected = cell
  grid[cell.r][cell.c] = solution[cell.r][cell.c]
  hints += 1
  checkWin()
}

function undo() {
  const last = history.pop()
  if (!last || won) return
  selected = { r: last.r, c: last.c }
  grid[last.r][last.c] = last.d
}

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
  else if (event.key === 'h' || event.key === 'H') hint()
  else if (event.key === 'n' || event.key === 'N') reset()
  else if (event.key === 'u' || event.key === 'U' || ((event.ctrlKey || event.metaKey) && event.key === 'z')) undo()
})

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (won) {
    reset()
    return
  }
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
  else if (y >= PAD_Y && y < PAD_Y + PAD_H && x >= 0 && x < 9 * SIZE) {
    const button = Math.floor(x / PAD_W)
    enter(button === 9 ? 0 : button + 1) // the last button erases
  }
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

  for (let i = 0; i < 10; i++) {
    const x = LEFT + i * PAD_W
    ctx.fillStyle = '#e0e7ff'
    ctx.fillRect(x + 2, PAD_Y, PAD_W - 4, PAD_H)
    ctx.fillStyle = '#3730a3'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(i === 9 ? '⌫' : String(i + 1), x + PAD_W / 2, PAD_Y + 30)
  }

  const seconds = Math.floor(frames / 60)
  const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Time ' + clock(seconds), LEFT, 34)
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best ? clock(best) : '-') + '  Hints ' + hints, canvas.width - LEFT, 34)
  if (won) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, TOP + 3 * SIZE, canvas.width, 3 * SIZE)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Solved in ' + clock(seconds) + '!', canvas.width / 2, TOP + 4.5 * SIZE)
    ctx.font = '18px sans-serif'
    ctx.fillText('Click for a new puzzle', canvas.width / 2, TOP + 5.3 * SIZE)
  }
}

function loop() {
  if (!won) frames += 1
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
