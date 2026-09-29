---
title: Keys 1 to 7
title_tr: 1'den 7'ye tuşlar
skills: [game.input]
---

# --goal--

A faster way to play: the number keys 1 to 7 drop a disc straight into that column.

# --goal-tr--

Daha hızlı bir yol: **1'den 7'ye** sayı tuşları diski doğrudan o sütuna bıraksın. `3`'e basmak 3. sütuna oynar.

# --code--

```js
if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
```

# --meaning--

- `event.key >= '1' && event.key <= '7'` is true for the keys 1 to 7.
- `Number('3') - 1` is 2: columns are counted from 0.
- The same test is added to the drop line, so these keys also drop.

# --meaning-tr--

- `event.key >= '1' && event.key <= '7'` → "tuş 1 ile 7 arasında mı?" `&&` "ve", `<=` "küçük ya da eşit".
- `Number(event.key) - 1` → `'3'` yazısını `3` sayısına çevirir, 1 çıkarır: 2. Sütunlar 0'dan sayıldığı için.
- Bırakma satırına aynı test parantez içinde eklendi: sayı tuşları hem sütunu seçer hem bırakır.

# --task--

1. Under the `ArrowRight` line write the number line.
2. Add `|| (event.key >= '1' && event.key <= '7')` to the drop condition.

# --task-tr--

1. `keydown` içinde `ArrowRight` satırının altına sayı satırını yaz.
2. Bırakma satırındaki koşula, `'Enter'`'dan sonra `|| (event.key >= '1' && event.key <= '7')` ekle.
3. **Çalıştır**, oyuna tıkla ve sayı tuşlarıyla oyna.

# --tests--

The keys 1 to 7 should drop into that column.
tr: 1'den 7'ye tuşlar o sütuna bırakmalı.

```js
$.press('7')
assert.strictEqual(board[5][6], 1)
assert.strictEqual(hoverCol, 6)
$.press('1')
assert.strictEqual(board[5][0], 2)
```

Other keys should not drop anything.
tr: Başka tuşlar bir şey bırakmamalı.

```js
$.press('8')
$.press('a')
assert.isTrue(board.every((row) => row.every((cell) => cell === 0)))
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
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2
let turn
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  if (dropRow(col) === -1) return
  const row = dropRow(col)
  board[row][col] = turn
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
  disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
