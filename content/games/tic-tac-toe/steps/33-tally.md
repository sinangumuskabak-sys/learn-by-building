---
title: "Build it yourself: keep score"
title_tr: "Kendin yap: skoru tut"
skills: [game.state]
---

# --goal--

Your game, your idea. Keep a running score across rounds: how many rounds X won, O won, and how many were draws, and
show it on the end screen.

# --goal-tr--

Oyun senin! Turlar boyunca **skor** tut: X kaç tur kazandı, O kaç tur kazandı, kaç tur berabere bitti. Skoru tur
sonunda ekranda göster.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir nesne, `result`, `play` ve `draw`... Kontroller çalıştığında yeşile
döner.

# --task--

Add `let tally = { X: 0, O: 0, draw: 0 }`. When a round ends, add 1 to the matching count. `reset` must not clear
it. On the end screen, also write the three numbers.

# --task-tr--

- Dosyanın üstüne skor nesnesini ekle: `let tally = { X: 0, O: 0, draw: 0 }` (tally: çetele, sayım).
- Bir tur bitince (`result` belli olunca) ilgili sayıyı **1 artır**: X kazandıysa `tally.X`, beraberlikte `tally.draw`.
- Her tur yalnız **bir kez** sayılsın; `reset` skoru sıfırlamasın.
- Tur sonu ekranında, `Click to play again` yazısının altına üç sayıyı da yaz (örneğin `X 2  O 1  Draw 3`).

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Count right after `result = outcome(board)` in `play`: `if (result) tally[result] += 1`. `result` is `'X'`, `'O'` or
`'draw'`, the same names as the keys of `tally`.

# --hint-tr--

Saymak için en iyi yer `play` içinde `result = outcome(board)` satırının hemen altı: `if (result) tally[result] += 1`.
`result` `'X'`, `'O'` ya da `'draw'` olur; `tally`'nin içindeki adlarla aynı. Köşeli parantezle `tally[result]`,
adı bir değişkende duran alanı okur. Ekrana yazmak için `'X ' + tally.X + ...` gibi yazıları `+` ile yapıştır.

# --tests--

`tally` should start at zero for everyone.
tr: `tally` herkes için sıfırdan başlamalı.

```js
assert.deepEqual(tally, { X: 0, O: 0, draw: 0 })
```

A win should be counted once, and survive a new round.
tr: Bir galibiyet bir kez sayılmalı ve yeni turda silinmemeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
play(8)
draw()
assert.deepEqual(tally, { X: 1, O: 0, draw: 0 })
reset()
assert.deepEqual(tally, { X: 1, O: 0, draw: 0 })
```

Wins for O and draws should be counted too.
tr: O'nun galibiyetleri ve beraberlikler de sayılmalı.

```js
for (const index of [0, 3, 1, 4, 8, 5]) play(index)
assert.strictEqual(result, 'O')
reset()
for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) play(index)
assert.deepEqual(tally, { X: 0, O: 1, draw: 1 })
```

The end screen should show the three counts.
tr: Tur sonu ekranı üç sayıyı göstermeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
Object.assign(tally, { X: 7, O: 3, draw: 5 })
draw()
const shown = $.texts().join(' ')
for (const n of ['7', '3', '5']) assert.include(shown, n, 'the score ' + n + ' should be on the screen')
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
let tally = { X: 0, O: 0, draw: 0 }

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
  const scores = []
  for (let index = 0; index < 9; index++) {
    if (cells[index] !== '') continue
    cells[index] = turn
    scores.push(score(cells, turn === 'O' ? 'X' : 'O'))
    cells[index] = ''
  }
  return turn === 'O' ? Math.max(...scores) : Math.min(...scores)
}

function computerMove(cells) {
  let best = -1
  let bestScore = -Infinity
  for (let index = 0; index < 9; index++) {
    if (cells[index] !== '') continue
    cells[index] = 'O'
    const value = score(cells, 'X')
    cells[index] = ''
    if (value > bestScore) {
      bestScore = value
      best = index
    }
  }
  return best
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  if (result) tally[result] += 1
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
    ctx.fillText('X ' + tally.X + '  O ' + tally.O + '  Draw ' + tally.draw, canvas.width / 2, 200)
  }
}

reset()
draw()
```
