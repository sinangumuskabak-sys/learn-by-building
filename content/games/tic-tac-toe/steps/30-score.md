---
title: Score a finished game
title_tr: Biten oyuna puan ver
skills: [prog.functions]
---

# --goal--

The rules have a hole: play a corner, then the opposite corner, and you can set a trap. Instead of more rules, the
computer will look ahead at every possible future. First it needs to score a finished game from O's point of view.

# --goal-tr--

Kurallı bilgisayarın bir açığı var: bir köşeye oyna, bilgisayar ortayı alır; sonra **karşı köşeye** oyna. Kazanacak ya
da engelleyecek bir şey olmadığı için rastgele bir kutu seçer. O kutu bir köşeyse, X aynı anda **iki çizgiyi** tehdit
eder (buna **çatal** denir) ve bilgisayar yalnız birini kapatabilir.

Her tuzak için yeni kural eklemek yerine bilgisayara **geleceğin tamamına bakmayı** öğreteceğiz. İlk parça: bitmiş bir
oyuna O'nun gözünden **puan** vermek. O kazandıysa 1, X kazandıysa −1, berabere 0.

# --code--

```js
// How good `cells` is for O if both sides play perfectly: 1 = O wins, -1 = X wins, 0 = draw.
function score(cells, turn) {
  const end = outcome(cells)
  if (end === 'O') return 1
  if (end === 'X') return -1
  if (end === 'draw') return 0
}
```

# --meaning--

- `score(cells, turn)` takes a board and whose turn it is (`turn` is used in the next step).
- For a finished game it returns 1, -1 or 0. For a game still going it returns nothing yet.

# --meaning-tr--

- `function score(cells, turn)` → iki parametre: bir tahta ve sıranın kimde olduğu (`'X'` ya da `'O'`). `turn`'ü bir
  sonraki adımda kullanacağız.
- `const end = outcome(cells)` → oyun bitti mi, kim kazandı?
- `if (end === 'O') return 1` → O kazandıysa **1** (bilgisayar için iyi).
- `if (end === 'X') return -1` → X kazandıysa **−1** (kötü). Eksi sayılar `-` ile yazılır.
- `if (end === 'draw') return 0` → berabere **0**.
- Oyun bitmediyse hiçbir `return` çalışmaz ve fonksiyon `undefined` döner. Bunu bir sonraki adımda dolduracağız.
- Üstteki yorum fonksiyonun ne işe yaradığını anlatıyor; yazmasan da olur.

# --task--

Above `function computerMove`, write the comment and `score`, with an empty line after it. Press **Run**.

# --task-tr--

1. `function computerMove(cells) {` satırının **üstüne** yorum satırını ve `score` fonksiyonunu yaz.
2. İkisinin arasında bir boş satır kalsın.
3. **Çalıştır**: oyun aynı; kontroller `score`'u bitmiş tahtalarla deneyecek.

# --tests--

`score()` should rate finished games from O's point of view.
tr: `score()` biten oyunları O'nun gözünden puanlamalı.

```js
assert.strictEqual(score(['O', 'O', 'O', 'X', 'X', '', 'X', '', ''], 'X'), 1)
assert.strictEqual(score(['X', 'X', 'X', 'O', 'O', '', '', '', ''], 'O'), -1)
assert.strictEqual(score(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'], 'X'), 0)
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

let board
let player
let result // null while playing, then 'X', 'O' or 'draw'

function reset() {
  board = ['', '', '', '', '', '', '', '', '']
  player = 'X'
  result = null
}

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

// How good `cells` is for O if both sides play perfectly: 1 = O wins, -1 = X wins, 0 = draw.
function score(cells, turn) {
  const end = outcome(cells)
  if (end === 'O') return 1
  if (end === 'X') return -1
  if (end === 'draw') return 0
}

function computerMove(cells) {
  const free = []
  cells.forEach((cell, index) => {
    if (cell === '') free.push(index)
  })
  // A free cell that would complete a line for `mark`, if there is one.
  const completes = (mark) =>
    free.find((index) => {
      const copy = [...cells]
      copy[index] = mark
      return winningLine(copy)
    })
  const random = free[Math.floor(Math.random() * free.length)]
  return completes('O') ?? completes('X') ?? (cells[4] === '' ? 4 : random)
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  return true
}

canvas.addEventListener('click', (event) => {
  if (result) {
    reset()
  } else if (player === 'X') {
    // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    const moved = play(Math.floor(y / CELL) * 3 + Math.floor(x / CELL))
    if (moved && !result) play(computerMove(board))
  }
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
    // Dim the board, then light up the winning line on top so it stands out.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const line = winningLine(board)
    if (line) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'
      for (const index of line) ctx.fillRect((index % 3) * CELL, Math.floor(index / 3) * CELL, CELL, CELL)
    }
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result === 'draw' ? "It's a draw" : result + ' wins!', canvas.width / 2, 140)
    ctx.font = '14px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 172)
  }
}

reset()
draw()
```
