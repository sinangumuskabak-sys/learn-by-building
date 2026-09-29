---
title: The computer answers
title_tr: Bilgisayar cevap verir
skills: [game.input, game.state]
---

# --goal--

After your X, the computer plays O right away. Only a real move by X, in a round that is not over, gets an answer;
that is what the `true`/`false` from `play` was for.

# --goal-tr--

Sen X koyunca bilgisayar hemen O koysun. Ama yalnız iki şart birlikte doğruysa: **hamlen gerçekten olduysa** (dolu
kutuya tıklamadıysan) **ve** tur bitmediyse.

13. adımda `play`'in `true` ya da `false` cevap vermesini istemiştik; o cevabı şimdi kullanıyoruz.

# --code--

```js
} else if (player === 'X') {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const moved = play(Math.floor(y / CELL) * 3 + Math.floor(x / CELL))
  if (moved && !result) play(computerMove(board))
}
```

# --meaning--

- `else if (player === 'X')`: clicks only count when it is X's turn.
- `moved` keeps the answer of `play`: `true` if X really moved.
- `!result` means "no result yet". If both hold, the computer plays `computerMove(board)`.

# --meaning-tr--

- `} else if (player === 'X') {` → "değilse, **eğer** sıra X'teyse". Tıklamalar yalnız senin sıranda sayılır.
- `const moved = play(...)` → hamle yapılır ve `play`'in cevabı (`true`/`false`) `moved`'da tutulur. Kutu numarası
  artık ayrı bir `index` değişkenine konmadan doğrudan `play(...)`'in içinde hesaplanıyor.
- `!result` → `!` "**değil**" demek: "sonuç yok", yani tur sürüyor.
- `if (moved && !result) play(computerMove(board))` → hamlen olduysa **ve** tur sürüyorsa, bilgisayarın seçtiği
  kutuya oyna. Sıra zaten O'da olduğu için `play` O koyar ve sırayı sana geri verir.

# --task--

1. Change `} else {` to `} else if (player === 'X') {`.
2. Replace the `const index` and `play(index)` lines with the `moved` line and the computer's move.

# --task-tr--

1. Dinleyicideki `} else {` satırını `} else if (player === 'X') {` yap.
2. `const index = ...` ve `play(index)` satırlarını sil; yerine `const moved = ...` ve `if (moved && !result) ...`
   satırlarını yaz.
3. **Çalıştır** ve oyna: her X'inin ardından bir O belirmeli.

# --try--

Play a few rounds. Is the computer a good player? Try to win in three moves.

# --try-tr--

Birkaç tur oyna. Bilgisayar iyi bir oyuncu mu? Üç hamlede kazanmayı dene.

# --tests--

Clicking should play X and the computer should answer with O.
tr: Tıklama X'i oynamalı, bilgisayar da O ile cevap vermeli.

```js
$.click(50, 50)
assert.strictEqual(board[0], 'X')
assert.strictEqual(board.filter((cell) => cell === 'O').length, 1)
assert.strictEqual(player, 'X')
```

Clicking a taken cell should not let the computer play.
tr: Dolu kutuya tıklamak bilgisayara hamle yaptırmamalı.

```js
$.click(50, 50)
$.click(50, 50)
assert.strictEqual(board.filter((cell) => cell === 'O').length, 1)
```

The computer should not play after X wins.
tr: X kazandıktan sonra bilgisayar oynamamalı.

```js
board = ['X', 'X', '', 'O', 'O', '', '', '', '']
$.click(250, 50)
assert.strictEqual(result, 'X')
assert.strictEqual(board.filter((cell) => cell === 'O').length, 2)
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

function computerMove(cells) {
  const free = []
  cells.forEach((cell, index) => {
    if (cell === '') free.push(index)
  })
  const random = free[Math.floor(Math.random() * free.length)]
  return random
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
