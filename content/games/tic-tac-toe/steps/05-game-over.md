---
title: End of the round
title_tr: Turun sonu
skills: [game.state]
---

# --explanation--

The rules exist now, but the game ignores them: you can keep clicking after someone wins. Store the round's result as
state:

```js
let result = null   // null while playing, then 'X', 'O' or 'draw'
```

and check it right after every move: `result = outcome(board)`. Once it is set:

- `play()` refuses more moves,
- `draw()` shows who won,
- the next click starts a fresh round.

Highlighting the winning line is a small touch that makes a big difference: the player instantly sees *why* the game
ended. It is also free, because `winningLine()` already tells you which three cells to color.

Notice how little code this step needs. Each earlier step built one clear piece (the board, `play`, `outcome`), and
now they snap together. That is what good structure buys you.

# --explanation-tr--

Kurallar artık var ama oyun onları görmezden geliyor: biri kazandıktan sonra da tıklamaya devam edebiliyorsun. Turun
sonucunu durum olarak sakla:

```js
let result = null   // oyun sürerken null, sonra 'X', 'O' ya da 'draw'
```

ve her hamleden hemen sonra kontrol et: `result = outcome(board)`. Bir kez ayarlandığında:

- `play()` yeni hamleleri reddeder,
- `draw()` kimin kazandığını gösterir,
- bir sonraki tıklama yeni bir tur başlatır.

Kazanan çizgiyi vurgulamak küçük ama büyük fark yaratan bir dokunuştur: oyuncu oyunun *neden* bittiğini anında görür.
Üstelik bedava, çünkü `winningLine()` hangi üç hücreyi boyayacağını zaten söylüyor.

Bu adımın ne kadar az kod gerektirdiğine dikkat et. Önceki her adım net bir parça kurdu (tahta, `play`, `outcome`) ve
şimdi hepsi yerine oturuyor. İyi yapının kazandırdığı şey budur.

# --task--

1. Add `let result = null` and a `function reset()` that empties the board, sets `player = 'X'` and `result = null`.
   Use it to set up the first round (the `let` declarations lose their values).
2. In `play()`, also refuse moves when `result` is set. After placing a mark, set `result = outcome(board)`.
3. In the click handler: if the round is over, `reset()` instead of playing.
4. In `draw()`, when `result` is set: dim the whole board with `'rgba(0, 0, 0, 0.55)'`, then fill the winning line's
   cells (if any) with `'rgba(250, 204, 21, 0.25)'` on top, and draw `X wins!`, `O wins!` or `It's a draw` in the
   middle of the board with `Click to play again` under it.

# --task-tr--

1. `let result = null` ve tahtayı boşaltıp `player = 'X'` ve `result = null` yapan bir `function reset()` ekle. İlk
   turu onunla kur (`let` tanımları değerlerini kaybeder).
2. `play()` içinde `result` ayarlıysa da hamleleri reddet. Bir işaret koyduktan sonra `result = outcome(board)` yap.
3. Tıklama işleyicisinde: tur bittiyse oynamak yerine `reset()` çağır.
4. `draw()` içinde, `result` ayarlıysa: tahtanın tamamını `'rgba(0, 0, 0, 0.55)'` ile karart, sonra (varsa) kazanan
   çizginin hücrelerini üstüne `'rgba(250, 204, 21, 0.25)'` ile doldur ve tahtanın ortasına `X wins!`, `O wins!` ya da
   `It's a draw`, altına da `Click to play again` yaz.

# --tests--

A winning move should end the round.
tr: Kazandıran hamle turu bitirmeli.

```js
for (const index of [0, 3, 1, 4]) play(index)
assert.isNull(result)
play(2)
assert.strictEqual(result, 'X')
```

No more moves should be accepted after the round ends.
tr: Tur bittikten sonra hamle kabul edilmemeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
assert.isFalse(play(8))
assert.strictEqual(board[8], '')
```

The winner and the winning line should be shown.
tr: Kazanan ve kazanan çizgi gösterilmeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
draw()
assert.include($.texts(), 'X wins!')
const glow = $.rects('rgba(250, 204, 21, 0.25)').map((r) => [r.x, r.y, r.w, r.h])
assert.sameDeepMembers(glow, [[0, 0, 100, 100], [100, 0, 100, 100], [200, 0, 100, 100]])
```

A full board with no winner should be a draw.
tr: Kazananı olmayan dolu bir tahta beraberlik olmalı.

```js
for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) play(index)
assert.strictEqual(result, 'draw')
draw()
assert.include($.texts(), "It's a draw")
```

Clicking after the round should start a new one.
tr: Turdan sonra tıklamak yenisini başlatmalı.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
$.click(150, 150)
assert.deepEqual(board, ['', '', '', '', '', '', '', '', ''])
assert.isNull(result)
assert.strictEqual(player, 'X')
$.click(150, 150)
assert.strictEqual(board[4], 'X')
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
    play(Math.floor(y / CELL) * 3 + Math.floor(x / CELL))
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
