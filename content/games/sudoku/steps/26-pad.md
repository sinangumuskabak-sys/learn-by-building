---
title: A number pad
title_tr: Rakam tuş takımı
skills: [game.canvas]
---

# --goal--

Phones have no number keys on screen, so under the board there is a row of ten buttons: 1 to 9 and one to erase.

# --goal-tr--

Telefonda ekranda rakam tuşu yok. Tahtanın altına **on düğmelik** bir sıra koyalım: 1'den 9'a ve bir **silme** düğmesi.
Bu adımda çiziyoruz; tıklamaları sonraki adımda bağlıyoruz.

# --code--

```js
const PAD_Y = TOP + 9 * SIZE + 16 // the row of number buttons for touch screens
const PAD_W = (9 * SIZE) / 10
const PAD_H = 44

  for (let i = 0; i < 10; i++) {
    const x = LEFT + i * PAD_W
    ctx.fillStyle = '#e0e7ff'
    ctx.fillRect(x + 2, PAD_Y, PAD_W - 4, PAD_H)
    ctx.fillStyle = '#3730a3'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(i === 9 ? '⌫' : String(i + 1), x + PAD_W / 2, PAD_Y + 30)
  }
```

# --meaning--

- The pad sits 16 pixels under the board; the board's width is split into 10 buttons.
- Each button leaves 2 pixels of gap on each side (`x + 2`, `PAD_W - 4`).
- The last button shows `⌫`, the erase sign.

# --meaning-tr--

- `PAD_Y` → tahtanın 16 piksel altı. `PAD_W` → tahtanın genişliği 10'a bölünür: her düğmenin genişliği.
- `x + 2`, `PAD_W - 4` → düğmelerin arasında 2'şer piksel boşluk kalsın.
- `i === 9 ? '⌫' : String(i + 1)` → ilk dokuzu 1–9, sonuncusu silme işareti `⌫`.

# --task--

1. Under `TOP`, write the three `PAD_` constants.
2. In `draw`, between the lines loop and the time, draw the buttons.

# --task-tr--

1. `const TOP = 56` satırının altına üç `PAD_` sabitini yaz.
2. `draw` içinde çizgi döngüsü ile süre satırlarının arasına düğme döngüsünü yaz (boş satırlarla).
3. **Çalıştır**: tahtanın altında bir düğme sırası görmelisin.

# --tests--

Ten buttons should be drawn under the board, the last one for erasing.
tr: Tahtanın altında on düğme çizilmeli; sonuncusu silmek için.

```js
$.tick()
const buttons = $.rects('#e0e7ff')
assert.lengthOf(buttons, 10)
assert.strictEqual(buttons[0].y, 56 + 9 * 48 + 16)
assert.include($.texts(), '⌫')
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
