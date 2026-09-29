---
title: Big numbers, smaller text
title_tr: Büyük sayı, küçük yazı
skills: [game.canvas]
---

# --goal--

`1024` in 40-pixel letters does not fit in its cell. Bigger numbers get smaller text: 40 below 100, 34 below 1000, 26
otherwise.

# --goal-tr--

40 piksellik harflerle `1024` hücreye sığmaz. Sayı büyüdükçe yazıyı küçültelim: 100'den küçükse 40, 1000'den
küçükse 34, daha büyükse 26 piksel.

# --code--

```js
ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
```

# --meaning--

- Chained `? :`: the first true condition wins. The size is then glued into the font text: `'bold 34px sans-serif'`.

# --meaning-tr--

- `value < 100 ? 40 : value < 1000 ? 34 : 26` → **zincirleme** `? :`, soldan okunur: 100'den küçükse 40; değilse
  1000'den küçükse 34; değilse 26.
- `'bold ' + (...) + 'px sans-serif'` → seçilen sayıyı yazının ortasına ekler: `'bold 34px sans-serif'`. Parantez,
  `+`'lardan önce hesaplanmasını sağlar.

# --task--

Replace the `font` line in the `if` block.

# --task-tr--

`if` bloğundaki `ctx.font = 'bold 40px sans-serif'` satırını yenisiyle değiştir. **Çalıştır**.

# --tests--

Bigger numbers should use smaller text.
tr: Büyük sayılar daha küçük yazı kullanmalı.

```js
board = [[64, 128, 1024, 2048], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
draw()
const fonts = $.screen().filter((c) => c.op === 'fillText').map((c) => c.font)
assert.deepEqual(fonts, ['bold 40px sans-serif', 'bold 34px sans-serif', 'bold 26px sans-serif', 'bold 26px sans-serif'])
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

  ctx.textBaseline = 'middle'

  ctx.textAlign = 'center'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

newGame()
draw()
```
