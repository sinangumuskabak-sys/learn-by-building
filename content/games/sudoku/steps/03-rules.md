---
title: The rules
title_tr: Kurallar
skills: [prog.functions, prog.loops]
---

# --explanation--

The whole of Sudoku is one question: **can digit `d` go at `(r, c)`?** It can if `d` is not already in row `r`, in column
`c`, or in the box. One loop of 9 checks all three at once:

```js
const br = r - (r % 3)   // the box's top row: 0, 3 or 6
const bc = c - (c % 3)   // the box's left column
for (let i = 0; i < 9; i++) {
  if (board[r][i] === d || board[i][c] === d) return false
  if (board[br + Math.floor(i / 3)][bc + (i % 3)] === d) return false
}
```

The last line walks the box: as `i` goes from 0 to 8, `Math.floor(i / 3)` goes 0 0 0 1 1 1 2 2 2 and `i % 3` goes
0 1 2 0 1 2 0 1 2, which visits all nine cells.

`canPlace` takes the board as a parameter instead of always using `grid`. That makes it a **pure** rule we can use on any
board, which the solver in the next step will need.

To mark mistakes, `conflict(r, c)` takes the digit out of its own cell for a moment (otherwise it would always find itself),
asks `canPlace`, and puts it back. Clashing cells turn red.

The puzzle is solved when every cell is filled and nothing clashes.

# --explanation-tr--

Sudoku'nun tamamı tek bir sorudur: **`d` rakamı `(r, c)`'ye konabilir mi?** `d` zaten `r` satırında, `c` sütununda ya da
kutuda değilse konabilir. 9'luk tek bir döngü üçünü birden kontrol eder:

```js
const br = r - (r % 3)   // kutunun en üst satırı: 0, 3 ya da 6
const bc = c - (c % 3)   // kutunun sol sütunu
for (let i = 0; i < 9; i++) {
  if (board[r][i] === d || board[i][c] === d) return false
  if (board[br + Math.floor(i / 3)][bc + (i % 3)] === d) return false
}
```

Son satır kutuyu gezer: `i` 0'dan 8'e giderken `Math.floor(i / 3)` 0 0 0 1 1 1 2 2 2, `i % 3` ise 0 1 2 0 1 2 0 1 2 olur;
bu da dokuz hücrenin hepsini ziyaret eder.

`canPlace` her zaman `grid`'i kullanmak yerine tahtayı parametre olarak alır. Bu onu herhangi bir tahtada kullanabileceğimiz
**saf** bir kural yapar; bir sonraki adımdaki çözücünün buna ihtiyacı olacak.

Hataları işaretlemek için `conflict(r, c)` rakamı bir anlığına kendi hücresinden çıkarır (yoksa hep kendisini bulurdu),
`canPlace`'e sorar ve geri koyar. Çakışan hücreler kırmızıya döner.

Her hücre dolduğunda ve hiçbir şey çakışmadığında bulmaca çözülmüştür.

# --task--

1. Write `canPlace(board, r, c, d)`: false if `d` is already in row `r`, column `c` or the box of `(r, c)`.
2. Write `conflict(r, c)`: false for an empty cell, otherwise whether that digit clashes with another cell.
3. Add `won` (`false` in `reset()`). Write `checkWin()`, called after each `enter`: if no cell is `0` and none has a conflict,
   set `won = true`. `enter` does nothing once `won`.
4. A clashing cell is filled `'#fecaca'` (this rule wins over the others).
5. When `won`, draw a dark band (`'rgba(15, 23, 42, 0.75)'`) across the middle of the board and `Solved!` and
   `Click for a new puzzle` in white. A click then calls `reset()`.

# --task-tr--

1. `canPlace(board, r, c, d)` yaz: `d` zaten `r` satırında, `c` sütununda ya da `(r, c)`'nin kutusundaysa false.
2. `conflict(r, c)` yaz: boş bir hücre için false, değilse o rakamın başka bir hücreyle çakışıp çakışmadığı.
3. `won` ekle (`reset()`'te `false`). Her `enter`'dan sonra çağrılan `checkWin()`'i yaz: hiçbir hücre `0` değilse ve hiçbirinde
   çakışma yoksa `won = true` yap. `won` olduktan sonra `enter` hiçbir şey yapmaz.
4. Çakışan bir hücre `'#fecaca'` ile doldurulur (bu kural diğerlerini geçer).
5. `won` olduğunda tahtanın ortasına koyu bir şerit (`'rgba(15, 23, 42, 0.75)'`) ve beyazla `Solved!` ile
   `Click for a new puzzle` çiz. Sonra bir tıklama `reset()`'i çağırır.

# --tests--

`canPlace` should check the row, the column and the box.
tr: `canPlace` satırı, sütunu ve kutuyu kontrol etmeli.

```js
assert.isFalse(canPlace(grid, 0, 2, 5), '5 is already in the row')
assert.isFalse(canPlace(grid, 0, 2, 8), '8 is already in the column')
assert.isFalse(canPlace(grid, 0, 2, 9), '9 is already in the box')
assert.isTrue(canPlace(grid, 0, 2, 1))
assert.isTrue(canPlace(grid, 0, 2, 4))
```

Two clashing digits should both be marked red, and fixing one should clear both.
tr: Çakışan iki rakamın ikisi de kırmızı işaretlenmeli ve birini düzeltmek ikisini de temizlemeli.

```js
$.click(38 + 48 * 2, 80)
$.press('5')
assert.isTrue(conflict(0, 2))
assert.isTrue(conflict(0, 0), 'both clashing digits are marked')
assert.isFalse(conflict(0, 1))
$.tick(1)
assert.lengthOf($.rects('#fecaca'), 2)
$.press('4')
assert.isFalse(conflict(0, 2))
assert.isFalse(conflict(0, 0))
```

Filling in the last correct digit should solve the puzzle, and a click should start it again.
tr: Son doğru rakamı doldurmak bulmacayı çözmeli ve bir tıklama onu yeniden başlatmalı.

```js
const answer = '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
for (let i = 0; i < 81; i++) {
  if (given[Math.floor(i / 9)][i % 9]) continue
  $.click(38 + 48 * (i % 9), 80 + 48 * Math.floor(i / 9))
  if (i === 78) assert.isFalse(won, 'not solved until the last cell')
  $.press(answer[i])
}
assert.isTrue(won)
$.tick(1)
assert.include($.texts(), 'Solved!')
$.press('Backspace')
assert.strictEqual(grid[8][6], 1, 'a solved puzzle cannot change')
$.click(200, 300)
assert.isFalse(won)
assert.strictEqual(grid[0][2], 0, 'a click starts again')
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
