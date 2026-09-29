---
title: Inside the board?
title_tr: Tahtanın içinde mi?
skills: [prog.functions]
---

# --goal--

To find four in a row we will walk from cell to cell. We must never step off the board, so first a small helper:
`inside(row, col)` is true only for a cell that exists.

# --goal-tr--

Dört tane yan yana var mı diye bakmak için hücreden hücreye **yürüyeceğiz**. Ama tahtanın dışına asla adım atmamalıyız:
`board[-1]` diye bir satır yok. Önce küçük bir yardımcı: `inside(row, col)` (içinde mi) sadece gerçekten var olan bir
hücre için `true` versin. Bu adımda ekran değişmez.

# --code--

```js
const inside = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS
```

# --meaning--

- An arrow function kept in a constant. With no `{ }` after `=>`, the value on the right is returned.
- `&&` needs all four checks to be true: the row from 0 to 5 and the column from 0 to 6.

# --meaning-tr--

- `const inside = (row, col) => ...` → bir fonksiyonu bir sabitte saklamak. `=>`'dan sonra süslü parantez yoksa sağdaki
  sonuç doğrudan **geri verilir**; `return` yazmaya gerek yok.
- `row >= 0 && row < ROWS` → satır 0 ile 5 arasında; `col >= 0 && col < COLS` → sütun 0 ile 6 arasında.
- `&&` "ve": dördü de doğruysa `true`, biri bile yanlışsa `false`.

# --task--

Above `function play(` write `inside`, followed by an empty line.

# --task-tr--

`function play(` satırının **üstüne** `inside` satırını yaz; altında bir boş satır kalsın. **Çalıştır**: ekran değişmez.

# --tests--

`inside` should be true only for cells on the board.
tr: `inside` sadece tahtadaki hücreler için doğru olmalı.

```js
assert.isTrue(inside(0, 0))
assert.isTrue(inside(5, 6))
assert.isFalse(inside(-1, 3))
assert.isFalse(inside(6, 3))
assert.isFalse(inside(2, -1))
assert.isFalse(inside(2, 7))
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc
const GRAVITY = 1.2
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2
let turn
let falling // the disc on its way down, or null
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  falling = null
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

const inside = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS

function play(col) {
  if (falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
  turn = 3 - turn
}

function colAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
}

canvas.addEventListener('pointermove', (event) => {
  hoverCol = colAt(event)
})
canvas.addEventListener('pointerdown', (event) => {
  hoverCol = colAt(event)
  play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    play(hoverCol)
  }
})

function update() {
  if (falling) {
    falling.vy += GRAVITY
    falling.y += falling.vy
    const bottom = TOP + falling.row * CELL + CELL / 2
    if (falling.y >= bottom) {
      falling.y = bottom
      land()
    }
  }
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The next disc waits above the column it would drop into.
  if (!falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  // The falling disc goes over the board, on its way to its hole.
  if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
