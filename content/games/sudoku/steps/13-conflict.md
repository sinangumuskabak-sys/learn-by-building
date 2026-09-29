---
title: Show mistakes
title_tr: Hataları göster
skills: [game.state]
---

# --goal--

A digit that clashes with another in its row, column or box turns its cell red, and so does the one it clashes with.

# --goal-tr--

Satırında, sütununda ya da kutusunda **aynısı olan** bir rakam, hücresini **kırmızıya** boyasın; çakıştığı hücre de
kırmızı olsun. Hatayı hemen görürsün.

Püf nokta: `canPlace` hücrenin **kendisini** de sayar (kendi rakamı zaten orada). Bu yüzden kontrol ederken hücreyi bir
anlığına boşaltıp sonra geri koyuyoruz.

# --code--

```js
// Does the digit at (r, c) clash with another cell in its row, column or box?
function conflict(r, c) {
  const d = grid[r][c]
  if (d === 0) return false
  grid[r][c] = 0
  const ok = canPlace(grid, r, c, d)
  grid[r][c] = d
  return !ok
}

      if (conflict(r, c)) fill = '#fecaca'
```

# --meaning--

- An empty cell never clashes.
- The cell is emptied for a moment so `canPlace` only sees the others, then its digit is put back.
- The red rule comes last, so a mistake always shows, even on the selected cell.

# --meaning-tr--

- `if (d === 0) return false` → boş hücre çakışmaz.
- `grid[r][c] = 0` → hücreyi **bir anlığına boşalt**; `canPlace` yalnız öteki hücrelere baksın.
- `grid[r][c] = d` → rakamı **geri koy**. Bir şeyi deneyip eski hâline getirmek sık kullanılan bir yöntem.
- `return !ok` → konamıyorsa çakışma var.
- Kırmızı kural en sonda: seçili hücrede bile hata görünür.

# --task--

1. Above `enter`, write the comment and `conflict`.
2. In `draw`, write the red rule as the last color rule.

# --task-tr--

1. `enter` fonksiyonunun üstüne yorumu ve `conflict` fonksiyonunu yaz (arada bir boş satır kalsın).
2. `draw` içinde renk kurallarının **en sonuna** (seçili hücre kuralının altına) kırmızı kuralı yaz.
3. **Çalıştır**, bir satıra orada zaten olan bir rakamı yaz.

# --tests--

Two equal digits in a row should both be marked as clashing.
tr: Bir satırdaki iki eş rakam çakışıyor diye işaretlenmeli.

```js
grid[0][2] = 5
assert.isTrue(conflict(0, 2))
assert.isTrue(conflict(0, 0))
assert.isFalse(conflict(1, 0))
assert.strictEqual(grid[0][2], 5, 'the digit is put back')
$.tick()
assert.lengthOf($.rects('#fecaca'), 2)
```

A digit that fits should not be marked.
tr: Uyan bir rakam işaretlenmemeli.

```js
grid[0][2] = 4
assert.isFalse(conflict(0, 2))
assert.isFalse(conflict(0, 3))
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

// Does the digit at (r, c) clash with another cell in its row, column or box?
function conflict(r, c) {
  const d = grid[r][c]
  if (d === 0) return false
  grid[r][c] = 0
  const ok = canPlace(grid, r, c, d)
  grid[r][c] = d
  return !ok
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
