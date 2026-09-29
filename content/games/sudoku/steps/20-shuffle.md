---
title: Random order
title_tr: Rastgele sıra
skills: [prog.arrays]
---

# --goal--

Solving an empty board gives a full, valid Sudoku grid, but always the same one. Shuffling the options makes the
solver build a different random grid every time. This is the first half of inventing puzzles.

# --goal-tr--

**Boş** bir tahtayı çözdürürsen çözücü dolu, geçerli bir sudoku ızgarası üretir; ama hep **aynısını**, çünkü seçenekleri
hep 1, 2, 3... sırasıyla dener. Seçenekleri **karıştırırsak** her seferinde farklı, rastgele bir ızgara çıkar. Bulmaca
icat etmenin ilk yarısı bu.

Karıştırmak için bilinen, adil bir yöntem kullanıyoruz: **Fisher–Yates** karıştırması.

# --code--

```js
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
```

# --meaning--

- `order` defaults to `false`, so solving works as before; with `true` the options are shuffled first, all the way down.
- Fisher–Yates: from the end, swap each item with a random one at or before it. Every order is equally likely.
- `[a, b] = [b, a]` swaps two values. The `;` at the start keeps JavaScript from gluing the line to the one before.

# --meaning-tr--

- `order = false` → varsayılan kapalı: çözücü eskisi gibi çalışır. `true` verilirse her hücrede seçenekler önce
  karıştırılır; özyinelemeli çağrıya da aktarılır.
- `shuffle` → **Fisher–Yates**: listenin sonundan başla, her elemanı kendisi ya da kendinden önceki rastgele bir
  elemanla **yer değiştir**. Her sıralama eşit olasılıklı olur.
- `Math.floor(Math.random() * (i + 1))` → 0 ile `i` arası rastgele sıra.
- `[list[i], list[j]] = [list[j], list[i]]` → iki değeri tek satırda **takas** et.
- Satır başındaki `;` → JavaScript bu satırı üstündekine yapıştırıp yanlış anlamasın diye (köşeli parantezle başlayan
  satırlarda gerekli).

# --task--

1. Change the second comment line and the function's first line to add `order`.
2. Shuffle the options when `order` is on, and pass `order` along in the recursive call.
3. Under `countSolutions`, write `shuffle`.

# --task-tr--

1. İkinci yorum satırını ve fonksiyonun ilk satırını koddaki gibi değiştir (`order = false` eklenir).
2. `const { r, c, options } = cell` satırının altına `if (order) shuffle(options)` yaz; özyinelemeli çağrıya `, order`
   ekle.
3. `countSolutions`'ın altına bir boş satır bırakıp `shuffle` fonksiyonunu yaz.
4. **Çalıştır**.

# --tests--

`shuffle` should keep the same items in a new order.
tr: `shuffle` aynı elemanları yeni bir sırada tutmalı.

```js
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const out = shuffle(list.slice())
assert.sameMembers(out, list)
assert.notDeepEqual(out, list)
```

Solving an empty board in random order should give different valid grids.
tr: Boş tahtayı rastgele sırayla çözmek farklı geçerli ızgaralar vermeli.

```js
const valid = (b) => b.every((row, r) => row.every((d, c) => { b[r][c] = 0; const ok = d >= 1 && d <= 9 && canPlace(b, r, c, d); b[r][c] = d; return ok }))
const a = Array.from({ length: 9 }, () => Array(9).fill(0))
const b = Array.from({ length: 9 }, () => Array(9).fill(0))
countSolutions(a, 1, true)
countSolutions(b, 1, true)
assert.isTrue(valid(a) && valid(b))
assert.notDeepEqual(a, b)
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
