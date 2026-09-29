---
title: "Rule three: block the opponent"
title_tr: "Üçüncü kural: rakibi engelle"
skills: [prog.functions]
---

# --goal--

If the computer cannot win, it should stop you from winning. That is the same question with X: which free cell
would complete a line for X? Take it.

# --goal-tr--

Kazanamıyorsa bilgisayar **seni durdurmalı.** Güzel haber: bu, önceki adımdaki sorunun aynısı, sadece işaret farklı.
"X için bir çizgiyi tamamlayacak boş kutu var mı?" Varsa oraya O koyup kapatır.

Bir kelime ekleyeceğiz ve bilgisayar savunma öğrenecek.

# --code--

```js
return completes('O') ?? completes('X') ?? (cells[4] === '' ? 4 : random)
```

# --meaning--

- The rules are tried in order: win, else block, else center, else random.

# --meaning-tr--

- `completes('X')` → X'in kazanacağı boş kutu: bilgisayar **oraya** oynarsa X'in yolunu keser.
- `??` zinciri soldan sağa okunur, ilk "var olan" cevap seçilir:
  1. `completes('O')` → kazanabiliyorsam kazan,
  2. `completes('X')` → yoksa rakibi engelle,
  3. `(cells[4] === '' ? 4 : random)` → yoksa orta, o da doluysa rastgele.
- Sıra önemli: kazanmak engellemekten önce gelir. Kazanan hamle oyunu zaten bitirir.

# --task--

In the `return` line, add `completes('X') ?? ` after `completes('O') ?? `.

# --task-tr--

`computerMove`'un `return` satırında `completes('O') ?? ` kısmından sonra `completes('X') ?? ` ekle. **Çalıştır** ve iki X'i yan yana koy: bilgisayar üçüncüyü kapatmalı.

# --predict--

The board is `X X _ / O O _ / X _ _`. It is O's turn. Where does the computer play?
- [ ] Cell 2, to block X's top row
- [x] Cell 5, to win
  `completes('O')` is asked first, and it finds 5.
- [ ] The center

# --predict-tr--

Tahta `X X _ / O O _ / X _ _`. Sıra O'da. Bilgisayar nereye oynar?
- [ ] 2 numaraya, X'in üst satırını kapatmak için
- [x] 5 numaraya, kazanmak için
  Önce `completes('O')` sorulur ve 5'i bulur.
- [ ] Ortaya

# --tests--

If it cannot win, the computer should block your winning move.
tr: Kazanamıyorsa bilgisayar kazandıran hamleni engellemeli.

```js
for (let i = 0; i < 10; i++) {
  assert.strictEqual(computerMove(['X', 'X', '', '', 'O', '', '', '', '']), 2)
  assert.strictEqual(computerMove(['', '', 'X', '', 'O', 'X', '', '', '']), 8)
}
```

Winning should still come before blocking.
tr: Kazanmak yine engellemekten önce gelmeli.

```js
assert.strictEqual(computerMove(['X', 'X', '', 'O', 'O', '', 'X', '', '']), 5)
```

In the game, the computer should block the top row.
tr: Oyunda bilgisayar üst satırı kapatmalı.

```js
$.click(50, 50)
assert.strictEqual(board[4], 'O')
$.click(150, 50)
assert.strictEqual(board[2], 'O')
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
