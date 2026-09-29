---
title: The board as rows of numbers
title_tr: Sayı satırlarından tahta
skills: [prog.arrays]
---

# --goal--

The well's contents are a list of 20 rows, each a list of 10 numbers: 0 is an empty cell, any other number a filled
one. `emptyRow()` makes one row of zeros.

# --goal-tr--

Kuyunun **içinde ne olduğunu** da tutmamız lazım: hangi hücre boş, hangisi dolu. Bunu bir tabloyla tutacağız:
20 satır, her satır 10 sayı. `0` boş hücre, başka bir sayı dolu hücre (ileride sayı, hücrenin rengini de söyleyecek).

Bu tabloya `board` (tahta) diyoruz. Başta hepsi boş. Ekranda bir şey değişmeyecek.

# --code--

```js
function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)
```

# --meaning--

- `Array(COLS).fill(0)` makes an array of 10 slots and fills them with 0; `return` hands it back.
- `Array.from({ length: ROWS }, emptyRow)` makes 20 elements by calling `emptyRow` for each, so every row is its own
  array. `board[19][0]` is the bottom-left cell.

# --meaning-tr--

- `function emptyRow() {` → bir satır üreten fonksiyon.
  - `Array(COLS)` → 10 yuvalı bir **dizi** (liste) açar; `.fill(0)` bütün yuvalara 0 koyar.
  - `return` → sonucu geri verir: `emptyRow()` yazılan yere `[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]` gelir.
- `let board = Array.from({ length: ROWS }, emptyRow)` → "20 elemanlı bir dizi yap, her elemanı `emptyRow`'u
  çağırarak üret". Sonuç **dizilerden oluşan bir dizi**: 20 satır × 10 hücre.
  - Her satır `emptyRow`'un ayrı bir çağrısından geldiği için **kendi** dizisidir; bir satırı değiştirmek ötekileri
    etkilemez.
- `board[19][0]` → önce satır, sonra sütun: en alttaki satırın en soldaki hücresi. Sayma 0'dan başlar; son satır 19.

# --task--

Under `const CELL = 24` leave an empty line and write `emptyRow` and `board`.

# --task-tr--

1. `const CELL = 24` satırının altına bir boş satır bırak; `emptyRow` fonksiyonunu ve altına, bir boş satırdan sonra,
   `let board` satırını yaz. Çizim satırları altta kalsın.
2. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --try--

Why not `Array(ROWS).fill(emptyRow())`? It puts the same row 20 times: filling one cell would fill a whole column.

# --try-tr--

Neden `Array(ROWS).fill(emptyRow())` değil? O, **aynı** satırı 20 kez koyar: bir hücreyi doldurmak bütün sütunu doldururdu.

# --tests--

The board should be 20 rows of 10 empty cells, each row its own array.
tr: Tahta, her satırı kendi dizisi olan 10 boş hücreli 20 satır olmalı.

```js
assert.deepEqual(emptyRow(), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
assert.lengthOf(board, 20)
assert.isTrue(board.every((row) => row.length === 10 && row.every((cell) => cell === 0)))
assert.notStrictEqual(board[0], board[1], 'each row is its own array')
```

# --solution--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)
```
