---
title: The solver
title_tr: Çözücü
skills: [prog.functions]
---

# --goal--

The solver tries each option in the easiest cell and then solves the rest of the board with itself: a function that
calls itself is recursive. When a guess leads nowhere, it undoes it and tries the next one: backtracking. It also counts
how many solutions there are, up to a limit.

# --goal-tr--

Çözücünün fikri çok zarif: en kolay hücreye seçeneklerinden birini **dene**, sonra tahtanın **geri kalanını** aynı
fonksiyonla çöz. Kendini çağıran fonksiyona **özyinelemeli** (recursive) denir. Deneme bir yere çıkmazsa rakamı **geri
al** ve sıradaki seçeneği dene; buna **geri izleme** (backtracking) denir. Labirentte çıkmaz sokağa girince geri dönüp
başka yola sapmak gibi.

Fonksiyon bulduğu **çözümleri sayar**; bir sınıra (`limit`) ulaşınca durur. Neden sayıyor? İyi bir sudokunun **tek**
çözümü olmalı; ileride bunu kontrol edeceğiz.

# --code--

```js
// Backtracking: fill a cell with each digit that fits and try to solve the rest; undo when stuck.
// Counts solutions up to `limit`.
function countSolutions(board, limit = 2) {
  const cell = bestCell(board)
  if (!cell) return 1 // no empty cell left: solved
  const { r, c, options } = cell
  let count = 0
  for (const d of options) {
    board[r][c] = d
    count += countSolutions(board, limit - count)
    if (count >= limit) return count // keep the board as it is: that is the solution
    board[r][c] = 0
  }
  return count
}
```

# --meaning--

- No empty cell means the board is solved: that is one solution.
- Otherwise each option is written in, and the rest of the board is solved by the same function.
- The solutions found below are added up; once there are `limit` of them, it stops and leaves the board filled in.
- Otherwise the digit is taken back out (`board[r][c] = 0`) before trying the next one.
- A cell with no options makes the loop do nothing and return 0: a dead end.

# --meaning-tr--

- `limit = 2` → parametre verilmezse 2 kullanılır (**varsayılan değer**).
- `if (!cell) return 1` → boş hücre kalmadıysa tahta çözülmüş: **bir** çözüm.
- `const { r, c, options } = cell` → nesnenin alanlarını ayrı adlara aç.
- `board[r][c] = d` → seçeneği **dene**.
- `countSolutions(board, limit - count)` → tahtanın geri kalanını **aynı fonksiyonla** çöz (özyineleme). Dönen sayı o
  denemeden çıkan çözüm sayısı.
- `if (count >= limit) return count` → yeterince çözüm bulunduysa dur; tahta dolu kalır, o da bir çözüm.
- `board[r][c] = 0` → deneme bitti, **geri al** (geri izleme) ve sıradaki seçeneğe geç.
- Hiç seçeneği olmayan hücrede döngü hiç dönmez, 0 döner: çıkmaz sokak.

# --task--

Under `bestCell`, write the comments and `countSolutions`.

# --task-tr--

`bestCell` fonksiyonunun altına yorumları ve `countSolutions` fonksiyonunu yaz. **Çalıştır**.

# --tests--

The solver should solve the puzzle, which has exactly one solution.
tr: Çözücü bulmacayı çözmeli; bulmacanın tam bir çözümü var.

```js
const load = (s) => Array.from({ length: 9 }, (_, r) => [...s.slice(r * 9, r * 9 + 9)].map(Number))
const board = grid.map((row) => row.slice())
assert.strictEqual(countSolutions(board, 1), 1)
assert.deepEqual(board, load('534678912672195348198342567859761423426853791713924856961537284287419635345286179'))
assert.strictEqual(countSolutions(grid.map((row) => row.slice()), 2), 1)
```

On a board with many solutions, counting should stop at the limit.
tr: Çok çözümlü bir tahtada sayma sınırda durmalı.

```js
const board = Array.from({ length: 9 }, () => Array(9).fill(0))
assert.strictEqual(countSolutions(board, 5), 5)
assert.isTrue(board.every((row) => row.every((d) => d !== 0)), 'the board is left filled in')
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

// Backtracking: fill a cell with each digit that fits and try to solve the rest; undo when stuck.
// Counts solutions up to `limit`.
function countSolutions(board, limit = 2) {
  const cell = bestCell(board)
  if (!cell) return 1 // no empty cell left: solved
  const { r, c, options } = cell
  let count = 0
  for (const d of options) {
    board[r][c] = d
    count += countSolutions(board, limit - count)
    if (count >= limit) return count // keep the board as it is: that is the solution
    board[r][c] = 0
  }
  return count
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
