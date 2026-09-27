---
title: A computer that follows rules
title_tr: Kurallara uyan bir bilgisayar
skills: [prog.functions, prog.arrays]
---

# --explanation--

Let the computer play O. The simplest opponent that feels smart is a **priority list** of rules, the same way a
beginner thinks:

1. If I can win right now, win.
2. If the opponent could win next move, block that cell.
3. Take the center if it is free.
4. Otherwise, pick any free cell.

Rules 1 and 2 are the same question with a different mark: "is there a free cell that would complete a line for
`mark`?" Answer it by **trying each move on a copy** of the board, which is exactly why `winningLine()` takes the
cells as a parameter:

```js
const completes = (mark) =>
  free.find((i) => {
    const copy = [...cells]   // spread: a new array, so the real board is untouched
    copy[i] = mark
    return winningLine(copy)
  })
```

`find` returns `undefined` when no cell works, and the **nullish coalescing** operator `??` means "use the right side
if the left is `null` or `undefined`". So the whole priority list reads almost like the English above:

```js
return completes('O') ?? completes('X') ?? (cells[4] === '' ? 4 : randomFreeCell)
```

(Why not `||`? Because `0` is a valid cell, and `||` treats `0` as "nothing". `??` only skips `null`/`undefined`.)

# --explanation-tr--

O'yu bilgisayar oynasın. Akıllı hissettiren en basit rakip, bir acemi nasıl düşünüyorsa öyle sıralanmış bir **öncelik
listesidir**:

1. Şimdi kazanabiliyorsam kazan.
2. Rakip bir sonraki hamlede kazanabilecekse o hücreyi kapat.
3. Orta boşsa ortayı al.
4. Değilse herhangi bir boş hücre seç.

1. ve 2. kurallar farklı işaretle aynı sorudur: "`mark` için bir çizgiyi tamamlayacak boş bir hücre var mı?" Bunu, her
hamleyi tahtanın **bir kopyası üzerinde deneyerek** cevapla; `winningLine()`'ın hücreleri parametre olarak almasının
nedeni tam da bu:

```js
const completes = (mark) =>
  free.find((i) => {
    const copy = [...cells]   // yayma: yeni bir dizi, gerçek tahtaya dokunulmaz
    copy[i] = mark
    return winningLine(copy)
  })
```

Hiçbir hücre işe yaramazsa `find` `undefined` döndürür; **nullish birleştirme** operatörü `??` ise "sol taraf `null`
ya da `undefined` ise sağ tarafı kullan" demektir. Böylece öncelik listesinin tamamı neredeyse yukarıdaki Türkçe gibi
okunur:

```js
return completes('O') ?? completes('X') ?? (cells[4] === '' ? 4 : rastgeleBoşHücre)
```

(Neden `||` değil? Çünkü `0` geçerli bir hücre ve `||` `0`'ı "hiçbir şey" sayar. `??` yalnızca `null`/`undefined`'ı
atlar.)

# --task--

1. Write `function computerMove(cells)` that returns the index O should play, following the four rules above. Build
   the list of free cells first (`free`), and pick the random cell with
   `free[Math.floor(Math.random() * free.length)]`.
2. In the click handler, only let the human play when it is X's turn; after a successful move by X that did not end
   the round, immediately `play(computerMove(board))`.

# --task-tr--

1. Yukarıdaki dört kurala uyarak O'nun oynaması gereken indeksi döndüren `function computerMove(cells)` yaz. Önce boş
   hücrelerin listesini (`free`) oluştur, rastgele hücreyi `free[Math.floor(Math.random() * free.length)]` ile seç.
2. Tıklama işleyicisinde insanın yalnızca sıra X'teyken oynamasına izin ver; X'in turu bitirmeyen başarılı bir
   hamlesinden sonra hemen `play(computerMove(board))` çağır.

# --tests--

The computer should take a winning move when it has one.
tr: Bilgisayar kazandıran bir hamlesi varsa onu yapmalı.

```js
assert.strictEqual(computerMove(['X', 'X', '', 'O', 'O', '', 'X', '', '']), 5)
assert.strictEqual(computerMove(['O', 'X', 'X', '', 'O', 'X', '', '', '']), 8)
```

Otherwise it should block the opponent's winning move.
tr: Yoksa rakibin kazandıran hamlesini engellemeli.

```js
assert.strictEqual(computerMove(['X', 'X', '', '', 'O', '', '', '', '']), 2)
assert.strictEqual(computerMove(['', '', 'X', '', 'O', 'X', '', '', '']), 8)
```

Otherwise it should take the center, or else any free cell.
tr: Yoksa ortayı, o da doluysa herhangi bir boş hücreyi almalı.

```js
assert.strictEqual(computerMove(['X', '', '', '', '', '', '', '', '']), 4)
const seen = new Set()
for (let i = 0; i < 40; i++) {
  const move = computerMove(['X', '', '', '', 'O', '', '', '', 'X'])
  assert.include([1, 2, 3, 5, 6, 7], move)
  seen.add(move)
}
assert.isAbove(seen.size, 1, 'with nothing to win or block, the choice should be random')
```

`computerMove()` should not change the board it is given.
tr: `computerMove()` kendisine verilen tahtayı değiştirmemeli.

```js
const cells = ['X', 'X', '', '', 'O', '', '', '', '']
computerMove(cells)
assert.deepEqual(cells, ['X', 'X', '', '', 'O', '', '', '', ''])
```

Clicking should play X and the computer should answer with O.
tr: Tıklama X'i oynamalı, bilgisayar da O ile cevap vermeli.

```js
$.click(50, 50)
assert.strictEqual(board[0], 'X')
assert.strictEqual(board[4], 'O')
assert.strictEqual(player, 'X')
$.click(150, 50)
assert.strictEqual(board[1], 'X')
assert.strictEqual(board[2], 'O', 'the computer blocks the top row')
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
