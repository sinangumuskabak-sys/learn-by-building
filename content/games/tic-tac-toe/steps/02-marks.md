---
title: The board as an array
title_tr: Dizi olarak tahta
skills: [prog.arrays, game.state]
---

# --explanation--

The 3×3 board is state: which cells hold an X, an O, or nothing. You could use a grid of rows, but a **flat array of
9 cells** is simpler, and a quick formula converts between an index and a position:

```
index:        0 1 2        row    = Math.floor(index / 3)
              3 4 5        column = index % 3
              6 7 8        index  = row * 3 + column
```

`%` is the remainder: `7 % 3` is `1`, so cell 7 is in column 1. `Math.floor(7 / 3)` is `2`, so it is in row 2. You
will use this "flat array + row/column formula" trick for every grid game: 2048, Minesweeper, Tetris...

An empty cell is the empty string `''`. To draw a mark, use big text centered in its cell. With
`textAlign = 'center'` and `textBaseline = 'middle'`, the point you give to `fillText` is the **middle** of the text,
so the cell center is all you need:

```js
const x = (index % 3) * CELL + CELL / 2
const y = Math.floor(index / 3) * CELL + CELL / 2
```

# --explanation-tr--

3×3 tahta bir durumdur: hangi hücrede X, hangisinde O var, hangisi boş. Satırlardan oluşan bir ızgara
kullanabilirsin, ama **9 hücrelik düz bir dizi** daha basittir ve küçük bir formül indeks ile konum arasında çeviri
yapar:

```
indeks:       0 1 2        satır  = Math.floor(indeks / 3)
              3 4 5        sütun  = indeks % 3
              6 7 8        indeks = satır * 3 + sütun
```

`%` kalandır: `7 % 3` `1`'dir, yani 7. hücre 1. sütundadır. `Math.floor(7 / 3)` `2`'dir, yani 2. satırdadır. Bu "düz
dizi + satır/sütun formülü" hilesini her ızgara oyununda kullanacaksın: 2048, Mayın Tarlası, Tetris...

Boş hücre boş metindir, `''`. Bir işareti çizmek için onu hücresinin ortasına büyük bir yazı olarak koy.
`textAlign = 'center'` ve `textBaseline = 'middle'` ile `fillText`'e verdiğin nokta yazının **ortası** olur; hücre
merkezi yeterlidir:

```js
const x = (index % 3) * CELL + CELL / 2
const y = Math.floor(index / 3) * CELL + CELL / 2
```

# --task--

1. Add `let board = ['', '', '', '', '', '', '', '', '']`.
2. Move the drawing into `function draw()`. After the grid, for every cell that is not empty, draw its mark with
   `fillText` at the cell's center, in `'bold 64px sans-serif'`, centered horizontally and vertically. Use
   `'#f38ba8'` for X and `'#89b4fa'` for O.
3. Call `draw()` once.

# --task-tr--

1. `let board = ['', '', '', '', '', '', '', '', '']` ekle.
2. Çizimi `function draw()` içine taşı. Izgaradan sonra boş olmayan her hücrenin işaretini hücrenin ortasına,
   `'bold 64px sans-serif'` yazı tipiyle, yatayda ve dikeyde ortalanmış olarak `fillText` ile çiz. X için
   `'#f38ba8'`, O için `'#89b4fa'` kullan.
3. `draw()`'u bir kez çağır.

# --tests--

The board should start with 9 empty cells.
tr: Tahta 9 boş hücreyle başlamalı.

```js
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
```

`draw()` should draw each mark in the middle of its cell, and nothing for empty cells.
tr: `draw()` her işareti hücresinin ortasına çizmeli, boş hücreler için hiçbir şey çizmemeli.

```js
board = ['X', '', '', '', 'O', '', '', '', 'X']
draw()
const marks = $.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.args[1], c.args[2]])
assert.sameDeepMembers(marks.map((m) => [m[0], m[1]]), [['X', 50], ['O', 150], ['X', 250]])
const byMark = Object.fromEntries(marks.map((m) => [m[0] + m[1], m[2]]))
assert.closeTo(byMark.X50, 50, 6)
assert.closeTo(byMark.O150, 150, 6)
assert.closeTo(byMark.X250, 250, 6)
```

X and O should have their own colors.
tr: X ve O'nun kendi renkleri olmalı.

```js
board = ['X', 'O', '', '', '', '', '', '', '']
draw()
const colors = Object.fromEntries($.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.fill]))
assert.deepEqual(colors, { X: '#f38ba8', O: '#89b4fa' })
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```
