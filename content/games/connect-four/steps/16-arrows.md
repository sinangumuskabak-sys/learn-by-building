---
title: Playing with the keyboard
title_tr: Klavyeyle oynamak
skills: [game.input]
---

# --goal--

The keyboard can play too: the left and right arrows move the next disc, and Space or Enter drops it.

# --goal-tr--

Klavyeyle de oynanabilsin: sol ve sağ ok sıradaki diski kaydırsın, **Boşluk** ya da **Enter** bıraksın.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    play(hoverCol)
  }
})
```

# --meaning--

- `event.key` is the name of the key: `'ArrowLeft'`, `' '` (Space), `'Enter'`...
- The arrows move `hoverCol` by one, kept between 0 and 6 with `Math.max` and `Math.min`.
- `||` means "or". `preventDefault()` stops Space from scrolling the page.

# --meaning-tr--

- `document.addEventListener('keydown', ...)` → klavyede bir tuşa basılınca çalışır.
- `event.key` → basılan tuşun adı: `'ArrowLeft'` (sol ok), `'ArrowRight'` (sağ ok), `' '` (Boşluk), `'Enter'`.
- `hoverCol = Math.max(0, hoverCol - 1)` → bir sola kay ama 0'ın altına inme. Sağ ok aynısı: 6'nın üstüne çıkma.
- `event.key === ' ' || event.key === 'Enter'` → `||` "**veya**": Boşluk ya da Enter.
- `event.preventDefault()` → tuşun olağan işini engeller (Boşluk sayfayı aşağı kaydırırdı).
- `play(hoverCol)` → seçili sütuna oyna.

# --task--

Under the `pointerdown` listener write the `keydown` listener.

# --task-tr--

`pointerdown` dinleyicisinin kapanış `})` satırının **altına** `keydown` dinleyicisini yaz. **Çalıştır**, oyuna tıkla
ve oklarla, Boşluk ve Enter ile oyna.

# --tests--

The arrows should move the next disc.
tr: Oklar sıradaki diski kaydırmalı.

```js
$.press('ArrowLeft')
assert.strictEqual(hoverCol, 2)
for (let i = 0; i < 10; i++) $.press('ArrowRight')
assert.strictEqual(hoverCol, 6, 'it stops at the last column')
```

Enter and Space should drop the disc.
tr: Enter ve Boşluk diski bırakmalı.

```js
$.press('Enter')
assert.strictEqual(board[5][3], 1)
$.press('ArrowLeft')
$.press(' ')
assert.strictEqual(board[5][2], 2)
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
  if (event.key === ' ' || event.key === 'Enter') {
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
