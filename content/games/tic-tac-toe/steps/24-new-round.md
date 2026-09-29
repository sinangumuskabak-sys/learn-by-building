---
title: Click to play again
title_tr: Tekrar oynamak için tıkla
skills: [game.input, game.state]
---

# --goal--

When the round is over, the next click starts a new one instead of playing. We also tell the player so, under the
result.

# --goal-tr--

Tur bitince tahta kilitli kalıyor. Şimdi: tur bittiyse bir sonraki tıklama **yeni tur** başlatsın, bitmediyse eskisi
gibi hamle yapsın.

Oyuncu bunu nereden bilecek? Sonucun altına küçük bir yazı ekleyeceğiz: `Click to play again` (tekrar oynamak için
tıkla).

# --code--

```js
canvas.addEventListener('click', (event) => {
  if (result) {
    reset()
  } else {
    // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
    play(index)
  }
  draw()
})

    ctx.font = '14px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 172)
```

# --meaning--

- `if (result) { reset() } else { ... }`: after the round, a click resets; otherwise it plays as before.
- `else` means "otherwise". The old lines move inside it, two spaces further in; they do not change otherwise.
- The last two lines go into `draw`, under the result text.
- `draw()` stays outside, so both cases redraw.
- Two new lines in `draw` write the small hint under the result.

# --meaning-tr--

- `if (result) {` → tur bittiyse...
- `reset()` → ...yeni tur başlat.
- `} else {` → `else` "**değilse**" demek: tur bitmediyse eski satırlar çalışır (ölçekleme, kutu, `play`).
  Bu satırlar `else`'in içine girdiği için iki boşluk daha içeri kayar; başka hiçbir yerleri değişmez.
- `draw()` → `if/else`'in **dışında**: iki durumda da tahta yeniden çizilir.
- `ctx.font = '14px sans-serif'` ve `ctx.fillText('Click to play again', canvas.width / 2, 172)` → `draw` içinde,
  sonuç yazısının altına küçük bir ipucu. 172, 140'ın biraz altı.

# --task--

1. In the click listener, wrap the old lines (from the comment to `play(index)`) in `if (result) { reset() } else { ... }`.
2. In `draw`, under the result `fillText`, add the two `Click to play again` lines.

# --task-tr--

1. Tıklama dinleyicisinin en üstüne `if (result) {`, `reset()` ve `} else {` satırlarını yaz.
2. Eski satırları (yorumdan `play(index)`'e kadar) iki boşluk daha içeri al ve altlarına `}` yaz. `draw()` onun altında kalsın.
3. `draw` içinde sonucu yazan `ctx.fillText(result === 'draw' ? ...)` satırının **altına** iki yeni satırı yaz.
4. **Çalıştır**, bir turu bitir ve tahtaya tıkla: tahta boşalmalı.

# --predict--

You win a round and click on an empty cell. What happens with the new code?
- [ ] Your mark is placed there
- [x] The board is cleared for a new round, and nothing is placed yet
  The click goes into the `if (result)` branch: `reset()` and `draw()`, no `play`.
- [ ] Nothing, the board is locked forever

# --predict-tr--

Bir turu kazanıp boş bir kutuya tıklıyorsun. Yeni kodla ne olur?
- [ ] İşaretin oraya konur
- [x] Tahta yeni tur için boşalır, henüz bir şey konmaz
  Tıklama `if (result)` kolundan gider: `reset()` ve `draw()`, `play` yok.
- [ ] Hiçbir şey, tahta sonsuza kadar kilitli

# --hint--

Count the braces: `if (result) {` ... `} else {` ... `}`, and `draw()` comes after the last one.

# --hint-tr--

Süslü parantezleri say: `if (result) {` ... `} else {` ... `}`; `draw()` en sondakinin altında.

# --tests--

Clicking after the round should start a new one.
tr: Turdan sonra tıklamak yeni tur başlatmalı.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
$.click(150, 150)
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
assert.isNull(result)
$.click(150, 150)
assert.strictEqual(board[4], 'X')
```

The end screen should say how to play again.
tr: Bitiş ekranı nasıl tekrar oynanacağını söylemeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
draw()
assert.include($.texts(), 'Click to play again')
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
  if (result) {
    reset()
  } else {
    // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
    play(index)
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
