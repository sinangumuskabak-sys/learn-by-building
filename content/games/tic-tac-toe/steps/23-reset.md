---
title: A function for a fresh round
title_tr: Yeni tur fonksiyonu
skills: [game.state, prog.functions]
---

# --goal--

A new round means putting every piece of state back to its start. We collect that in one function, `reset`, and the
first round starts through it too.

# --goal-tr--

Yeni bir tur başlatmak, bütün durum bilgilerini (**tahta, sıra, sonuç**) başlangıç hâline döndürmek demek. Satranç
taşlarını yeniden dizmek gibi.

Bunu tek bir fonksiyonda topluyoruz: `reset`. İlk tur da aynı yoldan başlayacak. Böylece "başlangıç hâli" dosyada
**tek bir yerde** yazılı olur. Ekran aynı kalacak.

# --code--

```js
let board
let player
let result // null while playing, then 'X', 'O' or 'draw'

function reset() {
  board = ['', '', '', '', '', '', '', '', '']
  player = 'X'
  result = null
}

reset()
draw()
```

# --meaning--

- The `let` lines now only declare the names; `reset` gives them their values.
- `reset()` at the very bottom of the file sets up the first round, before the first `draw()`.

# --meaning-tr--

- `let board`, `let player`, `let result` → değişkenleri artık yalnız **tanıtıyoruz** (değer vermeden). Değerlerini
  `reset` verecek.
- `function reset() { ... }` → üç değeri başlangıç hâline döndürür: boş tahta, sıra X'te, sonuç yok.
- En alttaki `reset()` → ilk turu hazırlar. `draw()`'dan **önce** gelmeli: boş bir `board` ile çizmeye kalkarsak hata
  olur.
- Son iki satır (`reset()` ve `draw()`) dosyanın **en altında**; aradaki kod değişmiyor.

# --task--

1. Remove the values from the three `let` lines (`let board`, `let player`, `let result // ...`).
2. Under them, leave an empty line and write `reset`.
3. At the very bottom, write `reset()` above `draw()`.

# --task-tr--

1. Üstteki üç `let` satırından değerleri sil: `let board`, `let player`, `let result // ...` kalsın.
2. Altlarına bir boş satır bırak ve `reset` fonksiyonunu yaz (`function winningLine`'ın üstünde).
3. Dosyanın **en altında**, `draw()` satırının üstüne `reset()` yaz.
4. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --hint--

If the game shows an error about `forEach`, the `reset()` call at the bottom is missing or comes after `draw()`.

# --hint-tr--

`forEach` ile ilgili bir hata görüyorsan en alttaki `reset()` çağrısı eksik ya da `draw()`'ın altında kalmış.

# --tests--

`reset()` should start a fresh round.
tr: `reset()` yeni bir tur başlatmalı.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
reset()
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
assert.strictEqual(player, 'X')
assert.isNull(result)
```

The first round should start ready to play.
tr: İlk tur oynamaya hazır başlamalı.

```js
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
assert.strictEqual(player, 'X')
assert.isNull(result)
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
  }
}

reset()
draw()
```
