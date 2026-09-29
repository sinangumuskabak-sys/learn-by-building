---
title: The easiest cell
title_tr: En kolay hücre
skills: [prog.loops, prog.arrays]
---

# --goal--

Now we teach the computer to solve. A human starts with the cell where the fewest digits fit, and so will the computer:
`bestCell` finds the empty cell with the fewest options, and lists them.

# --goal-tr--

Şimdi bilgisayara sudoku **çözmeyi** öğretiyoruz. İyi bir oyuncu nereden başlar? **En az seçeneği** olan hücreden: tek
bir rakamın sığdığı hücre hemen dolar. Bilgisayar da öyle yapacak.

`bestCell` her boş hücre için 1'den 9'a hangi rakamların sığdığını sayar ve **en az seçenekli** hücreyi, seçenekleriyle
birlikte verir.

# --code--

```js
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
```

# --meaning--

- For every empty cell, `options` lists the digits that fit, using `canPlace`.
- `found` keeps the cell with the shortest list so far.
- On a full board there is no empty cell, and the answer is `null`.

# --meaning-tr--

- `if (board[r][c] !== 0) continue` → dolu hücreleri atla.
- `options` → 1'den 9'a, `canPlace` ile sığan rakamların listesi.
- `if (!found || options.length < found.options.length)` → henüz aday yoksa **ya da** bu hücrenin seçenekleri daha
  azsa, yeni aday bu.
- Tahta tamamen doluysa hiç boş hücre yoktur; sonuç `null`. Çözücü bunu "çözüldü" diye anlayacak.

# --task--

Under `canPlace`, write the comment and `bestCell`.

# --task-tr--

`canPlace` fonksiyonunun altına bir boş satır bırakıp yorumu ve `bestCell` fonksiyonunu yaz. **Çalıştır**.

# --tests--

`bestCell` should find the empty cell with the fewest options.
tr: `bestCell` en az seçenekli boş hücreyi bulmalı.

```js
const load = (s) => Array.from({ length: 9 }, (_, r) => [...s.slice(r * 9, r * 9 + 9)].map(Number))
const board = load('534678912672195348198342567859761423426853791713924856961537284287419635345286179')
board[3][5] = 0
board[6][6] = 0
board[6][7] = 0
board[7][7] = 0
const cell = bestCell(board)
assert.deepEqual(cell, { r: 3, c: 5, options: [1] })
```

On a full board there should be no cell.
tr: Dolu tahtada hücre olmamalı.

```js
const load = (s) => Array.from({ length: 9 }, (_, r) => [...s.slice(r * 9, r * 9 + 9)].map(Number))
assert.isNull(bestCell(load('534678912672195348198342567859761423426853791713924856961537284287419635345286179')))
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
let frames
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

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
  frames = 0
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

  const seconds = Math.floor(frames / 60)
  const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Time ' + clock(seconds), LEFT, 34)
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
