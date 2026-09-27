---
title: Endless puzzles
title_tr: Bitmeyen bulmacalar
skills: [prog.functions, prog.arrays]
---

# --explanation--

One puzzle is played once. With the solver we can **make** new ones, in two phases:

1. **A random full grid.** Solve an *empty* board, but try the digits in a shuffled order. The solver's rules keep the
   grid valid, and the shuffle makes each grid different.
2. **Dig holes.** Visit the cells in random order and empty each one, but **only keep the hole if the puzzle still has
   exactly one solution**. If `countSolutions(copy(puzzle), 2)` finds two, the player would be left guessing, so the digit
   goes back. Stop at `HOLES` empty cells.

This is where counting up to 2 pays off: we never need to know *how many* solutions there are, only whether there is more
than one, and the solver stops the moment it finds the second.

The shuffle is the **Fisher–Yates** algorithm: walk the list from the end and swap each item with a random one at or before
it. Every order is equally likely, which the tempting `list.sort(() => Math.random() - 0.5)` does not give you.

# --explanation-tr--

Bir bulmaca bir kez oynanır. Çözücüyle iki evrede yenilerini **üretebiliriz**:

1. **Rastgele dolu bir ızgara.** *Boş* bir tahtayı çöz ama rakamları karıştırılmış bir sırayla dene. Çözücünün kuralları
   ızgarayı geçerli tutar, karıştırma da her ızgarayı farklı yapar.
2. **Delik aç.** Hücreleri rastgele sırayla ziyaret et ve her birini boşalt, ama **deliği yalnızca bulmacanın hâlâ tam olarak
   bir çözümü varsa tut**. `countSolutions(copy(puzzle), 2)` iki tane bulursa oyuncu tahmine kalır, bu yüzden rakam geri
   gelir. `HOLES` boş hücrede dur.

2'ye kadar saymanın karşılığını burada alırız: *kaç* çözüm olduğunu bilmemiz hiç gerekmez, yalnızca birden fazla olup
olmadığını; çözücü de ikinciyi bulduğu an durur.

Karıştırma **Fisher–Yates** algoritmasıdır: listeyi sondan başa gez ve her öğeyi kendisinde ya da öncesindeki rastgele bir
öğeyle takas et. Her sıra eşit olasılıklıdır; cazip gelen `list.sort(() => Math.random() - 0.5)` bunu sağlamaz.

# --task--

1. Replace `PUZZLE` with `HOLES = 50`.
2. Write `shuffle(list)` (Fisher–Yates, in place, returning the list), and give `countSolutions` a third parameter
   `order = false`: when true, shuffle the options before trying them (pass it on in the recursive call).
3. Write `makePuzzle()`: fill an empty board with `countSolutions(full, 1, true)`, then empty cells of a copy in shuffled
   order, keeping a hole only if the puzzle still has exactly one solution, until `HOLES` are empty. Return
   `{ puzzle, full }`.
4. `reset()` uses `makePuzzle()` for `grid` and `solution`. The N key starts a new puzzle.

# --task-tr--

1. `PUZZLE`'ı `HOLES = 50` ile değiştir.
2. `shuffle(list)` yaz (Fisher–Yates, yerinde, listeyi döndürerek) ve `countSolutions`'a üçüncü bir parametre
   `order = false` ver: true olduğunda seçenekleri denemeden önce karıştır (özyinelemeli çağrıya da ilet).
3. `makePuzzle()` yaz: boş bir tahtayı `countSolutions(full, 1, true)` ile doldur, sonra bir kopyanın hücrelerini karışık
   sırayla boşalt; bir deliği yalnızca bulmacanın hâlâ tam bir çözümü varsa tut, `HOLES` boş olana kadar. `{ puzzle, full }`
   döndür.
4. `reset()`, `grid` ve `solution` için `makePuzzle()`'ı kullanır. N tuşu yeni bir bulmaca başlatır.

# --tests--

Every made puzzle should have `HOLES` empty cells, clues from a valid full grid, and exactly one solution.
tr: Üretilen her bulmacanın `HOLES` boş hücresi, geçerli dolu bir ızgaradan ipuçları ve tam olarak bir çözümü olmalı.

```js
for (let i = 0; i < 5; i++) {
  const { puzzle, full } = makePuzzle()
  let holes = 0
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (puzzle[r][c] === 0) holes++
    else assert.strictEqual(puzzle[r][c], full[r][c], 'the clues come from the full grid')
    const d = full[r][c]
    full[r][c] = 0
    assert.isTrue(canPlace(full, r, c, d), 'the full grid follows the rules')
    full[r][c] = d
  }
  assert.strictEqual(holes, HOLES)
  assert.strictEqual(countSolutions(puzzle, 2), 1, 'exactly one solution')
}
```

Solving an empty board with shuffled digits should give a full grid, different each time.
tr: Boş bir tahtayı karıştırılmış rakamlarla çözmek her seferinde farklı, dolu bir ızgara vermeli.

```js
const a = Array.from({ length: 9 }, () => Array(9).fill(0))
const b = Array.from({ length: 9 }, () => Array(9).fill(0))
assert.strictEqual(countSolutions(a, 1, true), 1)
countSolutions(b, 1, true)
assert.isNull(bestCell(a), 'the board is full')
assert.notDeepEqual(a, b, 'shuffled digits give different grids')
const list = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
assert.sameMembers(list, [1, 2, 3, 4, 5, 6, 7, 8, 9])
```

N and a click after solving should start a new puzzle.
tr: N ve çözdükten sonraki bir tıklama yeni bir bulmaca başlatmalı.

```js
const first = grid.map((row) => row.join('')).join('')
$.press('n')
assert.notStrictEqual(grid.map((row) => row.join('')).join(''), first, 'N makes a new puzzle')
for (let i = 0; i < 60; i++) $.press('h')
assert.isTrue(won)
$.click(200, 300)
assert.isFalse(won)
assert.strictEqual(grid.flat().filter((d) => d === 0).length, HOLES)
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
const HOLES = 50 // how many cells are emptied

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
let solution
let selected
let won
let hints

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

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Hints ' + hints, canvas.width - LEFT, 34)
  if (won) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, TOP + 3 * SIZE, canvas.width, 3 * SIZE)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Solved!', canvas.width / 2, TOP + 4.5 * SIZE)
    ctx.font = '18px sans-serif'
    ctx.fillText('Click for a new puzzle', canvas.width / 2, TOP + 5.3 * SIZE)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
