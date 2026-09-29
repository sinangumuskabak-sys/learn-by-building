---
title: A computer that never loses
title_tr: Hiç kaybetmeyen bir bilgisayar
skills: [prog.functions]
---

# --goal--

`computerMove` no longer needs rules. For every free cell it places O, asks `score` how that ends with perfect play,
undoes it, and keeps the best cell.

# --goal-tr--

Artık kurallara gerek yok. Yeni `computerMove` her boş kutuya O koyar, `score`'a "buradan sonra iki taraf da kusursuz
oynarsa ne olur?" diye sorar, hamleyi geri alır ve **en yüksek puanlı** kutuyu seçer.

Sonuç: hiçbir tuzağa düşmeyen bir bilgisayar. En iyi ihtimalle berabere kalırsın!

# --code--

```js
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
```

# --meaning--

- `best` is the best cell so far, `bestScore` its score. `-Infinity` is smaller than any number, so the first cell
  tried always becomes the best so far.
- For each free cell: try O, score it with X to move, undo.
- `value > bestScore` keeps the cell only if it is better than every one before.

# --meaning-tr--

- `let best = -1` → şimdiye kadarki en iyi kutu (henüz yok, −1).
- `let bestScore = -Infinity` → onun puanı. `-Infinity` "eksi sonsuz": her sayıdan küçük. Böylece ilk denenen kutu
  mutlaka "şimdiye kadarki en iyi" olur.
- Döngü `score`'daki gibi: dolu kutuyu atla, O koy, `score(cells, 'X')` ile puanla (sıra artık X'te), geri al.
- `if (value > bestScore) { ... }` → `>` büyüktür: bu kutu şimdiye kadarkilerden **daha iyiyse** onu hatırla.
- `return best` → en iyi kutunun numarası.
- Eski `free`, `completes` ve `random` gidiyor: minimax kazanmayı ve engellemeyi zaten kendisi bulur.

# --task--

Delete the whole old `computerMove` (from its first line to its closing `}`) and write the new one in its place.
The click listener stays the same.

# --task-tr--

1. Eski `computerMove` fonksiyonunun **tamamını** sil: `function computerMove(cells) {` satırından kapanan `}`
   işaretine kadar (`free`, `completes` ve `random` dahil).
2. Yerine yeni `computerMove`'u yaz. Tıklama dinleyicisi aynı kalıyor; o zaten `computerMove(board)`'u çağırıyor.
3. **Çalıştır** ve bilgisayarı yenmeye çalış: yenemezsin. Kontrollerden biri binlerce oyunu denediği için birkaç
   saniye sürebilir.

Tebrikler, XOX oyunun bitti!

# --predict--

You play a corner, the computer takes the center, you play the opposite corner. What does the new computer do?
- [ ] Takes another corner, like the rule-based one might
- [x] Takes an edge cell
  Minimax sees that any corner lets X build a fork, so every corner scores -1 and an edge scores 0.
- [ ] Picks at random

# --predict-tr--

Bir köşeye oynuyorsun, bilgisayar ortayı alıyor, sen karşı köşeye oynuyorsun. Yeni bilgisayar ne yapar?
- [ ] Kurallı sürüm gibi bir köşe daha alabilir
- [x] Bir kenar kutusu alır
  Minimax, köşe alırsa X'in çatal kuracağını görür: her köşe −1, kenar 0 puan alır.
- [ ] Rastgele seçer

# --tests--

Against opposite corners, the computer should play an edge, not a corner.
tr: Karşılıklı köşelere karşı bilgisayar köşe değil kenar oynamalı.

```js
const cells = ['X', '', '', '', 'O', '', '', '', 'X']
const move = computerMove(cells)
assert.include([1, 3, 5, 7], move)
assert.deepEqual(cells, ['X', '', '', '', 'O', '', '', '', 'X'], 'computerMove must not change the board')
```

No sequence of X moves should ever beat the computer.
tr: Hiçbir X hamle dizisi bilgisayarı yenememeli.

```js
let games = 0
function explore(cells) {
  for (let i = 0; i < 9; i++) {
    if (cells[i] !== '') continue
    const next = [...cells]
    next[i] = 'X'
    assert.notStrictEqual(outcome(next), 'X', 'X won: ' + next.join(','))
    if (outcome(next)) {
      games++
      continue
    }
    next[computerMove(next)] = 'O'
    if (outcome(next)) games++
    else explore(next)
  }
}
explore(['', '', '', '', '', '', '', '', ''])
assert.isAbove(games, 100)
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
