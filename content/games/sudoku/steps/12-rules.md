---
title: The three rules in one loop
title_tr: Tek döngüde üç kural
skills: [prog.functions, prog.loops]
---

# --goal--

`canPlace` answers the question at the heart of Sudoku: can this digit go here? One loop of 9 checks the row, the
column and the box at the same time.

# --goal-tr--

Sudoku'nun kalbindeki soru: **bu rakam buraya konabilir mi?** Satırında, sütununda ya da 3 × 3 kutusunda aynı rakam
varsa konamaz. `canPlace` bu soruyu yanıtlıyor; üç kuralı **tek bir 9'luk döngüde** birlikte kontrol ediyor.

Bu fonksiyonu hem hataları göstermek hem de ileride bilgisayarın bulmacayı çözmesi için kullanacağız.

# --code--

```js
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
```

# --meaning--

- `br`, `bc` are the top-left cell of the box: `r - (r % 3)` rounds down to 0, 3 or 6.
- In one loop, `i` walks the row (`board[r][i]`), the column (`board[i][c]`) and the box, whose cell number `i` becomes a
  row `Math.floor(i / 3)` and a column `i % 3` inside the box.
- As soon as the digit is found, the answer is no.

# --meaning-tr--

- `board` → hangi ızgaraya bakılacağı (ileride çözücü kendi kopyasını verecek).
- `const br = r - (r % 3)` → hücrenin kutusunun **ilk satırı**: 0, 3 ya da 6 (ör. 7 → 7 - 1 = 6). `bc` aynı, sütun için.
- `for (let i = 0; i < 9; i++)` → tek döngüde üç kontrol:
  - `board[r][i]` → satırın `i`. hücresi.
  - `board[i][c]` → sütunun `i`. hücresi.
  - `board[br + Math.floor(i / 3)][bc + (i % 3)]` → kutunun `i`. hücresi: `i` 0–8, kutu içinde satır `Math.floor(i / 3)`
    (0–2), sütun `i % 3` (0–2).
- Bir yerde `d` bulunursa hemen `return false`: konamaz. Döngü biterse `return true`.

# --task--

Under `let selected`, write the comment and `canPlace`.

# --task-tr--

`let selected` satırının altına bir boş satır bırakıp yorumu ve `canPlace` fonksiyonunu yaz. **Çalıştır**.

# --predict--

The top-left box of the puzzle holds 5, 3, 6, 9 and 8. Can a 9 go at row 0, column 2?
- [ ] Yes, there is no 9 in row 0
- [x] No, there is a 9 in its box
  Row 2 has a 9 in column 1, and that cell is in the same box.

# --predict-tr--

Bulmacanın sol üst kutusunda 5, 3, 6, 9 ve 8 var. 0. satır, 2. sütuna 9 konabilir mi?
- [ ] Evet, 0. satırda 9 yok
- [x] Hayır, kutusunda 9 var
  2. satırın 1. sütununda bir 9 var ve o hücre aynı kutuda.

# --tests--

`canPlace` should refuse a digit already in the row, the column or the box.
tr: `canPlace` satırda, sütunda ya da kutuda zaten olan rakamı reddetmeli.

```js
assert.isFalse(canPlace(grid, 0, 2, 5), 'in the row')
assert.isFalse(canPlace(grid, 0, 2, 8), 'in the column')
assert.isFalse(canPlace(grid, 0, 2, 9), 'in the box')
assert.isTrue(canPlace(grid, 0, 2, 4))
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
}

function enter(d) {
  if (given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
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
