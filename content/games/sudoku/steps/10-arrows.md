---
title: Move with the arrows
title_tr: Oklarla gez
skills: [game.input]
---

# --goal--

The arrow keys move the selection, wrapping around the edges.

# --goal-tr--

**Ok tuşları** seçimi gezdirsin; bir kenardan çıkınca karşı kenardan girsin. Fare olmadan hızlı oynamanın yolu.

# --code--

```js
document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  }
})
```

# --meaning--

- `moves` is a table from key name to a row and column change.
- `preventDefault` stops the arrows from scrolling the page.
- `(selected.r + dr + 9) % 9` wraps: from row 0 going up gives row 8.

# --meaning-tr--

- `moves` → **tablo**: her ok tuşu bir satır değişimi ve bir sütun değişimi verir.
- `event.preventDefault()` → okların sayfayı kaydırmasını engeller.
- `const [dr, dc] = moves[event.key]` → çiftteki iki sayıyı ayrı adlara açar.
- `(selected.r + dr + 9) % 9` → `+ 9` eksiye düşmeyi önler, `% 9` taşınca başa sarar: 0. satırdan yukarı çıkınca 8.

# --task--

Above the `pointerdown` listener, write the `keydown` listener.

# --task-tr--

`pointerdown` dinleyicisinin **üstüne** `keydown` dinleyicisini yaz (arada bir boş satır kalsın). **Çalıştır**, oyuna tıkla ve oklarla gez.

# --tests--

The arrows should move the selection, wrapping around the edges.
tr: Oklar seçimi gezdirmeli, kenarlardan başa sarmalı.

```js
$.tap('ArrowRight')
$.tap('ArrowDown')
assert.deepEqual(selected, { r: 5, c: 5 })
selected = { r: 0, c: 0 }
$.tap('ArrowUp')
$.tap('ArrowLeft')
assert.deepEqual(selected, { r: 8, c: 8 })
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

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  }
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
