---
title: Where does the disc land?
title_tr: Disk nereye düşer?
skills: [prog.loops, prog.functions]
---

# --goal--

In this game you choose only a **column**; the disc falls to the lowest empty hole. `dropRow(col)` finds it: it looks
from the bottom row upwards and stops at the first empty cell. If there is none, it returns -1.

# --goal-tr--

Bu oyunda hücre seçilmez, sadece **sütun**: disk o sütunun **en alttaki boş deliğine** düşer. `dropRow(col)` (düşeceği
satır) o deliği bulacak: en alt satırdan **yukarı doğru** bakar ve ilk boş hücrede durur. Sütun doluysa `-1` verir:
"böyle bir satır yok".

Bu adımda ekran değişmez; hesabı yapan fonksiyonu yazıyoruz.

# --code--

```js
// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}
```

# --meaning--

- The loop counts down from the bottom row (5) to the top row (0).
- `===` asks "is it equal?". At the first empty cell, `return row` gives that row back and leaves the function.
- If the loop ends without finding one, the column is full: `return -1`.

# --meaning-tr--

- `let row = ROWS - 1` → en alt satırdan (5) başla.
- `row >= 0` → `>=` "büyük ya da eşit": 0. satıra kadar devam et.
- `row--` → her turdan sonra 1 **azalt** (bir satır yukarı çık).
- `if (board[row][col] === 0) return row` → `===` "eşit mi?" diye sorar (tek `=` değer koymaktır, karıştırma). Boşsa bu
  satırı **geri ver** ve fonksiyondan hemen çık: `return`.
- Döngü boş bulamadan biterse `return -1`. "Yok" için `-1` kullanmak yaygın bir alışkanlıktır.

# --task--

Under `reset`, after an empty line, write the comment and `dropRow`.

# --task-tr--

`reset` fonksiyonunun kapanış `}`'sinin altına bir boş satır bırakıp yorum satırını ve `dropRow` fonksiyonunu yaz.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`dropRow` should find the lowest empty hole.
tr: `dropRow` en alttaki boş deliği bulmalı.

```js
assert.strictEqual(dropRow(3), 5)
board[5][3] = 1
assert.strictEqual(dropRow(3), 4)
board[4][3] = 2
assert.strictEqual(dropRow(3), 3)
```

A full column should give -1.
tr: Dolu bir sütun -1 vermeli.

```js
for (let row = 0; row < ROWS; row++) board[row][0] = 1
assert.strictEqual(dropRow(0), -1)
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
