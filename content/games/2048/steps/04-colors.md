---
title: A color for every number
title_tr: Her sayıya bir renk
skills: [prog.arrays]
---

# --goal--

Every value has its own color, looked up in a table keyed by the number: `COLORS[value]`. Empty cells stay light
brown; values past 2048 get a dark color.

# --goal-tr--

2048'de her sayının kendi rengi vardır: 2 açık bej, 8 turuncu, 2048 altın sarısı. Renkleri bir **tabloda** tutacağız:
anahtarı sayı, değeri renk. Hücreyi çizerken değerine bakıp tablodan rengini alacağız.

# --code--

```js
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
```

# --meaning--

- `COLORS` is an object used as a lookup table: `COLORS[8]` is `'#f2b179'`.
- `value === 0 ? a : b` picks the empty color for `0`, otherwise the table's color.
- `COLORS[4096]` is `undefined`, so `|| '#3c3a32'` gives a dark color for anything past 2048.

# --meaning-tr--

- `const COLORS = { 2: '#eee4da', ... }` → bir **nesne**, burada bir arama tablosu gibi kullanılıyor: `COLORS[8]` →
  `'#f2b179'`. Anahtarlar sayı olabilir.
- `const value = board[row][col]` → bu hücrenin değeri.
- `value === 0 ? '#cdc1b4' : ...` → boşsa açık kahverengi, değilse tablodan.
- `COLORS[value] || '#3c3a32'` → tabloda olmayan bir sayı (4096 gibi) `undefined` verir; `||` o zaman sağdakini,
  koyu bir rengi kullanır.

# --task--

1. Under `TOP` write the `COLORS` table.
2. In the loop in `draw`, replace the `'#cdc1b4'` color line with the two new lines.

# --task-tr--

1. `const TOP = ...` satırının altına `COLORS` tablosunu yaz (`let board` onun altında, bir boş satırdan sonra kalır).
2. `draw` içindeki döngüde `ctx.fillStyle = '#cdc1b4'` satırını sil; yerine iki yeni satırı yaz.
3. **Çalıştır**: tahta hâlâ boş, o yüzden ekran değişmez. Denemek için aşağıdaki öneriye bak.

# --try--

In `newGame`, under the `board = ...` line, add `board[0][0] = 8` and run: an orange cell. Remove the line.

# --try-tr--

`newGame` içinde `board = ...` satırının altına `board[0][0] = 8` ekle ve çalıştır: turuncu bir hücre. Sonra satırı sil.

# --tests--

Each cell should be drawn in its value's color.
tr: Her hücre değerinin renginde çizilmeli.

```js
board = [[2, 0, 0, 0], [0, 8, 0, 0], [0, 0, 128, 0], [0, 0, 0, 2048]]
draw()
assert.deepInclude($.rects(), { x: 12, y: 72, w: 85, h: 85, color: '#eee4da' })
assert.deepInclude($.rects(), { x: 109, y: 169, w: 85, h: 85, color: '#f2b179' })
assert.deepInclude($.rects(), { x: 303, y: 363, w: 85, h: 85, color: '#edc22e' })
assert.lengthOf($.rects('#cdc1b4'), 12)
```

Values past 2048 should be dark.
tr: 2048'den büyük değerler koyu olmalı.

```js
board = [[4096, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
draw()
assert.deepInclude($.rects(), { x: 12, y: 72, w: 85, h: 85, color: '#3c3a32' })
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
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

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
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
    }
  }
}

newGame()
draw()
```
