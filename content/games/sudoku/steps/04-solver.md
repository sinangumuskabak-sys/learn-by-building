---
title: A backtracking solver
title_tr: Geri izlemeli bir çözücü
skills: [prog.functions, game.state]
---

# --explanation--

Can a program solve any Sudoku? Yes, with **backtracking**, one of the most useful ideas in programming:

1. Find an empty cell. If there is none, the board is solved.
2. Try each digit that fits there. For each one, write it in and **solve the rest the same way** (the function calls
   itself).
3. If the rest cannot be solved, **undo** the digit and try the next one. If no digit works, report failure to the caller,
   who then undoes *its* digit.

It is exactly what you do with a pencil and an eraser, only without getting tired.

A good choice in step 1 makes it thousands of times faster: take the empty cell with the **fewest** digits that fit. A cell
with a single option costs nothing to try, and a cell with no option at all means a dead end right away. `bestCell` returns
that cell and its options.

Our solver **counts** solutions instead of stopping at the first, up to a `limit`. With `limit = 1` it solves the board and
leaves the solution in it. With `limit = 2` it answers "is there exactly one solution?", which a fair puzzle needs, and
which the next step will use.

We solve a **copy** of the puzzle, so that the player's grid stays empty, and keep it as `solution`. Then a hint is easy:
copy one digit from it.

# --explanation-tr--

Bir program her Sudoku'yu çözebilir mi? Evet, programlamanın en kullanışlı fikirlerinden biri olan **geri izlemeyle**:

1. Boş bir hücre bul. Yoksa tahta çözülmüştür.
2. Oraya uyan her rakamı dene. Her biri için onu yaz ve **geri kalanını aynı yolla çöz** (fonksiyon kendisini çağırır).
3. Geri kalanı çözülemiyorsa rakamı **geri al** ve sonrakini dene. Hiçbir rakam işe yaramazsa çağırana başarısızlık bildir; o
   da *kendi* rakamını geri alır.

Tam olarak kurşun kalem ve silgiyle yaptığın şey; yalnızca yorulmadan.

1. adımda iyi bir seçim onu binlerce kat hızlandırır: uyan rakamı **en az** olan boş hücreyi al. Tek seçenekli bir hücreyi
denemek hiçbir şeye mal olmaz ve hiç seçeneği olmayan bir hücre hemen bir çıkmaz demektir. `bestCell` o hücreyi ve
seçeneklerini döndürür.

Çözücümüz ilkinde durmak yerine çözümleri bir `limit`'e kadar **sayar**. `limit = 1` ile tahtayı çözer ve çözümü içinde
bırakır. `limit = 2` ile adil bir bulmacanın ihtiyaç duyduğu ve bir sonraki adımın kullanacağı "tam olarak bir çözüm var mı?"
sorusunu cevaplar.

Oyuncunun ızgarası boş kalsın diye bulmacanın bir **kopyasını** çözer ve onu `solution` olarak tutarız. Sonra bir ipucu
kolaydır: ondan bir rakam kopyala.

# --task--

1. Write `copy(board)`, which returns a new board with the same rows copied.
2. Write `bestCell(board)`: the empty cell with the fewest fitting digits, as `{ r, c, options }`, or `null` if the board is
   full.
3. Write `countSolutions(board, limit = 2)`: `1` when there is no empty cell; otherwise try each option, add the recursive
   count (with `limit - count`), return as soon as the count reaches `limit` (leaving the board filled in), and set the cell
   back to `0` otherwise.
4. In `reset()`, set `solution = copy(grid)` and `countSolutions(solution, 1)`.
5. Add `hints` (`0` in `reset()`) and write `hint()`: fill the selected cell from `solution` if it is not already right,
   otherwise the first cell that is not; select that cell, add 1 to `hints` and `checkWin()`. The H key calls it.
6. Draw `Hints 0` right-aligned at `canvas.width - LEFT`, `y = 34` (`'bold 18px sans-serif'`, `'#0f172a'`).

# --task-tr--

1. Satırları kopyalanmış yeni bir tahta döndüren `copy(board)`'u yaz.
2. `bestCell(board)` yaz: uyan rakamı en az olan boş hücre, `{ r, c, options }` olarak; tahta doluysa `null`.
3. `countSolutions(board, limit = 2)` yaz: boş hücre yoksa `1`; değilse her seçeneği dene, özyinelemeli sayıyı
   (`limit - count` ile) ekle, sayı `limit`'e ulaşır ulaşmaz döndür (tahtayı dolu bırakarak), değilse hücreyi yeniden `0` yap.
4. `reset()`'te `solution = copy(grid)` ve `countSolutions(solution, 1)` yap.
5. `hints` ekle (`reset()`'te `0`) ve `hint()` yaz: seçili hücre zaten doğru değilse onu `solution`'dan doldur, değilse doğru
   olmayan ilk hücreyi; o hücreyi seç, `hints`'e 1 ekle ve `checkWin()` et. H tuşu onu çağırır.
6. `canvas.width - LEFT`, `y = 34`'e sağa hizalı `Hints 0` çiz (`'bold 18px sans-serif'`, `'#0f172a'`).

# --tests--

`bestCell` should choose the empty cell with the fewest digits that fit.
tr: `bestCell` uyan rakamı en az olan boş hücreyi seçmeli.

```js
const cell = bestCell(grid)
const fits = (r, c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => canPlace(grid, r, c, d))
assert.deepEqual(cell.options, fits(cell.r, cell.c))
for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
  if (grid[r][c] === 0) assert.isAtLeast(fits(r, c).length, cell.options.length, 'no empty cell has fewer choices')
}
assert.isNull(bestCell(solution), 'a full board has no empty cell')
```

`countSolutions` should solve the puzzle, count up to the limit, and find 0 for an impossible board.
tr: `countSolutions` bulmacayı çözmeli, sınıra kadar saymalı ve imkânsız bir tahtada 0 bulmalı.

```js
assert.strictEqual(solution.map((row) => row.join('')).join(''), '534678912672195348198342567859761423426853791713924856961537284287419635345286179')
assert.strictEqual(grid[0][2], 0, 'solving a copy leaves the grid alone')
assert.strictEqual(countSolutions(copy(grid), 2), 1)
const empty = Array.from({ length: 9 }, () => Array(9).fill(0))
assert.strictEqual(countSolutions(empty, 2), 2, 'an empty board has many solutions; we stop counting at 2')
const broken = copy(grid)
broken[0][2] = 1
broken[1][1] = 4
broken[1][2] = 2
broken[2][0] = 3
assert.strictEqual(countSolutions(broken, 2), 0, 'no digit fits the top left box any more')
```

The H key should fill a cell from the solution and count the hints.
tr: H tuşu çözümden bir hücre doldurmalı ve ipuçlarını saymalı.

```js
$.press('h')
assert.strictEqual(grid[4][4], 5, 'the hint fills the selected cell')
assert.strictEqual(hints, 1)
$.tick(1)
assert.include($.texts(), 'Hints 1')
$.click(38, 80)
$.press('h')
assert.strictEqual(hints, 2)
assert.strictEqual(grid[0][2], 4, 'on a given digit, the first unsolved cell is filled')
for (let i = 0; i < 49; i++) $.press('h')
assert.isTrue(won)
assert.strictEqual(hints, 51)
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

const copy = (board) => board.map((row) => row.slice())

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  solution = copy(grid)
  countSolutions(solution, 1)
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
