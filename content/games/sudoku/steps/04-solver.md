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

**Bu adımda:** bulmacayı bilgisayar kendisi çözecek ve sana ipucu verecek. **H** tuşuna basınca seçili hücreye
(ya da ilk eksik hücreye) doğru rakam yazılacak; sağ üstte `Hints 1` gibi kaç ipucu aldığın görünecek.

**Geri izleme (backtracking).** Bir program her Sudoku'yu çözebilir mi? Evet, programlamanın en kullanışlı
fikirlerinden biriyle:

1. Boş bir hücre bul. Hiç yoksa tahta çözülmüş demektir.
2. Oraya uyan her rakamı sırayla dene. Her biri için rakamı yaz ve **geri kalanını aynı yöntemle çöz**.
3. Geri kalanı çözülemiyorsa rakamı **sil** ve sıradakini dene. Hiçbir rakam olmuyorsa "olmadı" diye geri dön; seni
   çağıran da **kendi** rakamını silip sıradakini dener.

Tam olarak kurşun kalem ve silgiyle yaptığın şey, sadece hiç yorulmadan.

**Kendini çağıran fonksiyon (özyineleme, recursion).** 2. maddedeki "geri kalanını aynı yöntemle çöz", fonksiyonun
**kendini** çağırmasıdır: `countSolutions` içinde yine `countSolutions(...)` yazar. Her çağrı bir hücre doldurur ve
işi daha küçük bir tahtaya devreder. Boş hücre kalmayınca durur, çünkü o zaman kendini çağırmadan `1` döner.

**Akıllı seçim.** 1. adımda doğru hücreyi seçmek işi binlerce kat hızlandırır: **en az** rakamın uyduğu boş hücreyi
al. Tek seçenekli bir hücreyi denemek bedavadır; hiç seçeneği olmayan hücre ise hemen çıkmaz sokak demektir.
`bestCell` bu hücreyi ve seçeneklerini döner; boş hücre yoksa `null` (hiçbir şey) döner.

- `if (!found || options.length < found.options.length)` → "henüz bir şey bulmadıysak **veya** bu hücrenin
  seçenekleri daha azsa, bunu tut". `!found`, `found` `null` iken doğrudur.
- `{ r, c, options }` kısaltması `{ r: r, c: c, options: options }` demektir. Tersi de var:
  `const { r, c, options } = cell` nesnenin üç alanını üç ayrı ada çıkarır.

**Saymak ve sınır.** Çözücümüz ilk çözümde durmak yerine çözümleri **sayar**, ama en fazla `limit` kadar.
`limit = 1` ile tahtayı çözer ve çözümü tahtada bırakır. `limit = 2` ile "tam bir çözüm mü var?" sorusunu cevaplar;
adil bir bulmaca bunu ister ve sonraki adım onu kullanacak. `function countSolutions(board, limit = 2)` içindeki
`= 2` **varsayılan değerdir**: çağıran `limit` vermezse 2 olur.

**Kopya üzerinde çözmek.** Oyuncunun ızgarası boş kalsın diye bulmacanın **kopyasını** çözer, `solution` olarak
saklarız. `row.slice()` bir satırın kopyasını yapar; `board.map(...)` her satırı kopyalayıp yeni bir tahta kurar.
Kopya olmasaydı ikisi aynı tahta olurdu ve çözüm oyuncunun ızgarasına da yazılırdı.

**İpucu** artık kolay: çözümden bir rakam kopyala. Seçili hücre zaten doğruysa (ya da verilmiş bir rakamsa) ilk
yanlış/boş hücreyi ararız: `for (let i = 0; i < 81 && !cell; i++)` "81'e kadar, **ve** henüz hücre bulmadığımız
sürece" döner. `i` sırasından satır `Math.floor(i / 9)`, sütun `i % 9` çıkar.

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

1. `let given ...` satırının hemen **altına** `solution`'ı, `let won` satırının altına da `hints`'i ekle:

   ```js
   let solution
   ```

   ```js
   let hints
   ```

2. `canPlace` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp şu üç parçayı yaz:

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
   ```

   `for (const d of options)` listedeki her seçenek için bir kez döner. `board[r][c] = 0` denemeyi geri alır
   (silgi).

3. `reset()` fonksiyonunu şöyle yap:

   ```js
   function reset() {
     grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
     solution = copy(grid)      // ← yeni
     countSolutions(solution, 1) // ← yeni
     given = grid.map((row) => row.map((d) => d !== 0))
     selected = { r: 4, c: 4 }
     won = false
     hints = 0                  // ← yeni
   }
   ```

4. `enter()` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp ipucu fonksiyonunu yaz:

   ```js
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
   ```

5. Klavye dinleyicisinde, `enter(0)` ile biten satırın hemen **altına** H tuşunu ekle:

   ```js
     else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
     else if (event.key === 'h' || event.key === 'H') hint() // ← yeni
   })
   ```

6. `draw()` fonksiyonunda, çizgileri çizen `for` döngüsünün kapanan `}`'si ile `if (won) {` satırının **arasına**
   ipucu sayacını ekle:

   ```js
     ctx.fillStyle = '#0f172a'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'right'
     ctx.fillText('Hints ' + hints, canvas.width - LEFT, 34)
   ```

   `textAlign = 'right'` yazının sağ ucunu ızgaranın sağ kenarına hizalar.

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve H'ye bas: ortadaki hücreye `5` yazılmalı ve sağ üstte
   `Hints 1` görünmeli. H'ye basmaya devam edersen bulmaca sonunda çözülür. Alttaki kontrollerin hepsi yeşil
   olmalı. Çözücü testi kırmızıysa `countSolutions` içindeki `board[r][c] = 0` satırının `for`'un **içinde**
   olduğunu kontrol et.

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
