---
title: Write digits
title_tr: Rakam yaz
skills: [game.input, game.state]
---

# --goal--

Keys 1 to 9 write a digit in the selected cell; 0, Backspace or Delete erase it. The puzzle's own digits cannot be changed.

# --goal-tr--

**1–9** tuşları seçili hücreye rakam yazsın; **0**, **Backspace** ya da **Delete** silsin. Bulmacanın kendi rakamları
(`given`) değiştirilemesin.

# --code--

```js
function enter(d) {
  if (given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
}

  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
```

# --meaning--

- `enter` writes into the selected cell unless it is a given one; writing 0 erases.
- `event.key >= '1' && event.key <= '9'` compares texts: a single character between '1' and '9' is a digit key.
- `Number(event.key)` turns `'7'` into `7`.

# --meaning-tr--

- `function enter(d)` → seçili hücreye `d` yaz; hücre **verilmişse** hemen çık. 0 yazmak silmek demek.
- `event.key >= '1' && event.key <= '9'` → metinleri karşılaştırıyoruz: tek karakter '1' ile '9' arasındaysa bir
  rakam tuşu.
- `Number(event.key)` → `'7'` → `7`.
- Silme için üç tuş kabul ediliyor: 0, Backspace, Delete.

# --task--

1. Under the `reset` function, write `enter`.
2. In `keydown`, write the two `else if` lines after the arrow block.

# --task-tr--

1. `reset` fonksiyonunun altına bir boş satır bırakıp `enter` fonksiyonunu yaz.
2. `keydown` içinde ok bloğunun kapanan `}` işaretinin sonuna iki `else if` satırını ekle (koddaki gibi).
3. **Çalıştır**, boş bir hücre seç ve rakam yaz: mavi ve ince görünmeli.

# --tests--

A digit key should write into an empty selected cell.
tr: Rakam tuşu seçili boş hücreye yazmalı.

```js
selected = { r: 0, c: 2 }
$.tap('4')
assert.strictEqual(grid[0][2], 4)
$.tap('Backspace')
assert.strictEqual(grid[0][2], 0)
```

The puzzle's own digits should not change.
tr: Bulmacanın kendi rakamları değişmemeli.

```js
selected = { r: 0, c: 0 }
$.tap('9')
assert.strictEqual(grid[0][0], 5)
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
