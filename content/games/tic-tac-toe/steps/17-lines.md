---
title: The eight winning lines
title_tr: Sekiz kazanan çizgi
skills: [prog.arrays]
---

# --goal--

Three in a row wins. There are only 8 such lines: 3 rows, 3 columns, 2 diagonals. We write them down once, as data,
instead of writing a long chain of `if`s.

# --goal-tr--

Üçü yan yana gelen kazanır. Kaç şekilde yan yana gelebilir? Sadece **8**: 3 satır, 3 sütun, 2 çapraz.

Her satır, sütun ve çapraz için uzun bir `if` zinciri yazabilirdik. Çok daha iyi bir fikir: 8 çizgiyi **veri** olarak
bir kez yazmak, sonra hepsine sırayla bakmak. Bu adımda yalnız listeyi yazıyoruz; ekran değişmeyecek.

# --code--

```js
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]
```

# --meaning--

- `LINES` is an array of arrays: 8 items, each a small array of 3 cell numbers.
- `[0, 1, 2]` is the top row; `[0, 3, 6]` the left column; `[0, 4, 8]` a diagonal.
- A list can span several lines; the `//` comments are only notes.

# --meaning-tr--

- `const LINES = [ ... ]` → bir **dizilerin dizisi**: 8 elemanı var, her eleman da 3 kutu numarası tutan küçük bir dizi.
- Kutu numaralarını hatırla: 0 sol üst, 4 orta, 8 sağ alt.
  - `[0, 1, 2]` → üst satır. `[3, 4, 5]` orta satır, `[6, 7, 8]` alt satır.
  - `[0, 3, 6]` → sol sütun. Sonraki ikisi orta ve sağ sütun.
  - `[0, 4, 8]` ve `[2, 4, 6]` → iki çapraz.
- Dizi birkaç satıra yayılabilir; köşeli parantez kapanana kadar tek bir dizidir. Sondaki `//` notları yalnız insanlar için.
- Adın hepsi büyük harf: bu, oyun boyunca hiç değişmeyecek bir **sabit** olduğunu hatırlatır (`CELL` gibi).

# --task--

Write `LINES` right under `const CELL = 100`. Press **Run**.

# --task-tr--

`LINES` dizisini `const CELL = 100` satırının hemen **altına** yaz. **Çalıştır**: ekran aynı kalmalı.

# --hint--

Each inner array has three numbers in square brackets, and the arrays are separated by commas.

# --hint-tr--

Her küçük dizi köşeli parantez içinde üç sayı; diziler birbirinden virgülle ayrılır. Sondaki `]` büyük diziyi kapatır.

# --tests--

`LINES` should list the 8 winning lines.
tr: `LINES` 8 kazanan çizgiyi listelemeli.

```js
assert.lengthOf(LINES, 8)
assert.sameDeepMembers(LINES.map((line) => [...line].sort()), [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]

let board = ['', '', '', '', '', '', '', '', '']
let player = 'X'

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
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
