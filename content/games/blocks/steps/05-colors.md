---
title: The number is the color
title_tr: Sayı renktir
skills: [prog.arrays]
---

# --goal--

Each filled cell's number picks its color from the list `COLORS`: 1 is cyan, 2 yellow, 3 purple, and so on. Index 0
is `null` because 0 means empty.

# --goal-tr--

Hücrelerdeki sayı yalnız "dolu" demesin, **rengini** de söylesin. Yedi parça için yedi renk: `COLORS` listesi.
`COLORS[3]` mor, `COLORS[6]` mavi. Böylece kuyu, her bloğun rengini ek bir bilgi tutmadan hatırlar.

Listenin ilk elemanı `null` (hiçbir şey): 0 boş hücre demek ve boşun rengi yok.

# --code--

```js
const COLORS = [null, '#22d3ee', '#facc15', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']

      if (board[row][col]) drawCell(col, row, COLORS[board[row][col]])
```

# --meaning--

- `COLORS[n]` is the color for the number `n`; index 0 is `null`, never used.
- `draw` now paints each cell with the color of its own number.

# --meaning-tr--

- `COLORS` → sekiz elemanlı liste; sıra numarası (index) 0'dan 7'ye. 1 camgöbeği, 2 sarı, 3 mor, 4 yeşil, 5 kırmızı,
  6 mavi, 7 turuncu.
- `null` → "hiçbir şey". 0. yuva kullanılmıyor; yalnız sayılar renklerle hizalansın diye orada.
- `COLORS[board[row][col]]` → içten dışa oku: önce hücrenin sayısı (`board[row][col]`, örneğin 6), sonra o sıradaki
  renk (`COLORS[6]`, mavi).

# --task--

1. Under `const CELL = 24` write `COLORS`.
2. In `draw`, replace `'#94a3b8'` with `COLORS[board[row][col]]`.

# --task-tr--

1. `const CELL = 24` satırının altına `COLORS` satırını yaz.
2. `draw` içinde `'#94a3b8'` yerine `COLORS[board[row][col]]` yaz.
3. **Çalıştır**: ekran değişmez; kontroller renkleri deniyor.

# --tests--

`COLORS` should have `null` and seven colors.
tr: `COLORS` bir `null` ve yedi renk içermeli.

```js
assert.lengthOf(COLORS, 8)
assert.isNull(COLORS[0])
assert.strictEqual(COLORS[3], '#a855f7')
```

Board cells should use the color of their number.
tr: Tahta hücreleri sayılarının rengini kullanmalı.

```js
board[19][0] = 6
board[19][1] = 2
draw()
assert.deepInclude($.rects('#3b82f6'), { x: 1, y: 457, w: 22, h: 22, color: '#3b82f6' })
assert.deepInclude($.rects('#facc15'), { x: 25, y: 457, w: 22, h: 22, color: '#facc15' })
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
const COLORS = [null, '#22d3ee', '#facc15', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, COLORS[board[row][col]])
    }
  }
}

draw()
```
