---
title: "Rule one: take the center"
title_tr: "Birinci kural: ortayı al"
skills: [prog.functions]
---

# --goal--

The random computer is easy to beat. We teach it rules, the way a beginner thinks. The first one: the center is the
strongest cell, so take it when it is free.

# --goal-tr--

Rastgele oynayan bilgisayarı yenmek çok kolay. Ona bir acemi gibi düşünen **kurallar** öğreteceğiz. İlki: orta kutu
en güçlü kutudur (dört çizgide birden yer alır), **boşsa onu al**.

# --code--

```js
return cells[4] === '' ? 4 : random
```

# --meaning--

- The short question again: if cell 4 is empty, return 4, otherwise the random cell.

# --meaning-tr--

- `cells[4] === '' ? 4 : random` → kısa soru: "Orta kutu (4) boş mu? Evetse **4**, değilse rastgele kutu."
- Orta kutu dört çizgide yer alır (bir satır, bir sütun, iki çapraz); köşeler üçte, kenarlar ikide. Bu yüzden en değerli kutu.

# --task--

In `computerMove`, change `return random` as shown.

# --task-tr--

`computerMove` içindeki `return random` satırını `return cells[4] === '' ? 4 : random` yap. **Çalıştır** ve bir köşeye oyna: bilgisayar ortayı almalı.

# --tests--

The computer should take the center when it is free.
tr: Orta boşsa bilgisayar onu almalı.

```js
for (let i = 0; i < 20; i++) {
  assert.strictEqual(computerMove(['X', '', '', '', '', '', '', '', '']), 4)
}
```

Otherwise it should still pick a free cell.
tr: Değilse yine boş bir kutu seçmeli.

```js
for (let i = 0; i < 20; i++) {
  assert.include([1, 2, 3, 5, 6, 7, 8], computerMove(['X', '', '', '', 'O', '', '', '', '']))
}
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
  return cells[4] === '' ? 4 : random
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
