---
title: Play a column
title_tr: Bir sütuna oyna
skills: [prog.arrays, game.state]
---

# --goal--

`play(col)` makes a move: it puts a disc in the lowest empty hole of that column. A full column is refused.

# --goal-tr--

`play(col)` (oyna) bir hamle yapacak: o sütunun en alttaki boş deliğine bir disk koyacak. Sütun doluysa hiçbir şey
yapmadan çıkacak. Şimdilik hep kırmızı (1) koyuyor; sırayı bir sonraki adımda ekleyeceğiz.

# --code--

```js
function play(col) {
  if (dropRow(col) === -1) return
  const row = dropRow(col)
  board[row][col] = 1
}
```

# --meaning--

- A full column (`-1`) ends the function at once with `return`.
- Otherwise the disc (1) goes into the lowest empty row.

# --meaning-tr--

- `if (dropRow(col) === -1) return` → sütun doluysa **dur**: `return` fonksiyondan hemen çıkar, alttaki satırlar
  çalışmaz.
- `const row = dropRow(col)` → diskin düşeceği satır.
- `board[row][col] = 1` → o hücreye kırmızı disk koy. Tek `=`: değer **koymak**.
- Döngü her karede tahtayı çizdiği için disk hemen ekranda görünür.

# --task--

Above `function disc(` write `play`, followed by an empty line.

# --task-tr--

`function disc(` satırının **üstüne** `play` fonksiyonunu yaz; altında bir boş satır kalsın. **Çalıştır**. Henüz
tıklayarak oynayamazsın; ama aşağıdaki **Dene** ile görebilirsin.

# --try--

Add `play(3)` twice at the very bottom and run: two red discs stack up. Remove them again.

# --try-tr--

En alta iki kez `play(3)` ekle ve çalıştır: iki kırmızı disk üst üste diziliyor. Sonra sil.

# --tests--

`play` should put a disc in the lowest empty hole.
tr: `play` diski en alttaki boş deliğe koymalı.

```js
play(3)
assert.strictEqual(board[5][3], 1)
play(3)
assert.strictEqual(board[4][3], 1)
```

A full column should refuse more discs.
tr: Dolu bir sütun daha fazla disk kabul etmemeli.

```js
for (let i = 0; i < 7; i++) play(0)
assert.deepEqual(board.map((row) => row[0]), [1, 1, 1, 1, 1, 1])
assert.strictEqual(board[5][1], 0)
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

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
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
  board[row][col] = 1
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

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
