---
title: "Look ahead: minimax"
title_tr: "İleriye bak: minimax"
skills: [prog.functions, prog.loops]
---

# --goal--

For a game still going, `score` tries every free cell for the player to move, scores each result **with itself**,
undoes the move, and assumes both sides play their best: O takes the highest score, X the lowest. This is **minimax**.

# --goal-tr--

Oyun bitmediyse puanı nasıl bulacağız? Satranç oyuncusu gibi düşünerek: "Buraya oynarsam o şuraya oynar, sonra ben..."

`score`, sırası gelen oyuncu için **her boş kutuyu dener**, çıkan tahtayı **yine `score` ile** puanlar ve hamleyi geri
alır. İki tarafın da en iyi oynadığını varsayar: O en **büyük** puanı, X en **küçük** puanı seçer. Bu yönteme
**minimax** denir. XOX küçük olduğu için bilgisayar bütün olasılıkları göz açıp kapayıncaya kadar tarar.

# --code--

```js
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
```

# --meaning--

- The loop tries every free cell: `continue` skips taken ones.
- `score(...)` calls itself with the other player to move: a function that calls itself is **recursive**. It stops
  at finished games (the three `return`s above), and each call fills one more cell, so it always gets there.
- `cells[index] = ''` undoes the move (backtracking), so the board is left as it was.
- `Math.max(...scores)` is the largest score, `Math.min` the smallest.

# --meaning-tr--

- `const scores = []` → her denemenin puanını toplayacağımız boş liste.
- `for (let index = 0; index < 9; index++)` → 4. adımdaki döngü: `index` 0'dan 8'e her kutu.
- `if (cells[index] !== '') continue` → `continue` "bu turu atla, döngünün sıradaki turuna geç". Dolu kutular denenmez.
- `cells[index] = turn` → hamleyi dene.
- `scores.push(score(cells, turn === 'O' ? 'X' : 'O'))` → çıkan tahtayı **sıra öbür oyuncudayken** puanla ve listeye
  ekle. `score` kendi içinde yine `score`'u çağırıyor: kendini çağıran fonksiyona **özyinelemeli** (recursive) denir.
  İç içe Rus bebekleri gibi: her bebeğin içinde biraz daha küçüğü, en sonda açılmayan küçük bir bebek.
- Özyinelemenin bir **durma noktası** olmalı: burada oyunun bitmesi (üstteki üç `return`). Her çağrıda bir kutu daha
  dolduğu için oraya mutlaka varılır.
- `cells[index] = ''` → hamleyi **geri al**. Dene, derinleş, geri al: buna **geri izleme** (backtracking) denir. Geri
  almayı unutursan tahta bozulur.
- `Math.max(...scores)` → dizideki **en büyük** sayı, `Math.min` en küçüğü. `...` (28. adımdaki üç nokta) dizinin
  elemanlarını tek tek verir. Sıra O'daysa en büyüğü, X'teyse en küçüğü seç.

# --task--

In `score`, under `if (end === 'draw') return 0`, write the new lines, above the function's closing `}`.

# --task-tr--

1. `score` içinde `if (end === 'draw') return 0` satırının **altına** yeni satırları yaz.
2. Fonksiyonun kapanan `}` işareti en altta kalsın.
3. **Çalıştır**. Oyun henüz değişmez (bilgisayar `score`'u bir sonraki adımda kullanacak); kontroller birkaç saniye sürebilir.

# --hint--

If the board is left full of marks, you forgot `cells[index] = ''` after the recursive call.

# --hint-tr--

Tahta işaretlerle dolu kalıyorsa özyinelemeli çağrıdan sonraki `cells[index] = ''` geri alma satırını unuttun.

# --tests--

`score()` should look ahead: perfect play from an empty board is a draw.
tr: `score()` ileriye bakmalı: boş tahtadan kusursuz oyun beraberliktir.

```js
assert.strictEqual(score(['', '', '', '', '', '', '', '', ''], 'X'), 0)
```

A position where X can win, or has a fork, is lost for O.
tr: X'in kazanabildiği ya da çatal kurduğu konum O için kayıptır.

```js
assert.strictEqual(score(['X', 'X', '', '', 'O', '', '', '', 'O'], 'X'), -1, 'X can win at once')
assert.strictEqual(score(['X', '', '', '', 'X', 'O', '', '', 'O'], 'X'), -1, 'X has a winning fork')
assert.strictEqual(score(['O', 'O', '', 'X', 'X', '', 'X', '', ''], 'O'), 1, 'O can win at once')
```

`score()` should leave the board as it found it.
tr: `score()` tahtayı bulduğu gibi bırakmalı.

```js
const cells = ['X', '', '', '', 'O', '', '', '', '']
score(cells, 'X')
assert.deepEqual(cells, ['X', '', '', '', 'O', '', '', '', ''])
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
