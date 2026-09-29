---
title: A grid of numbers
title_tr: Sayılardan bir ızgara
skills: [prog.arrays]
---

# --goal--

The board's data is a **2D array**: an array of 4 rows, each an array of 4 numbers; `0` is an empty cell and
`board[row][col]` reads one. Building it hides one of JavaScript's most famous traps.

# --goal-tr--

Tahtanın verisi bir **2 boyutlu dizi**: 4 satırdan oluşan bir liste, her satır da 4 sayıdan oluşan bir liste. `0` boş
hücre demek. Bir hücreyi `board[satır][sütun]` diye okuruz; tıpkı resimdeki gibi, önce satır sonra sütun.

```js
[
  [0, 2, 0, 0],   // board[0]: en üst satır
  [0, 0, 4, 0],   // board[1][2] → 4
  ...
]
```

Boş tahtayı kurarken JavaScript'in en ünlü tuzaklarından biri saklı; aşağıda.

# --code--

```js
let board

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

newGame()
draw()
```

# --meaning--

- `Array(SIZE).fill(0)` is one row of four zeros.
- `Array.from({ length: SIZE }, () => ...)` calls the arrow function once per row, so every row is a **new** array.
- The trap: `Array(4).fill(Array(4).fill(0))` puts the **same** row object in all four places. Setting
  `board[0][0] = 2` would change `board[1][0]`, `board[2][0]` and `board[3][0]` too, since they are one row.
- `newGame()` builds the board before the first `draw()`.

# --meaning-tr--

- `let board` → tahtayı tutacak değişken; içini `newGame` dolduracak.
- `Array(SIZE).fill(0)` → 4 kutuluk bir liste yapıp hepsine `0` koyar: **bir satır**.
- `Array.from({ length: SIZE }, () => ...)` → 4 elemanlı bir liste yapar ve **her eleman için** sağdaki ok
  fonksiyonunu **ayrı ayrı** çağırır. Her çağrı yepyeni bir satır üretir.
- **Tuzak:** `Array(4).fill(Array(4).fill(0))` de doğru görünür, ama `fill` dört yere **aynı satır nesnesini** koyar.
  `board[0][0] = 2` yazınca `board[1][0]`, `board[2][0]`, `board[3][0]` da 2 olur; çünkü aslında tek bir satır
  var, dört yerden görünüyor. Bir değer ile bir nesneye **başvuru** (referans) arasındaki bu fark, oyunların çok
  ötesinde sayısız hataya yol açar.
- En altta `newGame()` → çizmeden önce tahtayı kur.

# --task--

1. Under `TOP`, after an empty line, write `let board`.
2. Above `function cellX(col) {` write `newGame`, with an empty line after it.
3. At the bottom, write `newGame()` above `draw()`.

# --task-tr--

1. `const TOP = ...` satırının altında bir boş satır bırak ve `let board` yaz.
2. `function cellX(col) {` satırının **üstüne** `newGame` fonksiyonunu yaz; altında bir boş satır kalsın.
3. En alttaki `draw()` satırının **üstüne** `newGame()` yaz.
4. **Çalıştır**: ekran değişmez; tahta artık hafızada.

# --try--

Replace the `Array.from(...)` with `Array(SIZE).fill(Array(SIZE).fill(0))` and run: the second check fails. Put it
back.

# --try-tr--

`Array.from(...)` yerine `Array(SIZE).fill(Array(SIZE).fill(0))` yaz ve çalıştır: ikinci kontrol kırmızı olur. Sonra
geri al.

# --tests--

The board should start as a 4×4 grid of zeros.
tr: Tahta sıfırlardan oluşan 4×4'lük bir ızgara olarak başlamalı.

```js
assert.deepEqual(board, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
```

Each row should be its own array.
tr: Her satır kendi dizisi olmalı.

```js
newGame()
assert.notStrictEqual(board[0], board[1])
board[0][0] = 64
assert.strictEqual(board[1][0], 0, 'changing one row must not change the others')
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board

let board

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      ctx.fillStyle = '#cdc1b4'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
    }
  }
}

newGame()
draw()
```
