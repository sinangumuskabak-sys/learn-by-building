---
title: Which cell was clicked?
title_tr: Hangi kutuya tıklandı?
skills: [game.input]
---

# --goal--

The click event says where the mouse was, measured from the page's corner. We subtract where the canvas starts, then
turn the point into a column, a row and a cell number.

# --goal-tr--

Tıklama olayı farenin **nerede** olduğunu söyler, ama **sayfanın** sol üst köşesine göre. Canvas ise sayfanın köşesinde
başlamıyor. Önce canvas'ın başladığı yeri çıkarırız, sonra noktanın hangi kutuya düştüğünü buluruz.

9. adımdaki formülün **tersi**: orada numaradan konum bulmuştuk, şimdi konumdan numara bulacağız.

# --code--

```js
const rect = canvas.getBoundingClientRect()
const x = event.clientX - rect.left
const y = event.clientY - rect.top
const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
play(index)
```

# --meaning--

- `getBoundingClientRect()` tells where the canvas is on the page (`left`, `top`).
- `event.clientX - rect.left` is the click's x inside the canvas; the same for y.
- `Math.floor(x / CELL)` is the column (0 to 2), `Math.floor(y / CELL)` the row; `row * 3 + column` is the cell number.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki **kutusu**: nerede başladığı (`left` soldan, `top` yukarıdan)
  ve ne kadar büyük olduğu. Adı uzun ama anlamı basit: "canvas'ın ekrandaki dikdörtgeni".
- `event.clientX` → tıklamanın sayfadaki x'i. `- rect.left` → canvas'ın başladığı yeri çıkar: artık x canvas'ın
  **içindeki** konum (0–300).
- `const y = ...` → aynısı dikeyde.
- `Math.floor(x / CELL)` → sütun: 250 / 100 = 2.5 → **2**. `Math.floor(y / CELL)` → satır.
- `satır * 3 + sütun` → kutu numarası. Örneğin 2. satır, 0. sütun: 2 × 3 + 0 = **6** (sol alt).
- `play(index)` → artık hep 4'e değil, tıklanan kutuya oyna.

# --task--

In the listener, replace `play(4)` with the four new lines and `play(index)`. Run and play a whole game against
yourself.

# --task-tr--

1. Dinleyicinin içindeki `play(4)` satırını sil.
2. Yerine dört hesap satırını ve `play(index)` satırını yaz. `draw()` altta kalsın.
3. **Çalıştır** ve kendine karşı bir oyun oyna: tıkladığın kutuya sırayla X ve O gelmeli.

# --hint--

Row first: `Math.floor(y / CELL) * 3`, then add the column `Math.floor(x / CELL)`.

# --hint-tr--

Önce satır: `Math.floor(y / CELL) * 3`, sonra sütunu ekle: `+ Math.floor(x / CELL)`. `x` ile `y`'yi karıştırırsan tıklama yanlış kutuya düşer.

# --tests--

Clicking a cell should play there and redraw.
tr: Bir kutuya tıklamak oraya oynamalı ve yeniden çizmeli.

```js
$.click(150, 150)
$.click(50, 250)
assert.strictEqual(board[4], 'X')
assert.strictEqual(board[6], 'O')
assert.includeMembers($.texts(), ['X', 'O'])
```

Clicks in the corners should find the corner cells.
tr: Köşelere tıklamak köşe kutularını bulmalı.

```js
$.click(290, 10)
$.click(10, 290)
$.click(290, 290)
assert.strictEqual(board[2], 'X')
assert.strictEqual(board[6], 'O')
assert.strictEqual(board[8], 'X')
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
let player = 'X'

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
  play(index)
  draw()
})

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
