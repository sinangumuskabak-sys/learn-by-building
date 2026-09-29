---
title: "Rule two: win when you can"
title_tr: "İkinci kural: kazanabiliyorsan kazan"
skills: [prog.functions, prog.arrays]
---

# --goal--

Before anything else, the computer should win if it can. It tries O in every free cell **on a copy** of the board
and asks `winningLine` whether that completes a line.

# --goal-tr--

En önemli kural: **şimdi kazanabiliyorsan kazan.** Bilgisayar bunu nasıl bilecek? Her boş kutuya O koymayı **dener**
ve "bu çizgiyi tamamlıyor mu?" diye sorar.

Ama denemeyi gerçek tahtada yaparsa tahta bozulur. Bu yüzden tahtanın bir **kopyasında** dener: fotokopi üzerinde
karalama yapmak gibi. `winningLine`'ın tahtayı parametre olarak almasının sebebi tam da buydu.

# --code--

```js
// A free cell that would complete a line for `mark`, if there is one.
const completes = (mark) =>
  free.find((index) => {
    const copy = [...cells]
    copy[index] = mark
    return winningLine(copy)
  })
const random = free[Math.floor(Math.random() * free.length)]
return completes('O') ?? (cells[4] === '' ? 4 : random)
```

# --meaning--

- `completes(mark)` returns the first free cell that would complete a line for `mark`, or `undefined`.
- `[...cells]` makes a copy, so the real board is untouched.
- `a ?? b` means "use `a`, unless it is `null` or `undefined`, then use `b`". So: win if possible, otherwise the old
  rule.

# --meaning-tr--

- `const completes = (mark) => ...` → bir fonksiyonu bir sabitte saklıyoruz; `completes('O')` diye çağrılır. Ok
  (`=>`) işaretinden sonra süslü parantez yoksa, sağdaki şeyin sonucu doğrudan geri verilir.
- `free.find((index) => { ... })` → 18. adımdaki `find`: testi geçen **ilk** boş kutuyu ver, yoksa `undefined`.
- `const copy = [...cells]` → üç nokta (`...`) dizinin elemanlarını yeni bir dizinin içine döker: bir **kopya**.
  Kopyayı değiştirmek gerçek tahtayı bozmaz.
- `copy[index] = mark` → hamleyi kopyada dene. `return winningLine(copy)` → çizgi tamamlandı mı?
- `completes('O') ?? (...)` → `??` "soldaki **yoksa** (`null` ya da `undefined` ise) sağdakini kullan". Yani: kazanan
  kutu varsa o, yoksa eski kural (orta ya da rastgele).
- Neden `||` değil? Çünkü `0` geçerli bir kutu numarası ve `||` `0`'ı "hiçbir şey" sayar. `??` yalnız
  `null`/`undefined`'ı atlar.

# --task--

In `computerMove`, above the `random` line, write the comment and `completes`. Then change the `return` line as
shown.

# --task-tr--

1. `computerMove` içinde `const random = ...` satırının **üstüne** yorum satırını ve `completes` fonksiyonunu yaz.
2. `return` satırını `return completes('O') ?? (cells[4] === '' ? 4 : random)` yap. Parantezlere dikkat.
3. **Çalıştır**. Bilgisayara kazanma fırsatı ver: iki O yan yana gelince üçüncüyü koymalı.

# --hint--

If the board changes, you wrote `const copy = cells` without the three dots: that is the same array, not a copy.

# --hint-tr--

Tahta değişiyorsa `const copy = [...cells]` yerine üç noktasız `const copy = cells` yazmış olabilirsin: o kopya değil, aynı dizi.

# --tests--

The computer should take a winning move when it has one.
tr: Bilgisayar kazandıran bir hamlesi varsa onu yapmalı.

```js
for (let i = 0; i < 10; i++) {
  assert.strictEqual(computerMove(['X', 'X', '', 'O', 'O', '', 'X', '', '']), 5)
  assert.strictEqual(computerMove(['O', 'X', 'X', '', 'O', 'X', '', '', '']), 8)
}
```

Trying moves must not change the real board.
tr: Hamleleri denemek gerçek tahtayı değiştirmemeli.

```js
const cells = ['X', 'X', '', 'O', 'O', '', 'X', '', '']
computerMove(cells)
assert.deepEqual(cells, ['X', 'X', '', 'O', 'O', '', 'X', '', ''])
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
  return completes('O') ?? (cells[4] === '' ? 4 : random)
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
