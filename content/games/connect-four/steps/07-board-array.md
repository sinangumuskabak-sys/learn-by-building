---
title: The board in memory
title_tr: Bellekteki tahta
skills: [prog.arrays]
---

# --goal--

The game must remember what is in every hole. The board becomes a **2D array**: a list of 6 rows, each a list of 7 cells.
`board[row][col]` is 0 for empty, 1 for red and 2 for yellow. Every row must be its own new array.

# --goal-tr--

Oyun her delikte ne olduğunu **hatırlamalı**. Bunun için **dizi** (array) kullanacağız: sıralı bir liste, örneğin
`[0, 0, 0]`. Elemanlar **0'dan** numaralanır.

Tahta bir **listeler listesi** olacak: 6 satırlık bir liste, her satır da 7 hücrelik bir liste. `board[row][col]` →
önce satırı, sonra sütunu seç. Değer `0` boş, `1` kırmızı disk, `2` sarı disk. 0. satır en üstte, en alt satır 5.

Bu adımda ekran değişmez; tahta bellekte kuruluyor.

# --code--

```js
let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

reset()
```

# --meaning--

- `Array(COLS).fill(0)` is a row of seven 0s.
- `Array.from({ length: ROWS }, () => ...)` calls the arrow function once per row, so each row is a new array.
- The classic bug `Array(ROWS).fill(Array(COLS).fill(0))` would put the same row six times: change one, change all.

# --meaning-tr--

- `let board` → **değişken**: `const`'tan farkı, değeri sonradan değiştirilebilir. Değerini `reset` (sıfırla) verecek.
- `Array(COLS)` → 7 boş yeri olan bir dizi; `.fill(0)` hepsine 0 koyar: `[0, 0, 0, 0, 0, 0, 0]`, bir satır.
- `Array.from({ length: ROWS }, () => ...)` → "6 elemanlı bir dizi yap; her elemanı şu fonksiyonla üret". `() => ...`
  küçük bir fonksiyonun kısa yazılışı (**ok fonksiyonu**). Her satır için ayrı çalıştığından her satır **yeni** bir dizi.
- Dikkat, bilinen bir tuzak: `Array(ROWS).fill(Array(COLS).fill(0))` doğru görünür ama her yere **aynı** satırı koyar.
  Bir hücreyi değiştirince bütün satırlar değişir. Altı kişiye fotokopi yerine **aynı defteri** vermek gibi.
- En alttaki `reset()` → tahtayı kurar; `draw()`'dan önce.

# --task--

1. Under the constants, after an empty line, write `let board` and `reset`.
2. Above the `draw()` call at the bottom, write `reset()`.

# --task-tr--

1. `const TOP = ...` satırının altına bir boş satır bırakıp `let board ...` satırını, bir boş satırdan sonra da `reset`
   fonksiyonunu yaz.
2. En alttaki `draw()` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

The board should be 6 rows of 7 empty cells.
tr: Tahta 7 boş hücreli 6 satır olmalı.

```js
assert.lengthOf(board, 6)
assert.isTrue(board.every((row) => row.length === 7 && row.every((cell) => cell === 0)))
```

Each row should be its own array.
tr: Her satır kendi dizisi olmalı.

```js
board[5][0] = 1
assert.strictEqual(board[4][0], 0, 'changing one row must not change the others')
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

let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
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
      disc(x, y, '#0f172a')
    }
  }
}

reset()
draw()
```
