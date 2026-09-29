---
title: Show who won
title_tr: Kazananı göster
skills: [game.canvas, game.state]
---

# --goal--

When the round is over, `draw` dims the board with a see-through black and writes `X wins!`, `O wins!` or
`It's a draw` in the middle.

# --goal-tr--

Tur bitince oyuncu bunu **görmeli**. Tahtayı yarı saydam siyahla karartıp ortasına kocaman `X wins!` (X kazandı),
`O wins!` ya da `It's a draw` (berabere) yazacağız.

Karartma, sinemada ışıkların kısılması gibi: tahta hâlâ görünür ama dikkat yazıya gider.

# --code--

```js
  if (result) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result === 'draw' ? "It's a draw" : result + ' wins!', canvas.width / 2, 140)
  }
}
```

# --meaning--

- `if (result) { ... }` runs only when the round is over.
- `rgba(0, 0, 0, 0.55)` is black at 55% strength: the marks still show through.
- `result + ' wins!'` glues two strings together: `'X wins!'`.
- `"It's a draw"` uses double quotes because it contains a `'`.

# --meaning-tr--

- `if (result) { ... }` → yalnız tur bittiyse çalışır. `null` yanlış sayılır.
- `'rgba(0, 0, 0, 0.55)'` → **yarı saydam renk.** İlk üç sayı kırmızı, yeşil, mavi miktarı (0–255; üçü de 0 ise
  siyah), sonuncusu **saydamlık** (0 tamamen saydam, 1 tamamen dolu). %55 siyah tahtayı karartır, X ve O'lar hâlâ
  seçilir.
- İkinci `fillRect` bütün tahtayı kaplar: karartma.
- `'white'` ve `'bold 28px sans-serif'` → beyaz, kalın, 28 piksel yazı.
- `result === 'draw' ? "It's a draw" : result + ' wins!'` → kısa soru: berabereyse "It's a draw", değilse kazananın
  adı + " wins!". `+` iki yazıyı **yapıştırır**: `'X' + ' wins!'` → `'X wins!'`.
- `"It's a draw"` → çift tırnakla yazılır, çünkü içinde tek tırnak (`'`) var.
- `canvas.width / 2, 140` → yatayda tam orta (150), dikeyde 140.

# --task--

In `draw`, after the `forEach` block's `})` and before the function's last `}`, leave an empty line and write the
`if` block. Run and win a round.

# --task-tr--

1. `draw` içinde `board.forEach(...)` bloğunun kapanan `})` işaretinin altına bir boş satır bırak.
2. `if` bloğunu fonksiyonun son `}` işaretinin **üstüne** yaz.
3. **Çalıştır** ve bir turu bitir: tahta kararmalı, ortada `X wins!` ya da `O wins!` yazmalı.

# --hint--

Draw the dimming first and the text after it; whatever is drawn later covers what came before.

# --hint-tr--

Önce karartmayı, sonra yazıyı çiz: sonra çizilen öncekinin üstüne gelir. Yazı karartmanın altında kalırsa görünmez.

# --tests--

The winner should be shown.
tr: Kazanan gösterilmeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
draw()
assert.include($.texts(), 'X wins!')
assert.lengthOf($.rects('rgba(0, 0, 0, 0.55)'), 1)
```

A draw should be shown too.
tr: Beraberlik de gösterilmeli.

```js
for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) play(index)
draw()
assert.include($.texts(), "It's a draw")
```

Nothing extra should be drawn while the round goes on.
tr: Tur sürerken fazladan bir şey çizilmemeli.

```js
play(4)
draw()
assert.deepEqual($.texts(), ['X'])
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
let result = null // null while playing, then 'X', 'O' or 'draw'

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
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

  if (result) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result === 'draw' ? "It's a draw" : result + ' wins!', canvas.width / 2, 140)
  }
}

draw()
```
